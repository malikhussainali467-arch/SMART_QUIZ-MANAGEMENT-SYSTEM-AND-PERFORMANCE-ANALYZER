import { PerformanceService } from '../services/PerformanceService.js';
import { User } from '../models/User.js';
import { asyncHandler, ensureFound } from '../utils/helpers.js';

export const myReport = asyncHandler(async (req, res) => res.json(await PerformanceService.studentReport(req.user._id)));

export const studentReport = asyncHandler(async (req, res) => {
  const student = ensureFound(await User.findOne({ _id: req.params.id, role: 'student' }), 'Student');
  res.json({ student, ...(await PerformanceService.studentReport(student._id)) });
});

export const studentsList = asyncHandler(async (req, res) => res.json(await PerformanceService.studentsSummary()));

export const classOverview = asyncHandler(async (req, res) => res.json(await PerformanceService.classReport()));

export const quizReport = asyncHandler(async (req, res) =>
  res.json(ensureFound(await PerformanceService.quizReport(req.params.id), 'Quiz'))
);

export const leaderboard = asyncHandler(async (req, res) => res.json(await PerformanceService.leaderboard()));
