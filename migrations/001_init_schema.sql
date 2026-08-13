-- PostgreSQL / Supabase Schema for FreeSCList
-- Run this script in your database SQL Editor to initialize the tables.

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
