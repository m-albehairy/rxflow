import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SetupController } from './controllers/setup.controller';
import { SetupService } from './services/setup.service';
import { Setting } from '../../database/entities/setting.entity';
import { Role } from '../../database/entities/role.entity';
import { User } from '../../database/entities/user.entity';
import { Rule } from '../../database/entities/rule.entity';
import { Category } from '../../database/entities/category.entity';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([Setting, Role, User, Rule, Category]), AuthModule],
  controllers: [SetupController],
  providers: [SetupService],
})
export class SetupModule {}
