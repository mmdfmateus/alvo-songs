CREATE INDEX lyric_chunk_text_fts_idx ON "LyricChunk"
  USING GIN (to_tsvector('portuguese', immutable_unaccent(text)));
