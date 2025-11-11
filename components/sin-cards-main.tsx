'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Ban, AlertTriangle, FileWarning, Flame } from 'lucide-react';

// ข้อมูล Mock สำหรับ 3 กลุ่มหลัก
const sinCardCategories = [
  {
    id: 'banned',
    title: 'Banned Cards',
    titleThai: 'การ์ดต้องห้าม',
    description: 'การ์ดที่ถูกห้ามใช้ในการแข่งขันอย่างสมบูรณ์',
    icon: Ban,
    color: 'from-orange-600 via-red-600 to-rose-700',
    glowColor: 'from-orange-500 via-red-500 to-rose-600',
    borderColor: 'border-red-500/40',
    iconColor: 'text-red-400',
    bgGlow: 'bg-red-600/10',
    hoverBorder: 'hover:border-red-400/60',
    representativeCard: {
      id: 1,
      name: '[ โคลัมบัส ] 4 > 1 ใน',
      imageUrl: '/character/1.png',
      count: 12,
    },
  },
  {
    id: 'limited',
    title: 'Limited Cards',
    titleThai: 'การ์ดจำกัด',
    description: 'การ์ดที่ถูกจำกัดจำนวนที่สามารถใส่ใน Deck หรือมีการเพิ่มจำนวนที่ใส่ได้',
    icon: AlertTriangle,
    color: 'from-yellow-600 via-orange-600 to-red-600',
    glowColor: 'from-yellow-500 via-orange-500 to-red-500',
    borderColor: 'border-orange-500/40',
    iconColor: 'text-orange-400',
    bgGlow: 'bg-orange-600/10',
    hoverBorder: 'hover:border-orange-400/60',
    representativeCard: {
      id: 2,
      name: '[ การ์ดตัวอย่าง 2 ] 3 > 1 ใน',
      imageUrl: '/character/2.png',
      count: 8,
    },
  },
  {
    id: 'conditional',
    title: 'Conditional Cards',
    titleThai: 'การ์ดมีเงื่อนไข',
    description: 'การ์ดที่มีเงื่อนไขพิเศษในการใช้งาน เช่น ห้ามใส่ซ้ำกับการ์ดบางใบ หรือต้องเลือกใบใดใบหนึ่ง',
    icon: FileWarning,
    color: 'from-amber-600 via-orange-600 to-red-600',
    glowColor: 'from-amber-500 via-orange-500 to-red-500',
    borderColor: 'border-amber-500/40',
    iconColor: 'text-amber-400',
    bgGlow: 'bg-amber-600/10',
    hoverBorder: 'hover:border-amber-400/60',
    representativeCard: {
      id: 3,
      name: '[ การ์ดตัวอย่าง 3 ] 4 > 2 ใน',
      imageUrl: '/character/3.png',
      count: 15,
    },
  },
];

