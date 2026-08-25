import 'dotenv/config';

export const env = {
  DATABASE_URL: process.env.DATABASE_URL,
  INGEST_API_KEY: process.env.INGEST_API_KEY,
  PORT: Number(process.env.PORT ?? 3000)
};
