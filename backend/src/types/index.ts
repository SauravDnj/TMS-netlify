import { Request } from 'express';

export interface AuthUser {
  id: number;
  email: string;
  username: string;
  roleId: number;
  role: {
    id: number;
    name: string;
    permissions: string[];
  };
}

export interface AuthRequest extends Request {
  user?: AuthUser;
}

export interface TokenPayload {
  userId: number;
  email: string;
  roleId: number;
}
