'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';

interface DeckCard {
  _id: string;
  name: string;
  imageUrl: string;
  quantity: number;
  ex?: string;
}

export default function ExportDeckPage() {
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

    fetch(`http://localhost:3001/decks/${deckId}`)
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
  const onlyOneCards: DeckCard[] = deck.cards.filter((c: DeckCard) => c.ex === 'Only #1');
  
  // Get all side deck cards (ex = 'Side Deck')
  const allSideDeckCards: DeckCard[] = deck.cards.filter((c: DeckCard) => c.ex === 'Side Deck');
  
  // Separate side deck cards by quantity (1 = only one, >1 = regular)
  const sideDeckOnlyOneCards = allSideDeckCards.filter((card) => card.quantity === 1);
  const sideDeckRegularCards = allSideDeckCards.filter((card) => card.quantity > 1);
  
  const deckCards: DeckCard[] = deck.cards.filter(
    (c: DeckCard) => !c.ex || (c.ex !== 'Life' && c.ex !== 'Only #1' && c.ex !== 'Side Deck')
  );

  return (
    <div className="min-h-screen bg-black p-8">
      <div id="deck-visualization" className="max-w-7xl mx-auto space-y-6 p-6 bg-black rounded-lg">
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
          <div className="grid grid-cols-8 gap-3">
            {deckCards.map((card) => (
              <div key={`deck-view-${card._id}`} className="relative">
                {card.imageUrl && (
                  <div className="relative aspect-[2/3] overflow-hidden rounded bg-black shadow-md">
                    <Image
                      src={card.imageUrl}
                      alt={card.name}
                      fill
                      className="object-contain"
                      sizes="200px"
                      unoptimized
                    />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-white text-base font-bold text-black shadow-xl ring-2 ring-black">
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
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center w-8">
              <div
                className="text-2xl font-bold text-white tracking-wider"
                style={{ writingMode: 'vertical-lr', transform: 'rotate(180deg)' }}
              >
                SIDE
              </div>
            </div>

            {allSideDeckCards.length === 0 ? (
              <div className="w-32 py-8 text-center text-xs text-gray-400 border-2 border-dashed border-gray-600 rounded-lg">
                No side deck
              </div>
            ) : (
              <div className="flex items-center gap-12">
                {/* Only One Cards - Left */}
                {sideDeckOnlyOneCards.length > 0 && (
                  <div className="flex flex-col gap-3">
                    {sideDeckOnlyOneCards.map((card) => (
                      <div key={`side-only-view-${card._id}`} className="w-28">
                        {card.imageUrl && (
                          <div className="relative aspect-[2/3] overflow-hidden rounded bg-black shadow-lg">
                            <Image
                              src={card.imageUrl}
                              alt={card.name}
                              fill
                              className="object-contain"
                              sizes="120px"
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
                        className="w-28"
                        style={{ marginLeft: index > 0 ? '-1.5rem' : '0' }}
                      >
                        {card.imageUrl && (
                          <div className="relative aspect-[2/3] overflow-hidden rounded bg-black shadow-lg">
                            <Image
                              src={card.imageUrl}
                              alt={card.name}
                              fill
                              className="object-contain"
                              sizes="120px"
                              unoptimized
                            />
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-white text-base font-bold text-black shadow-xl ring-2 ring-cyan-500">
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
          <div className="flex items-end gap-8">
            {/* Life Cards Stack */}
            {lifeCards.length === 0 ? (
              <div className="w-32 py-8 text-center text-xs text-gray-400 border-2 border-dashed border-gray-600 rounded-lg">
                No life cards
              </div>
            ) : (
              <div className="relative w-36" style={{ height: `${7 + (lifeCards.length - 1) * 3}rem` }}>
                {lifeCards.map((card, index) => (
                  <div
                    key={`life-view-${card._id}`}
                    className="absolute left-1/2 -translate-x-1/2 w-28"
                    style={{ bottom: `${(lifeCards.length - 1 - index) * 3}rem` }}
                  >
                    {card.imageUrl && (
                      <div className="relative aspect-[2/3] overflow-hidden rounded bg-black shadow-lg">
                        <Image
                          src={card.imageUrl}
                          alt={card.name}
                          fill
                          className="object-contain"
                          sizes="120px"
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
              <div className="w-56 py-12 text-center text-sm text-gray-400 border-2 border-dashed border-gray-600 rounded-lg">
                No only one card
              </div>
            ) : (
              <div className="flex justify-center">
                {onlyOneCards.map((card) => (
                  <div key={`only-view-${card._id}`} className="w-56">
                    {card.imageUrl && (
                      <div className="relative aspect-[2/3] overflow-hidden rounded-lg bg-black shadow-2xl">
                        <Image
                          src={card.imageUrl}
                          alt={card.name}
                          fill
                          className="object-contain"
                          sizes="240px"
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
