import { Router, Request, Response, NextFunction } from 'express';
import { auth } from '../middleware/auth';
import reportController from '../controllers/report.controller';
import { AuthRequest } from '../types';

interface ReportAuthRequest extends Request {
  user?: AuthRequest['user'];
  query: {
    type?: string;
    format?: string;
    startDate?: string;
    endDate?: string;
  }
}

const router = Router();

// Admin middleware to check if user has admin role
const adminCheck = (req: ReportAuthRequest, res: Response, next: NextFunction): Response | void => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

// Validate report options middleware
const validateReportOptions = (req: ReportAuthRequest, res: Response, next: NextFunction): Response | void => {
  const { type, format } = req.query;
  
  // Validate report type
  if (!type || !['users', 'classrooms', 'communities', 'activities'].includes(type)) {
    return res.status(400).json({ error: 'Invalid report type' });
  }

  // Validate report format
  if (!format || !['json', 'pdf', 'csv'].includes(format)) {
    return res.status(400).json({ error: 'Invalid report format' });
  }

  next();
};

// Protect all report routes with authentication and admin check
router.use(auth);
router.use(adminCheck);

// Generate report endpoint with validation
router.get('/generate', validateReportOptions, reportController.generateReport);

export default router;
