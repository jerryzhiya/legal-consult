'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api, getApiErrorMessage } from '@/app/lib/axios';

interface BillingRecord {
  id: string;
  recordTitle: string;
  matterCode: string;
  owner: string;
  amount: number;
  status: string;
  updatedAt?: string;
}

export default function BillingPage() {
  const router = useRouter();
  const [billings, setBillings] = useState<BillingRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Modal State for adding/editing a billing entry
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [recordTitle, setRecordTitle] = useState('');
  const [matterCode, setMatterCode] = useState('');
  const [owner, setOwner] = useState('');
  const [amount, setAmount] = useState('');
  const [status, setStatus] = useState('ACTIVE');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchBillingData();
  }, []);

  async function fetchBillingData() {
    setLoading(true);
    try {
      const response = await api.get('/billings');
      setBillings(response.data.data || []);
    } catch (err: unknown) {
      console.error('Failed to fetch billing records:', err);
      setError('Unable to sync billing records from backend server.');
    } finally {
      setLoading(false);
    }
  }

  const handleOpenCreateModal = () => {
    setEditingId(null);
    setRecordTitle('');
    setMatterCode('');
    setOwner('');
    setAmount('');
    setStatus('ACTIVE');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (billing: BillingRecord) => {
    setEditingId(billing.id);
    setRecordTitle(billing.recordTitle);
    setMatterCode(billing.matterCode);
    setOwner(billing.owner);
    setAmount(String(billing.amount));
    setStatus(billing.status);
    setIsModalOpen(true);
  };

  const handleSaveBilling = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recordTitle || !amount) {
      alert('Please fill out the record title and amount.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        recordTitle,
        matterCode: matterCode || '#MC-2026-100 · General Matter',
        owner: owner || 'Firm Attorney',
        amount: parseFloat(amount),
        status,
      };

      if (editingId) {
        await api.put(`/billings/${editingId}`, payload);
        alert('Billing record updated successfully!');
      } else {
        await api.post('/billings', payload);
        alert('Billing record created successfully!');
      }

      setIsModalOpen(false);
      fetchBillingData();
    } catch (err: unknown) {
      console.error('Failed to save billing record:', err);
      alert(getApiErrorMessage(err, 'Failed to save billing record.'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteBilling = async (id: string) => {
    if (!confirm('Are you sure you want to delete this billing record?')) return;

    try {
      await api.delete(`/billings/${id}`);
      alert('Billing record deleted successfully!');
      fetchBillingData();
    } catch (err: unknown) {
      console.error('Failed to delete billing record:', err);
      alert(getApiErrorMessage(err, 'Only administrators are authorized to delete billing records.'));
    }
  };

  const filteredBillings = billings.filter((item) => {
    const query = searchQuery.toLowerCase();
    return (
      item.recordTitle?.toLowerCase().includes(query) ||
      item.matterCode?.toLowerCase().includes(query) ||
      item.owner?.toLowerCase().includes(query)
    );
  });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentBillings = filteredBillings.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredBillings.length / itemsPerPage) || 1;

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#0A2647] font-sans p-4 sm:p-6 lg:p-10 space-y-8 w-full">
      
      {/* Top Header Navigation */}
      <div className="flex items-center justify-between border-b pb-4">
        <div>
          <span className="text-[10px] uppercase tracking-widest text-[#C49A6C] font-bold block mb-1">
            Firm Directory
          </span>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#0A2647]">Billing</h1>
        </div>
        <button 
          onClick={() => router.push('/admin/dashboard')}
          className="text-xs font-semibold text-[#0A2647] hover:underline whitespace-nowrap"
        >
          ← Back to Dashboard
        </button>
      </div>

      {/* Billing Management Container */}
      <div className="bg-white rounded-xl p-4 sm:p-8 shadow-sm border border-gray-100 space-y-6 w-full">
        
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="font-serif text-xl font-bold text-[#0A2647]">Billing Management</h2>
            <p className="text-xs text-[#738290]">Manage all billing records and receivables securely from one place.</p>
          </div>
          <button 
            onClick={handleOpenCreateModal}
            className="w-full sm:w-auto px-4 py-2.5 bg-[#C49A6C] hover:bg-[#b58b5e] text-white text-xs font-semibold uppercase tracking-wider rounded-lg shadow-sm transition text-center"
          >
            + Add Billing
          </button>
        </div>

        {/* Search Bar */}
        <div className="pt-2">
          <input 
            type="text" 
            placeholder="Search billing..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full sm:w-80 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-[#C49A6C]"
          />
        </div>

        {error && (
          <div className="p-4 bg-red-50 border-l-4 border-red-500 text-red-700 text-xs rounded">
            {error}
          </div>
        )}

        {/* Billing Data Table */}
        {loading ? (
          <p className="text-xs text-[#738290] py-8">Loading billing records from database...</p>
        ) : filteredBillings.length === 0 ? (
          <p className="text-xs text-[#738290] py-8">No matching billing records found.</p>
        ) : (
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left text-xs min-w-[700px]">
              <thead>
                <tr className="border-b border-gray-200 text-[#738290] uppercase text-[10px] tracking-wider">
                  <th className="pb-3 font-semibold">Record</th>
                  <th className="pb-3 font-semibold">Owner</th>
                  <th className="pb-3 font-semibold">Amount</th>
                  <th className="pb-3 font-semibold">Updated</th>
                  <th className="pb-3 font-semibold text-center">Status</th>
                  <th className="pb-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {currentBillings.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50 transition">
                    <td className="py-4">
                      <span className="font-semibold text-[#0A2647] block">{item.recordTitle}</span>
                      <span className="text-[10px] text-[#738290]">{item.matterCode}</span>
                    </td>
                    <td className="py-4 text-[#738290] font-medium">{item.owner}</td>
                    <td className="py-4 font-semibold text-[#0A2647]">
                      ${(item.amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-4 text-[#738290]">
                      {item.updatedAt ? new Date(item.updatedAt).toLocaleDateString() : 'Today'}
                    </td>
                    <td className="py-4 text-center">
                      <span className={`px-2.5 py-1 rounded font-semibold text-[11px] ${
                        item.status === 'PAID' ? 'bg-green-50 text-green-700' :
                        item.status === 'OVERDUE' ? 'bg-red-50 text-red-700' :
                        'bg-amber-50 text-amber-700'
                      }`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="py-4 text-right space-x-2">
                      <button 
                        onClick={() => handleOpenEditModal(item)}
                        className="px-2.5 py-1 text-[11px] font-semibold text-[#0A2647] bg-gray-100 hover:bg-gray-200 rounded transition"
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => handleDeleteBilling(item.id)}
                        className="px-2.5 py-1 text-[11px] font-semibold text-red-600 bg-red-50 hover:bg-red-100 rounded transition"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between pt-6 border-t text-xs text-[#738290] gap-4">
          <span>
            Showing {filteredBillings.length > 0 ? indexOfFirstItem + 1 : 0} to {Math.min(indexOfLastItem, filteredBillings.length)} of {filteredBillings.length} records
          </span>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-1.5 border rounded-lg hover:bg-gray-50 disabled:opacity-40"
            >
              Previous
            </button>
            <span className="px-3 py-1 bg-gray-100 font-semibold text-[#0A2647] rounded-lg">
              {currentPage} / {totalPages}
            </span>
            <button 
              onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-3 py-1.5 border rounded-lg hover:bg-gray-50 disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>

      </div>

      {/* Add / Edit Billing Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between border-b pb-4">
              <h3 className="font-serif font-bold text-lg text-[#0A2647]">
                {editingId ? 'Edit Billing Record' : 'Add New Billing / Invoice'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 font-bold text-lg">×</button>
            </div>

            <form onSubmit={handleSaveBilling} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-[#0A2647] mb-1">Record Title</label>
                <input 
                  type="text" 
                  placeholder="e.g. Jenkins Aultral Holding" 
                  value={recordTitle}
                  onChange={(e) => setRecordTitle(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-[#C49A6C]"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-[#0A2647] mb-1">Matter Code & Practice Area</label>
                <input 
                  type="text" 
                  placeholder="e.g. #MC-2026-092 · Corporate Law" 
                  value={matterCode}
                  onChange={(e) => setMatterCode(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-[#C49A6C]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#0A2647] mb-1">Owner / Attorney</label>
                <input 
                  type="text" 
                  placeholder="e.g. Sarah Jenkins" 
                  value={owner}
                  onChange={(e) => setOwner(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-[#C49A6C]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#0A2647] mb-1">Amount ($)</label>
                <input 
                  type="number" 
                  step="0.01" 
                  placeholder="e.g. 12500.00" 
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-[#C49A6C]"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-[#0A2647] mb-1">Status</label>
                <select 
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-[#C49A6C]"
                >
                  <option value="ACTIVE">Active</option>
                  <option value="PAID">Paid</option>
                  <option value="OVERDUE">Overdue</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border rounded-lg text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={submitting}
                  className="px-4 py-2 bg-[#C49A6C] text-white font-semibold rounded-lg hover:bg-[#b58b5e] transition"
                >
                  {submitting ? 'Saving...' : editingId ? 'Update Record' : 'Save Billing'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}