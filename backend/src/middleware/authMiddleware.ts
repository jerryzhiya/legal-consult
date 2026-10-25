import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';

// Explicitly define your user payload structure extending JwtPayload
export interface CustomJwtPayload extends JwtPayload {
  userId: string;
  id: string;
  email: string;
  role: 'CLIENT' | 'ATTORNEY' | 'ADMIN';
}

// Extend Express Request to include req.user
export interface AuthRequest extends Request {
  user?: CustomJwtPayload;
}

export const verifyAuth = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ success: false, error: 'Access denied. No token provided.' });
    return;
  }

  const token = authHeader.split(' ')[1];
  const jwtSecret = process.env.JWT_SECRET;

  try {
    const decoded = jwt.verify(token, jwtSecret!) as CustomJwtPayload;
    (req as AuthRequest).user = decoded;
    next();
  } catch (err) {
    res.status(403).json({ success: false, error: 'Invalid or expired token.' });
    return;
  }
};

export const verifyRole = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const authReq = req as AuthRequest;
    if (!authReq.user || !roles.includes(authReq.user.role)) {
      res.status(403).json({ success: false, error: 'Access forbidden: Insufficient permissions.' });
      return;
    }
    next();
  };
};