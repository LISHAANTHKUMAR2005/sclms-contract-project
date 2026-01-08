-- MySQL Initial Data for SCLMS Database

USE sclms_db;

-- TEMPORARY: Add admin user for testing export functionality
-- Password: admin123 (BCrypt hash)
INSERT IGNORE INTO users (name, email, password, role, status, organization, created_date, two_factor_enabled, browser_notifications, contract_alerts, email_notifications, expiration_reminders, system_notifications) VALUES
('System Administrator', 'admin@sclms.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'ADMIN', 'APPROVED', 'SCLMS Corporation', NOW(), false, true, true, true, true, true);

-- Regular test users
INSERT IGNORE INTO users (name, email, password, role, status, organization, created_date, two_factor_enabled, browser_notifications, contract_alerts, email_notifications, expiration_reminders, system_notifications) VALUES
('John Doe', 'john.doe@company.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'USER', 'APPROVED', 'Tech Solutions Inc', NOW(), false, true, true, true, true, true),
('Jane Smith', 'jane.smith@company.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'APPROVER', 'APPROVED', 'Global Enterprises', NOW(), false, true, true, true, true, true);
