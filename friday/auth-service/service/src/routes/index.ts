import { Router } from 'express';

import routes from '@routes/v1';
import healthRoutes from '@routes/health.route';

const router = Router();

router.use('/v1', routes);
router.use('/life-line', healthRoutes);

export default router;
