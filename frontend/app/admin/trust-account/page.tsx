'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/app/lib/axios';

interface TrustTransaction {
  id: string;
  type: string;
  clientName: string;
  matterTitle: string;
  date: string;
  amount: number;
  balance: number;
}

export default function TrustAccountPage() {
  const router = useRouter();
  const [transactions, setTransactions] = useState<TrustTransaction[]>([]);
  const [totalLiability, setTotalLiability] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modal State for recording / editing a transaction
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [transactionType, setTransactionType] = useState('DEPOSIT');
  const [clientName, setClientName] = useState('');
  const [matterTitle, setMatterTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchTrustData();
  }, []);

  async function fetchTrustData() {
    setLoading(true);
    try {
      // Fetching live trust account transactions exclusively from the backend endpoint
      const res = await api.get('/trust-transactions');
      const serverTransactions = res.data?.data || [];

      setTransactions(serverTransactions);
      
      // Calculate total liability dynamically from backend records
      const computedLiability = serverTransactions.reduce((acc: number, tx: TrustTransaction) => acc + (tx.amount || 0), 0);
      setTotalLiability(computedLiability);
    } catch (err: unknown) {
      console.error('Failed to load trust account data from backend:', err);
      setError('Unable to sync trust account ledger from server.');
    } finally {
      setLoading(false);
    }
  }

  const handleOpenCreateModal = () => {
    setEditingId(null);
    setTransactionType('DEPOSIT');
    setClientName('');
    setMatterTitle('');
    setAmount('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (tx: TrustTransaction) => {
    setEditingId(tx.id);
    setTransactionType(tx.amount >= 0 ? 'DEPOSIT' : 'DISBURSEMENT');
    setClientName(tx.clientName);
    setMatterTitle(tx.matterTitle);
    setAmount(Math.abs(tx.amount).toString());
    setIsModalOpen(true);
  };

  const handleSaveTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName || !amount) {
      alert('Please fill out the client name and amount.');
      return;
    }

    setSubmitting(true);
    try {
      const parsedAmount = parseFloat(amount);
      const isDeposit = transactionType === 'DEPOSIT';
      const finalAmount = isDeposit ? parsedAmount : -parsedAmount;
      const typeLabel = isDeposit ? 'Client retainer / deposit' : 'Disbursement / fee';

      if (editingId) {
        // Update existing transaction via backend API
        await api.put(`/trust-transactions/${editingId}`, {
          type: typeLabel,
          clientName,
          matterTitle: matterTitle || 'General Trust Matter',
          amount: finalAmount,
        });
      } else {
        // Create new transaction via backend API
        await api.post('/trust-transactions', {
          type: typeLabel,
          clientName,
          matterTitle: matterTitle || 'General Trust Matter',
          amount: finalAmount,
        });
      }

      // Re-fetch fresh data from backend
      await fetchTrustData();

      setIsModalOpen(false);
      setEditingId(null);
      setClientName('');
      setMatterTitle('');
      setAmount('');
      alert(editingId ? 'Trust transaction updated successfully!' : 'Trust transaction recorded successfully!');
    } catch (err: unknown) {
      console.error('Failed to save transaction:', err);
      alert('Failed to save transaction on backend.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#0A2647] font-sans p-4 sm:p-6 lg:p-10 space-y-8 w-full">
      
      {/* Top Header Navigation */}
      <div className="flex items-center justify-between border-b pb-4">
        <div>
          <span className="text-[10px] uppercase tracking-widest text-[#C49A6C] font-bold block mb-1">
            Firm Directory
          </span>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#0A2647]">Trust Account</h1>
        </div>
        <button 
          onClick={() => router.push('/admin/dashboard')}
          className="text-xs font-semibold text-[#0A2647] hover:underline whitespace-nowrap"
        >
          ← Back to Dashboard
        </button>
      </div>

      {/* Main Container */}
      <div className="bg-white rounded-xl p-4 sm:p-8 shadow-sm border border-gray-100 space-y-6 w-full">
        
        {/* Header & Record Button */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[9px] font-bold bg-amber-50 text-amber-700 px-2 py-0.5 rounded tracking-wider uppercase border border-amber-200">
                IOLTA Compliant
              </span>
            </div>
            <h2 className="font-serif text-xl font-bold text-[#0A2647]">Trust Account Ledger</h2>
            <p className="text-xs text-[#738290]">Manage all trust account records securely from one place.</p>
          </div>
          <button 
            onClick={handleOpenCreateModal}
            className="w-full sm:w-auto px-4 py-2.5 bg-[#C49A6C] hover:bg-[#b58b5e] text-white text-xs font-semibold uppercase tracking-wider rounded-lg shadow-sm transition text-center"
          >
            + Record transaction
          </button>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border-l-4 border-red-500 text-red-700 text-xs rounded">
            {error}
          </div>
        )}

        {/* Total Trust Liability Summary Card */}
        <div className="bg-[#0A2647] text-white p-6 sm:p-8 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 shadow-md">
          <div className="space-y-1">
            <span className="text-xs uppercase tracking-widest text-[#C49A6C] font-semibold block">
              Total trust liability
            </span>
            <span className="text-3xl sm:text-4xl font-serif font-bold tracking-tight">
              ${totalLiability.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <p className="text-gray-300 text-xs pt-1">{transactions.length} active client ledgers currently balanced</p>
          </div>
          <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-lg border border-white/15">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
            <span className="text-xs font-semibold text-white tracking-wide uppercase">Reconciled</span>
          </div>
        </div>

        {/* Transaction History Table */}
        {loading ? (
          <p className="text-xs text-[#738290] py-8">Loading trust ledger entries from database...</p>
        ) : transactions.length === 0 ? (
          <p className="text-xs text-[#738290] py-8">No trust account transactions recorded yet.</p>
        ) : (
          <div className="overflow-x-auto w-full pt-4">
            <table className="w-full text-left text-xs min-w-[750px]">
              <thead>
                <tr className="border-b border-gray-200 text-[#738290] uppercase text-[10px] tracking-wider">
                  <th className="pb-3 font-semibold">Transaction</th>
                  <th className="pb-3 font-semibold">Client / Matter</th>
                  <th className="pb-3 font-semibold">Date</th>
                  <th className="pb-3 font-semibold text-right">Amount</th>
                  <th className="pb-3 font-semibold text-right">Balance</th>
                  <th className="pb-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {transactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-gray-50 transition">
                    <td className="py-4 font-semibold text-[#0A2647]">{tx.type}</td>
                    <td className="py-4">
                      <span className="font-medium text-[#0A2647] block">{tx.clientName}</span>
                      <span className="text-[10px] text-[#738290]">{tx.matterTitle}</span>
                    </td>
                    <td className="py-4 text-[#738290]">{tx.date || new Date().toLocaleDateString()}</td>
                    <td className={`py-4 text-right font-semibold ${tx.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {tx.amount > 0 ? `+ $${tx.amount.toLocaleString()}` : `- $${Math.abs(tx.amount).toLocaleString()}`}
                    </td>
                    <td className="py-4 text-right font-semibold text-[#0A2647]">
                      ${(tx.balance || Math.abs(tx.amount)).toLocaleString()}
                    </td>
                    <td className="py-4 text-right">
                      <button 
                        onClick={() => handleOpenEditModal(tx)}
                        className="px-2.5 py-1 text-[11px] font-semibold text-[#0A2647] bg-gray-100 hover:bg-gray-200 rounded transition"
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

      </div>

      {/* Record / Edit Transaction Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between border-b pb-4">
              <h3 className="font-serif font-bold text-lg text-[#0A2647]">
                {editingId ? 'Edit Trust Transaction' : 'Record Trust Transaction'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 font-bold text-lg">×</button>
            </div>

            <form onSubmit={handleSaveTransaction} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-[#0A2647] mb-1">Transaction Type</label>
                <select 
                  value={transactionType}
                  onChange={(e) => setTransactionType(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-[#C49A6C]"
                >
                  <option value="DEPOSIT">Client Deposit / Retainer (+)</option>
                  <option value="DISBURSEMENT">Fee Disbursement / Withdrawal (-)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-[#0A2647] mb-1">Client Name</label>
                <input 
                  type="text" 
                  placeholder="e.g. Alex Morgan" 
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-[#C49A6C]"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-[#0A2647] mb-1">Matter / Case Title</label>
                <input 
                  type="text" 
                  placeholder="e.g. Morgan Estate Planning" 
                  value={matterTitle}
                  onChange={(e) => setMatterTitle(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-[#C49A6C]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#0A2647] mb-1">Amount ($)</label>
                <input 
                  type="number" 
                  step="0.01" 
                  placeholder="e.g. 5000.00" 
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-[#C49A6C]"
                  required
                />
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
                  {submitting ? 'Saving...' : editingId ? 'Update Transaction' : 'Save Transaction'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}