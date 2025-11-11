'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, AlertTriangle, X, ArrowUp, ArrowDown } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Mock data สำหรับการ์ดที่โดนจำกัด
const limitedCards = [
  { 
    id: 1, 
    name: '[ การ์ดตัวอย่าง 1 ] 4 > 3 ใน', 
    imageUrl: '/character/1.png', 
    limitType: 'decreased', // ลดจำนวน
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
    limitType: 'increased', // เพิ่มจำนวน
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
  const [selectedCard, setSelectedCard] = useState<typeof limitedCards[0] | null>(null);
  const [filterType, setFilterType] = useState<'all' | 'decreased' | 'increased'>('all');

  const filteredCards = filterType === 'all' 
    ? limitedCards 
    : limitedCards.filter(card => card.limitType === filterType);

  return (
    <div className="min-h-screen bg-background">
      {/* Header with background */}
      <div className="relative border-b border-border/40 bg-gradient-to-r from-orange-950/20 via-red-950/20 to-rose-950/20">
        <div className="absolute inset-0 -z-10">
          <div className="absolute left-0 top-0 h-96 w-96 animate-pulse rounded-full bg-orange-500/10 blur-3xl" />
          <div className="absolute right-0 bottom-0 h-96 w-96 animate-pulse rounded-full bg-red-500/10 blur-3xl animation-delay-2000" />
        </div>

        <div className="container mx-auto px-4 py-8">
          <Link href="/#sin-cards-section">
            <Button variant="ghost" size="sm" className="mb-4 text-orange-400 hover:text-orange-300">
              <ArrowLeft className="mr-2 h-4 w-4" />
              กลับไปหน้าหลัก
            </Button>
          </Link>

          <div className="flex items-center gap-4 mb-4">
            <div className="rounded-xl bg-orange-500/10 p-3 ring-2 ring-orange-500/20">
              <AlertTriangle className="h-8 w-8 text-orange-500" />
            </div>
            <div>
              <h1 className="text-3xl font-bold md:text-4xl">
                <span className="bg-gradient-to-r from-orange-400 via-red-400 to-rose-400 bg-clip-text text-transparent">
                  การ์ดจำกัด
                </span>
              </h1>
              <p className="text-sm text-muted-foreground mt-1">Limited Cards</p>
            </div>
          </div>

          <div className="rounded-lg border border-orange-500/20 bg-orange-950/10 p-4 mb-4">
            <p className="text-sm text-muted-foreground leading-relaxed">
              การ์ดในหมวดนี้ถูกจำกัดจำนวนที่สามารถใส่ใน Deck ได้ 
              บางการ์ดอาจถูกลดจำนวนลงเนื่องจากแรงเกินไป 
              หรือเพิ่มจำนวนขึ้นเพื่อให้ Deck บางประเภทมีโอกาสแข่งขันมากขึ้น
            </p>
          </div>

          {/* Filter Buttons */}
          <div className="flex flex-wrap gap-2 mb-4">
            <Button
              size="sm"
              variant={filterType === 'all' ? 'default' : 'outline'}
              onClick={() => setFilterType('all')}
              className="gap-2"
            >
              ทั้งหมด ({limitedCards.length})
            </Button>
            <Button
              size="sm"
              variant={filterType === 'decreased' ? 'default' : 'outline'}
              onClick={() => setFilterType('decreased')}
              className="gap-2"
            >
              <ArrowDown className="h-4 w-4 text-red-400" />
              ลดจำนวน ({limitedCards.filter(c => c.limitType === 'decreased').length})
            </Button>
            <Button
              size="sm"
              variant={filterType === 'increased' ? 'default' : 'outline'}
              onClick={() => setFilterType('increased')}
              className="gap-2"
            >
              <ArrowUp className="h-4 w-4 text-green-400" />
              เพิ่มจำนวน ({limitedCards.filter(c => c.limitType === 'increased').length})
            </Button>
          </div>

          <div className="flex items-center justify-between">
            <p className="text-sm text-orange-400 font-semibold">
              แสดง {filteredCards.length} จาก {limitedCards.length} ใบ
            </p>
            <p className="text-xs text-muted-foreground">
              อัพเดทล่าสุด: ธันวาคม 2568
            </p>
          </div>
        </div>
      </div>

      {/* Cards Grid */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {filteredCards.map((card) => (
            <div
              key={card.id}
              className="group relative cursor-pointer transition-all duration-300 hover:scale-105"
              onClick={() => setSelectedCard(card)}
            >
              {/* Card Container */}
              <div className="relative aspect-[2/3] overflow-hidden rounded-lg border-2 border-orange-500/30 bg-muted/30 shadow-lg group-hover:border-orange-400 group-hover:shadow-orange-400/30 transition-all duration-300">
                <Image
                  src={card.imageUrl}
                  alt={card.name}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-110"
                />
                
                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-orange-900/60 via-transparent to-transparent" />
                
                {/* Limit Change Icon */}
                <div className={`absolute top-2 right-2 rounded-full p-1.5 shadow-lg ${
                  card.limitType === 'decreased' ? 'bg-red-600' : 'bg-green-600'
                }`}>
                  {card.limitType === 'decreased' ? (
                    <ArrowDown className="h-4 w-4 text-white" />
                  ) : (
                    <ArrowUp className="h-4 w-4 text-white" />
                  )}
                </div>

                {/* Limit Badge */}
                <div className="absolute bottom-2 left-2 right-2 bg-black/80 backdrop-blur-sm rounded px-2 py-1">
                  <div className="flex items-center justify-center gap-1 text-xs font-bold">
                    <span className="text-red-400">{card.oldLimit}</span>
                    <span className="text-white">→</span>
                    <span className={card.limitType === 'decreased' ? 'text-red-400' : 'text-green-400'}>
                      {card.newLimit}
                    </span>
                  </div>
                </div>

                {/* Hover Effect */}
                <div className="absolute inset-0 bg-gradient-to-t from-orange-900/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                  <p className="text-xs text-white font-semibold">คลิกเพื่อดูรายละเอียด</p>
                </div>
              </div>

              {/* Card ID Badge */}
              <div className={`absolute -right-2 -top-2 flex h-8 w-8 items-center justify-center rounded-full border-2 border-background bg-gradient-to-br shadow-lg text-xs font-bold text-white ${
                card.limitType === 'decreased' ? 'from-red-600 to-orange-600' : 'from-green-600 to-emerald-600'
              }`}>
                {card.id}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Card Detail Modal */}
      {selectedCard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl border-2 border-orange-500/40 bg-gradient-to-br from-background via-orange-950/20 to-background shadow-2xl">
            {/* Close Button */}
            <button
              onClick={() => setSelectedCard(null)}
              className="absolute right-4 top-4 z-10 rounded-full bg-orange-900/60 p-2 text-white hover:bg-orange-800 transition"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header */}
            <div className="border-b border-orange-500/20 bg-gradient-to-r from-orange-950/30 via-red-950/30 to-orange-950/30 p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="rounded-lg bg-orange-500/20 p-2">
                  <AlertTriangle className="h-6 w-6 text-orange-500" />
                </div>
                <h2 className="text-2xl font-bold text-white">การ์ดจำกัด</h2>
              </div>
            </div>

            {/* Content */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
              {/* Card Image */}
              <div className="flex items-center justify-center">
                <div className="relative w-full max-w-sm">
                  <div className="relative aspect-[2/3] overflow-hidden rounded-xl border-2 border-orange-500/50 bg-muted/30 shadow-2xl">
                    <Image
                      src={selectedCard.imageUrl}
                      alt={selectedCard.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  {/* Glow Effect */}
                  <div className="absolute inset-0 -z-10 rounded-xl bg-gradient-to-br from-orange-500/30 via-red-500/30 to-orange-500/30 blur-2xl" />
                </div>
              </div>

              {/* Card Details */}
              <div className="flex flex-col gap-4">
                {/* Card Name */}
                <div className="rounded-xl border border-orange-500/30 bg-gradient-to-r from-orange-900/30 via-red-900/30 to-orange-900/30 p-4 backdrop-blur-sm">
                  <h3 className="text-xl font-bold text-white text-center">
                    {selectedCard.name}
                  </h3>
                  <div className="flex items-center justify-center gap-2 mt-2">
                    <span className="text-xs bg-orange-500/20 text-orange-300 px-2 py-1 rounded">
                      {selectedCard.series}
                    </span>
                    <span className="text-xs bg-orange-500/20 text-orange-300 px-2 py-1 rounded">
                      {selectedCard.type}
                    </span>
                  </div>
                </div>

                {/* Limit Change */}
                <div className={`rounded-xl border p-4 backdrop-blur-sm ${
                  selectedCard.limitType === 'decreased' 
                    ? 'border-red-500/30 bg-gradient-to-br from-red-950/50 via-orange-950/50 to-red-950/50' 
                    : 'border-green-500/30 bg-gradient-to-br from-green-950/50 via-emerald-950/50 to-green-950/50'
                }`}>
                  <div className="flex items-center gap-2 mb-3">
                    {selectedCard.limitType === 'decreased' ? (
                      <>
                        <ArrowDown className="h-5 w-5 text-red-400" />
                        <h4 className="font-bold text-red-300">ลดจำนวนที่ใส่ได้</h4>
                      </>
                    ) : (
                      <>
                        <ArrowUp className="h-5 w-5 text-green-400" />
                        <h4 className="font-bold text-green-300">เพิ่มจำนวนที่ใส่ได้</h4>
                      </>
                    )}
                  </div>
                  
                  <div className="flex items-center justify-center gap-3 mb-2">
                    <div className="text-center">
                      <p className="text-xs text-muted-foreground mb-1">เดิม</p>
                      <p className="text-2xl font-bold text-white">{selectedCard.oldLimit}</p>
                      <p className="text-xs text-muted-foreground">ใบ</p>
                    </div>
                    <span className="text-2xl text-white">→</span>
                    <div className="text-center">
                      <p className="text-xs text-muted-foreground mb-1">ใหม่</p>
                      <p className={`text-2xl font-bold ${
                        selectedCard.limitType === 'decreased' ? 'text-red-400' : 'text-green-400'
                      }`}>
                        {selectedCard.newLimit}
                      </p>
                      <p className="text-xs text-muted-foreground">ใบ</p>
                    </div>
                  </div>

                  <p className="text-xs text-muted-foreground mt-2">
                    มีผลตั้งแต่: {new Date(selectedCard.effectiveDate).toLocaleDateString('th-TH', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>

                {/* Reason */}
                <div className="flex-1 rounded-xl border border-orange-500/30 bg-gradient-to-br from-orange-900/20 via-red-900/20 to-orange-900/20 p-4 backdrop-blur-sm">
                  <div className="mb-3 inline-block rounded-full bg-orange-500/80 px-4 py-1 text-sm font-bold text-white shadow-lg">
                    เหตุผล
                  </div>
                  <p className="text-sm leading-relaxed text-gray-200">
                    {selectedCard.reason}
                  </p>
                </div>

                {/* Info */}
                <div className="rounded-xl border border-blue-500/30 bg-blue-950/20 p-4">
                  <p className="text-xs text-blue-200 leading-relaxed">
                    ℹ️ จำนวนที่ใส่ได้นี้รวมทั้ง Main Deck และ Side Deck
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}