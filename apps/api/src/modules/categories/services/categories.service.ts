import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { Category } from '../../../database/entities/category.entity';
import { PaginationDto } from '../../../common/dto/pagination.dto';
import { DEFAULT_PAGE, DEFAULT_LIMIT, MAX_LIMIT } from '@pharmapos/shared';
import { CreateCategoryDto } from '../dto/create-category.dto';
import { UpdateCategoryDto } from '../dto/update-category.dto';

@Injectable()
export class CategoriesService {
  constructor(@InjectRepository(Category) private categoryRepo: Repository<Category>) {}

  async findAll(pagination: PaginationDto) {
    const page = Math.max(pagination.page || DEFAULT_PAGE, 1);
    const limit = Math.min(Math.max(pagination.limit || DEFAULT_LIMIT, 1), MAX_LIMIT);

    const [data, total] = await this.categoryRepo.findAndCount({
      where: { deletedAt: IsNull() },
      order: { sortOrder: 'ASC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return { data, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }

  async findById(id: string): Promise<Category> {
    const category = await this.categoryRepo.findOne({ where: { id, deletedAt: IsNull() } });
    if (!category) throw new NotFoundException('Category not found');
    return category;
  }

  async getDropdown(): Promise<Array<{ id: string; nameEn: string; nameAr: string; color: string | null }>> {
    return this.categoryRepo.find({
      where: { isActive: true, deletedAt: IsNull() },
      select: ['id', 'nameEn', 'nameAr', 'color'],
      order: { sortOrder: 'ASC' },
    });
  }

  async create(dto: CreateCategoryDto): Promise<Category> {
    const category = this.categoryRepo.create(dto);
    return this.categoryRepo.save(category);
  }

  async update(id: string, dto: UpdateCategoryDto): Promise<Category> {
    const category = await this.findById(id);
    Object.assign(category, dto);
    return this.categoryRepo.save(category);
  }

  async softDelete(id: string): Promise<void> {
    await this.categoryRepo.softDelete(id);
  }
}
