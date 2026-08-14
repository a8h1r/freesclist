const express = require('express');
const router = express.Router();
const db = require('../lib/db');
const { sanitizeUrl } = require('../lib/urlHygiene');
const { sendBatchEmailAlerts } = require('../lib/emailService');

function generateId() {
    return Math.random().toString(36).substring(2, 15);
}

const ADMIN_PASSCODE = process.env.ADMIN_PASSCODE || 'FreeSC!Admin#2026';

// Admin Auth Middleware
router.use((req, res, next) => {
    const adminKey = req.headers['x-admin-key'];
    if (adminKey !== ADMIN_PASSCODE) {
        return res.status(401).json({ error: 'Unauthorized: Invalid Admin Passcode' });
    }
    next();
});

// GET all casinos (for directory manager)
router.get('/casinos', (req, res) => {
    db.all('SELECT * FROM casinos', [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// POST create new casino
router.post('/casinos', (req, res) => {
    const { name, description, show_on_top_sites, referral_url, welcome_bonus, rating } = req.body;
    const id = generateId();
    db.run(
        `INSERT INTO casinos (id, name, description, show_on_top_sites, referral_url, welcome_bonus, rating) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [id, name, description, show_on_top_sites ? 1 : 0, referral_url, welcome_bonus, rating || 5.0],
        function(err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ id, name, is_active: 1 });
        }
    );
});

// PATCH toggle casino active state (soft delete)
router.patch('/casinos/:id/toggle', (req, res) => {
    const { id } = req.params;
    const { is_active } = req.body; // 1 or 0
    db.run(
        `UPDATE casinos SET is_active = ? WHERE id = ?`,
        [is_active ? 1 : 0, id],
        function(err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ success: true, is_active: is_active ? 1 : 0 });
        }
    );
});

// POST publish freebie
router.post('/freebies', (req, res) => {
    const { casino_id, claim_url, title } = req.body;
    
    let cleanUrl;
    try {
        cleanUrl = sanitizeUrl(claim_url);
    } catch (e) {
        return res.status(400).json({ error: e.message });
    }

    const freebieId = generateId();

    db.run(
        `INSERT INTO freebies (id, casino_id, claim_url, title) VALUES (?, ?, ?, ?)`,
        [freebieId, casino_id, cleanUrl, title],
        function(err) {
            if (err) return res.status(500).json({ error: err.message });

            // Trigger Email Alerts
            db.all(
                `SELECT user_id FROM user_watchlist WHERE casino_id = ? AND notify_email = 1`,
                [casino_id],
                (err, rows) => {
                    if (!err && rows.length > 0) {
                        const userIds = rows.map(r => r.user_id);
                        db.get(`SELECT name FROM casinos WHERE id = ?`, [casino_id], (err, casino) => {
                            if (!err && casino) {
                                sendBatchEmailAlerts(casino.name, title, cleanUrl, userIds);
                            }
                        });
                    }
                }
            );

            res.json({ success: true, id: freebieId, claim_url: cleanUrl });
        }
    );
});

// POST update top sites last updated date
router.post('/settings/top-sites-date', (req, res) => {
    const { value } = req.body;
    db.run(
        `INSERT INTO site_settings (key, value) VALUES ('top_sites_last_updated', ?) ON CONFLICT(key) DO UPDATE SET value = ?`,
        [value, value],
        function(err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ success: true, value });
        }
    );
});

module.exports = router;
