'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export function Navbar() {
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100 px-6 lg:px-12 py-4 shadow-sm">
      <div className="max-w-7xl mx-auto flex items-center justify-between">

        {/* Brand Logo - Returns to home */}
        <div
          className="flex items-center gap-3 cursor-pointer group"
          onClick={() => router.push('/')}
        >
          <div className="relative w-10 h-10 flex items-center justify-center rounded overflow-hidden shadow-sm transition">
            <Image
              src="/mcali.jpeg"
              alt="MCALI Legal Consult Logo"
              width={50}
              height={50}
              className="object-contain"
            />
          </div>
          <div>
            <span className="font-serif font-bold tracking-wider text-[#0A2647] block text-sm sm:text-base">
              MCALI LEGAL CONSULT
            </span>
            <span className="text-[10px] uppercase tracking-widest text-[#738290] block">
              Strategic Counsel
            </span>
          </div>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center space-x-8 text-sm font-medium text-[#738290]">
          <Link href="/#expertise" className="hover:text-[#0A2647] transition">Expertise</Link>
          <Link href="/#approach" className="hover:text-[#0A2647] transition">Approach</Link>
          <Link href="/#contact" className="hover:text-[#0A2647] transition">Contact</Link>
        </nav>

        {/* Desktop Right Action: Login Button */}
        <div className="hidden md:flex items-center gap-4">
          <button
            onClick={() => router.push('/login')}
            className="flex items-center gap-2 px-5 py-2.5 border border-[#0A2647] text-[#0A2647] hover:bg-[#0A2647] hover:text-white text-xs font-semibold uppercase tracking-wider rounded transition duration-200 shadow-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
            </svg>
            Login
          </button>
        </div>

        {/* Mobile Hamburger Button Only (Login is moved inside the dropdown drawer) */}
        <div className="flex md:hidden items-center">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-[#0A2647] focus:outline-none"
            aria-label="Toggle menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-white border-b border-gray-200 shadow-lg px-6 py-5 space-y-4 animate-fadeIn">
          <Link
            href="/#expertise"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-sm font-medium text-[#0A2647] hover:text-[#C49A6C]"
          >
            Expertise
          </Link>
          <Link
            href="/#approach"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-sm font-medium text-[#0A2647] hover:text-[#C49A6C]"
          >
            Approach
          </Link>
          <Link
            href="/#contact"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-sm font-medium text-[#0A2647] hover:text-[#C49A6C]"
          >
            Contact
          </Link>
          <div className="pt-2 border-t border-gray-100 flex flex-col gap-2">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                router.push('/login');
              }}
              className="w-full py-2.5 bg-[#0A2647] text-white text-xs font-semibold uppercase tracking-wider rounded text-center shadow-sm"
            >
              Sign In to Portal
            </button>
          </div>
        </div>
      )}
    </header>
  );
}