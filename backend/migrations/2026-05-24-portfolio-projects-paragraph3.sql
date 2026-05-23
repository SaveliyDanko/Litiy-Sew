-- Adds optional paragraph3 to portfolio_projects (Избранные проекты — карточка).
-- Run on VPS BEFORE deploying the new backend. Idempotent — safe to re-run.

ALTER TABLE portfolio_projects ADD COLUMN IF NOT EXISTS paragraph3 TEXT;
