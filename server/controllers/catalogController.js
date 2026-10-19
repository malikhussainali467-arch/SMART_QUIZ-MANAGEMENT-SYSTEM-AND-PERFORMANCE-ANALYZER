// Subjects and their topics.
import { Subject } from '../models/Subject.js';
import { Topic } from '../models/Topic.js';
import { Question } from '../models/Question.js';
import { HttpError, asyncHandler, ensureFound, pick, requireFields } from '../utils/helpers.js';

export const listSubjects = asyncHandler(async (req, res) => {
  const [subjects, topics, questions] = await Promise.all([
    Subject.find().sort({ name: 1 }),
    Topic.find().sort({ name: 1 }),
    Question.find().select('topic'),
  ]);

  const countByTopic = new Map();
  questions.forEach((q) => countByTopic.set(String(q.topic), (countByTopic.get(String(q.topic)) || 0) + 1));

  res.json(
    subjects.map((subject) => ({
      ...subject.toObject(),
      topics: topics
        .filter((t) => String(t.subject) === String(subject._id))
        .map((t) => ({ ...t.toObject(), questionCount: countByTopic.get(String(t._id)) || 0 })),
    }))
  );
});

export const createSubject = asyncHandler(async (req, res) => {
  requireFields(req.body, ['name']);
  res.status(201).json(await Subject.create(pick(req.body, ['name', 'description', 'color'])));
});

export const updateSubject = asyncHandler(async (req, res) => {
  const subject = ensureFound(await Subject.findById(req.params.id), 'Subject');
  subject.set(pick(req.body, ['name', 'description', 'color']));
  res.json(await subject.save());
});

export const deleteSubject = asyncHandler(async (req, res) => {
  const subject = ensureFound(await Subject.findById(req.params.id), 'Subject');
  if (await Question.countDocuments({ subject: subject._id })) {
    throw new HttpError(409, 'Delete or move this subject\'s questions first');
  }
  await Topic.deleteMany({ subject: subject._id });
  await subject.deleteOne();
  res.json({ ok: true });
});

export const createTopic = asyncHandler(async (req, res) => {
  requireFields(req.body, ['name']);
  ensureFound(await Subject.findById(req.params.subjectId), 'Subject');
  res.status(201).json(await Topic.create({ subject: req.params.subjectId, name: req.body.name }));
});

export const updateTopic = asyncHandler(async (req, res) => {
  const topic = ensureFound(await Topic.findById(req.params.id), 'Topic');
  topic.set(pick(req.body, ['name']));
  res.json(await topic.save());
});

export const deleteTopic = asyncHandler(async (req, res) => {
  const topic = ensureFound(await Topic.findById(req.params.id), 'Topic');
  if (await Question.countDocuments({ topic: topic._id })) {
    throw new HttpError(409, 'Delete or move this topic\'s questions first');
  }
  await topic.deleteOne();
  res.json({ ok: true });
});
