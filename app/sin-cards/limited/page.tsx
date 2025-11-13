'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, AlertTriangle, X, ArrowUp, ArrowDown, Skull, Ghost } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface LimitedCard {
  id: number;
  name: string;
  imageUrl: string;
  limitType: 'decreased' | 'increased';
  oldLimit: number;
  newLimit: number;
  reason?: string;
  effectiveDate?: string;
  series?: string;
  type?: string;
}

// Mock data สำหรับการ์ดที่โดนจำกัด
const limitedCards: LimitedCard[] = [
  { 
    id: 1, 
    name: '[ การ์ดตัวอย่าง 1 ] 4 > 3 ใน', 
    imageUrl: '/character/1.png', 
    limitType: 'decreased',
    oldLimit: 4,
    newLimit: 3,
    reason: 'การ์ดนี้แข็งแรงเกินไปเมื่อใส่ครบ 4 ใบ การลดเหลือ 3 ใบจะช่วยสร้างสมดุลให้เกม',
    effectiveDate: '2024-12-01',
    series: 'SD01',
    type: 'Magic',
  },
  { 
    id: 2, 
    name: '[ การ์ดตัวอย่าง 2 ] 2 > 3 ใน', 
    imageUrl: '/character/2.png', 
    limitType: 'increased',
    oldLimit: 2,
    newLimit: 3,
    reason: 'การ์ดนี้ไม่ได้แรงเท่าที่คิด การเพิ่มจำนวนจะทำให้ Deck ที่ใช้การ์ดนี้มีโอกาสแข่งขันมากขึ้น',
    effectiveDate: '2024-11-20',
    series: 'SD01',
    type: 'Avatar',
  },
  { 
    id: 3, 
    name: '[ การ์ดตัวอย่าง 3 ] 4 > 2 ใน', 
    imageUrl: '/character/3.png', 
    limitType: 'decreased',
    oldLimit: 4,
    newLimit: 2,
    reason: 'สร้าง Combo ที่แรงเกินไปเมื่อมีหลายใบในมือ การจำกัดจำนวนจะลด Consistency ของ Combo นี้',
    effectiveDate: '2024-11-15',
    series: 'SD02',
    type: 'Magic',
  },
  { 
    id: 4, 
    name: '[ การ์ดตัวอย่าง 4 ] 1 > 2 ใน', 
    imageUrl: '/character/11.png', 
    limitType: 'increased',
    oldLimit: 1,
    newLimit: 2,
    reason: 'หลังจากทดสอบพบว่าการ์ดนี้ไม่ได้ทรงพลังเท่าที่คาด อนุญาตให้ใส่ได้ 2 ใบเพื่อเพิ่มความหลากหลาย',
    effectiveDate: '2024-10-30',
    series: 'SD02',
    type: 'Avatar',
  },
  { 
    id: 5, 
    name: '[ การ์ดตัวอย่าง 5 ] 4 > 1 ใน', 
    imageUrl: '/character/12.png', 
    limitType: 'decreased',
    oldLimit: 4,
    newLimit: 1,
    reason: 'มี Impact สูงมากในรอบต้น การจำกัดเหลือ 1 ใบจะลดโอกาสในการดึงมาใช้ในช่วงเริ่มเกม',
    effectiveDate: '2024-10-15',
    series: 'SD03',
    type: 'Magic',
  },
];

