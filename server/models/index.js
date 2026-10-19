import { User } from './User.js';
import { Subject } from './Subject.js';
import { Topic } from './Topic.js';
import { Question } from './Question.js';
import { Quiz } from './Quiz.js';
import { Attempt } from './Attempt.js';
import { sequelize } from '../config/db.js';

let associationsInitialized = false;

export function initAssociations() {
  if (associationsInitialized) return;
  associationsInitialized = true;

  // Subject <-> Topic
  Subject.hasMany(Topic, { foreignKey: 'subjectId', as: 'topics', onDelete: 'CASCADE' });
  Topic.belongsTo(Subject, { foreignKey: 'subjectId', as: 'subject' });

  // Subject <-> Question
  Subject.hasMany(Question, { foreignKey: 'subjectId', as: 'questions', onDelete: 'CASCADE' });
  Question.belongsTo(Subject, { foreignKey: 'subjectId', as: 'subject' });

  // Topic <-> Question
  Topic.hasMany(Question, { foreignKey: 'topicId', as: 'questions', onDelete: 'CASCADE' });
  Question.belongsTo(Topic, { foreignKey: 'topicId', as: 'topic' });

  // User <-> Question
  User.hasMany(Question, { foreignKey: 'createdById', as: 'createdQuestions' });
  Question.belongsTo(User, { foreignKey: 'createdById', as: 'creator' });

  // Subject <-> Quiz
  Subject.hasMany(Quiz, { foreignKey: 'subjectId', as: 'quizzes', onDelete: 'CASCADE' });
  Quiz.belongsTo(Subject, { foreignKey: 'subjectId', as: 'subject' });

  // User <-> Quiz
  User.hasMany(Quiz, { foreignKey: 'createdById', as: 'createdQuizzes' });
  Quiz.belongsTo(User, { foreignKey: 'createdById', as: 'creator' });

  // User <-> Attempt
  User.hasMany(Attempt, { foreignKey: 'userId', as: 'attempts', onDelete: 'CASCADE' });
  Attempt.belongsTo(User, { foreignKey: 'userId', as: 'user' });

  // Quiz <-> Attempt
  Quiz.hasMany(Attempt, { foreignKey: 'quizId', as: 'attempts', onDelete: 'SET NULL' });
  Attempt.belongsTo(Quiz, { foreignKey: 'quizId', as: 'quiz' });
}

export { User, Subject, Topic, Question, Quiz, Attempt, sequelize };
