import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';

// GET /api/reports/summary - Retrieve aggregate firm metrics & financials
export const getFirmReportSummary = async (req: Request, res: Response) => {
  try {
    // Fetch counts and aggregations in parallel for performance
    const [totalClients, totalLeads, totalEvents, billingAggregates] = await Promise.all([
      prisma.user.count({ where: { role: 'CLIENT' } }),
      prisma.lead.count(),
      prisma.calendarEvent.count(),
      prisma.billingRecord.aggregate({
        _sum: { amount: true },
        _count: { id: true },
      }),
    ]);

    // Calculate paid vs pending billings if needed
    const paidBillings = await prisma.billingRecord.aggregate({
      where: { status: 'PAID' },
      _sum: { amount: true },
    });

    const reportData = {
      generatedAt: new Date().toISOString(),
      metrics: {
        totalClients,
        totalLeads,
        totalScheduledEvents: totalEvents,
        totalBillingRecordsCount: billingAggregates._count.id,
        totalBilledAmount: billingAggregates._sum.amount || 0,
        totalCollectedAmount: paidBillings._sum.amount || 0,
      },
    };

    return res.status(200).json({
      success: true,
      data: reportData,
    });
  } catch (error) {
    console.error('Error generating report summary:', error);
    return res.status(500).json({ success: false, error: 'Failed to generate firm performance report.' });
  }
};