export function SinCardsMain() {
  return (
    <div
      id="sin-cards-section"
      className="relative w-full overflow-hidden"
    >
      {/* Hellish Background with Fire Animation */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-slate-950 via-orange-950/30 to-slate-950">
        {/* Animated Fire Glow Orbs */}
        <div className="absolute left-1/4 top-0 h-[500px] w-[500px] rounded-full bg-gradient-radial from-orange-500/20 via-red-600/10 to-transparent blur-3xl animate-pulse" 
             style={{ animationDuration: '4s' }} />
        <div className="absolute right-1/4 top-1/3 h-[600px] w-[600px] rounded-full bg-gradient-radial from-red-500/20 via-orange-600/10 to-transparent blur-3xl animate-pulse" 
             style={{ animationDuration: '5s', animationDelay: '1s' }} />
        <div className="absolute left-1/2 bottom-0 h-[400px] w-[400px] rounded-full bg-gradient-radial from-yellow-500/15 via-orange-600/10 to-transparent blur-3xl animate-pulse" 
             style={{ animationDuration: '3.5s', animationDelay: '2s' }} />
        
        {/* Heat Wave Effect */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute inset-0 bg-gradient-to-t from-orange-600/5 via-transparent to-red-600/5 animate-heat-wave" />
        </div>
        
        {/* Floating Embers */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/3 w-1 h-1 bg-orange-400 rounded-full animate-float-ember" 
               style={{ animationDelay: '0s', animationDuration: '8s' }} />
          <div className="absolute top-1/2 left-1/4 w-1 h-1 bg-red-400 rounded-full animate-float-ember" 
               style={{ animationDelay: '2s', animationDuration: '10s' }} />
          <div className="absolute top-3/4 right-1/3 w-1 h-1 bg-yellow-400 rounded-full animate-float-ember" 
               style={{ animationDelay: '4s', animationDuration: '9s' }} />
          <div className="absolute top-1/3 right-1/4 w-0.5 h-0.5 bg-orange-300 rounded-full animate-float-ember" 
               style={{ animationDelay: '1s', animationDuration: '7s' }} />
          <div className="absolute top-2/3 left-1/2 w-0.5 h-0.5 bg-red-300 rounded-full animate-float-ember" 
               style={{ animationDelay: '3s', animationDuration: '11s' }} />
        </div>

        {/* Smoky Texture Overlay */}
        <div className="absolute inset-0 bg-[url('/noise.png')] opacity-10 mix-blend-overlay" />
      </div>

      <div className="container mx-auto px-4 py-16 md:py-24">
        {/* Header */}
        <div className="mb-12 text-center relative">
          {/* Flame Icon Background */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
            <Flame className="h-32 w-32 text-orange-500/10 animate-pulse" style={{ animationDuration: '3s' }} />
          </div>
          
          <div className="relative mb-4 inline-flex items-center gap-2 rounded-full border border-orange-500/40 bg-gradient-to-r from-orange-950/80 via-red-950/80 to-orange-950/80 px-6 py-2 backdrop-blur-sm shadow-lg shadow-orange-500/20">
            <Flame className="h-4 w-4 text-orange-400 animate-pulse" />
            <span className="text-sm font-semibold bg-gradient-to-r from-orange-300 via-red-300 to-orange-300 bg-clip-text text-transparent">
              ประจำเดือนธันวาคม 2568
            </span>
          </div>
          
          <h2 className="mb-4 text-4xl font-bold md:text-5xl relative">
            <span className="bg-gradient-to-r from-orange-400 via-red-500 to-orange-400 bg-clip-text text-transparent drop-shadow-[0_0_30px_rgba(251,146,60,0.5)]">
              การ์ดบาป
            </span>
          </h2>
          
          <p className="text-orange-200/70 max-w-2xl mx-auto">
            การ์ดที่ถูกจำกัดการใช้งานเพื่อสร้างความสมดุลในเกม แบ่งออกเป็น 3 ประเภทหลัก
          </p>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3 max-w-6xl mx-auto">
          {sinCardCategories.map((category, index) => {
            const Icon = category.icon;
            return (
              <Link
                key={category.id}
                href={`/sin-cards/${category.id}`}
                className="group"
                style={{ animationDelay: `${index * 150}ms` }}
              >
                <div className={`relative overflow-hidden rounded-2xl border-2 bg-gradient-to-br from-slate-900/90 via-slate-950/90 to-slate-900/90 backdrop-blur-sm transition-all duration-500 hover:scale-[1.03] hover:shadow-2xl ${category.borderColor} ${category.hoverBorder}`}>
                  {/* Animated Fire Top Bar */}
                  <div className={`h-1.5 bg-gradient-to-r ${category.color} relative overflow-hidden`}>
                    <div className={`absolute inset-0 bg-gradient-to-r ${category.glowColor} opacity-0 group-hover:opacity-100 transition-opacity duration-500 animate-pulse`} />
                  </div>

                  {/* Inner Glow Effect */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    <div className={`absolute inset-0 bg-gradient-to-br ${category.glowColor} opacity-10 blur-2xl`} />
                  </div>

                  {/* Content */}
                  <div className="relative p-6">
                    {/* Icon & Title */}
                    <div className="mb-6 flex items-center gap-4">
                      <div className={`rounded-xl ${category.bgGlow} p-3 ring-1 ring-orange-500/20 transition-all duration-300 group-hover:ring-2 group-hover:ring-orange-400/40 group-hover:shadow-lg group-hover:shadow-orange-500/20`}>
                        <Icon className={`h-7 w-7 ${category.iconColor} transition-transform duration-300 group-hover:scale-110`} />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-orange-100 group-hover:text-orange-50 transition-colors">
                          {category.titleThai}
                        </h3>
                        <p className="text-xs text-orange-300/60">{category.title}</p>
                      </div>
                    </div>

                    {/* Description */}
                    <p className="mb-6 text-sm leading-relaxed text-orange-200/60">
                      {category.description}
                    </p>

                    {/* Representative Card */}
                    <div className="relative mb-4">
                      <div className="relative mx-auto aspect-[2/3] w-40 overflow-hidden rounded-lg border-2 border-orange-500/30 bg-slate-900/50 shadow-2xl shadow-orange-500/20 transition-all duration-500 group-hover:scale-105 group-hover:border-orange-400/50 group-hover:shadow-orange-500/40">
                        <Image
                          src={category.representativeCard.imageUrl}
                          alt={category.representativeCard.name}
                          fill
                          className="object-cover"
                        />
                        {/* Fire Overlay on Hover */}
                        <div className={`absolute inset-0 bg-gradient-to-t from-orange-600/40 via-red-600/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                      </div>
                      
                      {/* Card Count Badge with Fire Glow */}
                      <div className={`absolute -right-2 -top-2 flex h-10 w-10 items-center justify-center rounded-full border-2 border-slate-950 bg-gradient-to-br ${category.color} shadow-xl transition-all duration-300 group-hover:scale-110`}>
                        <span className="text-sm font-bold text-white drop-shadow-lg">
                          {category.representativeCard.count}
                        </span>
                        {/* Pulsing Glow */}
                        <div className={`absolute inset-0 rounded-full bg-gradient-to-br ${category.glowColor} opacity-0 group-hover:opacity-50 blur-md animate-pulse -z-10`} />
                      </div>
                    </div>

                    {/* Card Name */}
                    <p className="text-center text-xs font-medium text-orange-100/70 line-clamp-2 mb-4">
                      {category.representativeCard.name}
                    </p>

                    {/* View All Button with Fire Effect */}
                    <div className={`relative rounded-lg border-2 bg-gradient-to-r from-slate-900/50 via-slate-950/50 to-slate-900/50 p-3 text-center transition-all duration-300 overflow-hidden ${category.borderColor} group-hover:${category.hoverBorder}`}>
                      {/* Animated Background on Hover */}
                      <div className={`absolute inset-0 bg-gradient-to-r ${category.color} opacity-0 group-hover:opacity-20 transition-opacity duration-500`} />
                      
                      <span className={`relative text-sm font-semibold ${category.iconColor} group-hover:text-orange-300 transition-colors flex items-center justify-center gap-2`}>
                        <Flame className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                        ดูการ์ดทั้งหมด
                        <span className="inline-block transition-transform group-hover:translate-x-1">→</span>
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Info Box with Fire Theme */}
        <div className="mt-12 max-w-4xl mx-auto rounded-xl border-2 border-orange-500/30 bg-gradient-to-br from-slate-900/90 via-orange-950/20 to-slate-900/90 p-6 backdrop-blur-sm shadow-xl shadow-orange-500/10">
          <div className="flex items-start gap-4">
            <div className="rounded-lg bg-orange-600/20 p-2 ring-1 ring-orange-500/30">
              <FileWarning className="h-5 w-5 text-orange-400" />
            </div>
            <div>
              <h4 className="mb-2 font-bold text-orange-100 flex items-center gap-2">
                หมายเหตุ
                <Flame className="h-4 w-4 text-orange-400 animate-pulse" />
              </h4>
              <p className="text-sm leading-relaxed text-orange-200/70">
                รายการการ์ดบาปจะมีการอัพเดททุกเดือน กรุณาตรวจสอบรายการล่าสุดก่อนการแข่งขันทุกครั้ง
                การใช้การ์ดที่ถูกแบนหรือไม่ปฏิบัติตามเงื่อนไขอาจส่งผลให้ถูกตัดสิทธิ์จากการแข่งขัน
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Custom CSS for Animations */}
      <style jsx>{`
        @keyframes heat-wave {
          0%, 100% {
            transform: translateY(0) scaleY(1);
            opacity: 0.3;
          }
          50% {
            transform: translateY(-10px) scaleY(1.1);
            opacity: 0.5;
          }
        }

        @keyframes float-ember {
          0% {
            transform: translateY(0) translateX(0);
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          90% {
            opacity: 1;
          }
          100% {
            transform: translateY(-100vh) translateX(20px);
            opacity: 0;
          }
        }

        .animate-heat-wave {
          animation: heat-wave 6s ease-in-out infinite;
        }

        .animate-float-ember {
          animation: float-ember linear infinite;
        }
      `}</style>
    </div>
  );
}