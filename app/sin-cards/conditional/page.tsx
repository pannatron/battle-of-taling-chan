'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, FileWarning, X, Link2, Users, Zap } from 'lucide-react';
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
        border: 'border-red-500/30',
        bg: 'bg-red-500/10',
        text: 'text-red-400',
        gradient: 'from-red-600 to-rose-600',
      };
    case 'choose-one':
      return {
        border: 'border-purple-500/30',
        bg: 'bg-purple-500/10',
        text: 'text-purple-400',
        gradient: 'from-purple-600 to-pink-600',
      };
    case 'pair-required':
      return {
        border: 'border-blue-500/30',
        bg: 'bg-blue-500/10',
        text: 'text-blue-400',
        gradient: 'from-blue-600 to-cyan-600',
      };
    case 'special':
      return {
        border: 'border-amber-500/30',
        bg: 'bg-amber-500/10',
        text: 'text-amber-400',
        gradient: 'from-amber-600 to-orange-600',
      };
    default:
      return {
        border: 'border-gray-500/30',
        bg: 'bg-gray-500/10',
        text: 'text-gray-400',
        gradient: 'from-gray-600 to-slate-600',
      };
  }
};

export default function ConditionalCardsPage() {
  const [selectedCard, setSelectedCard] = useState<ConditionalCard | null>(null);
  const [filterType, setFilterType] = useState<'all' | ConditionType>('all');

  const filteredCards = filterType === 'all' 
    ? conditionalCards 
    : conditionalCards.filter(card => card.conditionType === filterType);

  return (
    <div className="min-h-screen bg-background">
      {/* Header with background */}
      <div className="relative border-b border-border/40 bg-gradient-to-r from-amber-950/20 via-orange-950/20 to-red-950/20">
        <div className="absolute inset-0 -z-10">
          <div className="absolute left-0 top-0 h-96 w-96 animate-pulse rounded-full bg-amber-500/10 blur-3xl" />
          <div className="absolute right-0 bottom-0 h-96 w-96 animate-pulse rounded-full bg-orange-500/10 blur-3xl animation-delay-2000" />
        </div>

        <div className="container mx-auto px-4 py-8">
          <Link href="/#sin-cards-section">
            <Button variant="ghost" size="sm" className="mb-4 text-amber-400 hover:text-amber-300">
              <ArrowLeft className="mr-2 h-4 w-4" />
              กลับไปหน้าหลัก
            </Button>
          </Link>

          <div className="flex items-center gap-4 mb-4">
            <div className="rounded-xl bg-amber-500/10 p-3 ring-2 ring-amber-500/20">
              <FileWarning className="h-8 w-8 text-amber-500" />
            </div>
            <div>
              <h1 className="text-3xl font-bold md:text-4xl">
                <span className="bg-gradient-to-r from-amber-400 via-orange-400 to-red-400 bg-clip-text text-transparent">
                  การ์ดมีเงื่อนไข
                </span>
              </h1>
              <p className="text-sm text-muted-foreground mt-1">Conditional Cards</p>
            </div>
          </div>

          <div className="rounded-lg border border-amber-500/20 bg-amber-950/10 p-4 mb-4">
            <p className="text-sm text-muted-foreground leading-relaxed">
              การ์ดในหมวดนี้มีเงื่อนไขพิเศษในการใช้งาน 
              เช่น ห้ามใส่ซ้ำกับการ์ดบางใบ ต้องเลือกใบใดใบหนึ่ง หรือต้องมีการ์ดคู่ 
              กรุณาอ่านเงื่อนไขอย่างละเอียดก่อนสร้าง Deck
            </p>
          </div>

          {/* Filter Buttons */}
          <div className="flex flex-wrap gap-2 mb-4">
            <Button
              size="sm"
              variant={filterType === 'all' ? 'default' : 'outline'}
              onClick={() => setFilterType('all')}
            >
              ทั้งหมด ({conditionalCards.length})
            </Button>
            <Button
              size="sm"
              variant={filterType === 'exclusive' ? 'default' : 'outline'}
              onClick={() => setFilterType('exclusive')}
              className="gap-2"
            >
              <X className="h-4 w-4" />
              ห้ามใส่ซ้ำ ({conditionalCards.filter(c => c.conditionType === 'exclusive').length})
            </Button>
            <Button
              size="sm"
              variant={filterType === 'choose-one' ? 'default' : 'outline'}
              onClick={() => setFilterType('choose-one')}
              className="gap-2"
            >
              <Zap className="h-4 w-4" />
              เลือก 1 ใบ ({conditionalCards.filter(c => c.conditionType === 'choose-one').length})
            </Button>
            <Button
              size="sm"
              variant={filterType === 'pair-required' ? 'default' : 'outline'}
              onClick={() => setFilterType('pair-required')}
              className="gap-2"
            >
              <Link2 className="h-4 w-4" />
              ต้องมีคู่ ({conditionalCards.filter(c => c.conditionType === 'pair-required').length})
            </Button>
            <Button
              size="sm"
              variant={filterType === 'special' ? 'default' : 'outline'}
              onClick={() => setFilterType('special')}
              className="gap-2"
            >
              <FileWarning className="h-4 w-4" />
              พิเศษ ({conditionalCards.filter(c => c.conditionType === 'special').length})
            </Button>
          </div>

          <div className="flex items-center justify-between">
            <p className="text-sm text-amber-400 font-semibold">
              แสดง {filteredCards.length} จาก {conditionalCards.length} ใบ
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
          {filteredCards.map((card) => {
            const Icon = getConditionIcon(card.conditionType);
            const colors = getConditionColor(card.conditionType);
            
            return (
              <div
                key={card.id}
                className="group relative cursor-pointer transition-all duration-300 hover:scale-105"
                onClick={() => setSelectedCard(card)}
              >
                {/* Card Container */}
                <div className={`relative aspect-[2/3] overflow-hidden rounded-lg border-2 bg-muted/30 shadow-lg transition-all duration-300 ${colors.border}`}>
                  <Image
                    src={card.imageUrl}
                    alt={card.name}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                  
                  {/* Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-amber-900/60 via-transparent to-transparent" />
                  
                  {/* Condition Icon */}
                  <div className={`absolute top-2 right-2 rounded-full p-1.5 shadow-lg bg-gradient-to-br ${colors.gradient}`}>
                    <Icon className="h-4 w-4 text-white" />
                  </div>

                  {/* Hover Effect */}
                  <div className="absolute inset-0 bg-gradient-to-t from-amber-900/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                    <p className="text-xs text-white font-semibold">คลิกเพื่อดูรายละเอียด</p>
                  </div>
                </div>

                {/* Card ID Badge */}
                <div className={`absolute -right-2 -top-2 flex h-8 w-8 items-center justify-center rounded-full border-2 border-background bg-gradient-to-br shadow-lg text-xs font-bold text-white ${colors.gradient}`}>
                  {card.id}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Card Detail Modal */}
      {selectedCard && (() => {
        const Icon = getConditionIcon(selectedCard.conditionType);
        const colors = getConditionColor(selectedCard.conditionType);
        const hasRelatedCardsImages = selectedCard.relatedCardsInfo && selectedCard.relatedCardsInfo.length > 0;
        // รวมการ์ดหลักกับการ์ดที่เกี่ยวข้องเข้าด้วยกัน
        const allCards = hasRelatedCardsImages 
          ? [{ name: selectedCard.name, imageUrl: selectedCard.imageUrl }, ...selectedCard.relatedCardsInfo!]
          : [{ name: selectedCard.name, imageUrl: selectedCard.imageUrl }];
        
        // ถ้ามีการ์ด 1 ใบ = แสดงแบบซ้าย-ขวา
        // ถ้ามากกว่า 1 ใบ = แสดงแบบบน-ล่าง
        const isMultipleCards = allCards.length > 1;
        
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className={`relative w-full ${isMultipleCards ? 'max-w-6xl' : 'max-w-5xl'} max-h-[90vh] overflow-y-auto rounded-2xl border-2 bg-gradient-to-br from-background via-amber-950/20 to-background shadow-2xl ${colors.border}`}>
              {/* Close Button */}
              <button
                onClick={() => setSelectedCard(null)}
                className="absolute right-4 top-4 z-10 rounded-full bg-amber-900/60 p-2 text-white hover:bg-amber-800 transition"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Header */}
              <div className={`border-b p-6 bg-gradient-to-r from-amber-950/30 via-orange-950/30 to-amber-950/30 ${colors.border}`}>
                <div className="flex items-center gap-3">
                  <div className={`rounded-lg p-2 ${colors.bg}`}>
                    <Icon className={`h-6 w-6 ${colors.text}`} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">การ์ดมีเงื่อนไข</h2>
                    <p className={`text-sm ${colors.text} font-semibold mt-1`}>{selectedCard.conditionTitle}</p>
                  </div>
                </div>
              </div>

              {/* Content - เปลี่ยน layout ตามจำนวนการ์ด */}
              {!isMultipleCards ? (
                // การ์ด 1 ใบ: แสดงแบบซ้าย-ขวา
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
                  {/* ซ้าย: รูปการ์ด */}
                  <div className="flex items-center justify-center">
                    <div className="relative w-full max-w-sm">
                      <div className={`relative aspect-[2/3] overflow-hidden rounded-xl border-2 bg-muted/30 shadow-2xl ${colors.border}`}>
                        <Image
                          src={selectedCard.imageUrl}
                          alt={selectedCard.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      {/* Glow Effect */}
                      <div className={`absolute inset-0 -z-10 rounded-xl bg-gradient-to-br ${colors.gradient} opacity-30 blur-2xl`} />
                    </div>
                  </div>

                  {/* ขวา: รายละเอียด */}
                  <div className="flex flex-col gap-4">
                    {/* Card Name */}
                    <div className={`rounded-xl border p-4 backdrop-blur-sm ${colors.border} bg-gradient-to-r from-amber-900/30 via-orange-900/30 to-amber-900/30`}>
                      <h3 className="text-xl font-bold text-white text-center">
                        {selectedCard.name}
                      </h3>
                    </div>

                    {/* Condition Description */}
                    <div className={`flex-1 rounded-xl border p-4 backdrop-blur-sm ${colors.border} bg-gradient-to-br from-amber-900/20 via-orange-900/20 to-amber-900/20`}>
                      <div className="mb-3 inline-block rounded-full bg-amber-500/80 px-4 py-1 text-sm font-bold text-white shadow-lg">
                        ทำบาปอะไร?
                      </div>
                      <p className="text-sm leading-relaxed text-gray-200 whitespace-pre-line mb-4">
                        {selectedCard.conditionDescription}
                      </p>
                      
                      {/* Additional Info */}
                      <div className="mt-4 pt-4 border-t border-amber-500/20 grid grid-cols-2 gap-3">
                        {selectedCard.series && (
                          <div>
                            <p className="text-xs text-amber-400 mb-1">Series</p>
                            <p className="text-sm text-white font-semibold">{selectedCard.series}</p>
                          </div>
                        )}
                        {selectedCard.type && (
                          <div>
                            <p className="text-xs text-amber-400 mb-1">Type</p>
                            <p className="text-sm text-white font-semibold">{selectedCard.type}</p>
                          </div>
                        )}
                        {selectedCard.effectiveDate && (
                          <div className="col-span-2">
                            <p className="text-xs text-amber-400 mb-1">มีผลตั้งแต่</p>
                            <p className="text-sm text-white font-semibold">
                              {new Date(selectedCard.effectiveDate).toLocaleDateString('th-TH', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })}
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Related Cards List */}
                      {selectedCard.relatedCards && selectedCard.relatedCards.length > 0 && (
                        <div className="mt-4 pt-4 border-t border-amber-500/20">
                          <p className="text-xs font-semibold text-amber-300 mb-2">การ์ดที่เกี่ยวข้อง:</p>
                          <div className="flex flex-wrap gap-2">
                            {selectedCard.relatedCards.map((relatedCard, index) => (
                              <span 
                                key={index} 
                                className="text-xs bg-amber-500/20 text-amber-200 px-3 py-1 rounded-full border border-amber-500/30"
                              >
                                {relatedCard}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Warning */}
                    <div className="rounded-xl border border-yellow-500/30 bg-yellow-950/20 p-3">
                      <p className="text-xs text-yellow-200 leading-relaxed">
                        ⚠️ การไม่ปฏิบัติตามเงื่อนไขอาจทำให้ Deck ของคุณไม่ถูกต้องตามกฎ
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                // มากกว่า 1 ใบ: แสดงแบบบน-ล่าง
                <div className="p-6">
                  {/* บน: การ์ดที่เกี่ยวข้องทั้งหมด */}
                  <div className="mb-6">
                    <div className="flex items-center gap-2 mb-4 justify-center">
                      <Link2 className={`h-5 w-5 ${colors.text}`} />
                      <h3 className="text-lg font-bold text-white">การ์ดที่เกี่ยวข้อง</h3>
                    </div>
                    
                    <div className="flex flex-wrap justify-center gap-4">
                      {allCards.map((card, index) => (
                        <div key={index} className="flex flex-col items-center">
                          <div className="relative w-48">
                            <div className={`relative aspect-[2/3] overflow-hidden rounded-xl border-2 bg-muted/30 shadow-xl ${colors.border}`}>
                              <Image
                                src={card.imageUrl}
                                alt={card.name}
                                fill
                                className="object-cover"
                              />
                            </div>
                            {/* Glow Effect */}
                            <div className={`absolute inset-0 -z-10 rounded-xl bg-gradient-to-br ${colors.gradient} opacity-20 blur-xl`} />
                          </div>
                          <p className="mt-2 text-sm font-semibold text-white text-center">
                            {card.name}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* ล่าง: รายละเอียด */}
                  <div className="grid grid-cols-1 gap-6">
                    {/* Condition Description */}
                    <div className={`rounded-xl border p-6 backdrop-blur-sm ${colors.border} bg-gradient-to-br from-amber-900/20 via-orange-900/20 to-amber-900/20`}>
                      <div className="mb-4 inline-block rounded-full bg-amber-500/80 px-4 py-2 text-sm font-bold text-white shadow-lg">
                        ทำบาปอะไร?
                      </div>
                      <p className="text-sm leading-relaxed text-gray-200 whitespace-pre-line">
                        {selectedCard.conditionDescription}
                      </p>
                      
                      {/* Additional Info */}
                      <div className="mt-6 pt-4 border-t border-amber-500/20 grid grid-cols-2 gap-4">
                        {selectedCard.series && (
                          <div>
                            <p className="text-xs text-amber-400 mb-1">Series</p>
                            <p className="text-sm text-white font-semibold">{selectedCard.series}</p>
                          </div>
                        )}
                        {selectedCard.type && (
                          <div>
                            <p className="text-xs text-amber-400 mb-1">Type</p>
                            <p className="text-sm text-white font-semibold">{selectedCard.type}</p>
                          </div>
                        )}
                        {selectedCard.effectiveDate && (
                          <div className="col-span-2">
                            <p className="text-xs text-amber-400 mb-1">มีผลตั้งแต่</p>
                            <p className="text-sm text-white font-semibold">
                              {new Date(selectedCard.effectiveDate).toLocaleDateString('th-TH', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })}
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Related Cards List */}
                      {selectedCard.relatedCards && selectedCard.relatedCards.length > 0 && (
                        <div className="mt-6 pt-4 border-t border-amber-500/20">
                          <p className="text-xs font-semibold text-amber-300 mb-2">การ์ดที่เกี่ยวข้อง:</p>
                          <div className="flex flex-wrap gap-2">
                            {selectedCard.relatedCards.map((relatedCard, index) => (
                              <span 
                                key={index} 
                                className="text-xs bg-amber-500/20 text-amber-200 px-3 py-1 rounded-full border border-amber-500/30"
                              >
                                {relatedCard}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Warning */}
                    <div className="rounded-xl border border-yellow-500/30 bg-yellow-950/20 p-4">
                      <p className="text-xs text-yellow-200 leading-relaxed">
                        ⚠️ การไม่ปฏิบัติตามเงื่อนไขอาจทำให้ Deck ของคุณไม่ถูกต้องตามกฎ
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      })()}
    </div>
  );
}