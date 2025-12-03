-- Federal Gaz - Complete Database Schema with CMS Features
-- Run this script INSIDE your created database (Aiven or Hostinger MySQL)

-- ============================================
-- 1. USERS & AUTHENTICATION
-- ============================================

CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    full_name VARCHAR(255),
    phone_number VARCHAR(20),
    company_name VARCHAR(255),
    tax_number VARCHAR(50),
    tax_office VARCHAR(100),
    address TEXT,
    role ENUM('user', 'admin', 'editor') DEFAULT 'user',
    is_active BOOLEAN DEFAULT TRUE,
    last_login TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_role (role)
);

CREATE TABLE IF NOT EXISTS otps (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    otp_code VARCHAR(6) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_used BOOLEAN DEFAULT FALSE,
    ip_address VARCHAR(45),
    user_agent TEXT,
    FOREIGN KEY (email) REFERENCES users(email) ON DELETE CASCADE,
    INDEX idx_email_active (email, is_used, expires_at)
);

-- ============================================
-- 2. CMS - SITE SETTINGS
-- ============================================

CREATE TABLE IF NOT EXISTS site_settings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    setting_group VARCHAR(50), -- 'branding', 'colors', 'fonts', 'seo', 'general'
    setting_key VARCHAR(100) NOT NULL,
    setting_value TEXT,
    setting_type ENUM('text', 'color', 'file', 'json', 'boolean') DEFAULT 'text',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_setting (setting_group, setting_key)
);

-- ============================================
-- 3. CMS - MEDIA LIBRARY
-- ============================================

CREATE TABLE IF NOT EXISTS media_library (
    id INT AUTO_INCREMENT PRIMARY KEY,
    filename VARCHAR(255) NOT NULL,
    original_filename VARCHAR(255),
    file_path VARCHAR(500) NOT NULL,
    file_url VARCHAR(500),
    file_type VARCHAR(50), -- 'image', 'video', 'document'
    mime_type VARCHAR(100),
    file_size INT, -- bytes
    width INT, -- for images
    height INT, -- for images
    alt_text VARCHAR(255),
    uploaded_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_file_type (file_type),
    INDEX idx_uploaded_by (uploaded_by)
);

-- ============================================
-- 4. CMS - NAVIGATION MENUS
-- ============================================

CREATE TABLE IF NOT EXISTS menus (
    id INT AUTO_INCREMENT PRIMARY KEY,
    menu_location VARCHAR(50), -- 'header', 'footer', 'sidebar'
    parent_id INT NULL, -- for nested menus
    title VARCHAR(100) NOT NULL,
    url VARCHAR(255),
    icon VARCHAR(50), -- Material icon name
    sort_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    target VARCHAR(20) DEFAULT '_self', -- '_self', '_blank'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (parent_id) REFERENCES menus(id) ON DELETE CASCADE,
    INDEX idx_location_active (menu_location, is_active, sort_order)
);

-- ============================================
-- 5. CMS - SLIDERS & BANNERS
-- ============================================

CREATE TABLE IF NOT EXISTS sliders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255),
    subtitle TEXT,
    description TEXT,
    image_id INT,
    link_url VARCHAR(255),
    link_text VARCHAR(100),
    sort_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    start_date TIMESTAMP NULL,
    end_date TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (image_id) REFERENCES media_library(id) ON DELETE SET NULL,
    INDEX idx_active_dates (is_active, start_date, end_date)
);

-- ============================================
-- 6. CMS - PAGES
-- ============================================

CREATE TABLE IF NOT EXISTS pages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    content LONGTEXT,
    excerpt TEXT,
    meta_title VARCHAR(255),
    meta_description TEXT,
    meta_keywords TEXT,
    featured_image_id INT,
    template VARCHAR(50) DEFAULT 'default', -- 'default', 'landing', 'contact'
    is_published BOOLEAN DEFAULT FALSE,
    published_at TIMESTAMP NULL,
    created_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (featured_image_id) REFERENCES media_library(id) ON DELETE SET NULL,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_slug (slug),
    INDEX idx_published (is_published, published_at)
);

-- ============================================
-- 7. CMS - ANNOUNCEMENTS (Pop-ups, Banners, Tickers)
-- ============================================

CREATE TABLE IF NOT EXISTS announcements (
    id INT AUTO_INCREMENT PRIMARY KEY,
    type ENUM('popup', 'banner', 'ticker') NOT NULL,
    title VARCHAR(255),
    content TEXT NOT NULL,
    link_url VARCHAR(255),
    link_text VARCHAR(100),
    display_pages JSON, -- ['all', '/products', '/contact']
    start_date TIMESTAMP NULL,
    end_date TIMESTAMP NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_type_active (type, is_active)
);

-- ============================================
-- 8. CONTENT - CATEGORIES & PRODUCTS
-- ============================================

CREATE TABLE IF NOT EXISTS categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    image_id INT,
    sort_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (image_id) REFERENCES media_library(id) ON DELETE SET NULL,
    INDEX idx_slug (slug)
);

CREATE TABLE IF NOT EXISTS products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    category_id INT,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    technical_specs JSON,
    image_id INT,
    gallery_images JSON, -- Array of media_library IDs
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
    FOREIGN KEY (image_id) REFERENCES media_library(id) ON DELETE SET NULL,
    INDEX idx_category (category_id),
    INDEX idx_slug (slug)
);

