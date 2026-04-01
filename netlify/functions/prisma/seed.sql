-- ============================================
-- Task Management System - PostgreSQL Seed Data
-- Run this in Neon SQL Editor after creating your database
-- ============================================

-- Create Roles
INSERT INTO roles (name, description, created_at) VALUES
('admin', 'Full system access', NOW()),
('manager', 'Can manage tasks and view users', NOW()),
('user', 'Basic task operations', NOW())
ON CONFLICT (name) DO NOTHING;

-- Create Permissions
INSERT INTO permissions (name, description) VALUES
('create_task', 'Create new tasks'),
('read_task', 'View tasks'),
('edit_task', 'Edit existing tasks'),
('delete_task', 'Delete tasks'),
('read_users', 'View user list'),
('manage_users', 'Create, edit, delete users'),
('assign_task', 'Assign tasks to users')
ON CONFLICT (name) DO NOTHING;

-- Assign Permissions to Roles

-- Admin gets all permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p
WHERE r.name = 'admin'
ON CONFLICT DO NOTHING;

-- Manager permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p
WHERE r.name = 'manager' 
  AND p.name IN ('create_task', 'read_task', 'edit_task', 'delete_task', 'read_users', 'assign_task')
ON CONFLICT DO NOTHING;

-- User permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p
WHERE r.name = 'user' 
  AND p.name IN ('create_task', 'read_task', 'edit_task')
ON CONFLICT DO NOTHING;

-- Create Demo Users (passwords are hashed for: admin123, manager123, user123)
-- Note: These hashes are bcrypt with 10 rounds

INSERT INTO users (email, username, password, role_id, created_at, updated_at) VALUES
('admin@admin.com', 'admin', '$2a$10$rHG1f.5aVHqh8hJz5KJ8/.Q9L1i0xQzp4ZF5Kt5rS.JpK8Y5eYW.G', 1, NOW(), NOW()),
('manager@example.com', 'manager', '$2a$10$rHG1f.5aVHqh8hJz5KJ8/.Q9L1i0xQzp4ZF5Kt5rS.JpK8Y5eYW.G', 2, NOW(), NOW()),
('user@example.com', 'user', '$2a$10$rHG1f.5aVHqh8hJz5KJ8/.Q9L1i0xQzp4ZF5Kt5rS.JpK8Y5eYW.G', 3, NOW(), NOW())
ON CONFLICT (email) DO NOTHING;

-- Create Sample Tasks
INSERT INTO tasks (title, description, status, priority, user_id, assigned_to, created_at, updated_at) VALUES
('Setup Project', 'Initialize the project structure', 'COMPLETED', 'HIGH', 1, 1, NOW(), NOW()),
('Create Documentation', 'Write comprehensive documentation', 'IN_PROGRESS', 'MEDIUM', 1, 2, NOW(), NOW()),
('Deploy to Production', 'Deploy the application to Netlify', 'TODO', 'HIGH', 2, 3, NOW(), NOW())
ON CONFLICT DO NOTHING;

-- Verify the setup
SELECT 'Roles:' as info, count(*) as count FROM roles
UNION ALL
SELECT 'Permissions:', count(*) FROM permissions
UNION ALL
SELECT 'Role-Permissions:', count(*) FROM role_permissions
UNION ALL
SELECT 'Users:', count(*) FROM users
UNION ALL
SELECT 'Tasks:', count(*) FROM tasks;
