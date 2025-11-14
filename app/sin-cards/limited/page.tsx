'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, AlertTriangle, X, Skull, Ghost, ArrowUp, ArrowDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getAllCards } from '@/lib/api';
import { Card } from '@/types/card';

interface LimitedCard {
  id: string;
  name: string;
  imageUrl: string;
  limitType: 'decreased' | 'increased';
  oldLimit: number;
  newLimit: number;
  reason?: string;
  effectiveDate?: string;
  series?: string;
  type?: string;
  print?: string;
}

export default function LimitedCardsPage() {
  const [limitedCards, setLimitedCards] = useState<LimitedCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCard, setSelectedCard] = useState<LimitedCard | null>(null);
  const [filterType, setFilterType] = useState<'all' | 'decreased' | 'increased'>('all');

  useEffect(() => {
    async function fetchLimitedCards() {
      try {
        setLoading(true);
        // Get all cards and filter for those with sinCardLimit (regardless of status)
        const allCards = await getAllCards();
        const cards = allCards.filter(card => card.sinCardLimit !== undefined);
        
        // Define rarity priority (lower number = higher priority to show)
        const rarityPriority: { [key: string]: number } = {
          'C': 1,
          'UC': 2,
          'R': 3,
          'SR': 4,
          'UR': 5,
          'SEC': 10,
          'PR': 11,
          'PROMO': 12,
          'SP': 13,
        };
        
        // Group cards by name
        const cardsByName: { [key: string]: Card[] } = {};
        cards.forEach((card: Card) => {
          const name = card.name || '';
          if (!cardsByName[name]) {
            cardsByName[name] = [];
          }
          cardsByName[name].push(card);
        });
        
        // For each name, select the card with highest priority (lowest priority number)
        const selectedCards: Card[] = [];
        Object.values(cardsByName).forEach((cardsWithSameName) => {
          const sorted = cardsWithSameName.sort((a, b) => {
            const priorityA = rarityPriority[a.rare || ''] || 999;
            const priorityB = rarityPriority[b.rare || ''] || 999;
            return priorityA - priorityB;
          });
          selectedCards.push(sorted[0]);
        });
        
        const transformedCards: LimitedCard[] = selectedCards.map((card: Card) => {
          const oldLimit = card.sinCardPreviousLimit || 4;
          const newLimit = card.sinCardLimit || 4;
          const limitType: 'decreased' | 'increased' = newLimit < oldLimit ? 'decreased' : 'increased';
          
          return {
            id: card._id || '',
            name: card.name || '',
            imageUrl: card.imageUrl || '/placeholder.png',
            limitType,
            oldLimit,
            newLimit,
            reason: card.sinCardReason,
            effectiveDate: card.sinCardDate ? new Date(card.sinCardDate).toISOString() : undefined,
            series: card.series,
            type: card.type,
            print: card.print,
          };
        });
        
        setLimitedCards(transformedCards);
      } catch (error) {
        console.error('Error fetching limited cards:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchLimitedCards();
  }, []);

  const filteredCards = filterType === 'all' 
    ? limitedCards 
    : limitedCards.filter(card => card.limitType === filterType);

  const hasDetails = (card: LimitedCard) => {
    return !!(card.reason || card.effectiveDate || card.series || card.type);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-center">
          <Skull className="h-16 w-16 text-red-600 animate-pulse mx-auto mb-4" />
          <p className="font-mn-lon text-red-400 text-xl">กำลังโหลดการ์ดบาป...</p>
        </div>
      </div>
    );
  }

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

              {/* Skull Warning Icon */}

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
                    อัพเดทล่าสุด: {new Date().toLocaleDateString('th-TH', { year: 'numeric', month: 'long' })}
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
        {filteredCards.length === 0 ? (
          <div className="text-center py-16">
            <Ghost className="h-24 w-24 text-red-600/50 mx-auto mb-4 animate-pulse" />
            <p className="font-mn-lon text-red-400 text-xl">ไม่พบการ์ดบาปในหมวดนี้</p>
            <p className="font-mn-lon text-red-300/60 text-sm mt-2">ลองเปลี่ยนตัวกรองหรือกลับมาดูใหม่ภายหลัง</p>
          </div>
        ) : (
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

              {/* Card Print Badge */}
              {card.print && (
                <div className="absolute -right-2 -top-2 z-20 flex h-7 w-auto px-2 items-center justify-center rounded-full border-2 border-red-950 text-xs font-bold text-white shadow-lg bg-gradient-to-br from-red-600 to-red-800">
                  {card.print}
                </div>
              )}

              {/* Shadow below board */}
              <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-3/4 h-3 bg-black/60 blur-xl rounded-full" />
            </div>
          ))}
          </div>
        )}
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
              // ไม่มีรายละเอียด - แสดงเฉพาะรูปขยาง
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
                    {/* Banned Overlay */}
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
              <>
                {/* Header with Skull */}
                <div 
                  className="relative border-b-4 border-red-900/40 p-6"
                  style={{
                    background: `linear-gradient(to right, rgba(127, 29, 29, 0.3), rgba(153, 27, 27, 0.3), rgba(127, 29, 29, 0.3))`
                  }}
                >
                  <div className="absolute top-0 right-8 opacity-10">
                    <Skull className="h-24 w-24 text-red-600" />
                  </div>
                  
                  <div className="flex items-center gap-4 relative z-10">
                    <div 
                      className="rounded-lg p-3 shadow-xl"
                      style={{
                        background: 'linear-gradient(135deg, #7f1d1d 0%, #991b1b 100%)',
                        border: '2px solid #450a0a'
                      }}
                    >
                      <AlertTriangle className="h-8 w-8 text-red-200" />
                    </div>
                    <h2 className="font-mn-lon text-3xl font-black text-blood-small tracking-wide">
                      บาปจำกัด
                    </h2>
                  </div>
                </div>

                {/* Content */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-8">
                  {/* Card Image */}
                  <div className="flex items-start justify-center">
                    <div className="relative w-full max-w-sm">
                      <div className="relative aspect-[2/3] overflow-hidden rounded-xl border-4 border-red-900/60 shadow-2xl">
                        <Image
                          src={selectedCard.imageUrl}
                          alt={selectedCard.name}
                          fill
                          className="object-cover"
                        />
                        {/* Dark overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-red-900/40 via-transparent to-transparent" />
                      </div>
                      {/* Glow Effect */}
                      <div className="absolute inset-0 -z-10 rounded-xl bg-gradient-to-br from-red-600/30 via-red-500/20 to-red-600/30 blur-2xl" />
                    </div>
                  </div>

                  {/* Card Details */}
                  <div className="flex flex-col gap-4">
                    {/* Card Name */}
                    <div 
                      className="rounded-xl shadow-xl overflow-hidden"
                      style={{
                        background: `linear-gradient(135deg, #2d1810 0%, #3e2723 50%, #2d1810 100%)`,
                        border: '3px solid #1c0a00',
                        boxShadow: `inset 0 2px 4px rgba(0,0,0,0.6), 0 4px 12px rgba(220, 38, 38, 0.2)`
                      }}
                    >
                      <div className="p-4">
                        <h3 className="font-mn-lon text-xl font-black text-blood-small text-center tracking-wide">
                          {selectedCard.name}
                        </h3>
                        {(selectedCard.series || selectedCard.type) && (
                          <div className="flex items-center justify-center gap-2 mt-3">
                            {selectedCard.series && (
                              <span className="font-mn-lon text-xs bg-red-900/50 text-red-300 px-3 py-1 rounded-full border border-red-800/50">
                                {selectedCard.series}
                              </span>
                            )}
                            {selectedCard.type && (
                              <span className="font-mn-lon text-xs bg-red-900/50 text-red-300 px-3 py-1 rounded-full border border-red-800/50">
                                {selectedCard.type}
                              </span>
                            )}
                          </div>
                        )}
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
                        className="flex-1 rounded-xl shadow-xl overflow-hidden"
                        style={{
                          background: selectedCard.limitType === 'increased' 
                            ? `linear-gradient(135deg, #14532d 0%, #166534 50%, #14532d 100%)`
                            : `linear-gradient(135deg, #2d1810 0%, #3e2723 50%, #2d1810 100%)`,
                          border: '3px solid #1c0a00',
                          boxShadow: selectedCard.limitType === 'increased'
                            ? `inset 0 2px 4px rgba(0,0,0,0.6), 0 4px 12px rgba(34, 197, 94, 0.2)`
                            : `inset 0 2px 4px rgba(0,0,0,0.6), 0 4px 12px rgba(220, 38, 38, 0.2)`
                        }}
                      >
                        <div className="p-5">
                          <div 
                            className="inline-block rounded-full px-5 py-2 text-sm font-bold text-white shadow-lg mb-4"
                            style={{
                              background: selectedCard.limitType === 'increased'
                                ? 'linear-gradient(135deg, #15803d 0%, #16a34a 50%, #15803d 100%)'
                                : 'linear-gradient(135deg, #7f1d1d 0%, #991b1b 50%, #7f1d1d 100%)',
                              border: selectedCard.limitType === 'increased'
                                ? '2px solid #14532d'
                                : '2px solid #450a0a'
                            }}
                          >
                            <span className="font-mn-lon">
                              {selectedCard.limitType === 'increased' ? 'ชดใช้กรรม' : 'ทำบาปอะไร?'}
                            </span>
                          </div>
                          <p className={`font-mn-lon text-sm leading-relaxed ${
                            selectedCard.limitType === 'increased' ? 'text-green-200/90' : 'text-red-200/90'
                          }`}>
                            {selectedCard.reason}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Warning */}
                    <div 
                      className="rounded-xl shadow-xl overflow-hidden"
                      style={{
                        background: `linear-gradient(135deg, #451a03 0%, #713f12 50%, #451a03 100%)`,
                        border: '3px solid #1c0a00',
                        boxShadow: `inset 0 2px 4px rgba(0,0,0,0.6), 0 4px 12px rgba(234, 179, 8, 0.2)`
                      }}
                    >
                      <div className="p-4">
                        <p className="font-mn-lon text-xs text-yellow-200 leading-relaxed flex items-center gap-2">
                          <span className="text-lg">⚠️</span>
                          <span>การใส่การ์ดเกินจำนวนที่กำหนดอาจทำให้ Deck ของคุณไม่ถูกต้องตามกฎ</span>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Blood splatter decoration */}
                <div 
                  className="absolute bottom-4 right-8 w-24 h-24 opacity-10 pointer-events-none"
                  style={{
                    background: `radial-gradient(circle, rgba(220, 38, 38, 0.8) 0%, rgba(220, 38, 38, 0.4) 40%, transparent 70%)`
                  }}
                />
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
