import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull, ILike, DataSource } from 'typeorm';
import { Product } from '../../../database/entities/product.entity';
import { Inventory } from '../../../database/entities/inventory.entity';
import { ErrorMessages } from '../../../common/constants/error-messages';
import { DEFAULT_PAGE, DEFAULT_LIMIT, MAX_LIMIT } from '@pharmapos/shared';
import { CreateProductDto } from '../dto/create-product.dto';
import { UpdateProductDto } from '../dto/update-product.dto';
import { FilterProductDto } from '../dto/filter-product.dto';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product) private productRepo: Repository<Product>,
    @InjectRepository(Inventory) private inventoryRepo: Repository<Inventory>,
    private dataSource: DataSource,
  ) {}

  async findAll(filter: FilterProductDto) {
    const page = Math.max(filter.page || DEFAULT_PAGE, 1);
    const limit = Math.min(Math.max(filter.limit || DEFAULT_LIMIT, 1), MAX_LIMIT);

    const qb = this.productRepo.createQueryBuilder('p')
      .leftJoinAndSelect('p.category', 'c')
      .leftJoinAndSelect('p.inventory', 'i')
      .where('p.deletedAt IS NULL');

    if (filter.search) {
      qb.andWhere('(p.nameEn ILIKE :search OR p.nameAr ILIKE :search OR p.barcode ILIKE :search OR p.genericNameEn ILIKE :search)', {
        search: `%${filter.search}%`,
      });
    }

    if (filter.categoryId) {
      qb.andWhere('p.categoryId = :categoryId', { categoryId: filter.categoryId });
    }

    if (filter.active !== undefined) {
      qb.andWhere('p.isActive = :active', { active: filter.active });
    }

    if (filter.barcode) {
      qb.andWhere('(p.barcode = :barcode OR p.barcode2 = :barcode)', { barcode: filter.barcode });
    }

    const [data, total] = await qb
      .orderBy('p.nameEn', 'ASC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return { data, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }

  async findById(id: string): Promise<Product> {
    const product = await this.productRepo.findOne({
      where: { id, deletedAt: IsNull() },
      relations: ['category', 'inventory'],
    });
    if (!product) throw new NotFoundException(ErrorMessages.PRODUCT_NOT_FOUND);
    return product;
  }

  async findByBarcode(code: string): Promise<Product> {
    const product = await this.productRepo.findOne({
      where: [
        { barcode: code, deletedAt: IsNull() },
        { barcode2: code, deletedAt: IsNull() },
      ],
      relations: ['category', 'inventory'],
    });
    if (!product) throw new NotFoundException(ErrorMessages.PRODUCT_NOT_FOUND);
    return product;
  }

  async create(dto: CreateProductDto, userId: string): Promise<Product> {
    if (dto.barcode) {
      const existing = await this.productRepo.findOne({ where: { barcode: dto.barcode, deletedAt: IsNull() } });
      if (existing) throw new ConflictException(ErrorMessages.PRODUCT_BARCODE_EXISTS);
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const product = this.productRepo.create({ ...dto, createdBy: userId });
      const savedProduct = await queryRunner.manager.save(Product, product);

      // Create inventory record for non-service products
      if (!dto.isService) {
        const inventory = this.inventoryRepo.create({
          productId: savedProduct.id,
          quantity: '0',
          avgCost: '0',
          totalValue: '0',
        });
        await queryRunner.manager.save(Inventory, inventory);
      }

      await queryRunner.commitTransaction();
      return savedProduct;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async update(id: string, dto: UpdateProductDto): Promise<Product> {
    const product = await this.findById(id);
    Object.assign(product, dto);
    return this.productRepo.save(product);
  }

  async softDelete(id: string): Promise<void> {
    await this.productRepo.softDelete(id);
  }
}
