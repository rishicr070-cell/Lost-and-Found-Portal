-- Lost and Found Portal Database Schema
-- MySQL Database Setup

-- Create Database
CREATE DATABASE IF NOT EXISTS lost_found_portal;
USE lost_found_portal;

-- Users Table
CREATE TABLE IF NOT EXISTS users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    phone VARCHAR(15),
    role ENUM('user', 'admin') DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_username (username),
    INDEX idx_email (email)
);

-- Lost Items Table
CREATE TABLE IF NOT EXISTS lost_items (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    item_name VARCHAR(100) NOT NULL,
    category VARCHAR(50) NOT NULL,
    description TEXT,
    lost_date DATE NOT NULL,
    lost_location VARCHAR(200) NOT NULL,
    color VARCHAR(50),
    size VARCHAR(20),
    brand VARCHAR(50),
    distinctive_features TEXT,
    reward_offered DECIMAL(10, 2) DEFAULT 0,
    status ENUM('lost', 'found', 'claimed') DEFAULT 'lost',
    image_url VARCHAR(255),
    contact_preference ENUM('email', 'phone', 'both') DEFAULT 'both',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_category (category),
    INDEX idx_status (status),
    INDEX idx_lost_date (lost_date),
    INDEX idx_item_name (item_name),
    FULLTEXT INDEX idx_description (description, distinctive_features)
);

-- Found Items Table
CREATE TABLE IF NOT EXISTS found_items (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    item_name VARCHAR(100) NOT NULL,
    category VARCHAR(50) NOT NULL,
    description TEXT,
    found_date DATE NOT NULL,
    found_location VARCHAR(200) NOT NULL,
    color VARCHAR(50),
    size VARCHAR(20),
    brand VARCHAR(50),
    distinctive_features TEXT,
    current_location VARCHAR(200),
    status ENUM('available', 'claimed', 'returned') DEFAULT 'available',
    image_url VARCHAR(255),
    contact_preference ENUM('email', 'phone', 'both') DEFAULT 'both',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_category (category),
    INDEX idx_status (status),
    INDEX idx_found_date (found_date),
    INDEX idx_item_name (item_name),
    FULLTEXT INDEX idx_description (description, distinctive_features)
);

