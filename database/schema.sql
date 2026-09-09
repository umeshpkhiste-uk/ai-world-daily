CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE users (id UUID PRIMARY KEY DEFAULT uuid_generate_v4(), name TEXT, email TEXT UNIQUE, created_at TIMESTAMPTZ NOT NULL DEFAULT now());
CREATE TABLE news (id UUID PRIMARY KEY DEFAULT uuid_generate_v4(), title TEXT NOT NULL, summary TEXT NOT NULL, category TEXT NOT NULL, source_name TEXT NOT NULL, source_url TEXT NOT NULL UNIQUE, published_at TIMESTAMPTZ NOT NULL, image_url TEXT, importance_score NUMERIC NOT NULL DEFAULT 0, created_at TIMESTAMPTZ NOT NULL DEFAULT now());
CREATE INDEX news_rank_idx ON news (importance_score DESC, published_at DESC);
CREATE TABLE company_updates (id UUID PRIMARY KEY DEFAULT uuid_generate_v4(), company_name TEXT NOT NULL, update_text TEXT NOT NULL, source_name TEXT NOT NULL, source_url TEXT NOT NULL, published_at TIMESTAMPTZ NOT NULL);
CREATE TABLE bookmarks (id UUID PRIMARY KEY DEFAULT uuid_generate_v4(), user_id UUID REFERENCES users(id) ON DELETE CASCADE, news_id UUID REFERENCES news(id) ON DELETE CASCADE, created_at TIMESTAMPTZ NOT NULL DEFAULT now(), UNIQUE(user_id, news_id));
CREATE TABLE user_preferences (user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE, interests TEXT[] NOT NULL DEFAULT '{}', theme TEXT NOT NULL DEFAULT 'system', notification_settings TEXT NOT NULL DEFAULT 'disabled');
