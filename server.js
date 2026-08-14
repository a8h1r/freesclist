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

        // Database auto-cleanup task: Delete freebies older than 3 days
        db.run(`DELETE FROM freebies WHERE created_at < datetime('now', '-3 days')`, (err) => {
            if (err) console.error("Error cleaning up old freebies", err);
            else console.log("Cleaned up freebies older than 3 days");
        });

        // Auto-seed casinos if empty
        db.get(`SELECT COUNT(*) as count FROM casinos`, (err, row) => {
            if (!err && row && row.count === 0) {
                console.log("Casinos table is empty. Auto-seeding default top sites...");
                const seedCasinos = [
                    { name: 'Stake', referral_url: 'https://stake.us/?c=qfRRRydF', description: 'Stake.us offers around 1 SC every day through its daily reward. Once you\'ve accumulated enough SC to meet the minimum redemption threshold, typically around 30–40 SC, you can request a redemption.\n\nOne of the biggest advantages is that the daily SC doesn\'t require you to play it through before redeeming. You can simply collect your daily rewards, build up your balance, and redeem once you meet the required threshold and other eligibility requirements.' },
                    { name: 'RealPrize', referral_url: 'https://realprize.com/refer/995156', description: 'RealPrize offers around 0.40 SC each day through its daily reward. However, it also frequently sends out email promotions, which can add another 1 SC or more depending on the promotion.\n\nRealPrize also runs free spin promotions, giving you additional opportunities to win SC without making a purchase. Some of these promotions can even have prizes of up to 50 SC. I\'ve personally hit the 50 SC jackpot several times, making these promotions worth checking regularly.' },
                    { name: 'CrownCoinsCasino', referral_url: 'https://crowncoinscasino.com/?utm_campaign=6709c517-3553-4483-9486-8586d06db5c8&utm_source=friends', description: 'CrownCoins Casino offers around 1 SC per day through its daily rewards. In addition to the daily login bonus, CrownCoins may also send email promotions that can provide around 1 SC every 1–2 days.\n\nThat means there can be multiple opportunities to collect free SC throughout the week. Make sure to check both the casino and your email regularly so you don\'t miss any available promotions.' },
                    { name: 'LoneStar', referral_url: 'https://lonestarcasino.com/refer/1159320', description: 'LoneStar Casino is similar to RealPrize and is owned by the same company, so you\'ll notice a lot of similarities between the two platforms.\n\nIt offers daily rewards along with additional promotional opportunities through email offers and free spin promotions. If you\'re already checking RealPrize regularly, it\'s worth adding LoneStar to your daily routine as well so you don\'t miss any of the extra SC opportunities.' },
                    { name: 'ZulaCasino', referral_url: 'https://www.zulacasino.com/signup/ca8a8054-e64f-4c39-a32d-685109449b06', description: 'Zula Casino offers around 1 SC each day through its daily reward. You can continue collecting your free SC until you reach the minimum redemption threshold of 50 SC.' },
                    { name: 'Pulsz', referral_url: 'https://www.pulsz.com/?invited_by=z1q1re', description: 'Pulsz offers daily rewards that average around 0.70 SC per day, giving you another easy way to build up your balance over time.\n\nPulsz also has a weekly spinner available from Friday through Sunday, where you can spin for additional rewards, including SC and free spins. I recommend checking in during the weekend so you don\'t miss the weekly spinner.' }
                ];
                function generateId() { return Math.random().toString(36).substring(2, 15); }
                const stmt = db.prepare(`INSERT INTO casinos (id, name, description, show_on_top_sites, referral_url) VALUES (?, ?, ?, 1, ?)`);
                seedCasinos.forEach(c => {
                    stmt.run(generateId(), c.name, c.description, c.referral_url);
                });
                stmt.finalize();
            }
        });
    });
});
