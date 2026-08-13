const express = require('express');
const cors = require('cors');
const path = require('path');
const db = require('./src/lib/db');

const adminRoutes = require('./src/routes/adminRoutes');
const userRoutes = require('./src/routes/userRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from the root directory (where the HTML files are)
app.use(express.static(path.join(__dirname)));

// API Routes
app.use('/api/admin', adminRoutes);
app.use('/api', userRoutes);

// Fallback to index.html for unknown routes (SPA fallback if needed, but since it's multi-page we can just send 404 or index)
app.use((req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
    // Initialize DB tables
    db.serialize(() => {
        // Local SQLite schema for fallback
        db.run(`
            CREATE TABLE IF NOT EXISTS casinos (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                description TEXT,
                show_on_top_sites INTEGER DEFAULT 0,
                referral_url TEXT,
                welcome_bonus TEXT,
                rating REAL DEFAULT 5.0,
                is_active INTEGER DEFAULT 1,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);
        db.run(`
            CREATE TABLE IF NOT EXISTS freebies (
                id TEXT PRIMARY KEY,
                casino_id TEXT NOT NULL,
                claim_url TEXT NOT NULL,
                title TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (casino_id) REFERENCES casinos(id) ON DELETE CASCADE
            )
        `);
        db.run(`
            CREATE TABLE IF NOT EXISTS user_watchlist (
                id TEXT PRIMARY KEY,
                user_id TEXT NOT NULL,
                casino_id TEXT NOT NULL,
                notify_email INTEGER DEFAULT 1,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (casino_id) REFERENCES casinos(id) ON DELETE CASCADE,
                UNIQUE(user_id, casino_id)
            )
        `);
        db.run(`
            CREATE TABLE IF NOT EXISTS site_settings (
                key TEXT PRIMARY KEY,
                value TEXT
            )
        `);
        db.run(`INSERT OR IGNORE INTO site_settings (key, value) VALUES ('top_sites_last_updated', 'August 2026')`);
    });
});
