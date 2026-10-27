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
        type: 'mcq',
        text: q.text,
        marks: q.marks,
        difficulty: q.difficulty,
        topic: q.topic?.name || '',
        topicId: q.topic?._id,
        options: (q.options || []).map((text, i) => ({ index: i, text })),
      };
      if (!reveal) return shown;

      const answer = answerById.get(String(q._id));
      return {
        ...shown,
        correctIndex: q.correctIndex,
        explanation: q.explanation,
        answer: answer
          ? { selected: answer.selected, marks: answer.marks, isCorrect: answer.isCorrect }
          : null,
      };
    })
    .filter(Boolean);

  return {
    attempt: {
      id: attempt._id,
      title: attempt.title,
      kind: attempt.kind,
      status: attempt.status,
      passPercent: attempt.passPercent,
      startedAt: attempt.startedAt,
      submittedAt: attempt.submittedAt,
      timedOut: false,
      score: attempt.score,
      totalMarks: attempt.totalMarks,
      percentage: attempt.percentage,
      pendingReview: false,
      student: attempt.user?.name || null,
      timed: false,
    },
    remainingSeconds: null,
    questions: items,
  };
}
