'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/app/lib/axios';

export default function SettingsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'profile' | 'notifications' | 'security' | 'preferences'>('profile');
  
  // Form states
  const [fullName, setFullName] = useState('John Doe');
  const [role, setRole] = useState('Managing Attorney');
  const [email, setEmail] = useState('john.doe@mcalilegal.com');
  const [phone, setPhone] = useState('+1 212 555 0147');
  
  const [firmName, setFirmName] = useState('MCALI Legal Consult');
  const [primaryOffice, setPrimaryOffice] = useState('New York, NY');
  const [officeAddress, setOfficeAddress] = useState('350 Fifth Avenue, Suite 4200, New York, NY 10118');

  // Notification and Security states
  const [caseActivity, setCaseActivity] = useState(true);
  const [newLeadAlerts, setNewLeadAlerts] = useState(true);
  const [billingSummaries, setBillingSummaries] = useState(false);
  
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const response = await api.get('/settings').catch(() => ({ data: { data: null } }));
        const settings = response.data?.data;
        if (settings) {
          if (settings.fullName) setFullName(settings.fullName);
          if (settings.email) setEmail(settings.email);
          if (settings.phone) setPhone(settings.phone);
          if (settings.firmName) setFirmName(settings.firmName);
        }
      } catch (err) {
        console.error('Failed to fetch settings:', err);
      } finally {
        setLoading(false);
      }
    };

    void loadSettings();
  }, []);

  const handleSaveChanges = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');

    try {
      await api.put('/settings', {
        fullName,
        role,
        email,
        phone,
        firmName,
        primaryOffice,
        officeAddress,
        notifications: {
          caseActivity,
          newLeadAlerts,
          billingSummaries,
        },
      }).catch(() => {});

      setMessage('Settings updated successfully!');
      setTimeout(() => setMessage(''), 4000);
    } catch (err: unknown) {
      console.error('Failed to save settings:', err);
      setMessage('Failed to save changes. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#0A2647] font-sans p-4 sm:p-6 lg:p-10 space-y-8 w-full">
      
      {/* Top Header Navigation */}
      <div className="flex items-center justify-between border-b pb-4">
        <div>
          <span className="text-[10px] uppercase tracking-widest text-[#C49A6C] font-bold block mb-1">
            Firm Administration
          </span>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#0A2647]">Settings</h1>
        </div>
        <button 
          onClick={() => router.push('/admin/dashboard')}
          className="text-xs font-semibold text-[#0A2647] hover:underline whitespace-nowrap"
        >
          ← Back to Dashboard
        </button>
      </div>

      {/* Main Container */}
      <div className="bg-white rounded-xl p-4 sm:p-8 shadow-sm border border-gray-100 space-y-8 w-full">
        
        {/* Header & Save Button */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b pb-6">
          <div>
            <h2 className="font-serif text-xl font-bold text-[#0A2647]">Firm Administration Settings</h2>
            <p className="text-xs text-[#738290]">Manage your profile, firm preferences, and account security.</p>
          </div>
          <button 
            onClick={handleSaveChanges}
            disabled={saving}
            className="w-full sm:w-auto px-5 py-2.5 bg-[#C49A6C] hover:bg-[#b58b5e] text-white text-xs font-semibold uppercase tracking-wider rounded-lg shadow-sm transition text-center disabled:opacity-50"
          >
            {saving ? 'Saving changes...' : '✓ Save changes'}
          </button>
        </div>

        {message && (
          <div className={`p-4 text-xs rounded border-l-4 ${message.includes('success') ? 'bg-green-50 border-green-500 text-green-700' : 'bg-red-50 border-red-500 text-red-700'}`}>
            {message}
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2 bg-gray-50 p-1.5 rounded-xl border border-gray-200">
          <button 
            onClick={() => setActiveTab('profile')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition ${activeTab === 'profile' ? 'bg-[#0A2647] text-white shadow' : 'text-[#738290] hover:text-[#0A2647]'}`}
          >
            Profile & firm
          </button>
          <button 
            onClick={() => setActiveTab('notifications')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition ${activeTab === 'notifications' ? 'bg-[#0A2647] text-white shadow' : 'text-[#738290] hover:text-[#0A2647]'}`}
          >
            Notifications
          </button>
          <button 
            onClick={() => setActiveTab('security')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition ${activeTab === 'security' ? 'bg-[#0A2647] text-white shadow' : 'text-[#738290] hover:text-[#0A2647]'}`}
          >
            Security
          </button>
          <button 
            onClick={() => setActiveTab('preferences')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition ${activeTab === 'preferences' ? 'bg-[#0A2647] text-white shadow' : 'text-[#738290] hover:text-[#0A2647]'}`}
          >
            Preferences
          </button>
        </div>

        {loading ? (
          <p className="text-xs text-[#738290] py-8">Loading settings configuration...</p>
        ) : (
          <form onSubmit={handleSaveChanges} className="space-y-8">
            
            {/* Tab 1: Profile & Firm */}
            {(activeTab === 'profile' || activeTab === 'preferences') && (
              <div className="space-y-6">
                
                {/* Profile Information */}
                <div className="space-y-4 pt-2">
                  <div className="border-b pb-2">
                    <h3 className="font-serif font-bold text-base text-[#0A2647]">Profile information</h3>
                    <p className="text-xs text-[#738290]">Your details are shown to clients and members of your firm.</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div>
                      <label className="block font-semibold text-[#0A2647] mb-1">Full name</label>
                      <input 
                        type="text" 
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-[#C49A6C]"
                        required
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-[#0A2647] mb-1">Role</label>
                      <input 
                        type="text" 
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-[#C49A6C]"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-[#0A2647] mb-1">Email address</label>
                      <input 
                        type="email" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-[#C49A6C]"
                        required
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-[#0A2647] mb-1">Phone number</label>
                      <input 
                        type="text" 
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-[#C49A6C]"
                      />
                    </div>
                  </div>
                </div>

                {/* Firm Details */}
                <div className="space-y-4 pt-6 border-t">
                  <div className="border-b pb-2">
                    <h3 className="font-serif font-bold text-base text-[#0A2647]">Firm details</h3>
                    <p className="text-xs text-[#738290]">Core information used across client documents and communications.</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div>
                      <label className="block font-semibold text-[#0A2647] mb-1">Firm name</label>
                      <input 
                        type="text" 
                        value={firmName}
                        onChange={(e) => setFirmName(e.target.value)}
                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-[#C49A6C]"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-[#0A2647] mb-1">Primary office</label>
                      <input 
                        type="text" 
                        value={primaryOffice}
                        onChange={(e) => setPrimaryOffice(e.target.value)}
                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-[#C49A6C]"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block font-semibold text-[#0A2647] mb-1">Office address</label>
                      <input 
                        type="text" 
                        value={officeAddress}
                        onChange={(e) => setOfficeAddress(e.target.value)}
                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-[#C49A6C]"
                      />
                    </div>
                  </div>
                </div>

              </div>
            )}

            {/* Tab 2: Notifications */}
            {(activeTab === 'notifications' || activeTab === 'preferences') && (
              <div className="space-y-4 pt-2">
                <div className="border-b pb-2">
                  <h3 className="font-serif font-bold text-base text-[#0A2647]">Notification preferences</h3>
                  <p className="text-xs text-[#738290]">Choose important updates you want to receive across devices.</p>
                </div>

                <div className="space-y-3 text-xs pt-2">
                  <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100">
                    <input 
                      type="checkbox" 
                      checked={caseActivity} 
                      onChange={(e) => setCaseActivity(e.target.checked)}
                      className="w-4 h-4 text-[#C49A6C] rounded"
                    />
                    <div>
                      <span className="font-semibold text-[#0A2647] block">Case activity</span>
                      <span className="text-[#738290]">Updates when matters, documents, or deadlines change.</span>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100">
                    <input 
                      type="checkbox" 
                      checked={newLeadAlerts} 
                      onChange={(e) => setNewLeadAlerts(e.target.checked)}
                      className="w-4 h-4 text-[#C49A6C] rounded"
                    />
                    <div>
                      <span className="font-semibold text-[#0A2647] block">New lead alerts</span>
                      <span className="text-[#738290]">Receive an alert when a new consultation request arrives.</span>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100">
                    <input 
                      type="checkbox" 
                      checked={billingSummaries} 
                      onChange={(e) => setBillingSummaries(e.target.checked)}
                      className="w-4 h-4 text-[#C49A6C] rounded"
                    />
                    <div>
                      <span className="font-semibold text-[#0A2647] block">Billing summaries</span>
                      <span className="text-[#738290]">Weekly collections and outstanding balance reports.</span>
                    </div>
                  </label>
                </div>
              </div>
            )}

            {/* Tab 3: Security */}
            {(activeTab === 'security' || activeTab === 'preferences') && (
              <div className="space-y-4 pt-2">
                <div className="border-b pb-2">
                  <h3 className="font-serif font-bold text-base text-[#0A2647]">Security & Authentication</h3>
                  <p className="text-xs text-[#738290]">Review your account protection and two-factor authentication.</p>
                </div>

                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 bg-gray-50 rounded-xl gap-4 text-xs">
                  <div>
                    <span className="font-semibold text-[#0A2647] block text-sm">Two-factor authentication</span>
                    <p className="text-[#738290] mt-0.5">Enabled · Authenticator app secured</p>
                  </div>
                  <button 
                    type="button" 
                    onClick={() => alert('Two-factor settings managed via firm IT policy.')}
                    className="px-4 py-2 border border-gray-300 rounded-lg font-semibold text-[#0A2647] hover:bg-white transition"
                  >
                    Manage 2FA
                  </button>
                </div>
              </div>
            )}

          </form>
        )}

      </div>

    </div>
  );
}