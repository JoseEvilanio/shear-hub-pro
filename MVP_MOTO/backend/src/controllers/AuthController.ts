import { Request, Response } from 'express';
import { AuthService } from '../services/AuthService';

export class AuthController {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  /**
   * Login
   */
  login = async (req: Request, res: Response): Promise<void> => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        res.status(400).json({
          error: {
            message: 'Email e senha são obrigatórios',
            code: 'MISSING_CREDENTIALS'
          }
        });
        return;
      }

      const authResponse = await this.authService.login({ email, password });

      res.status(200).json({
        success: true,
        data: authResponse,
        message: 'Login realizado com sucesso'
      });
    } catch (error: any) {
      res.status(401).json({
        error: {
          message: error.message,
          code: 'LOGIN_FAILED'
        }
      });
    }
  };

  /**
   * Refresh Token
   */
  refreshToken = async (req: Request, res: Response): Promise<void> => {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        res.status(400).json({
          error: {
            message: 'Refresh token é obrigatório',
            code: 'MISSING_REFRESH_TOKEN'
          }
        });
        return;
      }

      const tokens = await this.authService.refreshToken(refreshToken);

      res.status(200).json({
        success: true,
        data: tokens,
        message: 'Token renovado com sucesso'
      });
    } catch (error: any) {
      res.status(401).json({
        error: {
          message: error.message,
          code: 'REFRESH_FAILED'
        }
      });
    }
  };

  /**
   * Verificar Token
   */
  verifyToken = async (req: Request, res: Response): Promise<void> => {
    try {
      const authHeader = req.headers.authorization;
      const token = authHeader?.split(' ')[1];

      if (!token) {
        res.status(401).json({
          error: {
            message: 'Token não fornecido',
            code: 'MISSING_TOKEN'
          }
        });
        return;
      }

      const payload = await this.authService.verifyToken(token);

      res.status(200).json({
        success: true,
        data: payload,
        message: 'Token válido'
      });
    } catch (error: any) {
      res.status(401).json({
        error: {
          message: error.message,
          code: 'INVALID_TOKEN'
        }
      });
    }
  };

  /**
   * Logout (apenas retorna sucesso, pois JWT é stateless)
   */
  logout = async (_req: Request, res: Response): Promise<void> => {
    res.status(200).json({
      success: true,
      message: 'Logout realizado com sucesso'
    });
  };

  /**
   * Criar usuário (apenas para admins)
   */
  createUser = async (req: Request, res: Response): Promise<void> => {
    try {
      const { email, password, name, role } = req.body;

      if (!email || !password || !name) {
        res.status(400).json({
          error: {
            message: 'Email, senha e nome são obrigatórios',
            code: 'MISSING_FIELDS'
          }
        });
        return;
      }

      const user = await this.authService.createUser({
        email,
        password,
        name,
        role
      });

      res.status(201).json({
        success: true,
        data: user,
        message: 'Usuário criado com sucesso'
      });
    } catch (error: any) {
      res.status(400).json({
        error: {
          message: error.message,
          code: 'CREATE_USER_FAILED'
        }
      });
    }
  };

  /**
   * Alterar senha
   */
  changePassword = async (req: Request, res: Response): Promise<void> => {
    try {
      const { currentPassword, newPassword } = req.body;
      const userId = (req as any).user?.userId;

      if (!currentPassword || !newPassword) {
        res.status(400).json({
          error: {
            message: 'Senha atual e nova senha são obrigatórias',
            code: 'MISSING_PASSWORDS'
          }
        });
        return;
      }

      if (!userId) {
        res.status(401).json({
          error: {
            message: 'Usuário não autenticado',
            code: 'UNAUTHORIZED'
          }
        });
        return;
      }

      await this.authService.changePassword(userId, currentPassword, newPassword);

      res.status(200).json({
        success: true,
        message: 'Senha alterada com sucesso'
      });
    } catch (error: any) {
      res.status(400).json({
        error: {
          message: error.message,
          code: 'CHANGE_PASSWORD_FAILED'
        }
      });
    }
  };
}