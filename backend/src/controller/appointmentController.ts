import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { AuthRequest } from '../middleware/authMiddleware';

export const getAppointments = async (req: Request, res: Response): Promise<void> => {
  try {
    const authReq = req as AuthRequest;
    const userId = authReq.user?.id;
    const userRole = authReq.user?.role;

    if (!userId) {
      res.status(401).json({ success: false, error: 'Unauthorized.' });
      return;
    }

    const whereClause = userRole === 'ADMIN' || userRole === 'ATTORNEY' ? {} : { userId };

    const appointments = await prisma.appointment.findMany({
      where: whereClause,
      orderBy: { dateTime: 'asc' },
      include: {
        user: { select: { id: true, fullName: true, email: true } },
        matter: { select: { id: true, title: true, caseNumber: true } },
      },
    });

    res.status(200).json({ success: true, data: appointments });
  } catch (error) {
    console.error('Error fetching appointments:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch appointments.' });
  }
};

export const createAppointment = async (req: Request, res: Response): Promise<void> => {
  try {
    const authReq = req as AuthRequest;
    const userId = authReq.user?.id;
    const userRole = authReq.user?.role;
    const { title, matterId, dateTime, location } = req.body;

    if (!userId) {
      res.status(401).json({ success: false, error: 'Unauthorized.' });
      return;
    }

    if (
      typeof title !== 'string' ||
      (matterId !== undefined && matterId !== '' && typeof matterId !== 'string') ||
      typeof dateTime !== 'string' ||
      typeof location !== 'string' ||
      !title.trim() ||
      !location.trim()
    ) {
      res.status(400).json({ success: false, error: 'Title, date/time, and location are required. Matter is optional.' });
      return;
    }

    const parsedDateTime = new Date(dateTime);
    if (Number.isNaN(parsedDateTime.getTime()) || parsedDateTime <= new Date()) {
      res.status(400).json({ success: false, error: 'Choose a valid appointment date and time in the future.' });
      return;
    }

    let validMatterId: string | undefined;
    if (typeof matterId === 'string' && matterId) {
      const matter = await prisma.matter.findFirst({
        where: userRole === 'CLIENT' ? { id: matterId, clientId: userId } : { id: matterId },
        select: { id: true },
      });

      if (!matter) {
        res.status(404).json({ success: false, error: 'Matter not found.' });
        return;
      }
      validMatterId = matter.id;
    }

    const newAppointment = await prisma.appointment.create({
      data: {
        title: title.trim(),
        matterId: validMatterId,
        dateTime: parsedDateTime,
        location: location.trim(),
        userId,
      },
    });

    res.status(201).json({ success: true, data: newAppointment });
  } catch (error) {
    console.error('Error creating appointment:', error);
    res.status(500).json({ success: false, error: 'Failed to create appointment.' });
  }
};