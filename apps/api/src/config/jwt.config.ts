import { registerAs } from '@nestjs/config';

export const jwtConfig = registerAs('jwt', () => ({
  accessSecret: process.env.JWT_ACCESS_SECRET || 'change-me-access-secret-min-32-chars',
  refreshSecret: process.env.JWT_REFRESH_SECRET || 'change-me-refresh-secret-min-32-chars',
  accessExpiry: process.env.JWT_ACCESS_EXPIRY || '8h',
  refreshExpiry: process.env.JWT_REFRESH_EXPIRY || '30d',
}));
