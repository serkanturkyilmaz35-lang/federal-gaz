-- Database Schema Backup for Federal Gaz Dashboard
-- Generated on 2025-12-12

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    phone VARCHAR(255) NULL,
    role ENUM('user', 'admin', 'editor') DEFAULT 'user',
    sessionToken VARCHAR(255) NULL,
    createdAt DATETIME NOT NULL,
    updatedAt DATETIME NOT NULL
);

-- 2. Addresses Table
CREATE TABLE IF NOT EXISTS addresses (
    id INTEGER PRIMARY KEY AUTO_INCREMENT,
    userId INTEGER NOT NULL,
    title VARCHAR(255) NOT NULL,
    address TEXT NOT NULL,
    isDefault BOOLEAN DEFAULT FALSE,
    createdAt DATETIME NOT NULL,
    updatedAt DATETIME NOT NULL,
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
);

-- 3. Orders Table
CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTO_INCREMENT,
    userId INTEGER NULL,
    details TEXT NOT NULL,
    status ENUM('PENDING', 'PREPARING', 'SHIPPING', 'DELIVERED', 'COMPLETED', 'CANCELLED') DEFAULT 'PENDING',
    trackingNumber VARCHAR(255) NULL,
    createdAt DATETIME NOT NULL,
    updatedAt DATETIME NOT NULL,
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE SET NULL
);

-- 4. Admin Users Table
CREATE TABLE IF NOT EXISTS admin_users (
    id INTEGER PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    role ENUM('super_admin', 'admin', 'editor') DEFAULT 'editor',
    isActive BOOLEAN DEFAULT TRUE,
    lastLoginAt DATETIME NULL,
    createdAt DATETIME NOT NULL,
    updatedAt DATETIME NOT NULL
);

-- 5. Email Templates Table
CREATE TABLE IF NOT EXISTS email_templates (
    id INTEGER PRIMARY KEY AUTO_INCREMENT,
    slug VARCHAR(255) NOT NULL UNIQUE,
    nameTR VARCHAR(255) NOT NULL,
    nameEN VARCHAR(255) NOT NULL,
    category ENUM('general', 'holiday', 'promotion') DEFAULT 'general',
    headerBgColor VARCHAR(255) DEFAULT '#1a2744',
    headerTextColor VARCHAR(255) DEFAULT '#ffffff',
    buttonColor VARCHAR(255) DEFAULT '#b13329',
    bannerImage VARCHAR(255) NULL,
    headerHtml LONGTEXT NOT NULL,
    footerHtml LONGTEXT NOT NULL,
    isActive BOOLEAN DEFAULT TRUE,
    sortOrder INTEGER DEFAULT 0,
    createdAt DATETIME NOT NULL,
    updatedAt DATETIME NOT NULL
);

-- 6. Mailing Campaigns Table
CREATE TABLE IF NOT EXISTS mailing_campaigns (
    id INTEGER PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    subject VARCHAR(255) NOT NULL,
    content LONGTEXT NOT NULL,
    templateSlug VARCHAR(255) NOT NULL, -- References email_templates(slug)
    recipientType ENUM('all', 'members', 'guests', 'custom') DEFAULT 'all',
    recipientIds TEXT NULL,
    status ENUM('draft', 'scheduled', 'sending', 'sent', 'failed', 'cancelled') DEFAULT 'draft',
    scheduledAt DATETIME NULL,
    sentAt DATETIME NULL,
    recipientCount INTEGER DEFAULT 0,
    sentCount INTEGER DEFAULT 0,
    failedCount INTEGER DEFAULT 0,
    openCount INTEGER DEFAULT 0,
    clickCount INTEGER DEFAULT 0,
    errorLog LONGTEXT NULL,
    createdAt DATETIME NOT NULL,
    updatedAt DATETIME NOT NULL,
    FOREIGN KEY (templateSlug) REFERENCES email_templates(slug)
);

-- 7. Mailing Logs Table (New)
CREATE TABLE IF NOT EXISTS mailing_logs (
    id INTEGER PRIMARY KEY AUTO_INCREMENT,
    campaignId INTEGER NOT NULL,
    userEmail VARCHAR(255) NOT NULL,
    userId INTEGER NULL,
    status ENUM('sent', 'failed', 'opened', 'clicked') DEFAULT 'sent',
    errorMessage TEXT NULL,
    sentAt DATETIME NOT NULL,
    openedAt DATETIME NULL,
    clickedAt DATETIME NULL,
    createdAt DATETIME NOT NULL,
    updatedAt DATETIME NOT NULL,
    FOREIGN KEY (campaignId) REFERENCES mailing_campaigns(id) ON DELETE CASCADE
);

-- 8. Other Tables (Skipped minor ones for brevity, but critical ones included)
-- products, services, contact_requests definitions would follow similar pattern.

-- Default Data: Email Templates
INSERT INTO email_templates (slug, nameTR, nameEN, category, headerBgColor, headerTextColor, buttonColor, isActive, sortOrder, headerHtml, footerHtml, createdAt, updatedAt)
VALUES
('modern', 'Modern', 'Modern', 'general', 'linear-gradient(135deg, #1a2744 0%, #0a1628 100%)', '#ffffff', 'linear-gradient(135deg, #b13329 0%, #8b1a12 100%)', 1, 1, '', '', NOW(), NOW()),
('classic', 'Klasik', 'Classic', 'general', '#1a2744', '#ffffff', '#b13329', 1, 2, '', '', NOW(), NOW()),
('promotion', 'Kampanya', 'Promotion', 'promotion', 'linear-gradient(135deg, #ff6b35 0%, #f7931e 100%)', '#ffffff', '#1a2744', 1, 20, '', '', NOW(), NOW()),
('stock-reminder', 'Stok Hatırlatma', 'Stock Reminder', 'promotion', 'linear-gradient(135deg, #2ecc71 0%, #27ae60 100%)', '#ffffff', '#1a2744', 1, 21, '', '', NOW(), NOW()),
('win-back', 'Geri Kazanım', 'Win-back', 'promotion', 'linear-gradient(135deg, #9b59b6 0%, #8e44ad 100%)', '#ffffff', '#e74c3c', 1, 22, '', '', NOW(), NOW()),
('vip-customer', 'VIP Müşteri', 'VIP Customer', 'general', 'linear-gradient(135deg, #2c3e50 0%, #1a252f 100%)', '#ffd700', '#c41e3a', 1, 26, '', '', NOW(), NOW())
ON DUPLICATE KEY UPDATE nameTR=VALUES(nameTR), headerBgColor=VALUES(headerBgColor);
