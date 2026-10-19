// Decides WHICH questions a student gets: for a teacher's quiz or for personal practice.
import { Question } from '../models/Question.js';
import { Attempt } from '../models/Attempt.js';
import { shuffle } from '../utils/helpers.js';
import { CORRECT_THRESHOLD } from './GradingService.js';

export class QuizBuilderService {
  /** One attempt entry for a question, with its options optionally shuffled. */
  static toItem(question, shuffleOptions) {
    const order = question.options.map((_, index) => index);
    return { question: question._id, optionOrder: shuffleOptions ? shuffle(order) : order };
  }

  /** Random/fixed question set for a teacher-made quiz. */
  static async fromQuiz(quiz) {
    const found = await Question.find({ _id: { $in: quiz.questions } });
    const byId = new Map(found.map((q) => [String(q._id), q]));
    let pool = quiz.questions.map((id) => byId.get(String(id))).filter(Boolean); // keeps teacher's order

    if (quiz.questionCount > 0 && quiz.questionCount < pool.length) {
      pool = shuffle(pool).slice(0, quiz.questionCount); // "random quiz": draw N from the pool
    }
    if (quiz.shuffleQuestions) pool = shuffle(pool);
    return pool.map((q) => this.toItem(q, quiz.shuffleOptions));
  }

  /** Last result per question for this student: Map(questionId -> ratio 0..1). */
  static async lastResults(userId) {
    const attempts = await Attempt.find({ user: userId, status: 'submitted' }).sort({ submittedAt: 1 });
    const last = new Map();
    attempts.forEach((attempt) =>
      attempt.answers.forEach((a) => last.set(String(a.question), a.maxMarks ? a.marks / a.maxMarks : 0))
    );
    return last;
  }

  /**
   * Smart practice set. Priority:
   *   1. questions the student got wrong last time,
   *   2. questions never seen before,
   *   3. questions already answered correctly (revision).
   */
  static async practice({ userId, topicIds = [], subjectId = null, count = 10 }) {
    const filter = topicIds.length ? { topic: { $in: topicIds } } : subjectId ? { subject: subjectId } : {};
    const candidates = await Question.find(filter);
    const last = await this.lastResults(userId);

    const wrong = [];
    const unseen = [];
    const known = [];
    candidates.forEach((q) => {
      const result = last.get(String(q._id));
      if (result === undefined) unseen.push(q);
      else if (result < CORRECT_THRESHOLD) wrong.push(q);
      else known.push(q);
    });

    const picked = [...shuffle(wrong), ...shuffle(unseen), ...shuffle(known)].slice(0, count);
    return shuffle(picked).map((q) => this.toItem(q, true));
  }
}
