import { DataSource } from 'typeorm';
import { SnakeCaseNamingStrategy } from './naming.strategy';
import * as dotenv from 'dotenv';

dotenv.config();

export default new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  database: process.env.DB_NAME || 'pharmapos_dev',
  username: process.env.DB_USER || 'pharmapos',
  password: process.env.DB_PASS || 'secret',
  entities: ['src/**/*.entity.ts'],
  migrations: ['src/database/migrations/*.ts'],
  namingStrategy: new SnakeCaseNamingStrategy(),
  synchronize: false,
  logging: true,
});
