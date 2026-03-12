-- Clear out old test users
DELETE FROM users WHERE email LIKE 'test.%@melitech.local';

-- Insert test users with correct PBKDF2 password hash for 'password123'
INSERT INTO users (id, name, email, passwordHash, role, isActive, createdAt, requiresPasswordChange, loginMethod) VALUES 
  (UUID(), 'Test Super Admin', 'test.superadmin@melitech.local', '40adead6c61fb473e3f7a1d03fdd863d:759eb8cfe3e0fd05241bbe90026c4f4e9248365410e8959a1dbcaeb99834d95b:100000', 'super_admin', 1, NOW(), 0, 'local'),
  (UUID(), 'Test Admin', 'test.admin@melitech.local', '40adead6c61fb473e3f7a1d03fdd863d:759eb8cfe3e0fd05241bbe90026c4f4e9248365410e8959a1dbcaeb99834d95b:100000', 'admin', 1, NOW(), 0, 'local'),
  (UUID(), 'Test Accountant', 'test.accountant@melitech.local', '40adead6c61fb473e3f7a1d03fdd863d:759eb8cfe3e0fd05241bbe90026c4f4e9248365410e8959a1dbcaeb99834d95b:100000', 'accountant', 1, NOW(), 0, 'local'),
  (UUID(), 'Test PM', 'test.pm@melitech.local', '40adead6c61fb473e3f7a1d03fdd863d:759eb8cfe3e0fd05241bbe90026c4f4e9248365410e8959a1dbcaeb99834d95b:100000', 'super_admin', 1, NOW(), 0, 'local'),
  (UUID(), 'Test HR', 'test.hr@melitech.local', '40adead6c61fb473e3f7a1d03fdd863d:759eb8cfe3e0fd05241bbe90026c4f4e9248365410e8959a1dbcaeb99834d95b:100000', 'hr', 1, NOW(), 0, 'local'),
  (UUID(), 'Test Staff', 'test.staff@melitech.local', '40adead6c61fb473e3f7a1d03fdd863d:759eb8cfe3e0fd05241bbe90026c4f4e9248365410e8959a1dbcaeb99834d95b:100000', 'user', 1, NOW(), 0, 'local');

-- Verify creation  
SELECT email, role, LENGTH(passwordHash) as hash_length FROM users WHERE email LIKE 'test.%@melitech.local' ORDER BY role;
