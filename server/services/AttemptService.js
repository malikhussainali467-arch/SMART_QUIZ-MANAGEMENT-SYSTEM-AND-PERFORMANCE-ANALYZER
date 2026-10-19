// The life of an attempt: start -> (answer in the browser) -> submit -> graded.
import { Attempt } from '../models/Attempt.js';
import { Quiz } from '../models/Quiz.js';
import { Question } from '../models/Question.js';
import { Topic } from '../models/Topic.js';
import { GradingService } from './GradingService.js';
import { QuizBuilderService } from './QuizBuilderService.js';
import { HttpError } from '../utils/helpers.js';

const GRACE_SECONDS = 30; // network delay allowance when a timed quiz is submitted

export class AttemptService {
  /** Grades and closes an attempt. `submitted` = [{question, selected, text}]. */
  static async finalize(attempt, submitted = []) {
    const questions = await Question.find({ _id: { $in: attempt.items.map((i) => i.question) } });
    GradingService.gradeAttempt(attempt, new Map(questions.map((q) => [String(q._id), q])), submitted);

    const now = new Date();
    attempt.status = 'submitted';
    attempt.submittedAt = now;
    attempt.timedOut = Boolean(attempt.expiresAt && now > new Date(attempt.expiresAt.getTime() + GRACE_SECONDS * 1000));
    return attempt.save();
  }

  /** If a timed attempt ran out while the student was away, close it with whatever was saved (nothing). */
  static async closeIfExpired(attempt) {
    if (attempt.status === 'in_progress' && attempt.expiresAt && new Date() > attempt.expiresAt) {
      return this.finalize(attempt, []);
    }
    return attempt;
  }

  /** Starts a teacher's quiz, or resumes the unfinished attempt if there is one. */
  static async startQuiz(user, quizId) {
    const quiz = await Quiz.findById(quizId);
    if (!quiz || !quiz.isPublished) throw new HttpError(404, 'Quiz not available');

    const unfinished = await Attempt.findOne({ user: user._id, quiz: quiz._id, status: 'in_progress' });
    if (unfinished) {
      const checked = await this.closeIfExpired(unfinished);
      if (checked.status === 'in_progress') return checked; // resume
    }

    if (quiz.maxAttempts > 0) {
      const used = await Attempt.countDocuments({ user: user._id, quiz: quiz._id, status: 'submitted' });
      if (used >= quiz.maxAttempts) throw new HttpError(403, `You have used all ${quiz.maxAttempts} attempt(s) for this quiz`);
    }

    const items = await QuizBuilderService.fromQuiz(quiz);
    if (!items.length) throw new HttpError(400, 'This quiz has no questions yet');

    return Attempt.create({
      user: user._id,
      kind: 'quiz',
      quiz: quiz._id,
      title: quiz.title,
      passPercent: quiz.passPercent,
      items,
      expiresAt: quiz.durationMinutes > 0 ? new Date(Date.now() + quiz.durationMinutes * 60000) : null,
    });
  }

  /** Personal practice (untimed) built from the student's weak/unseen questions. */
  static async startPractice(user, { topicIds = [], subjectId = null, count = 10 }) {
    const items = await QuizBuilderService.practice({
      userId: user._id,
      topicIds,
      subjectId,
      count: Math.min(Math.max(Number(count) || 10, 3), 30),
    });
    if (!items.length) throw new HttpError(400, 'No questions available for this practice yet');

    const topics = topicIds.length ? await Topic.find({ _id: { $in: topicIds } }) : [];
    const title = topics.length ? `Practice: ${topics.map((t) => t.name).join(', ')}` : 'Mixed practice';
    return Attempt.create({ user: user._id, kind: 'practice', title: title.slice(0, 90), passPercent: 60, items });
  }
}
