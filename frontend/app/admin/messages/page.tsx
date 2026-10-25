'use client';

import React, { useCallback, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { api } from '@/app/lib/axios';

interface MessageItem {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  createdAt: string;
}

interface Contact {
  id: string;
  fullName: string;
  email: string;
  role: string;
}

export default function AdminMessagesPage() {
  const router = useRouter();
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [selectedContactId, setSelectedContactId] = useState('');
  const [replyText, setReplyText] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchMessages = useCallback(async () => {
    try {
      const [messagesResponse, contactsResponse] = await Promise.all([
        api.get('/messages'),
        api.get('/messages/contacts'),
      ]);
      const nextMessages: MessageItem[] = messagesResponse.data.data || [];
      const nextContacts: Contact[] = contactsResponse.data.data || [];
      setMessages(nextMessages);
      setContacts(nextContacts);

      const userId = JSON.parse(localStorage.getItem('user') || '{}').id;
      const latestMessage = nextMessages[nextMessages.length - 1];
      const recentContactId = latestMessage
        ? latestMessage.senderId === userId
          ? latestMessage.receiverId
          : latestMessage.senderId
        : '';
      setSelectedContactId(
        nextContacts.some((contact) => contact.id === recentContactId)
          ? recentContactId
          : nextContacts[0]?.id || '',
      );
    } catch (err: unknown) {
      console.error('Failed to fetch messages:', err);
      setError('Unable to load secure messages.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void Promise.resolve().then(fetchMessages);
  }, [fetchMessages]);

  const handleAdminReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !selectedContactId) return;

    try {
      await api.post('/messages', {
        receiverId: selectedContactId,
        content: replyText,
      });
      setReplyText('');
      await fetchMessages();
    } catch (err: unknown) {
      console.error('Failed to send reply:', err);
      const message = axios.isAxiosError<{ error?: string }>(err)
        ? err.response?.data?.error
        : undefined;
      setError(message || 'Failed to send reply.');
    }
  };

  const selectedContact = contacts.find((contact) => contact.id === selectedContactId);
  const conversation = messages.filter(
    (message) =>
      message.senderId === selectedContactId ||
      message.receiverId === selectedContactId,
  );

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#0A2647] font-sans flex flex-col lg:flex-row">
      
      {/* Sidebar Navigation */}
      <aside className="w-full lg:w-64 bg-[#0A2647] text-white flex-shrink-0 p-6 flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-3 cursor-pointer mb-8" onClick={() => router.push('/admin/dashboard')}>
            <div className="w-9 h-9 bg-[#C49A6C] text-[#0A2647] flex items-center justify-center font-serif font-bold rounded">
              M
            </div>
            <div>
              <span className="font-serif font-bold text-sm tracking-wide block">MCALI LEGAL</span>
              <span className="text-[10px] uppercase tracking-widest text-[#C49A6C] block">Firm Management</span>
            </div>
          </div>

          <nav className="space-y-1">
            <button onClick={() => router.push('/admin/dashboard')} className="w-full text-left px-4 py-3 rounded-lg text-xs font-semibold text-gray-300 hover:bg-white/5">
              Dashboard
            </button>
            <button onClick={() => router.push('/admin/messages')} className="w-full text-left px-4 py-3 rounded-lg text-xs font-semibold bg-[#C49A6C] text-[#0A2647] shadow">
              Messages
            </button>
            <button onClick={() => router.push('/admin/cases')} className="w-full text-left px-4 py-3 rounded-lg text-xs font-semibold text-gray-300 hover:bg-white/5">
              Cases
            </button>
            <button onClick={() => router.push('/admin/clients')} className="w-full text-left px-4 py-3 rounded-lg text-xs font-semibold text-gray-300 hover:bg-white/5">
              Clients
            </button>
          </nav>
        </div>

        <button
          onClick={() => { localStorage.clear(); router.push('/login'); }}
          className="py-2.5 px-4 bg-red-600/20 hover:bg-red-600/30 text-red-300 text-xs font-semibold uppercase tracking-wider rounded-lg transition text-center border border-red-500/30"
        >
          Sign Out Securely
        </button>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 max-w-5xl mx-auto px-6 py-8 space-y-6 w-full">
        <div>
          <span className="text-[10px] uppercase tracking-widest text-[#C49A6C] font-bold block mb-1">
            Communication Center
          </span>
          <h1 className="text-3xl font-serif font-bold text-[#0A2647]">Client Messages Inbox</h1>
          <p className="text-sm text-[#738290] mt-1">
            Manage encrypted conversations and respond to client inquiries in real time.
          </p>
        </div>

        {error && (
          <div className="p-4 bg-red-50 text-red-700 text-xs rounded border-l-4 border-red-500">
            {error}
          </div>
        )}

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          {loading ? (
            <p className="md:col-span-3 text-sm text-[#738290] py-8 text-center">Loading messages...</p>
          ) : (
            <>
              <div className="space-y-2 border-r border-gray-100 pr-4">
                <h2 className="text-xs font-bold uppercase tracking-wide text-[#738290] mb-3">Clients</h2>
                {contacts.map((contact) => (
                  <button
                    key={contact.id}
                    type="button"
                    onClick={() => setSelectedContactId(contact.id)}
                    className={`w-full text-left p-3 rounded-lg border ${
                      selectedContactId === contact.id
                        ? 'bg-[#F8F9FA] border-[#C49A6C]/50'
                        : 'border-transparent hover:bg-gray-50'
                    }`}
                  >
                    <strong className="block text-xs text-[#0A2647]">{contact.fullName}</strong>
                    <span className="block text-[10px] text-[#738290]">{contact.email}</span>
                  </button>
                ))}
                {contacts.length === 0 && (
                  <p className="text-xs text-[#738290]">No clients are available.</p>
                )}
              </div>

              <section className="md:col-span-2 flex flex-col min-h-[360px]">
                <div className="border-b pb-3 mb-4">
                  <strong className="text-sm text-[#0A2647]">
                    {selectedContact?.fullName || 'Select a client'}
                  </strong>
                  {selectedContact && (
                    <span className="block text-[10px] text-[#738290]">{selectedContact.email}</span>
                  )}
                </div>

                <div className="space-y-4 flex-1 overflow-y-auto max-h-[420px]">
                  {!selectedContact ? (
                    <p className="text-sm text-[#738290] py-8 text-center">Select a client to view the conversation.</p>
                  ) : conversation.length === 0 ? (
                    <p className="text-sm text-[#738290] py-8 text-center">No messages with this client yet.</p>
                  ) : (
                    conversation.map((message) => {
                      const isAdminMessage = message.senderId !== selectedContact.id;
                      return (
                        <div key={message.id} className={`p-4 rounded-xl border border-gray-200 space-y-1 ${
                          isAdminMessage ? 'ml-8 bg-[#F8F9FA]' : 'mr-8 bg-white'
                        }`}>
                          <span className="text-[10px] font-semibold text-[#738290]">
                            {isAdminMessage ? 'You' : selectedContact.fullName}
                          </span>
                          <p className="text-[#0A2647] text-sm font-medium">{message.content}</p>
                          <span className="text-[10px] text-[#738290]">
                            {new Date(message.createdAt).toLocaleString()}
                          </span>
                        </div>
                      );
                    })
                  )}
                </div>

                <form onSubmit={handleAdminReply} className="flex gap-2 pt-4 mt-4 border-t border-gray-200">
                  <input
                    type="text"
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder={selectedContact ? `Reply to ${selectedContact.fullName}...` : 'Select a client to reply'}
                    className="flex-1 px-3 py-2 bg-white border rounded-lg text-xs focus:outline-none focus:border-[#C49A6C]"
                    disabled={!selectedContact}
                    required
                  />
                  <button
                    type="submit"
                    disabled={!selectedContact}
                    className="px-4 py-2 bg-[#C49A6C] hover:bg-[#b58b5e] disabled:opacity-50 text-white text-xs font-semibold rounded-lg shadow"
                  >
                    Send Reply
                  </button>
                </form>
              </section>
            </>
          )}
        </div>
      </main>
    </div>
  );
}