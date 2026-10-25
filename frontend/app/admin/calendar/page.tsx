'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { api } from '@/app/lib/axios';

interface CalendarEventItem {
  id: string;
  title: string;
  timeString: string;
  location?: string;
  category: string;
  date: string;
}

interface ClientAppointment {
  id: string;
  title: string;
  dateTime: string;
  location: string;
  user?: { fullName: string; email: string } | null;
  matter?: { title: string; caseNumber: string } | null;
}

export default function CalendarPage() {
  const router = useRouter();
  const [events, setEvents] = useState<CalendarEventItem[]>([]);
  const [clientAppointments, setClientAppointments] = useState<ClientAppointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Safely compute current date on client side only to avoid Next.js prerender errors
  const [currentDate, setCurrentDate] = useState<Date | null>(null);
  const [currentMonthName, setCurrentMonthName] = useState('');
  const [currentYear, setCurrentYear] = useState(2026);
  const [daysInMonth, setDaysInMonth] = useState(31);

  // Modal State for adding a new event
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [eventTitle, setEventTitle] = useState('');
  const [eventTime, setEventTime] = useState('');
  const [eventLocation, setEventLocation] = useState('');
  const [eventType, setEventType] = useState('COURT');
  const [eventDate, setEventDate] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchCalendarData = useCallback(async () => {
    setLoading(true);
    try {
      const [eventsResponse, appointmentsResponse] = await Promise.all([
        api.get('/calendar'),
        api.get('/appointments'),
      ]);
      setEvents(eventsResponse.data.data || []);
      setClientAppointments(appointmentsResponse.data.data || []);
    } catch (err: unknown) {
      console.error('Failed to load calendar events:', err);
      const message = axios.isAxiosError<{ error?: string }>(err)
        ? err.response?.data?.error
        : undefined;
      setError(message || 'Unable to sync calendar records from server.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void Promise.resolve().then(() => {
      const now = new Date();
      setCurrentDate(now);
      setCurrentMonthName(now.toLocaleString('default', { month: 'long' }));
      setCurrentYear(now.getFullYear());
      setDaysInMonth(new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate());
      setEventDate(now.toISOString().split('T')[0]);
    });
    void Promise.resolve().then(fetchCalendarData);
  }, [fetchCalendarData]);

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventTitle || !eventTime) {
      alert('Please fill out the event title and time.');
      return;
    }

    setSubmitting(true);
    try {
      await api.post('/calendar', {
        title: eventTitle,
        category: eventType,
        date: eventDate,
        timeString: eventTime,
        location: eventLocation || 'Main Office',
      });

      setIsModalOpen(false);
      setEventTitle('');
      setEventTime('');
      setEventLocation('');
      fetchCalendarData();
      alert('Calendar event scheduled successfully!');
    } catch (err: unknown) {
      console.error('Failed to schedule event:', err);
      const message = axios.isAxiosError<{ error?: string }>(err)
        ? err.response?.data?.error
        : undefined;
      alert(message || 'Failed to schedule event.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteEvent = async (id: string) => {
    if (!confirm('Are you sure you want to delete this scheduled event?')) return;

    try {
      await api.delete(`/calendar/${id}`);
      alert('Event deleted successfully!');
      fetchCalendarData();
    } catch (err: unknown) {
      console.error('Failed to delete event:', err);
      const message = axios.isAxiosError<{ error?: string }>(err)
        ? err.response?.data?.error
        : undefined;
      alert(message || 'Only administrators are authorized to delete calendar events.');
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#0A2647] font-sans p-4 sm:p-6 lg:p-10 space-y-8 w-full">
      
      {/* Top Header Navigation */}
      <div className="flex items-center justify-between border-b pb-4">
        <div>
          <span className="text-[10px] uppercase tracking-widest text-[#C49A6C] font-bold block mb-1">
            Firm Schedule
          </span>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#0A2647]">Calendar</h1>
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
        
        {/* Header & Add Event Button */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="font-serif text-xl font-bold text-[#0A2647]">Master Firm Calendar</h2>
            <p className="text-xs text-[#738290]">Manage all calendar records securely from one place.</p>
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="w-full sm:w-auto px-4 py-2.5 bg-[#C49A6C] hover:bg-[#b58b5e] text-white text-xs font-semibold uppercase tracking-wider rounded-lg shadow-sm transition text-center"
          >
            + Add event
          </button>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border-l-4 border-red-500 text-red-700 text-xs rounded">
            {error}
          </div>
        )}

        {/* Month View Widget */}
        <div className="border border-gray-200 rounded-xl p-6 bg-white space-y-4 shadow-sm">
          <div className="flex items-center justify-between border-b pb-4">
            <button className="p-1 rounded hover:bg-gray-100 text-gray-500 font-bold">‹</button>
            <h3 className="font-serif font-bold text-lg text-[#0A2647]">{currentMonthName || 'Loading...'} {currentYear}</h3>
            <button className="p-1 rounded hover:bg-gray-100 text-gray-500 font-bold">›</button>
          </div>

          {/* Calendar Grid Header */}
          <div className="grid grid-cols-7 text-center text-[10px] font-bold text-[#738290] uppercase tracking-wider">
            <span>SUN</span><span>MON</span><span>TUE</span><span>WED</span><span>THU</span><span>FRI</span><span>SAT</span>
          </div>

          {/* Calendar Days Matrix Preview */}
          <div className="grid grid-cols-7 gap-1 text-center text-xs">
            {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
              const isToday = currentDate ? day === currentDate.getDate() : false;
              return (
                <div 
                  key={day} 
                  className={`p-2.5 rounded-lg flex flex-col items-center justify-center transition ${
                    isToday ? 'bg-[#0A2647] text-white font-bold shadow' : 'hover:bg-gray-50 text-[#0A2647]'
                  }`}
                >
                  <span>{day}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Daily Schedule & Events List */}
        <div className="space-y-4 pt-4">
          <div className="flex items-center justify-between border-b pb-3">
            <h3 className="font-serif font-bold text-base text-[#0A2647]">Scheduled Firm Events</h3>
            <span className="text-xs text-[#738290] font-semibold">{events.length} events</span>
          </div>

          {loading ? (
            <p className="text-xs text-[#738290] py-6">Loading schedule...</p>
          ) : events.length === 0 ? (
            <p className="text-xs text-[#738290] py-6">No scheduled events found.</p>
          ) : (
            <div className="space-y-3">
              {events.map((ev) => (
                <div key={ev.id} className="p-4 bg-gray-50 rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-l-4 border-[#0A2647]">
                  <div>
                    <span className="text-[10px] text-[#C49A6C] font-bold block uppercase tracking-wider">{ev.timeString} · {ev.category}</span>
                    <strong className="text-[#0A2647] text-sm block mt-0.5">{ev.title}</strong>
                    <p className="text-xs text-[#738290]">{ev.location || 'Main Office'}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs bg-white border border-gray-200 text-[#0A2647] px-3 py-1 rounded-lg font-semibold shadow-xs">
                      {ev.category}
                    </span>
                    <button 
                      onClick={() => handleDeleteEvent(ev.id)}
                      className="px-2.5 py-1 text-[11px] font-semibold text-red-600 bg-red-50 hover:bg-red-100 rounded transition"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-4 pt-4">
          <div className="flex items-center justify-between border-b pb-3">
            <div>
              <h3 className="font-serif font-bold text-base text-[#0A2647]">Client Appointment Bookings</h3>
              <p className="text-xs text-[#738290]">Meetings requested through the client portal.</p>
            </div>
            <span className="text-xs text-[#738290] font-semibold">{clientAppointments.length} appointments</span>
          </div>

          {loading ? (
            <p className="text-xs text-[#738290] py-6">Loading client appointments...</p>
          ) : clientAppointments.length === 0 ? (
            <p className="text-xs text-[#738290] py-6">No client appointments have been booked.</p>
          ) : (
            <div className="space-y-3">
              {clientAppointments.map((appointment) => (
                <div key={appointment.id} className="p-4 bg-gray-50 rounded-xl border-l-4 border-[#C49A6C]">
                  <strong className="text-[#0A2647] text-sm block">{appointment.title}</strong>
                  <p className="text-xs text-[#738290]">
                    {appointment.user?.fullName || 'Client'}
                    {appointment.user?.email ? ` · ${appointment.user.email}` : ''}
                  </p>
                  <p className="text-xs text-[#738290]">
                    {new Date(appointment.dateTime).toLocaleString()} · {appointment.location}
                  </p>
                  {appointment.matter && (
                    <p className="text-xs text-[#738290]">
                      Matter: {appointment.matter.title} (#{appointment.matter.caseNumber})
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* Add Event Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between border-b pb-4">
              <h3 className="font-serif font-bold text-lg text-[#0A2647]">Schedule Calendar Event</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 font-bold text-lg">×</button>
            </div>

            <form onSubmit={handleCreateEvent} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-[#0A2647] mb-1">Event Title / Description</label>
                <input 
                  type="text" 
                  placeholder="e.g. Deposition Preparation" 
                  value={eventTitle}
                  onChange={(e) => setEventTitle(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-[#C49A6C]"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-[#0A2647] mb-1">Date</label>
                <input 
                  type="date" 
                  value={eventDate}
                  onChange={(e) => setEventDate(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-[#C49A6C]"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-[#0A2647] mb-1">Time</label>
                <input 
                  type="text" 
                  placeholder="e.g. 1:00 PM" 
                  value={eventTime}
                  onChange={(e) => setEventTime(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-[#C49A6C]"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-[#0A2647] mb-1">Location / Room</label>
                <input 
                  type="text" 
                  placeholder="e.g. Courtroom 3A or Video conference" 
                  value={eventLocation}
                  onChange={(e) => setEventLocation(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-[#C49A6C]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#0A2647] mb-1">Event Category</label>
                <select 
                  value={eventType}
                  onChange={(e) => setEventType(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-[#C49A6C]"
                >
                  <option value="COURT">Court Appearance</option>
                  <option value="MEETING">Client Meeting</option>
                  <option value="VIDEO">Video Conference</option>
                  <option value="DEADLINE">Filing Deadline</option>
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
                  {submitting ? 'Scheduling...' : 'Save Event'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}