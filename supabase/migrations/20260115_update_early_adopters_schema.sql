-- Migration to update early_adopters schema to match new frontend form
-- Add new fields
ALTER TABLE early_adopters ADD COLUMN IF NOT EXISTS full_name TEXT;
ALTER TABLE early_adopters ADD COLUMN IF NOT EXISTS niche TEXT;
ALTER TABLE early_adopters ADD COLUMN IF NOT EXISTS registration_reason TEXT;

-- Remove constraints from old fields that are no longer used in the simplified form
ALTER TABLE early_adopters ALTER COLUMN role DROP NOT NULL;
ALTER TABLE early_adopters ALTER COLUMN biggest_challenge DROP NOT NULL;
ALTER TABLE early_adopters ALTER COLUMN position DROP NOT NULL;

-- Drop check constraints if they interfere (optional, but safer to leave nullable columns with checks if they are just unused)
-- ALTER TABLE early_adopters DROP CONSTRAINT IF EXISTS early_adopters_role_check;
-- ALTER TABLE early_adopters DROP CONSTRAINT IF EXISTS early_adopters_biggest_challenge_check;
