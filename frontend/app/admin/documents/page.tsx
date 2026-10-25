'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api, getApiErrorMessage } from '@/app/lib/axios';

interface DocumentItem {
  id: string;
  name: string;
  category: string;
  fileUrl: string;
  status: string;
  createdAt: string;
  matter?: { title: string; caseNumber: string } | null;
  uploader?: { fullName: string } | null;
}

interface Matter {
  id: string;
  title: string;
  caseNumber: string;
}

export default function AdminDocumentsPage() {
  const router = useRouter();
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [matters, setMatters] = useState<Matter[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Upload Modal State
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadMatterId, setUploadMatterId] = useState('');
  const [uploadCategory, setUploadCategory] = useState('Firm Document');
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchDocumentsData();
  }, []);

  async function fetchDocumentsData() {
    setLoading(true);
    try {
      const [docsRes, mattersRes] = await Promise.all([
        api.get('/documents').catch(() => ({ data: { data: [] } })),
        api.get('/matters').catch(() => ({ data: { data: [] } })),
      ]);

      const fetchedDocs = docsRes.data.data || [];
      const fetchedMatters = mattersRes.data.data || [];
      
      setDocuments(fetchedDocs);
      setMatters(fetchedMatters);
      if (fetchedMatters.length > 0) {
        setUploadMatterId(fetchedMatters[0].id);
      }
    } catch (err: unknown) {
      console.error('Failed to fetch documents:', err);
      setError('Unable to sync document storage from backend server.');
    } finally {
      setLoading(false);
    }
  }

  const handleSecureDownload = async (docId: string, docName: string) => {
    try {
      const response = await api.get(`/documents/${docId}/download`, {
        responseType: 'blob',
      });
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = docName || 'document.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (err) {
      console.error('Download failed:', err);
      alert('Failed to download document.');
    }
  };

  const handleDeleteDocument = async (docId: string) => {
    if (!confirm('Are you sure you want to delete this document?')) return;
    try {
      await api.delete(`/documents/${docId}`);
      fetchDocumentsData();
      alert('Document deleted successfully.');
    } catch (err) {
      console.error('Failed to delete document:', err);
      alert('Failed to delete document.');
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      alert('Please select a file to upload.');
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('file', selectedFile);
    if (uploadMatterId) formData.append('matterId', uploadMatterId);
    formData.append('category', uploadCategory);

    try {
      await api.post('/documents/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setIsUploadOpen(false);
      setSelectedFile(null);
      fetchDocumentsData();
      alert('Document uploaded successfully to Cloudinary!');
    } catch (err: unknown) {
      console.error('Upload failed:', err);
      alert(getApiErrorMessage(err, 'Failed to upload document.'));
    } finally {
      setUploading(false);
    }
  };

  const filteredDocuments = documents.filter((doc) => {
    const q = searchQuery.toLowerCase();
    return (
      doc.name?.toLowerCase().includes(q) ||
      doc.category?.toLowerCase().includes(q) ||
      doc.matter?.title?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#0A2647] font-sans p-3 sm:p-6 lg:p-10 space-y-6 w-full max-w-7xl mx-auto">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b pb-4">
        <div>
          <span className="text-[10px] uppercase tracking-widest text-[#C49A6C] font-bold block mb-1">
            Firm Storage
          </span>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-serif font-bold text-[#0A2647]">Document Management</h1>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <button
            onClick={() => setIsUploadOpen(true)}
            className="flex-1 sm:flex-initial px-4 py-2 bg-[#C49A6C] hover:bg-[#b58b5e] text-white text-xs font-semibold uppercase tracking-wider rounded-lg shadow transition text-center"
          >
            + Upload Document
          </button>
          <button 
            onClick={() => router.push('/admin/dashboard')}
            className="text-xs font-semibold text-[#0A2647] hover:underline"
          >
            ← Back to Dashboard
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border-l-4 border-red-500 text-red-700 text-xs rounded">
          {error}
        </div>
      )}

      {/* Search Filter Bar */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <input
          type="text"
          placeholder="Search documents by name, category, or case title..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full sm:w-96 px-4 py-2.5 border rounded-lg text-xs focus:outline-none focus:border-[#C49A6C]"
        />
        <span className="text-xs text-[#738290] text-right sm:text-left">
          Total Files: <strong>{filteredDocuments.length}</strong>
        </span>
      </div>

      {/* Documents List View */}
      <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-100 space-y-4">
        <h2 className="font-serif text-base sm:text-lg font-bold text-[#0A2647]">All Cloudinary Files</h2>

        {loading ? (
          <p className="text-xs text-[#738290] py-8 text-center">Loading documents storage...</p>
        ) : filteredDocuments.length === 0 ? (
          <p className="text-xs text-[#738290] py-8 text-center">No documents found.</p>
        ) : (
          <div className="space-y-3">
            {filteredDocuments.map((doc) => (
              <div 
                key={doc.id} 
                className="p-4 bg-gray-50 rounded-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border border-gray-200"
              >
                <div className="flex items-start sm:items-center gap-3 overflow-hidden">
                  <div className="w-10 h-10 shrink-0 rounded-lg bg-[#0A2647] text-white flex items-center justify-center font-bold text-xs">
                    PDF
                  </div>
                  <div className="min-w-0">
                    <strong className="text-[#0A2647] text-sm block truncate">{doc.name}</strong>
                    <span className="text-[11px] text-[#738290] block break-words">
                      {doc.category} · Matter: {doc.matter?.title || 'General'} · Uploaded by: {doc.uploader?.fullName || 'Client'} ({new Date(doc.createdAt).toLocaleDateString()})
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full md:w-auto justify-end border-t md:border-t-0 pt-3 md:pt-0">
                  <span className="px-2.5 py-1 text-[11px] font-semibold bg-amber-50 text-amber-700 rounded">
                    {doc.status || 'PENDING'}
                  </span>

                  <button
                    onClick={() => handleSecureDownload(doc.id, doc.name)}
                    className="px-3 py-1.5 bg-[#C49A6C] text-white text-xs font-semibold rounded hover:bg-[#b58b5e] transition cursor-pointer"
                  >
                    Download PDF
                  </button>

                  <button
                    onClick={() => handleDeleteDocument(doc.id)}
                    className="text-red-500 hover:text-red-700 text-xs font-semibold px-2 py-1"
                    title="Delete Record"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Upload Modal Wizard */}
      {isUploadOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-xl max-w-md w-full p-6 space-y-4 shadow-2xl my-auto">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-serif font-bold text-base sm:text-lg text-[#0A2647]">Upload Firm Document</h3>
              <button onClick={() => setIsUploadOpen(false)} className="text-gray-400 font-bold text-lg">×</button>
            </div>

            <form onSubmit={handleUploadSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-[#0A2647] mb-1">Assign to Matter (Optional)</label>
                <select
                  value={uploadMatterId}
                  onChange={(e) => setUploadMatterId(e.target.value)}
                  className="w-full px-3 py-2.5 border rounded-lg bg-white"
                >
                  <option value="">General Storage (No Matter)</option>
                  {matters.map((m) => (
                    <option key={m.id} value={m.id}>{m.title} (#{m.caseNumber})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-[#0A2647] mb-1">Category</label>
                <input
                  type="text"
                  value={uploadCategory}
                  onChange={(e) => setUploadCategory(e.target.value)}
                  className="w-full px-3 py-2.5 border rounded-lg"
                  placeholder="e.g. Court Filing, Agreement"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-[#0A2647] mb-1">Choose File</label>
                <input
                  type="file"
                  onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                  className="w-full px-3 py-2 border rounded-lg file:mr-4 file:py-1 file:px-3 file:rounded file:border-0 file:bg-[#C49A6C] file:text-white"
                  required
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t">
                <button type="button" onClick={() => setIsUploadOpen(false)} className="px-4 py-2 border rounded">Cancel</button>
                <button type="submit" disabled={uploading} className="px-4 py-2 bg-[#C49A6C] text-white font-semibold rounded">
                  {uploading ? 'Uploading...' : 'Upload File'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}