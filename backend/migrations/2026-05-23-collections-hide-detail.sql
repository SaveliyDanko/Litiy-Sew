-- Adds hide_detail flag to dynamic_collections. When TRUE, the DETAIL strip
-- (two side photos + center text) is not rendered on the collection page;
-- all gallery photos go straight into the mosaic.
--
-- Run on VPS BEFORE deploying the new backend (ddl-auto: update does NOT
-- add columns to a populated table). Idempotent — safe to re-run.

ALTER TABLE dynamic_collections ADD COLUMN IF NOT EXISTS hide_detail BOOLEAN NOT NULL DEFAULT FALSE;
