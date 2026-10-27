// Basic quiz analytics for teachers.
import { PerformanceService } from '../services/PerformanceService.js';
import { asyncHandler, ensureFound } from '../utils/helpers.js';

export const quizReport = asyncHandler(async (req, res) =>
  res.json(ensureFound(await PerformanceService.quizReport(req.params.id), 'Quiz'))
);
