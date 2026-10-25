import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';

// GET /api/billings - Retrieve all billing records
export const getBillings = async (req: Request, res: Response) => {
  try {
    const billings = await prisma.billingRecord.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return res.status(200).json({
      success: true,
      data: billings,
    });
  } catch (error) {
    console.error('Error fetching billing records:', error);
    return res.status(500).json({ success: false, error: 'Failed to fetch billing records.' });
  }
};

// POST /api/billings - Create a new billing record
export const createBilling = async (req: Request, res: Response) => {
  try {
    const { recordTitle, matterCode, owner, amount, status } = req.body;

    if (!recordTitle || amount === undefined) {
      return res.status(400).json({ success: false, error: 'Record title and amount are required.' });
    }

    const newBilling = await prisma.billingRecord.create({
      data: {
        recordTitle,
        matterCode: matterCode || 'General Matter',
        owner: owner || 'Firm Attorney',
        amount: parseFloat(amount),
        status: status || 'ACTIVE',
      },
    });

    return res.status(201).json({
      success: true,
      message: 'Billing record created successfully',
      data: newBilling,
    });
  } catch (error) {
    console.error('Failed to create billing record:', error);
    return res.status(500).json({ success: false, error: 'Failed to create billing record.' });
  }
};

// PUT /api/billings/:id - Update an existing billing record
export const updateBilling = async (req: Request, res: Response) => {
  try {
    const paramId = req.params.id;
    const id = Array.isArray(paramId) ? paramId[0] : paramId;
    if (!id) {
      return res.status(400).json({ success: false, error: 'Billing record ID is required.' });
    }
    const { recordTitle, matterCode, owner, amount, status } = req.body;

    const existing = await prisma.billingRecord.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ success: false, error: 'Billing record not found.' });
    }

    const updatedBilling = await prisma.billingRecord.update({
      where: { id },
      data: {
        recordTitle: recordTitle !== undefined ? recordTitle : existing.recordTitle,
        matterCode: matterCode !== undefined ? matterCode : existing.matterCode,
        owner: owner !== undefined ? owner : existing.owner,
        amount: amount !== undefined ? parseFloat(amount) : existing.amount,
        status: status !== undefined ? status : existing.status,
      },
    });

    return res.status(200).json({
      success: true,
      message: 'Billing record updated successfully',
      data: updatedBilling,
    });
  } catch (error) {
    console.error('Failed to update billing record:', error);
    return res.status(500).json({ success: false, error: 'Failed to update billing record.' });
  }
};

// DELETE /api/billings/:id - Delete a billing record
export const deleteBilling = async (req: Request, res: Response) => {
  try {
    const paramId = req.params.id;
    const id = Array.isArray(paramId) ? paramId[0] : paramId;
    if (!id) {
      return res.status(400).json({ success: false, error: 'Billing record ID is required.' });
    }

    const existing = await prisma.billingRecord.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ success: false, error: 'Billing record not found.' });
    }

    await prisma.billingRecord.delete({ where: { id } });

    return res.status(200).json({
      success: true,
      message: 'Billing record deleted successfully',
    });
  } catch (error) {
    console.error('Failed to delete billing record:', error);
    return res.status(500).json({ success: false, error: 'Failed to delete billing record.' });
  }
};