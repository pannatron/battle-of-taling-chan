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
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function SearchResults({
  searchResults,
  totalResults,
  loading,
  isMainDeckFull,
  onCardClick,
  currentPage,
  totalPages,
  onPageChange,
}: SearchResultsProps) {
  const [expandedCard, setExpandedCard] = useState<string | null>(null);

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
            {searchResults.map((card) => (
              <div
                key={card._id}
                className={`group relative overflow-hidden rounded-lg border border-border bg-card/50 backdrop-blur-sm transition-all hover:scale-[2] sm:hover:scale-[2.5] hover:z-50 hover:shadow-2xl cursor-pointer ${
                  expandedCard === card._id ? 'scale-[2.5] z-50 shadow-2xl' : ''
                }`}
                title={
                  isMainDeckFull
                    ? 'Click to add to side deck'
                    : 'Left click: Add to main deck | Right click: Add to side deck'
                }
              >
                <div
                  className={`h-0.5 bg-gradient-to-r ${getRarityColor(card.rare)}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleCard(card._id);
                  }}
                />
                <div 
                  className="p-1"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleCard(card._id);
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
                
                {/* Action buttons overlay - shown on expand or hover */}
                {expandedCard === card._id && (
                  <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center gap-1 p-2 z-10">
                    <Button
                      size="sm"
                      variant="default"
                      className="w-full text-xs"
                      onClick={(e) => {
                        e.stopPropagation();
                        onCardClick(card, 'main');
                        setExpandedCard(null);
                      }}
                      disabled={isMainDeckFull}
                    >
                      + Main Deck
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      className="w-full text-xs"
                      onClick={(e) => {
                        e.stopPropagation();
                        onCardClick(card, 'side');
                        setExpandedCard(null);
                      }}
                    >
                      + Side Deck
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full text-xs mt-1"
                      onClick={(e) => {
                        e.stopPropagation();
                        setExpandedCard(null);
                      }}
                    >
                      Close
                    </Button>
                  </div>
                )}
              </div>
            ))}
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
