'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api, getApiErrorMessage } from '@/app/lib/axios';

interface ClientRecord {
  id: string;
  fullName: string;
  email: string;
  role?: string;
  phone?: string;
  updatedAt?: string;
}

export default function ClientsPage() {
  const router = useRouter();
  const [clients, setClients] = useState<ClientRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Modal State for adding/editing a client
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchClientsData();
  }, []);

  async function fetchClientsData() {
    setLoading(true);
    try {
      const response = await api.get('/clients'); // Updated to use the dedicated /clients endpoint
      const allClients = response.data.data || [];
      setClients(allClients);
    } catch (err: unknown) {
      console.error('Failed to fetch clients:', err);
      setError('Unable to sync client records from backend server.');
    } finally {
      setLoading(false);
    }
  }

  const handleOpenCreateModal = () => {
    setEditingId(null);
    setFullName('');
    setEmail('');
    setPhone('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (client: ClientRecord) => {
    setEditingId(client.id);
    setFullName(client.fullName);
    setEmail(client.email);
    setPhone(client.phone || '');
    setIsModalOpen(true);
  };

  const handleSaveClient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email) {
      alert('Please fill out the client name and email.');
      return;
    }

    setSubmitting(true);
    try {
      if (editingId) {
        // Update existing client via API
        await api.put(`/clients/${editingId}`, {
          fullName,
          email,
          phone,
        });
        alert('Client updated successfully!');
      } else {
        // Create new client via API
        await api.post('/clients', {
          fullName,
          email,
          phone,
        });
        alert('Client registered successfully!');
      }

      setIsModalOpen(false);
      setEditingId(null);
      setFullName('');
      setEmail('');
      setPhone('');
      fetchClientsData();
    } catch (err: unknown) {
      console.error('Failed to save client:', err);
      alert(getApiErrorMessage(err, 'Failed to save client.'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteClient = async (id: string) => {
    if (!confirm('Are you sure you want to delete this client?')) return;

    try {
      await api.delete(`/clients/${id}`);
      alert('Client deleted successfully!');
      fetchClientsData();
    } catch (err: unknown) {
      console.error('Failed to delete client:', err);
      alert(getApiErrorMessage(err, 'Failed to delete client.'));
    }
  };

  const filteredClients = clients.filter((client) => {
    const query = searchQuery.toLowerCase();
    return (
      client.fullName?.toLowerCase().includes(query) ||
      client.email?.toLowerCase().includes(query)
    );
  });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentClients = filteredClients.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredClients.length / itemsPerPage) || 1;

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#0A2647] font-sans p-4 sm:p-6 lg:p-10 space-y-8 w-full">
      
      {/* Top Header Navigation */}
      <div className="flex items-center justify-between border-b pb-4">
        <div>
          <span className="text-[10px] uppercase tracking-widest text-[#C49A6C] font-bold block mb-1">
            Firm Directory
          </span>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#0A2647]">Clients</h1>
        </div>
        <button 
          onClick={() => router.push('/admin/dashboard')}
          className="text-xs font-semibold text-[#0A2647] hover:underline whitespace-nowrap"
        >
          ← Back to Dashboard
        </button>
      </div>

      {/* Clients Management Container */}
      <div className="bg-white rounded-xl p-4 sm:p-8 shadow-sm border border-gray-100 space-y-6 w-full">
        
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="font-serif text-xl font-bold text-[#0A2647]">Clients Management</h2>
            <p className="text-xs text-[#738290]">Manage all client accounts and contact records securely.</p>
          </div>
          <button 
            onClick={handleOpenCreateModal}
            className="w-full sm:w-auto px-4 py-2.5 bg-[#C49A6C] hover:bg-[#b58b5e] text-white text-xs font-semibold uppercase tracking-wider rounded-lg shadow-sm transition text-center"
          >
            + Add Client
          </button>
        </div>

        {/* Search Bar */}
        <div className="pt-2">
          <input 
            type="text" 
            placeholder="Search clients..." 
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

        {/* Clients Data Table */}
        {loading ? (
          <p className="text-xs text-[#738290] py-8">Loading client records from database...</p>
        ) : filteredClients.length === 0 ? (
          <p className="text-xs text-[#738290] py-8">No matching client records found.</p>
        ) : (
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left text-xs min-w-[700px]">
              <thead>
                <tr className="border-b border-gray-200 text-[#738290] uppercase text-[10px] tracking-wider">
                  <th className="pb-3 font-semibold">Client Name</th>
                  <th className="pb-3 font-semibold">Email</th>
                  <th className="pb-3 font-semibold">Phone</th>
                  <th className="pb-3 font-semibold text-center">Status</th>
                  <th className="pb-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {currentClients.map((client) => (
                  <tr key={client.id} className="hover:bg-gray-50 transition">
                    <td className="py-4">
                      <span className="font-semibold text-[#0A2647] block">{client.fullName}</span>
                      <span className="text-[10px] text-[#738290]">ID: {client.id}</span>
                    </td>
                    <td className="py-4 text-[#738290]">{client.email}</td>
                    <td className="py-4 text-[#738290]">{client.phone || 'N/A'}</td>
                    <td className="py-4 text-center">
                      <span className="bg-green-50 text-green-700 px-2.5 py-1 rounded font-semibold text-[11px]">
                        Active
                      </span>
                    </td>
                    <td className="py-4 text-right space-x-2">
                      <button 
                        onClick={() => handleOpenEditModal(client)}
                        className="px-2.5 py-1 text-[11px] font-semibold text-[#0A2647] bg-gray-100 hover:bg-gray-200 rounded transition"
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => handleDeleteClient(client.id)}
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
            Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredClients.length)} of {filteredClients.length} records
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

      {/* Add / Edit Client Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between border-b pb-4">
              <h3 className="font-serif font-bold text-lg text-[#0A2647]">
                {editingId ? 'Edit Client Record' : 'Register New Client'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 font-bold text-lg">×</button>
            </div>

            <form onSubmit={handleSaveClient} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-[#0A2647] mb-1">Full Name</label>
                <input 
                  type="text" 
                  placeholder="e.g. Sarah Jenkins" 
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-[#C49A6C]"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-[#0A2647] mb-1">Email Address</label>
                <input 
                  type="email" 
                  placeholder="e.g. sarah@example.com" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-[#C49A6C]"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-[#0A2647] mb-1">Phone Number (Optional)</label>
                <input 
                  type="text" 
                  placeholder="e.g. +1 (555) 019-2834" 
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-[#C49A6C]"
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
                  {submitting ? 'Saving...' : editingId ? 'Update Client' : 'Save Client'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}