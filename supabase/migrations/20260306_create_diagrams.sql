CREATE TABLE diagrams (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id  uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  type        text NOT NULL DEFAULT 'system-design',
  data        jsonb,
  created_at  timestamptz DEFAULT now(),
  updated_at  timestamptz DEFAULT now(),
  UNIQUE(project_id, type)
);

ALTER TABLE diagrams ENABLE ROW LEVEL SECURITY;

CREATE POLICY "owner_all" ON diagrams
  USING  (project_id IN (SELECT id FROM projects WHERE owner_id = auth.uid()))
  WITH CHECK (project_id IN (SELECT id FROM projects WHERE owner_id = auth.uid()));
