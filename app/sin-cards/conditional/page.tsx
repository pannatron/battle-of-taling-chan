'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, FileWarning, X, Link2, Zap, Skull, Ghost } from 'lucide-react';
import { Button } from '@/components/ui/button';

// ประเภทของเงื่อนไข
type ConditionType = 'exclusive' | 'choose-one' | 'pair-required' | 'special';

interface RelatedCardInfo {
  name: string;
  imageUrl: string;
}

interface ConditionalCard {
  id: number;
  name: string;
  imageUrl: string;
  conditionType: ConditionType;
  conditionTitle: string;
  conditionDescription: string;
  relatedCards?: string[]; // ชื่อการ์ดที่เกี่ยวข้อง (สำหรับแสดงในข้อความ)
  relatedCardsInfo?: RelatedCardInfo[]; // ข้อมูลรูปภาพการ์ดที่เกี่ยวข้อง (สำหรับแสดงรูป)
  effectiveDate?: string;
  series?: string;
  type?: string;
}

// Mock data สำหรับการ์ดที่มีเงื่อนไข
const conditionalCards: ConditionalCard[] = [
  { 
    id: 1, 
    name: '[ การ์ดตัวอย่าง 1 ] A', 
    imageUrl: '/character/1.png', 
    conditionType: 'exclusive',
    conditionTitle: 'ห้ามใส่ซ้ำกับการ์ดอื่น',
    conditionDescription: 'ไม่สามารถใส่การ์ดนี้และ "การ์ดตัวอย่าง B" ใน Deck เดียวกันได้',
    relatedCards: ['การ์ดตัวอย่าง B', 'การ์ดตัวอย่าง C'],
    relatedCardsInfo: [
      { name: 'การ์ดตัวอย่าง B', imageUrl: '/character/2.png' },
      { name: 'การ์ดตัวอย่าง C', imageUrl: '/character/3.png' },
    ],
    effectiveDate: '2024-12-01',
    series: 'SD01',
    type: 'Avatar',
  },
  { 
    id: 2, 
    name: '[ หน่วง พิมสวยฯ ]', 
    imageUrl: '/character/11.png', 
    conditionType: 'choose-one',
    conditionTitle: 'เลือกใส่ได้เพียง 1 ใบ',
    conditionDescription: 'ด้วยการใช้งานของ 2 ใบนี้ ทำให้ผู้เล่นสามารถกดความสามารถในการจัดการ Avatar ของอีกฝ่ายในแบบที่แทบจะไร้เงื่อนไข และความสามารถประเภทนี้ไม่ควรถูกใช้ได้อย่างน้อยครั้งและใช้ได้ถ้าจ้ายจบค่าใบไป ดังนั้นเราจึงตัดสินใจให้ใช้การ์ดทั้ง 2 อยู่ในสถานะที่ต้อง [เลือกใส่อย่างใดอย่างหนึ่ง]',
    relatedCards: ['หน่วง พิมสวยฯ', 'เลือกจนฯ'],
    relatedCardsInfo: [
      { name: 'หน่วง พิมสวยฯ', imageUrl: '/character/11.png' },
      { name: 'เลือกจนฯ', imageUrl: '/character/12.png' },
    ],
    effectiveDate: '2024-11-20',
    series: 'SD01',
    type: 'Magic',
  },
  { 
    id: 3, 
    name: '[ ครุฑฯ เจ้าสมบัติ ] 4 > 2 ใน', 
    imageUrl: '/character/1.png', 
    conditionType: 'pair-required',
    conditionTitle: 'จำกัดปริมาณเหลือ 2 ใบ',
    conditionDescription: '[ครุฑฯ เจ้าสมบัติ] เป็นการ์ดที่เชื่อมเด็คครุฑและเด็คเจ้าสมบัติด้วยกัน และสร้างความสามารถในรูปแบบของเด็คครุฑเข้าด้วยกันขณะที่เล่นมาเป็นเจ้าสมบัติได้ เนื่องจากครุฑเป็นการ์ดที่อยู่บนแนวเลือดๆ แค่ในการใส่มือเข้ารอบจริงๆ แค่มี life card 1 ใบ แล้วก็มักตัวนี้อยู่ใน magic zone พอใส่หลายใบ นั้นหมายความว่าเมื่อเล่นเด็คครุฑไปด้วยอีกครั้ง มันจึงตอลดจำนวนเป็น 2 และ 2 GEMS ด้วยกัน กำไหครุฑฯสามารถตัดเล่นได้อย่างง่ายดาย',
    effectiveDate: '2024-11-15',
    series: 'SD02',
    type: 'Avatar',
  },
  { 
    id: 4, 
    name: '[ การ์ดตัวอย่าง 4 ] Red', 
    imageUrl: '/character/2.png', 
    conditionType: 'exclusive',
    conditionTitle: 'ห้ามใส่กับกลุ่มสี',
    conditionDescription: 'ไม่สามารถใส่การ์ดนี้ร่วมกับการ์ดสีน้ำเงินใน Deck เดียวกันได้',
    relatedCards: ['การ์ดสีน้ำเงินทั้งหมด'],
    effectiveDate: '2024-10-30',
    series: 'SD02',
    type: 'Magic',
  },
  { 
    id: 5, 
    name: '[ การ์ดตัวอย่าง 5 ] Special', 
    imageUrl: '/character/3.png', 
    conditionType: 'special',
    conditionTitle: 'เงื่อนไขพิเศษ',
    conditionDescription: 'การ์ดนี้สามารถใส่ได้สูงสุด 2 ใบ แต่ถ้าใส่ 2 ใบ จะไม่สามารถใส่ Life Card ประเภท Magic ได้',
    effectiveDate: '2024-10-15',
    series: 'SD03',
    type: 'Avatar',
  },
];

