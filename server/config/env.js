// Central place for every setting. Change defaults here or in the .env file.
import path from 'node:path';
import dotenv from 'dotenv';

dotenv.config();

export const env = {
  port: Number(process.env.PORT) || 5000,
  dbStorage: process.env.DB_STORAGE || path.resolve('data', 'quiz.sqlite'),
  jwtSecret: process.env.JWT_SECRET || 'smart-quiz-dev-secret-change-me',
  jwtExpiresIn: '7d',
  teacherCode: process.env.TEACHER_CODE || 'TEACHER2026',
  seedDemo: process.env.SEED_DEMO !== 'false',
};
