import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog } from '../../../database/entities/audit-log.entity';
import { DEFAULT_PAGE, DEFAULT_LIMIT, MAX_LIMIT } from '@pharmapos/shared';
import { FilterAuditDto } from '../dto/filter-audit.dto';

@Injectable()
export class AuditQueryService {
  constructor(@InjectRepository(AuditLog) private auditRepo: Repository<AuditLog>) {}

  async findAll(filter: FilterAuditDto) {
    const page = Math.max(filter.page || DEFAULT_PAGE, 1);
    const limit = Math.min(Math.max(filter.limit || DEFAULT_LIMIT, 1), MAX_LIMIT);

    const qb = this.auditRepo.createQueryBuilder('a')
      .leftJoinAndSelect('a.user', 'u');

    if (filter.action) qb.andWhere('a.action = :action', { action: filter.action });
    if (filter.userId) qb.andWhere('a.userId = :userId', { userId: filter.userId });
    if (filter.entityType) qb.andWhere('a.entityType = :entityType', { entityType: filter.entityType });
    if (filter.from) qb.andWhere('a.createdAt >= :from', { from: filter.from });
    if (filter.to) qb.andWhere('a.createdAt <= :to', { to: filter.to });

    const [data, total] = await qb
      .orderBy('a.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return { data, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }
}
