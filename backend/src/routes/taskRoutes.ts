import { Router, Request, Response, NextFunction } from 'express';
import { body, validationResult } from 'express-validator';
import {
  getTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask,
  getTaskStats
} from '../controllers/taskController';
import { authenticate } from '../middleware/auth';
import { hasPermission } from '../middleware/permission';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Validation result handler middleware
const validate = (req: Request, res: Response, next: NextFunction): void => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ 
      message: 'Validation failed', 
      errors: errors.array() 
    });
    return;
  }
  next();
};

// Validation middleware
const taskValidation = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ max: 200 })
    .withMessage('Title must be less than 200 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 2000 })
    .withMessage('Description must be less than 2000 characters'),
  body('status')
    .optional()
    .isIn(['TODO', 'IN_PROGRESS', 'COMPLETED'])
    .withMessage('Invalid status'),
  body('priority')
    .optional()
    .isIn(['LOW', 'MEDIUM', 'HIGH'])
    .withMessage('Invalid priority')
];

// Routes
router.get('/stats', hasPermission('tasks:read:own', 'tasks:read:all'), getTaskStats);
router.get('/', hasPermission('tasks:read:own', 'tasks:read:all'), getTasks);
router.get('/:id', hasPermission('tasks:read:own', 'tasks:read:all'), getTask);
router.post('/', hasPermission('tasks:create'), taskValidation, validate, createTask);
router.put('/:id', hasPermission('tasks:update:own', 'tasks:update:all'), updateTask);
router.delete('/:id', hasPermission('tasks:delete:own', 'tasks:delete:all'), deleteTask);

export default router;
