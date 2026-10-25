import { Router } from 'express';
import { getNotifications, markNotificationAsRead, deleteNotification } from '../controller/notificationController.js';
import { verifyAuth, verifyRole } from '../middleware/authMiddleware';

const router = Router();



router.get('/', verifyAuth, verifyRole(['ADMIN', 'ATTORNEY']), getNotifications);
router.patch('/:id/read', verifyAuth, verifyRole(['ADMIN', 'ATTORNEY']), markNotificationAsRead);
router.delete('/:id', verifyAuth, verifyRole(['ADMIN']), deleteNotification);

export default router;