'use client';

import Link from 'next/link';
import { Ban, AlertTriangle, FileWarning, Skull, Flame, Ghost } from 'lucide-react';
import { useEffect, useState } from 'react';
import { getSinCardsByStatus } from '@/lib/api';

// ข้อมูลพื้นฐานสำหรับ 3 กลุ่มหลัก
const sinCardCategoriesBase = [
  {
    id: 'banned',
    title: 'Banned Cards',
    titleThai: 'บาปต้องห้าม',
    description: 'การ์ดที่ถูกห้ามใช้ในการแข่งขันอย่างสมบูรณ์',
    icon: Ban,
  },
  {
    id: 'limited',
    title: 'Limited Cards',
    titleThai: 'บาปจำกัด',
    description: 'การ์ดที่ถูกจำกัดจำนวนที่สามารถใส่ใน Deck หรือมีการเพิ่มจำนวนที่ใส่ได้',
    icon: AlertTriangle,
  },
  {
    id: 'conditional',
    title: 'Conditional Cards',
    titleThai: 'บาปมีเงื่อนไข',
    description: 'การ์ดที่มีเงื่อนไขพิเศษในการใช้งาน เช่น ห้ามใส่ซ้ำกับการ์ดบางใบ หรือต้องเลือกใบใดใบหนึ่ง',
    icon: FileWarning,
  },
];

