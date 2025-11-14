'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, FileWarning, X, Link2, Zap, Skull, Ghost, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getAllCards, getCardById } from '@/lib/api';
import { Card } from '@/types/card';

// ประเภทของเงื่อนไข
type ConditionType = 'choose_one' | 'requires_avatar_symbol' | 'shared_name_limit' | 'none';

interface RelatedCardInfo {
  name: string;
  imageUrl: string;
  print: string;
}

interface ConditionalCardDisplay extends Card {
  conditionTitle: string;
  conditionDescription: string;
  relatedCardsInfo?: RelatedCardInfo[];
  displayConditionType: 'exclusive' | 'choose-one' | 'pair-required' | 'special';
}

const getConditionIcon = (type: 'exclusive' | 'choose-one' | 'pair-required' | 'special') => {
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
      return AlertCircle;
  }
};

const getConditionColor = (type: 'exclusive' | 'choose-one' | 'pair-required' | 'special') => {
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
  const [cards, setCards] = useState<ConditionalCardDisplay[]>([]);
  const [allCards, setAllCards] = useState<Card[]>([]);
  const [filteredCards, setFilteredCards] = useState<ConditionalCardDisplay[]>([]);
  const [selectedCard, setSelectedCard] = useState<ConditionalCardDisplay | null>(null);
  const [filterType, setFilterType] = useState<'all' | 'exclusive' | 'choose-one' | 'pair-required' | 'special'>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadConditionalCards();
  }, []);

  useEffect(() => {
    if (filterType === 'all') {
      setFilteredCards(cards);
    } else {
      setFilteredCards(cards.filter(card => card.displayConditionType === filterType));
    }
  }, [filterType, cards]);

  const loadConditionalCards = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Load all cards and filter for those with sinCardConditionType (regardless of status)
      const allCardsData = await getAllCards();
      const conditionalCards = allCardsData.filter(card => 
        card.sinCardConditionType && card.sinCardConditionType !== 'none'
      );
      
      setAllCards(allCardsData);
      
      // Define rarity priority (lower number = higher priority to show - prefer common cards)
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
      conditionalCards.forEach((card: Card) => {
        const name = card.name || '';
        if (!cardsByName[name]) {
          cardsByName[name] = [];
        }
        cardsByName[name].push(card);
      });
      
      // For each name, select the card with lowest rarity (highest priority - prefer common cards)
      const selectedCards: Card[] = [];
      Object.values(cardsByName).forEach((cardsWithSameName) => {
        const sorted = cardsWithSameName.sort((a, b) => {
          const priorityA = rarityPriority[a.rare || ''] || 999;
          const priorityB = rarityPriority[b.rare || ''] || 999;
          return priorityA - priorityB; // Lower number = lower rarity (C, UC, R, etc.)
        });
        selectedCards.push(sorted[0]);
      });
      
      // Show all cards in the grid - don't filter out any cards
      // The modal will handle showing the relationship between cards in a choose_one group
      const filteredSelectedCards = selectedCards;
      
      // Create a map of card IDs to their lowest rarity versions for quick lookup
      const cardIdToLowestRarityMap: { [key: string]: Card } = {};
      allCardsData.forEach((card) => {
        const existingCard = cardIdToLowestRarityMap[card._id];
        if (!existingCard) {
          cardIdToLowestRarityMap[card._id] = card;
        }
      });
      
      // Create name to lowest rarity card map from ALL selected cards (before filtering)
      // This is important so we can find related cards even if they were filtered out
      const nameToSelectedCardMap: { [key: string]: Card } = {};
      selectedCards.forEach((card) => {
        nameToSelectedCardMap[card.name] = card;
      });
      
      // Process cards to add display information
      const processedCards: ConditionalCardDisplay[] = await Promise.all(
        filteredSelectedCards.map(async (card) => {
          let conditionTitle = 'มีเงื่อนไขพิเศษ';
          let conditionDescription = card.sinCardReason || card.sinCardCondition || 'การ์ดนี้มีเงื่อนไขพิเศษในการใช้งาน';
          let displayConditionType: 'exclusive' | 'choose-one' | 'pair-required' | 'special' = 'special';
          let relatedCardsInfo: RelatedCardInfo[] | undefined;
          
          // Determine display type and load related cards based on condition type
          switch (card.sinCardConditionType) {
            case 'choose_one':
              displayConditionType = 'choose-one';
              conditionTitle = 'เลือกใส่ได้อย่างใดอย่างหนึ่ง';
              
              // Load related cards from chooseOneGroup
              // Strategy: Find all cards whose chooseOneGroup includes this card's ID
              const relatedCardNames = new Set<string>();
              
              // Check this card's own chooseOneGroup first
              if (card.sinCardChooseOneGroup && card.sinCardChooseOneGroup.length > 0) {
                card.sinCardChooseOneGroup.forEach((cardId) => {
                  if (cardId !== card._id) {
                    const relatedCard = conditionalCards.find(c => c._id === cardId);
                    if (relatedCard && relatedCard.name !== card.name) {
                      relatedCardNames.add(relatedCard.name);
                    }
                  }
                });
              }
              
              // Also search for other cards that have this card in their chooseOneGroup
              // This handles the case where card B doesn't have A in its group, but A has B
              // We need to search through ALL cards, not just those with matching IDs
              selectedCards.forEach((otherCard) => {
                // Skip if it's the same card name (avoid showing the card related to itself)
                if (otherCard.name === card.name) {
                  return;
                }
                
                // Check if the other card has choose_one condition
                if (otherCard.sinCardConditionType === 'choose_one' &&
                    otherCard.sinCardChooseOneGroup &&
                    otherCard.sinCardChooseOneGroup.length > 0) {
                  
                  // Check if any version of the current card is in the other card's group
                  // We need to check all versions of the current card (all cards with the same name)
                  const currentCardVersions = conditionalCards.filter(c => c.name === card.name);
                  const hasRelationship = currentCardVersions.some(version => 
                    otherCard.sinCardChooseOneGroup!.includes(version._id)
                  );
                  
                  if (hasRelationship) {
                    relatedCardNames.add(otherCard.name);
                  }
                }
              });
              
              // Map names to selected cards (which are already lowest rarity)
              relatedCardsInfo = Array.from(relatedCardNames)
                .map(name => nameToSelectedCardMap[name])
                .filter((c): c is Card => !!c)
                .map(c => ({
                  name: c.name,
                  imageUrl: c.imageUrl || '/character/1.png',
                  print: c.print
                }));
              break;
              
            case 'requires_avatar_symbol':
              displayConditionType = 'special';
              conditionTitle = 'ต้องมี Avatar Symbol';
              if (card.sinCardRequiredAvatars && card.sinCardRequiredSymbols) {
                conditionDescription = `ถ้ามี Avatar: ${card.sinCardRequiredAvatars.join(', ')} จะต้องมี Symbol: ${card.sinCardRequiredSymbols.join(', ')} ใน Avatar Symbol หรือ Main Effect`;
              }
              break;
              
            case 'shared_name_limit':
              displayConditionType = 'pair-required';
              conditionTitle = 'จำกัดปริมาณรวมกัน';
              if (card.sinCardSharedNameGroup) {
                // Find other cards in the same group from conditionalCards (already filtered to lowest rarity)
                const groupCards = conditionalCards.filter(c => 
                  c.sinCardSharedNameGroup === card.sinCardSharedNameGroup && 
                  c._id !== card._id
                );
                
                // Get unique names from group cards
                const groupCardNames = new Set<string>();
                groupCards.forEach(c => {
                  if (c.name !== card.name) {
                    groupCardNames.add(c.name);
                  }
                });
                
                // Map names to selected cards (which are already lowest rarity)
                const uniqueGroupCards = Array.from(groupCardNames)
                  .map(name => nameToSelectedCardMap[name])
                  .filter((c): c is Card => !!c);
                
                if (uniqueGroupCards.length > 0) {
                  conditionDescription = `การ์ดนี้และการ์ดในกลุ่มเดียวกัน (${uniqueGroupCards.map(c => c.name).join(', ')}) สามารถใส่รวมกันได้ไม่เกิน 4 ใบ`;
                  relatedCardsInfo = uniqueGroupCards.map(c => ({
                    name: c.name,
                    imageUrl: c.imageUrl || '/character/1.png',
                    print: c.print
                  }));
                }
              }
              break;
              
            default:
              displayConditionType = 'special';
          }
          
          return {
            ...card,
            conditionTitle,
            conditionDescription,
            relatedCardsInfo,
            displayConditionType
          };
        })
      );
      
      setCards(processedCards);
      setFilteredCards(processedCards);
    } catch (err) {
      console.error('Error loading conditional cards:', err);
      setError('เกิดข้อผิดพลาดในการโหลดข้อมูลการ์ดบาป');
    } finally {
      setLoading(false);
    }
  };

  const hasDetails = (card: ConditionalCardDisplay) => {
    return !!(card.conditionDescription || card.sinCardDate || card.series || card.type);
  };

  const getConditionTypeCount = (type: 'exclusive' | 'choose-one' | 'pair-required' | 'special') => {
    return cards.filter(card => card.displayConditionType === type).length;
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Video Background */}
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
        
        <div className="absolute inset-0 bg-black/80" />
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

          {/* Title */}
          <div className="mb-8 text-center relative">
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

          {/* Warning Box */}
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
              <div className="absolute top-2 left-2 w-2 h-2 rounded-full bg-gray-800 shadow-inner" />
              <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-gray-800 shadow-inner" />
              <div className="absolute bottom-2 left-2 w-2 h-2 rounded-full bg-gray-800 shadow-inner" />
              <div className="absolute bottom-2 right-2 w-2 h-2 rounded-full bg-gray-800 shadow-inner" />

              <div className="p-6 pt-8">
                {loading ? (
                  <p className="font-mn-lon text-base text-red-200/80 text-center">
                    กำลังโหลดข้อมูล...
                  </p>
                ) : error ? (
                  <p className="font-mn-lon text-base text-red-400 text-center">
                    {error}
                  </p>
                ) : (
                  <>
                    <p className="font-mn-lon text-base leading-relaxed text-red-200/80 text-center">
                      การ์ดในหมวดนี้มีเงื่อนไขพิเศษในการใช้งาน เช่น ห้ามใส่ซ้ำกับการ์ดบางใบ ต้องเลือกใบใดใบหนึ่ง หรือต้องมีการ์ดคู่ 
                      กรุณาอ่านเงื่อนไขอย่างละเอียดก่อนสร้าง Deck
                    </p>

                    <div className="mt-4 flex items-center justify-between text-sm">
                      <span className="font-mn-lon text-red-400 font-semibold">
                        ทั้งหมด {filteredCards.length} ใบ
                      </span>
                      <span className="font-mn-lon text-red-300/60">
                        อัพเดทจากฐานข้อมูล
                      </span>
                    </div>
                  </>
                )}
              </div>

              <div 
                className="absolute bottom-2 right-4 w-16 h-16 opacity-20"
                style={{
                  background: `radial-gradient(circle, rgba(220, 38, 38, 0.8) 0%, rgba(220, 38, 38, 0.4) 40%, transparent 70%)`
                }}
              />
            </div>
          </div>

          {/* Filter Buttons */}
          {!loading && !error && (
            <div className="flex flex-wrap gap-2 mb-6 justify-center">
              <Button
                size="sm"
                variant={filterType === 'all' ? 'default' : 'outline'}
                onClick={() => setFilterType('all')}
                className="font-mn-lon"
              >
                ทั้งหมด ({cards.length})
              </Button>
              <Button
                size="sm"
                variant={filterType === 'choose-one' ? 'default' : 'outline'}
                onClick={() => setFilterType('choose-one')}
                className="font-mn-lon"
              >
                <Zap className="mr-1 h-3 w-3" />
                เลือก 1 ใบ ({getConditionTypeCount('choose-one')})
              </Button>
              <Button
                size="sm"
                variant={filterType === 'pair-required' ? 'default' : 'outline'}
                onClick={() => setFilterType('pair-required')}
                className="font-mn-lon"
              >
                <Link2 className="mr-1 h-3 w-3" />
                จำกัดรวมกัน ({getConditionTypeCount('pair-required')})
              </Button>
              <Button
                size="sm"
                variant={filterType === 'special' ? 'default' : 'outline'}
                onClick={() => setFilterType('special')}
                className="font-mn-lon"
              >
                <FileWarning className="mr-1 h-3 w-3" />
                พิเศษ ({getConditionTypeCount('special')})
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Cards Grid */}
      <div className="container mx-auto px-4 py-8">
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-red-600 border-t-transparent"></div>
            <p className="font-mn-lon mt-4 text-red-300">กำลังโหลดการ์ด...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <p className="font-mn-lon text-red-400">{error}</p>
            <Button onClick={loadConditionalCards} className="mt-4">
              ลองใหม่อีกครั้ง
            </Button>
          </div>
        ) : filteredCards.length === 0 ? (
          <div className="text-center py-12">
            <Ghost className="h-12 w-12 text-red-400 mx-auto mb-4 opacity-50" />
            <p className="font-mn-lon text-red-300">ไม่พบการ์ดบาปมีเงื่อนไข</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {filteredCards.map((card, index) => {
              const Icon = getConditionIcon(card.displayConditionType);
              const colors = getConditionColor(card.displayConditionType);
              
              return (
                <div
                  key={card._id}
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
                          src={card.imageUrl || '/character/1.png'}
                          alt={card.name}
                          fill
                          className="object-cover transition-transform duration-300 group-hover:scale-110"
                        />
                        
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

                  {/* Shadow below board */}
                  <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-3/4 h-3 bg-black/60 blur-xl rounded-full" />
                </div>
              );
            })}
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
            {/* Nails */}
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
              // No details - show enlarged image only
              <div className="p-12 flex flex-col items-center justify-center min-h-[500px]">
                <div className="absolute top-8 opacity-10">
                  <Ghost className="h-32 w-32 text-red-600 animate-pulse" />
                </div>

                <div className="relative w-full max-w-md z-10">
                  <div className="relative aspect-[2/3] overflow-hidden rounded-xl border-4 border-red-900/60 shadow-2xl">
                    <Image
                      src={selectedCard.imageUrl || '/character/1.png'}
                      alt={selectedCard.name}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-red-900/50 via-transparent to-transparent" />
                  </div>
                  
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
              // Has details - show full modal
              <div className="p-8 md:p-12">
                {/* Card Images Section - Horizontal Layout */}
                <div className="mb-8">
                  {selectedCard.displayConditionType === 'choose-one' && selectedCard.relatedCardsInfo && selectedCard.relatedCardsInfo.length > 0 ? (
                    <div className="flex flex-col gap-6">
                      {/* Cards Row */}
                      <div className="flex flex-wrap items-start justify-center gap-4 md:gap-6">
                        {/* Current Card */}
                        <div className="flex-shrink-0">
                          <div className="relative w-48 md:w-56">
                            <div className="relative aspect-[2/3] overflow-hidden rounded-xl border-4 border-red-600/80 shadow-2xl">
                              <Image
                                src={selectedCard.imageUrl || '/character/1.png'}
                                alt={selectedCard.name}
                                fill
                                className="object-cover"
                              />
                              {/* Badge for current card */}
                              <div className="absolute top-2 left-2 bg-red-600 text-white px-2 py-1 rounded-md text-xs font-bold font-mn-lon shadow-lg">
                                เลือกใส่ได้
                              </div>
                            </div>
                            <p className="font-mn-lon mt-2 text-sm font-semibold text-red-300 text-center">
                              {selectedCard.name}
                            </p>
                            <p className="font-mn-lon text-xs text-red-400/70 text-center">
                              ({selectedCard.print})
                            </p>
                          </div>
                        </div>
                        
                        {/* Divider "หรือ" */}
                        <div className="flex items-center justify-center self-center">
                          <div 
                            className="rounded-full px-4 py-2 text-sm font-bold text-white shadow-lg font-mn-lon"
                            style={{
                              background: 'linear-gradient(135deg, #7f1d1d 0%, #991b1b 50%, #7f1d1d 100%)',
                              border: '2px solid #450a0a'
                            }}
                          >
                            หรือ
                          </div>
                        </div>
                        
                        {/* Related Cards */}
                        {selectedCard.relatedCardsInfo.map((relatedCard, idx) => (
                          <div key={idx} className="flex-shrink-0">
                            <div className="relative w-48 md:w-56">
                              <div className="relative aspect-[2/3] overflow-hidden rounded-xl border-4 border-red-900/60 shadow-2xl">
                                <Image
                                  src={relatedCard.imageUrl}
                                  alt={relatedCard.name}
                                  fill
                                  className="object-cover"
                                />
                                <div className="absolute top-2 left-2 bg-red-900/80 text-white px-2 py-1 rounded-md text-xs font-bold font-mn-lon shadow-lg">
                                  เลือกใส่ได้
                                </div>
                              </div>
                              <p className="font-mn-lon mt-2 text-sm font-semibold text-red-200 text-center">
                                {relatedCard.name}
                              </p>
                              <p className="font-mn-lon text-xs text-red-400/70 text-center">
                                ({relatedCard.print})
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : selectedCard.relatedCardsInfo && selectedCard.relatedCardsInfo.length > 0 ? (
                    <div className="flex flex-col gap-6">
                      {/* Cards Row */}
                      <div className="flex flex-wrap items-start justify-center gap-4 md:gap-6">
                        {/* Current Card */}
                        <div className="flex-shrink-0">
                          <div className="relative w-48 md:w-56">
                            <div className="relative aspect-[2/3] overflow-hidden rounded-xl border-4 border-red-600/80 shadow-2xl">
                              <Image
                                src={selectedCard.imageUrl || '/character/1.png'}
                                alt={selectedCard.name}
                                fill
                                className="object-cover"
                              />
                            </div>
                            <p className="font-mn-lon mt-2 text-sm font-semibold text-red-300 text-center">
                              {selectedCard.name}
                            </p>
                            <p className="font-mn-lon text-xs text-red-400/70 text-center">
                              ({selectedCard.print})
                            </p>
                          </div>
                        </div>
                        
                        {/* Divider */}
                        <div className="flex items-center justify-center self-center">
                          <div 
                            className="rounded-full px-4 py-2 text-sm font-bold text-white shadow-lg font-mn-lon"
                            style={{
                              background: 'linear-gradient(135deg, #7f1d1d 0%, #991b1b 50%, #7f1d1d 100%)',
                              border: '2px solid #450a0a'
                            }}
                          >
                            +
                          </div>
                        </div>
                        
                        {/* Related Cards */}
                        {selectedCard.relatedCardsInfo.map((relatedCard, idx) => (
                          <div key={idx} className="flex-shrink-0">
                            <div className="relative w-48 md:w-56">
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
                              <p className="font-mn-lon text-xs text-red-400/70 text-center">
                                ({relatedCard.print})
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="flex justify-center">
                      <div className="relative w-64 md:w-80">
                        <div className="relative aspect-[2/3] overflow-hidden rounded-xl border-4 border-red-900/60 shadow-2xl">
                          <Image
                            src={selectedCard.imageUrl || '/character/1.png'}
                            alt={selectedCard.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="absolute inset-0 -z-10 rounded-xl bg-gradient-to-br from-red-600/30 via-red-500/20 to-red-600/30 blur-2xl" />
                      </div>
                    </div>
                  )}
                </div>

                {/* Details Section */}
                <div className="flex flex-col gap-4 max-w-4xl mx-auto">
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
                      <p className="text-center text-sm text-red-300/60 mt-1">{selectedCard.print}</p>
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
                      {(selectedCard.series || selectedCard.type || selectedCard.sinCardDate) && (
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
                          {selectedCard.sinCardDate && (
                            <div className="col-span-2">
                              <p className="font-mn-lon text-xs text-red-400 mb-1">มีผลตั้งแต่</p>
                              <p className="font-mn-lon text-sm text-red-200 font-semibold">
                                {new Date(selectedCard.sinCardDate).toLocaleDateString('th-TH', {
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
            )}
          </div>
        </div>
      )}
    </div>
  );
}
