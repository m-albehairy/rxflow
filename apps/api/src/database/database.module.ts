import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { SnakeCaseNamingStrategy } from './naming.strategy';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get('database.host', 'localhost'),
        port: config.get('database.port', 5432),
        database: config.get('database.database', 'pharmapos_dev'),
        username: config.get('database.username', 'pharmapos'),
        password: config.get('database.password', 'secret'),
        autoLoadEntities: true,
        synchronize: process.env.NODE_ENV === 'development',
        namingStrategy: new SnakeCaseNamingStrategy(),
        logging: process.env.NODE_ENV === 'development' ? ['query', 'error'] : ['error'],
      }),
    }),
  ],
})
export class DatabaseModule {}
