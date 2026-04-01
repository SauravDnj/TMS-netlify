import { Router, Request, Response, NextFunction } from 'express';
import { body, validationResult } from 'express-validator';
import {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  updateUserRole,
  getRoles
} from '../controllers/userController';
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
const createUserValidation = [
  body('email').isEmail().withMessage('Valid email is required').trim().normalizeEmail(),
  body('username')
    .trim()
    .isLength({ min: 3 })
    .withMessage('Username must be at least 3 characters'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
  body('roleId').isInt().withMessage('Valid role ID is required')
];

const updateUserValidation = [
  body('email').optional().isEmail().withMessage('Valid email is required').trim().normalizeEmail(),
  body('username')
    .optional()
    .trim()
    .isLength({ min: 3 })
    .withMessage('Username must be at least 3 characters'),
  body('password')
    .optional()
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters')
];

const roleChangeValidation = [
  body('roleId').isInt().withMessage('Valid role ID is required')
];

// Roles routes - requires users:read permission to see roles
router.get('/roles', hasPermission('users:read'), getRoles);

// User routes
router.get('/', hasPermission('users:read'), getUsers);
router.get('/:id', hasPermission('users:read'), getUser);
router.post('/', hasPermission('users:create'), createUserValidation, validate, createUser);
router.put('/:id', hasPermission('users:update'), updateUserValidation, validate, updateUser);
router.delete('/:id', hasPermission('users:delete'), deleteUser);
router.put('/:id/role', hasPermission('roles:manage'), roleChangeValidation, validate, updateUserRole);

export default router;
