-- MySQL initialization script for Melitech CRM
-- This script runs after the default MySQL initialization to fix user permissions

-- Drop existing melitech_user entries to recreate with proper permissions
DROP USER IF EXISTS 'melitech_user'@'localhost';
DROP USER IF EXISTS 'melitech_user'@'%';

-- Create the melitech_user with wildcard host (allows connection from any network interface)
CREATE USER 'melitech_user'@'%' IDENTIFIED WITH mysql_native_password BY 'tjwzT9pW;NGYq1QxSq0B';

-- Grant all privileges on melitech_crm database
GRANT ALL PRIVILEGES ON melitech_crm.* TO 'melitech_user'@'%';

-- Flush privileges to apply all changes immediately
FLUSH PRIVILEGES;

-- Verify melitech_user configuration
SELECT User, Host, authentication_string FROM mysql.user WHERE User = 'melitech_user' ORDER BY User, Host;


