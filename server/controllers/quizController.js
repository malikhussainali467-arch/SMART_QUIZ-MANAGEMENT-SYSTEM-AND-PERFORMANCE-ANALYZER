// Quizzes: teachers manage them, students browse the published ones.
import { Quiz } from '../models/Quiz.js';
import { Attempt } from '../models/Attempt.js';
import { HttpError, asyncHandler, ensureFound, pick, requireFields } from '../utils/helpers.js';

const EDITABLE = [
  'title', 'description', 'subject', 'questions', 'passPercent', 'isPublished',
];

export const listQuizzes = asyncHandler(async (req, res) => {
  const isTeacher = req.user.role === 'teacher';
  const quizzes = await Quiz.find(isTeacher ? {} : { isPublished: true }).sort({ createdAt: -1 }).populate('subject', 'name color');
  const attempts = await Attempt.find(isTeacher ? { quiz: { $in: quizzes.map((q) => q._id) }, status: 'submitted' } : { user: req.user._id, quiz: { $in: quizzes.map((q) => q._id) } });

  res.json(
    quizzes.map((quiz) => {
      const own = attempts.filter((a) => String(a.quiz) === String(quiz._id));
      const qCount = quiz.questions ? quiz.questions.length : 0;
      const base = {
        ...quiz.toObject(),
        questions: undefined,
        poolSize: qCount,
        size: qCount,
      };
      if (isTeacher) return { ...base, attemptCount: own.length };

      const done = own.filter((a) => a.status === 'submitted');
      return {
        ...base,
        attemptsUsed: done.length,
        bestPercentage: done.length ? Math.max(...done.map((a) => a.percentage)) : null,
        inProgressAttemptId: own.find((a) => a.status === 'in_progress')?._id || null,
      };
    })
  );
});

export const getQuiz = asyncHandler(async (req, res) => {
  res.json(ensureFound(await Quiz.findById(req.params.id), 'Quiz'));
});

function validate(data) {
  if (data.isPublished && (!data.questions || data.questions.length === 0)) {
    throw new HttpError(400, 'Add at least one question before publishing');
  }
}

export const createQuiz = asyncHandler(async (req, res) => {
  requireFields(req.body, ['title', 'subject']);
  const data = pick(req.body, EDITABLE);
  validate(data);
  res.status(201).json(await Quiz.create({
    ...data,
    createdBy: req.user._id,
  }));
});

export const updateQuiz = asyncHandler(async (req, res) => {
  const quiz = ensureFound(await Quiz.findById(req.params.id), 'Quiz');
  quiz.set(pick(req.body, EDITABLE));
  validate(quiz);
  res.json(await quiz.save());
});

export const deleteQuiz = asyncHandler(async (req, res) => {
  const quiz = ensureFound(await Quiz.findById(req.params.id), 'Quiz');
  await quiz.deleteOne(); // old attempts keep their own copy of the title
  res.json({ ok: true });
});
