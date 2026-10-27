// Builds the question set for a quiz (in saved order, untimed).
import { Question } from '../models/Question.js';

export class QuizBuilderService {
  /** One attempt entry for a question. */
  static toItem(question) {
    const order = question.options.map((_, index) => index);
    return { question: question._id, optionOrder: order };
  }

  /** Fixed question set for a teacher-made quiz (preserves teacher's order). */
  static async fromQuiz(quiz) {
    const found = await Question.find({ _id: { $in: quiz.questions } });
    const byId = new Map(found.map((q) => [String(q._id), q]));
    const pool = quiz.questions.map((id) => byId.get(String(id))).filter(Boolean);
    return pool.map((q) => this.toItem(q));
  }
}
