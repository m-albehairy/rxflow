import { registerAs } from '@nestjs/config';

export const databaseConfig = registerAs('database', () => ({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  database: process.env.DB_NAME || 'pharmapos_dev',
  username: process.env.DB_USER || 'pharmapos',
  password: process.env.DB_PASS || 'secret',
}));
