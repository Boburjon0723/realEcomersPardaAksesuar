-- Telegram bot ruxsat jadvali
CREATE TABLE IF NOT EXISTS bot_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name TEXT NOT NULL,
    phone TEXT NOT NULL UNIQUE,
    active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_bot_users_phone ON bot_users (phone);
CREATE INDEX IF NOT EXISTS idx_bot_users_active ON bot_users (active);

ALTER TABLE bot_users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "bot_users_all" ON bot_users;
CREATE POLICY "bot_users_all"
ON bot_users
FOR ALL
USING (true)
WITH CHECK (true);

-- Namuna
INSERT INTO bot_users (full_name, phone, active)
VALUES
    ('Test User', '+998901234567', true)
ON CONFLICT (phone) DO UPDATE
SET
    full_name = EXCLUDED.full_name,
    active = EXCLUDED.active;
