import { Router } from 'express';
import { getSettings, updateSettings } from '../controller/settingsController';
import { verifyAuth } from '../middleware/authMiddleware'; // Optional auth guard

const router = Router();

// Apply auth middleware if your app requires authentication
router.get('/', verifyAuth, getSettings);
router.put('/', verifyAuth, updateSettings);

export default router;