export function SinCardsMain() {
  const [sinCardCategories, setSinCardCategories] = useState(
    sinCardCategoriesBase.map(cat => ({ ...cat, count: 0 }))
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSinCardCounts() {
      try {
        setLoading(true);
        
        // Fetch counts for each category
        const [bannedCards, limitedCards, conditionalCards] = await Promise.all([
          getSinCardsByStatus('banned'),
          getSinCardsByStatus('limited'),
          getSinCardsByStatus('conditional'),
        ]);

        // Update categories with real counts
        const updatedCategories = sinCardCategoriesBase.map(cat => {
          let count = 0;
          if (cat.id === 'banned') count = bannedCards.length;
          if (cat.id === 'limited') count = limitedCards.length;
          if (cat.id === 'conditional') count = conditionalCards.length;
          
          return { ...cat, count };
        });

        setSinCardCategories(updatedCategories);
      } catch (error) {
        console.error('Error fetching sin card counts:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchSinCardCounts();
  }, []);

  return (
    <div
      id="sin-cards-section"
      className="relative w-full overflow-hidden"
    >
      {/* Video Background - Dark Mode Only */}
      <div className="absolute inset-0 -z-10 dark:block hidden">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 h-full w-full object-cover"
        >
          <source src="/videos/fire-background.mp4" type="video/mp4" />
        </video>
        
        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-black/80" />
        
        {/* Fog/Smoke Effect */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-black/70" />
      </div>

      {/* Light Mode Background - Same as Hero Section */}
      <div className="absolute inset-0 -z-10 dark:hidden block">
        <div className="gradient-glow absolute inset-0" />
        <div className="absolute left-1/4 top-0 h-96 w-96 animate-pulse rounded-full bg-primary/20 blur-3xl" />
        <div className="absolute right-1/4 top-1/3 h-96 w-96 animate-pulse rounded-full bg-accent/20 blur-3xl animation-delay-2000" />
        <div className="absolute bottom-0 left-1/2 h-96 w-96 animate-pulse rounded-full bg-secondary/20 blur-3xl animation-delay-4000" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:40px_40px]" />
      </div>

      <div className="container mx-auto px-4 py-12 md:py-16">
        {/* Header */}
        <div className="mb-12 text-center relative">
          {/* Spooky Background Elements */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-10">
            <Skull className="h-32 w-32 md:h-40 md:w-40 text-red-600 dark:text-red-600 animate-pulse" style={{ animationDuration: '4s' }} />
          </div>
          
          {/* Main Title with Blood Drip Effect - Smaller */}
          <div className="relative inline-block mb-4">
            <h2 className="font-mn-lon text-4xl md:text-5xl lg:text-6xl font-black relative z-10 tracking-wider
                         text-gray-800 dark:text-red-400">
              การ์ดบาป
            </h2>
            
            {/* Blood Drip SVG Effect - Smaller - only visible in dark mode */}
            <svg className="absolute -bottom-4 left-0 w-full h-12 opacity-80 dark:block hidden" viewBox="0 0 400 60" preserveAspectRatio="none">
              <defs>
                <linearGradient id="bloodGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" style={{ stopColor: '#dc2626', stopOpacity: 1 }} />
                  <stop offset="100%" style={{ stopColor: '#7f1d1d', stopOpacity: 0.8 }} />
                </linearGradient>
              </defs>
              {/* Blood drips */}
              <path d="M 50 0 Q 50 15, 48 30 Q 46 45, 50 60 L 50 60 Q 54 45, 52 30 Q 50 15, 50 0 Z" fill="url(#bloodGradient)" opacity="0.9" />
              <path d="M 120 5 Q 120 18, 118 32 Q 116 46, 120 55 L 120 55 Q 124 46, 122 32 Q 120 18, 120 5 Z" fill="url(#bloodGradient)" opacity="0.7" />
              <path d="M 200 2 Q 200 20, 198 40 Q 196 55, 200 65 L 200 65 Q 204 55, 202 40 Q 200 20, 200 2 Z" fill="url(#bloodGradient)" opacity="0.85" />
              <path d="M 280 7 Q 280 22, 278 38 Q 276 50, 280 58 L 280 58 Q 284 50, 282 38 Q 280 22, 280 7 Z" fill="url(#bloodGradient)" opacity="0.75" />
              <path d="M 350 3 Q 350 17, 348 33 Q 346 47, 350 57 L 350 57 Q 354 47, 352 33 Q 350 17, 350 3 Z" fill="url(#bloodGradient)" opacity="0.8" />
            </svg>
          </div>
          
          <p className="font-mn-lon max-w-2xl mx-auto text-sm md:text-base mt-6
                      text-gray-600 dark:text-red-300/70">
            การ์ดที่ถูกจำกัดการใช้งานเพื่อสร้างความสมดุลในเกม แบ่งออกเป็น 3 ประเภทหลัก
          </p>
        </div>

        {/* Categories Grid - Wooden Board Style - Original Size */}
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3 max-w-7xl mx-auto">
          {sinCardCategories.map((category, index) => {
            const Icon = category.icon;
            return (
              <Link
                key={category.id}
                href={`/sin-cards/${category.id}`}
                className="group"
                style={{ animationDelay: `${index * 150}ms` }}
              >
                {/* Wooden Board Frame - Original Size */}
                <div className="relative overflow-visible transition-all duration-500 hover:scale-105">
                  {/* Hanging Chain Effect - Original */}
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 w-1 h-8 bg-gradient-to-b from-gray-700 via-gray-600 to-gray-500 shadow-lg" />
                  <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-gray-600 shadow-xl border border-gray-500" />
                  
                  {/* Main Wooden Board - Responsive to theme */}
                  <div 
                    className="relative overflow-hidden rounded-lg shadow-2xl transition-all duration-500 group-hover:shadow-[0_0_40px_rgba(220,38,38,0.5)] dark:group-hover:shadow-[0_0_40px_rgba(220,38,38,0.5)]"
                    style={{
                      background: `
                        linear-gradient(135deg, 
                          #3e2723 0%, 
                          #4e342e 20%, 
                          #3e2723 40%, 
                          #5d4037 60%, 
                          #4e342e 80%, 
                          #3e2723 100%
                        )
                      `,
                      border: '8px solid #2d1810',
                      boxShadow: `
                        inset 0 2px 4px rgba(0,0,0,0.6),
                        inset 0 -2px 4px rgba(255,255,255,0.1),
                        0 8px 32px rgba(0,0,0,0.8)
                      `
                    }}
                  >
                    {/* Light mode overlay - lighter wood tone */}
                    <div className="absolute inset-0 dark:hidden" 
                         style={{
                           background: `
                             linear-gradient(135deg, 
                               #8b6f47 0%, 
                               #a0826d 20%, 
                               #8b6f47 40%, 
                               #b5956f 60%, 
                               #a0826d 80%, 
                               #8b6f47 100%
                             )
                           `
                         }}
                    />
                    {/* Wood Texture Overlay */}
                    <div 
                      className="absolute inset-0 opacity-30 mix-blend-overlay"
                      style={{
                        backgroundImage: `
                          repeating-linear-gradient(
                            90deg,
                            transparent,
                            transparent 2px,
                            rgba(0,0,0,0.1) 2px,
                            rgba(0,0,0,0.1) 4px
                          )
                        `
                      }}
                    />
                    
                    {/* Blood Splatter on Hover */}
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-500"
                         style={{
                           background: `radial-gradient(circle at 30% 40%, rgba(220, 38, 38, 0.6) 0%, transparent 50%),
                                       radial-gradient(circle at 70% 60%, rgba(185, 28, 28, 0.5) 0%, transparent 40%)`
                         }}
                    />

                    {/* Nails in corners - Original */}
                    <div className="absolute top-2 left-2 w-2 h-2 rounded-full bg-gray-800 shadow-inner" />
                    <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-gray-800 shadow-inner" />
                    <div className="absolute bottom-2 left-2 w-2 h-2 rounded-full bg-gray-800 shadow-inner" />
                    <div className="absolute bottom-2 right-2 w-2 h-2 rounded-full bg-gray-800 shadow-inner" />

                    {/* Content Area - Original Size */}
                    <div className="relative p-8 min-h-[350px] flex flex-col">
                      {/* Icon Container with Blood Effect - Theme responsive */}
                      <div className="flex justify-center mb-6">
                        <div className="relative">
                          <div className="rounded-full bg-red-950/80 dark:bg-red-950/80 p-5 border-4 border-red-900/60 dark:border-red-900/60 shadow-2xl shadow-red-900/50 transition-all duration-300 group-hover:border-red-700 group-hover:shadow-red-700/60 group-hover:scale-110
                                        light:bg-red-100 light:border-red-300">
                            <Icon className="h-10 w-10 text-red-400 dark:text-red-400 light:text-red-700 transition-all duration-300 group-hover:text-red-300 dark:group-hover:text-red-300 light:group-hover:text-red-600" />
                          </div>
                          {/* Glow effect */}
                          <div className="absolute inset-0 rounded-full bg-red-600/0 group-hover:bg-red-600/20 blur-xl transition-all duration-500" />
                        </div>
                      </div>

                      {/* Title - Theme responsive colors with text stroke */}
                      <div className="text-center mb-4">
                        <h3 className="font-mn-lon text-3xl font-black mb-1 tracking-[0.08em] transition-all duration-300
                                     text-red-500 dark:text-red-400 group-hover:text-red-600 dark:group-hover:text-red-400"
                            style={{ 
                              textShadow: `
                                -1px -1px 0 #000,  
                                1px -1px 0 #000,
                                -1px 1px 0 #000,
                                1px 1px 0 #000,
                                2px 2px 4px rgba(0,0,0,0.5)
                              `
                            }}>
                          {category.titleThai}
                        </h3>
                        <p className="font-mn-lon text-sm font-semibold tracking-wider
                                    text-red-700/80 dark:text-red-300/60"
                           style={{ 
                             textShadow: `
                               -0.5px -0.5px 0 #000,  
                               0.5px -0.5px 0 #000,
                               -0.5px 0.5px 0 #000,
                               0.5px 0.5px 0 #000
                             `
                           }}>
                          {category.title}
                        </p>
                      </div>

                      {/* Description - Theme responsive */}
                      <div className="flex-grow flex items-center mb-6">
                        <p className="font-mn-lon text-center text-base leading-relaxed font-medium
                                    text-gray-800 dark:text-red-200/80">
                          {category.description}
                        </p>
                      </div>

                      {/* Card Count Badge - Theme responsive */}
                      <div className="flex justify-center mb-6">
                        <div className="relative">
                          <div 
                            className="px-6 py-3 rounded-lg border-3 transition-all duration-300 group-hover:scale-110"
                            style={{
                              background: 'linear-gradient(135deg, #7f1d1d 0%, #991b1b 50%, #7f1d1d 100%)',
                              border: '3px solid #450a0a',
                              boxShadow: `
                                0 0 20px rgba(220, 38, 38, 0.4),
                                inset 0 1px 0 rgba(255, 255, 255, 0.1),
                                inset 0 -1px 0 rgba(0, 0, 0, 0.5)
                              `
                            }}
                          >
                            {/* Light mode badge overlay */}
                            <div className="absolute inset-0 dark:hidden rounded-lg"
                                 style={{
                                   background: 'linear-gradient(135deg, #dc2626 0%, #ef4444 50%, #dc2626 100%)',
                                   border: '3px solid #991b1b'
                                 }}
                            />
                            <div className="flex items-center gap-3 relative z-10">
                              <span className="font-mn-lon text-2xl font-black text-red-50 dark:text-red-200" 
                                    style={{ textShadow: '0 2px 4px rgba(0,0,0,0.8)' }}>
                                {category.count}
                              </span>
                              <span className="font-mn-lon text-sm font-bold text-red-50/90 dark:text-red-300/80 uppercase tracking-wide">
                                การ์ด
                              </span>
                            </div>
                          </div>
                          {/* Glow on hover */}
                          <div className="absolute inset-0 rounded-lg bg-red-600/0 group-hover:bg-red-600/30 blur-lg transition-all duration-500 -z-10" />
                        </div>
                      </div>

                      {/* View Button - Theme responsive */}
                      <div className="relative">
                        <div 
                          className="text-center py-3 rounded-md transition-all duration-300 overflow-hidden group-hover:shadow-[0_0_20px_rgba(220,38,38,0.4)]"
                          style={{
                            background: 'linear-gradient(135deg, #1c0a00 0%, #2d1810 50%, #1c0a00 100%)',
                            border: '2px solid #0f0501',
                            boxShadow: `
                              inset 0 2px 4px rgba(0,0,0,0.8),
                              inset 0 -1px 2px rgba(255,255,255,0.1),
                              0 4px 12px rgba(0,0,0,0.6)
                            `
                          }}
                        >
                          {/* Light mode button overlay */}
                          <div className="absolute inset-0 dark:hidden rounded-md"
                               style={{
                                 background: 'linear-gradient(135deg, #7c2d12 0%, #9a3412 50%, #7c2d12 100%)',
                                 border: '2px solid #431407'
                               }}
                          />
                          
                          {/* Animated blood flow on hover */}
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-red-900/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 group-hover:animate-pulse" />
                          
                          <span className="font-mn-lon relative z-10 text-base font-bold transition-colors flex items-center justify-center gap-2 uppercase tracking-wider
                                         text-red-400 dark:text-red-400 group-hover:text-red-300 dark:group-hover:text-red-300
                                         light:text-red-50 light:group-hover:text-red-100"
                                style={{ textShadow: '0 1px 3px rgba(0,0,0,0.8)' }}>
                            <Skull className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                            ดูการ์ดทั้งหมด
                            <span className="inline-block transition-transform group-hover:translate-x-1">→</span>
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Shadow below board - Original */}
                  <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-4/5 h-4 bg-black/60 blur-xl rounded-full" />
                </div>
              </Link>
            );
          })}
        </div>

        {/* Warning Box - Redesigned with Better Contrast */}
        <div className="mt-8 max-w-3xl mx-auto">
          {/* Dark mode warning */}
          <div className="dark:block hidden relative rounded-xl p-4 shadow-2xl border-2 border-red-900/50 bg-gradient-to-br from-red-950/90 via-red-900/80 to-red-950/90 backdrop-blur-sm">
            {/* Skull Warning Icon */}
            <div className="absolute -top-4 left-1/2 -translate-x-1/2">
              <div className="bg-gradient-to-br from-red-600 to-red-800 p-2.5 rounded-full border-3 border-red-500 shadow-2xl shadow-red-600/60">
                <Skull className="h-5 w-5 text-red-50 animate-pulse" style={{ animationDuration: '2s' }} />
              </div>
            </div>

            <div className="flex items-start gap-3 pt-4">
              <div className="flex-shrink-0 mt-0.5">
                <div className="bg-red-600/20 p-2 rounded-lg border border-red-500/30">
                  <FileWarning className="h-5 w-5 text-red-400" />
                </div>
              </div>
              <div className="flex-1">
                <h4 className="font-mn-lon mb-2 text-lg font-black text-red-300 tracking-wide flex items-center gap-2">
                  <span className="inline-block w-1 h-5 bg-red-500 rounded-full"></span>
                  หมายเหตุสำคัญ
                </h4>
                <div className="space-y-2 pl-3 border-l-2 border-red-600/30">
                  <p className="font-mn-lon text-sm leading-relaxed text-red-100/90 font-medium">
                    รายการการ์ดบาปจะมีการอัพเดททุกเดือน กรุณาตรวจสอบรายการล่าสุดก่อนการแข่งขันทุกครั้ง
                  </p>
                  <p className="font-mn-lon text-sm leading-relaxed text-red-200/80 font-medium">
                    การใช้การ์ดที่ถูกแบนหรือไม่ปฏิบัติตามเงื่อนไขอาจส่งผลให้ถูกตัดสิทธิ์จากการแข่งขัน
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Light mode warning */}
          <div className="dark:hidden block relative rounded-xl p-4 shadow-xl border-3 border-orange-600 bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50">
            {/* Skull Warning Icon */}
            <div className="absolute -top-4 left-1/2 -translate-x-1/2">
              <div className="bg-gradient-to-br from-red-600 to-red-800 p-2.5 rounded-full border-3 border-red-900 shadow-xl">
                <Skull className="h-5 w-5 text-white animate-pulse" style={{ animationDuration: '2s' }} />
              </div>
            </div>

            <div className="flex items-start gap-3 pt-4">
              <div className="flex-shrink-0 mt-0.5">
                <div className="bg-red-100 p-2 rounded-lg border-2 border-red-600">
                  <FileWarning className="h-5 w-5 text-red-700" />
                </div>
              </div>
              <div className="flex-1">
                <h4 className="font-mn-lon mb-2 text-lg font-black text-red-900 tracking-wide flex items-center gap-2">
                  <span className="inline-block w-1 h-5 bg-red-700 rounded-full"></span>
                  หมายเหตุสำคัญ
                </h4>
                <div className="space-y-2 pl-3 border-l-3 border-red-400">
                  <p className="font-mn-lon text-sm leading-relaxed text-gray-900 font-bold">
                    รายการการ์ดบาปจะมีการอัพเดททุกเดือน กรุณาตรวจสอบรายการล่าสุดก่อนการแข่งขันทุกครั้ง
                  </p>
                  <p className="font-mn-lon text-sm leading-relaxed text-gray-800 font-semibold">
                    การใช้การ์ดที่ถูกแบนหรือไม่ปฏิบัติตามเงื่อนไขอาจส่งผลให้ถูกตัดสิทธิ์จากการแข่งขัน
                  </p>
                </div>
              </div>
            </div>

            {/* Decorative corner accent */}
            <div className="absolute top-2 right-2 w-8 h-8 border-t-2 border-r-2 border-red-500 rounded-tr-lg opacity-50"></div>
            <div className="absolute bottom-2 left-2 w-8 h-8 border-b-2 border-l-2 border-red-500 rounded-bl-lg opacity-50"></div>
          </div>
        </div>
      </div>
    </div>
  );
}