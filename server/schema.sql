CREATE TABLE IF NOT EXISTS admin_users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS projects (
    id SERIAL PRIMARY KEY,
    title VARCHAR(100) NOT NULL,
    description TEXT,
    tags VARCHAR(255),
    icon VARCHAR(100),
    image_url VARCHAR(255),
    demo_url VARCHAR(255),
    code_url VARCHAR(255),
    display_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS social_links (
    id SERIAL PRIMARY KEY,
    platform VARCHAR(50) NOT NULL UNIQUE,
    url VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS home_content (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255),
    subtitle VARCHAR(255),
    bio TEXT,
    tech_chips JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS about_content (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255),
    role VARCHAR(255),
    location VARCHAR(255),
    email VARCHAR(255),
    mission_text TEXT,
    education_json JSONB,
    interests_json JSONB,
    stats_json JSONB,
    profile_img_url VARCHAR(255),
    resume_url VARCHAR(255),
    cert_img_url VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS skills (
    id SERIAL PRIMARY KEY,
    category VARCHAR(50),
    name VARCHAR(100),
    icon VARCHAR(100),
    proficiency_percent INT,
    level_text VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS experience (
    id SERIAL PRIMARY KEY,
    year VARCHAR(20),
    badge VARCHAR(50),
    role VARCHAR(255),
    company VARCHAR(255),
    period VARCHAR(100),
    bullets_json JSONB,
    tags_json JSONB,
    display_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS messages (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS certificates (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    subtitle VARCHAR(255),
    image_url VARCHAR(255) NOT NULL,
    display_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default admin user if not exists (password: admin123, you should change this later)
-- Note: the password hash below is for 'admin123' using bcrypt
INSERT INTO admin_users (username, password_hash) 
VALUES ('admin', '$2b$10$0eX6CjhImbQHUtn6EGk2juLIn8h2tp2eFg89HW8aGx/RAbQ.baqf2')
ON CONFLICT (username) DO NOTHING;

-- Insert default socials
INSERT INTO social_links (platform, url) VALUES ('github', 'https://github.com/Srikannan1905') ON CONFLICT (platform) DO NOTHING;
INSERT INTO social_links (platform, url) VALUES ('linkedin', 'https://linkedin.com/in/srikannan') ON CONFLICT (platform) DO NOTHING;

-- Insert a default certificate, use ON CONFLICT DO NOTHING if we had a unique constraint, 
-- but since id is serial, we can just insert it if the table is empty.
-- A simple way to insert if empty in Postgres is using a subquery:
INSERT INTO certificates (title, subtitle, image_url)
SELECT 'Java Certification', 'INFI TECHZONE • AUG 2023', '/images/certificate-java.jpg'
WHERE NOT EXISTS (SELECT 1 FROM certificates WHERE title = 'Java Certification');
