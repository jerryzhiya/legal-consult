import { Router } from 'express';
import { getUsers } from '../controller/userController.js';
import { verifyAuth, verifyRole } from '../middleware/authMiddleware.js';

const router = Router();

router.use(verifyAuth);
router.get('/', verifyRole(['ADMIN', 'ATTORNEY']), getUsers);

export default router;