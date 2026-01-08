-- SQL Script to promote user to ADMIN role
-- Replace 'your-admin-email@example.com' with your actual admin email

UPDATE users SET role='ADMIN' WHERE email='admin@sclms.com';

-- Or if you want to promote a different user, replace the email above
-- UPDATE users SET role='ADMIN' WHERE email='your-email@example.com';

-- Check the user was updated
SELECT id, name, email, role, status FROM users WHERE role='ADMIN';
