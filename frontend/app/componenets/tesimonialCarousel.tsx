'use client';

import React, { useState, useEffect } from 'react';

interface Testimonial {
  quote: string;
  author: string;
  role: string;
  location: string;
}

const testimonials: Testimonial[] = [
  {
    quote: "MCALI brought calm, clarity, and real strategic thinking to a difficult moment. We never felt like just another file.",
    author: "Sarah Jenkins",
    role: "Corporate client",
    location: "Abuja, Nigeria",
  },
  {
    quote: "Their guidance through our commercial acquisition was faultless. They protect your interests with incredible precision.",
    author: "Marcus Vance",
    role: "Managing Director, Vance Holdings",
    location: "Lagos, Nigeria",
  },
  {
    quote: "The estate planning process was handled with profound care and discretion. It gave our entire family immense peace of mind.",
    author: "Elena Rostova",
    role: "Private Client",
    location: "Abuja, Nigeria",
  },
];

export default function TestimonialCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Automatically cycle through testimonials every 6 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % testimonials.length);
    }, 6000);

    return () => clearInterval(timer);
  }, []);

  const current = testimonials[currentIndex];

  return (
    <section className="py-24 px-6 lg:px-12 max-w-4xl mx-auto">
      {/* Section Header Tag */}
      <div className="text-center mb-10">
        <span className="text-xs uppercase tracking-widest text-[#738290] font-semibold">Client Perspective</span>
      </div>

      {/* Beautiful Card Container */}
      <div className="relative bg-white rounded-2xl shadow-xl border border-gray-100 p-8 sm:p-12 overflow-hidden transition-all duration-500">
        
        {/* Decorative background quotation mark watermark */}
        <div className="absolute top-4 left-6 text-[#C49A6C]/10 font-serif text-8xl select-none pointer-events-none">
          &ldquo;
        </div>

        <div className="relative z-10 flex flex-col items-center text-center space-y-6">
          
          {/* Testimonial Quote */}
          <div className="min-h-[120px] sm:min-h-[100px] flex flex-col justify-center transition-opacity duration-500 ease-in-out">
            <blockquote className="font-serif text-xl sm:text-2xl font-medium text-[#0A2647] leading-relaxed">
              &ldquo;{current.quote}&rdquo;
            </blockquote>
          </div>

          {/* Author Details */}
          <div className="space-y-1 pt-2 border-t border-gray-100 w-24"></div>
          <div>
            <span className="font-bold text-sm sm:text-base text-[#0A2647] tracking-wide block">{current.author}</span>
            <span className="text-xs text-[#738290] font-medium">{current.role} &middot; <span className="text-[#C49A6C]">{current.location}</span></span>
          </div>

          {/* Navigation Dots */}
          <div className="flex justify-center items-center gap-2 pt-2">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                aria-label={`Go to testimonial ${index + 1}`}
                className={`h-2 rounded-full transition-all duration-300 ${
                  currentIndex === index ? 'w-8 bg-[#C49A6C]' : 'w-2 bg-gray-200 hover:bg-gray-300'
                }`}
              />
            ))}
          </div>

        </div>
      </div>
    </section>
  );
}