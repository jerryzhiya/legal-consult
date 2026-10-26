'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export function Footer() {
  const router = useRouter();
  const [currentYear, setCurrentYear] = useState<number | null>(null);

  useEffect(() => {
    setCurrentYear(new Date().getFullYear());
  }, []);

  return (
    <footer id="contact" className="bg-gray-900 text-gray-400 py-16 px-6 lg:px-12 border-t border-gray-800 font-sans">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
        
        {/* Brand Column */}
        <div className="space-y-4 md:col-span-2">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[#C49A6C] text-[#0A2647] flex items-center justify-center font-serif font-bold rounded">
              M
            </div>
            <span className="font-serif font-bold text-white text-lg tracking-wider">
              MCALI LEGAL CONSULT
            </span>
          </div>
          <p className="text-sm text-gray-400 max-w-sm leading-relaxed">
            Strategic legal counsel for individuals, families, and businesses worldwide. Built on preparation and defined by perspective.
          </p>
        </div>

        {/* Contact Column */}
        <div className="space-y-3">
          <h4 className="text-xs uppercase tracking-wider text-white font-semibold">Contact</h4>
          <p className="text-sm text-gray-300">mcalilegal@gmail.com</p>
          <p className="text-sm text-gray-300">+234 703 094 5674</p>
          <p className="text-sm text-gray-300 whitespace-pre-line">
            {`MCAli Legal Consult,\nPlot 150, Deborah S. Aber close,\nDurumi, Abuja.`}
          </p>
        </div>

        {/* Quick Portal Links Column */}
        <div className="space-y-3">
          <h4 className="text-xs uppercase tracking-wider text-white font-semibold">Client Portal</h4>
          <button 
            onClick={() => router.push('/login')} 
            className="text-sm text-[#C49A6C] hover:underline block text-left cursor-pointer"
          >
            Secure Firm Login →
          </button>
          <button 
            onClick={() => router.push('/register')} 
            className="text-sm text-gray-400 hover:text-white block text-left transition cursor-pointer"
          >
            Create Account
          </button>
        </div>

      </div>

      {/* Bottom Legal & Copyright Bar */}
      <div className="max-w-7xl mx-auto mt-12 pt-6 border-t border-gray-800 text-xs text-gray-500 flex flex-col sm:flex-row justify-between items-center gap-4 text-center sm:text-left">
        <span>© {currentYear || '2026'} MCALI Legal Consult. All rights reserved.</span>
        <span>Attorney advertising · Privacy Policy · Terms of Service</span>
      </div>
    </footer>
  );
}