-- Create database schema for Sahel Financial System
-- Database: SQLite for Cloudflare D1

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'user')),
    title TEXT,
    avatar TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Revenues table
CREATE TABLE IF NOT EXISTS revenues (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    amount DECIMAL(10,2) NOT NULL,
    date DATE NOT NULL,
    description TEXT,
    category TEXT NOT NULL,
    user_id INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Expenses table
CREATE TABLE IF NOT EXISTS expenses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    amount DECIMAL(10,2) NOT NULL,
    date DATE NOT NULL,
    description TEXT,
    category TEXT NOT NULL,
    user_id INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Bonus rules table
CREATE TABLE IF NOT EXISTS bonus_rules (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    conditions TEXT NOT NULL, -- JSON string for conditions
    amount DECIMAL(10,2) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Bonus payments table
CREATE TABLE IF NOT EXISTS bonus_payments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    date DATE NOT NULL,
    bonus_rule_id INTEGER,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'cancelled')),
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (bonus_rule_id) REFERENCES bonus_rules(id) ON DELETE SET NULL
);

-- Requests table
CREATE TABLE IF NOT EXISTS requests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    user_id INTEGER NOT NULL,
    admin_notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Product requests table
CREATE TABLE IF NOT EXISTS product_requests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    unit_price DECIMAL(10,2),
    total_price DECIMAL(10,2),
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'ordered', 'delivered')),
    user_id INTEGER NOT NULL,
    admin_notes TEXT,
    rejection_reason TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_revenues_date ON revenues(date);
CREATE INDEX IF NOT EXISTS idx_revenues_user ON revenues(user_id);
CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses(date);
CREATE INDEX IF NOT EXISTS idx_expenses_user ON expenses(user_id);
CREATE INDEX IF NOT EXISTS idx_requests_status ON requests(status);
CREATE INDEX IF NOT EXISTS idx_requests_user ON requests(user_id);
CREATE INDEX IF NOT EXISTS idx_product_requests_status ON product_requests(status);
CREATE INDEX IF NOT EXISTS idx_product_requests_user ON product_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_bonus_payments_user ON bonus_payments(user_id);
CREATE INDEX IF NOT EXISTS idx_bonus_payments_status ON bonus_payments(status);

-- Insert default admin user (password: admin123)
INSERT OR IGNORE INTO users (name, email, password, role, title) 
VALUES ('مدير النظام', 'admin@sahel.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin', 'مدير النظام');

-- Insert default bonus rules
INSERT OR IGNORE INTO bonus_rules (name, description, conditions, amount) VALUES 
('مكافأة الإنتاجية', 'مكافأة شهريه للإنتاجية العالية', '{"min_revenue": 10000, "period": "monthly"}', 1000.00),
('مكافأة الولاء', 'مكافأة سنوية للولاء', '{"years_of_service": 1, "period": "yearly"}', 500.00),
('مكافأة التفوق', 'مكافأة للتفوق في العمل', '{"achievement": "excellent", "period": "quarterly"}', 750.00);

-- Insert sample data for testing
INSERT OR IGNORE INTO users (name, email, password, role, title) 
VALUES ('موظف تجريبي', 'user@sahel.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'user', 'موظف');

-- Sample revenues
INSERT OR IGNORE INTO revenues (amount, date, description, category, user_id) 
VALUES 
(5000.00, '2024-01-15', 'إيرادات شهر يناير', 'مبيعات', 1),
(7500.00, '2024-02-15', 'إيرادات شهر فبراير', 'مبيعات', 1),
(6000.00, '2024-03-15', 'إيرادات شهر مارس', 'مبيعات', 1);

-- Sample expenses
INSERT OR IGNORE INTO expenses (amount, date, description, category, user_id) 
VALUES 
(2000.00, '2024-01-20', 'مصروفات تشغيلية', 'تشغيل', 1),
(1500.00, '2024-02-20', 'مصروفات تسويق', 'تسويق', 1),
(1800.00, '2024-03-20', 'مصروفات إدارية', 'إداري', 1);

-- Sample requests
INSERT OR IGNORE INTO requests (title, description, status, priority, user_id) 
VALUES 
('طلب إجازة', 'طلب إجازة لمدة أسبوع', 'approved', 'medium', 2),
('طلب صيانة', 'طلب صيانة الجهاز', 'pending', 'high', 2),
('طلب تدريب', 'طلب دورة تدريبية', 'rejected', 'low', 2);

-- Sample product requests
INSERT OR IGNORE INTO product_requests (title, description, quantity, unit_price, total_price, status, user_id) 
VALUES 
('طلب أجهزة كمبيوتر', 'جهاز كمبيوتر محمول جديد', 2, 2500.00, 5000.00, 'pending', 2),
('طلب طابعات', 'طابعة ليزر', 1, 800.00, 800.00, 'approved', 2),
('طلب أثاث', 'كراسي مكتبية', 5, 200.00, 1000.00, 'delivered', 2);