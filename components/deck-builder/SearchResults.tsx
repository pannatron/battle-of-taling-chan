import { Card as CardType } from '@/types/card';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import Image from 'next/image';
import { getRarityColor } from '@/lib/deckCardUtils';

interface SearchResultsProps {
  searchResults: CardType[];
  loading: boolean;
  isMainDeckFull: boolean;
  onCardClick: (card: CardType, target: 'main' | 'side') => void;
}

export function SearchResults({
  searchResults,
  loading,
  isMainDeckFull,
  onCardClick,
}: SearchResultsProps) {
  return (
    <Card className="border-2">
      <CardHeader className="pb-3">
        <h2 className="text-xl font-bold">
          📋 Search Results{' '}
          <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            ({searchResults.length})
          </span>
        </h2>
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
      </CardContent>
    </Card>
  );
}
