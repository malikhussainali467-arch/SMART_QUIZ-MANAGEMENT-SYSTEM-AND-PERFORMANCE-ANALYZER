// Marks MCQ answers automatically.
import { round } from '../utils/helpers.js';

export class GradingService {
  /** MCQ: full marks for the right option, otherwise zero. */
  static gradeMcq(question, selected) {
    const hit = selected !== null && selected !== undefined && Number(selected) === question.correctIndex;
    return { marks: hit ? question.marks : 0, isCorrect: hit };
  }

  /** Grades one submitted MCQ answer and returns the object stored on the attempt. */
  static gradeAnswer(question, submitted = {}) {
    const selected = submitted.selected !== undefined ? submitted.selected : null;
    const result = this.gradeMcq(question, selected);

    return {
      question: question._id,
      topic: question.topic,
      difficulty: question.difficulty,
      type: 'mcq',
      selected,
      marks: result.marks,
      maxMarks: question.marks,
      isCorrect: result.isCorrect,
    };
  }

  /** Grades every question of the attempt (unanswered ones score 0) and fills the totals. */
  static gradeAttempt(attempt, questionsById, submittedAnswers = []) {
    const submittedById = new Map(submittedAnswers.map((a) => [String(a.question), a]));
    attempt.answers = attempt.items
      .map((item) => questionsById.get(String(item.question)))
      .filter(Boolean)
      .map((question) => this.gradeAnswer(question, submittedById.get(String(question._id))));
    this.updateTotals(attempt);
  }

  /** Recalculates score and percentage. */
  static updateTotals(attempt) {
    attempt.score = round(attempt.answers.reduce((sum, a) => sum + a.marks, 0), 2);
    attempt.totalMarks = round(attempt.answers.reduce((sum, a) => sum + a.maxMarks, 0), 2);
    attempt.percentage = attempt.totalMarks ? round((attempt.score / attempt.totalMarks) * 100) : 0;
  }
}
