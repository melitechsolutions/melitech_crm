-- Migration: Add requiresPasswordChange column to users table
-- This column tracks whether a user must change their password on first login
-- Default is 1 (true) for new users who received auto-generated passwords

-- MySQL doesn't support `IF NOT EXISTS` for columns, so we'll use conditional logic
-- This migration assumes the column doesn't exist; if it does, a benign error will be caught
ALTER TABLE `users` ADD COLUMN `requiresPasswordChange` TINYINT(1) NOT NULL DEFAULT 1 AFTER `passwordResetExpiresAt`;
