import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { Supplier } from '../../../database/entities/supplier.entity';
import { PaginationDto } from '../../../common/dto/pagination.dto';
import { DEFAULT_PAGE, DEFAULT_LIMIT, MAX_LIMIT } from '@pharmapos/shared';
import { CreateSupplierDto } from '../dto/create-supplier.dto';
import { UpdateSupplierDto } from '../dto/update-supplier.dto';

@Injectable()
export class SuppliersService {
  constructor(@InjectRepository(Supplier) private supplierRepo: Repository<Supplier>) {}

  async findAll(pagination: PaginationDto) {
    const page = Math.max(pagination.page || DEFAULT_PAGE, 1);
    const limit = Math.min(Math.max(pagination.limit || DEFAULT_LIMIT, 1), MAX_LIMIT);

    const [data, total] = await this.supplierRepo.findAndCount({
      where: { deletedAt: IsNull() },
      order: { nameEn: 'ASC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return { data, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }

  async findById(id: string): Promise<Supplier> {
    const supplier = await this.supplierRepo.findOne({ where: { id, deletedAt: IsNull() } });
    if (!supplier) throw new NotFoundException('Supplier not found');
    return supplier;
  }

  async getDropdown() {
    return this.supplierRepo.find({
      where: { isActive: true, deletedAt: IsNull() },
      select: ['id', 'nameEn', 'nameAr'],
      order: { nameEn: 'ASC' },
    });
  }

  async create(dto: CreateSupplierDto): Promise<Supplier> {
    const supplier = this.supplierRepo.create(dto);
    return this.supplierRepo.save(supplier);
  }

  async update(id: string, dto: UpdateSupplierDto): Promise<Supplier> {
    const supplier = await this.findById(id);
    Object.assign(supplier, dto);
    return this.supplierRepo.save(supplier);
  }

  async softDelete(id: string): Promise<void> {
    await this.supplierRepo.softDelete(id);
  }
}
