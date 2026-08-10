CREATE EXTENSION IF NOT EXISTS unaccent;

CREATE OR REPLACE FUNCTION immutable_unaccent(text)
RETURNS text LANGUAGE sql IMMUTABLE PARALLEL SAFE AS $$
  SELECT unaccent('unaccent', $1);
$$;

CREATE INDEX song_title_fts_idx ON "Song"
  USING GIN (to_tsvector('portuguese', immutable_unaccent(title)));

CREATE INDEX artist_name_fts_idx ON "Artist"
  USING GIN (to_tsvector('portuguese', immutable_unaccent(name::text)));
