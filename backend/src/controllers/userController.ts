import { Response } from 'express';
import bcrypt from 'bcryptjs';
import prisma from '../config/database';
import { AuthRequest } from '../types';

export const getUsers = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        username: true,
        roleId: true,
        role: {
          select: {
            id: true,
            name: true,
            description: true
          }
        },
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            tasks: true,
            assigned: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ users });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Failed to fetch users' });
  }
};

export const getUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = parseInt(req.params.id);

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        username: true,
        roleId: true,
        role: {
          select: {
            id: true,
            name: true,
            description: true,
            permissions: {
              include: {
                permission: true
              }
            }
          }
        },
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            tasks: true,
            assigned: true
          }
        }
      }
    });

    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    res.json({ user });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Failed to fetch user' });
  }
};

export const createUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { email, username, password, roleId } = req.body;

    // Input is already trimmed by express-validator
    const cleanEmail = email.toLowerCase();
    const cleanUsername = username.trim();

    // Check if user exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email: cleanEmail }, { username: cleanUsername }]
      }
    });

    if (existingUser) {
      res.status(400).json({ 
        message: existingUser.email === cleanEmail 
          ? 'Email already registered' 
          : 'Username already taken' 
      });
      return;
    }

    // Verify role exists
    const role = await prisma.role.findUnique({
      where: { id: roleId }
    });

    if (!role) {
      res.status(400).json({ message: 'Invalid role' });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email: cleanEmail,
        username: cleanUsername,
        password: hashedPassword,
        roleId
      },
      select: {
        id: true,
        email: true,
        username: true,
        role: {
          select: {
            id: true,
            name: true
          }
        },
        createdAt: true
      }
    });

    res.status(201).json({ message: 'User created', user });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({ message: 'Failed to create user' });
  }
};

export const updateUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = parseInt(req.params.id);
    const { email, username, password, roleId } = req.body;

    const existingUser = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!existingUser) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    // Clean inputs
    const cleanEmail = email ? email.toLowerCase() : undefined;
    const cleanUsername = username ? username.trim() : undefined;

    // Check for duplicate email/username
    if (cleanEmail || cleanUsername) {
      const duplicate = await prisma.user.findFirst({
        where: {
          AND: [
            { id: { not: userId } },
            {
              OR: [
                cleanEmail ? { email: cleanEmail } : {},
                cleanUsername ? { username: cleanUsername } : {}
              ].filter(o => Object.keys(o).length > 0)
            }
          ]
        }
      });

      if (duplicate) {
        res.status(400).json({ 
          message: duplicate.email === cleanEmail 
            ? 'Email already in use' 
            : 'Username already taken' 
        });
        return;
      }
    }

    // Verify role if changing
    if (roleId) {
      const role = await prisma.role.findUnique({
        where: { id: roleId }
      });

      if (!role) {
        res.status(400).json({ message: 'Invalid role' });
        return;
      }
    }

    const updateData: any = {};
    if (cleanEmail) updateData.email = cleanEmail;
    if (cleanUsername) updateData.username = cleanUsername;
    if (password) updateData.password = await bcrypt.hash(password, 10);
    if (roleId) updateData.roleId = roleId;

    const user = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        email: true,
        username: true,
        role: {
          select: {
            id: true,
            name: true
          }
        },
        updatedAt: true
      }
    });

    res.json({ message: 'User updated', user });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ message: 'Failed to update user' });
  }
};

export const deleteUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const currentUser = req.user!;
    const userId = parseInt(req.params.id);

    if (currentUser.id === userId) {
      res.status(400).json({ message: 'Cannot delete your own account' });
      return;
    }

    const existingUser = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!existingUser) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    await prisma.user.delete({
      where: { id: userId }
    });

    res.json({ message: 'User deleted' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ message: 'Failed to delete user' });
  }
};

export const updateUserRole = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const currentUser = req.user!;
    const userId = parseInt(req.params.id);
    const { roleId } = req.body;

    if (currentUser.id === userId) {
      res.status(400).json({ message: 'Cannot change your own role' });
      return;
    }

    const role = await prisma.role.findUnique({
      where: { id: roleId }
    });

    if (!role) {
      res.status(400).json({ message: 'Invalid role' });
      return;
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: { roleId },
      select: {
        id: true,
        email: true,
        username: true,
        role: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    res.json({ message: 'User role updated', user });
  } catch (error) {
    console.error('Update user role error:', error);
    res.status(500).json({ message: 'Failed to update user role' });
  }
};

export const getRoles = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const roles = await prisma.role.findMany({
      include: {
        permissions: {
          include: {
            permission: true
          }
        },
        _count: {
          select: {
            users: true
          }
        }
      }
    });

    const formattedRoles = roles.map(role => ({
      id: role.id,
      name: role.name,
      description: role.description,
      permissions: role.permissions.map(rp => rp.permission.name),
      userCount: role._count.users
    }));

    res.json({ roles: formattedRoles });
  } catch (error) {
    console.error('Get roles error:', error);
    res.status(500).json({ message: 'Failed to fetch roles' });
  }
};
