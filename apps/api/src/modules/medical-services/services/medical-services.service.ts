import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, IsNull } from 'typeorm';
import Decimal from 'decimal.js';
import { MedicalService } from '../../../database/entities/medical-service.entity';
import { ServiceMaterial } from '../../../database/entities/service-material.entity';
import { Inventory } from '../../../database/entities/inventory.entity';
import { AuditService } from '../../../shared/audit/audit.service';
import { AuditAction, ServiceType, ServicePricingMode, DEFAULT_PAGE, DEFAULT_LIMIT, MAX_LIMIT } from '@pharmapos/shared';
import { CreateServiceDto, ServiceMaterialDto } from '../dto/create-service.dto';
import { FilterServiceDto } from '../dto/filter-service.dto';

Decimal.set({ precision: 12, rounding: Decimal.ROUND_HALF_UP });

@Injectable()
export class MedicalServicesService {
  constructor(
    @InjectRepository(MedicalService) private serviceRepo: Repository<MedicalService>,
    @InjectRepository(ServiceMaterial) private materialRepo: Repository<ServiceMaterial>,
    @InjectRepository(Inventory) private inventoryRepo: Repository<Inventory>,
    private auditService: AuditService,
    private dataSource: DataSource,
  ) {}

  async findAll(filter: FilterServiceDto) {
    const page = Math.max(filter.page || DEFAULT_PAGE, 1);
    const limit = Math.min(Math.max(filter.limit || DEFAULT_LIMIT, 1), MAX_LIMIT);

    const qb = this.serviceRepo.createQueryBuilder('s')
      .leftJoinAndSelect('s.materials', 'm', 'm.deletedAt IS NULL')
      .leftJoinAndSelect('m.product', 'p')
      .where('s.deletedAt IS NULL');

    if (filter.search) {
      qb.andWhere(
        '(s.nameEn ILIKE :search OR s.nameAr ILIKE :search OR s.code ILIKE :search)',
        { search: `%${filter.search}%` },
      );
    }

    if (filter.serviceType) {
      qb.andWhere('s.serviceType = :serviceType', { serviceType: filter.serviceType });
    }

    if (filter.active !== undefined) {
      const isActive = filter.active === 'true';
      qb.andWhere('s.isActive = :isActive', { isActive });
    }

    const [data, total] = await qb
      .orderBy('s.sortOrder', 'ASC')
      .addOrderBy('s.nameEn', 'ASC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return { data, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }

  async findById(id: string): Promise<MedicalService> {
    const service = await this.serviceRepo.findOne({
      where: { id, deletedAt: IsNull() },
      relations: ['materials', 'materials.product'],
    });
    if (!service) throw new NotFoundException('Medical service not found');
    return service;
  }

  async findActiveForPOS(): Promise<MedicalService[]> {
    return this.serviceRepo.find({
      where: { isActive: true, deletedAt: IsNull() },
      relations: ['materials', 'materials.product'],
      order: { sortOrder: 'ASC', nameEn: 'ASC' },
    });
  }

  async create(dto: CreateServiceDto, userId: string): Promise<MedicalService> {
    // Validate STOCK_LINKED has materials
    if (dto.serviceType === ServiceType.STOCK_LINKED) {
      if (!dto.materials || dto.materials.length === 0) {
        throw new BadRequestException('Stock-linked services must have at least one material');
      }
    }

    // Validate price constraints
    this.validatePriceConstraints(dto);

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const service = await queryRunner.manager.save(
        MedicalService,
        queryRunner.manager.create(MedicalService, {
          nameEn: dto.nameEn,
          nameAr: dto.nameAr,
          code: dto.code || null,
          serviceType: dto.serviceType,
          pricingMode: dto.pricingMode || ServicePricingMode.FIXED,
          defaultPrice: dto.defaultPrice,
          minPrice: dto.minPrice || null,
          maxPrice: dto.maxPrice || null,
          durationMinutes: dto.durationMinutes ?? null,
          requiresPatientInfo: dto.requiresPatientInfo ?? false,
          requiresNotes: dto.requiresNotes ?? false,
          taxable: dto.taxable ?? true,
          isActive: dto.isActive ?? true,
          sortOrder: dto.sortOrder ?? 0,
          notes: dto.notes || null,
          createdBy: userId,
        }),
      );

      // Create materials
      if (dto.materials && dto.materials.length > 0) {
        for (const mat of dto.materials) {
          await queryRunner.manager.save(
            ServiceMaterial,
            queryRunner.manager.create(ServiceMaterial, {
              serviceId: service.id,
              productId: mat.productId,
              quantity: mat.quantity,
              isRequired: mat.isRequired ?? true,
              createdBy: userId,
            }),
          );
        }
      }

      // Audit log
      await this.auditService.log(queryRunner, {
        userId,
        action: AuditAction.SERVICE_CREATED,
        entityType: 'MedicalService',
        entityId: service.id,
        after: { nameEn: service.nameEn, serviceType: service.serviceType, defaultPrice: service.defaultPrice },
      });

      await queryRunner.commitTransaction();
      return this.findById(service.id);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async update(id: string, dto: Partial<CreateServiceDto>, userId: string): Promise<MedicalService> {
    const existing = await this.findById(id);

    // Validate STOCK_LINKED has materials
    const newType = dto.serviceType || existing.serviceType;
    if (newType === ServiceType.STOCK_LINKED) {
      const materialsToCheck: ServiceMaterialDto[] | ServiceMaterial[] | undefined =
        dto.materials !== undefined ? dto.materials : existing.materials;
      if (!materialsToCheck || materialsToCheck.length === 0) {
        throw new BadRequestException('Stock-linked services must have at least one material');
      }
    }

    // Validate price constraints (merge with existing for partial updates)
    const priceCheck = {
      defaultPrice: dto.defaultPrice ?? existing.defaultPrice,
      minPrice: dto.minPrice ?? existing.minPrice,
      maxPrice: dto.maxPrice ?? existing.maxPrice,
    };
    this.validatePriceConstraints(priceCheck);

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Lock the service row to prevent concurrent updates
      await queryRunner.query(
        `SELECT 1 FROM "medical_services" WHERE "id" = $1 FOR UPDATE`,
        [id],
      );

      const updateFields: Record<string, unknown> = { updatedBy: userId };

      if (dto.nameEn !== undefined) updateFields.nameEn = dto.nameEn;
      if (dto.nameAr !== undefined) updateFields.nameAr = dto.nameAr;
      if (dto.code !== undefined) updateFields.code = dto.code || null;
      if (dto.serviceType !== undefined) updateFields.serviceType = dto.serviceType;
      if (dto.pricingMode !== undefined) updateFields.pricingMode = dto.pricingMode;
      if (dto.defaultPrice !== undefined) updateFields.defaultPrice = dto.defaultPrice;
      if (dto.minPrice !== undefined) updateFields.minPrice = dto.minPrice || null;
      if (dto.maxPrice !== undefined) updateFields.maxPrice = dto.maxPrice || null;
      if (dto.durationMinutes !== undefined) updateFields.durationMinutes = dto.durationMinutes;
      if (dto.requiresPatientInfo !== undefined) updateFields.requiresPatientInfo = dto.requiresPatientInfo;
      if (dto.requiresNotes !== undefined) updateFields.requiresNotes = dto.requiresNotes;
      if (dto.taxable !== undefined) updateFields.taxable = dto.taxable;
      if (dto.isActive !== undefined) updateFields.isActive = dto.isActive;
      if (dto.sortOrder !== undefined) updateFields.sortOrder = dto.sortOrder;
      if (dto.notes !== undefined) updateFields.notes = dto.notes || null;

      await queryRunner.manager.update(MedicalService, id, updateFields);

      // Replace materials if provided
      if (dto.materials !== undefined) {
        // Soft-delete existing materials
        await queryRunner.manager.softDelete(ServiceMaterial, { serviceId: id });

        // Create new materials
        if (dto.materials) {
          for (const mat of dto.materials) {
            await queryRunner.manager.save(
              ServiceMaterial,
              queryRunner.manager.create(ServiceMaterial, {
                serviceId: id,
                productId: mat.productId,
                quantity: mat.quantity,
                isRequired: mat.isRequired ?? true,
                createdBy: userId,
              }),
            );
          }
        }
      }

      // Audit log
      await this.auditService.log(queryRunner, {
        userId,
        action: AuditAction.SERVICE_UPDATED,
        entityType: 'MedicalService',
        entityId: id,
        before: { nameEn: existing.nameEn, serviceType: existing.serviceType },
        after: { ...updateFields },
      });

      await queryRunner.commitTransaction();
      return this.findById(id);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async softDelete(id: string, userId: string): Promise<void> {
    const existing = await this.findById(id);

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      await queryRunner.manager.softDelete(MedicalService, id);

      // Audit log
      await this.auditService.log(queryRunner, {
        userId,
        action: AuditAction.SERVICE_DELETED,
        entityType: 'MedicalService',
        entityId: id,
        before: { nameEn: existing.nameEn, serviceType: existing.serviceType },
      });

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  private validatePriceConstraints(dto: { defaultPrice?: string | null; minPrice?: string | null; maxPrice?: string | null }) {
    const defaultPrice = dto.defaultPrice ? new Decimal(dto.defaultPrice) : null;
    const minPrice = dto.minPrice ? new Decimal(dto.minPrice) : null;
    const maxPrice = dto.maxPrice ? new Decimal(dto.maxPrice) : null;

    if (minPrice && maxPrice && minPrice.greaterThan(maxPrice)) {
      throw new BadRequestException('Minimum price cannot be greater than maximum price');
    }
    if (defaultPrice && minPrice && defaultPrice.lessThan(minPrice)) {
      throw new BadRequestException('Default price cannot be less than minimum price');
    }
    if (defaultPrice && maxPrice && defaultPrice.greaterThan(maxPrice)) {
      throw new BadRequestException('Default price cannot be greater than maximum price');
    }
  }

  async computeServiceCost(serviceId: string): Promise<string> {
    const service = await this.findById(serviceId);

    if (!service.materials || service.materials.length === 0) {
      return '0.0000';
    }

    let totalCost = new Decimal(0);

    for (const material of service.materials) {
      const inventory = await this.inventoryRepo.findOne({
        where: { productId: material.productId },
      });

      const avgCost = inventory ? new Decimal(inventory.avgCost) : new Decimal(0);
      const qty = new Decimal(material.quantity);
      totalCost = totalCost.plus(avgCost.times(qty));
    }

    return totalCost.toFixed(4);
  }
}
