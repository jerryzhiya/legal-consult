import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';

// GET /api/calendar - Retrieve all calendar events
export const getEvents = async (req: Request, res: Response) => {
  try {
    const events = await prisma.calendarEvent.findMany({
      orderBy: { date: 'asc' },
    });

    return res.status(200).json({
      success: true,
      data: events,
    });
  } catch (error) {
    console.error('Error fetching calendar events:', error);
    return res.status(500).json({ success: false, error: 'Failed to fetch calendar events.' });
  }
};

// POST /api/calendar - Create a new calendar event
export const createEvent = async (req: Request, res: Response) => {
  try {
    const { title, category, date, timeString, location, attendee } = req.body;

    if (!title || !date) {
      return res.status(400).json({ success: false, error: 'Event title and date are required.' });
    }

    const newEvent = await prisma.calendarEvent.create({
      data: {
        title,
        category: category || 'MEETING',
        date: new Date(date),
        timeString: timeString || '9:00 AM',
        location,
        attendee,
      },
    });

    return res.status(201).json({
      success: true,
      message: 'Calendar event created successfully',
      data: newEvent,
    });
  } catch (error) {
    console.error('Failed to create calendar event:', error);
    return res.status(500).json({ success: false, error: 'Failed to create calendar event.' });
  }
};

// PUT /api/calendar/:id - Update an existing calendar event
export const updateEvent = async (req: Request, res: Response) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const { title, category, date, timeString, location, attendee } = req.body;

    if (!id) {
      return res.status(400).json({ success: false, error: 'A valid calendar event ID is required.' });
    }

    const existing = await prisma.calendarEvent.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ success: false, error: 'Calendar event not found.' });
    }

    const updatedEvent = await prisma.calendarEvent.update({
      where: { id },
      data: {
        title: title !== undefined ? title : existing.title,
        category: category !== undefined ? category : existing.category,
        date: date !== undefined ? new Date(date) : existing.date,
        timeString: timeString !== undefined ? timeString : existing.timeString,
        location: location !== undefined ? location : existing.location,
        attendee: attendee !== undefined ? attendee : existing.attendee,
      },
    });

    return res.status(200).json({
      success: true,
      message: 'Calendar event updated successfully',
      data: updatedEvent,
    });
  } catch (error) {
    console.error('Failed to update calendar event:', error);
    return res.status(500).json({ success: false, error: 'Failed to update calendar event.' });
  }
};

// DELETE /api/calendar/:id - Delete a calendar event (Admin Only)
export const deleteEvent = async (req: Request, res: Response) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

    if (!id) {
      return res.status(400).json({ success: false, error: 'A valid calendar event ID is required.' });
    }

    const existing = await prisma.calendarEvent.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ success: false, error: 'Calendar event not found.' });
    }

    await prisma.calendarEvent.delete({ where: { id } });

    return res.status(200).json({
      success: true,
      message: 'Calendar event deleted successfully',
    });
  } catch (error) {
    console.error('Failed to delete calendar event:', error);
    return res.status(500).json({ success: false, error: 'Failed to delete calendar event.' });
  }
};