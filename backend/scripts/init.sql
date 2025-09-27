-- News Summary Agent Database Initialization Script
-- This script sets up the initial database schema and sample data

-- Create database if it doesn't exist (handled by Docker)
-- This file runs automatically when the PostgreSQL container starts

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create indexes for better performance
-- (Tables are created by SQLAlchemy models, so we just add indexes here)

-- Indexes will be created after tables exist
-- These will be added via Alembic migrations in actual implementation

-- Sample data for development
-- This will be populated by the RSS ingestion service

-- Log database initialization
INSERT INTO public."user_preferences" (user_id, preferences, interaction_history, created_at, updated_at)
VALUES (
    'system',
    '{"initialized": true, "version": "1.0"}',
    '[{"action": "database_init", "timestamp": "' || NOW() || '"}]',
    NOW(),
    NOW()
) ON CONFLICT (user_id) DO NOTHING;

-- Grant permissions
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO newsuser;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO newsuser;