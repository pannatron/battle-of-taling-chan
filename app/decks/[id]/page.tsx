'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Eye, Heart, TrendingUp } from "lucide-react";
import { getDeckById, getCardById, incrementDeckViews } from "@/lib/api";
import { Deck } from "@/types/deck";
import { Card as CardType } from "@/types/card";
import Image from 'next/image';

export default function DeckDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [deck, setDeck] = useState<Deck | null>(null);
  const [cards, setCards] = useState<CardType[]>([]);
  const [sideDeckCards, setSideDeckCards] = useState<CardType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDeck();
  }, [params.id]);

  const loadDeck = async () => {
    if (!params.id || typeof params.id !== 'string') return;
    
    setLoading(true);
    
    // Increment view count
    await incrementDeckViews(params.id);
    
    const deckData = await getDeckById(params.id);
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
    
    setLoading(false);
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

  if (loading) {
    return (
      <div className="min-h-screen bg-background py-24">
        <div className="container mx-auto px-4">
          <div className="rounded-lg border border-border bg-card/50 p-12 text-center backdrop-blur-sm">
            <p className="text-lg text-muted-foreground">Loading deck...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!deck) {
    return (
      <div className="min-h-screen bg-background py-24">
        <div className="container mx-auto px-4">
          <div className="rounded-lg border border-border bg-card/50 p-12 text-center backdrop-blur-sm">
            <p className="text-lg text-muted-foreground">Deck not found</p>
            <Button onClick={() => router.push('/decks')} className="mt-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Decks
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="relative py-24 md:py-32">
        <div className="absolute inset-0 -z-10">
          <div className="absolute right-0 top-0 h-96 w-96 animate-pulse rounded-full bg-secondary/10 blur-3xl" />
          <div className="absolute bottom-0 left-1/3 h-96 w-96 animate-pulse rounded-full bg-primary/10 blur-3xl animation-delay-2000" />
        </div>

        <div className="container relative mx-auto px-4 md:px-6">
          {/* Back Button */}
          <Button
            onClick={() => router.push('/decks')}
            variant="outline"
            className="mb-8 gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Decks
          </Button>

          {/* Deck Header */}
          <Card className="mb-8 overflow-hidden border-border bg-card/50 backdrop-blur-sm">
            <div className={`h-2 bg-gradient-to-r ${deck.gradient}`} />
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h1 className="mb-2 text-3xl font-bold text-foreground md:text-4xl">
                    {deck.name}
                  </h1>
                  <p className="mb-4 text-muted-foreground">by {deck.author}</p>
                  {deck.description && (
                    <p className="text-sm text-muted-foreground">{deck.description}</p>
                  )}
                </div>
                <Badge variant="secondary" className="border border-border/40 bg-muted/50 font-semibold">
                  {deck.archetype}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-6 text-sm">
                <div className="flex items-center gap-1.5">
                  <div className="rounded-md bg-accent/20 p-1">
                    <TrendingUp className="h-4 w-4 text-accent" />
                  </div>
                  <span className="font-bold text-foreground">{deck.wins}</span>
                  <span className="text-muted-foreground">wins</span>
                </div>
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Eye className="h-4 w-4" />
                  <span>{deck.views}</span>
                </div>
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Heart className="h-4 w-4" />
                  <span>{deck.likes}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Main Deck */}
          <div className="mb-8">
            <h2 className="mb-4 text-2xl font-bold text-foreground">
              Main Deck ({cards.length} cards)
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {groupedCards.map((card) => (
                <Card key={card._id} className="overflow-hidden border-border bg-card/50 backdrop-blur-sm">
                  <CardContent className="p-2">
                    <div className="relative aspect-[2.5/3.5] overflow-hidden rounded-md bg-muted">
                      {card.imageUrl ? (
                        <Image
                          src={card.imageUrl}
                          alt={card.name}
                          fill
                          className="object-cover"
                          sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
                          No Image
                        </div>
                      )}
                      {card.quantity > 1 && (
                        <div className="absolute bottom-2 right-2 rounded-full bg-black/80 px-2 py-1 text-xs font-bold text-white">
                          x{card.quantity}
                        </div>
                      )}
                    </div>
                    <p className="mt-2 line-clamp-2 text-xs font-medium text-foreground">
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
              <h2 className="mb-4 text-2xl font-bold text-foreground">
                Side Deck ({sideDeckCards.length} cards)
              </h2>
              <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                {groupedSideDeckCards.map((card) => (
                  <Card key={card._id} className="overflow-hidden border-border bg-card/50 backdrop-blur-sm">
                    <CardContent className="p-2">
                      <div className="relative aspect-[2.5/3.5] overflow-hidden rounded-md bg-muted">
                        {card.imageUrl ? (
                          <Image
                            src={card.imageUrl}
                            alt={card.name}
                            fill
                            className="object-cover"
                            sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
                            No Image
                          </div>
                        )}
                        {card.quantity > 1 && (
                          <div className="absolute bottom-2 right-2 rounded-full bg-black/80 px-2 py-1 text-xs font-bold text-white">
                            x{card.quantity}
                          </div>
                        )}
                      </div>
                      <p className="mt-2 line-clamp-2 text-xs font-medium text-foreground">
                        {card.name}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
