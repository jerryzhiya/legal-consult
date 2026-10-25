import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_legal_key';

export interface JwtPayload {
  userId: string;
  email: string;
  role: 'CLIENT' | 'ATTORNEY' | 'ADMIN';
}

// Extend Express Request type to include authenticated user data
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

/**
 * Express Middleware to Verify JWT Authentication Token
 */
export function verifyAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      error: 'Access token missing or malformed.',
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
    req.user = decoded; // Attach decoded user information to the request object
    next(); // Proceed to the controller/next middleware
  } catch (err) {
    return res.status(403).json({
      success: false,
      error: 'Invalid or expired token.',
    });
  }
}

/**
 * Middleware Factory for Role-Based Access Control (RBAC)
 * Usage: router.get('/admin-reports', verifyAuth, requireRole(['ADMIN', 'ATTORNEY']), AdminController.getReports)
 */
export function requireRole(allowedRoles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: 'Access denied: Insufficient permissions.',
      });
    }
    next();
  };
}