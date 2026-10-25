import { Router } from 'express';
import { getTasks, createTask, toggleTaskCompletion } from '../controller/taskController.js';
import { verifyAuth, verifyRole } from '../middleware/authMiddleware.js';

const router = Router();

// Retrieve all tasks
router.get('/', verifyAuth, getTasks);

// Create a new task (Must be POST, not GET!)
router.post('/', verifyAuth, verifyRole(['ADMIN']), createTask);

// Toggle task completion (using an ID parameter, e.g. /api/tasks/:id/toggle or similar)
router.put('/:id/toggle', verifyAuth, verifyRole(['ADMIN', 'ATTORNEY']), toggleTaskCompletion);

export default router;