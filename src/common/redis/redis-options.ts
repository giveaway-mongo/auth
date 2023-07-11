import { RedisOptions, Transport } from '@nestjs/microservices';

const HOST = process.env.REDIS_HOST || 'localhost';
const PORT = process.env.REDIS_PORT || '6379';
const USERNAME = process.env.REDIS_USERNAME || '';
const PASSWORD = process.env.REDIS_PASSWORD || '';

export const getRedisOptions = (): RedisOptions => ({
  transport: Transport.REDIS,
  options: {
    host: HOST,
    port: parseInt(PORT),
    username: USERNAME,
    password: PASSWORD,
  },
});
