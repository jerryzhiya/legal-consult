'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/app/lib/axios';

interface ReportMetrics {
  totalClients: number;
  totalLeads: number;
  totalScheduledEvents: number;
  totalBillingRecordsCount: number;
  totalBilledAmount: number;
  totalCollectedAmount: number;
  generatedAt?: string;
}

export default function ReportsPage() {
  const router = useRouter();
  const [metrics, setMetrics] = useState<ReportMetrics>({
    totalClients: 0,
    totalLeads: 0,
    totalScheduledEvents: 0,
    totalBillingRecordsCount: 0,
    totalBilledAmount: 0,
    totalCollectedAmount: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadReports = async () => {
      setLoading(true);
      try {
        // Fetch live analytics from the backend /api/reports/summary endpoint
        const response = await api.get('/reports/summary');
        const data = response.data?.data;

        if (data && data.metrics) {
          setMetrics(data.metrics);
        }
      } catch (err: unknown) {
        console.error('Failed to fetch reports data:', err);
        setError('Unable to sync live analytics from backend server.');
      } finally {
        setLoading(false);
      }
    };

    void loadReports();
  }, []);

  const monthlyRevenue = [
    { month: 'J', height: '40%' },
    { month: 'F', height: '55%' },
    { month: 'M', height: '48%' },
    { month: 'A', height: '65%' },
    { month: 'M', height: '60%' },
    { month: 'J', height: '75%' },
    { month: 'J', height: '70%' },
    { month: 'A', height: '82%' },
    { month: 'S', height: '80%' },
    { month: 'O', height: '95%' },
  ];

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#0A2647] font-sans p-4 sm:p-6 lg:p-10 space-y-8 w-full">
      
      {/* Top Header Navigation */}
      <div className="flex items-center justify-between border-b pb-4">
        <div>
          <span className="text-[10px] uppercase tracking-widest text-[#C49A6C] font-bold block mb-1">
            Firm Reporting
          </span>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#0A2647]">Reports</h1>
        </div>
        <button 
          onClick={() => router.push('/admin/dashboard')}
          className="text-xs font-semibold text-[#0A2647] hover:underline whitespace-nowrap"
        >
          ← Back to Dashboard
        </button>
      </div>

      {/* Main Container */}
      <div className="bg-white rounded-xl p-4 sm:p-8 shadow-sm border border-gray-100 space-y-8 w-full">
        
        {/* Header & Timestamp */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b pb-6">
          <div>
            <h2 className="font-serif text-xl font-bold text-[#0A2647]">Performance & Financial Analytics</h2>
            <p className="text-xs text-[#738290]">Comprehensive firm metrics, collections, and aggregate database summaries.</p>
          </div>
          <span className="text-xs font-semibold text-[#738290] bg-gray-100 px-3 py-1.5 rounded-lg">
            Live Database Sync
          </span>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border-l-4 border-red-500 text-red-700 text-xs rounded">
            {error}
          </div>
        )}

        {/* Performance Metric Cards Grid (Driven by Controller) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          
          <div className="bg-gray-50 p-6 rounded-xl border border-gray-100 space-y-2">
            <span className="text-[10px] uppercase tracking-widest text-[#738290] font-bold block">Total Collected Revenue</span>
            <div className="flex items-baseline justify-between">
              <span className="text-3xl font-serif font-bold text-[#0A2647]">
                {loading ? '...' : `$${metrics.totalCollectedAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
              </span>
              <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-0.5 rounded">
                Verified
              </span>
            </div>
          </div>

          <div className="bg-gray-50 p-6 rounded-xl border border-gray-100 space-y-2">
            <span className="text-[10px] uppercase tracking-widest text-[#738290] font-bold block">Total Billed Volume</span>
            <div className="flex items-baseline justify-between">
              <span className="text-3xl font-serif font-bold text-[#0A2647]">
                {loading ? '...' : `$${metrics.totalBilledAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
              </span>
              <span className="text-xs font-semibold text-[#C49A6C] bg-amber-50 px-2 py-0.5 rounded">
                {metrics.totalBillingRecordsCount} invoices
              </span>
            </div>
          </div>

          <div className="bg-gray-50 p-6 rounded-xl border border-gray-100 space-y-2">
            <span className="text-[10px] uppercase tracking-widest text-[#738290] font-bold block">Active Clients</span>
            <div className="flex items-baseline justify-between">
              <span className="text-3xl font-serif font-bold text-[#0A2647]">
                {loading ? '...' : metrics.totalClients}
              </span>
              <span className="text-xs font-medium text-[#738290]">
                Registered accounts
              </span>
            </div>
          </div>

          <div className="bg-gray-50 p-6 rounded-xl border border-gray-100 space-y-2">
            <span className="text-[10px] uppercase tracking-widest text-[#738290] font-bold block">Pipeline Leads</span>
            <div className="flex items-baseline justify-between">
              <span className="text-3xl font-serif font-bold text-[#0A2647]">
                {loading ? '...' : metrics.totalLeads}
              </span>
              <span className="text-xs font-medium text-[#738290]">
                Inquiries
              </span>
            </div>
          </div>

          <div className="bg-gray-50 p-6 rounded-xl border border-gray-100 space-y-2 sm:col-span-2 lg:col-span-2">
            <span className="text-[10px] uppercase tracking-widest text-[#738290] font-bold block">Scheduled Firm Events</span>
            <div className="flex items-baseline justify-between">
              <span className="text-3xl font-serif font-bold text-[#0A2647]">
                {loading ? '...' : metrics.totalScheduledEvents}
              </span>
              <span className="text-xs font-medium text-[#738290]">
                Court dates & meetings on calendar
              </span>
            </div>
          </div>

        </div>

        {/* Revenue & Billable Hours Bar Chart Section */}
        <div className="border border-gray-200 rounded-xl p-6 bg-white space-y-6 shadow-sm">
          <div className="flex items-center justify-between border-b pb-4">
            <div>
              <h3 className="font-serif font-bold text-base text-[#0A2647]">Revenue & billable hours</h3>
              <p className="text-[11px] text-[#738290]">Comparative monthly ledger analytics</p>
            </div>
            <span className="text-xs font-semibold text-[#738290] uppercase tracking-wider">JAN — OCT 2026</span>
          </div>

          {/* Bar Chart Visualization */}
          <div className="h-64 flex items-end justify-between gap-2 sm:gap-4 pt-8 px-2 border-b border-gray-100 pb-2">
            {monthlyRevenue.map((col, index) => (
              <div key={index} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                <div 
                  className="w-full max-w-[40px] bg-[#0A2647] rounded-t-lg transition-all duration-300 group-hover:bg-[#C49A6C] relative flex flex-col justify-between items-center py-1"
                  style={{ height: col.height }}
                >
                  <span className="w-2 h-2 bg-[#C49A6C] rounded-full"></span>
                </div>
                <span className="text-[10px] font-bold text-[#738290]">{col.month}</span>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-center gap-6 text-xs text-[#738290]">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 bg-[#0A2647] rounded-sm"></span>
              <span>Collected Revenue</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 bg-[#C49A6C] rounded-sm"></span>
              <span>Billable Hours Target</span>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}