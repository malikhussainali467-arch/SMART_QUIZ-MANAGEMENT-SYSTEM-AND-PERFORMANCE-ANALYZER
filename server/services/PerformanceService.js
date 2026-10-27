// Basic quiz report service for teacher view of quiz results.
import { Attempt } from '../models/Attempt.js';
import { Quiz } from '../models/Quiz.js';
import { round } from '../utils/helpers.js';

const average = (values) => (values.length ? values.reduce((a, b) => a + b, 0) / values.length : 0);

export class PerformanceService {
  /** Basic report for a single quiz: summary stats and list of attempts. */
  static async quizReport(quizId) {
    const quiz = await Quiz.findById(quizId);
    if (!quiz) return null;
    const attempts = await Attempt.find({ quiz: quizId, status: 'submitted' }).sort({ submittedAt: -1 }).populate('user', 'name email');
    const percentages = attempts.map((a) => a.percentage);

    return {
      quiz: { id: quiz._id, title: quiz.title, passPercent: quiz.passPercent },
      stats: {
        attempts: attempts.length,
        average: round(average(percentages)),
        highest: percentages.length ? Math.max(...percentages) : 0,
        lowest: percentages.length ? Math.min(...percentages) : 0,
        passRate: attempts.length ? round((percentages.filter((p) => p >= quiz.passPercent).length / attempts.length) * 100) : 0,
      },
      attempts: attempts.map((a) => ({
        id: a._id,
        student: a.user?.name || 'Deleted user',
        percentage: a.percentage,
        score: a.score,
        totalMarks: a.totalMarks,
        submittedAt: a.submittedAt,
      })),
    };
  }
}
