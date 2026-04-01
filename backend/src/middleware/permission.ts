import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types';

export const hasPermission = (...requiredPermissions: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ message: 'Not authenticated' });
      return;
    }

    const userPermissions = req.user.role.permissions;
    const hasRequired = requiredPermissions.some(perm => 
      userPermissions.includes(perm)
    );

    if (!hasRequired) {
      res.status(403).json({ 
        message: 'Access denied. Insufficient permissions.',
        required: requiredPermissions,
        userPermissions
      });
      return;
    }

    next();
  };
};

export const hasRole = (...allowedRoles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ message: 'Not authenticated' });
      return;
    }

    if (!allowedRoles.includes(req.user.role.name)) {
      res.status(403).json({ 
        message: 'Access denied. Role not authorized.',
        required: allowedRoles,
        userRole: req.user.role.name
      });
      return;
    }

    next();
  };
};

export const isAdmin = hasRole('Admin');
export const isManagerOrAdmin = hasRole('Admin', 'Manager');
