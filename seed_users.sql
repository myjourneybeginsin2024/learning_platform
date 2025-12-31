-- Create Super Admin
INSERT INTO users (email, hashed_password, role, is_active)
VALUES ('superadmin@test.com', '$2b$12$rRsxR5kciYQURWY0Cba5PeDc0oPD3l7o7kEZSDZeR0zsgCzff6WKy', 'super admin', true)
ON CONFLICT (email) DO UPDATE SET hashed_password = EXCLUDED.hashed_password;

-- Create Admin
INSERT INTO users (email, hashed_password, role, is_active)
VALUES ('admin@test.com', '$2b$12$rRsxR5kciYQURWY0Cba5PeDc0oPD3l7o7kEZSDZeR0zsgCzff6WKy', 'admin', true)
ON CONFLICT (email) DO UPDATE SET hashed_password = EXCLUDED.hashed_password;

-- Create User
INSERT INTO users (email, hashed_password, role, is_active)
VALUES ('user@test.com', '$2b$12$rRsxR5kciYQURWY0Cba5PeDc0oPD3l7o7kEZSDZeR0zsgCzff6WKy', 'user', true)
ON CONFLICT (email) DO UPDATE SET hashed_password = EXCLUDED.hashed_password;
