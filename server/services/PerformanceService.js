// All "smart" analytics: topic mastery, weak topics, recommendations, leaderboard, class reports.
// Everything is computed in plain JavaScript from the Attempt collection, so the rules are easy to read.
import { Attempt } from '../models/Attempt.js';
import { Topic } from '../models/Topic.js';
import { Question } from '../models/Question.js';
import { Quiz } from '../models/Quiz.js';
import { User } from '../models/User.js';
import { DAY_MS, round } from '../utils/helpers.js';

// ---- Tuning knobs (change these to change how "smart" the system behaves) ----
const HALF_LIFE_DAYS = 14; // an answer from 14 days ago counts half as much as one from today
const MIN_ANSWERS = 4; // fewer answers than this = "not enough data"
const WEAK_BELOW = 60; // mastery % under this = weak topic
const STRONG_FROM = 80; // mastery % from this = strong topic
const AT_RISK_BELOW = 55; // class average % under this = flagged on the teacher dashboard
const DIFFICULTY_WEIGHT = { easy: 0.8, medium: 1, hard: 1.25 }; // hard questions say more about mastery

const ratioOf = (answer) => (answer.maxMarks ? answer.marks / answer.maxMarks : 0);
const average = (values) => (values.length ? values.reduce((a, b) => a + b, 0) / values.length : 0);

export class PerformanceService {
  // ------------------------------------------------------------------ building blocks

  /** Map(topicId -> {id, name, subjectId, subjectName, color}) used to label results. */
  static async topicLookup() {
    const topics = await Topic.find().populate('subject');
    return new Map(
      topics
        .filter((t) => t.subject)
        .map((t) => [
          String(t._id),
          { id: String(t._id), name: t.name, subjectId: String(t.subject._id), subjectName: t.subject.name, color: t.subject.color },
        ])
    );
  }

  /** Flattens attempts into one row per answered question. */
  static toRows(attempts) {
    return attempts.flatMap((attempt) =>
      attempt.answers.map((a) => ({
        topic: String(a.topic),
        ratio: ratioOf(a),
        difficulty: a.difficulty,
        date: attempt.submittedAt,
      }))
    );
  }

  static classify(mastery, answered) {
    if (answered < MIN_ANSWERS) return 'unknown';
    if (mastery < WEAK_BELOW) return 'weak';
    return mastery >= STRONG_FROM ? 'strong' : 'average';
  }

  /** Newer half of the answers vs older half: 'improving' | 'declining' | 'steady' | null. */
  static trendOf(rows) {
    if (rows.length < 6) return null;
    const sorted = [...rows].sort((a, b) => a.date - b.date);
    const half = Math.floor(sorted.length / 2);
    const change = average(sorted.slice(half).map((r) => r.ratio)) - average(sorted.slice(0, half).map((r) => r.ratio));
    if (change > 0.1) return 'improving';
    return change < -0.1 ? 'declining' : 'steady';
  }

  /**
   * Mastery per topic = weighted accuracy, where recent and harder answers weigh more.
   * Returns an array sorted from weakest to strongest.
   */
  static summarizeTopics(rows, lookup) {
    const now = Date.now();
    const grouped = new Map();
    rows.forEach((row) => {
      if (!lookup.has(row.topic)) return; // topic was deleted
      if (!grouped.has(row.topic)) grouped.set(row.topic, []);
      grouped.get(row.topic).push(row);
    });

    const summaries = [...grouped.entries()].map(([topicId, topicRows]) => {
      let weighted = 0;
      let weights = 0;
      topicRows.forEach((row) => {
        const age = (now - row.date) / DAY_MS;
        const weight = Math.pow(0.5, age / HALF_LIFE_DAYS) * (DIFFICULTY_WEIGHT[row.difficulty] || 1);
        weighted += weight * row.ratio;
        weights += weight;
      });
      const mastery = round((weighted / weights) * 100);
      return {
        ...lookup.get(topicId),
        answered: topicRows.length,
        accuracy: round(average(topicRows.map((r) => r.ratio)) * 100),
        mastery,
        status: this.classify(mastery, topicRows.length),
        trend: this.trendOf(topicRows),
      };
    });
    return summaries.sort((a, b) => a.mastery - b.mastery);
  }

  /** Consecutive days (ending today or yesterday) with at least one finished attempt. */
  static streakOf(dates) {
    const days = new Set(dates.map((d) => new Date(d).toDateString()));
    const cursor = new Date();
    if (!days.has(cursor.toDateString())) cursor.setDate(cursor.getDate() - 1); // today not done yet: still alive
    let streak = 0;
    while (days.has(cursor.toDateString())) {
      streak += 1;
      cursor.setDate(cursor.getDate() - 1);
    }
    return streak;
  }

