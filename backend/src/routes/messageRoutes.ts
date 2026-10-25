import { Router } from 'express';
import { getMessageContacts, getMessages, sendMessage } from '../controller/messageController.js';
import { verifyAuth } from '../middleware/authMiddleware.js';

const router = Router();

router.get('/contacts', verifyAuth, getMessageContacts);
router.get('/', verifyAuth, getMessages);
router.post('/', verifyAuth, sendMessage);

export default router;