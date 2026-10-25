import { Router } from 'express';
import { getTrustTransactions, createTrustTransaction, updateTrustTransaction } from '../controller/trustController.js';
import { verifyAuth, verifyRole } from '../middleware/authMiddleware.js';

const router = Router();

router.get('/', verifyAuth, getTrustTransactions);
router.post('/', verifyAuth, createTrustTransaction);
router.put('/:id', verifyRole(['ADMIN', 'ATTORNEY']), updateTrustTransaction); // <-- Add this route

export default router;