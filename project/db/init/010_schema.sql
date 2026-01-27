-- Drikkevann-inntak (punkt)
CREATE TABLE IF NOT EXISTS water_intakes (
  id bigserial PRIMARY KEY,
  name text,
  source text,
  geom geometry(Point, 4326)
);

CREATE INDEX IF NOT EXISTS water_intakes_gix
  ON water_intakes USING gist (geom);

-- Husstander (for demo: punkt)
CREATE TABLE IF NOT EXISTS households (
  id bigserial PRIMARY KEY,
  address text,
  geom geometry(Point, 4326)
);

CREATE INDEX IF NOT EXISTS households_gix
  ON households USING gist (geom);

-- Forurensingshendelser (punkt + radius i meter)
CREATE TABLE IF NOT EXISTS contamination_events (
  id bigserial PRIMARY KEY,
  created_at timestamptz DEFAULT now(),
  description text,
  radius_m integer NOT NULL DEFAULT 500,
  geom geometry(Point, 4326)
);

CREATE INDEX IF NOT EXISTS contamination_events_gix
  ON contamination_events USING gist (geom);
