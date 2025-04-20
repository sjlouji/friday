import { Router } from 'express';
import { HealthController } from '@/controllers/life-line.controller';
import { AuthController } from '@/controllers/auth.controller';

const router = Router();

// Health check routes
router.get('/health', HealthController.getHealth);
router.get('/health/live', HealthController.getlifeLine);

// Auth routes
router.post('/auth/register', AuthController.register);
router.post('/auth/login', AuthController.login);
router.post('/auth/logout', AuthController.logout);

export default router;
