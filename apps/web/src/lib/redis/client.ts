import Redis from 'ioredis';

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

declare global {
  // eslint-disable-next-line no-var
  var __redisClient: Redis | undefined;
}

const redis: Redis = globalThis.__redisClient ?? new Redis(REDIS_URL, {
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
  lazyConnect: true,
});

if (process.env.NODE_ENV !== 'production') {
  globalThis.__redisClient = redis;
}

export default redis;
