import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { Role } from '../../../database/entities/role.entity';
import { CreateRoleDto } from '../dto/create-role.dto';
import { UpdateRoleDto } from '../dto/update-role.dto';

@Injectable()
export class RolesService {
  constructor(@InjectRepository(Role) private roleRepo: Repository<Role>) {}

  async findAll(): Promise<Role[]> {
    return this.roleRepo.find({ where: { deletedAt: IsNull() }, order: { name: 'ASC' } });
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
}
