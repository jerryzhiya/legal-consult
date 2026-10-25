'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import axios from 'axios';
import { api } from '@/app/lib/axios';
import MessagesSection from '@/app/componenets/messagesSection';

interface Matter {
    id: string;
    caseNumber: string;
    title: string;
    practiceArea: string;
    status: string;
    progressPercentage: number;
    attorney?: { fullName: string } | null;
    updatedAt?: string;
}

interface InvoiceItem {
    id: string;
    invoiceNumber: string;
    amount: number;
    status: string;
    dueDate: string;
}

interface AppointmentItem {
    id: string;
    title: string;
    dateTime: string;
    location: string;
}

interface DocumentItem {
    id: string;
    name: string;
    category: string;
    fileUrl: string;
    status: string;
    createdAt: string;
}

const earliestAppointmentDateTime = (() => {
    const date = new Date();
    date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
    return date.toISOString().slice(0, 16);
})();

export default function ClientDashboardPage() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState('Dashboard');
    const [user, setUser] = useState<{ fullName?: string; email?: string } | null>(null);

    const [matters, setMatters] = useState<Matter[]>([]);
    const [invoices, setInvoices] = useState<InvoiceItem[]>([]);
    const [appointments, setAppointments] = useState<AppointmentItem[]>([]);
    const [documents, setDocuments] = useState<DocumentItem[]>([]);
    const [appointmentTitle, setAppointmentTitle] = useState('');
    const [appointmentMatterId, setAppointmentMatterId] = useState('');
    const [appointmentDateTime, setAppointmentDateTime] = useState('');
    const [appointmentLocation, setAppointmentLocation] = useState('Video Conference');
    const [bookingAppointment, setBookingAppointment] = useState(false);
    const [appointmentError, setAppointmentError] = useState('');
    const [appointmentSuccess, setAppointmentSuccess] = useState('');

    const [isUploadOpen, setIsUploadOpen] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [uploadMatterId, setUploadMatterId] = useState('');
    const [uploadCategory, setUploadCategory] = useState('General Upload');
    const [uploading, setUploading] = useState(false);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchClientData = useCallback(async () => {
        setLoading(true);
        try {
            const [mattersRes, invoicesRes, appointmentsRes, documentsRes] = await Promise.all([
                api.get('/matters'),
                api.get('/invoices'),
                api.get('/appointments'),
                api.get('/documents'),
            ]);

            const fetchedMatters = mattersRes.data.data || [];
            setMatters(fetchedMatters);
            if (fetchedMatters.length > 0) {
                setUploadMatterId(fetchedMatters[0].id);
            }

            setInvoices(invoicesRes.data.data || []);
            setAppointments(appointmentsRes.data.data || []);
            setDocuments(documentsRes.data.data || []);
        } catch (err: unknown) {
            console.error('Failed to fetch dashboard data:', err);
            const message = axios.isAxiosError<{ error?: string }>(err)
                ? err.response?.data?.error
                : undefined;
            setError(message || 'Unable to sync live records from server.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        void Promise.resolve().then(() => {
            const storedUser = localStorage.getItem('user');
            if (storedUser) {
                try {
                    setUser(JSON.parse(storedUser));
                } catch (parseError) {
                    console.error('Failed to parse user data', parseError);
                }
            }
        });
        void Promise.resolve().then(fetchClientData);
    }, [fetchClientData]);

    const handleUploadSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedFile || !uploadMatterId) {
            alert('Please select a file and choose a matter.');
            return;
        }

        setUploading(true);
        const formData = new FormData();
        formData.append('file', selectedFile);
        formData.append('matterId', uploadMatterId);
        formData.append('category', uploadCategory);

        try {
            await api.post('/documents/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            setIsUploadOpen(false);
            setSelectedFile(null);
            alert('Document successfully uploaded to Cloudinary!');
            fetchClientData();
        } catch (err: unknown) {
            console.error('Upload failed:', err);
            const message = axios.isAxiosError<{ error?: string }>(err)
                ? err.response?.data?.error
                : undefined;
            alert(message || 'Failed to upload document.');
        } finally {
            setUploading(false);
        }
    };

    const handleBookAppointment = async (e: React.FormEvent) => {
        e.preventDefault();
        setAppointmentError('');
        setAppointmentSuccess('');

        const selectedDate = new Date(appointmentDateTime);
        if (Number.isNaN(selectedDate.getTime()) || selectedDate <= new Date()) {
            setAppointmentError('Choose a date and time in the future.');
            return;
        }

        setBookingAppointment(true);
        try {
            const response = await api.post('/appointments', {
                title: appointmentTitle.trim(),
                matterId: appointmentMatterId || undefined,
                dateTime: selectedDate.toISOString(),
                location: appointmentLocation,
            });
            const createdAppointment: AppointmentItem = response.data.data;
            setAppointments((current) =>
                [...current, createdAppointment].sort(
                    (a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime(),
                ),
            );
            setAppointmentTitle('');
            setAppointmentMatterId('');
            setAppointmentDateTime('');
            setAppointmentLocation('Video Conference');
            setAppointmentSuccess('Your appointment request was sent to the law firm.');
        } catch (err: unknown) {
            console.error('Appointment booking failed:', err);
            const message = axios.isAxiosError<{ error?: string }>(err)
                ? err.response?.data?.error
                : undefined;
            setAppointmentError(message || 'Unable to book your appointment. Please try again.');
        } finally {
            setBookingAppointment(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        router.push('/login');
    };

    const totalOutstandingBalance = invoices
        .filter(inv => inv.status !== 'PAID')
        .reduce((sum, inv) => sum + (inv.amount || 0), 0);

    const nextAppointment = appointments
        .filter((appointment) => new Date(appointment.dateTime) >= new Date())
        .sort((a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime())[0] || null;

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
        } catch (err: unknown) {
            console.error('Download failed:', err);
            alert('Failed to download document. Please check your session.');
        }
    };

    return (
        <div className="min-h-screen bg-[#F8F9FA] text-[#0A2647] font-sans">

            {/* Portal Header */}
            <header className="bg-white border-b border-gray-200 px-6 lg:px-12 py-4 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-3 cursor-pointer group" onClick={() => router.push('/')}>
                    <div className="relative w-10 h-10 flex-shrink-0 flex items-center justify-center overflow-hidden rounded">
                        <Image
                            src="/mcali.jpeg"
                            alt="MCALI Legal Consult Logo"
                            width={40}
                            height={40}
                            className="object-contain w-full h-full"
                        />
                    </div>
                    <div>
                        <span className="font-serif font-bold text-[#0A2647] tracking-wider text-sm block">
                            MCALI LEGAL CONSULT
                        </span>
                        <span className="text-[10px] uppercase tracking-widest text-[#738290] block">
                            Client Portal
                        </span>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="text-right hidden sm:block">
                        <p className="text-xs font-semibold text-[#0A2647]">Welcome, {user?.fullName || 'Client'}</p>
                        <p className="text-[11px] text-[#738290]">{user?.email || 'client@legalconsult.com'}</p>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="px-4 py-2 border border-gray-300 hover:border-red-500 hover:text-red-600 text-xs font-semibold rounded-lg transition"
                    >
                        Sign Out
                    </button>
                </div>
            </header>

            {/* Main Content Area */}
            <main className="max-w-7xl mx-auto px-6 lg:px-12 py-8 space-y-8">

                <div>
                    <span className="text-xs uppercase tracking-widest text-[#C49A6C] font-bold block mb-1">
                        Client Portal
                    </span>
                    <h1 className="text-3xl font-serif font-bold text-[#0A2647]">Your Legal Dashboard</h1>
                    <p className="text-sm text-[#738290] mt-1">
                        Live data feed connected to your secure client workspace.
                    </p>
                </div>

                {error && (
                    <div className="p-4 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm rounded">
                        {error}
                    </div>
                )}

                {/* Summary Widgets Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="bg-white p-6 rounded-xl border-t-4 border-[#C49A6C] shadow-sm">
                        <span className="text-xs uppercase tracking-wider text-[#738290] block mb-2">Active Matters</span>
                        <div className="flex items-baseline justify-between">
                            <span className="text-3xl font-serif font-bold text-[#0A2647]">{matters.length}</span>
                            <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded">Live Sync</span>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-xl border-t-4 border-[#0A2647] shadow-sm">
                        <span className="text-xs uppercase tracking-wider text-[#738290] block mb-2">Documents</span>
                        <div className="flex items-baseline justify-between">
                            <span className="text-3xl font-serif font-bold text-[#0A2647]">{documents.length}</span>
                            <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded">Cloudinary</span>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-xl border-t-4 border-[#C49A6C] shadow-sm">
                        <span className="text-xs uppercase tracking-wider text-[#738290] block mb-2">Next Appointment</span>
                        <div className="flex items-baseline justify-between">
                            <span className="text-xl font-serif font-bold text-[#0A2647]">
                                {nextAppointment ? new Date(nextAppointment.dateTime).toLocaleDateString() : 'None'}
                            </span>
                            <span className="text-xs text-[#738290]">{nextAppointment ? nextAppointment.location : 'Up to date'}</span>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-xl border-t-4 border-[#0A2647] shadow-sm">
                        <span className="text-xs uppercase tracking-wider text-[#738290] block mb-2">Outstanding Balance</span>
                        <div className="flex items-baseline justify-between">
                            <span className="text-2xl font-serif font-bold text-[#0A2647]">
                                ${totalOutstandingBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                            </span>
                            <span className="text-xs text-[#738290]">Invoices due</span>
                        </div>
                    </div>
                </div>

                {/* Core Tab Navigation */}
                <div className="flex border-b border-gray-200 overflow-x-auto space-x-8 text-sm font-semibold">
                    {['Dashboard', 'My Matters', 'Documents', 'Billing', 'Calendar', 'Messages'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`pb-3 whitespace-nowrap transition border-b-2 ${activeTab === tab
                                ? 'border-[#C49A6C] text-[#0A2647]'
                                : 'border-transparent text-[#738290] hover:text-[#0A2647]'
                                }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                {/* 1. DASHBOARD TAB */}
                {activeTab === 'Dashboard' && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2 space-y-8">
                            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="font-serif font-bold text-lg text-[#0A2647]">Active Matters (Live Feed)</h3>
                                    <button onClick={() => setActiveTab('My Matters')} className="text-xs text-[#C49A6C] font-semibold hover:underline">View all →</button>
                                </div>

                                {loading ? (
                                    <p className="text-sm text-[#738290] py-4">Syncing live matters...</p>
                                ) : matters.length === 0 ? (
                                    <p className="text-sm text-[#738290] py-4">No active matters found.</p>
                                ) : (
                                    <div className="space-y-4">
                                        {matters.slice(0, 2).map((matter) => (
                                            <div key={matter.id} className="p-4 rounded-lg border border-gray-200 bg-gray-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                                <div>
                                                    <span className="text-[10px] font-semibold uppercase tracking-widest text-[#C49A6C] block mb-1">
                                                        {matter.practiceArea} · {matter.status}
                                                    </span>
                                                    <h4 className="font-serif font-bold text-base text-[#0A2647]">{matter.title}</h4>
                                                    <p className="text-xs text-[#738290]">Case #{matter.caseNumber}</p>
                                                </div>
                                                <div className="text-right">
                                                    <span className="text-xs font-semibold text-[#0A2647] block mb-1">{matter.progressPercentage}%</span>
                                                    <div className="w-28 bg-gray-200 h-2 rounded-full overflow-hidden">
                                                        <div className="bg-[#C49A6C] h-full" style={{ width: `${matter.progressPercentage}%` }}></div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="space-y-8">
                            <div className="bg-[#0A2647] text-white rounded-xl p-6 shadow-lg">
                                <span className="text-[10px] uppercase tracking-widest text-[#C49A6C] font-semibold block mb-1">Secure Invoice</span>
                                <h3 className="font-serif font-bold text-xl mb-3">
                                    Balance: ${totalOutstandingBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                </h3>
                                <button
                                    onClick={() => setActiveTab('Billing')}
                                    className="w-full py-3 bg-[#C49A6C] text-white text-xs font-semibold uppercase tracking-wider rounded-lg shadow"
                                >
                                    View Invoices & Pay
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* 2. MY MATTERS TAB */}
                {activeTab === 'My Matters' && (
                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 space-y-6">
                        <h3 className="font-serif text-xl font-bold text-[#0A2647]">My Legal Matters</h3>
                        {matters.map((matter) => (
                            <div key={matter.id} className="p-5 rounded-xl border border-gray-200 bg-gray-50 space-y-2">
                                <span className="text-[10px] uppercase tracking-widest text-[#C49A6C] font-bold">Case #{matter.caseNumber}</span>
                                <h4 className="font-serif font-bold text-lg text-[#0A2647]">{matter.title}</h4>
                                <p className="text-xs text-[#738290]">Practice Area: {matter.practiceArea} | Status: {matter.status}</p>
                            </div>
                        ))}
                    </div>
                )}

                {/* 3. DOCUMENTS TAB */}
                {activeTab === 'Documents' && (
                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 space-y-6">
                        <div className="flex justify-between items-center">
                            <div>
                                <h3 className="font-serif text-xl font-bold text-[#0A2647]">Case Documents & Cloudinary Storage</h3>
                                <p className="text-xs text-[#738290]">Files uploaded here instantly sync with the Admin portal.</p>
                            </div>
                            <button
                                onClick={() => setIsUploadOpen(true)}
                                className="px-4 py-2 bg-[#C49A6C] text-white text-xs font-semibold uppercase rounded-lg hover:bg-[#b58b5e]"
                            >
                                + Upload Document
                            </button>
                        </div>

                        {documents.length === 0 ? (
                            <p className="text-sm text-[#738290] py-6">No documents uploaded yet.</p>
                        ) : (
                            <div className="divide-y divide-gray-100">
                                {documents.map((doc) => (
                                    <div key={doc.id} className="py-4 flex items-center justify-between gap-4">
                                        <div>
                                            <strong className="text-[#0A2647] text-sm block">{doc.name}</strong>
                                            <span className="text-[11px] text-[#738290]">{doc.category} · {new Date(doc.createdAt).toLocaleDateString()}</span>
                                        </div>
                                        <button
                                            onClick={() => handleSecureDownload(doc.id, doc.name)}
                                            className="px-3 py-1.5 bg-[#C49A6C] text-white text-xs font-semibold rounded hover:bg-[#b58b5e] transition cursor-pointer"
                                        >
                                            Download PDF
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* 4. BILLING TAB */}
                {activeTab === 'Billing' && (
                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 space-y-6">
                        <h3 className="font-serif text-xl font-bold text-[#0A2647]">Invoices & Financial Records</h3>
                        {invoices.length === 0 ? (
                            <p className="text-sm text-[#738290] py-6">No invoices found.</p>
                        ) : (
                            <table className="w-full text-left text-xs">
                                <thead>
                                    <tr className="border-b text-[#738290] uppercase text-[10px]">
                                        <th className="pb-3">Invoice #</th>
                                        <th className="pb-3">Amount</th>
                                        <th className="pb-3">Due Date</th>
                                        <th className="pb-3 text-center">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {invoices.map((inv) => (
                                        <tr key={inv.id}>
                                            <td className="py-4 font-semibold text-[#0A2647]">{inv.invoiceNumber}</td>
                                            <td className="py-4 font-bold text-[#0A2647]">${inv.amount?.toFixed(2)}</td>
                                            <td className="py-4 text-[#738290]">{new Date(inv.dueDate).toLocaleDateString()}</td>
                                            <td className="py-4 text-center">
                                                <span className={`px-2.5 py-1 rounded font-semibold text-[11px] ${inv.status === 'PAID' ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'}`}>
                                                    {inv.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                )}

                {/* 5. CALENDAR TAB */}
                {activeTab === 'Calendar' && (
                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 space-y-6">
                        <div>
                            <h3 className="font-serif text-xl font-bold text-[#0A2647]">Appointments</h3>
                            <p className="text-sm text-[#738290] mt-1">Request a meeting with the law firm.</p>
                        </div>
                        {appointmentError && (
                            <div role="alert" className="p-3 bg-red-50 border border-red-200 text-sm text-red-700 rounded">
                                {appointmentError}
                            </div>
                        )}
                        {appointmentSuccess && (
                            <div role="status" className="p-3 bg-green-50 border border-green-200 text-sm text-green-700 rounded">
                                {appointmentSuccess}
                            </div>
                        )}
                        <form onSubmit={handleBookAppointment} className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                            <label className="text-xs font-semibold text-[#0A2647]">
                                Meeting purpose
                                <input
                                    type="text"
                                    value={appointmentTitle}
                                    onChange={(e) => setAppointmentTitle(e.target.value)}
                                    placeholder="e.g. Initial consultation"
                                    maxLength={120}
                                    className="mt-1 w-full px-3 py-2 border rounded-lg font-normal"
                                    required
                                />
                            </label>
                            <label className="text-xs font-semibold text-[#0A2647]">
                                Date and time
                                <input
                                    type="datetime-local"
                                    min={earliestAppointmentDateTime}
                                    value={appointmentDateTime}
                                    onChange={(e) => setAppointmentDateTime(e.target.value)}
                                    className="mt-1 w-full px-3 py-2 border rounded-lg font-normal"
                                    required
                                />
                            </label>
                            <label className="text-xs font-semibold text-[#0A2647]">
                                Location
                                <select
                                    value={appointmentLocation}
                                    onChange={(e) => setAppointmentLocation(e.target.value)}
                                    className="mt-1 w-full px-3 py-2 border rounded-lg font-normal"
                                >
                                    <option>Video Conference</option>
                                    <option>Main Office</option>
                                </select>
                            </label>
                            <label className="text-xs font-semibold text-[#0A2647]">
                                Related matter <span className="font-normal text-[#738290]">(optional)</span>
                                <select
                                    value={appointmentMatterId}
                                    onChange={(e) => setAppointmentMatterId(e.target.value)}
                                    className="mt-1 w-full px-3 py-2 border rounded-lg font-normal"
                                >
                                    <option value="">General consultation / no matter</option>
                                    {matters.map((matter) => (
                                        <option key={matter.id} value={matter.id}>{matter.title} (#{matter.caseNumber})</option>
                                    ))}
                                </select>
                            </label>
                            <div className="md:col-span-2 flex justify-end">
                                <button
                                    type="submit"
                                    disabled={bookingAppointment}
                                    className="px-5 py-2.5 bg-[#0A2647] hover:bg-[#071d37] disabled:opacity-50 text-white text-xs font-semibold rounded-lg"
                                >
                                    {bookingAppointment ? 'Sending request...' : 'Request Appointment'}
                                </button>
                            </div>
                        </form>
                        {appointments.length === 0 ? (
                            <p className="text-sm text-[#738290] py-2">No appointments scheduled yet.</p>
                        ) : (
                            appointments.map((app) => (
                                <div key={app.id} className="p-4 bg-gray-50 rounded-xl border-l-4 border-[#0A2647]">
                                    <strong className="text-[#0A2647] text-sm block">{app.title}</strong>
                                    <p className="text-xs text-[#738290]">{app.location} · {new Date(app.dateTime).toLocaleString()}</p>
                                </div>
                            ))
                        )}
                    </div>
                )}

                {/* 6. MESSAGES TAB */}
                {activeTab === 'Messages' && (
                    <MessagesSection />
                )}

            </main>

            {/* Cloudinary Upload Modal */}
            {isUploadOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="rounded-xl max-w-md w-full p-6 space-y-4 shadow-2xl bg-white">
                        <div className="flex justify-between items-center border-b pb-3">
                            <h3 className="font-serif font-bold text-lg text-[#0A2647]">Upload Document to Cloudinary</h3>
                            <button onClick={() => setIsUploadOpen(false)} className="text-gray-400 font-bold text-lg">×</button>
                        </div>

                        <form onSubmit={handleUploadSubmit} className="space-y-4 text-xs">
                            <div>
                                <label className="block font-semibold text-[#0A2647] mb-1">Select Matter</label>
                                <select
                                    value={uploadMatterId}
                                    onChange={(e) => setUploadMatterId(e.target.value)}
                                    className="w-full px-3 py-2 border rounded-lg"
                                    required
                                >
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
                                    className="w-full px-3 py-2 border rounded-lg"
                                    placeholder="e.g. Draft Agreement, Evidence"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block font-semibold text-[#0A2647] mb-1">Choose File (PDF/Doc)</label>
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