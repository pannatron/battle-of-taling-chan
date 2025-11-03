import { DeckCard } from '@/hooks/useDeckBuilder';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';

interface DeckVisualizationProps {
  lifeCards: DeckCard[];
  onlyOneCards: DeckCard[];
  sideDeckCards: DeckCard[];
  deckCards: DeckCard[];
  deckName: string;
}

export function DeckVisualization({
  lifeCards,
  onlyOneCards,
  sideDeckCards,
  deckCards,
  deckName,
}: DeckVisualizationProps) {
  const [exporting, setExporting] = useState(false);
  const sideDeckOnlyOneCards = sideDeckCards.filter((card) => card.ex === 'Only #1');
  const sideDeckRegularCards = sideDeckCards.filter((card) => card.ex !== 'Only #1');

  const exportDeckServerSide = async () => {
    setExporting(true);
    console.log('🚀 Starting server-side export...');

    try {
      // Prepare deck data for export (works without saving)
      const allCards = [...lifeCards, ...onlyOneCards, ...sideDeckCards, ...deckCards];
      
      const deckData = {
        name: deckName || 'Untitled Deck',
        cards: allCards.map(card => ({
          _id: card._id,
          name: card.name,
          imageUrl: card.imageUrl,
          quantity: card.quantity,
          ex: card.isLifeCard ? 'Life' : card.ex || undefined,
          isSideDeck: card.isSideDeck || undefined
        }))
      };

      // Trigger export from backend using temporary data
      const response = await fetch(`http://localhost:3001/export/deck/temporary`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(deckData),
      });
      
      if (!response.ok) {
        throw new Error('Failed to export deck from server');
      }

      // Download the image
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${deckName || 'deck'}-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      console.log('✅ Server-side export complete!');
      setExporting(false);
    } catch (error) {
      console.error('❌ Server-side export error:', error);
      alert('Failed to export deck image: ' + (error as Error).message);
      setExporting(false);
    }
  };

  return (
    <>
      <div className="flex items-center justify-end gap-2 mb-4">
        <Button
          size="sm"
          variant="secondary"
          onClick={exportDeckServerSide}
          disabled={exporting || deckCards.length === 0}
          className="bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white"
        >
          <Download className="h-4 w-4 mr-2" />
          {exporting ? 'Exporting...' : 'Export Image'}
        </Button>
      </div>

      <div id="deck-visualization" className="space-y-3 p-3 bg-muted/30 rounded-lg">
        {/* Main Deck Grid - 8 cards per row */}
        {deckCards.length === 0 ? (
          <div className="py-8 text-center text-sm text-muted-foreground border-2 border-dashed rounded-lg">
            No cards in main deck
          </div>
        ) : (
          <div className="grid grid-cols-8 gap-1.5">
            {deckCards.map((card) => (
              <div
                key={`deck-view-${card._id}`}
                className="group relative transition-all hover:scale-125 hover:z-10"
              >
                {card.imageUrl && (
                  <div className="relative aspect-[2/3] overflow-hidden rounded bg-muted/30 shadow-md">
                    <Image
                      src={card.imageUrl}
                      alt={card.name}
                      fill
                      className="object-contain"
                      sizes="10vw"
                    />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex h-6 w-6 items-center justify-center rounded-full bg-white text-sm font-bold text-black shadow-xl ring-2 ring-black">
                      {card.quantity}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Side Deck, Life Cards, and Only One - Bottom Row */}
        <div className="flex items-end justify-between gap-4">
          {/* Side Deck - Left Side */}
          <div className="flex items-center gap-2 pb-8">
            <div className="flex items-center justify-center w-6">
              <div
                className="text-lg font-bold text-white"
                style={{ writingMode: 'vertical-lr', transform: 'rotate(180deg)' }}
              >
                SIDE
              </div>
            </div>

            {sideDeckCards.length === 0 ? (
              <div className="w-24 py-6 text-center text-xs text-muted-foreground border-2 border-dashed rounded-lg">
                No side deck
              </div>
            ) : (
              <div className="flex items-center gap-3">
                {sideDeckOnlyOneCards.length > 0 && (
                  <div className="flex flex-col gap-1">
                    {sideDeckOnlyOneCards.map((card) => (
                      <div
                        key={`side-only-view-${card._id}`}
                        className="w-20 transition-all hover:scale-125 hover:z-10"
                      >
                        {card.imageUrl && (
                          <div className="relative aspect-[2/3] overflow-hidden rounded bg-muted/30 shadow-lg">
                            <Image
                              src={card.imageUrl}
                              alt={card.name}
                              fill
                              className="object-contain"
                              sizes="80px"
                            />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {sideDeckRegularCards.length > 0 && (
                  <div className="flex items-end">
                    {sideDeckRegularCards.map((card, index) => (
                      <div
                        key={`side-regular-view-${card._id}`}
                        className="w-20 transition-all hover:scale-125 hover:z-10"
                        style={{ marginLeft: index > 0 ? '-1rem' : '0' }}
                      >
                        {card.imageUrl && (
                          <div className="relative aspect-[2/3] overflow-hidden rounded bg-muted/30 shadow-lg">
                            <Image
                              src={card.imageUrl}
                              alt={card.name}
                              fill
                              className="object-contain"
                              sizes="80px"
                            />
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex h-6 w-6 items-center justify-center rounded-full bg-white text-sm font-bold text-black shadow-xl ring-2 ring-cyan-500">
                              {card.quantity}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Life Cards and Only One - Right Side */}
          <div className="flex items-end gap-4">
            {/* Life Cards Stack */}
            {lifeCards.length === 0 ? (
              <div className="w-24 py-6 text-center text-xs text-muted-foreground border-2 border-dashed rounded-lg">
                No life cards
              </div>
            ) : (
              <div className="relative w-25" style={{ height: `${6 + (lifeCards.length - 1) * 2.5}rem` }}>
                {lifeCards.map((card, index) => (
                  <div
                    key={`life-view-${card._id}`}
                    className="absolute left-1/2 -translate-x-1/2 w-19 transition-all hover:scale-125 hover:z-8"
                    style={{ bottom: `${(lifeCards.length - 1 - index) * 2.5}rem` }}
                  >
                    {card.imageUrl && (
                      <div className="relative aspect-[2/3] overflow-hidden rounded bg-muted/30 shadow-lg">
                        <Image
                          src={card.imageUrl}
                          alt={card.name}
                          fill
                          className="object-contain"
                          sizes="112px"
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Only One Card */}
            {onlyOneCards.length === 0 ? (
              <div className="w-48 py-8 text-center text-sm text-muted-foreground border-2 border-dashed rounded-lg">
                No only one card
              </div>
            ) : (
              <div className="flex justify-center">
                {onlyOneCards.map((card) => (
                  <div
                    key={`only-view-${card._id}`}
                    className="w-48 transition-all hover:scale-105"
                  >
                    {card.imageUrl && (
                      <div className="relative aspect-[2/3] overflow-hidden rounded-lg bg-muted/30 shadow-2xl">
                        <Image
                          src={card.imageUrl}
                          alt={card.name}
                          fill
                          className="object-contain"
                          sizes="192px"
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
