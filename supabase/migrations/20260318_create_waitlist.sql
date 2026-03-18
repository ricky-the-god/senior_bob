CREATE TABLE waitlist (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email      text UNIQUE NOT NULL,
  name       text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE waitlist ENABLE ROW LEVEL SECURITY;

-- Anyone can insert (join the waitlist)
CREATE POLICY "public_insert" ON waitlist
  FOR INSERT
  WITH CHECK (true);

-- Only the service role (server-side admin queries) can read
-- Regular authenticated users cannot read the list
CREATE POLICY "no_public_select" ON waitlist
  FOR SELECT
  USING (false);
