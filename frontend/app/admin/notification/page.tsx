'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/app/lib/axios';

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt?: string;
}

export default function NotificationsPage() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  
  // Persistent unread filter state using localStorage
  const [unreadOnly, setUnreadOnly] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('notification_unread_only');
      return saved ? JSON.parse(saved) : false;
    }
    return false;
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadNotifications = async () => {
      setLoading(true);
      try {
        const response = await api.get('/notifications');
        setNotifications(response.data.data || []);
      } catch (err: unknown) {
        console.error('Failed to fetch notifications:', err);
        setError('Unable to sync notification alerts from backend server.');
      } finally {
        setLoading(false);
      }
    };

    void loadNotifications();
  }, []);

  const handleToggleUnreadOnly = () => {
    const newValue = !unreadOnly;
    setUnreadOnly(newValue);
    if (typeof window !== 'undefined') {
      localStorage.setItem('notification_unread_only', JSON.stringify(newValue));
    }
  };

  const handleMarkAsRead = async (id: string) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications(notifications.map(n => n.id === id ? { ...n, isRead: true } : n));
    } catch (err) {
      console.error('Failed to mark notification as read', err);
    }
  };

  const handleArchive = async (id: string) => {
    try {
      await api.delete(`/notifications/${id}`);
      setNotifications(notifications.filter(n => n.id !== id));
    } catch (err) {
      console.error('Failed to archive notification', err);
    }
  };

  const filteredNotifications = notifications.filter(n => {
    if (unreadOnly) return !n.isRead;
    return true;
  });

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#0A2647] font-sans p-4 sm:p-6 lg:p-10 space-y-8 max-w-5xl mx-auto w-full">
      
      {/* Top Header Navigation */}
      <div className="flex items-center justify-between border-b pb-4">
        <div>
          <span className="text-[10px] uppercase tracking-widest text-[#C49A6C] font-bold block mb-1">
            Firm Workspace
          </span>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#0A2647]">Notification Center</h1>
        </div>
        <button 
          onClick={() => router.push('/admin/dashboard')}
          className="text-xs font-semibold text-[#0A2647] hover:underline whitespace-nowrap"
        >
          ← Back to Dashboard
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border-l-4 border-red-500 text-red-700 text-xs rounded">
          {error}
        </div>
      )}

      {/* Main Alerts Feed Container */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 space-y-6">
        
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b pb-4">
          <div>
            <h2 className="font-serif text-lg font-bold text-[#0A2647]">Recent Alerts</h2>
            <p className="text-xs text-[#738290]">Real-time firm activity and client notifications.</p>
          </div>
          
          <div className="flex items-center gap-3 text-xs font-semibold">
            <span className="text-[#738290]">Show Unread Only</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                checked={unreadOnly} 
                onChange={handleToggleUnreadOnly}
                className="sr-only peer" 
              />
              <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#0A2647]"></div>
            </label>
          </div>
        </div>

        {loading ? (
          <p className="text-xs text-[#738290] py-8 text-center">Loading notifications...</p>
        ) : filteredNotifications.length === 0 ? (
          <p className="text-xs text-[#738290] py-8 text-center">No notifications found.</p>
        ) : (
          <div className="space-y-4">
            {filteredNotifications.map((item) => (
              <div 
                key={item.id} 
                className={`p-4 rounded-xl border transition space-y-3 ${
                  !item.isRead ? 'bg-[#FDFBF7] border-[#C49A6C]/40 shadow-xs' : 'bg-gray-50/60 border-gray-100'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[#0A2647] text-[#C49A6C] flex items-center justify-center font-bold text-xs flex-shrink-0 mt-0.5">
                      🔔
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <strong className="text-[#0A2647] text-sm">{item.title}</strong>
                        {!item.isRead && (
                          <span className="bg-[#0A2647] text-white text-[9px] font-bold px-1.5 py-0.5 rounded uppercase">
                            NEW
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-[#738290] mt-1">{item.message}</p>
                    </div>
                  </div>
                  <span className="text-[10px] text-[#738290] whitespace-nowrap">
                    {item.createdAt ? new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recent'}
                  </span>
                </div>

                <div className="flex items-center justify-end gap-4 text-xs pt-2 border-t border-gray-200/60">
                  <button 
                    onClick={() => handleArchive(item.id)}
                    className="text-gray-500 hover:text-red-600 font-semibold"
                  >
                    Archive
                  </button>
                  {!item.isRead && (
                    <button 
                      onClick={() => handleMarkAsRead(item.id)}
                      className="text-[#0A2647] hover:underline font-semibold"
                    >
                      Mark as Read
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}