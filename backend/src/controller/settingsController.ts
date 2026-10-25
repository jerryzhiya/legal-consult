import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET /api/settings
export const getSettings = async (req: Request, res: Response) => {
  try {
    // Assuming user ID is attached to request via auth middleware (e.g., req.user.id)
    const userId = (req as any).user?.id || 'default-admin-id';

    let settings = await prisma.setting.findUnique({
      where: { userId },
    });

    // If no settings exist yet, create a default record
    if (!settings) {
      settings = await prisma.setting.create({
        data: {
          userId,
          fullName: 'John Doe',
          role: 'Managing Attorney',
          email: 'john.doe@mcalilegal.com',
          phone: '+1 212 555 0147',
          firmName: 'MCALI Legal Consult',
          primaryOffice: 'New York, NY',
          officeAddress: '350 Fifth Avenue, Suite 4200, New York, NY 10118',
          caseActivity: true,
          newLeadAlerts: true,
          billingSummaries: false,
        },
      });
    }

    return res.status(200).json({
      success: true,
      data: settings,
    });
  } catch (error: any) {
    console.error('Error fetching settings:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error while fetching settings.',
    });
  }
};

// PUT /api/settings
export const updateSettings = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id || 'default-admin-id';
    const {
      fullName,
      role,
      email,
      phone,
      firmName,
      primaryOffice,
      officeAddress,
      notifications,
    } = req.body;

    const updatedSettings = await prisma.setting.upsert({
      where: { userId },
      update: {
        fullName,
        role,
        email,
        phone,
        firmName,
        primaryOffice,
        officeAddress,
        caseActivity: notifications?.caseActivity,
        newLeadAlerts: notifications?.newLeadAlerts,
        billingSummaries: notifications?.billingSummaries,
      },
      create: {
        userId,
        fullName,
        role,
        email,
        phone,
        firmName,
        primaryOffice,
        officeAddress,
        caseActivity: notifications?.caseActivity ?? true,
        newLeadAlerts: notifications?.newLeadAlerts ?? true,
        billingSummaries: notifications?.billingSummaries ?? false,
      },
    });

    return res.status(200).json({
      success: true,
      message: 'Settings updated successfully',
      data: updatedSettings,
    });
  } catch (error: any) {
    console.error('Error updating settings:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to update settings.',
    });
  }
};