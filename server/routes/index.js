// Every API URL in one readable place. "teacher" routes are protected by requireRole.
import { Router } from 'express';
import { authenticate, requireRole } from '../middleware/auth.js';
import * as auth from '../controllers/authController.js';
import * as catalog from '../controllers/catalogController.js';
import * as questions from '../controllers/questionController.js';
import * as quizzes from '../controllers/quizController.js';
import * as attempts from '../controllers/attemptController.js';
import * as analytics from '../controllers/analyticsController.js';

const router = Router();
const teacher = requireRole('teacher');
const student = requireRole('student');

// Auth
router.post('/auth/register', auth.register);
router.post('/auth/login', auth.login);
router.get('/auth/me', authenticate, auth.me);

// Everything below needs a logged-in user
router.use(authenticate);

// Subjects & topics (read: everyone, change: teacher)
router.get('/subjects', catalog.listSubjects);
router.post('/subjects', teacher, catalog.createSubject);
router.put('/subjects/:id', teacher, catalog.updateSubject);
router.delete('/subjects/:id', teacher, catalog.deleteSubject);
router.post('/subjects/:subjectId/topics', teacher, catalog.createTopic);
router.put('/topics/:id', teacher, catalog.updateTopic);
router.delete('/topics/:id', teacher, catalog.deleteTopic);

// Question bank (MCQ only)
router.get('/questions', teacher, questions.listQuestions);
router.post('/questions', teacher, questions.createQuestion);
router.put('/questions/:id', teacher, questions.updateQuestion);
router.delete('/questions/:id', teacher, questions.deleteQuestion);

// Quizzes
router.get('/quizzes', quizzes.listQuizzes);
router.get('/quizzes/:id', teacher, quizzes.getQuiz);
router.post('/quizzes', teacher, quizzes.createQuiz);
router.put('/quizzes/:id', teacher, quizzes.updateQuiz);
router.delete('/quizzes/:id', teacher, quizzes.deleteQuiz);

// Attempts
router.post('/attempts/start', student, attempts.startQuiz);
router.get('/attempts/mine', student, attempts.myAttempts);
router.get('/attempts/:id', attempts.getAttempt);
router.post('/attempts/:id/submit', student, attempts.submitAttempt);

// Analytics (Basic teacher quiz report)
router.get('/analytics/quizzes/:id', teacher, analytics.quizReport);

export default router;
