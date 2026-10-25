import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';

// GET /api/leads - Retrieve all leads
export const getLeads = async (req: Request, res: Response) => {
  try {
    const leads = await prisma.lead.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return res.status(200).json({
      success: true,
      data: leads,
    });
  } catch (error) {
    console.error('Error fetching leads:', error);
    return res.status(500).json({ success: false, error: 'Failed to fetch leads.' });
  }
};

// POST /api/leads - Create a new lead
export const createLead = async (req: Request, res: Response) => {
  try {
    const { recordTitle, practiceArea, owner, status } = req.body;

    if (!recordTitle) {
      return res.status(400).json({ success: false, error: 'Lead record title (name) is required.' });
    }

    const newLead = await prisma.lead.create({
      data: {
        recordTitle,
        practiceArea: practiceArea || 'General Consultation',
        owner: owner || 'Unassigned',
        status: status || 'NEW',
      },
    });

    return res.status(201).json({
      success: true,
      message: 'Lead created successfully',
      data: newLead,
    });
  } catch (error) {
    console.error('Failed to create lead:', error);
    return res.status(500).json({ success: false, error: 'Failed to create lead.' });
  }
};

// PUT /api/leads/:id - Update an existing lead
export const updateLead = async (req: Request, res: Response) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const { recordTitle, practiceArea, owner, status } = req.body;

    const existing = await prisma.lead.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ success: false, error: 'Lead record not found.' });
    }

    const updatedLead = await prisma.lead.update({
      where: { id },
      data: {
        recordTitle: recordTitle !== undefined ? recordTitle : existing.recordTitle,
        practiceArea: practiceArea !== undefined ? practiceArea : existing.practiceArea,
        owner: owner !== undefined ? owner : existing.owner,
        status: status !== undefined ? status : existing.status,
      },
    });

    return res.status(200).json({
      success: true,
      message: 'Lead updated successfully',
      data: updatedLead,
    });
  } catch (error) {
    console.error('Failed to update lead:', error);
    return res.status(500).json({ success: false, error: 'Failed to update lead.' });
  }
};

// DELETE /api/leads/:id - Delete a lead record (Admin Only)
export const deleteLead = async (req: Request, res: Response) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

    const existing = await prisma.lead.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ success: false, error: 'Lead record not found.' });
    }

    await prisma.lead.delete({ where: { id } });

    return res.status(200).json({
      success: true,
      message: 'Lead record deleted successfully',
    });
  } catch (error) {
    console.error('Failed to delete lead:', error);
    return res.status(500).json({ success: false, error: 'Failed to delete lead.' });
  }
};