import { Router } from 'express';
import { AuthController } from '../controllers/AuthController';

const router = Router();
const authController = new AuthController();

// Rotas públicas
router.post('/login', authController.login);
router.post('/refresh', authController.refreshToken);
router.post('/verify', authController.verifyToken);
router.post('/logout', authController.logout);

// Rotas protegidas (requerem autenticação)
// router.post('/create-user', authMiddleware, adminMiddleware, authController.createUser);
// router.post('/change-password', authMiddleware, authController.changePassword);

export default router;