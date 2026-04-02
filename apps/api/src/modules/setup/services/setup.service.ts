import { Injectable, BadRequestException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Setting } from '../../../database/entities/setting.entity';
import { Role } from '../../../database/entities/role.entity';
import { User } from '../../../database/entities/user.entity';
import { Rule } from '../../../database/entities/rule.entity';
import { Category } from '../../../database/entities/category.entity';
import { ErrorMessages } from '../../../common/constants/error-messages';
import { RuleType, RuleActionType, BCRYPT_COST_PASSWORD, BCRYPT_COST_PIN } from '@pharmapos/shared';
import { RunSetupDto } from '../dto/run-setup.dto';

@Injectable()
export class SetupService {
  constructor(
    private dataSource: DataSource,
    @InjectRepository(Setting) private settingRepo: Repository<Setting>,
  ) {}

  async isSetupComplete(): Promise<boolean> {
    const setting = await this.settingRepo.findOne({ where: { key: 'SETUP_COMPLETE' } });
    return setting?.value === true;
  }

  async runSetup(dto: RunSetupDto): Promise<{ success: boolean }> {
    const isComplete = await this.isSetupComplete();
    if (isComplete) {
      throw new BadRequestException(ErrorMessages.SETUP_ALREADY_COMPLETE);
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 1. Create settings
      const settings = this.buildSettings(dto);
      for (const s of settings) {
        await queryRunner.manager.save(Setting, s);
      }

      // 2. Seed default roles
      const roles = this.buildDefaultRoles();
      const savedRoles: Record<string, Role> = {};
      for (const role of roles) {
        const saved = await queryRunner.manager.save(Role, role);
        savedRoles[saved.name] = saved;
      }

      // 3. Create admin user
      const passwordHash = await bcrypt.hash(dto.adminPassword, BCRYPT_COST_PASSWORD);
      const pinHash = dto.adminPin ? await bcrypt.hash(dto.adminPin, BCRYPT_COST_PIN) : null;
      await queryRunner.manager.save(User, {
        username: dto.adminUsername,
        passwordHash,
        pinHash,
        fullName: dto.adminFullName,
        fullNameAr: dto.adminFullNameAr || null,
        roleId: savedRoles['Admin'].id,
        isActive: true,
      });

      // 4. Seed default categories
      const categories = this.buildDefaultCategories();
      for (const cat of categories) {
        await queryRunner.manager.save(Category, cat);
      }

      // 5. Seed system rules
      const rules = this.buildSystemRules();
      for (const rule of rules) {
        await queryRunner.manager.save(Rule, rule);
      }

      // 6. Mark setup complete
      await queryRunner.manager.save(Setting, {
        key: 'SETUP_COMPLETE',
        value: true,
        isLocked: true,
        group: 'system',
      });

      await queryRunner.commitTransaction();
      return { success: true };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  private buildSettings(dto: RunSetupDto): Partial<Setting>[] {
    return [
      { key: 'PHARMACY_NAME', value: dto.pharmacyName, group: 'general' },
      { key: 'PHARMACY_NAME_AR', value: dto.pharmacyNameAr || '', group: 'general' },
      { key: 'PHARMACY_ADDRESS', value: dto.pharmacyAddress || '', group: 'general' },
      { key: 'CURRENCY', value: dto.currency || 'EGP', group: 'general' },
      { key: 'CURRENCY_SYMBOL', value: dto.currencySymbol || 'EGP', group: 'general' },
      { key: 'TAX_PERCENT', value: dto.taxPercent ?? 15, group: 'general' },
      { key: 'TAX_LABEL', value: dto.taxLabel || 'VAT', group: 'general' },
      { key: 'COSTING_METHOD', value: 'WEIGHTED_AVERAGE', isLocked: true, group: 'inventory' },
      { key: 'PRICING_MODE', value: dto.pricingMode || 'HYBRID', group: 'pricing' },
      { key: 'DEFAULT_MARGIN', value: dto.defaultMargin ?? 25, group: 'pricing' },
      { key: 'ALLOW_BELOW_COST', value: dto.allowBelowCost || 'BLOCK', group: 'pricing' },
      { key: 'MAX_DISCOUNT_CASHIER', value: dto.maxCashierDiscount ?? 10, group: 'pricing' },
      { key: 'CREDIT_SALES_ENABLED', value: dto.creditSalesEnabled ?? false, group: 'credit' },
      { key: 'DEFAULT_CREDIT_LIMIT', value: dto.defaultCreditLimit ?? 0, group: 'credit' },
      { key: 'CREDIT_APPROVAL_REQUIRED', value: dto.creditApprovalRequired ?? true, group: 'credit' },
      { key: 'PRINTER_TYPE', value: dto.printerType || 'NONE', group: 'hardware' },
      { key: 'PAPER_WIDTH', value: dto.paperWidth ?? 80, group: 'hardware' },
      { key: 'DRAWER_ENABLED', value: dto.drawerEnabled ?? false, group: 'hardware' },
      { key: 'LOW_STOCK_THRESHOLD', value: 10, group: 'stock' },
      { key: 'EXPIRY_ALERT_DAYS', value: 30, group: 'stock' },
      // Printing / Receipt settings
      { key: 'PHARMACY_PHONE', value: '', group: 'general' },
      { key: 'RECEIPT_HEADER', value: '', group: 'printing' },
      { key: 'RECEIPT_HEADER_AR', value: '', group: 'printing' },
      { key: 'RECEIPT_FOOTER', value: 'Thank you for your visit!', group: 'printing' },
      { key: 'RECEIPT_FOOTER_AR', value: 'شكراً لزيارتكم!', group: 'printing' },
      { key: 'RECEIPT_SHOW_LOGO', value: false, group: 'printing' },
      { key: 'RECEIPT_AUTO_PRINT', value: false, group: 'printing' },
      { key: 'RECEIPT_PRINT_COPIES', value: 1, group: 'printing' },
      { key: 'RECEIPT_PAPER_SIZE', value: '80mm', group: 'printing' },
    ];
  }

  private buildDefaultRoles(): Partial<Role>[] {
    return [
      {
        name: 'Admin', nameAr: 'مدير النظام', isSystem: true,
        permissions: {
          canAccessPOS: true, canAccessInventory: true, canAccessReports: true,
          canAccessSettings: true, canEditPrice: true, canSellBelowCost: true,
          canApproveCreditSale: true, canAdjustInventory: true, canViewCost: true,
          canGiveDiscount: true, maxDiscountPercent: 100, canVoidInvoice: true,
          canRefundInvoice: true, canManageUsers: true, canCreatePurchase: true,
        },
      },
      {
        name: 'Manager', nameAr: 'مدير', isSystem: true,
        permissions: {
          canAccessPOS: true, canAccessInventory: true, canAccessReports: true,
          canAccessSettings: false, canEditPrice: true, canSellBelowCost: true,
          canApproveCreditSale: true, canAdjustInventory: true, canViewCost: true,
          canGiveDiscount: true, maxDiscountPercent: 100, canVoidInvoice: true,
          canRefundInvoice: true, canManageUsers: false, canCreatePurchase: true,
        },
      },
      {
        name: 'Pharmacist', nameAr: 'صيدلي', isSystem: true,
        permissions: {
          canAccessPOS: true, canAccessInventory: true, canAccessReports: true,
          canAccessSettings: false, canEditPrice: true, canSellBelowCost: false,
          canApproveCreditSale: false, canAdjustInventory: true, canViewCost: true,
          canGiveDiscount: true, maxDiscountPercent: 30, canVoidInvoice: false,
          canRefundInvoice: true, canManageUsers: false, canCreatePurchase: true,
        },
      },
      {
        name: 'Cashier', nameAr: 'كاشير', isSystem: true,
        permissions: {
          canAccessPOS: true, canAccessInventory: false, canAccessReports: false,
          canAccessSettings: false, canEditPrice: false, canSellBelowCost: false,
          canApproveCreditSale: false, canAdjustInventory: false, canViewCost: false,
          canGiveDiscount: true, maxDiscountPercent: 10, canVoidInvoice: false,
          canRefundInvoice: false, canManageUsers: false, canCreatePurchase: false,
        },
      },
      {
        name: 'Inventory Clerk', nameAr: 'أمين مخزن', isSystem: true,
        permissions: {
          canAccessPOS: false, canAccessInventory: true, canAccessReports: false,
          canAccessSettings: false, canEditPrice: false, canSellBelowCost: false,
          canApproveCreditSale: false, canAdjustInventory: true, canViewCost: true,
          canGiveDiscount: false, maxDiscountPercent: 0, canVoidInvoice: false,
          canRefundInvoice: false, canManageUsers: false, canCreatePurchase: true,
        },
      },
      {
        name: 'Viewer', nameAr: 'مشاهد', isSystem: true,
        permissions: {
          canAccessPOS: false, canAccessInventory: true, canAccessReports: true,
          canAccessSettings: false, canEditPrice: false, canSellBelowCost: false,
          canApproveCreditSale: false, canAdjustInventory: false, canViewCost: false,
          canGiveDiscount: false, maxDiscountPercent: 0, canVoidInvoice: false,
          canRefundInvoice: false, canManageUsers: false, canCreatePurchase: false,
        },
      },
    ];
  }

  private buildDefaultCategories(): Partial<Category>[] {
    return [
      { nameEn: 'Pain Relief', nameAr: 'مسكنات', color: '#EF4444', sortOrder: 1, isActive: true },
      { nameEn: 'Antibiotics', nameAr: 'مضادات حيوية', color: '#3B82F6', sortOrder: 2, isActive: true },
      { nameEn: 'Vitamins & Supplements', nameAr: 'فيتامينات ومكملات', color: '#22C55E', sortOrder: 3, isActive: true },
      { nameEn: 'Skin Care', nameAr: 'العناية بالبشرة', color: '#A855F7', sortOrder: 4, isActive: true },
      { nameEn: 'Baby Care', nameAr: 'رعاية الأطفال', color: '#F59E0B', sortOrder: 5, isActive: true },
      { nameEn: 'Medical Devices', nameAr: 'أجهزة طبية', color: '#6366F1', sortOrder: 6, isActive: true },
      { nameEn: 'Other', nameAr: 'أخرى', color: '#6B7280', sortOrder: 99, isActive: true },
    ];
  }

  private buildSystemRules(): Partial<Rule>[] {
    return [
      {
        name: 'No negative stock', nameAr: 'منع البيع بدون رصيد', type: RuleType.SALE,
        condition: { op: 'LTE', field: 'item.stockAvailable', value: 0 },
        action: { type: RuleActionType.BLOCK, message: 'Product is out of stock', messageAr: 'المنتج غير متوفر' },
        priority: 100, isActive: true, isSystem: true,
      },
      {
        name: 'No expired product', nameAr: 'منع بيع المنتهي', type: RuleType.SALE,
        condition: { op: 'EQ', field: 'item.batchExpired', value: true },
        action: { type: RuleActionType.BLOCK, message: 'Product batch has expired', messageAr: 'دفعة المنتج منتهية الصلاحية' },
        priority: 99, isActive: true, isSystem: true,
      },
      {
        name: 'No negative price', nameAr: 'منع السعر السالب', type: RuleType.SALE,
        condition: { op: 'LT', field: 'item.sellingPrice', value: 0 },
        action: { type: RuleActionType.BLOCK, message: 'Selling price cannot be negative', messageAr: 'سعر البيع لا يمكن أن يكون سالباً' },
        priority: 98, isActive: true, isSystem: true,
      },
      {
        name: 'Credit limit check', nameAr: 'فحص حد الائتمان', type: RuleType.CREDIT,
        condition: { op: 'GT', field: 'newBalance', value: 0, conditions: [{ op: 'GT', field: 'newBalance', value: 0 }] },
        action: { type: RuleActionType.BLOCK, message: 'Credit limit exceeded', messageAr: 'تم تجاوز حد الائتمان' },
        priority: 97, isActive: true, isSystem: true,
      },
    ];
  }
}
