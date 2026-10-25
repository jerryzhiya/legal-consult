import { Router } from 'express';
import { getBillings, createBilling, updateBilling, deleteBilling } from '../controller/billingController.js';
import { verifyAuth, verifyRole } from '../middleware/authMiddleware';

const router = Router();


router.get('/', verifyAuth, verifyRole(['ADMIN', 'ATTORNEY']), getBillings);
router.post('/', verifyAuth, verifyRole(['ADMIN', 'ATTORNEY']), createBilling);
router.put('/:id', verifyAuth, verifyRole(['ADMIN', 'ATTORNEY']), updateBilling);
router.delete('/:id', verifyAuth, verifyRole(['ADMIN']), deleteBilling);

export default router;