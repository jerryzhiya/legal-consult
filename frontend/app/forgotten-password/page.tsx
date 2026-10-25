'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api, getApiErrorMessage } from '@/app/lib/axios';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [devLink, setDevLink] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');
    setDevLink('');

    try {
      const res = await api.post('/auth/forgot-password', { email });
      setMessage(res.data.message || 'Check your email for password reset instructions.');
      if (res.data.devResetUrl) {
        setDevLink(res.data.devResetUrl);
      }
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, 'Failed to process password reset request.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A2647] flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-md w-full p-8 space-y-6 shadow-2xl text-[#0A2647]">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-[#C49A6C] text-white flex items-center justify-center font-serif font-bold rounded mx-auto text-xl">
            M
          </div>
          <h1 className="font-serif font-bold text-2xl">Reset Password</h1>
          <p className="text-xs text-[#738290]">Enter your account email to receive reset instructions.</p>
        </div>

        {message && (
          <div className="p-3 bg-green-50 border border-green-200 text-green-700 text-xs rounded">
            {message}
          </div>
        )}

        {devLink && (
          <div className="p-3 bg-amber-50 border border-amber-200 text-amber-900 text-xs rounded break-all">
            <strong className="block mb-1 font-bold text-amber-800">Development Mode Link:</strong>
            <a href={devLink} className="underline text-blue-600">{devLink}</a>
          </div>
        )}

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold mb-1">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-[#C49A6C]"
              placeholder="client@legalconsult.com"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-[#C49A6C] hover:bg-[#b58b5e] text-white font-semibold uppercase tracking-wider rounded-lg transition"
          >
            {loading ? 'Sending...' : 'Send Reset Link'}
          </button>
        </form>

        <div className="text-center text-xs pt-4 border-t">
          <button onClick={() => router.push('/login')} className="text-[#C49A6C] font-semibold hover:underline">
            ← Back to Sign In
          </button>
        </div>
      </div>
    </div>
  );
}