import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { Role } from '../../../database/entities/role.entity';
import { User } from '../../../database/entities/user.entity';
import { ErrorMessages } from '../../../common/constants/error-messages';
import { CreateRoleDto } from '../dto/create-role.dto';
import { UpdateRoleDto } from '../dto/update-role.dto';

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(Role) private roleRepo: Repository<Role>,
    @InjectRepository(User) private userRepo: Repository<User>,
  ) {}

  async findAll() {
    const roles = await this.roleRepo.find({ where: { deletedAt: IsNull() }, order: { name: 'ASC' } });

    const counts = await this.userRepo
      .createQueryBuilder('u')
      .select('u.roleId', 'roleId')
      .addSelect('COUNT(u.id)', 'count')
      .where('u.deletedAt IS NULL')
      .groupBy('u.roleId')
      .getRawMany();

    const countMap = new Map(counts.map((c: any) => [c.roleId, parseInt(c.count, 10)]));

    return roles.map((role) => ({
      ...role,
      userCount: countMap.get(role.id) || 0,
    }));
  }

  async findById(id: string): Promise<Role> {
    const role = await this.roleRepo.findOne({ where: { id, deletedAt: IsNull() } });
    if (!role) throw new NotFoundException('Role not found');
    return role;
  }

  async create(dto: CreateRoleDto): Promise<Role> {
    const role = this.roleRepo.create(dto);
    return this.roleRepo.save(role);
  }

  async update(id: string, dto: UpdateRoleDto): Promise<Role> {
    const role = await this.findById(id);
    if (dto.name) role.name = dto.name;
    if (dto.nameAr) role.nameAr = dto.nameAr;
    if (dto.description !== undefined) role.description = dto.description;
    if (dto.permissions) role.permissions = dto.permissions;
    return this.roleRepo.save(role);
  }

  async delete(id: string): Promise<void> {
    const role = await this.findById(id);
    if (role.isSystem) throw new BadRequestException(ErrorMessages.ROLE_IS_SYSTEM);
    const userCount = await this.userRepo.count({ where: { roleId: id, deletedAt: IsNull() } });
    if (userCount > 0) throw new ConflictException(ErrorMessages.ROLE_HAS_USERS);
    await this.roleRepo.softDelete(id);
  }
}
