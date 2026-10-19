// Marks answers. All scoring rules live here, so changing them is a one-file job.
import { round } from '../utils/helpers.js';

// A theory answer counts as "correct" when it earns at least this share of its marks.
export const CORRECT_THRESHOLD = 0.6;

export class GradingService {
  /** MCQ: full marks for the right option, otherwise zero. */
  static gradeMcq(question, selected) {
    const hit = selected !== null && selected !== undefined && Number(selected) === question.correctIndex;
    return { marks: hit ? question.marks : 0, isCorrect: hit };
  }

  /**
   * Theory: marks = share of the teacher's keywords found in the answer
   * (rounded to the nearest half mark). A teacher can override on the Reviews page.
   */
  static gradeTheory(question, text) {
    const answer = String(text || '').toLowerCase();
    const keywords = question.keywords || [];
    if (!answer.trim() || keywords.length === 0) return { marks: 0, isCorrect: false };

    const matched = keywords.filter((keyword) => answer.includes(keyword)).length;
    const ratio = matched / keywords.length;
    return {
      marks: Math.round(ratio * question.marks * 2) / 2,
      isCorrect: ratio >= CORRECT_THRESHOLD,
    };
  }

  /** Grades one submitted answer and returns the object stored on the attempt. */
  static gradeAnswer(question, submitted = {}) {
    const isTheory = question.type === 'theory';
    const text = isTheory ? String(submitted.text || '').slice(0, 3000) : '';
    const selected = !isTheory && submitted.selected !== undefined ? submitted.selected : null;
    const result = isTheory ? this.gradeTheory(question, text) : this.gradeMcq(question, selected);

    return {
      question: question._id,
      topic: question.topic,
      difficulty: question.difficulty,
      type: question.type,
      selected,
      text,
      marks: result.marks,
      maxMarks: question.marks,
      isCorrect: result.isCorrect,
      reviewed: !isTheory || !text.trim(), // blank theory answers need no teacher check
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

  /** Recalculates score, percentage and the "needs teacher review" flag. */
  static updateTotals(attempt) {
    attempt.score = round(attempt.answers.reduce((sum, a) => sum + a.marks, 0), 2);
    attempt.totalMarks = round(attempt.answers.reduce((sum, a) => sum + a.maxMarks, 0), 2);
    attempt.percentage = attempt.totalMarks ? round((attempt.score / attempt.totalMarks) * 100) : 0;
    attempt.pendingReview = attempt.answers.some((a) => !a.reviewed);
  }

  /** Teacher override: set marks for one answer (0 .. maxMarks). */
  static applyReview(answer, marks) {
    const clean = Math.min(Math.max(Number(marks) || 0, 0), answer.maxMarks);
    answer.marks = clean;
    answer.isCorrect = answer.maxMarks ? clean / answer.maxMarks >= CORRECT_THRESHOLD : false;
    answer.reviewed = true;
  }
}
