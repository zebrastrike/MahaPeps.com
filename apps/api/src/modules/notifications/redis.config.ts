import { URL } from 'url';

export const buildRedisConfig = () => {
  const redisUrl = process.env.REDIS_URL;
  if (!redisUrl) {
    throw new Error('REDIS_URL environment variable is required');
  }

  const parsed = new URL(redisUrl);
  const port = parsed.port ? parseInt(parsed.port, 10) : 6379;
  const db = parsed.pathname ? parseInt(parsed.pathname.replace('/', ''), 10) : 0;

  return {
    host: parsed.hostname,
    port,
    password: parsed.password || undefined,
    db: Number.isNaN(db) ? 0 : db,
    tls: parsed.protocol === 'rediss:' ? {} : undefined,
  };
};
