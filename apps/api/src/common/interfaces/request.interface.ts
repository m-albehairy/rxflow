import { Request } from 'express';

export interface AuthenticatedUser {
  id: string;
  username: string;
  roleId: string;
  permissions: Record<string, boolean | number>;
}

export interface AuthenticatedRequest extends Request {
  user: AuthenticatedUser;
}
