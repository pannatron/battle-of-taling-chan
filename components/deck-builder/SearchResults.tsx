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
  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      onPageChange(newPage);
      // Scroll to top of search results
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const renderPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
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
          className="min-w-[2.5rem]"
        >
          {i}
        </Button>
      );
    }

    return pages;
  };

  return (
    <Card className="border-2">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">
            📋 Search Results{' '}
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              ({totalResults})
            </span>
          </h2>
          {totalPages > 1 && !loading && searchResults.length > 0 && (
            <span className="text-sm text-muted-foreground">
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
          <div className="grid gap-2 grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10">
            {searchResults.map((card) => (
              <div
                key={card._id}
                onClick={() => {
                  if (isMainDeckFull) {
                    onCardClick(card, 'side');
                  } else {
                    onCardClick(card, 'main');
                  }
                }}
                onContextMenu={(e) => {
                  e.preventDefault();
                  onCardClick(card, 'side');
                }}
                className="group relative overflow-hidden rounded-lg border border-border bg-card/50 backdrop-blur-sm transition-all hover:scale-[2.5] hover:z-50 hover:shadow-2xl cursor-pointer"
                title={
                  isMainDeckFull
                    ? 'Click to add to side deck'
                    : 'Left click: Add to main deck | Right click: Add to side deck'
                }
              >
                <div
                  className={`h-0.5 bg-gradient-to-r ${getRarityColor(card.rare)}`}
                />
                <div className="p-1">
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
            ))}
          </div>
        )}
        
        {/* Pagination Controls */}
        {totalPages > 1 && !loading && searchResults.length > 0 && (
          <div className="mt-6 flex items-center justify-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => handlePageChange(1)}
              disabled={currentPage === 1}
              title="First page"
            >
              <ChevronsLeft className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              title="Previous page"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            
            {renderPageNumbers()}
            
            <Button
              size="sm"
              variant="outline"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              title="Next page"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handlePageChange(totalPages)}
              disabled={currentPage === totalPages}
              title="Last page"
            >
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
