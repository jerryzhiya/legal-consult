'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api, getApiErrorMessage } from '@/app/lib/axios';

interface Matter {
  id: string;
  caseNumber: string;
  title: string;
  practiceArea: string;
  status: string;
  progressPercentage: number;
  client?: { fullName: string; email: string } | null;
  attorney?: { fullName: string; email: string } | null;
  updatedAt?: string;
}

interface UserRecord {
  id: string;
  fullName: string;
  email: string;
  role?: string;
}

export default function CasesPage() {
  const router = useRouter();
  const [matters, setMatters] = useState<Matter[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 4;

  // Modal State for adding a new matter directly
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCaseNumber, setNewCaseNumber] = useState('');
  const [newPracticeArea, setNewPracticeArea] = useState('Corporate Law');
  const [newClientId, setNewClientId] = useState('');
  const [clients, setClients] = useState<UserRecord[]>([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchCasesData();
  }, []);

  async function fetchCasesData() {
    try {
      const [mattersRes, usersRes] = await Promise.all([
        api.get('/matters'),
        api.get('/users').catch(() => ({ data: { data: [] } }))
      ]);

      setMatters(mattersRes.data.data || []);
      const allUsers = usersRes.data.data || [];
      setClients(allUsers.filter((user: UserRecord) => user.role === 'CLIENT' || !user.role));
    } catch (err: unknown) {
      console.error('Failed to fetch cases:', err);
      setError('Unable to sync cases from backend server.');
    } finally {
      setLoading(false);
    }
  }

  const handleCreateMatter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newCaseNumber || !newClientId) {
      alert('Please fill out all required fields.');
      return;
    }

    setSubmitting(true);
    try {
      await api.post('/matters', {
        title: newTitle,
        caseNumber: newCaseNumber,
        practiceArea: newPracticeArea,
        clientId: newClientId,
      });
      setIsModalOpen(false);
      setNewTitle('');
      setNewCaseNumber('');
      setNewClientId('');
      fetchCasesData();
      alert('Case created successfully!');
    } catch (err: unknown) {
      console.error('Failed to create matter:', err);
      alert(getApiErrorMessage(err, 'Failed to create matter.'));
    } finally {
      setSubmitting(false);
    }
  };

  const filteredMatters = matters.filter((matter) => {
    const query = searchQuery.toLowerCase();
    return (
      matter.title?.toLowerCase().includes(query) ||
      matter.caseNumber?.toLowerCase().includes(query) ||
      matter.client?.fullName?.toLowerCase().includes(query)
    );
  });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentMatters = filteredMatters.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredMatters.length / itemsPerPage) || 1;

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#0A2647] font-sans p-4 sm:p-6 lg:p-10 space-y-8 w-full">
      
      {/* Top Header Navigation */}
      <div className="flex items-center justify-between border-b pb-4">
        <div>
          <span className="text-[10px] uppercase tracking-widest text-[#C49A6C] font-bold block mb-1">
            Firm Directory
          </span>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#0A2647]">Cases</h1>
        </div>
        <button 
          onClick={() => router.push('/admin/dashboard')}
          className="text-xs font-semibold text-[#0A2647] hover:underline whitespace-nowrap"
        >
          ← Back to Dashboard
        </button>
      </div>

      {/* Cases Management Container */}
      <div className="bg-white rounded-xl p-4 sm:p-8 shadow-sm border border-gray-100 space-y-6 w-full">
        
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="font-serif text-xl font-bold text-[#0A2647]">Cases Management</h2>
            <p className="text-xs text-[#738290]">Manage all cases records securely from one place.</p>
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="w-full sm:w-auto px-4 py-2.5 bg-[#C49A6C] hover:bg-[#b58b5e] text-white text-xs font-semibold uppercase tracking-wider rounded-lg shadow-sm transition text-center"
          >
            + Add matter
          </button>
        </div>

        {/* Search Bar */}
        <div className="pt-2">
          <input 
            type="text" 
            placeholder="Search cases..." 
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

        {/* Cases Data Table */}
        {loading ? (
          <p className="text-xs text-[#738290] py-8">Loading case records from database...</p>
        ) : filteredMatters.length === 0 ? (
          <p className="text-xs text-[#738290] py-8">No matching case records found.</p>
        ) : (
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left text-xs min-w-[600px]">
              <thead>
                <tr className="border-b border-gray-200 text-[#738290] uppercase text-[10px] tracking-wider">
                  <th className="pb-3 font-semibold">Record</th>
                  <th className="pb-3 font-semibold">Owner</th>
                  <th className="pb-3 font-semibold">Updated</th>
                  <th className="pb-3 font-semibold text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {currentMatters.map((matter) => (
                  <tr 
                    key={matter.id}
                    onClick={() => router.push(`/admin/cases/${matter.id}`)}
                    className="cursor-pointer hover:bg-gray-50 transition"
                  >
                    <td className="py-4">
                      <span className="font-semibold text-[#0A2647] block">{matter.title}</span>
                      <span className="text-[10px] text-[#738290]">#{matter.caseNumber} · {matter.practiceArea}</span>
                    </td>
                    <td className="py-4 text-[#738290] font-medium">
                      {matter.attorney?.fullName || matter.client?.fullName || 'Assigned Counsel'}
                    </td>
                    <td className="py-4 text-[#738290]">
                      {matter.updatedAt ? new Date(matter.updatedAt).toLocaleDateString() : 'Today'}
                    </td>
                    <td className="py-4 text-right">
                      <span className="bg-green-50 text-green-700 px-2.5 py-1 rounded font-semibold text-[11px]">
                        {matter.status}
                      </span>
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
            Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredMatters.length)} of {filteredMatters.length} records
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

      {/* Add Matter Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between border-b pb-4">
              <h3 className="font-serif font-bold text-lg text-[#0A2647]">Add New Case Matter</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 font-bold text-lg">×</button>
            </div>

            <form onSubmit={handleCreateMatter} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-[#0A2647] mb-1">Case Title</label>
                <input 
                  type="text" 
                  placeholder="e.g. Jenkins v. Altura Holdings" 
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-[#C49A6C]"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-[#0A2647] mb-1">Case Number</label>
                <input 
                  type="text" 
                  placeholder="e.g. MC-2026-0912" 
                  value={newCaseNumber}
                  onChange={(e) => setNewCaseNumber(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-[#C49A6C]"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-[#0A2647] mb-1">Practice Area</label>
                <select 
                  value={newPracticeArea}
                  onChange={(e) => setNewPracticeArea(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-[#C49A6C]"
                >
                  <option value="Corporate Law">Corporate Law</option>
                  <option value="Estate Planning">Estate Planning</option>
                  <option value="Litigation">Litigation</option>
                  <option value="Real Estate">Real Estate</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-[#0A2647] mb-1">Assign Client</label>
                <select 
                  value={newClientId}
                  onChange={(e) => setNewClientId(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-[#C49A6C]"
                  required
                >
                  <option value="">-- Choose a registered client --</option>
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>{c.fullName} ({c.email})</option>
                  ))}
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
                  {submitting ? 'Saving...' : 'Save Case'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}