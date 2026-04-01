import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../../../database/entities/user.entity';
import { ErrorMessages } from '../../../common/constants/error-messages';
import { AuditService } from '../../../shared/audit/audit.service';
import { BCRYPT_COST_PASSWORD, BCRYPT_COST_PIN, AuditAction } from '@pharmapos/shared';
import { UpdateProfileDto } from '../dto/update-profile.dto';

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export interface LoginResult {
  tokens: TokenPair;
  user: {
    id: string;
    username: string;
    fullName: string;
    fullNameAr: string | null;
    roleId: string;
    permissions: Record<string, boolean | number>;
  };
}

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private userRepo: Repository<User>,
    private jwtService: JwtService,
    private config: ConfigService,
    private auditService: AuditService,
  ) {}

  async login(username: string, password: string, ipAddress?: string): Promise<LoginResult> {
    const user = await this.userRepo.findOne({
      where: { username, deletedAt: IsNull() },
      relations: ['role'],
    });

    if (!user) {
      throw new UnauthorizedException(ErrorMessages.INVALID_CREDENTIALS);
    }

    if (!user.isActive) {
      throw new UnauthorizedException(ErrorMessages.USER_INACTIVE);
    }

    const passwordValid = await bcrypt.compare(password, user.passwordHash);
    if (!passwordValid) {
      throw new UnauthorizedException(ErrorMessages.INVALID_CREDENTIALS);
    }

    // Update last login
    await this.userRepo.update(user.id, { lastLoginAt: new Date() });

    this.auditService.logSimple({
      userId: user.id,
      action: AuditAction.USER_LOGIN,
      entityType: 'User',
      entityId: user.id,
      metadata: { username: user.username },
      ipAddress,
    });

    const tokens = await this.generateTokens(user.id, user.username);

    return {
      tokens,
      user: {
        id: user.id,
        username: user.username,
        fullName: user.fullName,
        fullNameAr: user.fullNameAr,
        roleId: user.roleId,
        permissions: user.role.permissions,
      },
    };
  }

  async refreshToken(refreshToken: string): Promise<TokenPair> {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.config.get('jwt.refreshSecret'),
      });

      const user = await this.userRepo.findOne({
        where: { id: payload.sub, deletedAt: IsNull() },
      });

      if (!user || !user.isActive) {
        throw new UnauthorizedException(ErrorMessages.INVALID_CREDENTIALS);
      }

      return this.generateTokens(user.id, user.username);
    } catch {
      throw new UnauthorizedException(ErrorMessages.TOKEN_EXPIRED);
    }
  }

  async verifyPin(userId: string, pin: string): Promise<boolean> {
    const user = await this.userRepo.findOne({
      where: { id: userId, deletedAt: IsNull() },
    });

    if (!user || !user.pinHash) {
      throw new BadRequestException(ErrorMessages.INVALID_PIN);
    }

    const valid = await bcrypt.compare(pin, user.pinHash);
    if (!valid) {
      throw new BadRequestException(ErrorMessages.INVALID_PIN);
    }

    return true;
  }

  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, BCRYPT_COST_PASSWORD);
  }

  async hashPin(pin: string): Promise<string> {
    return bcrypt.hash(pin, BCRYPT_COST_PIN);
  }

  async getProfile(userId: string) {
    const user = await this.userRepo.findOne({
      where: { id: userId, deletedAt: IsNull() },
      relations: ['role'],
      select: ['id', 'username', 'fullName', 'fullNameAr', 'isActive', 'roleId', 'lastLoginAt', 'createdAt', 'pinHash'],
    });

    if (!user) {
      throw new UnauthorizedException(ErrorMessages.INVALID_CREDENTIALS);
    }

    return {
      id: user.id,
      username: user.username,
      fullName: user.fullName,
      fullNameAr: user.fullNameAr,
      isActive: user.isActive,
      roleId: user.roleId,
      roleName: user.role?.name || null,
      roleNameAr: user.role?.nameAr || null,
      hasPin: !!user.pinHash,
      lastLoginAt: user.lastLoginAt,
      createdAt: (user as any).createdAt,
    };
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    const user = await this.userRepo.findOne({
      where: { id: userId, deletedAt: IsNull() },
    });

    if (!user) {
      throw new UnauthorizedException(ErrorMessages.INVALID_CREDENTIALS);
    }

    if (dto.newPassword) {
      if (!dto.currentPassword) {
        throw new BadRequestException('Current password is required to set a new password');
      }
      const valid = await bcrypt.compare(dto.currentPassword, user.passwordHash);
      if (!valid) {
        throw new BadRequestException('Current password is incorrect');
      }
      user.passwordHash = await this.hashPassword(dto.newPassword);
    }

    if (dto.fullName !== undefined) user.fullName = dto.fullName;
    if (dto.fullNameAr !== undefined) user.fullNameAr = dto.fullNameAr;

    await this.userRepo.save(user);

    return this.getProfile(userId);
  }

  logLogout(userId: string, ipAddress?: string): void {
    this.auditService.logSimple({
      userId,
      action: AuditAction.USER_LOGOUT,
      entityType: 'User',
      entityId: userId,
      ipAddress,
    });
  }

  private async generateTokens(userId: string, username: string): Promise<TokenPair> {
    const payload = { sub: userId, username };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload),
      this.jwtService.signAsync(payload, {
        secret: this.config.get('jwt.refreshSecret'),
        expiresIn: this.config.get('jwt.refreshExpiry', '30d'),
      }),
    ]);

    return { accessToken, refreshToken };
  }
}