-- Categories Reference Table
CREATE TABLE IF NOT EXISTS categories (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    icon VARCHAR(50),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Item Matches Table (for matching lost and found items)
CREATE TABLE IF NOT EXISTS item_matches (
    id INT PRIMARY KEY AUTO_INCREMENT,
    lost_item_id INT NOT NULL,
    found_item_id INT NOT NULL,
    match_score DECIMAL(5, 2),
    match_details JSON,
    status ENUM('potential', 'confirmed', 'rejected') DEFAULT 'potential',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (lost_item_id) REFERENCES lost_items(id) ON DELETE CASCADE,
    FOREIGN KEY (found_item_id) REFERENCES found_items(id) ON DELETE CASCADE,
    UNIQUE KEY unique_match (lost_item_id, found_item_id),
    INDEX idx_status (status)
);

-- Claims Table
CREATE TABLE IF NOT EXISTS claims (
    id INT PRIMARY KEY AUTO_INCREMENT,
    lost_item_id INT,
    found_item_id INT,
    claimer_id INT NOT NULL,
    verification_details TEXT,
    status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
    claimed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    reviewed_at TIMESTAMP NULL,
    reviewed_by INT,
    notes TEXT,
    FOREIGN KEY (lost_item_id) REFERENCES lost_items(id) ON DELETE CASCADE,
    FOREIGN KEY (found_item_id) REFERENCES found_items(id) ON DELETE CASCADE,
    FOREIGN KEY (claimer_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (reviewed_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_status (status)
);

-- Action History Table (for DSA Stack tracking)
CREATE TABLE IF NOT EXISTS action_history (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    action_type VARCHAR(50) NOT NULL,
    table_name VARCHAR(50) NOT NULL,
    record_id INT NOT NULL,
    action_data JSON,
    ip_address VARCHAR(45),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_action (user_id, action_type),
    INDEX idx_created_at (created_at)
);

-- Insert Default Categories
INSERT INTO categories (name, description, icon) VALUES
('Electronics', 'Mobile phones, laptops, tablets, chargers', 'laptop'),
('Documents', 'ID cards, licenses, certificates, papers', 'file-text'),
('Accessories', 'Watches, jewelry, glasses, bags', 'shopping-bag'),
('Keys', 'House keys, car keys, key chains', 'key'),
('Clothing', 'Jackets, shirts, shoes, uniforms', 'user'),
('Books', 'Textbooks, notebooks, novels', 'book'),
('Sports Equipment', 'Balls, rackets, gym gear', 'activity'),
('Personal Items', 'Wallets, purses, umbrellas', 'briefcase'),
('Other', 'Miscellaneous items', 'more-horizontal');

-- Insert Sample Admin User (password: admin123 - should be hashed in production)
-- Note: In production, use proper password hashing (bcrypt/argon2)
INSERT INTO users (username, email, password_hash, full_name, role) VALUES
('admin', 'admin@campus.edu', '$2y$10$example_hash_here', 'System Administrator', 'admin');

-- Create Views for Common Queries

-- View: Active Lost Items with User Info
CREATE VIEW v_active_lost_items AS
SELECT 
    li.*,
    u.username,
    u.full_name,
    u.email,
    u.phone
FROM lost_items li
JOIN users u ON li.user_id = u.id
WHERE li.is_active = TRUE AND li.status = 'lost';

-- View: Active Found Items with User Info
CREATE VIEW v_active_found_items AS
SELECT 
    fi.*,
    u.username,
    u.full_name,
    u.email,
    u.phone
FROM found_items fi
JOIN users u ON fi.user_id = u.id
WHERE fi.is_active = TRUE AND fi.status = 'available';

-- View: Recent Activity (last 50 actions)
CREATE VIEW v_recent_activity AS
SELECT 
    ah.*,
    u.username,
    u.full_name
FROM action_history ah
JOIN users u ON ah.user_id = u.id
ORDER BY ah.created_at DESC
LIMIT 50;

-- Stored Procedure: Search Items by Keyword
DELIMITER //
CREATE PROCEDURE sp_search_items(IN search_keyword VARCHAR(100))
BEGIN
    -- Search in lost items
    SELECT 'lost' as item_type, li.* 
    FROM lost_items li
    WHERE li.is_active = TRUE 
    AND (li.item_name LIKE CONCAT('%', search_keyword, '%')
         OR li.description LIKE CONCAT('%', search_keyword, '%')
         OR li.category LIKE CONCAT('%', search_keyword, '%'))
    
    UNION ALL
    
    -- Search in found items
    SELECT 'found' as item_type, fi.* 
    FROM found_items fi
    WHERE fi.is_active = TRUE 
    AND (fi.item_name LIKE CONCAT('%', search_keyword, '%')
         OR fi.description LIKE CONCAT('%', search_keyword, '%')
         OR fi.category LIKE CONCAT('%', search_keyword, '%'));
END //
DELIMITER ;

-- Function: Calculate Match Score (simplified version)
DELIMITER //
CREATE FUNCTION fn_calculate_match_score(
    lost_name VARCHAR(100),
    found_name VARCHAR(100),
    lost_category VARCHAR(50),
    found_category VARCHAR(50)
) RETURNS DECIMAL(5,2)
DETERMINISTIC
BEGIN
    DECLARE score DECIMAL(5,2) DEFAULT 0;
    
    -- Category match (40 points)
    IF lost_category = found_category THEN
        SET score = score + 40;
    END IF;
    
    -- Name similarity (60 points - simplified)
    IF LOWER(lost_name) = LOWER(found_name) THEN
        SET score = score + 60;
    ELSEIF LOCATE(LOWER(lost_name), LOWER(found_name)) > 0 
           OR LOCATE(LOWER(found_name), LOWER(lost_name)) > 0 THEN
        SET score = score + 30;
    END IF;
    
    RETURN score;
END //
DELIMITER ;

-- Trigger: Log actions to action_history
DELIMITER //
CREATE TRIGGER trg_lost_items_insert 
AFTER INSERT ON lost_items
FOR EACH ROW
BEGIN
    INSERT INTO action_history (user_id, action_type, table_name, record_id, action_data)
    VALUES (NEW.user_id, 'ADD_LOST_ITEM', 'lost_items', NEW.id, 
            JSON_OBJECT('item_name', NEW.item_name, 'category', NEW.category));
END //

CREATE TRIGGER trg_found_items_insert 
AFTER INSERT ON found_items
FOR EACH ROW
BEGIN
    INSERT INTO action_history (user_id, action_type, table_name, record_id, action_data)
    VALUES (NEW.user_id, 'ADD_FOUND_ITEM', 'found_items', NEW.id,
            JSON_OBJECT('item_name', NEW.item_name, 'category', NEW.category));
END //
DELIMITER ;

-- Sample Data for Testing (Optional)
-- Uncomment to insert sample lost items
/*
INSERT INTO lost_items (user_id, item_name, category, description, lost_date, lost_location, color) VALUES
(1, 'iPhone 13', 'Electronics', 'Black iPhone 13 with blue case', '2025-01-15', 'Library 2nd Floor', 'Black'),
(1, 'Student ID Card', 'Documents', 'ID card with photo', '2025-01-18', 'Cafeteria', 'White'),
(1, 'Blue Backpack', 'Accessories', 'Blue Jansport backpack with laptop', '2025-01-20', 'Gym', 'Blue');
*/

-- Performance Optimization: Add additional indexes if needed
-- ALTER TABLE lost_items ADD INDEX idx_composite (category, status, is_active);
-- ALTER TABLE found_items ADD INDEX idx_composite (category, status, is_active);

COMMIT;
