import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { dbService } from '../services/dbService';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    name: string;
    email: string;
    role: 'admin' | 'student';
  };
}

const JWT_SECRET = process.env.JWT_SECRET || 'korograde_secret_key_fixed_for_immediate_runnability';

export function authenticateJWT(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (authHeader) {
    const token = authHeader.split(' ')[1]; // Format: Bearer <token>

    if (!token) {
      return res.status(401).json({ message: 'Authentication token missing' });
    }

    jwt.verify(token, JWT_SECRET, async (err, decoded: any) => {
      if (err) {
        return res.status(403).json({ message: 'Invalid or expired token' });
      }

      const user = await dbService.getUserById(decoded.id);
      if (!user) {
        return res.status(401).json({ message: 'User associated with this token no longer exists' });
      }

      req.user = {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      };
      next();
    });
  } else {
    res.status(401).json({ message: 'Authorization header is required' });
  }
}

export function authorizeRole(roles: ('admin' | 'student')[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized. Authenticated user expected' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Forbidden. You do not have permissions to access this source' });
    }

    next();
  };
}
