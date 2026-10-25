import { Router } from 'express';
import { getLeads, createLead, updateLead, deleteLead } from '../controller/leadController';


import { verifyAuth, verifyRole } from '../middleware/authMiddleware';

const router = Router();


router.get('/', verifyAuth, verifyRole(['ADMIN', 'ATTORNEY']), getLeads);
router.post('/', verifyAuth, verifyRole(['ADMIN', 'ATTORNEY']), createLead);
router.put('/:id', verifyAuth, verifyRole(['ADMIN', 'ATTORNEY']), updateLead);

// Admin-only deletion rule
router.delete('/:id', verifyAuth, verifyRole(['ADMIN']), deleteLead);

export default router;