const getConditionIcon = (type: ConditionType) => {
  switch (type) {
    case 'exclusive':
      return X;
    case 'choose-one':
      return Zap;
    case 'pair-required':
      return Link2;
    case 'special':
      return FileWarning;
    default:
      return FileWarning;
  }
};

const getConditionColor = (type: ConditionType) => {
  switch (type) {
    case 'exclusive':
      return {
        bg: 'bg-red-600/90',
        border: 'border-red-800',
        text: 'text-red-400',
      };
    case 'choose-one':
      return {
        bg: 'bg-purple-600/90',
        border: 'border-purple-800',
        text: 'text-purple-400',
      };
    case 'pair-required':
      return {
        bg: 'bg-blue-600/90',
        border: 'border-blue-800',
        text: 'text-blue-400',
      };
    case 'special':
      return {
        bg: 'bg-amber-600/90',
        border: 'border-amber-800',
        text: 'text-amber-400',
      };
    default:
      return {
        bg: 'bg-gray-600/90',
        border: 'border-gray-800',
        text: 'text-gray-400',
      };
  }
};

export default function ConditionalCardsPage() {
  const [selectedCard, setSelectedCard] = useState<ConditionalCard | null>(null);
  const [filterType, setFilterType] = useState<'all' | ConditionType>('all');

  const filteredCards = filterType === 'all' 
    ? conditionalCards 
    : conditionalCards.filter(card => card.conditionType === filterType);

  const hasDetails = (card: ConditionalCard) => {
    return !!(card.conditionDescription || card.effectiveDate || card.series || card.type);
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
                บาปมีเงื่อนไข
              </h1>
              
              {/* Blood Drip Effect */}
              <svg className="absolute -bottom-4 left-0 w-full h-12 opacity-80" viewBox="0 0 400 50" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="bloodGradientCondition" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" style={{ stopColor: '#dc2626', stopOpacity: 1 }} />
                    <stop offset="100%" style={{ stopColor: '#7f1d1d', stopOpacity: 0.8 }} />
                  </linearGradient>
                </defs>
                <path d="M 100 0 Q 100 12, 98 25 Q 96 38, 100 50 L 100 50 Q 104 38, 102 25 Q 100 12, 100 0 Z" fill="url(#bloodGradientCondition)" opacity="0.9" />
                <path d="M 200 2 Q 200 15, 198 30 Q 196 42, 200 52 L 200 52 Q 204 42, 202 30 Q 200 15, 200 2 Z" fill="url(#bloodGradientCondition)" opacity="0.85" />
                <path d="M 300 0 Q 300 13, 298 27 Q 296 40, 300 48 L 300 48 Q 304 40, 302 27 Q 300 13, 300 0 Z" fill="url(#bloodGradientCondition)" opacity="0.8" />
              </svg>
            </div>

            <p className="font-mn-lon text-sm text-red-300/80 tracking-wider uppercase">Conditional Cards</p>
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
                  การ์ดในหมวดนี้มีเงื่อนไขพิเศษในการใช้งาน เช่น ห้ามใส่ซ้ำกับการ์ดบางใบ ต้องเลือกใบใดใบหนึ่ง หรือต้องมีการ์ดคู่ 
                  กรุณาอ่านเงื่อนไขอย่างละเอียดก่อนสร้าง Deck
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
              ทั้งหมด ({conditionalCards.length})
            </Button>
            <Button
              size="sm"
              variant={filterType === 'exclusive' ? 'default' : 'outline'}
              onClick={() => setFilterType('exclusive')}
              className="font-mn-lon"
            >
              <X className="mr-1 h-3 w-3" />
              ห้ามใส่ซ้ำ
            </Button>
            <Button
              size="sm"
              variant={filterType === 'choose-one' ? 'default' : 'outline'}
              onClick={() => setFilterType('choose-one')}
              className="font-mn-lon"
            >
              <Zap className="mr-1 h-3 w-3" />
              เลือก 1 ใบ
            </Button>
            <Button
              size="sm"
              variant={filterType === 'pair-required' ? 'default' : 'outline'}
              onClick={() => setFilterType('pair-required')}
              className="font-mn-lon"
            >
              <Link2 className="mr-1 h-3 w-3" />
              จำกัดปริมาณ
            </Button>
            <Button
              size="sm"
              variant={filterType === 'special' ? 'default' : 'outline'}
              onClick={() => setFilterType('special')}
              className="font-mn-lon"
            >
              <FileWarning className="mr-1 h-3 w-3" />
              พิเศษ
            </Button>
          </div>
        </div>
      </div>

      {/* Cards Grid - Wooden Board Cards */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {filteredCards.map((card, index) => {
            const Icon = getConditionIcon(card.conditionType);
            const colors = getConditionColor(card.conditionType);
            
            return (
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
                      
                      {/* Condition Icon */}
                      <div className={`absolute top-2 right-2 rounded-full ${colors.bg} p-1.5 shadow-lg border ${colors.border}`}>
                        <Icon className="h-3 w-3 text-white" />
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
                <div className="absolute -right-2 -top-2 z-20 flex h-7 w-7 items-center justify-center rounded-full border-2 border-red-950 bg-gradient-to-br from-red-600 to-red-800 text-xs font-bold text-white shadow-lg">
                  {card.id}
                </div>

                {/* Shadow below board */}
                <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-3/4 h-3 bg-black/60 blur-xl rounded-full" />
              </div>
            );
          })}
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
                    <div className="mt-4 flex items-center justify-center">
                      <div 
                        className="rounded-full px-6 py-2.5 text-sm font-bold text-white shadow-lg flex items-center gap-2"
                        style={{
                          background: 'linear-gradient(135deg, #7f1d1d 0%, #991b1b 50%, #7f1d1d 100%)',
                          border: '3px solid #450a0a',
                          boxShadow: `0 0 20px rgba(220, 38, 38, 0.4)`
                        }}
                      >
                        <FileWarning className="h-4 w-4" />
                        <span className="font-mn-lon">{selectedCard.conditionTitle}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              // มีรายละเอียด - แสดงแบบเต็ม
              <div className="p-8 md:p-12">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Left: Card Images */}
                  <div className="flex flex-col items-center justify-center">
                    {selectedCard.relatedCardsInfo && selectedCard.relatedCardsInfo.length > 0 ? (
                      <div className="space-y-4 w-full">
                        {selectedCard.relatedCardsInfo.map((relatedCard, idx) => (
                          <div key={idx} className="relative w-full max-w-xs mx-auto">
                            <div className="relative aspect-[2/3] overflow-hidden rounded-xl border-4 border-red-900/60 shadow-2xl">
                              <Image
                                src={relatedCard.imageUrl}
                                alt={relatedCard.name}
                                fill
                                className="object-cover"
                              />
                            </div>
                            <p className="font-mn-lon mt-2 text-sm font-semibold text-red-200 text-center">
                              {relatedCard.name}
                            </p>
                          </div>
                        ))}
                      </div>
                    ) : (
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
                    )}
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

                    {/* Condition Badge */}
                    <div className="flex justify-center">
                      <div 
                        className="rounded-full px-6 py-2.5 text-sm font-bold text-white shadow-lg flex items-center gap-2"
                        style={{
                          background: 'linear-gradient(135deg, #7f1d1d 0%, #991b1b 50%, #7f1d1d 100%)',
                          border: '3px solid #450a0a',
                          boxShadow: `0 0 20px rgba(220, 38, 38, 0.4)`
                        }}
                      >
                        <FileWarning className="h-4 w-4" />
                        <span className="font-mn-lon">{selectedCard.conditionTitle}</span>
                      </div>
                    </div>

                    {/* Description */}
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
                        <p className="font-mn-lon text-sm leading-relaxed text-red-200/90 whitespace-pre-line mb-4">
                          {selectedCard.conditionDescription}
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

                        {/* Related Cards */}
                        {selectedCard.relatedCards && selectedCard.relatedCards.length > 0 && (
                          <div className="mt-6 pt-4 border-t border-red-900/30">
                            <p className="font-mn-lon text-xs font-semibold text-red-300 mb-2">การ์ดที่เกี่ยวข้อง:</p>
                            <div className="flex flex-wrap gap-2">
                              {selectedCard.relatedCards.map((relatedCard, index) => (
                                <span 
                                  key={index} 
                                  className="font-mn-lon text-xs px-3 py-1 rounded-full text-red-200"
                                  style={{
                                    background: 'linear-gradient(135deg, #7f1d1d 0%, #991b1b 100%)',
                                    border: '1px solid #450a0a'
                                  }}
                                >
                                  {relatedCard}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

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
                          ⚠️ การไม่ปฏิบัติตามเงื่อนไขอาจทำให้ Deck ของคุณไม่ถูกต้องตามกฎ
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