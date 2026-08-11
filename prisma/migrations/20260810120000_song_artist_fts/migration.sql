CREATE EXTENSION IF NOT EXISTS unaccent;

-- Neon/index builds need the one-arg form; unaccent(regdictionary, text)
-- does not resolve reliably during SQL-function inlining for GIN indexes.
CREATE OR REPLACE FUNCTION immutable_unaccent(text)
RETURNS text LANGUAGE sql IMMUTABLE PARALLEL SAFE AS $$
  SELECT public.unaccent($1);
$$;

CREATE INDEX song_title_fts_idx ON "Song"
  USING GIN (to_tsvector('portuguese', immutable_unaccent(title)));

CREATE INDEX artist_name_fts_idx ON "Artist"
  USING GIN (to_tsvector('portuguese', immutable_unaccent(name::text)));
