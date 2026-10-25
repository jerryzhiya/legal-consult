import { Router } from 'express';
import { verifyAuth } from '../middleware/authMiddleware.js';
import { getAppointments, createAppointment } from '../controller/appointmentController.js';

const router = Router();

router.get('/', verifyAuth, getAppointments);
router.post('/', verifyAuth, createAppointment);

export default router;