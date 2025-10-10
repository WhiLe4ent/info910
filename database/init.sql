-- Create pages table for note manager
CREATE TABLE IF NOT EXISTS pages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL DEFAULT 'Untitled',
    content TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_updated_at (updated_at DESC)
);

-- Insert some sample pages
INSERT INTO pages (title, content) VALUES
('Welcome', 'Welcome to your note manager! This is your first page.'),
('Getting Started', '# Getting Started\n\nCreate, edit, and organize your notes easily.\n\n## Features\n- Add new pages\n- Edit content\n- Delete pages\n- Auto-save functionality'),
('Sample Note', 'This is a sample note. You can edit this content and save it.');
