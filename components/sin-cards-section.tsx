'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

// 🔮 Mock data (คุณสามารถใส่เกิน 8 ใบได้เลย)
const mockSinCards = [
  { id: 1, name: '[ โคลัมบัส ] 4 > 1 ใน', imageUrl: '/character/1.png', sinDescription: 'ตัวอย่างคำอธิบายของโคลัมบัส...' },
  { id: 2, name: '[ การ์ดตัวอย่าง 2 ] 3 > 1 ใน', imageUrl: '/sin-cards/card-2.png', sinDescription: 'รายละเอียดการ์ด 2' },
  { id: 3, name: '[ การ์ดตัวอย่าง 3 ] 4 > 2 ใน', imageUrl: '/sin-cards/card-3.png', sinDescription: 'รายละเอียดการ์ด 3' },
  { id: 4, name: '[ การ์ดตัวอย่าง 4 ] 4 > 1 ใน', imageUrl: '/sin-cards/card-4.png', sinDescription: 'รายละเอียดการ์ด 4' },
  { id: 5, name: '[ การ์ดตัวอย่าง 5 ] 3 > 1 ใน', imageUrl: '/sin-cards/card-5.png', sinDescription: 'รายละเอียดการ์ด 5' },
  { id: 6, name: '[ การ์ดตัวอย่าง 6 ] 4 > 2 ใน', imageUrl: '/sin-cards/card-6.png', sinDescription: 'รายละเอียดการ์ด 6' },
  { id: 7, name: '[ การ์ดตัวอย่าง 7 ] 4 > 1 ใน', imageUrl: '/sin-cards/card-7.png', sinDescription: 'รายละเอียดการ์ด 7' },
  { id: 8, name: '[ การ์ดตัวอย่าง 8 ] 3 > 1 ใน', imageUrl: '/sin-cards/card-8.png', sinDescription: 'รายละเอียดการ์ด 8' },
  { id: 9, name: '[ การ์ดตัวอย่าง 9 ] 4 > 2 ใน', imageUrl: '/sin-cards/card-9.png', sinDescription: 'รายละเอียดการ์ด 9' },
  { id: 10, name: '[ การ์ดตัวอย่าง 10 ] 4 > 1 ใน', imageUrl: '/sin-cards/card-10.png', sinDescription: 'รายละเอียดการ์ด 10' },
];

