'use client';

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { api } from '@/app/lib/axios';

interface Contact {
  id: string;
  fullName: string;
  email: string;
  role: string;
}

interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  createdAt: string;
}

export default function MessagesSection() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [selectedContactId, setSelectedContactId] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    const loadMessages = async () => {
      try {
        setError('');
        if (!localStorage.getItem('token')) {
          setError('Authorization token missing. Please log in again.');
          return;
        }

        const [messagesResponse, contactsResponse] = await Promise.all([
          api.get('/messages'),
          api.get('/messages/contacts'),
        ]);
        let userId: string | null = null;
        try {
          userId = JSON.parse(localStorage.getItem('user') || '{}').id || null;
        } catch (parseError) {
          console.error('Failed to parse user from localStorage', parseError);
        }
        setCurrentUserId(userId);

        const nextMessages: Message[] = messagesResponse.data.data || [];
        const nextContacts: Contact[] = contactsResponse.data.data || [];
        setMessages(nextMessages);
        setContacts(nextContacts);

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
        const message = axios.isAxiosError<{ error?: string }>(err)
          ? err.response?.data?.error
          : undefined;
        setError(message || 'Unable to load messages from server.');
      } finally {
        setLoading(false);
      }
    };

    void loadMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      const response = await api.get('/messages');
      setMessages(response.data.data || []);
    } catch (err: unknown) {
      console.error('Failed to refresh messages:', err);
      const message = axios.isAxiosError<{ error?: string }>(err)
        ? err.response?.data?.error
        : undefined;
      setError(message || 'Unable to refresh messages.');
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedContactId) return;

    try {
      await api.post('/messages', {
        receiverId: selectedContactId,
        content: newMessage,
      });

      setNewMessage('');
      await fetchMessages();
    } catch (err: unknown) {
      console.error('Failed to send message:', err);
      const message = axios.isAxiosError<{ error?: string }>(err)
        ? err.response?.data?.error
        : undefined;
      setError(message || 'Failed to send message.');
    }
  };

  const selectedContact = contacts.find((contact) => contact.id === selectedContactId);
  const conversation = messages.filter(
    (message) =>
      message.senderId === selectedContactId ||
      message.receiverId === selectedContactId,
  );
  const roleLabel = selectedContact?.role === 'ATTORNEY' ? 'Attorney' : 'Administrator';

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden grid grid-cols-1 md:grid-cols-3 min-h-[500px]">
      <div className="border-r border-gray-200 bg-gray-50/50 p-4 space-y-3">
        <div className="flex justify-between items-center mb-2">
          <h3 className="font-serif font-bold text-sm text-[#0A2647]">Secure Messages</h3>
          <span className="text-[10px] bg-green-50 text-green-700 font-semibold px-2 py-0.5 rounded">Live API</span>
        </div>

        <div className="space-y-2">
          {contacts.map((contact) => (
            <button
              key={contact.id}
              type="button"
              onClick={() => setSelectedContactId(contact.id)}
              className={`w-full text-left p-3 rounded-lg border ${
                selectedContactId === contact.id
                  ? 'bg-white border-[#C49A6C]/40 shadow-xs'
                  : 'bg-transparent border-transparent hover:bg-white'
              }`}
            >
              <strong className="text-xs text-[#0A2647] block">{contact.fullName}</strong>
              <span className="text-[10px] text-[#738290]">
                {contact.role === 'ATTORNEY' ? 'Attorney' : 'Administrator'}
              </span>
            </button>
          ))}
          {!loading && contacts.length === 0 && (
            <p className="text-xs text-gray-500">No administrators or attorneys are available.</p>
          )}
        </div>
      </div>

      <div className="md:col-span-2 flex flex-col justify-between p-6 bg-white">
        <div>
          <div className="border-b pb-3 mb-4 flex items-center justify-between">
            <div>
              <strong className="text-sm text-[#0A2647] block">
                {selectedContact?.fullName || 'Select a legal contact'}
              </strong>
              {selectedContact && (
                <span className="text-[10px] text-green-600 font-semibold">{roleLabel}</span>
              )}
            </div>
            <span className="text-[10px] bg-gray-100 px-2.5 py-1 rounded text-[#738290]">Secure messages</span>
          </div>

          {error && (
            <div className="mb-3 p-2 bg-red-50 border border-red-200 text-xs text-red-600 rounded">
              {error}
            </div>
          )}

          <div className="space-y-4 py-4 text-xs overflow-y-auto max-h-[350px]">
            {loading ? (
              <p className="text-gray-400 text-center py-6">Loading secure messages...</p>
            ) : !selectedContact ? (
              <p className="text-gray-400 text-center py-6">No legal contacts are available.</p>
            ) : conversation.length === 0 ? (
              <p className="text-gray-400 text-center py-6">No messages yet. Start the conversation below.</p>
            ) : (
              conversation.map((message) => {
                const isMyMessage = currentUserId === message.senderId;
                return (
                  <div key={message.id} className={`flex gap-3 ${isMyMessage ? 'justify-end' : ''}`}>
                    <div className={`p-3 rounded-xl max-w-md leading-relaxed text-xs ${isMyMessage ? 'bg-[#0A2647] text-white rounded-tr-none' : 'bg-gray-100 text-[#0A2647] rounded-tl-none'}`}>
                      {message.content}
                      <span className={`block text-[9px] mt-1 text-right ${isMyMessage ? 'text-gray-300' : 'text-[#738290]'}`}>
                        {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        <form onSubmit={handleSendMessage} className="pt-4 border-t border-gray-200 flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder={selectedContact ? `Message ${selectedContact.fullName}...` : 'Select a legal contact to message'}
            className="flex-1 px-4 py-2.5 border rounded-lg text-xs focus:outline-none focus:border-[#C49A6C]"
            disabled={!selectedContact}
            required
          />
          <button
            type="submit"
            disabled={!selectedContact}
            className="px-5 py-2.5 bg-[#0A2647] hover:bg-[#071d37] disabled:opacity-50 text-white text-xs font-semibold rounded-lg shadow transition"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
}
