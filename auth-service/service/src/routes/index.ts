import { Router } from 'express';
import { HealthController } from '@/controllers/life-line.controller';

const router = Router();

// Health check routes
router.get('/health', HealthController.getHealth);
router.get('/health/live', HealthController.getlifeLine);

// Auth routes (placeholder - to be implemented)
router.post('/auth/register', (req, res) => {
  res.status(501).json({ message: 'Not implemented yet' });
});

router.post('/auth/login', (req, res) => {
  res.status(501).json({ message: 'Not implemented yet' });
});

router.post('/auth/logout', (req, res) => {
  res.status(501).json({ message: 'Not implemented yet' });
});

export default router;
