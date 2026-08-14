const express = require('express');
const router = express.Router();
const db = require('../lib/db');

function generateId() {
    return Math.random().toString(36).substring(2, 15);
}

// GET active casinos (for My List selector)
router.get('/casinos', (req, res) => {
    db.all('SELECT * FROM casinos WHERE is_active = 1', [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// GET user watchlist
router.get('/watchlist', (req, res) => {
    const { userId } = req.query;
    if (!userId) return res.status(400).json({ error: "Missing userId" });

    db.all('SELECT casino_id, notify_email FROM user_watchlist WHERE user_id = ?', [userId], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// POST save user watchlist
router.post('/watchlist', (req, res) => {
    const { userId, casinoIds, notifyEmail } = req.body;
    if (!userId) return res.status(400).json({ error: "Missing userId" });

    // In SQLite, we can just delete old and insert new for simplicity of UPSERT
    db.serialize(() => {
        db.run(`DELETE FROM user_watchlist WHERE user_id = ?`, [userId]);
        
        if (casinoIds && casinoIds.length > 0) {
            const stmt = db.prepare(`INSERT INTO user_watchlist (id, user_id, casino_id, notify_email) VALUES (?, ?, ?, ?)`);
            casinoIds.forEach(cId => {
                stmt.run(generateId(), userId, cId, notifyEmail ? 1 : 0);
            });
            stmt.finalize();
        }
        res.json({ success: true });
    });
});

// GET all active freebies
router.get('/freebies', (req, res) => {
    const query = `
        SELECT f.id, f.claim_url, f.title, f.created_at, c.name as casino_name
        FROM freebies f
        JOIN casinos c ON f.casino_id = c.id
        WHERE c.is_active = 1 AND f.created_at >= datetime('now', '-3 days')
        ORDER BY f.created_at DESC
    `;

    db.all(query, [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// GET filtered feed based on user's watchlist
router.get('/freebies/my-list', (req, res) => {
    const { userId } = req.query;
    if (!userId) return res.status(400).json({ error: "Missing userId" });

    const query = `
        SELECT f.id, f.claim_url, f.title, f.created_at, c.name as casino_name
        FROM freebies f
        JOIN casinos c ON f.casino_id = c.id
        JOIN user_watchlist w ON w.casino_id = c.id
        WHERE w.user_id = ? AND c.is_active = 1 AND f.created_at >= datetime('now', '-3 days')
        ORDER BY f.created_at DESC
    `;

    db.all(query, [userId], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// GET site setting for top-sites date
router.get('/settings/top-sites-date', (req, res) => {
    db.get("SELECT value FROM site_settings WHERE key = 'top_sites_last_updated'", [], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ value: row ? row.value : 'August 2026' });
    });
});

module.exports = router;
