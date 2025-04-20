import { Router } from 'express';
import { HealthController } from '@controllers/life-line.controller';

const router = Router();

router.get('/health', HealthController.getHealth);
router.get('/', HealthController.getlifeLine);

export default router;
