import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { databaseConfig, jwtConfig } from './config';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './modules/auth/auth.module';
import { SetupModule } from './modules/setup/setup.module';
import { SettingsModule } from './modules/settings/settings.module';
import { ProductsModule } from './modules/products/products.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { InventoryModule } from './modules/inventory/inventory.module';
import { SuppliersModule } from './modules/suppliers/suppliers.module';
import { PurchasesModule } from './modules/purchases/purchases.module';
import { SalesModule } from './modules/sales/sales.module';
import { CustomersModule } from './modules/customers/customers.module';
import { CreditModule } from './modules/credit/credit.module';
import { UsersModule } from './modules/users/users.module';
import { RolesModule } from './modules/roles/roles.module';
import { RulesModule } from './modules/rules/rules.module';
import { AuditModule } from './modules/audit/audit.module';
import { ShiftsModule } from './modules/shifts/shifts.module';
import { ReportsModule } from './modules/reports/reports.module';
import { SharedModule } from './shared/shared.module';
import { HealthModule } from './modules/health/health.module';
import { ExpensesModule } from './modules/expenses/expenses.module';
import { BranchesModule } from './modules/branches/branches.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { MedicalServicesModule } from './modules/medical-services/medical-services.module';
import { ScheduleModule } from '@nestjs/schedule';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { JwtAuthGuard } from './common/guards/jwt.guard';
import { PermissionsGuard } from './common/guards/permissions.guard';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, load: [databaseConfig, jwtConfig] }),
    DatabaseModule,
    SharedModule,
    HealthModule,
    AuthModule,
    SetupModule,
    SettingsModule,
    ProductsModule,
    CategoriesModule,
    InventoryModule,
    SuppliersModule,
    PurchasesModule,
    SalesModule,
    CustomersModule,
    CreditModule,
    UsersModule,
    RolesModule,
    RulesModule,
    AuditModule,
    ShiftsModule,
    ReportsModule,
    ExpensesModule,
    BranchesModule,
    NotificationsModule,
    MedicalServicesModule,
    ScheduleModule.forRoot(),
    EventEmitterModule.forRoot(),
  ],
  providers: [
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: PermissionsGuard },
  ],
})
export class AppModule {}
