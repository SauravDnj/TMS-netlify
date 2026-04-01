import { Router, Request, Response, NextFunction } from 'express';
import { body, validationResult } from 'express-validator';
import { register, login, getMe, impersonateUser } from '../controllers/authController';
import { authenticate } from '../middleware/auth';
import { isAdmin } from '../middleware/permission';

const router = Router();

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
const registerValidation = [
  body('email').isEmail().withMessage('Valid email is required').trim().normalizeEmail(),
  body('username')
    .trim()
    .isLength({ min: 3 })
    .withMessage('Username must be at least 3 characters'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters')
];

const loginValidation = [
  body('email').isEmail().withMessage('Valid email is required').trim().normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required')
];

// Routes
router.post('/register', registerValidation, validate, register);
router.post('/login', loginValidation, validate, login);
router.get('/me', authenticate, getMe);

// Admin impersonation - login as another user
router.post('/impersonate/:userId', authenticate, isAdmin, impersonateUser);

export default router;
