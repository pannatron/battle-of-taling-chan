'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, Ban, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface BannedCard {
  id: number;
  name: string;
  imageUrl: string;
  reason?: string; // Optional - บางการ์ดอาจไม่มีรายละเอียด
  bannedDate?: string; // Optional
  series?: string; // Optional
  type?: string; // Optional
}

// Mock data สำหรับการ์ดที่โดนแบน
const bannedCards: BannedCard[] = [
  { 
    id: 1, 
    name: '[ โคลัมบัส ] 4 > 1 ใน', 
    imageUrl: '/character/1.png', 
    reason: 'การ์ดนี้มีความแรงเกินไปและทำให้เกมไม่สมดุล ผู้เล่นสามารถชนะได้ง่ายเกินไปเมื่อใช้การ์ดนี้',
    bannedDate: '2024-12-01',
    series: 'SD01',
    type: 'Avatar',
  },
  { 
    id: 2, 
    name: '[ การ์ดตัวอย่าง 2 ] 3 > 1 ใน', 
    imageUrl: '/character/2.png',
    // ไม่มี reason, bannedDate, series, type - จะแสดงเฉพาะรูปขยาย
  },
  { 
    id: 3, 
    name: '[ การ์ดตัวอย่าง 3 ] 4 > 2 ใน', 
    imageUrl: '/character/3.png', 
    reason: 'มีผลกระทบต่อสภาพแวดล้อมของเกมมากเกินไป ทำให้ Meta เอียงไปทางเดียว',
    bannedDate: '2024-10-20',
    series: 'SD02',
    type: 'Avatar',
  },
  { 
    id: 4, 
    name: '[ การ์ดตัวอย่าง 4 ] 4 > 1 ใน', 
    imageUrl: '/character/11.png',
    // ไม่มีรายละเอียด
  },
  { 
    id: 5, 
    name: '[ การ์ดตัวอย่าง 5 ] 3 > 1 ใน', 
    imageUrl: '/character/12.png', 
    reason: 'ให้ Advantage มากเกินไปในรอบแรก ทำให้ฝ่ายที่เล่นก่อนได้เปรียบมากเกินไป',
    bannedDate: '2024-08-15',
    series: 'SD03',
    type: 'Avatar',
  },
];

