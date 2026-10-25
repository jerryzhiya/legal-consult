import { Router } from 'express';
import { getFirmReportSummary } from '../controller/reportController.js';
import { verifyAuth, verifyRole } from '../middleware/authMiddleware';

const router = Router();

// Secure report endpoints
router.use(verifyAuth, verifyRole(['ADMIN', 'ATTORNEY']));

router.get('/summary', getFirmReportSummary);

export default router;