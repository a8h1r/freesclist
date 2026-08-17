-- Complete PostgreSQL / Supabase Setup Script for FreeSCList
-- Paste and run this script in your Supabase SQL Editor (https://supabase.com/dashboard/project/_/sql)

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Casinos Table
CREATE TABLE IF NOT EXISTS casinos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    show_on_top_sites BOOLEAN DEFAULT FALSE,
    referral_url TEXT,
    welcome_bonus TEXT,
    rating NUMERIC(3, 1) DEFAULT 5.0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Freebies (Daily Drops) Table
CREATE TABLE IF NOT EXISTS freebies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    casino_id UUID NOT NULL REFERENCES casinos(id) ON DELETE CASCADE,
    claim_url TEXT NOT NULL,
    title VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index for fast feed queries (sort by newest)
CREATE INDEX IF NOT EXISTS idx_freebies_casino_created ON freebies(casino_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_freebies_created ON freebies(created_at DESC);

-- 3. User Watchlist Table
CREATE TABLE IF NOT EXISTS user_watchlist (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id VARCHAR(255) NOT NULL,
    casino_id UUID NOT NULL REFERENCES casinos(id) ON DELETE CASCADE,
    notify_email BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, casino_id)
);

-- Index for looking up a user's watchlist quickly
CREATE INDEX IF NOT EXISTS idx_watchlist_user ON user_watchlist(user_id);

-- 4. Site Settings Table
CREATE TABLE IF NOT EXISTS site_settings (
    key VARCHAR(255) PRIMARY KEY,
    value TEXT
);

INSERT INTO site_settings (key, value) VALUES ('top_sites_last_updated', 'August 2026') ON CONFLICT DO NOTHING;

-- Row Level Security (RLS) Configuration
ALTER TABLE casinos ENABLE ROW LEVEL SECURITY;
ALTER TABLE freebies ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_watchlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

-- Allow Public Read Access
CREATE POLICY "Allow public read access on casinos" ON casinos FOR SELECT USING (true);
CREATE POLICY "Allow public read access on freebies" ON freebies FOR SELECT USING (true);
CREATE POLICY "Allow public read access on user_watchlist" ON user_watchlist FOR SELECT USING (true);
CREATE POLICY "Allow public read access on site_settings" ON site_settings FOR SELECT USING (true);

-- Allow Public Insert/Update/Delete (or service key access for admin)
CREATE POLICY "Allow public insert on user_watchlist" ON user_watchlist FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public delete on user_watchlist" ON user_watchlist FOR DELETE USING (true);

CREATE POLICY "Allow public insert on freebies" ON freebies FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public delete on freebies" ON freebies FOR DELETE USING (true);

CREATE POLICY "Allow public insert on casinos" ON casinos FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on casinos" ON casinos FOR UPDATE USING (true);
CREATE POLICY "Allow public delete on casinos" ON casinos FOR DELETE USING (true);

CREATE POLICY "Allow public update on site_settings" ON site_settings FOR ALL USING (true);

-- Initial Casino Seed Data
INSERT INTO casinos (name, referral_url, description, show_on_top_sites)
SELECT 'Stake', 'https://stake.us/?c=qfRRRydF', 'Stake.us offers around 1 SC every day through its daily reward. Once you''ve accumulated enough SC to meet the minimum redemption threshold, typically around 30–40 SC, you can request a redemption.', true
WHERE NOT EXISTS (SELECT 1 FROM casinos WHERE name = 'Stake');

INSERT INTO casinos (name, referral_url, description, show_on_top_sites)
SELECT 'RealPrize', 'https://realprize.com/refer/995156', 'RealPrize offers around 0.40 SC each day through its daily reward. However, it also frequently sends out email promotions, which can add another 1 SC or more.', true
WHERE NOT EXISTS (SELECT 1 FROM casinos WHERE name = 'RealPrize');

INSERT INTO casinos (name, referral_url, description, show_on_top_sites)
SELECT 'CrownCoinsCasino', 'https://crowncoinscasino.com/?utm_campaign=6709c517-3553-4483-9486-8586d06db5c8&utm_source=friends', 'CrownCoins Casino offers around 1 SC per day through its daily rewards.', true
WHERE NOT EXISTS (SELECT 1 FROM casinos WHERE name = 'CrownCoinsCasino');

INSERT INTO casinos (name, referral_url, description, show_on_top_sites)
SELECT 'LoneStar', 'https://lonestarcasino.com/refer/1159320', 'LoneStar Casino offers daily rewards along with additional promotional opportunities through email offers and free spin promotions.', true
WHERE NOT EXISTS (SELECT 1 FROM casinos WHERE name = 'LoneStar');

INSERT INTO casinos (name, referral_url, description, show_on_top_sites)
SELECT 'ZulaCasino', 'https://www.zulacasino.com/signup/ca8a8054-e64f-4c39-a32d-685109449b06', 'Zula Casino offers around 1 SC each day through its daily reward.', true
WHERE NOT EXISTS (SELECT 1 FROM casinos WHERE name = 'ZulaCasino');

INSERT INTO casinos (name, referral_url, description, show_on_top_sites)
SELECT 'Pulsz', 'https://www.pulsz.com/?invited_by=z1q1re', 'Pulsz offers daily rewards that average around 0.70 SC per day.', true
WHERE NOT EXISTS (SELECT 1 FROM casinos WHERE name = 'Pulsz');
