// The life of an attempt: start -> (answer in the browser) -> submit -> graded.
import { Attempt } from '../models/Attempt.js';
import { Quiz } from '../models/Quiz.js';
import { Question } from '../models/Question.js';
import { GradingService } from './GradingService.js';
import { QuizBuilderService } from './QuizBuilderService.js';
import { HttpError } from '../utils/helpers.js';

export class AttemptService {
  /** Grades and closes an attempt. `submitted` = [{question, selected}]. */
  static async finalize(attempt, submitted = []) {
    const questions = await Question.find({ _id: { $in: attempt.items.map((i) => i.question) } });
    GradingService.gradeAttempt(attempt, new Map(questions.map((q) => [String(q._id), q])), submitted);

    const now = new Date();
    attempt.status = 'submitted';
    attempt.submittedAt = now;
    attempt.timedOut = false;
    return attempt.save();
  }

  /** Starts a teacher's quiz, or resumes the unfinished attempt if there is one. */
  static async startQuiz(user, quizId) {
    const quiz = await Quiz.findById(quizId);
    if (!quiz || !quiz.isPublished) throw new HttpError(404, 'Quiz not available');

    const unfinished = await Attempt.findOne({ user: user._id, quiz: quiz._id, status: 'in_progress' });
    if (unfinished) {
      return unfinished;
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
      expiresAt: null,
    });
  }
}
