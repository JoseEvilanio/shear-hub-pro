import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/AuthService';

export interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    email: string;
    role: string;
  };
}

export const authMiddleware = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.split(' ')[1];

    if (!token) {
      res.status(401).json({
        error: {
          message: 'Token de acesso não fornecido',
          code: 'MISSING_TOKEN'
        }
      });
      return;
    }

    const authService = new AuthService();
    const payload = await authService.verifyToken(token);

    req.user = payload;
    next();
  } catch (error: any) {
    res.status(401).json({
      error: {
        message: 'Token inválido ou expirado',
        code: 'INVALID_TOKEN'
      }
    });
  }
};

export const adminMiddleware = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  if (!req.user) {
    res.status(401).json({
      error: {
        message: 'Usuário não autenticado',
        code: 'UNAUTHORIZED'
      }
    });
    return;
  }

  if (req.user.role !== 'admin') {
    res.status(403).json({
      error: {
        message: 'Acesso negado. Apenas administradores podem acessar este recurso',
        code: 'FORBIDDEN'
      }
    });
    return;
  }

  next();
};

export const managerMiddleware = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  if (!req.user) {
    res.status(401).json({
      error: {
        message: 'Usuário não autenticado',
        code: 'UNAUTHORIZED'
      }
    });
    return;
  }

  if (!['admin', 'manager'].includes(req.user.role)) {
    res.status(403).json({
      error: {
        message: 'Acesso negado. Apenas administradores e gerentes podem acessar este recurso',
        code: 'FORBIDDEN'
      }
    });
    return;
  }

  next();
};