export default function BannedCardsPage() {
  const [selectedCard, setSelectedCard] = useState<BannedCard | null>(null);

  // Check if card has details
  const hasDetails = (card: BannedCard) => {
    return !!(card.reason || card.bannedDate || card.series || card.type);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header with background */}
      <div className="relative border-b border-border/40 bg-gradient-to-r from-red-950/20 via-rose-950/20 to-red-950/20">
        <div className="absolute inset-0 -z-10">
          <div className="absolute left-0 top-0 h-96 w-96 animate-pulse rounded-full bg-red-500/10 blur-3xl" />
          <div className="absolute right-0 bottom-0 h-96 w-96 animate-pulse rounded-full bg-rose-500/10 blur-3xl animation-delay-2000" />
        </div>

        <div className="container mx-auto px-4 py-8">
          <Link href="/#sin-cards-section">
            <Button variant="ghost" size="sm" className="mb-4 text-red-400 hover:text-red-300">
              <ArrowLeft className="mr-2 h-4 w-4" />
              กลับไปหน้าหลัก
            </Button>
          </Link>

          <div className="flex items-center gap-4 mb-4">
            <div className="rounded-xl bg-red-500/10 p-3 ring-2 ring-red-500/20">
              <Ban className="h-8 w-8 text-red-500" />
            </div>
            <div>
              <h1 className="text-3xl font-bold md:text-4xl">
                <span className="bg-gradient-to-r from-red-400 via-rose-400 to-red-500 bg-clip-text text-transparent">
                  การ์ดต้องห้าม
                </span>
              </h1>
              <p className="text-sm text-muted-foreground mt-1">Banned Cards</p>
            </div>
          </div>

          <div className="rounded-lg border border-red-500/20 bg-red-950/10 p-4">
            <p className="text-sm text-muted-foreground leading-relaxed">
              การ์ดในหมวดนี้ถูกห้ามใช้ในการแข่งขันอย่างสมบูรณ์ 
              เนื่องจากมีผลกระทบต่อความสมดุลของเกมมากเกินไป 
              ผู้เล่นไม่สามารถใส่การ์ดเหล่านี้ใน Deck ได้ทั้งใน Main Deck และ Side Deck
            </p>
          </div>

          <div className="mt-4 flex items-center justify-between">
            <p className="text-sm text-red-400 font-semibold">
              ทั้งหมด {bannedCards.length} ใบ
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
          {bannedCards.map((card) => (
            <div
              key={card.id}
              className="group relative cursor-pointer transition-all duration-300 hover:scale-105"
              onClick={() => setSelectedCard(card)}
            >
              {/* Card Container */}
              <div className="relative aspect-[2/3] overflow-hidden rounded-lg border-2 border-red-500/30 bg-muted/30 shadow-lg group-hover:border-red-400 group-hover:shadow-red-400/30 transition-all duration-300">
                <Image
                  src={card.imageUrl}
                  alt={card.name}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-110"
                />
                
                {/* Banned Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-red-900/60 via-transparent to-transparent" />
                
                {/* Banned Icon */}
                <div className="absolute top-2 right-2 rounded-full bg-red-600 p-1.5 shadow-lg">
                  <Ban className="h-4 w-4 text-white" />
                </div>

                {/* Hover Effect */}
                <div className="absolute inset-0 bg-gradient-to-t from-red-900/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                  <p className="text-xs text-white font-semibold">
                    {hasDetails(card) ? 'คลิกเพื่อดูรายละเอียด' : 'คลิกเพื่อขยายดู'}
                  </p>
                </div>
              </div>

              {/* Card ID Badge */}
              <div className="absolute -right-2 -top-2 flex h-8 w-8 items-center justify-center rounded-full border-2 border-background bg-gradient-to-br from-red-600 to-rose-600 text-xs font-bold text-white shadow-lg">
                {card.id}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Card Detail Modal */}
      {selectedCard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl border-2 border-red-500/40 bg-gradient-to-br from-background via-red-950/20 to-background shadow-2xl">
            {/* Close Button */}
            <button
              onClick={() => setSelectedCard(null)}
              className="absolute right-4 top-4 z-10 rounded-full bg-red-900/60 p-2 text-white hover:bg-red-800 transition"
            >
              <X className="w-5 h-5" />
            </button>

            {/* แสดง Layout ต่างกันตามว่ามีรายละเอียดหรือไม่ */}
            {!hasDetails(selectedCard) ? (
              // ไม่มีรายละเอียด - แสดงเฉพาะรูปขยาย
              <div className="p-8 flex flex-col items-center justify-center min-h-[500px]">
                <div className="relative w-full max-w-md">
                  <div className="relative aspect-[2/3] overflow-hidden rounded-xl border-2 border-red-500/50 bg-muted/30 shadow-2xl">
                    <Image
                      src={selectedCard.imageUrl}
                      alt={selectedCard.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  {/* Glow Effect */}
                  <div className="absolute inset-0 -z-10 rounded-xl bg-gradient-to-br from-red-500/30 via-rose-500/30 to-red-500/30 blur-2xl" />
                </div>

                {/* Card Name */}
                <div className="mt-6 rounded-xl border border-red-500/30 bg-gradient-to-r from-red-900/30 via-rose-900/30 to-red-900/30 p-4 backdrop-blur-sm w-full max-w-md">
                  <h3 className="text-xl font-bold text-white text-center">
                    {selectedCard.name}
                  </h3>
                  <div className="mt-3 flex items-center justify-center">
                    <div className="rounded-full bg-red-500/80 px-4 py-2 text-sm font-bold text-white shadow-lg flex items-center gap-2">
                      <Ban className="h-4 w-4" />
                      <span>ห้ามใช้งาน</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              // มีรายละเอียด - แสดงแบบเต็ม
              <>
                {/* Header */}
                <div className="border-b border-red-500/20 bg-gradient-to-r from-red-950/30 via-rose-950/30 to-red-950/30 p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="rounded-lg bg-red-500/20 p-2">
                      <Ban className="h-6 w-6 text-red-500" />
                    </div>
                    <h2 className="text-2xl font-bold text-white">การ์ดต้องห้าม</h2>
                  </div>
                </div>

                {/* Content */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
                  {/* Card Image */}
                  <div className="flex items-center justify-center">
                    <div className="relative w-full max-w-sm">
                      <div className="relative aspect-[2/3] overflow-hidden rounded-xl border-2 border-red-500/50 bg-muted/30 shadow-2xl">
                        <Image
                          src={selectedCard.imageUrl}
                          alt={selectedCard.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      {/* Glow Effect */}
                      <div className="absolute inset-0 -z-10 rounded-xl bg-gradient-to-br from-red-500/30 via-rose-500/30 to-red-500/30 blur-2xl" />
                    </div>
                  </div>

                  {/* Card Details */}
                  <div className="flex flex-col gap-4">
                    {/* Card Name */}
                    <div className="rounded-xl border border-red-500/30 bg-gradient-to-r from-red-900/30 via-rose-900/30 to-red-900/30 p-4 backdrop-blur-sm">
                      <h3 className="text-xl font-bold text-white text-center">
                        {selectedCard.name}
                      </h3>
                      {(selectedCard.series || selectedCard.type) && (
                        <div className="flex items-center justify-center gap-2 mt-2">
                          {selectedCard.series && (
                            <span className="text-xs bg-red-500/20 text-red-300 px-2 py-1 rounded">
                              {selectedCard.series}
                            </span>
                          )}
                          {selectedCard.type && (
                            <span className="text-xs bg-red-500/20 text-red-300 px-2 py-1 rounded">
                              {selectedCard.type}
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Ban Status */}
                    <div className="rounded-xl border border-red-500/30 bg-gradient-to-br from-red-950/50 via-rose-950/50 to-red-950/50 p-4 backdrop-blur-sm">
                      <div className="flex items-center gap-2 mb-2">
                        <Ban className="h-5 w-5 text-red-400" />
                        <h4 className="font-bold text-red-300">สถานะ</h4>
                      </div>
                      <p className="text-white font-semibold text-lg">ห้ามใช้งาน</p>
                      {selectedCard.bannedDate && (
                        <p className="text-sm text-muted-foreground mt-1">
                          ตั้งแต่: {new Date(selectedCard.bannedDate).toLocaleDateString('th-TH', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </p>
                      )}
                    </div>

                    {/* Reason */}
                    {selectedCard.reason && (
                      <div className="flex-1 rounded-xl border border-red-500/30 bg-gradient-to-br from-red-900/20 via-rose-900/20 to-red-900/20 p-4 backdrop-blur-sm">
                        <div className="mb-3 inline-block rounded-full bg-red-500/80 px-4 py-1 text-sm font-bold text-white shadow-lg">
                          เหตุผลที่ถูกแบน
                        </div>
                        <p className="text-sm leading-relaxed text-gray-200">
                          {selectedCard.reason}
                        </p>
                      </div>
                    )}

                    {/* Warning */}
                    <div className="rounded-xl border border-yellow-500/30 bg-yellow-950/20 p-4">
                      <p className="text-xs text-yellow-200 leading-relaxed">
                        ⚠️ การใช้การ์ดนี้ในการแข่งขันจะถูกตัดสิทธิ์ทันที
                      </p>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}