  static badgesFor({ attempts, streak, strongTopics }) {
    const perfect = attempts.some((a) => a.totalMarks > 0 && a.percentage === 100);
    return [
      { id: 'first', title: 'First steps', description: 'Finish your first quiz', earned: attempts.length >= 1 },
      { id: 'regular', title: 'Regular', description: 'Finish 5 quizzes', earned: attempts.length >= 5 },
      { id: 'perfect', title: 'Perfect score', description: 'Score 100% in a quiz', earned: perfect },
      { id: 'streak', title: 'On a roll', description: 'Study 3 days in a row', earned: streak >= 3 },
      { id: 'master', title: 'Topic master', description: `Reach ${STRONG_FROM}% mastery in a topic`, earned: strongTopics >= 1 },
    ];
  }

  // ------------------------------------------------------------------ recommendations

  /** For the weakest topics: what to practise, at what level, and which quizzes cover them. */
  static async recommend(topics) {
    const weak = topics.filter((t) => t.status === 'weak').slice(0, 3); // already weakest-first
    if (!weak.length) return [];

    const weakIds = weak.map((t) => t.id);
    const questions = await Question.find({ topic: { $in: weakIds } }).select('topic');
    const quizzes = await Quiz.find({ isPublished: true }).populate('questions', 'topic');

    return weak.map((topic) => ({
      topicId: topic.id,
      topic: topic.name,
      subject: topic.subjectName,
      mastery: topic.mastery,
      level: topic.mastery < 40 ? 'Start with easy and medium questions' : 'Practise medium and hard questions',
      message:
        topic.mastery < 40
          ? `Revisit the basics of ${topic.name} before attempting more quizzes.`
          : `You are close in ${topic.name}. A few focused questions should lift it above ${WEAK_BELOW}%.`,
      questionsAvailable: questions.filter((q) => String(q.topic) === topic.id).length,
      quizzes: quizzes
        .filter((quiz) => quiz.questions.some((q) => String(q.topic) === topic.id))
        .slice(0, 2)
        .map((quiz) => ({ id: quiz._id, title: quiz.title })),
    }));
  }

  // ------------------------------------------------------------------ student report

  static async studentReport(userId) {
    const attempts = await Attempt.find({ user: userId, status: 'submitted' }).sort({ submittedAt: 1 });
    const lookup = await this.topicLookup();
    const topics = this.summarizeTopics(this.toRows(attempts), lookup);

    const bySubject = new Map();
    topics.forEach((t) => {
      const entry = bySubject.get(t.subjectId) || { subjectId: t.subjectId, name: t.subjectName, color: t.color, answered: 0, points: 0 };
      entry.answered += t.answered;
      entry.points += t.accuracy * t.answered;
      bySubject.set(t.subjectId, entry);
    });

    const quizAttempts = attempts.filter((a) => a.kind === 'quiz');
    const streak = this.streakOf(attempts.map((a) => a.submittedAt));
    const strongTopics = topics.filter((t) => t.status === 'strong');

    return {
      overall: {
        attempts: attempts.length,
        quizAttempts: quizAttempts.length,
        practiceAttempts: attempts.length - quizAttempts.length,
        averagePercentage: round(average(attempts.map((a) => a.percentage))),
        bestPercentage: attempts.length ? Math.max(...attempts.map((a) => a.percentage)) : 0,
        questionsAnswered: attempts.reduce((sum, a) => sum + a.answers.length, 0),
        streak,
      },
      subjects: [...bySubject.values()].map((s) => ({ ...s, accuracy: round(s.points / s.answered) })),
      topics,
      weakTopics: topics.filter((t) => t.status === 'weak'),
      strongTopics,
      series: attempts.slice(-12).map((a) => ({ date: a.submittedAt, title: a.title, percentage: a.percentage, kind: a.kind })),
      recommendations: await this.recommend(topics),
      badges: this.badgesFor({ attempts, streak, strongTopics: strongTopics.length }),
    };
  }

  // ------------------------------------------------------------------ teacher reports

  /** One line per student for the teacher's "Students" page. */
  static async studentsSummary() {
    const students = await User.find({ role: 'student' }).sort({ name: 1 });
    const attempts = await Attempt.find({ status: 'submitted' });
    const lookup = await this.topicLookup();

    return students.map((student) => {
      const own = attempts.filter((a) => String(a.user) === String(student._id));
      const topics = this.summarizeTopics(this.toRows(own), lookup);
      const quizOnly = own.filter((a) => a.kind === 'quiz');
      const weak = topics.filter((t) => t.status === 'weak');
      return {
        id: student._id,
        name: student.name,
        email: student.email,
        attempts: own.length,
        averagePercentage: quizOnly.length ? round(average(quizOnly.map((a) => a.percentage))) : null,
        lastActive: own.length ? own[own.length - 1].submittedAt : null,
        weakTopics: weak.length,
        weakestTopic: weak[0]?.name || null,
      };
    });
  }