export default function LimitedCardsPage() {
  const [selectedCard, setSelectedCard] = useState<LimitedCard | null>(null);
  const [filterType, setFilterType] = useState<'all' | 'decreased' | 'increased'>('all');

  const filteredCards = filterType === 'all' 
    ? limitedCards 
    : limitedCards.filter(card => card.limitType === filterType);

  const hasDetails = (card: LimitedCard) => {
    return !!(card.reason || card.effectiveDate || card.series || card.type);
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Video Background - เหมือนหน้า Sin Cards Main */}
      <div className="fixed inset-0 -z-10">
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

      {/* Header Section */}
      <div className="relative">
        <div className="container mx-auto px-4 py-8">
          {/* Back Button */}
          <Link href="/#sin-cards-section">
            <Button 
              variant="ghost" 
              className="font-mn-lon mb-6 text-red-300 hover:text-red-200 hover:bg-red-950/30 border border-red-900/30"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              กลับไปหน้าหลัก
            </Button>
          </Link>

          {/* Title - Horror Style with Blood Effect */}
          <div className="mb-8 text-center relative">
            {/* Spooky Background Skull */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-10">
              <Skull className="h-40 w-40 text-red-600 animate-pulse" style={{ animationDuration: '4s' }} />
            </div>

            <div className="relative inline-block mb-4">
              <h1 className="font-mn-lon text-5xl md:text-6xl lg:text-7xl font-black text-blood tracking-wider">
                บาปจำกัด
              </h1>
              
              {/* Blood Drip Effect */}
              <svg className="absolute -bottom-4 left-0 w-full h-12 opacity-80" viewBox="0 0 400 50" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="bloodGradientLimited" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" style={{ stopColor: '#dc2626', stopOpacity: 1 }} />
                    <stop offset="100%" style={{ stopColor: '#7f1d1d', stopOpacity: 0.8 }} />
                  </linearGradient>
                </defs>
                <path d="M 100 0 Q 100 12, 98 25 Q 96 38, 100 50 L 100 50 Q 104 38, 102 25 Q 100 12, 100 0 Z" fill="url(#bloodGradientLimited)" opacity="0.9" />
                <path d="M 200 2 Q 200 15, 198 30 Q 196 42, 200 52 L 200 52 Q 204 42, 202 30 Q 200 15, 200 2 Z" fill="url(#bloodGradientLimited)" opacity="0.85" />
                <path d="M 300 0 Q 300 13, 298 27 Q 296 40, 300 48 L 300 48 Q 304 40, 302 27 Q 300 13, 300 0 Z" fill="url(#bloodGradientLimited)" opacity="0.8" />
              </svg>
            </div>

            <p className="font-mn-lon text-sm text-red-300/80 tracking-wider uppercase">Limited Cards</p>
          </div>

          {/* Warning Box - Wooden Sign Style */}
          <div className="max-w-4xl mx-auto mb-8">
            <div 
              className="relative rounded-lg shadow-2xl overflow-hidden"
              style={{
                background: `linear-gradient(135deg, #1c0a00 0%, #2d1810 20%, #1c0a00 40%, #3e2723 60%, #2d1810 80%, #1c0a00 100%)`,
                border: '6px solid #0f0501',
                boxShadow: `
                  inset 0 2px 4px rgba(0,0,0,0.6),
                  inset 0 -2px 4px rgba(255,255,255,0.05),
                  0 8px 32px rgba(220, 38, 38, 0.3)
                `
              }}
            >
              {/* Nails in corners */}
              <div className="absolute top-2 left-2 w-2 h-2 rounded-full bg-gray-800 shadow-inner" />
              <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-gray-800 shadow-inner" />
              <div className="absolute bottom-2 left-2 w-2 h-2 rounded-full bg-gray-800 shadow-inner" />
              <div className="absolute bottom-2 right-2 w-2 h-2 rounded-full bg-gray-800 shadow-inner" />

              <div className="p-6 pt-8">
                <p className="font-mn-lon text-base leading-relaxed text-red-200/80 text-center">
                  การ์ดในหมวดนี้ถูกจำกัดจำนวนที่สามารถใส่ใน Deck ได้ 
                  บางการ์ดอาจถูกลดจำนวนลงเนื่องจากแรงเกินไป 
                  หรือเพิ่มจำนวนขึ้นเพื่อให้ Deck บางประเภทมีโอกาสแข่งขันมากขึ้น
                </p>

                <div className="mt-4 flex items-center justify-between text-sm">
                  <span className="font-mn-lon text-red-400 font-semibold">
                    ทั้งหมด {filteredCards.length} ใบ
                  </span>
                  <span className="font-mn-lon text-red-300/60">
                    อัพเดทล่าสุด: ธันวาคม 2568
                  </span>
                </div>
              </div>

              {/* Blood splatter decoration */}
              <div 
                className="absolute bottom-2 right-4 w-16 h-16 opacity-20"
                style={{
                  background: `radial-gradient(circle, rgba(220, 38, 38, 0.8) 0%, rgba(220, 38, 38, 0.4) 40%, transparent 70%)`
                }}
              />
            </div>
          </div>

          {/* Filter Buttons */}
          <div className="flex flex-wrap gap-2 mb-6 justify-center">
            <Button
              size="sm"
              variant={filterType === 'all' ? 'default' : 'outline'}
              onClick={() => setFilterType('all')}
              className="font-mn-lon"
            >
              ทั้งหมด ({limitedCards.length})
            </Button>
            <Button
              size="sm"
              variant={filterType === 'decreased' ? 'default' : 'outline'}
              onClick={() => setFilterType('decreased')}
              className="font-mn-lon"
            >
              <ArrowDown className="mr-1 h-3 w-3" />
              ลดจำนวน ({limitedCards.filter(c => c.limitType === 'decreased').length})
            </Button>
            <Button
              size="sm"
              variant={filterType === 'increased' ? 'default' : 'outline'}
              onClick={() => setFilterType('increased')}
              className="font-mn-lon"
            >
              <ArrowUp className="mr-1 h-3 w-3" />
              เพิ่มจำนวน ({limitedCards.filter(c => c.limitType === 'increased').length})
            </Button>
          </div>
        </div>
      </div>

      {/* Cards Grid - Wooden Board Cards */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {filteredCards.map((card, index) => (
            <div
              key={card.id}
              className="group relative"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Hanging Chain */}
              <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-0.5 h-6 bg-gradient-to-b from-gray-700 via-gray-600 to-gray-500 shadow-lg" />
              <div className="absolute -top-8 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-gray-600 shadow-xl border border-gray-500" />

              {/* Wooden Board Card */}
              <div
                onClick={() => setSelectedCard(card)}
                className="relative cursor-pointer overflow-hidden rounded-lg shadow-2xl transition-all duration-500 hover:scale-105 hover:shadow-[0_0_40px_rgba(220,38,38,0.5)]"
                style={{
                  background: `linear-gradient(135deg, #3e2723 0%, #4e342e 20%, #3e2723 40%, #5d4037 60%, #4e342e 80%, #3e2723 100%)`,
                  border: '6px solid #2d1810',
                  boxShadow: `
                    inset 0 2px 4px rgba(0,0,0,0.6),
                    inset 0 -2px 4px rgba(255,255,255,0.1),
                    0 8px 32px rgba(0,0,0,0.8)
                  `
                }}
              >
                {/* Wood Texture */}
                <div 
                  className="absolute inset-0 opacity-30 mix-blend-overlay"
                  style={{
                    backgroundImage: `repeating-linear-gradient(90deg, transparent, transparent 2px, rgba(0,0,0,0.1) 2px, rgba(0,0,0,0.1) 4px)`
                  }}
                />

                {/* Nails */}
                <div className="absolute top-1 left-1 w-1.5 h-1.5 rounded-full bg-gray-800 shadow-inner z-10" />
                <div className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-gray-800 shadow-inner z-10" />
                <div className="absolute bottom-1 left-1 w-1.5 h-1.5 rounded-full bg-gray-800 shadow-inner z-10" />
                <div className="absolute bottom-1 right-1 w-1.5 h-1.5 rounded-full bg-gray-800 shadow-inner z-10" />

                {/* Card Image Container */}
                <div className="relative aspect-[2/3] p-3">
                  <div className="relative w-full h-full overflow-hidden rounded border-2 border-red-900/60 shadow-lg">
                    <Image
                      src={card.imageUrl}
                      alt={card.name}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-110"
                    />
                    
                    {/* Dark Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-red-900/70 via-transparent to-transparent" />
                    
                    {/* Limit Change Icon */}
                    <div className={`absolute top-2 right-2 rounded-full p-1.5 shadow-lg border ${
                      card.limitType === 'decreased' ? 'bg-red-600/90 border-red-800' : 'bg-green-600/90 border-green-800'
                    }`}>
                      {card.limitType === 'decreased' ? (
                        <ArrowDown className="h-3 w-3 text-white" />
                      ) : (
                        <ArrowUp className="h-3 w-3 text-white" />
                      )}
                    </div>

                    {/* Limit Badge at bottom */}
                    <div className="absolute bottom-2 left-2 right-2 bg-black/90 backdrop-blur-sm rounded px-2 py-1 border border-red-900/60">
                      <div className="flex items-center justify-center gap-1 text-xs font-bold font-mn-lon">
                        <span className="text-red-400">{card.oldLimit}</span>
                        <span className="text-white">→</span>
                        <span className={card.limitType === 'decreased' ? 'text-red-400' : 'text-green-400'}>
                          {card.newLimit}
                        </span>
                      </div>
                    </div>

                    {/* Hover Effect */}
                    <div className="absolute inset-0 bg-gradient-to-t from-red-900/90 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2">
                      <p className="font-mn-lon text-xs text-white font-semibold">
                        {hasDetails(card) ? 'ดูรายละเอียด' : 'ขยายดู'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Blood Splatter on Hover */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-500"
                     style={{
                       background: `radial-gradient(circle at 30% 40%, rgba(220, 38, 38, 0.6) 0%, transparent 50%)`
                     }}
                />
              </div>

              {/* Card ID Badge */}
              <div className={`absolute -right-2 -top-2 z-20 flex h-7 w-7 items-center justify-center rounded-full border-2 border-red-950 text-xs font-bold text-white shadow-lg ${
                card.limitType === 'decreased' ? 'bg-gradient-to-br from-red-600 to-red-800' : 'bg-gradient-to-br from-green-600 to-green-800'
              }`}>
                {card.id}
              </div>

              {/* Shadow below board */}
              <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-3/4 h-3 bg-black/60 blur-xl rounded-full" />
            </div>
          ))}
        </div>
      </div>

      {/* Card Detail Modal */}
      {selectedCard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4">
          <div 
            className="relative w-full max-w-5xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl"
            style={{
              background: `linear-gradient(135deg, #1c0a00 0%, #2d1810 20%, #1c0a00 40%, #3e2723 60%, #2d1810 80%, #1c0a00 100%)`,
              border: '8px solid #0f0501',
              boxShadow: `
                inset 0 2px 4px rgba(0,0,0,0.6),
                inset 0 -2px 4px rgba(255,255,255,0.05),
                0 16px 64px rgba(220, 38, 38, 0.4)
              `
            }}
          >
            {/* Nails in corners */}
            <div className="absolute top-3 left-3 w-3 h-3 rounded-full bg-gray-800 shadow-inner z-10" />
            <div className="absolute top-3 right-3 w-3 h-3 rounded-full bg-gray-800 shadow-inner z-10" />
            <div className="absolute bottom-3 left-3 w-3 h-3 rounded-full bg-gray-800 shadow-inner z-10" />
            <div className="absolute bottom-3 right-3 w-3 h-3 rounded-full bg-gray-800 shadow-inner z-10" />

            {/* Close Button */}
            <button
              onClick={() => setSelectedCard(null)}
              className="absolute right-6 top-6 z-20 rounded-full bg-red-900/80 p-2.5 text-white hover:bg-red-800 transition border-2 border-red-700 shadow-lg"
            >
              <X className="w-5 h-5" />
            </button>

            {!hasDetails(selectedCard) ? (
              // ไม่มีรายละเอียด - แสดงเฉพาะรูปขยาย
              <div className="p-12 flex flex-col items-center justify-center min-h-[500px]">
                {/* Skull Decoration */}
                <div className="absolute top-8 opacity-10">
                  <Ghost className="h-32 w-32 text-red-600 animate-pulse" />
                </div>

                <div className="relative w-full max-w-md z-10">
                  <div className="relative aspect-[2/3] overflow-hidden rounded-xl border-4 border-red-900/60 shadow-2xl">
                    <Image
                      src={selectedCard.imageUrl}
                      alt={selectedCard.name}
                      fill
                      className="object-cover"
                    />
                    {/* Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-red-900/50 via-transparent to-transparent" />
                  </div>
                  
                  {/* Glow Effect */}
                  <div className="absolute inset-0 -z-10 rounded-xl bg-gradient-to-br from-red-600/30 via-red-500/20 to-red-600/30 blur-2xl" />
                </div>

                {/* Card Name Badge */}
                <div 
                  className="mt-8 rounded-xl shadow-2xl w-full max-w-md overflow-hidden"
                  style={{
                    background: `linear-gradient(135deg, #2d1810 0%, #3e2723 50%, #2d1810 100%)`,
                    border: '4px solid #1c0a00',
                    boxShadow: `inset 0 2px 4px rgba(0,0,0,0.6), 0 8px 24px rgba(220, 38, 38, 0.3)`
                  }}
                >
                  <div className="p-6">
                    <h3 className="font-mn-lon text-2xl font-black text-blood-small text-center tracking-wide">
                      {selectedCard.name}
                    </h3>
                    <div className="mt-4 flex items-center justify-center gap-4">
                      <div 
                        className="rounded-full px-6 py-2.5 text-sm font-bold text-white shadow-lg flex items-center gap-2"
                        style={{
                          background: 'linear-gradient(135deg, #7f1d1d 0%, #991b1b 50%, #7f1d1d 100%)',
                          border: '3px solid #450a0a',
                          boxShadow: `0 0 20px rgba(220, 38, 38, 0.4)`
                        }}
                      >
                        <AlertTriangle className="h-4 w-4" />
                        <span className="font-mn-lon">จำกัด</span>
                      </div>
                      <div className="flex items-center gap-2 font-mn-lon text-lg font-bold">
                        <span className="text-red-400">{selectedCard.oldLimit}</span>
                        <span className="text-white">→</span>
                        <span className={selectedCard.limitType === 'decreased' ? 'text-red-400' : 'text-green-400'}>
                          {selectedCard.newLimit}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              // มีรายละเอียด - แสดงแบบเต็ม
              <div className="p-8 md:p-12">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Left: Card Image */}
                  <div className="flex items-center justify-center">
                    <div className="relative w-full max-w-md">
                      <div className="relative aspect-[2/3] overflow-hidden rounded-xl border-4 border-red-900/60 shadow-2xl">
                        <Image
                          src={selectedCard.imageUrl}
                          alt={selectedCard.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="absolute inset-0 -z-10 rounded-xl bg-gradient-to-br from-red-600/30 via-red-500/20 to-red-600/30 blur-2xl" />
                    </div>
                  </div>

                  {/* Right: Details */}
                  <div className="flex flex-col gap-4">
                    {/* Card Name */}
                    <div 
                      className="rounded-xl shadow-xl overflow-hidden"
                      style={{
                        background: `linear-gradient(135deg, #2d1810 0%, #3e2723 50%, #2d1810 100%)`,
                        border: '4px solid #1c0a00',
                        boxShadow: `inset 0 2px 4px rgba(0,0,0,0.6)`
                      }}
                    >
                      <div className="p-4">
                        <h3 className="font-mn-lon text-xl font-black text-blood-small text-center tracking-wide">
                          {selectedCard.name}
                        </h3>
                      </div>
                    </div>

                    {/* Limit Change Badge */}
                    <div className="flex justify-center items-center gap-4">
                      <div 
                        className="rounded-full px-6 py-2.5 text-sm font-bold text-white shadow-lg flex items-center gap-2"
                        style={{
                          background: 'linear-gradient(135deg, #7f1d1d 0%, #991b1b 50%, #7f1d1d 100%)',
                          border: '3px solid #450a0a',
                          boxShadow: `0 0 20px rgba(220, 38, 38, 0.4)`
                        }}
                      >
                        {selectedCard.limitType === 'decreased' ? (
                          <ArrowDown className="h-4 w-4" />
                        ) : (
                          <ArrowUp className="h-4 w-4" />
                        )}
                        <span className="font-mn-lon">
                          {selectedCard.limitType === 'decreased' ? 'ลดจำนวน' : 'เพิ่มจำนวน'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 font-mn-lon text-2xl font-bold">
                        <span className="text-red-400">{selectedCard.oldLimit}</span>
                        <span className="text-white">→</span>
                        <span className={selectedCard.limitType === 'decreased' ? 'text-red-400' : 'text-green-400'}>
                          {selectedCard.newLimit}
                        </span>
                      </div>
                    </div>

                    {/* Reason */}
                    {selectedCard.reason && (
                      <div 
                        className="rounded-xl shadow-xl overflow-hidden flex-1"
                        style={{
                          background: `linear-gradient(135deg, #2d1810 0%, #3e2723 50%, #2d1810 100%)`,
                          border: '4px solid #1c0a00',
                          boxShadow: `inset 0 2px 4px rgba(0,0,0,0.6)`
                        }}
                      >
                        <div className="p-6">
                          <div 
                            className="mb-4 inline-block rounded-full px-4 py-1.5 text-sm font-bold text-white shadow-lg font-mn-lon"
                            style={{
                              background: 'linear-gradient(135deg, #7f1d1d 0%, #991b1b 50%, #7f1d1d 100%)',
                              border: '2px solid #450a0a'
                            }}
                          >
                            ทำบาปอะไร?
                          </div>
                          <p className="font-mn-lon text-sm leading-relaxed text-red-200/90 whitespace-pre-line">
                            {selectedCard.reason}
                          </p>

                          {/* Additional Info */}
                          {(selectedCard.series || selectedCard.type || selectedCard.effectiveDate) && (
                            <div className="mt-6 pt-4 border-t border-red-900/30 grid grid-cols-2 gap-4">
                              {selectedCard.series && (
                                <div>
                                  <p className="font-mn-lon text-xs text-red-400 mb-1">Series</p>
                                  <p className="font-mn-lon text-sm text-red-200 font-semibold">{selectedCard.series}</p>
                                </div>
                              )}
                              {selectedCard.type && (
                                <div>
                                  <p className="font-mn-lon text-xs text-red-400 mb-1">Type</p>
                                  <p className="font-mn-lon text-sm text-red-200 font-semibold">{selectedCard.type}</p>
                                </div>
                              )}
                              {selectedCard.effectiveDate && (
                                <div className="col-span-2">
                                  <p className="font-mn-lon text-xs text-red-400 mb-1">มีผลตั้งแต่</p>
                                  <p className="font-mn-lon text-sm text-red-200 font-semibold">
                                    {new Date(selectedCard.effectiveDate).toLocaleDateString('th-TH', {
                                      year: 'numeric',
                                      month: 'long',
                                      day: 'numeric'
                                    })}
                                  </p>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Warning */}
                    <div 
                      className="rounded-xl shadow-xl overflow-hidden"
                      style={{
                        background: `linear-gradient(135deg, #2d1810 0%, #3e2723 50%, #2d1810 100%)`,
                        border: '3px solid #854d0e',
                        boxShadow: `inset 0 2px 4px rgba(0,0,0,0.6)`
                      }}
                    >
                      <div className="p-4">
                        <p className="font-mn-lon text-xs text-yellow-300/90 leading-relaxed">
                          ⚠️ การใส่การ์ดเกินจำนวนที่กำหนดอาจทำให้ Deck ของคุณไม่ถูกต้องตามกฎ
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}