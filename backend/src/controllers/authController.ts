import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import prisma from '../config/database';
import { generateToken } from '../middleware/auth';
import { AuthRequest } from '../types';

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, username, password } = req.body;

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

    // Get default User role
    const userRole = await prisma.role.findUnique({
      where: { name: 'User' }
    });

    if (!userRole) {
      res.status(500).json({ message: 'Default role not found. Please run database seed.' });
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        email: cleanEmail,
        username: cleanUsername,
        password: hashedPassword,
        roleId: userRole.id
      },
      include: {
        role: {
          include: {
            permissions: {
              include: {
                permission: true
              }
            }
          }
        }
      }
    });

    // Generate token
    const token = generateToken({
      userId: user.id,
      email: user.email,
      roleId: user.roleId
    });

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        role: {
          id: user.role.id,
          name: user.role.name,
          permissions: user.role.permissions.map(rp => rp.permission.name)
        }
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Registration failed' });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;
    
    // Input is already trimmed by express-validator
    const cleanEmail = email.toLowerCase();

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: cleanEmail },
      include: {
        role: {
          include: {
            permissions: {
              include: {
                permission: true
              }
            }
          }
        }
      }
    });

    if (!user) {
      res.status(401).json({ message: 'Invalid credentials' });
      return;
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      res.status(401).json({ message: 'Invalid credentials' });
      return;
    }

    // Generate token
    const token = generateToken({
      userId: user.id,
      email: user.email,
      roleId: user.roleId
    });

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        role: {
          id: user.role.id,
          name: user.role.name,
          permissions: user.role.permissions.map(rp => rp.permission.name)
        }
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Login failed' });
  }
};

export const getMe = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Not authenticated' });
      return;
    }

    res.json({
      user: {
        id: req.user.id,
        email: req.user.email,
        username: req.user.username,
        role: req.user.role
      }
    });
  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({ message: 'Failed to get user profile' });
  }
};

// Admin impersonation - allows admin to login as any user
export const impersonateUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const adminUser = req.user;
    const targetUserId = parseInt(req.params.userId);

    if (!adminUser) {
      res.status(401).json({ message: 'Not authenticated' });
      return;
    }

    // Verify admin role (double check even though middleware should handle this)
    if (adminUser.role.name !== 'Admin') {
      res.status(403).json({ message: 'Only admins can impersonate users' });
      return;
    }

    // Prevent admin from impersonating themselves
    if (adminUser.id === targetUserId) {
      res.status(400).json({ message: 'Cannot impersonate yourself' });
      return;
    }

    // Find target user
    const targetUser = await prisma.user.findUnique({
      where: { id: targetUserId },
      include: {
        role: {
          include: {
            permissions: {
              include: {
                permission: true
              }
            }
          }
        }
      }
    });

    if (!targetUser) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    // Generate token for target user
    const token = generateToken({
      userId: targetUser.id,
      email: targetUser.email,
      roleId: targetUser.roleId
    });

    res.json({
      message: `Now logged in as ${targetUser.username}`,
      token,
      user: {
        id: targetUser.id,
        email: targetUser.email,
        username: targetUser.username,
        role: {
          id: targetUser.role.id,
          name: targetUser.role.name,
          permissions: targetUser.role.permissions.map(rp => rp.permission.name)
        }
      },
      impersonatedBy: {
        id: adminUser.id,
        username: adminUser.username
      }
    });
  } catch (error) {
    console.error('Impersonate user error:', error);
    res.status(500).json({ message: 'Failed to impersonate user' });
  }
};
