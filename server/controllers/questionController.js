// Question bank (teacher only) - MCQ only.
import { Question } from '../models/Question.js';
import { Topic } from '../models/Topic.js';
import { Quiz } from '../models/Quiz.js';
import { asyncHandler, ensureFound, pick, requireFields } from '../utils/helpers.js';

const EDITABLE = ['topic', 'text', 'difficulty', 'marks', 'explanation', 'options', 'correctIndex'];

export const listQuestions = asyncHandler(async (req, res) => {
  const { subject, topic, difficulty, search } = req.query;
  const filter = { type: 'mcq' };
  if (subject) filter.subject = subject;
  if (topic) filter.topic = topic;
  if (difficulty) filter.difficulty = difficulty;
  if (search) filter.text = { $regex: search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), $options: 'i' };

  const questions = await Question.find(filter).sort({ createdAt: -1 }).populate('subject', 'name color').populate('topic', 'name');
  res.json(questions);
});

export const createQuestion = asyncHandler(async (req, res) => {
  requireFields(req.body, ['topic', 'text']);
  const topic = ensureFound(await Topic.findById(req.body.topic), 'Topic');
  const question = await Question.create({
    ...pick(req.body, EDITABLE),
    type: 'mcq',
    subject: topic.subject,
    createdBy: req.user._id,
  });
  res.status(201).json(question);
});

export const updateQuestion = asyncHandler(async (req, res) => {
  const question = ensureFound(await Question.findById(req.params.id), 'Question');
  question.set(pick(req.body, EDITABLE));
  question.type = 'mcq';
  if (req.body.topic) {
    const topic = ensureFound(await Topic.findById(req.body.topic), 'Topic');
    question.subject = topic.subject; // subject always follows the topic
  }
  res.json(await question.save());
});

export const deleteQuestion = asyncHandler(async (req, res) => {
  const question = ensureFound(await Question.findById(req.params.id), 'Question');
  await Quiz.updateMany({ questions: question._id }, { $pull: { questions: question._id } });
  await question.deleteOne();
  res.json({ ok: true });
});
