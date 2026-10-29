-- ============================================================
-- SMART QUIZ - MIDS VERSION DATABASE SCHEMA & MIGRATION
-- SQLite Database Engine (compatible with DB Browser for SQLite)
-- File Location: data/quiz.sqlite
-- ============================================================

PRAGMA foreign_keys = ON;

-- ------------------------------------------------------------
-- 1. USERS TABLE
-- Stores credentials and user roles (student or teacher)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `users` (
  `id` VARCHAR(36) PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `email` VARCHAR(255) NOT NULL UNIQUE,
  `passwordHash` VARCHAR(255) NOT NULL,
  `role` VARCHAR(20) NOT NULL CHECK (`role` IN ('student', 'teacher')),
  `createdAt` DATETIME NOT NULL,
  `updatedAt` DATETIME NOT NULL
);

-- ------------------------------------------------------------
-- 2. SUBJECTS TABLE
-- Academic courses created by teachers
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `subjects` (
  `id` VARCHAR(36) PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `description` TEXT DEFAULT '',
  `color` VARCHAR(255) DEFAULT '#6d4aff',
  `createdAt` DATETIME NOT NULL,
  `updatedAt` DATETIME NOT NULL
);

-- ------------------------------------------------------------
-- 3. TOPICS TABLE
-- Sub-topics belonging to a specific subject
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `topics` (
  `id` VARCHAR(36) PRIMARY KEY,
  `subjectId` VARCHAR(36) NOT NULL REFERENCES `subjects` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  `name` VARCHAR(255) NOT NULL,
  `createdAt` DATETIME NOT NULL,
  `updatedAt` DATETIME NOT NULL
);

-- ------------------------------------------------------------
-- 4. QUESTIONS TABLE (MCQ Only)
-- Multiple-choice question bank. Theory/written columns removed.
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `questions` (
  `id` VARCHAR(36) PRIMARY KEY,
  `subjectId` VARCHAR(36) NOT NULL REFERENCES `subjects` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  `topicId` VARCHAR(36) NOT NULL REFERENCES `topics` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  `type` VARCHAR(20) NOT NULL DEFAULT 'mcq' CHECK (`type` IN ('mcq')),
  `text` TEXT NOT NULL,
  `difficulty` VARCHAR(20) NOT NULL DEFAULT 'medium' CHECK (`difficulty` IN ('easy', 'medium', 'hard')),
  `marks` FLOAT DEFAULT 1,
  `explanation` TEXT DEFAULT '',
  `options` TEXT DEFAULT '[]', -- JSON Array: ["Option 1", "Option 2", ...]
  `correctIndex` INTEGER DEFAULT 0,
  `createdById` VARCHAR(36) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  `createdAt` DATETIME NOT NULL,
  `updatedAt` DATETIME NOT NULL
);

-- ------------------------------------------------------------
-- 5. QUIZZES TABLE
-- Quizzes created by teachers. Untimed, fixed questions.
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `quizzes` (
  `id` VARCHAR(36) PRIMARY KEY,
  `title` VARCHAR(255) NOT NULL,
  `description` TEXT DEFAULT '',
  `subjectId` VARCHAR(36) NOT NULL REFERENCES `subjects` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  `questions` TEXT DEFAULT '[]', -- JSON Array of Question UUIDs: ["uuid1", "uuid2", ...]
  `passPercent` INTEGER DEFAULT 50,
  `isPublished` TINYINT(1) DEFAULT 0,
  `createdById` VARCHAR(36) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  `createdAt` DATETIME NOT NULL,
  `updatedAt` DATETIME NOT NULL
);

-- ------------------------------------------------------------
-- 6. ATTEMPTS TABLE
-- Student quiz submissions and scores. Timer & review flags removed.
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `attempts` (
  `id` VARCHAR(36) PRIMARY KEY,
  `userId` VARCHAR(36) NOT NULL REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  `quizId` VARCHAR(36) REFERENCES `quizzes` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  `title` VARCHAR(255) NOT NULL,
  `passPercent` FLOAT DEFAULT 50,
  `items` TEXT DEFAULT '[]',   -- JSON Array: [{question: 'uuid', optionOrder: [0, 1, 2, 3]}]
  `answers` TEXT DEFAULT '[]', -- JSON Array: [{question: 'uuid', selected: 0, marks: 1, isCorrect: true}]
  `status` VARCHAR(20) NOT NULL DEFAULT 'in_progress' CHECK (`status` IN ('in_progress', 'submitted')),
  `startedAt` DATETIME NOT NULL,
  `submittedAt` DATETIME DEFAULT NULL,
  `score` FLOAT DEFAULT 0,
  `totalMarks` FLOAT DEFAULT 0,
  `percentage` FLOAT DEFAULT 0,
  `createdAt` DATETIME NOT NULL,
  `updatedAt` DATETIME NOT NULL
);

-- ------------------------------------------------------------
-- INDEXES FOR FAST QUERIES & FOREIGN KEY PERFORMANCE
-- ------------------------------------------------------------
CREATE INDEX IF NOT EXISTS `idx_topics_subjectId` ON `topics` (`subjectId`);
CREATE INDEX IF NOT EXISTS `idx_questions_subjectId` ON `questions` (`subjectId`);
CREATE INDEX IF NOT EXISTS `idx_questions_topicId` ON `questions` (`topicId`);
CREATE INDEX IF NOT EXISTS `idx_quizzes_subjectId` ON `quizzes` (`subjectId`);
CREATE INDEX IF NOT EXISTS `idx_attempts_userId` ON `attempts` (`userId`);
CREATE INDEX IF NOT EXISTS `idx_attempts_quizId` ON `attempts` (`quizId`);
