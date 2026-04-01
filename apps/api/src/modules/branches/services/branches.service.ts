import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { Branch } from '../../../database/entities/branch.entity';
import { AuditService } from '../../../shared/audit/audit.service';
import { AuditAction } from '@pharmapos/shared';
import { CreateBranchDto } from '../dto/create-branch.dto';
import { UpdateBranchDto } from '../dto/update-branch.dto';

@Injectable()
export class BranchesService {
  constructor(
    @InjectRepository(Branch) private branchRepo: Repository<Branch>,
    private auditService: AuditService,
  ) {}

  async findAll() {
    return this.branchRepo.find({
      where: { deletedAt: IsNull() },
      order: { isMain: 'DESC', nameEn: 'ASC' },
    });
  }

  async findById(id: string): Promise<Branch> {
    const branch = await this.branchRepo.findOne({ where: { id, deletedAt: IsNull() } });
    if (!branch) throw new NotFoundException('Branch not found');
    return branch;
  }

  async getDropdown() {
    return this.branchRepo.find({
      where: { isActive: true, deletedAt: IsNull() },
      select: ['id', 'nameEn', 'nameAr', 'code', 'isMain'],
      order: { isMain: 'DESC', nameEn: 'ASC' },
    });
  }

  async create(dto: CreateBranchDto, actorId: string): Promise<Branch> {
    // Check for duplicate code
    const existing = await this.branchRepo.findOne({
      where: { code: dto.code, deletedAt: IsNull() },
    });
    if (existing) throw new ConflictException('Branch code already exists');

    const branch = this.branchRepo.create({
      nameEn: dto.nameEn,
      nameAr: dto.nameAr,
      code: dto.code,
      address: dto.address || null,
      phone: dto.phone || null,
      isMain: dto.isMain || false,
    });
    const saved = await this.branchRepo.save(branch);

    this.auditService.logSimple({
      userId: actorId,
      action: AuditAction.BRANCH_CREATED,
      entityType: 'Branch',
      entityId: saved.id,
      after: { nameEn: dto.nameEn, code: dto.code },
    });

    return saved;
  }

  async update(id: string, dto: UpdateBranchDto, actorId: string): Promise<Branch> {
    const branch = await this.findById(id);

    if (dto.code && dto.code !== branch.code) {
      const existing = await this.branchRepo.findOne({
        where: { code: dto.code, deletedAt: IsNull() },
      });
      if (existing && existing.id !== id) throw new ConflictException('Branch code already exists');
    }

    if (dto.nameEn !== undefined) branch.nameEn = dto.nameEn;
    if (dto.nameAr !== undefined) branch.nameAr = dto.nameAr;
    if (dto.code !== undefined) branch.code = dto.code;
    if (dto.address !== undefined) branch.address = dto.address || null;
    if (dto.phone !== undefined) branch.phone = dto.phone || null;
    if (dto.isActive !== undefined) branch.isActive = dto.isActive;
    if (dto.isMain !== undefined) branch.isMain = dto.isMain;

    const saved = await this.branchRepo.save(branch);

    this.auditService.logSimple({
      userId: actorId,
      action: AuditAction.BRANCH_UPDATED,
      entityType: 'Branch',
      entityId: id,
      after: { ...dto },
    });

    return saved;
  }

  async softDelete(id: string, actorId: string): Promise<void> {
    const branch = await this.findById(id);
    if (branch.isMain) {
      throw new ConflictException('Cannot delete the main branch');
    }
    await this.branchRepo.softDelete(id);

    this.auditService.logSimple({
      userId: actorId,
      action: AuditAction.BRANCH_UPDATED,
      entityType: 'Branch',
      entityId: id,
      metadata: { action: 'SOFT_DELETE', branchName: branch.nameEn },
    });
  }
}
