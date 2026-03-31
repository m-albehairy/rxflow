import { Repository, FindOptionsWhere, DeepPartial, IsNull } from 'typeorm';
import { BaseEntity } from './base.entity';
import { DEFAULT_PAGE, DEFAULT_LIMIT, MAX_LIMIT } from '@pharmapos/shared';

export interface PaginationOptions {
  page?: number;
  limit?: number;
}

export interface PaginatedResult<T> {
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export abstract class BaseRepository<T extends BaseEntity> {
  constructor(protected readonly repository: Repository<T>) {}

  async findPaginated(
    where: FindOptionsWhere<T> = {} as FindOptionsWhere<T>,
    options: PaginationOptions = {},
    relations: string[] = [],
  ): Promise<PaginatedResult<T>> {
    const page = Math.max(options.page || DEFAULT_PAGE, 1);
    const limit = Math.min(Math.max(options.limit || DEFAULT_LIMIT, 1), MAX_LIMIT);
    const skip = (page - 1) * limit;

    const [data, total] = await this.repository.findAndCount({
      where,
      skip,
      take: limit,
      relations,
    });

    return {
      data,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findById(id: string, relations: string[] = []): Promise<T | null> {
    return this.repository.findOne({
      where: { id } as unknown as FindOptionsWhere<T>,
      relations,
    });
  }

  async create(data: DeepPartial<T>): Promise<T> {
    const entity = this.repository.create(data);
    return this.repository.save(entity);
  }

  async update(id: string, data: DeepPartial<T>): Promise<T> {
    const entity = await this.findById(id);
    if (!entity) {
      throw new Error(`Entity with id ${id} not found`);
    }
    Object.assign(entity, data);
    return this.repository.save(entity);
  }

  async softDelete(id: string): Promise<void> {
    await this.repository.softDelete(id);
  }
}
