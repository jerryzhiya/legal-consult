import { Router } from 'express';
import { getClients, createClient, updateClient, deleteClient } from '../controller/clientController.js'
import { verifyAuth, verifyRole } from '../middleware/authMiddleware';

const router = Router();

// All client routes require authentication and Admin/Attorney permissions


router.get('/', verifyAuth, verifyRole(['ADMIN', 'ATTORNEY']), getClients);          // Read all
router.post('/', verifyAuth, verifyRole(['ADMIN', 'ATTORNEY']), createClient);      // Create
router.put('/:id', verifyAuth, verifyRole(['ADMIN', 'ATTORNEY']), updateClient);    // Update
router.delete('/:id', verifyAuth, verifyRole(['ADMIN']), deleteClient); // Delete

export default router;