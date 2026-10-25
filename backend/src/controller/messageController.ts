import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { AuthRequest } from '../middleware/authMiddleware';

// GET /api/messages - Fetch messages dynamically for admin or client
export const getMessages = async (req: Request, res: Response): Promise<void> => {
  try {
    const authReq = req as AuthRequest;
    const userId = authReq.user?.id;

    if (!userId) {
      res.status(401).json({ success: false, error: 'Unauthorized: Missing user context.' });
      return;
    }

    const whereClause = authReq.user?.role === 'ADMIN' ? {} : {
      OR: [{ senderId: userId }, { receiverId: userId }]
    };

    const messages = await prisma.message.findMany({
      where: whereClause,
      orderBy: { createdAt: 'asc' },
    });

    res.status(200).json({ success: true, data: messages });
  } catch (error) {
    console.error('Error fetching messages dynamically:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch messages.' });
  }
};

export const getMessageContacts = async (req: Request, res: Response): Promise<void> => {
  try {
    const authReq = req as AuthRequest;
    const role = authReq.user?.role;

    if (!role) {
      res.status(401).json({ success: false, error: 'Unauthorized: Missing user context.' });
      return;
    }

    const contacts = await prisma.user.findMany({
      where: role === 'CLIENT'
        ? { role: { in: ['ADMIN', 'ATTORNEY'] } }
        : { role: 'CLIENT' },
      select: { id: true, fullName: true, email: true, role: true },
      orderBy: { fullName: 'asc' },
    });

    res.status(200).json({ success: true, data: contacts });
  } catch (error) {
    console.error('Error fetching message contacts:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch message contacts.' });
  }
};

// POST /api/messages - Send a secure message
export const sendMessage = async (req: Request, res: Response): Promise<void> => {
  try {
    const authReq = req as AuthRequest;
    const senderId = authReq.user?.id;
    const senderRole = authReq.user?.role;
    const { receiverId, content } = req.body;

    if (!senderId) {
      res.status(401).json({ success: false, error: 'Unauthorized: Sender ID missing.' });
      return;
    }

    if (!content || !receiverId) {
      res.status(400).json({ success: false, error: 'Recipient and message content are required.' });
      return;
    }

    const receiver = await prisma.user.findUnique({
      where: { id: receiverId },
      select: { role: true },
    });

    if (!receiver) {
      res.status(404).json({ success: false, error: 'Recipient not found.' });
      return;
    }

    const validRecipient = senderRole === 'CLIENT'
      ? receiver.role === 'ADMIN' || receiver.role === 'ATTORNEY'
      : receiver.role === 'CLIENT';

    if (!validRecipient) {
      res.status(403).json({ success: false, error: 'Messages can only be sent between clients and legal staff.' });
      return;
    }

    const newMessage = await prisma.message.create({
      data: {
        senderId,
        receiverId,
        content,
      },
      include: {
        sender: {
          select: { id: true, fullName: true, email: true, role: true }
        },
        receiver: {
          select: { id: true, fullName: true, email: true, role: true }
        }
      }
    });

    res.status(201).json({ success: true, data: newMessage });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ success: false, error: 'Failed to send message.' });
  }
};