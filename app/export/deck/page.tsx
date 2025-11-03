'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';

interface DeckCard {
  _id: string;
  name: string;
  imageUrl: string;
  quantity: number;
  ex?: string;
  isSideDeck?: boolean;
}

function ExportDeckContent() {
  const searchParams = useSearchParams();
  const deckId = searchParams.get('id');
  const [deck, setDeck] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const isTemp = searchParams.get('temp') === 'true';

    if (isTemp) {
      // For temporary deck, wait for Puppeteer to inject data
      const checkForTempData = setInterval(() => {
        if (typeof window !== 'undefined' && (window as any).__TEMP_DECK_DATA__) {
          const tempDeck = (window as any).__TEMP_DECK_DATA__;
          setDeck(tempDeck);
          setLoading(false);
          // Signal that page is ready for screenshot
          (window as any).__EXPORT_READY__ = true;
          clearInterval(checkForTempData);
        }
      }, 100);

      // Timeout after 10 seconds
      setTimeout(() => {
        clearInterval(checkForTempData);
        if (!deck) {
          console.error('Timeout waiting for temporary deck data');
          setLoading(false);
        }
      }, 10000);

      return () => clearInterval(checkForTempData);
    }

    if (!deckId) {
      setLoading(false);
      return;
    }

    fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/decks/${deckId}`)
      .then((res) => res.json())
      .then((data) => {
        setDeck(data);
        setLoading(false);
        // Signal that page is ready for screenshot
        if (typeof window !== 'undefined') {
          (window as any).__EXPORT_READY__ = true;
        }
      })
      .catch((err) => {
        console.error('Failed to load deck:', err);
        setLoading(false);
      });
  }, [deckId, searchParams, deck]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="text-white text-xl">Loading deck...</div>
      </div>
    );
  }

  if (!deck) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="text-white text-xl">Deck not found</div>
      </div>
    );
  }

  const lifeCards: DeckCard[] = deck.cards.filter((c: DeckCard) => c.ex === 'Life');
  const onlyOneCards: DeckCard[] = deck.cards.filter((c: DeckCard) => c.ex === 'Only #1' && !c.isSideDeck);
  
  // Get all side deck cards - need to identify them properly
  // Side deck cards have isSideDeck flag OR ex contains "Side Deck" substring
  const sideDeckCards: DeckCard[] = deck.cards.filter((c: DeckCard) => {
    // Check if marked as side deck via flag
    if (c.isSideDeck) return true;
    // Check if ex field indicates side deck (for saved decks)
    if (c.ex === 'Side Deck') return true;
    // For temporary exports, cards with both ex flags need special handling
    return false;
  });
  
  // Separate side deck cards by their ex field (Only #1 vs regular)
  const sideDeckOnlyOneCards = sideDeckCards.filter((card) => card.ex === 'Only #1');
  const sideDeckRegularCards = sideDeckCards.filter((card) => card.ex !== 'Only #1');
  
  const deckCards: DeckCard[] = deck.cards.filter(
    (c: DeckCard) => c.ex !== 'Life' && c.ex !== 'Only #1' && !c.isSideDeck && c.ex !== 'Side Deck'
  );

  return (
    <div className="min-h-screen bg-black p-8">
      <div id="deck-visualization" className="max-w-7xl mx-auto space-y-3 p-3 bg-black rounded-lg">
        {/* Deck Name */}
        <div className="text-center mb-4">
          <h1 className="text-3xl font-bold text-white">{deck.name}</h1>
          {deck.description && (
            <p className="text-gray-400 mt-2">{deck.description}</p>
          )}
        </div>

        {/* Main Deck Grid - 8 cards per row */}
        {deckCards.length === 0 ? (
          <div className="py-8 text-center text-sm text-gray-400 border-2 border-dashed border-gray-600 rounded-lg">
            No cards in main deck
          </div>
        ) : (
          <div className="grid grid-cols-8 gap-1.5">
            {deckCards.map((card) => (
              <div key={`deck-view-${card._id}`} className="relative">
                {card.imageUrl && (
                  <div className="relative aspect-[2/3] overflow-hidden rounded bg-transparent">
                    <Image
                      src={card.imageUrl}
                      alt={card.name}
                      fill
                      className="object-contain"
                      sizes="10vw"
                      unoptimized
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
        <div className="flex items-end justify-between gap-8 pt-4">
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
              <div className="w-24 py-6 text-center text-xs text-gray-400 border-2 border-dashed border-gray-600 rounded-lg">
                No side deck
              </div>
            ) : (
              <div className="flex items-center gap-3">
                {/* Only One Cards - Left */}
                {sideDeckOnlyOneCards.length > 0 && (
                  <div className="flex flex-col gap-1">
                    {sideDeckOnlyOneCards.map((card) => (
                      <div key={`side-only-view-${card._id}`} className="w-20">
                        {card.imageUrl && (
                          <div className="relative aspect-[2/3] overflow-hidden rounded bg-transparent">
                            <Image
                              src={card.imageUrl}
                              alt={card.name}
                              fill
                              className="object-contain"
                              sizes="80px"
                              unoptimized
                            />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Regular Side Deck Cards - Center/Right */}
                {sideDeckRegularCards.length > 0 && (
                  <div className="flex items-end">
                    {sideDeckRegularCards.map((card, index) => (
                      <div
                        key={`side-regular-view-${card._id}`}
                        className="w-20"
                        style={{ marginLeft: index > 0 ? '-1rem' : '0' }}
                      >
                        {card.imageUrl && (
                          <div className="relative aspect-[2/3] overflow-hidden rounded bg-transparent">
                            <Image
                              src={card.imageUrl}
                              alt={card.name}
                              fill
                              className="object-contain"
                              sizes="80px"
                              unoptimized
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
              <div className="w-24 py-6 text-center text-xs text-gray-400 border-2 border-dashed border-gray-600 rounded-lg">
                No life cards
              </div>
            ) : (
              <div className="relative w-25" style={{ height: `${6 + (lifeCards.length - 1) * 2.5}rem` }}>
                {lifeCards.map((card, index) => (
                  <div
                    key={`life-view-${card._id}`}
                    className="absolute left-1/2 -translate-x-1/2 w-19"
                    style={{ bottom: `${(lifeCards.length - 1 - index) * 2.5}rem` }}
                  >
                    {card.imageUrl && (
                      <div className="relative aspect-[2/3] overflow-hidden rounded bg-transparent">
                        <Image
                          src={card.imageUrl}
                          alt={card.name}
                          fill
                          className="object-contain"
                          sizes="112px"
                          unoptimized
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Only One Card */}
            {onlyOneCards.length === 0 ? (
              <div className="w-48 py-8 text-center text-sm text-gray-400 border-2 border-dashed border-gray-600 rounded-lg">
                No only one card
              </div>
            ) : (
              <div className="flex justify-center">
                {onlyOneCards.map((card) => (
                  <div key={`only-view-${card._id}`} className="w-48">
                    {card.imageUrl && (
                      <div className="relative aspect-[2/3] overflow-hidden rounded-lg bg-transparent">
                        <Image
                          src={card.imageUrl}
                          alt={card.name}
                          fill
                          className="object-contain"
                          sizes="192px"
                          unoptimized
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
    </div>
  );
}

export default function ExportDeckPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="text-white text-xl">Loading deck...</div>
      </div>
    }>
      <ExportDeckContent />
    </Suspense>
  );
}
