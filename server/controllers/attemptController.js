// Taking quizzes and history.
import { Attempt } from '../models/Attempt.js';
import { AttemptService } from '../services/AttemptService.js';
import { presentAttempt } from '../presenters/attemptPresenter.js';
import { HttpError, asyncHandler, ensureFound, requireFields } from '../utils/helpers.js';

/** Loads an attempt and checks that this person may look at it. */
async function loadAttemptFor(user, id) {
  const attempt = ensureFound(await Attempt.findById(id).populate('user', 'name'), 'Attempt');
  const isOwner = String(attempt.user._id) === String(user._id);
  const isTeacher = user.role === 'teacher';
  if (!isOwner && !(isTeacher && attempt.status === 'submitted')) throw new HttpError(403, 'This attempt is not yours');
  return { attempt, isOwner };
}

export const startQuiz = asyncHandler(async (req, res) => {
  requireFields(req.body, ['quizId']);
  const attempt = await AttemptService.startQuiz(req.user, req.body.quizId);
  res.status(201).json({ attemptId: attempt._id });
});

export const getAttempt = asyncHandler(async (req, res) => {
  const { attempt } = await loadAttemptFor(req.user, req.params.id);
  res.json(await presentAttempt(attempt, { reveal: attempt.status === 'submitted' }));
});

export const submitAttempt = asyncHandler(async (req, res) => {
  const { attempt } = await loadAttemptFor(req.user, req.params.id);
  if (String(attempt.user._id) !== String(req.user._id)) throw new HttpError(403, 'This attempt is not yours');

  if (attempt.status === 'in_progress') {
    await AttemptService.finalize(attempt, Array.isArray(req.body.answers) ? req.body.answers : []);
  }
  res.json({ attemptId: attempt._id });
});

export const myAttempts = asyncHandler(async (req, res) => {
  const attempts = await Attempt.find({ user: req.user._id, status: 'submitted' }).sort({ submittedAt: -1 });
  res.json(
    attempts.map((a) => ({
      id: a._id,
      title: a.title,
      kind: a.kind,
      score: a.score,
      totalMarks: a.totalMarks,
      percentage: a.percentage,
      passPercent: a.passPercent,
      submittedAt: a.submittedAt,
      timedOut: false,
      pendingReview: false,
    }))
  );
});
