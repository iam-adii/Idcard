-- Migration: Add employee_name and designation columns to id_cards table
-- Run this in your Supabase SQL Editor

-- Add employee_name column (nullable to maintain backward compatibility)
ALTER TABLE id_cards
ADD COLUMN IF NOT EXISTS employee_name TEXT;

-- Add designation column (nullable to maintain backward compatibility)
ALTER TABLE id_cards
ADD COLUMN IF NOT EXISTS designation TEXT;

-- Optional: Add comments to document the columns
COMMENT ON COLUMN id_cards.employee_name IS 'Full name of the employee';
COMMENT ON COLUMN id_cards.designation IS 'Job title or designation of the employee';
