// Shapes an attempt for the browser. While a quiz is running we NEVER send correct answers.
import { Question } from '../models/Question.js';

export async function presentAttempt(attempt, { reveal }) {
  const questions = await Question.find({ _id: { $in: attempt.items.map((i) => i.question) } }).populate('topic', 'name');
  const questionById = new Map(questions.map((q) => [String(q._id), q]));
  const answerById = new Map(attempt.answers.map((a) => [String(a.question), a]));

  const items = attempt.items
    .map((item) => {
      const q = questionById.get(String(item.question));
      if (!q) return null;

      const shown = {
        id: q._id,
        type: q.type,
        text: q.text,
        marks: q.marks,
        difficulty: q.difficulty,
        topic: q.topic?.name || '',
        topicId: q.topic?._id,
        options: q.type === 'mcq' ? item.optionOrder.map((i) => ({ index: i, text: q.options[i] })) : [],
      };
      if (!reveal) return shown;

      const answer = answerById.get(String(q._id));
      const written = (answer?.text || '').toLowerCase();
      return {
        ...shown,
        correctIndex: q.correctIndex,
        explanation: q.explanation,
        modelAnswer: q.modelAnswer,
        keywords: q.keywords,
        matchedKeywords: q.keywords.filter((k) => written.includes(k)),
        answer: answer
          ? { selected: answer.selected, text: answer.text, marks: answer.marks, isCorrect: answer.isCorrect, reviewed: answer.reviewed }
          : null,
      };
    })
    .filter(Boolean);

  const remainingSeconds =
    attempt.status === 'in_progress' && attempt.expiresAt
      ? Math.max(0, Math.round((attempt.expiresAt.getTime() - Date.now()) / 1000))
      : null;

  return {
    attempt: {
      id: attempt._id,
      title: attempt.title,
      kind: attempt.kind,
      status: attempt.status,
      passPercent: attempt.passPercent,
      startedAt: attempt.startedAt,
      submittedAt: attempt.submittedAt,
      timedOut: attempt.timedOut,
      score: attempt.score,
      totalMarks: attempt.totalMarks,
      percentage: attempt.percentage,
      pendingReview: attempt.pendingReview,
      student: attempt.user?.name || null, // only filled when the user was populated
      timed: Boolean(attempt.expiresAt),
    },
    remainingSeconds,
    questions: items,
  };
}
