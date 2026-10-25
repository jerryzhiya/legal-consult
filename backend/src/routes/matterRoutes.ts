import { Router } from 'express';
import { getFirmAnalytics, getMatters, createMatter, createMatterInvoice, updateMatter, deleteMatter } from '../controller/matterController.js';
import { verifyAuth, verifyRole } from '../middleware/authMiddleware.js';

const router = Router();

// Protect all routes in this file with verifyAuth
router.use(verifyAuth);

// Define path string first ('/'), then controllers/middleware
router.get('/', getMatters);
router.get('/analytics', getFirmAnalytics);
router.post('/', verifyRole(['ADMIN', 'ATTORNEY']), createMatter);
router.post('/:id/invoices', verifyRole(['ADMIN', 'ATTORNEY']), createMatterInvoice);
router.put('/:id', verifyRole(['ADMIN', 'ATTORNEY']), updateMatter);
router.delete('/:id', verifyRole(['ADMIN']), deleteMatter);



export default router;