import { createClient, RedisClientType } from 'redis';
import { RpcException } from '@nestjs/microservices';

type AuthResult = {
  userGuid: string;
  role: string;
};

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';
const REDIS_USERNAME = process.env.REDIS_USERNAME || '';
const REDIS_PASSWORD = process.env.REDIS_PASSWORD || '';

const AUTH_KEY_PREFIX = 'auth';

const getAuthPattern = (token: string) => {
  return `${AUTH_KEY_PREFIX}:*:${token}`;
};

const getAuthKey = (guid: string, token: string) => {
  return `${AUTH_KEY_PREFIX}:${guid}:${token}`;
};

export class RedisCache {
  client: RedisClientType;

  async connect() {
    console.log(REDIS_URL, REDIS_USERNAME, REDIS_PASSWORD);
    this.client = createClient({
      url: REDIS_URL,
      username: REDIS_USERNAME,
      password: REDIS_PASSWORD,
      database: 0,
      socket: {
        tls: false,
      },
    });

    this.client.on('error', (error) => {
      console.log('redis error', error);
    });

    this.client.on('connect', () => {
      console.log('redis connected');
    });

    await this.client.connect();
  }

  async set(key: string, value: string): Promise<void> {
    await this.client.set(key, value);
  }

  async get(key: string): Promise<string> {
    return await this.client.get(key);
  }

  async getKeys(keyPattern: string): Promise<string[]> {
    return await this.client.keys(keyPattern);
  }

  async saveAuth(userGuid: string, token: string, data: string) {
    const authKey = getAuthKey(userGuid, token);
    await this.set(authKey, data);
  }

  async getAuthKeys(token: string) {
    const authKeyPattern = getAuthPattern(token);
    return await this.getKeys(authKeyPattern);
  }

  async getAuth(key: string): Promise<AuthResult> {
    try {
      const authData = await this.get(key);
      return JSON.parse(authData);
    } catch (e) {
      throw new RpcException(e);
    }
  }
}

const redisCache = new RedisCache();

export default redisCache;
