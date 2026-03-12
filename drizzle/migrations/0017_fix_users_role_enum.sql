-- Fix users role enum to match schema
-- Current: enum('user','admin','manager','accountant','hr','sales','super_admin')
-- Expected: enum('user','admin','staff','accountant','client','super_admin','project_manager','hr')
ALTER TABLE `users` MODIFY COLUMN `role` ENUM('user', 'admin', 'staff', 'accountant', 'client', 'super_admin', 'project_manager', 'hr') NOT NULL DEFAULT 'user';
