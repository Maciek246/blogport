import { Router } from 'express';
import application from '../controllers/applicationController';
import { promisifyRedis } from '../middlewares/redis';

const router = Router();

router.get('/', promisifyRedis, application.index);
router.get('/about', application.about);

export default router;