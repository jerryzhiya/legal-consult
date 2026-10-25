'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Navbar } from './componenets/Navbar';
import TestimonialCarousel  from './componenets/tesimonialCarousel';

export default function LandingPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans selection:bg-[#C49A6C] selection:text-white">
      {/* NAVBAR SECTION */}
      <section>
        <Navbar />
      </section>

      {/* HERO SECTION */}
      <section className="bg-[#0A2647] text-white py-20 lg:py-28 px-6 lg:px-12 relative overflow-hidden">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 space-y-6">
            <span className="text-xs uppercase tracking-widest text-[#C49A6C] font-semibold block">
              Strategic Counsel · Enduring Partnerships
            </span>
            <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight tracking-tight">
              Legal clarity for the moments that shape your future.
            </h1>
            <p className="text-gray-300 text-base sm:text-lg leading-relaxed max-w-xl">
              MCALI pairs rigorous legal thinking with a distinctly human approach helping individuals, families, and ambitious businesses move forward with confidence.
            </p>
            <div className="pt-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
              <button
                onClick={() => router.push('/login')}
                className="px-8 py-4 bg-[#C49A6C] hover:bg-[#b58b5e] text-white font-medium rounded shadow-lg transition duration-200 text-center"
              >
                Discuss your matter →
              </button>
              <a
                href="#expertise"
                className="px-8 py-4 border border-white/20 hover:border-white text-white font-medium rounded transition duration-200 text-center"
              >
                Explore our expertise
              </a>
            </div>
          </div>
          
          {/* COURT IMAGE CARD */}
          <div className="lg:col-span-5 relative h-[360px] sm:h-[400px] rounded-2xl overflow-hidden border border-white/20 shadow-2xl group">
            <Image 
              src="/the-law.jpg" 
              alt="Courtroom Interior"
              fill
              className="object-cover group-hover:scale-105 transition duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0A2647]/70 via-transparent to-transparent flex items-end p-6">
              <span className="text-xs tracking-widest uppercase text-[#C49A6C] font-semibold">
                Excellence in Advocacy & Counsel
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* CORE PHILOSOPHY -> ADDED id="approach" HERE */}
      <section id="approach" className="py-24 px-6 lg:px-12 bg-gray-50 border-b border-gray-200">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <span className="text-xs uppercase tracking-widest text-[#C49A6C] font-semibold">
            Built on preparation · Defined by perspective
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#0A2647]">
            We make complex legal decisions feel clear.
          </h2>
          <p className="text-[#738290] text-lg leading-relaxed">
            Whether you are protecting what you have built, navigating change, or pursuing a new opportunity, our team brings the judgment and focus to help you act decisively.
          </p>
          <div className="pt-6">
            <blockquote className="font-serif italic text-xl text-[#0A2647] border-l-4 border-[#C49A6C] pl-6 py-2 mx-auto max-w-2xl text-left">
              “Not just legal answers a clear path forward.”
            </blockquote>
          </div>
        </div>
      </section>

      {/* PRACTICE AREAS */}
      <section id="expertise" className="py-24 px-6 lg:px-12 max-w-7xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <span className="text-xs uppercase tracking-widest text-[#C49A6C] font-semibold">Our Expertise</span>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#0A2647]">Focused counsel. Meaningful outcomes.</h2>
          <p className="text-[#738290]">Deep experience across the legal needs that matter most to our clients, delivered with care, precision, and commercial awareness.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {[
            {
              title: "Corporate & Commercial",
              desc: "Strategic guidance from formation and financing through contracts, growth, and complex transactions.",
            },
            {
              title: "Dispute Resolution",
              desc: "Clear-eyed advocacy and practical strategies designed to protect your position and preserve value.",
            },
            {
              title: "Estate Planning",
              desc: "Thoughtful structures that protect your legacy and give your family lasting confidence.",
            },
            {
              title: "Real Estate",
              desc: "End-to-end counsel for acquisitions, development, leasing, and property investment.",
            },
          ].map((area, idx) => (
            <div key={idx} className="p-8 rounded-xl border border-gray-200 hover:border-[#C49A6C] transition bg-white shadow-sm hover:shadow-md space-y-4">
              <span className="text-xs font-bold text-[#C49A6C]">0{idx + 1}</span>
              <h3 className="font-serif text-2xl font-bold text-[#0A2647]">{area.title}</h3>
              <p className="text-[#738290] leading-relaxed">{area.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CLIENT EXPERIENCE & WORKFLOW */}
      <section className="py-24 px-6 lg:px-12 bg-[#0A2647] text-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <span className="text-xs uppercase tracking-widest text-[#C49A6C] font-semibold">A Better Client Experience</span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-white">Legal service that keeps you in control.</h2>
            <p className="text-gray-300">We combine experienced counsel with secure, intuitive technology—so you always know where your matter stands and what comes next.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white/5 border border-white/10 p-8 rounded-xl space-y-4">
              <span className="text-xs text-[#C49A6C] font-mono font-bold">01</span>
              <h3 className="font-serif text-xl font-bold text-white">Listen first</h3>
              <p className="text-gray-300 text-sm leading-relaxed">We take the time to understand your priorities, context, and definition of success.</p>
            </div>
            <div className="bg-white/5 border border-white/10 p-8 rounded-xl space-y-4">
              <span className="text-xs text-[#C49A6C] font-mono font-bold">02</span>
              <h3 className="font-serif text-xl font-bold text-white">Build the strategy</h3>
              <p className="text-gray-300 text-sm leading-relaxed">You receive practical options, honest guidance, and a plan designed around your goals.</p>
            </div>
            <div className="bg-white/5 border border-white/10 p-8 rounded-xl space-y-4">
              <span className="text-xs text-[#C49A6C] font-mono font-bold">03</span>
              <h3 className="font-serif text-xl font-bold text-white">Move with clarity</h3>
              <p className="text-gray-300 text-sm leading-relaxed">Stay informed through every milestone with direct counsel and a secure digital workspace.</p>
            </div>
          </div>
        </div>
      </section>

      {/* TESTIMONIAL CAROUSEL */}
      <section>
        <TestimonialCarousel />
      </section>
    </div>
  );
}