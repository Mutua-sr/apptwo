import { Router } from 'express';
import { Response, NextFunction } from 'express';
import { auth } from '../middleware/auth';
import reportController from '../controllers/report.controller';
import { AuthRequest } from '../types';

const router = Router();

// Admin middleware to check if user has admin role
const adminCheck = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

// Protect all report routes with authentication and admin check
router.use(auth);
router.use(adminCheck);

// Generate report endpoint
router.get('/generate', reportController.generateReport);

export default router;