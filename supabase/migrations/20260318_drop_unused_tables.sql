-- Drop tables that are no longer referenced in the codebase.
-- canvases was replaced by diagrams for system design.
-- teams and team_members were removed when the product pivoted to solo-founder focus.

DROP TABLE IF EXISTS team_members;
DROP TABLE IF EXISTS teams;
DROP TABLE IF EXISTS canvases;
