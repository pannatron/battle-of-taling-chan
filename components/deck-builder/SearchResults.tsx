'use client';

import { useState } from 'react';
import { Card as CardType } from '@/types/card';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { getRarityColor } from '@/lib/deckCardUtils';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

interface SearchResultsProps {
  searchResults: CardType[];
  totalResults: number;
  loading: boolean;
  isMainDeckFull: boolean;
  onCardClick: (card: CardType, target: 'main' | 'side') => void;
  onRemoveCard: (cardId: string, isLife: boolean, isOnlyOne: boolean, isSideDeck: boolean) => void;
  selectedCards: Array<CardType & { quantity: number; isLifeCard?: boolean; isSideDeck?: boolean }>;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  getLifeCardCount: () => number;
}

export function SearchResults({
  searchResults,
  totalResults,
  loading,
  isMainDeckFull,
  onCardClick,
  onRemoveCard,
  selectedCards,
  currentPage,
  totalPages,
  onPageChange,
  getLifeCardCount,
}: SearchResultsProps) {
  const [expandedCard, setExpandedCard] = useState<string | null>(null);
  const [fullScreenCard, setFullScreenCard] = useState<CardType | null>(null);
  
  // Calculate card counts from selectedCards
  const getCardCounts = (cardId: string) => {
    const mainDeckCard = selectedCards.find(c => c._id === cardId && !c.isLifeCard && !c.isSideDeck);
    const sideDeckCard = selectedCards.find(c => c._id === cardId && c.isSideDeck);
    return {
      main: mainDeckCard?.quantity || 0,
      side: sideDeckCard?.quantity || 0
    };
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      onPageChange(newPage);
      // Scroll to top of search results
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const toggleCard = (cardId: string) => {
    setExpandedCard(expandedCard === cardId ? null : cardId);
  };

  const handleAddCard = (card: CardType, target: 'main' | 'side') => {
    onCardClick(card, target);
  };

  const handleRemoveCardClick = (cardId: string, target: 'main' | 'side') => {
    // Determine card properties
    const card = selectedCards.find(c => c._id === cardId && (target === 'side' ? c.isSideDeck : !c.isSideDeck));
    if (!card) return;
    
    const isLife = card.isLifeCard || false;
    const isOnlyOne = card.ex === 'Only #1';
    const isSideDeck = target === 'side';
    
    onRemoveCard(cardId, isLife, isOnlyOne, isSideDeck);
  };

  const renderPageNumbers = () => {
    const pages = [];
    const maxVisible = window.innerWidth < 640 ? 3 : 5; // Show fewer pages on mobile
    let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let endPage = Math.min(totalPages, startPage + maxVisible - 1);

    if (endPage - startPage < maxVisible - 1) {
      startPage = Math.max(1, endPage - maxVisible + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <Button
          key={i}
          size="sm"
          variant={currentPage === i ? 'default' : 'outline'}
          onClick={() => handlePageChange(i)}
          className="h-8 min-w-[2rem] sm:h-9 sm:min-w-[2.5rem] text-xs sm:text-sm"
        >
          {i}
        </Button>
      );
    }

    return pages;
  };

  return (
    <Card className="border-2">
      <CardHeader className="pb-2 md:pb-3">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-base sm:text-lg md:text-xl font-bold">
            📋 Search Results{' '}
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              ({totalResults})
            </span>
          </h2>
          {totalPages > 1 && !loading && searchResults.length > 0 && (
            <span className="text-xs sm:text-sm text-muted-foreground">
              Page {currentPage} of {totalPages}
            </span>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="py-12 text-center text-muted-foreground">Loading...</div>
        ) : searchResults.length === 0 ? (
          <div className="py-12 text-center text-muted-foreground">No cards found</div>
        ) : (
          <div className="grid gap-1.5 sm:gap-2 grid-cols-3 xs:grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10">
            {searchResults.map((card) => {
              const counts = getCardCounts(card._id);
              return (
                <div
                  key={card._id}
                  className="group relative overflow-hidden rounded-lg border border-border bg-card/50 backdrop-blur-sm transition-all hover:scale-[2] sm:hover:scale-[2.5] hover:z-50 hover:shadow-2xl cursor-pointer"
                >
                  <div
                    className={`h-0.5 bg-gradient-to-r ${getRarityColor(card.rare)}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      setFullScreenCard(card);
                    }}
                  />
                  <div 
                    className="p-1"
                    onClick={(e) => {
                      e.stopPropagation();
                      setFullScreenCard(card);
                    }}
                  >
                    <div className="relative aspect-[2/3] overflow-hidden rounded border border-border bg-muted/30">
                      {card.imageUrl ? (
                        <Image
                          src={card.imageUrl}
                          alt={card.name}
                          fill
                          className="object-contain"
                          sizes="100px"
                        />
                      ) : (
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground">
                          <div className="text-2xl mb-1">🃏</div>
                          <div className="text-[8px] text-center px-1 leading-tight">
                            {card.name}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  
                </div>
              );
            })}
          </div>
        )}

        {/* Full Screen Card Modal */}
        {fullScreenCard && (
          <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 p-4"
            onClick={() => setFullScreenCard(null)}
          >
            {/* Close button - top right */}
            <button
              className="absolute top-4 right-4 z-[101] text-white hover:text-gray-300 transition-colors"
              onClick={() => setFullScreenCard(null)}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>

            <div className="relative w-full h-full max-w-2xl max-h-[90vh] flex flex-col items-center justify-center">
              <div className="relative w-full aspect-[2/3] max-h-full">
                {fullScreenCard.imageUrl ? (
                  <Image
                    src={fullScreenCard.imageUrl}
                    alt={fullScreenCard.name}
                    fill
                    className="object-contain"
                    sizes="(max-width: 768px) 100vw, 672px"
                    priority
                  />
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground">
                    <div className="text-6xl mb-4">🃏</div>
                    <div className="text-xl text-center px-4">
                      {fullScreenCard.name}
                    </div>
                  </div>
                )}
              </div>
              
              {/* Action buttons */}
              <div className="mt-4 flex flex-row gap-3 w-full max-w-md justify-center" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center gap-1.5 bg-black/60 rounded-lg px-3 py-2">
                  <span className="text-white text-sm sm:text-base font-bold mr-1">Main</span>
                  <Button
                    size="sm"
                    variant="destructive"
                    className="h-8 w-8 p-0 text-base sm:h-9 sm:w-9"
                    onClick={() => {
                      handleRemoveCardClick(fullScreenCard._id, 'main');
                    }}
                    disabled={getCardCounts(fullScreenCard._id).main === 0}
                  >
                    -
                  </Button>
                  <span className="text-white text-base sm:text-lg font-bold w-8 text-center">
                    {getCardCounts(fullScreenCard._id).main}
                  </span>
                  <Button
                    size="sm"
                    variant="default"
                    className="h-8 w-8 p-0 text-base sm:h-9 sm:w-9"
                    onClick={() => {
                      handleAddCard(fullScreenCard, 'main');
                    }}
                    disabled={isMainDeckFull}
                  >
                    +
                  </Button>
                </div>
                
                {isMainDeckFull && getLifeCardCount() === 5 && (
                  <div className="flex items-center gap-1.5 bg-black/60 rounded-lg px-3 py-2">
                    <span className="text-cyan-400 text-sm sm:text-base font-bold mr-1">Side</span>
                    <Button
                      size="sm"
                      variant="destructive"
                      className="h-8 w-8 p-0 text-base sm:h-9 sm:w-9"
                      onClick={() => {
                        handleRemoveCardClick(fullScreenCard._id, 'side');
                      }}
                      disabled={getCardCounts(fullScreenCard._id).side === 0}
                    >
                      -
                    </Button>
                    <span className="text-cyan-400 text-base sm:text-lg font-bold w-8 text-center">
                      {getCardCounts(fullScreenCard._id).side}
                    </span>
                    <Button
                      size="sm"
                      variant="secondary"
                      className="h-8 w-8 p-0 text-base sm:h-9 sm:w-9"
                      onClick={() => {
                        handleAddCard(fullScreenCard, 'side');
                      }}
                    >
                      +
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
        
        {/* Pagination Controls */}
        {totalPages > 1 && !loading && searchResults.length > 0 && (
          <div className="mt-4 md:mt-6 flex items-center justify-center gap-1 sm:gap-2 flex-wrap">
            <Button
              size="sm"
              variant="outline"
              onClick={() => handlePageChange(1)}
              disabled={currentPage === 1}
              title="First page"
              className="h-8 w-8 p-0 sm:h-9 sm:w-9"
            >
              <ChevronsLeft className="h-3 w-3 sm:h-4 sm:w-4" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              title="Previous page"
              className="h-8 w-8 p-0 sm:h-9 sm:w-9"
            >
              <ChevronLeft className="h-3 w-3 sm:h-4 sm:w-4" />
            </Button>
            
            <div className="flex gap-1 sm:gap-2">
              {renderPageNumbers()}
            </div>
            
            <Button
              size="sm"
              variant="outline"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              title="Next page"
              className="h-8 w-8 p-0 sm:h-9 sm:w-9"
            >
              <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handlePageChange(totalPages)}
              disabled={currentPage === totalPages}
              title="Last page"
              className="h-8 w-8 p-0 sm:h-9 sm:w-9"
            >
              <ChevronsRight className="h-3 w-3 sm:h-4 sm:w-4" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
