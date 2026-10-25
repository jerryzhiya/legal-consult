import { Router } from 'express';
import { getEvents, createEvent, updateEvent, deleteEvent } from '../controller/calendarController.js';
import { verifyAuth, verifyRole } from '../middleware/authMiddleware';

const router = Router();



router.get('/', verifyAuth, verifyRole(['ADMIN', 'ATTORNEY']), getEvents);
router.post('/', verifyAuth, verifyRole(['ADMIN', 'ATTORNEY']), createEvent);
router.put('/:id', verifyAuth, verifyRole(['ADMIN', 'ATTORNEY']), updateEvent);

// Admin-only deletion rule
router.delete('/:id', verifyAuth, verifyRole(['ADMIN', 'ATTORNEY']), deleteEvent);

export default router;