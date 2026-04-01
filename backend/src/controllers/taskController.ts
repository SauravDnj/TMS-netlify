import { Response } from 'express';
import prisma from '../config/database';
import { AuthRequest } from '../types';

const VALID_STATUSES = ['TODO', 'IN_PROGRESS', 'COMPLETED'];
const VALID_PRIORITIES = ['LOW', 'MEDIUM', 'HIGH'];

export const getTasks = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = req.user!;
    const { status, priority, assignedTo } = req.query;

    const canViewAll = user.role.permissions.includes('tasks:read:all');

    const where: any = {};

    // Filter by ownership if user can't view all
    if (!canViewAll) {
      where.OR = [
        { userId: user.id },
        { assignedTo: user.id }
      ];
    }

    // Filter by status
    if (status && VALID_STATUSES.includes(status as string)) {
      where.status = status as string;
    }

    // Filter by priority
    if (priority && VALID_PRIORITIES.includes(priority as string)) {
      where.priority = priority as string;
    }

    // Filter by assigned user
    if (assignedTo) {
      where.assignedTo = parseInt(assignedTo as string);
    }

    const tasks = await prisma.task.findMany({
      where,
      include: {
        user: {
          select: { id: true, username: true, email: true }
        },
        assignee: {
          select: { id: true, username: true, email: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ tasks });
  } catch (error) {
    console.error('Get tasks error:', error);
    res.status(500).json({ message: 'Failed to fetch tasks' });
  }
};

export const getTask = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = req.user!;
    const taskId = parseInt(req.params.id);

    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: {
        user: {
          select: { id: true, username: true, email: true }
        },
        assignee: {
          select: { id: true, username: true, email: true }
        }
      }
    });

    if (!task) {
      res.status(404).json({ message: 'Task not found' });
      return;
    }

    const canViewAll = user.role.permissions.includes('tasks:read:all');
    const isOwner = task.userId === user.id;
    const isAssignee = task.assignedTo === user.id;

    if (!canViewAll && !isOwner && !isAssignee) {
      res.status(403).json({ message: 'Access denied' });
      return;
    }

    res.json({ task });
  } catch (error) {
    console.error('Get task error:', error);
    res.status(500).json({ message: 'Failed to fetch task' });
  }
};

export const createTask = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = req.user!;
    const { title, description, status, priority, assignedTo, dueDate } = req.body;

    // Check if user can assign tasks
    if (assignedTo && !user.role.permissions.includes('tasks:assign')) {
      res.status(403).json({ message: 'You cannot assign tasks to others' });
      return;
    }

    const task = await prisma.task.create({
      data: {
        title,
        description,
        status: status || 'TODO',
        priority: priority || 'MEDIUM',
        userId: user.id,
        assignedTo: assignedTo || null,
        dueDate: dueDate ? new Date(dueDate) : null
      },
      include: {
        user: {
          select: { id: true, username: true, email: true }
        },
        assignee: {
          select: { id: true, username: true, email: true }
        }
      }
    });

    res.status(201).json({ message: 'Task created', task });
  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json({ message: 'Failed to create task' });
  }
};

export const updateTask = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = req.user!;
    const taskId = parseInt(req.params.id);
    const { title, description, status, priority, assignedTo, dueDate } = req.body;

    const existingTask = await prisma.task.findUnique({
      where: { id: taskId }
    });

    if (!existingTask) {
      res.status(404).json({ message: 'Task not found' });
      return;
    }

    const canUpdateAll = user.role.permissions.includes('tasks:update:all');
    const isOwner = existingTask.userId === user.id;
    const isAssignee = existingTask.assignedTo === user.id;

    if (!canUpdateAll && !isOwner && !isAssignee) {
      res.status(403).json({ message: 'Access denied' });
      return;
    }

    // Check if user can reassign tasks
    if (assignedTo !== undefined && assignedTo !== existingTask.assignedTo) {
      if (!user.role.permissions.includes('tasks:assign')) {
        res.status(403).json({ message: 'You cannot reassign tasks' });
        return;
      }
    }

    const task = await prisma.task.update({
      where: { id: taskId },
      data: {
        title: title ?? existingTask.title,
        description: description ?? existingTask.description,
        status: status ?? existingTask.status,
        priority: priority ?? existingTask.priority,
        assignedTo: assignedTo !== undefined ? assignedTo : existingTask.assignedTo,
        dueDate: dueDate !== undefined ? (dueDate ? new Date(dueDate) : null) : existingTask.dueDate
      },
      include: {
        user: {
          select: { id: true, username: true, email: true }
        },
        assignee: {
          select: { id: true, username: true, email: true }
        }
      }
    });

    res.json({ message: 'Task updated', task });
  } catch (error) {
    console.error('Update task error:', error);
    res.status(500).json({ message: 'Failed to update task' });
  }
};

export const deleteTask = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = req.user!;
    const taskId = parseInt(req.params.id);

    const existingTask = await prisma.task.findUnique({
      where: { id: taskId }
    });

    if (!existingTask) {
      res.status(404).json({ message: 'Task not found' });
      return;
    }

    const canDeleteAll = user.role.permissions.includes('tasks:delete:all');
    const canDeleteOwn = user.role.permissions.includes('tasks:delete:own');
    const isOwner = existingTask.userId === user.id;

    if (!canDeleteAll && !(canDeleteOwn && isOwner)) {
      res.status(403).json({ message: 'Access denied' });
      return;
    }

    await prisma.task.delete({
      where: { id: taskId }
    });

    res.json({ message: 'Task deleted' });
  } catch (error) {
    console.error('Delete task error:', error);
    res.status(500).json({ message: 'Failed to delete task' });
  }
};

export const getTaskStats = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = req.user!;
    const canViewAll = user.role.permissions.includes('tasks:read:all');

    const where = canViewAll ? {} : {
      OR: [
        { userId: user.id },
        { assignedTo: user.id }
      ]
    };

    const [total, todo, inProgress, completed] = await Promise.all([
      prisma.task.count({ where }),
      prisma.task.count({ where: { ...where, status: 'TODO' } }),
      prisma.task.count({ where: { ...where, status: 'IN_PROGRESS' } }),
      prisma.task.count({ where: { ...where, status: 'COMPLETED' } })
    ]);

    res.json({
      stats: {
        total,
        todo,
        inProgress,
        completed
      }
    });
  } catch (error) {
    console.error('Get task stats error:', error);
    res.status(500).json({ message: 'Failed to fetch task stats' });
  }
};
