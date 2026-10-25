import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET /api/trust-transactions
export const getTrustTransactions = async (req: Request, res: Response) => {
  try {
    const transactions = await prisma.trustTransaction.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return res.status(200).json({
      success: true,
      data: transactions,
    });
  } catch (error: any) {
    console.error('Error fetching trust transactions:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch trust account ledger records.',
    });
  }
};

// POST /api/trust-transactions
export const createTrustTransaction = async (req: Request, res: Response) => {
  try {
    const { type, clientName, matterTitle, amount } = req.body;

    if (!clientName || amount === undefined) {
      return res.status(400).json({
        success: false,
        error: 'Client name and amount are required.',
      });
    }

    const parsedAmount = parseFloat(amount);

    const newTransaction = await prisma.trustTransaction.create({
      data: {
        type: type || 'Client retainer / deposit',
        clientName,
        matterTitle: matterTitle || 'General Trust Matter',
        amount: parsedAmount,
        balance: Math.abs(parsedAmount),
      },
    });

    return res.status(201).json({
      success: true,
      message: 'Trust transaction recorded successfully',
      data: newTransaction,
    });
  } catch (error: any) {
    console.error('Error recording trust transaction:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to save trust transaction.',
    });
  }
};

// PUT /api/trust-transactions/:id
export const updateTrustTransaction = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    const { type, clientName, matterTitle, amount } = req.body;

    if (typeof id !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'A valid transaction ID is required.',
      });
    }

    const parsedAmount = amount !== undefined ? parseFloat(amount) : undefined;

    const updatedTransaction = await prisma.trustTransaction.update({
      where: { id },
      data: {
        ...(type && { type }),
        ...(clientName && { clientName }),
        ...(matterTitle && { matterTitle }),
        ...(parsedAmount !== undefined && {
          amount: parsedAmount,
          balance: Math.abs(parsedAmount),
        }),
      },
    });

    return res.status(200).json({
      success: true,
      message: 'Trust transaction updated successfully',
      data: updatedTransaction,
    });
  } catch (error: any) {
    console.error('Error updating trust transaction:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to update trust transaction.',
    });
  }
};