  static async classReport() {
    const [students, quizzes, questions, attempts, lookup] = await Promise.all([
      User.countDocuments({ role: 'student' }),
      Quiz.countDocuments(),
      Question.countDocuments(),
      Attempt.find({ status: 'submitted' }).sort({ submittedAt: -1 }).populate('user', 'name'),
      this.topicLookup(),
    ]);

    const quizAttempts = attempts.filter((a) => a.kind === 'quiz');
    const topics = this.summarizeTopics(this.toRows(attempts), lookup);

    const activity = Array.from({ length: 7 }, (_, i) => {
      const day = new Date();
      day.setDate(day.getDate() - (6 - i));
      const label = day.toDateString();
      return { label: day.toLocaleDateString('en', { weekday: 'short' }), count: attempts.filter((a) => a.submittedAt.toDateString() === label).length };
    });

    const summary = await this.studentsSummary();
    const atRisk = summary
      .filter((s) => s.averagePercentage !== null && s.averagePercentage < AT_RISK_BELOW)
      .sort((a, b) => (a.averagePercentage ?? 0) - (b.averagePercentage ?? 0))
      .slice(0, 5);

    return {
      totals: {
        students,
        quizzes,
        questions,
        attempts: attempts.length,
        averagePercentage: round(average(quizAttempts.map((a) => a.percentage))),
        pendingReviews: attempts.filter((a) => a.pendingReview).length,
      },
      topics,
      weakTopics: topics.filter((t) => t.status === 'weak').slice(0, 5),
      activity,
      atRisk,
      recent: attempts.slice(0, 6).map((a) => ({
        id: a._id,
        student: a.user?.name || 'Deleted user',
        title: a.title,
        percentage: a.percentage,
        submittedAt: a.submittedAt,
      })),
    };
  }

  static async quizReport(quizId) {
    const quiz = await Quiz.findById(quizId).populate('questions', 'text type difficulty');
    if (!quiz) return null;
    const attempts = await Attempt.find({ quiz: quizId, status: 'submitted' }).sort({ submittedAt: -1 }).populate('user', 'name email');
    const percentages = attempts.map((a) => a.percentage);

    const distribution = [0, 20, 40, 60, 80].map((from) => ({
      label: `${from}-${from === 80 ? 100 : from + 19}%`,
      count: percentages.filter((p) => (from === 80 ? p >= 80 : p >= from && p < from + 20)).length,
    }));

    const questions = quiz.questions.map((question) => {
      const answers = attempts.flatMap((a) => a.answers.filter((x) => String(x.question) === String(question._id)));
      const correctRate = answers.length ? round(average(answers.map(ratioOf)) * 100) : null;
      return {
        id: question._id,
        text: question.text,
        type: question.type,
        difficulty: question.difficulty,
        answered: answers.length,
        correctRate,
        flag: correctRate === null ? null : correctRate < 40 ? 'hard' : correctRate > 85 ? 'easy' : null,
      };
    });

    return {
      quiz: { id: quiz._id, title: quiz.title, passPercent: quiz.passPercent },
      stats: {
        attempts: attempts.length,
        average: round(average(percentages)),
        highest: percentages.length ? Math.max(...percentages) : 0,
        lowest: percentages.length ? Math.min(...percentages) : 0,
        passRate: attempts.length ? round((percentages.filter((p) => p >= quiz.passPercent).length / attempts.length) * 100) : 0,
      },
      distribution,
      questions,
      attempts: attempts.map((a) => ({
        id: a._id,
        student: a.user?.name || 'Deleted user',
        percentage: a.percentage,
        score: a.score,
        totalMarks: a.totalMarks,
        submittedAt: a.submittedAt,
        pendingReview: a.pendingReview,
      })),
    };
  }

  // ------------------------------------------------------------------ leaderboard

  /** Points = sum of each student's BEST percentage per quiz (retakes can only improve it). */
  static async leaderboard() {
    const attempts = await Attempt.find({ status: 'submitted' }).populate('user', 'name role');
    const students = new Map();

    attempts.forEach((attempt) => {
      if (!attempt.user || attempt.user.role !== 'student') return;
      const id = String(attempt.user._id);
      if (!students.has(id)) students.set(id, { id, name: attempt.user.name, best: new Map(), dates: [] });
      const entry = students.get(id);
      entry.dates.push(attempt.submittedAt);
      if (attempt.kind === 'quiz') {
        const key = String(attempt.quiz);
        entry.best.set(key, Math.max(entry.best.get(key) || 0, attempt.percentage));
      }
    });

    return [...students.values()]
      .map((s) => {
        const scores = [...s.best.values()];
        return {
          id: s.id,
          name: s.name,
          quizzes: scores.length,
          points: round(scores.reduce((a, b) => a + b, 0)),
          average: round(average(scores)),
          streak: this.streakOf(s.dates),
        };
      })
      .filter((s) => s.quizzes > 0)
      .sort((a, b) => b.points - a.points || b.average - a.average)
      .map((s, index) => ({ ...s, rank: index + 1 }));
  }
}
