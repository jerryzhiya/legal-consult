import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';

// GET /api/notifications - Retrieve recent alerts
export const getNotifications = async (req: Request, res: Response) => {
  try {
    const notifications = await prisma.notification.findMany({
      orderBy: { createdAt: 'desc' },
      take: 20,
    });

    return res.status(200).json({
      success: true,
      data: notifications,
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return res.status(500).json({ success: false, error: 'Failed to fetch notifications.' });
  }
};

// PATCH /api/notifications/:id/read - Mark notification as read
export const markNotificationAsRead = async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    const updated = await prisma.notification.update({
      where: { id },
      data: { isRead: true },
    });

    return res.status(200).json({
      success: true,
      message: 'Notification marked as read',
      data: updated,
    });
  } catch (error) {
    console.error('Failed to update notification:', error);
    return res.status(500).json({ success: false, error: 'Failed to update notification.' });
  }
};

// DELETE /api/notifications/:id - Archive/Delete notification
export const deleteNotification = async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    await prisma.notification.delete({ where: { id } });

    return res.status(200).json({
      success: true,
      message: 'Notification archived successfully',
    });
  } catch (error) {
    console.error('Failed to delete notification:', error);
    return res.status(500).json({ success: false, error: 'Failed to delete notification.' });
  }
};