import { Injectable, NotFoundException, ConflictException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { User } from '../../../database/entities/user.entity';
import { UserPreference } from '../../../database/entities/user-preference.entity';
import { AuthService } from '../../auth/services/auth.service';
import { ErrorMessages } from '../../../common/constants/error-messages';
import { DEFAULT_PAGE, DEFAULT_LIMIT, MAX_LIMIT } from '@pharmapos/shared';
import { PaginationDto } from '../../../common/dto/pagination.dto';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { UpdatePreferencesDto } from '../dto/update-preferences.dto';
import { AuthenticatedUser } from '../../../common/interfaces/request.interface';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(UserPreference) private prefRepo: Repository<UserPreference>,
    private authService: AuthService,
  ) {}

  async findAll(pagination: PaginationDto) {
    const page = Math.max(pagination.page || DEFAULT_PAGE, 1);
    const limit = Math.min(Math.max(pagination.limit || DEFAULT_LIMIT, 1), MAX_LIMIT);

    const [data, total] = await this.userRepo.findAndCount({
      where: { deletedAt: IsNull() },
      relations: ['role'],
      select: ['id', 'username', 'fullName', 'fullNameAr', 'isActive', 'roleId', 'lastLoginAt', 'createdAt'],
      skip: (page - 1) * limit,
      take: limit,
    });

    return { data, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }

  async findById(id: string): Promise<User> {
    const user = await this.userRepo.findOne({
      where: { id, deletedAt: IsNull() },
      relations: ['role', 'preferences'],
      select: ['id', 'username', 'fullName', 'fullNameAr', 'isActive', 'roleId', 'lastLoginAt', 'createdAt'],
    });
    if (!user) throw new NotFoundException(ErrorMessages.USER_NOT_FOUND);
    return user;
  }

  async create(dto: CreateUserDto): Promise<User> {
    const existing = await this.userRepo.findOne({ where: { username: dto.username, deletedAt: IsNull() } });
    if (existing) throw new ConflictException(ErrorMessages.USER_ALREADY_EXISTS);

    const passwordHash = await this.authService.hashPassword(dto.password);
    const pinHash = dto.pin ? await this.authService.hashPin(dto.pin) : null;

    const user = this.userRepo.create({
      username: dto.username,
      passwordHash,
      pinHash,
      fullName: dto.fullName,
      fullNameAr: dto.fullNameAr || null,
      roleId: dto.roleId,
      isActive: true,
    });

    const saved = await this.userRepo.save(user);

    // Create default preferences
    const prefs = this.prefRepo.create({ userId: saved.id });
    await this.prefRepo.save(prefs);

    return this.findById(saved.id);
  }

  async update(id: string, dto: UpdateUserDto): Promise<User> {
    const user = await this.findById(id);

    if (dto.fullName !== undefined) user.fullName = dto.fullName;
    if (dto.fullNameAr !== undefined) user.fullNameAr = dto.fullNameAr;
    if (dto.roleId !== undefined) user.roleId = dto.roleId;
    if (dto.isActive !== undefined) user.isActive = dto.isActive;
    if (dto.password) user.passwordHash = await this.authService.hashPassword(dto.password);

    return this.userRepo.save(user);
  }

  async softDelete(id: string): Promise<void> {
    await this.userRepo.softDelete(id);
  }

  async updatePin(id: string, pin: string, currentUser: AuthenticatedUser): Promise<void> {
    // Users can update their own pin, admins can update anyone's
    if (currentUser.id !== id && !currentUser.permissions['canManageUsers']) {
      throw new ForbiddenException('Cannot update another user\'s PIN');
    }

    const pinHash = await this.authService.hashPin(pin);
    await this.userRepo.update(id, { pinHash });
  }

  async getPreferences(userId: string): Promise<UserPreference> {
    let pref = await this.prefRepo.findOne({ where: { userId } });
    if (!pref) {
      pref = this.prefRepo.create({ userId });
      pref = await this.prefRepo.save(pref);
    }
    return pref;
  }

  async updatePreferences(userId: string, dto: UpdatePreferencesDto): Promise<UserPreference> {
    const pref = await this.getPreferences(userId);
    Object.assign(pref, dto);
    return this.prefRepo.save(pref);
  }
}
