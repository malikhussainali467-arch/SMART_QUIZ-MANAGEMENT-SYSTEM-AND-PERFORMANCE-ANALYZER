// Fills an EMPTY database with demo users, content and realistic attempt history,
// so every screen has something to show on day one.
import { User } from '../models/User.js';
import { Subject } from '../models/Subject.js';
import { Topic } from '../models/Topic.js';
import { Question } from '../models/Question.js';
import { Quiz } from '../models/Quiz.js';
import { Attempt } from '../models/Attempt.js';
import { GradingService } from '../services/GradingService.js';
import { QuizBuilderService } from '../services/QuizBuilderService.js';
import { DAY_MS, shuffle } from '../utils/helpers.js';
import { MCQS, QUIZZES, STUDENTS, SUBJECTS } from './demoContent.js';

const TEACHER = { name: 'Demo Teacher', email: 'teacher@quiz.com', password: 'teacher123' };
const STUDENT_PASSWORD = 'student123';

async function createUsers() {
  const make = async (data, role, password) =>
    User.create({ name: data.name, email: data.email, role, passwordHash: await User.hashPassword(password) });
  const teacher = await make(TEACHER, 'teacher', TEACHER.password);
  const students = await Promise.all(STUDENTS.map((s) => make(s, 'student', STUDENT_PASSWORD)));
  return { teacher, students };
}

async function createContent(teacher) {
  const topicByName = new Map();
  for (const data of SUBJECTS) {
    const subject = await Subject.create({ name: data.name, color: data.color, description: data.description });
    for (const name of data.topics) topicByName.set(name, await Topic.create({ subject: subject._id, name }));
  }

  const base = (topicName) => {
    const topic = topicByName.get(topicName);
    return { topic: topic._id, subject: topic.subject, createdBy: teacher._id };
  };

  for (const [topic, text, correct, wrong, difficulty, explanation] of MCQS) {
    const options = shuffle([correct, ...wrong]);
    await Question.create({ ...base(topic), type: 'mcq', text, options, correctIndex: options.indexOf(correct), difficulty, explanation });
  }

  for (const data of QUIZZES) {
    const subject = await Subject.findOne({ name: data.subject });
    const topicIds = data.topics.map((name) => topicByName.get(name)._id);
    const questions = await Question.find({ topic: { $in: topicIds } });
    await Quiz.create({
      title: data.title,
      description: data.description,
      subject: subject._id,
      questions: questions.map((q) => q._id),
      questionCount: 0,
      durationMinutes: 0,
      maxAttempts: 0,
      shuffleQuestions: false,
      shuffleOptions: false,
      isPublished: data.published,
      createdBy: teacher._id,
    });
  }
}

/** Pretends a student took a quiz `daysAgo` days ago. */
async function simulateAttempt({ user, quiz, profile, daysAgo }) {
  const items = await QuizBuilderService.fromQuiz(quiz);
  const questions = await Question.find({ _id: { $in: items.map((i) => i.question) } });
  const byId = new Map(questions.map((q) => [String(q._id), q]));

  const submitted = questions.map((q) => {
    const right = Math.random() < profile.skill;
    const wrongIndex = q.options.map((_, i) => i).find((i) => i !== q.correctIndex);
    return { question: q._id, selected: right ? q.correctIndex : wrongIndex };
  });

  const attempt = new Attempt({ user: user._id, quiz: quiz._id, title: quiz.title, passPercent: quiz.passPercent, items });
  GradingService.gradeAttempt(attempt, byId, submitted);
  GradingService.updateTotals(attempt);

  const finished = new Date(Date.now() - daysAgo * DAY_MS - Math.random() * 3 * 3600000);
  attempt.status = 'submitted';
  attempt.startedAt = new Date(finished.getTime() - 9 * 60000);
  attempt.submittedAt = finished;
  await attempt.save();
}

async function createHistory(students) {
  const quizzes = await Quiz.find({ isPublished: true });

  for (const [index, profile] of STUDENTS.entries()) {
    for (let n = 0; n < profile.attempts; n++) {
      const daysAgo = Math.round(((profile.attempts - n) / profile.attempts) * 21) + 1;
      await simulateAttempt({
        user: students[index],
        quiz: quizzes[n % quizzes.length],
        profile,
        daysAgo,
      });
    }
  }
}

export async function seedDemoData() {
  if ((await User.countDocuments()) > 0) return; // only seed an empty database

  console.log('Empty database found: loading demo data...');
  const { teacher, students } = await createUsers();
  await createContent(teacher);
  await createHistory(students);

  console.log('Demo logins ->  teacher@quiz.com / teacher123   |   student@quiz.com / student123');
}
