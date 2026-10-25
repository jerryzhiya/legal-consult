import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// @desc    Get all users or filter by CLIENT role
// @route   GET /api/users
// @access  Private (Admin / Attorney)
export const getUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const clients = await prisma.user.findMany({
      where: { role: 'CLIENT' },
      select: {
        id: true,
        fullName: true,
        email: true,
        role: true,
      },
    });

    res.status(200).json({
      success: true,
      count: clients.length,
      data: clients,
    });
  } catch (err: any) {
    console.error('Error fetching users:', err);
    res.status(500).json({ success: false, error: 'Server error fetching clients.' });
  }
};