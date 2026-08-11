process.env.DATABASE_URL ??=
  "postgresql://postgres:alvo_dev@localhost:5432/alvo_songs";
process.env.DATABASE_URL_UNPOOLED ??= process.env.DATABASE_URL;
