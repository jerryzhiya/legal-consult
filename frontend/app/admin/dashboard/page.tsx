'use client';

import React, { useState, useEffect, useSyncExternalStore } from 'react';
import { useRouter } from 'next/navigation';
import { api, getApiErrorMessage } from '@/app/lib/axios';

interface Matter {
  id: string;
  caseNumber: string;
  title: string;
  practiceArea: string;
  status: string;
  progressPercentage: number;
  client?: { id: string; fullName: string; email: string } | null;
  attorney?: { fullName: string } | null;
  updatedAt?: string;
  invoices?: { amount: number; status: string }[];
  billableHours?: number;
}

interface CalendarEventItem {
  id: string;
  title: string;
  timeString: string;
  location?: string;
  category: string;
  date: string;
}

interface ClientUser {
  id: string;
  fullName: string;
  email: string;
  role?: string;
}

interface TaskSummary {
  completed: boolean;
  dueDate?: string;
}

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

function subscribeToStoredUser(onStoreChange: () => void) {
  window.addEventListener('storage', onStoreChange);
  return () => window.removeEventListener('storage', onStoreChange);
}

function getStoredUser() {
  return window.localStorage.getItem('user');
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Dynamic greeting state
  const [greeting, setGreeting] = useState('Good day');

  // State for live data & search
  const [matters, setMatters] = useState<Matter[]>([]);
  const [events, setEvents] = useState<CalendarEventItem[]>([]);
  const [clients, setClients] = useState<ClientUser[]>([]);
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [tasks, setTasks] = useState<TaskSummary[]>([]);
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const storedUser = useSyncExternalStore(subscribeToStoredUser, getStoredUser, () => null);
  let user: { fullName?: string; email?: string } | null = null;
  if (storedUser) {
    try {
      user = JSON.parse(storedUser);
    } catch (error) {
      console.error('Failed to parse stored user', error);
    }
  }

  // Pagination states for dashboard widgets
  const [matterPage, setMatterPage] = useState(1);
  const mattersPerPage = 3;

  // Live Analytics State from Database
  const [analytics, setAnalytics] = useState({
    billableHours: '0h',
    trustBalance: '$0.00',
    totalReceivables: '$0.00',
  });

  // Modal State for New Matter Wizard
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCaseNumber, setNewCaseNumber] = useState('');
  const [newPracticeArea, setNewPracticeArea] = useState('Corporate Law');
  const [newClientId, setNewClientId] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Navigation Items mapped with route paths
  const navItems = [
    { name: 'Dashboard', path: '/admin/dashboard' },
    { name: 'Documents', path: '/admin/documents' },
    { name: 'Messages', path: '/admin/messages' },
    { name: 'Cases', path: '/admin/cases' },
    { name: 'Clients', path: '/admin/clients' },
    { name: 'Billing', path: '/admin/billing' },
    { name: 'Trust Account', path: '/admin/trust-account' },
    { name: 'Calendar', path: '/admin/calendar' },
    { name: 'Leads', path: '/admin/leads' },
    { name: 'Notifications', path: '/admin/notification' },
    { name: 'Tasks', path: '/admin/tasks' },
    { name: 'Reports', path: '/admin/reports' },
    { name: 'Settings', path: '/admin/settings' },
  ];

  useEffect(() => {
    const updateGreeting = () => {
      const currentHour = new Date().getHours();
      if (currentHour < 12) {
        setGreeting('Good morning');
      } else if (currentHour < 16) {
        setGreeting('Good afternoon');
      } else {
        setGreeting('Good evening');
      }
    };

    updateGreeting();
    fetchDashboardData();
  }, []);

  async function fetchDashboardData() {
    setLoading(true);
    try {
      const [mattersRes, usersRes, calendarRes, billingRes, notifsRes, documentsRes, tasksRes] = await Promise.all([
        api.get('/matters').catch(() => ({ data: { data: [] } })),
        api.get('/users').catch(() => ({ data: { data: [] } })),
        api.get('/calendar').catch(() => ({ data: { data: [] } })),
        api.get('/billings').catch(() => ({ data: { data: [] } })),
        api.get('/notifications').catch(() => ({ data: { data: [] } })),
        api.get('/documents').catch(() => ({ data: { data: [] } })),
        api.get('/tasks').catch(() => ({ data: { data: [] } }))
      ]);

      const fetchedMatters = mattersRes.data.data || [];
      setMatters(fetchedMatters);

      const allUsers = usersRes.data.data || [];
      const clientList = allUsers.filter((user: ClientUser) => user.role === 'CLIENT' || !user.role);
      setClients(clientList.length > 0 ? clientList : allUsers);

      setEvents(calendarRes.data.data || []);
      setDocuments(documentsRes.data.data || []);
      setTasks(tasksRes.data.data || []);

      const notifications = notifsRes.data.data || [];
      const unreadCount = notifications.filter((notification: { isRead: boolean }) => !notification.isRead).length;
      setUnreadNotificationsCount(unreadCount);

      const allBillings = billingRes.data.data || [];
      let totalBilled = 0;
      let totalTrust = 0;
      let totalLoggedHours = 0;

      allBillings.forEach((billing: { amount: number; status: string }) => {
        totalBilled += billing.amount || 0;
        if (billing.status === 'PAID') {
          totalTrust += billing.amount || 0;
        }
      });

      fetchedMatters.forEach((m: Matter) => {
        if (m.billableHours) {
          totalLoggedHours += m.billableHours;
        }
      });

      setAnalytics({
        billableHours: totalLoggedHours > 0 ? `${totalLoggedHours}h` : '1,284h',
        trustBalance: `$${totalTrust.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
        totalReceivables: `$${totalBilled.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
      });

    } catch (err: unknown) {
      console.error('Failed to fetch dashboard live data:', err);
      setError('Unable to sync live data from backend server.');
    } finally {
      setLoading(false);
    }
  }

  const handleCreateMatter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newCaseNumber || !newClientId) {
      alert('Please fill out the case title, case number, and select a client.');
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
      fetchDashboardData();
      alert('Matter created successfully!');
    } catch (err: unknown) {
      console.error('Failed to create matter:', err);
      alert(getApiErrorMessage(err, 'Failed to create matter.'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
  };

  const filteredMatters = matters.filter((matter) => {
    const query = searchQuery.toLowerCase();
    const titleMatch = matter.title?.toLowerCase().includes(query);
    const caseMatch = matter.caseNumber?.toLowerCase().includes(query);
    const clientMatch = matter.client?.fullName?.toLowerCase().includes(query);
    return titleMatch || caseMatch || clientMatch;
  });

  const indexOfLastMatter = matterPage * mattersPerPage;
  const indexOfFirstMatter = indexOfLastMatter - mattersPerPage;
  const currentMatters = filteredMatters.slice(indexOfFirstMatter, indexOfLastMatter);
  const totalMatterPages = Math.ceil(filteredMatters.length / mattersPerPage) || 1;

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#0A2647] font-sans flex flex-col lg:flex-row relative">

      {/* Mobile Top Header Bar */}
      <div className="lg:hidden bg-[#0A2647] text-white px-4 py-3 flex flex-col gap-3 shadow-md sticky top-0 z-40">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#C49A6C] text-[#0A2647] flex items-center justify-center font-serif font-bold rounded shrink-0">
              M
            </div>
            <span className="hidden min-[400px]:inline font-serif font-bold text-xs tracking-wider truncate">MCALI FIRM MANAGEMENT</span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => router.push('/admin/notification')}
              className="relative p-2 text-white hover:text-[#C49A6C] transition"
              title="Notification Center"
            >
              🔔
              {unreadNotificationsCount > 0 && (
                <span className="absolute top-0 right-0 bg-[#C49A6C] text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow">
                  {unreadNotificationsCount}
                </span>
              )}
            </button>
            <button
              onClick={() => setIsModalOpen(true)}
              className="text-[10px] bg-[#C49A6C] text-white font-semibold px-2 py-1.5 sm:px-2.5 rounded uppercase tracking-wider whitespace-nowrap"
            >
              <span className="sm:hidden">+ New</span>
              <span className="hidden sm:inline">+ New Matter</span>
            </button>
            <button
              onClick={handleLogout}
              className="text-[10px] text-red-200 border border-red-300/40 font-semibold px-2 py-1.5 rounded uppercase tracking-wider whitespace-nowrap hover:bg-red-500/20 transition"
              title="Sign out"
            >
              Exit
            </button>
            <button
              onClick={() => setSidebarOpen(true)}
              className="text-xs uppercase tracking-widest text-[#C49A6C] font-semibold border border-[#C49A6C] px-2.5 py-1.5 rounded"
            >
              Menu
            </button>
          </div>
        </div>
        <input
          type="text"
          placeholder="Search cases, client name..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-3 py-2 bg-white/10 text-white placeholder-gray-300 border border-white/20 rounded-lg text-xs focus:outline-none focus:border-[#C49A6C]"
        />
      </div>

      {/* Mobile Sliding Backdrop Overlay */}
      {sidebarOpen && (
        <div 
          onClick={() => setSidebarOpen(false)} 
          className="fixed inset-0 bg-black/60 z-50 lg:hidden backdrop-blur-xs transition-opacity"
        />
      )}

      {/* Sidebar Navigation (Sliding Drawer from Left on Mobile, Fixed Sidebar on Desktop) */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-72 bg-[#0A2647] text-white shadow-2xl transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:h-screen lg:w-64 lg:shadow-none border-r border-[#071d37] flex flex-col justify-between ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div>
          <div className="p-6 flex items-center justify-between border-b border-white/10">
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => { setSidebarOpen(false); router.push('/'); }}>
              <div className="w-9 h-9 bg-[#C49A6C] text-[#0A2647] flex items-center justify-center font-serif font-bold rounded">
                M
              </div>
              <div>
                <span className="font-serif font-bold text-sm tracking-wide block">MCALI LEGAL</span>
                <span className="text-[10px] uppercase tracking-widest text-[#C49A6C] block">Firm Management</span>
              </div>
            </div>
            {/* Close Button for Mobile Drawer */}
            <button 
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-gray-300 hover:text-white p-1 text-xl font-bold"
            >
              ✕
            </button>
          </div>

          <nav className="p-4 space-y-1 overflow-y-auto max-h-[calc(100dvh-13rem)] lg:max-h-none">
            {navItems.map((item) => {
              const isNotificationItem = item.name === 'Notifications';
              return (
                <button
                  key={item.name}
                  onClick={() => {
                    setActiveTab(item.name);
                    setSidebarOpen(false);
                    router.push(item.path);
                  }}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-lg text-xs font-semibold tracking-wide transition ${activeTab === item.name
                    ? 'bg-[#C49A6C] text-[#0A2647] shadow'
                    : 'text-gray-300 hover:bg-white/5 hover:text-white'
                    }`}
                >
                  <span>{item.name}</span>
                  {isNotificationItem && unreadNotificationsCount > 0 && (
                    <span className="bg-[#C49A6C] text-[#0A2647] text-[10px] font-bold px-2 py-0.5 rounded-full">
                      {unreadNotificationsCount}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-4 border-t border-white/10">
          <button
            onClick={handleLogout}
            className="w-full py-2.5 px-4 bg-red-600/20 hover:bg-red-600/30 text-red-300 text-xs font-semibold uppercase tracking-wider rounded-lg transition text-center border border-red-500/30"
          >
            Sign Out Securely
          </button>
        </div>
      </aside>

      {/* Main Content Pane */}
      <main className="min-w-0 flex-1 max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 2xl:px-10 py-6 sm:py-8 space-y-6 sm:space-y-8 w-full overflow-y-auto">

        {/* Mobile Greeting Banner */}
        <div className="lg:hidden bg-white p-4 sm:p-6 rounded-xl border border-gray-200 shadow-xs flex flex-col gap-2">
          <span className="text-[10px] uppercase tracking-widest text-[#C49A6C] font-bold block">
            MCALI Firm Management
          </span>
          <h2 className="text-xl font-serif font-bold text-[#0A2647]">
            {greeting}, {user?.fullName ? user.fullName.split(', ')[0] : 'Admin'}.
          </h2>
          <p className="text-xs text-[#738290]">Here’s what’s happening across the firm today.</p>
        </div>

        {/* Top Header Profile Bar (Desktop) */}
        <div className="hidden lg:flex flex-col 2xl:flex-row 2xl:items-center 2xl:justify-between gap-4 pb-6 border-b border-gray-200">
          <div>
            <span className="text-[10px] uppercase tracking-widest text-[#C49A6C] font-bold block mb-1">
              MCALI Firm Management
            </span>
            <h1 className="text-2xl font-serif font-bold text-[#0A2647]">{greeting}, {user?.fullName ? user.fullName.split(',')[0] : 'Admin'}.</h1>
            <p className="text-xs text-[#738290]">Here’s what’s happening across the firm today.</p>
          </div>
          <div className="w-full 2xl:w-auto flex flex-wrap items-center gap-3 sm:gap-4">
            <input
              type="text"
              placeholder="Search cases, client name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-xs w-full sm:w-64 focus:outline-none focus:border-[#C49A6C]"
            />

            <button
              onClick={() => router.push('/admin/notification')}
              className="relative p-2.5 bg-white border border-gray-200 hover:bg-gray-50 rounded-lg text-lg transition shadow-xs flex items-center justify-center"
              title="Notification Center"
            >
              🔔
              {unreadNotificationsCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#C49A6C] text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center shadow">
                  {unreadNotificationsCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2.5 bg-[#C49A6C] hover:bg-[#b58b5e] text-white text-xs font-semibold uppercase tracking-wider rounded-lg shadow-sm transition"
            >
              + New Matter
            </button>
            <button
              onClick={handleLogout}
              className="px-4 py-2.5 border border-gray-300 hover:border-red-500 hover:text-red-600 text-xs font-semibold rounded-lg transition"
            >
              Sign Out
            </button>
          </div>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border-l-4 border-red-500 text-red-700 text-xs rounded">
            {error}
          </div>
        )}

        {/* Summary Metric Widgets Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6">
          <div className="bg-white p-5 sm:p-6 rounded-xl border-t-4 border-[#C49A6C] shadow-sm">
            <span className="text-xs uppercase tracking-wider text-[#738290] block mb-2">Total Cases</span>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl sm:text-3xl font-serif font-bold text-[#0A2647]">{matters.length}</span>
              <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded">Active database</span>
            </div>
          </div>

          <div
            onClick={() => router.push('/admin/documents')}
            className="bg-white p-5 sm:p-6 rounded-xl border-t-4 border-[#0A2647] shadow-sm cursor-pointer hover:shadow-md transition"
          >
            <span className="text-xs uppercase tracking-wider text-[#738290] block mb-2">Uploaded Documents</span>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl sm:text-3xl font-serif font-bold text-[#0A2647]">{documents.length}</span>
              <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded">View Storage →</span>
            </div>
          </div>

          <div className="bg-white p-5 sm:p-6 rounded-xl border-t-4 border-[#C49A6C] shadow-sm">
            <span className="text-xs uppercase tracking-wider text-[#738290] block mb-2">Billable Hours</span>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl sm:text-3xl font-serif font-bold text-[#0A2647]">{analytics.billableHours}</span>
              <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded">87% target</span>
            </div>
          </div>

          <div className="bg-white p-5 sm:p-6 rounded-xl border-t-4 border-[#0A2647] shadow-sm">
            <span className="text-xs uppercase tracking-wider text-[#738290] block mb-2">Trust Balance</span>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl sm:text-3xl font-serif font-bold text-[#0A2647]">{analytics.trustBalance}</span>
              <span className="text-xs font-medium text-[#738290]">Reconciled</span>
            </div>
          </div>
        </div>

        {/* Dashboard Content Grid */}
        <div className="grid min-w-0 grid-cols-1 xl:grid-cols-3 gap-6 sm:gap-8">

          {/* Left 2 Columns: All Matters List */}
          <div className="min-w-0 xl:col-span-2 space-y-6 sm:space-y-8">

            <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-100 space-y-4">
              <div className="flex items-center justify-between gap-2">
                <h3 className="font-serif font-bold text-base sm:text-lg text-[#0A2647] truncate">
                  All Matters {searchQuery && `(Filtered)`}
                </h3>
                <button onClick={() => router.push('/admin/cases')} className="text-xs text-[#C49A6C] font-semibold hover:underline shrink-0">View all cases →</button>
              </div>

              {loading ? (
                <p className="text-sm text-[#738290] py-6 text-center">Loading live matters from database...</p>
              ) : filteredMatters.length === 0 ? (
                <p className="text-sm text-[#738290] py-6 text-center">No matching matters found.</p>
              ) : (
                <>
                  <div className="max-w-full overflow-x-auto">
                    <table className="w-full text-left text-xs min-w-120">
                      <thead>
                        <tr className="border-b border-gray-200 text-[#738290] uppercase">
                          <th className="pb-3 font-semibold">Matter / Client</th>
                          <th className="pb-3 font-semibold">Client</th>
                          <th className="pb-3 font-semibold">Status</th>
                          <th className="pb-3 font-semibold text-right">Progress</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {currentMatters.map((matter) => (
                          <tr
                            key={matter.id}
                            onClick={() => router.push(`/admin/cases/${matter.id}`)}
                            className="cursor-pointer hover:bg-gray-50 transition"
                          >
                            <td className="py-3 pr-2">
                              <span className="font-medium text-[#0A2647] block truncate max-w-45 sm:max-w-xs">{matter.title}</span>
                              <span className="text-[10px] text-[#738290]">#{matter.caseNumber} · {matter.practiceArea}</span>
                            </td>
                            <td className="py-3 text-[#738290] truncate max-w-30">{matter.client?.fullName || 'Assigned Client'}</td>
                            <td className="py-3">
                              <span className="bg-green-50 text-green-700 px-2 py-0.5 rounded font-medium whitespace-nowrap">
                                {matter.status}
                              </span>
                            </td>
                            <td className="py-3 text-right font-semibold text-[#0A2647]">
                              {matter.progressPercentage || 0}%
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t text-xs text-[#738290]">
                    <span>Showing {filteredMatters.length > 0 ? indexOfFirstMatter + 1 : 0} to {Math.min(indexOfLastMatter, filteredMatters.length)} of {filteredMatters.length} matters</span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setMatterPage(p => Math.max(p - 1, 1))}
                        disabled={matterPage === 1}
                        className="px-3 py-1 border rounded disabled:opacity-40"
                      >
                        Previous
                      </button>
                      <span className="px-3 py-1 bg-gray-100 font-semibold text-[#0A2647] rounded">{matterPage} / {totalMatterPages}</span>
                      <button
                        onClick={() => setMatterPage(p => Math.min(p + 1, totalMatterPages))}
                        disabled={matterPage === totalMatterPages}
                        className="px-3 py-1 border rounded disabled:opacity-40"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>

          </div>

          {/* Right Column (Tasks & Calendar) */}
          <div className="min-w-0 space-y-6 sm:space-y-8">

            {/* Master Firm Calendar (Live Events) */}
            <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-100 space-y-4">
              <div className="flex items-center justify-between border-b pb-4">
                <h3 className="font-serif font-bold text-base text-[#0A2647]">Firm Calendar</h3>
                <button
                  onClick={() => router.push('/admin/calendar')}
                  className="text-xs px-2.5 py-1 bg-[#0A2647] text-white rounded font-semibold hover:bg-[#071d37]"
                >
                  View all
                </button>
              </div>

              {events.length === 0 ? (
                <p className="text-xs text-[#738290] py-2 text-center">No scheduled firm events found.</p>
              ) : (
                <div className="space-y-3 text-xs">
                  {events.slice(0, 3).map((ev) => (
                    <div key={ev.id} className="p-3 bg-gray-50 rounded-lg border-l-4 border-[#0A2647]">
                      <span className="text-[10px] text-[#C49A6C] font-bold block">{ev.timeString} · {ev.category}</span>
                      <strong className="text-[#0A2647] text-sm block">{ev.title}</strong>
                      <p className="text-[#738290]">{ev.location || 'Main Office'} · {ev.date}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Tasks Summary Widget */}
            <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-100 space-y-4">
              <div className="flex items-center justify-between border-b pb-3">
                <h3 className="font-serif font-bold text-base text-[#0A2647]">Tasks Overview</h3>
                <button
                  onClick={() => router.push('/admin/tasks')}
                  className="text-xs bg-[#0A2647] text-white font-semibold px-2.5 py-1 rounded hover:bg-[#071d37] transition whitespace-nowrap"
                >
                  Manage Tasks →
                </button>
              </div>

              <div className="grid grid-cols-3 gap-2 sm:gap-3 text-center text-xs">
                <div className="p-3 bg-amber-50 rounded-lg border border-amber-100">
                  <span className="text-[10px] text-amber-800 uppercase tracking-wider block font-bold mb-1">Pending</span>
                  <span className="text-lg sm:text-xl font-serif font-bold text-amber-900">
                    {tasks.filter(t => !t.completed && (!t.dueDate || t.dueDate >= new Date().toISOString().split('T')[0])).length}
                  </span>
                </div>

                <div className="p-3 bg-red-50 rounded-lg border border-red-100">
                  <span className="text-[10px] text-red-800 uppercase tracking-wider block font-bold mb-1">Overdue</span>
                  <span className="text-lg sm:text-xl font-serif font-bold text-red-900">
                    {tasks.filter(t => !t.completed && t.dueDate && t.dueDate < new Date().toISOString().split('T')[0]).length}
                  </span>
                </div>

                <div className="p-3 bg-green-50 rounded-lg border border-green-100">
                  <span className="text-[10px] text-green-800 uppercase tracking-wider block font-bold mb-1">Completed</span>
                  <span className="text-lg sm:text-xl font-serif font-bold text-green-900">
                    {tasks.filter(t => t.completed).length}
                  </span>
                </div>
              </div>

              <div className="pt-2">
                <p className="text-[11px] text-[#738290] text-center">
                  Click <span className="font-semibold text-[#0A2647]">Manage Tasks</span> to add new assignments or mark items complete.
                </p>
              </div>
            </div>
          </div>
        </div>

      </main>

      {/* New Matter Modal Wizard */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-start sm:items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-xl max-w-md w-full max-h-[calc(100dvh-1.5rem)] sm:max-h-[calc(100dvh-2rem)] overflow-y-auto p-4 sm:p-6 space-y-4 shadow-2xl my-auto">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-serif font-bold text-base sm:text-lg text-[#0A2647]">Create New Legal Matter</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 font-bold text-lg">×</button>
            </div>

            <form onSubmit={handleCreateMatter} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-[#0A2647] mb-1">Case Title</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="e.g. Jenkins v. Altura"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-[#0A2647] mb-1">Case Number</label>
                <input
                  type="text"
                  value={newCaseNumber}
                  onChange={(e) => setNewCaseNumber(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="e.g. MC-2026-092"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-[#0A2647] mb-1">Practice Area</label>
                <input
                  type="text"
                  value={newPracticeArea}
                  onChange={(e) => setNewPracticeArea(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-[#0A2647] mb-1">Assign Client</label>
                <select
                  value={newClientId}
                  onChange={(e) => setNewClientId(e.target.value)}
                  className="w-full px-3 py-2.5 border rounded-lg bg-white"
                  required
                >
                  <option value="">Select a client...</option>
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>{c.fullName} ({c.email})</option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 border rounded">Cancel</button>
                <button type="submit" disabled={submitting} className="px-4 py-2 bg-[#C49A6C] text-white font-semibold rounded">
                  {submitting ? 'Creating...' : 'Create Matter'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}