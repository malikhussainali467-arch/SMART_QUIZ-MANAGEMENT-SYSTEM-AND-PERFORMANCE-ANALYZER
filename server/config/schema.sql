-- ============================================================
-- Smart Quiz: Quiz Management System (Mids Version) Schema
-- SQLite Database: data/quiz.sqlite
-- Use DB Browser for SQLite to open data/quiz.sqlite and run queries.
-- ============================================================

-- 1. Users (Students and Teachers)
CREATE TABLE IF NOT EXISTS `users` (
  `id` VARCHAR(36) PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `email` VARCHAR(255) NOT NULL UNIQUE,
  `passwordHash` VARCHAR(255) NOT NULL,
  `role` VARCHAR(20) NOT NULL CHECK (`role` IN ('student', 'teacher')),
  `createdAt` DATETIME NOT NULL,
  `updatedAt` DATETIME NOT NULL
);

-- 2. Subjects
CREATE TABLE IF NOT EXISTS `subjects` (
  `id` VARCHAR(36) PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `description` TEXT DEFAULT '',
  `color` VARCHAR(255) DEFAULT '#6d4aff',
  `createdAt` DATETIME NOT NULL,
  `updatedAt` DATETIME NOT NULL
);

-- 3. Topics
CREATE TABLE IF NOT EXISTS `topics` (
  `id` VARCHAR(36) PRIMARY KEY,
  `subjectId` VARCHAR(36) NOT NULL REFERENCES `subjects` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  `name` VARCHAR(255) NOT NULL,
  `createdAt` DATETIME NOT NULL,
  `updatedAt` DATETIME NOT NULL
);

-- 4. Question Bank (MCQ only)
CREATE TABLE IF NOT EXISTS `questions` (
  `id` VARCHAR(36) PRIMARY KEY,
  `subjectId` VARCHAR(36) NOT NULL REFERENCES `subjects` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  `topicId` VARCHAR(36) NOT NULL REFERENCES `topics` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  `type` VARCHAR(20) NOT NULL DEFAULT 'mcq' CHECK (`type` IN ('mcq')),
  `text` TEXT NOT NULL,
  `difficulty` VARCHAR(20) NOT NULL DEFAULT 'medium' CHECK (`difficulty` IN ('easy', 'medium', 'hard')),
  `marks` FLOAT DEFAULT 1,
  `explanation` TEXT DEFAULT '',
  `options` TEXT DEFAULT '[]', -- JSON array of option strings
  `correctIndex` INTEGER DEFAULT 0,
  `createdById` VARCHAR(36) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  `createdAt` DATETIME NOT NULL,
  `updatedAt` DATETIME NOT NULL
);

-- 5. Quizzes
CREATE TABLE IF NOT EXISTS `quizzes` (
  `id` VARCHAR(36) PRIMARY KEY,
  `title` VARCHAR(255) NOT NULL,
  `description` TEXT DEFAULT '',
  `subjectId` VARCHAR(36) NOT NULL REFERENCES `subjects` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  `questions` TEXT DEFAULT '[]', -- JSON array of question IDs
  `passPercent` INTEGER DEFAULT 50,
  `isPublished` TINYINT(1) DEFAULT 0,
  `createdById` VARCHAR(36) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  `createdAt` DATETIME NOT NULL,
  `updatedAt` DATETIME NOT NULL
);

-- 6. Quiz Attempts & Results
CREATE TABLE IF NOT EXISTS `attempts` (
  `id` VARCHAR(36) PRIMARY KEY,
  `userId` VARCHAR(36) NOT NULL REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  `quizId` VARCHAR(36) REFERENCES `quizzes` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  `title` VARCHAR(255) NOT NULL,
  `passPercent` FLOAT DEFAULT 50,
  `items` TEXT DEFAULT '[]',   -- JSON array of questions with optionOrder
  `answers` TEXT DEFAULT '[]', -- JSON array of marked answers
  `status` VARCHAR(20) NOT NULL DEFAULT 'in_progress' CHECK (`status` IN ('in_progress', 'submitted')),
  `startedAt` DATETIME NOT NULL,
  `submittedAt` DATETIME DEFAULT NULL,
  `score` FLOAT DEFAULT 0,
  `totalMarks` FLOAT DEFAULT 0,
  `percentage` FLOAT DEFAULT 0,
  `createdAt` DATETIME NOT NULL,
  `updatedAt` DATETIME NOT NULL
);
