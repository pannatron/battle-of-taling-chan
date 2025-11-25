'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { getDeckById, getCardById } from '@/lib/api';
import { Deck } from '@/types/deck';
import { Card as CardType } from '@/types/card';
import Image from 'next/image';

interface DeckPreviewDialogProps {
  deckId: string | null;
  isOpen: boolean;
  onClose: () => void;
  onSelectDeck?: (deckId: string) => void;
  showSelectButton?: boolean;
}

export function DeckPreviewDialog({ 
  deckId, 
  isOpen, 
  onClose, 
  onSelectDeck,
  showSelectButton = false 
}: DeckPreviewDialogProps) {
  const [deck, setDeck] = useState<Deck | null>(null);
  const [cards, setCards] = useState<CardType[]>([]);
  const [sideDeckCards, setSideDeckCards] = useState<CardType[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (deckId && isOpen) {
      loadDeck();
    } else {
      setDeck(null);
      setCards([]);
      setSideDeckCards([]);
    }
  }, [deckId, isOpen]);

  const loadDeck = async () => {
    if (!deckId) return;
    
    setLoading(true);
    
    try {
      const deckData = await getDeckById(deckId);
      if (deckData) {
        setDeck(deckData);
        
        // Load main deck cards
        const cardPromises = deckData.cardIds.map(id => getCardById(id));
        const loadedCards = await Promise.all(cardPromises);
        setCards(loadedCards.filter(c => c !== null) as CardType[]);
        
        // Load side deck cards
        if (deckData.sideDeckIds && deckData.sideDeckIds.length > 0) {
          const sideDeckPromises = deckData.sideDeckIds.map(id => getCardById(id));
          const loadedSideDeckCards = await Promise.all(sideDeckPromises);
          setSideDeckCards(loadedSideDeckCards.filter(c => c !== null) as CardType[]);
        }
      }
    } catch (error) {
      console.error('Error loading deck:', error);
    } finally {
      setLoading(false);
    }
  };

  // Group cards by cardId and count quantities
  const groupCards = (cardsList: CardType[]) => {
    const grouped = cardsList.reduce((acc, card) => {
      const existing = acc.find(c => c._id === card._id);
      if (existing) {
        existing.quantity++;
      } else {
        acc.push({ ...card, quantity: 1 });
      }
      return acc;
    }, [] as (CardType & { quantity: number })[]);
    
    return grouped;
  };

  const groupedCards = groupCards(cards);
  const groupedSideDeckCards = groupCards(sideDeckCards);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">
            {loading ? 'Loading...' : deck?.name || 'Deck Preview'}
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : deck ? (
          <div className="space-y-6">
            {/* Deck Info */}
            <div className="rounded-lg border border-border bg-card/50 p-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-lg font-semibold">{deck.name}</h3>
                    <Badge variant="secondary">{deck.archetype}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">by {deck.author}</p>
                  {deck.description && (
                    <p className="text-sm text-muted-foreground mt-2">{deck.description}</p>
                  )}
                </div>
                {showSelectButton && onSelectDeck && (
                  <Button onClick={() => onSelectDeck(deck._id)}>
                    Select This Deck
                  </Button>
                )}
              </div>
            </div>

            {/* Main Deck */}
            <div>
              <h3 className="text-lg font-semibold mb-3">
                Main Deck ({cards.length} cards)
              </h3>
              <div className="grid gap-3 grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6">
                {groupedCards.map((card) => (
                  <Card key={card._id} className="overflow-hidden border-border bg-card/50">
                    <CardContent className="p-2">
                      <div className="relative aspect-[2.5/3.5] overflow-hidden rounded-md bg-muted">
                        {card.imageUrl ? (
                          <Image
                            src={card.imageUrl}
                            alt={card.name}
                            fill
                            className="object-cover object-top"
                            sizes="(max-width: 640px) 33vw, (max-width: 768px) 25vw, (max-width: 1024px) 20vw, 16vw"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
                            No Image
                          </div>
                        )}
                        {card.quantity > 1 && (
                          <div className="absolute bottom-1 right-1 rounded-full bg-black/80 px-2 py-0.5 text-xs font-bold text-white">
                            x{card.quantity}
                          </div>
                        )}
                      </div>
                      <p className="mt-1 line-clamp-2 text-xs font-medium text-foreground">
                        {card.name}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Side Deck */}
            {groupedSideDeckCards.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-3">
                  Side Deck ({sideDeckCards.length} cards)
                </h3>
                <div className="grid gap-3 grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6">
                  {groupedSideDeckCards.map((card) => (
                    <Card key={card._id} className="overflow-hidden border-border bg-card/50">
                      <CardContent className="p-2">
                        <div className="relative aspect-[2.5/3.5] overflow-hidden rounded-md bg-muted">
                          {card.imageUrl ? (
                            <Image
                              src={card.imageUrl}
                              alt={card.name}
                              fill
                              className="object-cover object-top"
                              sizes="(max-width: 640px) 33vw, (max-width: 768px) 25vw, (max-width: 1024px) 20vw, 16vw"
                            />
                          ) : (
                            <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
                              No Image
                            </div>
                          )}
                          {card.quantity > 1 && (
                            <div className="absolute bottom-1 right-1 rounded-full bg-black/80 px-2 py-0.5 text-xs font-bold text-white">
                              x{card.quantity}
                            </div>
                          )}
                        </div>
                        <p className="mt-1 line-clamp-2 text-xs font-medium text-foreground">
                          {card.name}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center justify-center py-12">
            <p className="text-muted-foreground">No deck found</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
