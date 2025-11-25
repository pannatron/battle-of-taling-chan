'use client';

import { useState, useEffect, Suspense } from 'react';
import { useUser } from '@clerk/nextjs';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Eye, Heart, TrendingUp, Zap, Home, Plus, Search, Sparkles, CheckCircle2 } from "lucide-react";
import { getAllDecks, getUserDecks, toggleDeckFavorite, selectDeck, getCardById } from "@/lib/api";
import { Deck } from "@/types/deck";
import { Card as CardType } from "@/types/card";
import { useToast } from "@/hooks/use-toast";
import Image from 'next/image';

function DecksContent() {
  const { user } = useUser();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { toast } = useToast();
  const [allDecks, setAllDecks] = useState<Deck[]>([]);
  const [myDecks, setMyDecks] = useState<Deck[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'my'>('all');
  const [loading, setLoading] = useState(true);
  const [selectingDeck, setSelectingDeck] = useState<string | null>(null);
  const [deckCoverCards, setDeckCoverCards] = useState<Map<string, CardType>>(new Map());

  // Get roomId from query params if user is selecting deck for a game
  const roomId = searchParams.get('roomId');
  const fromGame = roomId !== null;

  const loadDecks = async () => {
    setLoading(true);
    const decks = await getAllDecks();
    setAllDecks(decks);
    
    if (user) {
      const userDecks = decks.filter(deck => deck.userId === user.id);
      setMyDecks(userDecks);
      console.log('User ID:', user.id);
      console.log('All decks:', decks.length);
      console.log('User decks:', userDecks.length);
      console.log('Filtered user decks:', userDecks.map(d => ({ name: d.name, userId: d.userId })));
    }
    
    // Load cover cards for all decks
    const coverCardMap = new Map<string, CardType>();
    const coverCardPromises = decks
      .filter(deck => deck.coverCardId)
      .map(async (deck) => {
        try {
          const card = await getCardById(deck.coverCardId!);
          if (card) {
            coverCardMap.set(deck._id, card);
          }
        } catch (error) {
          console.error(`Failed to load cover card for deck ${deck._id}:`, error);
        }
      });
    
    await Promise.all(coverCardPromises);
    setDeckCoverCards(coverCardMap);
    
    setLoading(false);
  };

  // Check URL parameter for tab and reload decks whenever searchParams change
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam === 'my' && user) {
      setActiveTab('my');
    }
    // Always reload decks when searchParams change to ensure fresh data
    if (user) {
      loadDecks();
    }
  }, [searchParams, user]);

  // Reload decks when user logs in/out
  useEffect(() => {
    if (user) {
      loadDecks();
    }
  }, [user]);

  // Reload decks whenever the component is mounted or becomes visible
  useEffect(() => {
    // Load on mount
    loadDecks();

    // Also reload when page becomes visible (e.g., returning from another tab)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        loadDecks();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  const handleSelectDeckForGame = async (deckId: string) => {
    console.log('handleSelectDeckForGame called', { deckId, userId: user?.id, roomId });
    
    if (!user) {
      console.error('No user found');
      toast({
        title: 'Error',
        description: 'Please sign in first',
        variant: 'destructive',
      });
      return;
    }
    
    if (!roomId) {
      console.error('No roomId found');
      toast({
        title: 'Error',
        description: 'No room ID provided',
        variant: 'destructive',
      });
      return;
    }

    setSelectingDeck(deckId);
    try {
      console.log('Calling selectDeck API...');
      const result = await selectDeck(roomId, {
        userId: user.id,
        deckId,
      });
      console.log('Deck selected successfully:', result);
      
      // Verify that the deck was actually set by fetching the room again
      console.log('Verifying deck selection...');
      let verified = false;
      let attempts = 0;
      const maxAttempts = 10;
      
      while (!verified && attempts < maxAttempts) {
        attempts++;
        await new Promise(resolve => setTimeout(resolve, 300));
        
        try {
          const { getGameRoom } = await import('@/lib/api');
          const room = await getGameRoom(roomId);
          const player = room?.players?.find((p: any) => p.userId === user.id);
          
          if (player?.deckId === deckId) {
            console.log('Deck verified successfully!', player);
            verified = true;
          } else {
            console.log(`Verification attempt ${attempts}: deckId not yet updated`, player);
          }
        } catch (verifyError) {
          console.error('Error verifying deck:', verifyError);
        }
      }
      
      if (verified) {
        toast({
          title: 'Success',
          description: 'Deck selected for game!',
        });
        
        // Navigate back to the game room
        router.push(`/game/room/${roomId}`);
      } else {
        toast({
          title: 'Warning',
          description: 'Deck selected but verification timed out. Please check the room.',
        });
        router.push(`/game/room/${roomId}`);
      }
    } catch (error) {
      console.error('Error selecting deck:', error);
      toast({
        title: 'Error',
        description: `Failed to select deck: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: 'destructive',
      });
    } finally {
      setSelectingDeck(null);
    }
  };

  const handleToggleFavorite = async (deckId: string) => {
    if (!user) {
      alert('Please sign in to favorite decks');
      return;
    }

    const updatedDeck = await toggleDeckFavorite(deckId, user.id);
    if (updatedDeck) {
      // Update the deck in both lists
      setAllDecks(prevDecks =>
        prevDecks.map(deck => deck._id === deckId ? updatedDeck : deck)
      );
      setMyDecks(prevDecks =>
        prevDecks.map(deck => deck._id === deckId ? updatedDeck : deck)
      );
    }
  };

  const isFavorited = (deck: Deck): boolean => {
    return user && deck.favoritedBy ? deck.favoritedBy.includes(user.id) : false;
  };

  const filteredDecks = (decks: Deck[]) => {
    if (!searchQuery) return decks;
    return decks.filter(deck =>
      deck.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      deck.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
      deck.archetype.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  const displayedDecks = activeTab === 'all' ? filteredDecks(allDecks) : filteredDecks(myDecks);

  const DeckCard = ({ deck }: { deck: Deck }) => {
    const coverCard = deckCoverCards.get(deck._id);
    
    return (
      <Card
        className="group relative h-[420px] overflow-hidden border-border transition-all hover:border-primary hover:shadow-xl hover:shadow-primary/20"
      >
        {/* Background Image */}
        {coverCard?.imageUrl ? (
          <div className="absolute inset-0">
            <Image
              src={coverCard.imageUrl}
              alt={deck.name}
              fill
              className="object-cover object-top brightness-110 saturate-110 transition-transform duration-500 group-hover:scale-110"
              sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
            {/* Dark overlay gradient - lighter for more vibrant colors */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/50 to-black/80" />
            {/* Accent gradient overlay */}
            <div className={`absolute inset-0 bg-gradient-to-br ${deck.gradient} opacity-30 mix-blend-overlay`} />
          </div>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-b from-gray-900 to-black" />
        )}

        {/* Content Container */}
        <div className="relative flex h-full flex-col justify-between p-5">
          {/* Top Section - User Info & Date */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 backdrop-blur-sm">
                <span className="text-xs font-bold text-white">
                  {deck.author.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-white">{deck.author}</span>
                <span className="text-xs text-white/70">Other</span>
              </div>
            </div>
            
            {/* Stats in top right */}
            <div className="flex items-center gap-3 text-white/90">
              <button
                onClick={() => handleToggleFavorite(deck._id)}
                className="flex items-center gap-1 transition-all hover:scale-110"
              >
                <Heart
                  className={`h-4 w-4 ${
                    isFavorited(deck)
                      ? 'fill-red-500 text-red-500'
                      : 'text-white hover:text-red-400'
                  }`}
                />
                <span className="text-sm font-semibold">{deck.favoriteCount || 0}</span>
              </button>
              
              <div className="flex items-center gap-1">
                <TrendingUp className="h-4 w-4 text-accent" />
                <span className="text-sm font-semibold">{deck.wins}</span>
              </div>
              
              <div className="flex items-center gap-1">
                <Eye className="h-4 w-4" />
                <span className="text-sm font-semibold">{deck.views}</span>
              </div>
            </div>
          </div>

          {/* Bottom Section - Deck Info */}
          <div className="space-y-4">
            {/* Deck Name */}
            <div>
              <h3 className="mb-2 text-2xl font-bold leading-tight text-white drop-shadow-lg">
                {deck.name}
              </h3>
              <Badge
                variant="secondary"
                className="border border-white/20 bg-white/10 font-semibold text-white backdrop-blur-md"
              >
                {deck.archetype}
              </Badge>
            </div>

            {/* Description */}
            {deck.description && (
              <p className="line-clamp-2 text-sm leading-relaxed text-white/90 drop-shadow">
                {deck.description}
              </p>
            )}

            {/* Action Buttons */}
            {fromGame ? (
              <div className="flex gap-2">
                <Button
                  className="flex-1 border-white/20 bg-white/10 font-semibold text-white backdrop-blur-md hover:bg-white/20"
                  variant="outline"
                  onClick={() => router.push(`/decks/${deck._id}`)}
                >
                  <Eye className="mr-2 h-4 w-4" />
                  View
                </Button>
                <Button
                  className="flex-1 bg-primary font-semibold hover:bg-primary/90"
                  onClick={() => handleSelectDeckForGame(deck._id)}
                  disabled={selectingDeck === deck._id}
                >
                  {selectingDeck === deck._id ? 'Selecting...' : 'Select'}
                  <CheckCircle2 className="ml-2 h-4 w-4" />
                </Button>
              </div>
            ) : (
              <Button
                className="w-full border-white/20 bg-white/10 font-semibold text-white backdrop-blur-md hover:bg-white/20"
                variant="outline"
                onClick={() => router.push(`/decks/${deck._id}`)}
              >
                View Deck
                <Zap className="ml-2 h-4 w-4 transition-transform group-hover:rotate-12" />
              </Button>
            )}
          </div>
        </div>

        {/* Top accent line */}
        <div className={`absolute left-0 right-0 top-0 h-1 bg-gradient-to-r ${deck.gradient}`} />
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="relative py-24 md:py-32">
        <div className="absolute inset-0 -z-10">
          <div className="absolute right-0 top-0 h-96 w-96 animate-pulse rounded-full bg-secondary/10 blur-3xl" />
          <div className="absolute bottom-0 left-1/3 h-96 w-96 animate-pulse rounded-full bg-primary/10 blur-3xl animation-delay-2000" />
        </div>

        <div className="container relative mx-auto px-4 md:px-6">
          {/* Navigation Buttons */}
          <div className="mb-8 flex flex-wrap gap-3">
            {fromGame ? (
              <Button
                variant="outline"
                className="gap-2"
                onClick={() => router.push(`/game/room/${roomId}`)}
              >
                <Home className="h-4 w-4" />
                Back to Game Room
              </Button>
            ) : (
              <>
                <Link href="/">
                  <Button variant="outline" className="gap-2">
                    <Home className="h-4 w-4" />
                    Home
                  </Button>
                </Link>
                <Link href="/deck-builder">
                  <Button variant="outline" className="gap-2">
                    <Sparkles className="h-4 w-4" />
                    Deck Builder
                  </Button>
                </Link>
                <Link href="/deck-builder">
                  <Button className="gap-2">
                    <Plus className="h-4 w-4" />
                    Create Deck
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Header */}
          <div className="mb-8">
            <h1 className="mb-3 text-balance text-4xl font-bold tracking-tight md:text-5xl lg:text-6xl">
              <span className="bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
                {fromGame ? 'Select Your Deck' : 'Battle Decks'}
              </span>
            </h1>
            <p className="text-pretty text-lg text-muted-foreground md:text-xl">
              {fromGame ? 'Choose a deck for your game' : 'Discover and share winning deck strategies'}
            </p>
          </div>

          {/* Search and Tabs */}
          <div className="mb-8 space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search decks by name, author, or archetype..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="flex gap-2">
              <Button
                variant={activeTab === 'all' ? 'default' : 'outline'}
                onClick={() => setActiveTab('all')}
                className="gap-2"
              >
                <Search className="h-4 w-4" />
                All Decks
              </Button>
              {user && (
                <Button
                  variant={activeTab === 'my' ? 'default' : 'outline'}
                  onClick={() => setActiveTab('my')}
                  className="gap-2"
                >
                  <Sparkles className="h-4 w-4" />
                  My Decks ({myDecks.length})
                </Button>
              )}
            </div>
          </div>

          {/* Deck Grid */}
          {loading ? (
            <div className="rounded-lg border border-border bg-card/50 p-12 text-center backdrop-blur-sm">
              <p className="text-lg text-muted-foreground">Loading decks...</p>
            </div>
          ) : displayedDecks.length === 0 ? (
            <div className="rounded-lg border border-border bg-card/50 p-12 text-center backdrop-blur-sm">
              <p className="text-lg text-muted-foreground">
                {searchQuery
                  ? 'No decks found matching your search.'
                  : activeTab === 'my'
                  ? 'You haven\'t created any decks yet. Start building!'
                  : 'No decks found. Create your first deck to get started!'}
              </p>
              {activeTab === 'my' && !searchQuery && (
                <Link href="/deck-builder">
                  <Button className="mt-4 gap-2">
                    <Plus className="h-4 w-4" />
                    Create Your First Deck
                  </Button>
                </Link>
              )}
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {displayedDecks.map((deck) => (
                <DeckCard key={deck._id} deck={deck} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function DecksPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background">
        <div className="relative py-24 md:py-32">
          <div className="container relative mx-auto px-4 md:px-6">
            <div className="rounded-lg border border-border bg-card/50 p-12 text-center backdrop-blur-sm">
              <p className="text-lg text-muted-foreground">Loading decks...</p>
            </div>
          </div>
        </div>
      </div>
    }>
      <DecksContent />
    </Suspense>
  );
}
