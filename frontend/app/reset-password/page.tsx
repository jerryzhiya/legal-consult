'use client';

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { api, getApiErrorMessage } from '@/app/lib/axios';

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const email = searchParams.get('email');

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await api.post('/auth/reset-password', { email, token, newPassword });
      setMessage(res.data.message || 'Password successfully updated!');
      setTimeout(() => router.push('/login'), 3000);
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, 'Failed to reset password.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl max-w-md w-full p-8 space-y-6 shadow-2xl text-[#0A2647]">
      <div className="text-center space-y-2">
        <div className="w-12 h-12 bg-[#C49A6C] text-white flex items-center justify-center font-serif font-bold rounded mx-auto text-xl">
          M
        </div>
        <h1 className="font-serif font-bold text-2xl">Create New Password</h1>
        <p className="text-xs text-[#738290]">Please enter your new secure password below.</p>
      </div>

      {message && (
        <div className="p-3 bg-green-50 border border-green-200 text-green-700 text-xs rounded">
          {message} Redirecting to login...
        </div>
      )}

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        <div>
          <label className="block font-semibold mb-1">New Password</label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-[#C49A6C]"
            placeholder="••••••••"
            required
          />
        </div>

        <div>
          <label className="block font-semibold mb-1">Confirm New Password</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-[#C49A6C]"
            placeholder="••••••••"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading || !!message}
          className="w-full py-3 bg-[#C49A6C] hover:bg-[#b58b5e] text-white font-semibold uppercase tracking-wider rounded-lg transition"
        >
          {loading ? 'Updating...' : 'Update Password'}
        </button>
      </form>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-[#0A2647] flex items-center justify-center p-4">
      <Suspense fallback={<div className="text-white text-sm">Loading...</div>}>
        <ResetPasswordForm />
      </Suspense>
    </div>
  );
}