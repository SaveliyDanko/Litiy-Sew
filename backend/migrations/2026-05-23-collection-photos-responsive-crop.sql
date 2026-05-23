-- Add per-breakpoint crop fields (mobile + tablet) to dynamic_collection_photos.
-- Hibernate's ddl-auto: update does NOT add columns to tables that already have data on prod,
-- so this must be run manually on the VPS BEFORE deploying the new backend.
--
-- Run on VPS:
--   sudo -u litiy-sew docker compose -f /opt/litiy-sew/docker-compose.yml \
--     exec postgres psql -U postgres -d litiy_sew \
--     -f /opt/litiy-sew/backend/migrations/2026-05-23-collection-photos-responsive-crop.sql
--
-- Or paste the statements directly via psql. All are idempotent.

ALTER TABLE dynamic_collection_photos ADD COLUMN IF NOT EXISTS position_x_mobile INTEGER NOT NULL DEFAULT 50;
ALTER TABLE dynamic_collection_photos ADD COLUMN IF NOT EXISTS position_y_mobile INTEGER NOT NULL DEFAULT 50;
ALTER TABLE dynamic_collection_photos ADD COLUMN IF NOT EXISTS scale_mobile      INTEGER NOT NULL DEFAULT 100;
ALTER TABLE dynamic_collection_photos ADD COLUMN IF NOT EXISTS position_x_tablet INTEGER NOT NULL DEFAULT 50;
ALTER TABLE dynamic_collection_photos ADD COLUMN IF NOT EXISTS position_y_tablet INTEGER NOT NULL DEFAULT 50;
ALTER TABLE dynamic_collection_photos ADD COLUMN IF NOT EXISTS scale_tablet      INTEGER NOT NULL DEFAULT 100;

-- Backfill: copy existing desktop crop values into the new breakpoint columns
-- so that existing photos render identically on all sizes until an admin tweaks them.
UPDATE dynamic_collection_photos SET position_x_mobile = position_x WHERE position_x_mobile = 50 AND position_x <> 50;
UPDATE dynamic_collection_photos SET position_y_mobile = position_y WHERE position_y_mobile = 50 AND position_y <> 50;
UPDATE dynamic_collection_photos SET scale_mobile      = scale      WHERE scale_mobile      = 100 AND scale      <> 100;
UPDATE dynamic_collection_photos SET position_x_tablet = position_x WHERE position_x_tablet = 50 AND position_x <> 50;
UPDATE dynamic_collection_photos SET position_y_tablet = position_y WHERE position_y_tablet = 50 AND position_y <> 50;
UPDATE dynamic_collection_photos SET scale_tablet      = scale      WHERE scale_tablet      = 100 AND scale      <> 100;
