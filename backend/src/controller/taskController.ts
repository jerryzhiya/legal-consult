import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Get tasks
export const getTasks = async (req: Request, res: Response) => {
  try {
    const tasks = await prisma.task.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return res.status(200).json({ success: true, data: tasks });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: 'Failed to fetch tasks.' });
  }
};

// CREATE a new task
export const createTask = async (req: Request, res: Response) => {
  try {
    const { title, matter, time, priority } = req.body;

    if (!title) {
      return res.status(400).json({ success: false, error: 'Task title is required.' });
    }

    const newTask = await prisma.task.create({
      data: {
        title,
        matter: matter || 'General Firm Task',
        time: time || 'Today',
        priority: priority || 'NORMAL',
        completed: false,
      },
    });

    return res.status(201).json({
      success: true,
      message: 'Task created successfully',
      data: newTask,
    });
  } catch (err: any) {
    console.error('Create task error:', err);
    return res.status(500).json({ success: false, error: 'Failed to create task.' });
  }
};

// Toggle task completion
export const toggleTaskCompletion = async (req: Request, res: Response) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const { completed } = req.body;

    const updatedTask = await prisma.task.update({
      where: { id },
      data: { completed },
    });

    return res.status(200).json({ success: true, data: updatedTask });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: 'Failed to update task.' });
  }
};