export function SinCardsSection() {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [page, setPage] = useState(0);
  const cardsPerPage = 8;

  const totalPages = Math.ceil(mockSinCards.length / cardsPerPage);
  const startIndex = page * cardsPerPage;
  const visibleCards = mockSinCards.slice(startIndex, startIndex + cardsPerPage);
  const currentCard = selectedIndex !== null ? mockSinCards[selectedIndex] : null;

  // 🧭 การเลื่อนไปชุดต่อไป/ก่อนหน้า
  const handlePageNext = () => {
    setPage((prev) => (prev + 1) % totalPages);
  };
  const handlePagePrev = () => {
    setPage((prev) => (prev - 1 + totalPages) % totalPages);
  };

  // 🪩 Modal navigation
  const handleNext = () => {
    if (selectedIndex === null) return;
    setSelectedIndex((prev) =>
      prev === mockSinCards.length - 1 ? 0 : (prev ?? 0) + 1
    );
  };
  const handlePrev = () => {
    if (selectedIndex === null) return;
    setSelectedIndex((prev) =>
      prev === 0 ? mockSinCards.length - 1 : (prev ?? 0) - 1
    );
  };

  // 🎹 เพิ่มเลื่อนด้วยลูกศร
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (selectedIndex === null) return;
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'ArrowLeft') handlePrev();
      if (e.key === 'Escape') setSelectedIndex(null);
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [selectedIndex]);

  return (
    <div
      id="sin-cards-section"
      className="relative w-full overflow-hidden border-t border-border/20"
    >
      {/* 🌈 Background - ปรับให้โปร่งใสและไล่เฉดให้เข้ากับ hero */}
      <div className="absolute inset-0 -z-10">
        {/* Gradient overlay ที่ไล่จากโปร่งใสสู่กึ่งโปร่งใส */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/20 to-background/40" />
        {/* Glow effects ที่ลดความเข้มลง */}
        <div className="absolute left-1/4 top-0 h-96 w-96 animate-pulse rounded-full bg-purple-500/5 blur-3xl" />
        <div className="absolute right-1/4 bottom-0 h-96 w-96 animate-pulse rounded-full bg-cyan-500/5 blur-3xl animation-delay-2000" />
      </div>

      <div className="container mx-auto px-4 py-16 md:py-20">
        {/* Header */}
        <div className="mb-12 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-purple-500/30 bg-purple-500/10 px-6 py-2 backdrop-blur-sm">
            <span className="text-sm font-semibold text-purple-300">
              ประจำเดือนธันวาคม 2568
            </span>
          </div>
          <h2 className="mb-4 text-4xl font-bold md:text-5xl bg-gradient-to-r from-purple-400 via-pink-400 to-red-400 bg-clip-text text-transparent">
            การ์ดบาป
          </h2>
          <p className="text-muted-foreground">
            การ์ดที่ถูกจำกัดการใช้งานเพื่อสร้างความสมดุลในเกม
          </p>
        </div>

        {/* 🃏 Cards Grid */}
        <div className="relative">
          {/* ปุ่มเลื่อนชุดซ้ายขวา */}
          {totalPages > 1 && (
            <>
              <button
                onClick={handlePagePrev}
                className="absolute -left-6 top-1/2 -translate-y-1/2 rounded-full bg-purple-800/50 p-3 text-white hover:bg-purple-700 transition"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                onClick={handlePageNext}
                className="absolute -right-6 top-1/2 -translate-y-1/2 rounded-full bg-purple-800/50 p-3 text-white hover:bg-purple-700 transition"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </>
          )}

          <div className="mb-12 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 transition-all duration-500">
            {visibleCards.map((card) => (
              <div
                key={card.id}
                className="group relative cursor-pointer transition-all duration-300"
                onClick={() =>
                  setSelectedIndex(mockSinCards.findIndex((c) => c.id === card.id))
                }
              >
                <div className="relative aspect-[2/3] overflow-hidden rounded-lg border-2 border-purple-500/30 bg-muted/30 shadow-lg group-hover:border-purple-400 group-hover:shadow-purple-400/30 transition-all duration-300">
                  <Image
                    src={card.imageUrl}
                    alt={card.name}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-purple-900/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <div className="absolute -right-2 -top-2 flex h-8 w-8 items-center justify-center rounded-full border-2 border-purple-500 bg-gradient-to-br from-purple-600 to-pink-600 text-xs font-bold text-white shadow-lg">
                  {card.id}
                </div>
              </div>
            ))}
          </div>

          {/* แสดงเลขหน้า */}
          {totalPages > 1 && (
            <div className="text-center text-sm text-purple-300 font-semibold">
              หน้า {page + 1} / {totalPages}
            </div>
          )}
        </div>
      </div>

      {/* 🔮 Popup Modal */}
      {currentCard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="relative w-full max-w-5xl mx-4 rounded-2xl border border-purple-500/40 bg-gradient-to-br from-background via-purple-950/40 to-background shadow-2xl p-6 md:p-8">
            {/* ❌ ปิด */}
            <button
              onClick={() => setSelectedIndex(null)}
              className="absolute right-4 top-4 rounded-full bg-purple-900/60 p-2 text-white hover:bg-purple-700 transition"
            >
              <X className="w-5 h-5" />
            </button>

            {/* ⬅️➡️ ปุ่มเลื่อนการ์ด */}
            <button
              onClick={handlePrev}
              className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-purple-800/50 p-3 text-white hover:bg-purple-700 transition"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              onClick={handleNext}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-purple-800/50 p-3 text-white hover:bg-purple-700 transition"
            >
              <ChevronRight className="w-6 h-6" />
            </button>

            {/* เนื้อหา */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="flex items-center justify-center">
                <div className="relative w-full max-w-sm">
                  <div className="relative aspect-[2/3] overflow-hidden rounded-xl border-2 border-purple-500/50 bg-muted/30 shadow-2xl">
                    <Image
                      src={currentCard.imageUrl}
                      alt={currentCard.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="absolute inset-0 -z-10 rounded-xl bg-gradient-to-br from-purple-500/30 via-pink-500/30 to-red-500/30 blur-2xl" />
                </div>
              </div>

              <div className="flex flex-col gap-4">
                <div className="rounded-xl border border-purple-500/30 bg-gradient-to-r from-purple-900/50 via-pink-900/50 to-red-900/50 p-6 backdrop-blur-sm">
                  <h3 className="text-center text-2xl font-bold text-white">
                    {currentCard.name}
                  </h3>
                </div>

                <div className="flex-1 rounded-xl border border-red-500/30 bg-gradient-to-br from-red-900/30 via-orange-900/30 to-yellow-900/30 p-6 backdrop-blur-sm">
                  <div className="mb-3 inline-block rounded-full bg-red-500/80 px-4 py-1 text-sm font-bold text-white shadow-lg">
                    ทำบาปอะไร?
                  </div>
                  <div className="max-h-[400px] overflow-y-auto pr-2 text-sm leading-relaxed text-gray-200 whitespace-pre-line">
                    {currentCard.sinDescription}
                  </div>
                </div>
              </div>
            </div>

            {/* แสดง index / total */}
            <div className="text-center text-purple-300 mt-4 text-sm">
              การ์ด {selectedIndex! + 1} / {mockSinCards.length}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}