CREATE TABLE IF NOT EXISTS services (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    short_description VARCHAR(500),
    full_content TEXT,
    icon_name VARCHAR(50),
    image_id INT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (image_id) REFERENCES media_library(id) ON DELETE SET NULL,
    INDEX idx_slug (slug)
);

-- ============================================
-- 9. BUSINESS - ORDERS & REQUESTS
-- ============================================

CREATE TABLE IF NOT EXISTS orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    order_number VARCHAR(20) UNIQUE NOT NULL,
    status ENUM('pending', 'approved', 'processing', 'shipped', 'delivered', 'cancelled') DEFAULT 'pending',
    total_amount DECIMAL(10, 2),
    currency VARCHAR(3) DEFAULT 'TRY',
    notes TEXT,
    shipping_address TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_status (status),
    INDEX idx_created (created_at)
);

CREATE TABLE IF NOT EXISTS order_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    product_id INT,
    product_name VARCHAR(255),
    quantity INT NOT NULL,
    unit_price DECIMAL(10, 2),
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS quotes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    company VARCHAR(255),
    message TEXT,
    status ENUM('new', 'read', 'replied') DEFAULT 'new',
    ip_address VARCHAR(45),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_status (status)
);

CREATE TABLE IF NOT EXISTS contact_messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    subject VARCHAR(255),
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_read (is_read)
);

-- ============================================
-- 10. MAILING SYSTEM
-- ============================================

CREATE TABLE IF NOT EXISTS email_campaigns (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    subject VARCHAR(255) NOT NULL,
    template_id INT NULL,
    content LONGTEXT,
    recipient_list JSON, -- ['all', 'customers', 'subscribers']
    scheduled_at TIMESTAMP NULL,
    sent_at TIMESTAMP NULL,
    status ENUM('draft', 'scheduled', 'sent', 'failed') DEFAULT 'draft',
    open_count INT DEFAULT 0,
    click_count INT DEFAULT 0,
    created_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_status (status)
);

CREATE TABLE IF NOT EXISTS email_templates (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    subject VARCHAR(255),
    html_content LONGTEXT,
    variables JSON, -- Available variables like {{name}}, {{company}}
    created_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);

-- ============================================
-- 11. ANALYTICS
-- ============================================

CREATE TABLE IF NOT EXISTS analytics_daily (
    id INT AUTO_INCREMENT PRIMARY KEY,
    date DATE NOT NULL UNIQUE,
    total_visits INT DEFAULT 0,
    unique_visitors INT DEFAULT 0,
    page_views INT DEFAULT 0,
    bounce_rate DECIMAL(5,2),
    avg_session_duration INT, -- seconds
    top_pages JSON,
    traffic_sources JSON,
    device_breakdown JSON,
    INDEX idx_date (date)
);

CREATE TABLE IF NOT EXISTS page_views (
    id INT AUTO_INCREMENT PRIMARY KEY,
    page_url VARCHAR(500) NOT NULL,
    visitor_id VARCHAR(100), -- Cookie/session ID
    user_id INT NULL,
    referrer VARCHAR(500),
    user_agent TEXT,
    ip_address VARCHAR(45),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_page_url (page_url),
    INDEX idx_created (created_at)
);

-- ============================================
-- 12. LOGGING & SECURITY
-- ============================================

CREATE TABLE IF NOT EXISTS activity_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    action VARCHAR(100) NOT NULL, -- 'login', 'create_order', 'update_page'
    entity_type VARCHAR(50), -- 'page', 'product', 'user'
    entity_id INT,
    details JSON,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_user_action (user_id, action),
    INDEX idx_created (created_at)
);

-- ============================================
-- INITIAL DATA SEEDING
-- ============================================

-- Categories
INSERT INTO categories (name, slug, sort_order) VALUES 
('Endüstriyel Gazlar', 'endustriyel-gazlar', 1),
('Medikal Gazlar', 'medikal-gazlar', 2),
('Özel Gazlar', 'ozel-gazlar', 3),
('Gıda Gazları', 'gida-gazlari', 4),
('Kaynak Gazları', 'kaynak-gazlari', 5);

-- Default Site Settings
INSERT INTO site_settings (setting_group, setting_key, setting_value, setting_type) VALUES
('general', 'site_name', 'Federal Gaz', 'text'),
('general', 'site_tagline', 'Güvenilir Enerji Çözümleri', 'text'),
('general', 'contact_email', 'info@federalgaz.com', 'text'),
('general', 'contact_phone', '+90 (212) 000 00 00', 'text'),
('branding', 'primary_color', '#b13329', 'color'),
('branding', 'secondary_color', '#f4b834', 'color'),
('branding', 'dark_color', '#292828', 'color'),
('seo', 'meta_description', 'Endüstriyel gaz ihtiyaçlarınız için yenilikçi, sürdürülebilir ve kaliteli hizmetler sunuyoruz.', 'text'),
('seo', 'meta_keywords', 'endüstriyel gaz, medikal gaz, federal gaz', 'text');

-- Default Header Menu
INSERT INTO menus (menu_location, title, url, sort_order, is_active) VALUES
('header', 'Ana Sayfa', '/', 1, TRUE),
('header', 'Hakkımızda', '/hakkimizda', 2, TRUE),
('header', 'Hizmetlerimiz', '/hizmetler', 3, TRUE),
('header', 'Ürünler', '/urunler', 4, TRUE),
('header', 'İletişim', '/iletisim', 5, TRUE);
