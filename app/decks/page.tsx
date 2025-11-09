'use client';

import { useState, useEffect, Suspense } from 'react';
import { useUser } from '@clerk/nextjs';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Eye, Heart, TrendingUp, Zap, Home, Plus, Search, Sparkles } from "lucide-react";
import { getAllDecks, getUserDecks, toggleDeckFavorite } from "@/lib/api";
import { Deck } from "@/types/deck";

function DecksContent() {
  const { user } = useUser();
  const searchParams = useSearchParams();
  const [allDecks, setAllDecks] = useState<Deck[]>([]);
  const [myDecks, setMyDecks] = useState<Deck[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'my'>('all');
  const [loading, setLoading] = useState(true);

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

  const DeckCard = ({ deck }: { deck: Deck }) => (
    <Card
      className="group relative overflow-hidden border-border bg-card/50 backdrop-blur-sm transition-all hover:border-glow hover:card-glow"
    >
      <div className={`h-1 bg-gradient-to-r ${deck.gradient}`} />
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />

      <CardHeader className="relative pb-4">
        <div className="mb-3 flex items-start justify-between gap-2">
          <h3 className="text-xl font-bold text-foreground group-hover:text-glow">
            {deck.name}
          </h3>
          <Badge
            variant="secondary"
            className="border border-border/40 bg-muted/50 font-semibold backdrop-blur-sm"
          >
            {deck.archetype}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">by {deck.author}</p>
      </CardHeader>

      <CardContent className="relative space-y-4">
        {deck.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {deck.description}
          </p>
        )}

        <div className="flex items-center gap-6 text-sm">
          <div className="flex items-center gap-1.5">
            <div className="rounded-md bg-accent/20 p-1">
              <TrendingUp className="h-3.5 w-3.5 text-accent" />
            </div>
            <span className="font-bold text-foreground">{deck.wins}</span>
            <span className="text-muted-foreground">wins</span>
          </div>
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Eye className="h-3.5 w-3.5" />
            <span>{deck.views}</span>
          </div>
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Heart className="h-3.5 w-3.5" />
            <span>{deck.likes}</span>
          </div>
          <button
            onClick={() => handleToggleFavorite(deck._id)}
            className="ml-auto flex items-center gap-1.5 text-sm transition-colors hover:text-primary"
          >
            <Heart
              className={`h-4 w-4 transition-all ${
                isFavorited(deck)
                  ? 'fill-red-500 text-red-500'
                  : 'text-muted-foreground hover:text-red-500'
              }`}
            />
            <span className="font-semibold">{deck.favoriteCount || 0}</span>
          </button>
        </div>

        <Link href={`/decks/${deck._id}`}>
          <Button
            className="group/btn relative w-full overflow-hidden border-border/40 bg-card/50 font-semibold backdrop-blur-sm hover:border-glow"
            variant="outline"
          >
            <span className="relative z-10 flex items-center gap-2">
              View Deck
              <Zap className="h-4 w-4 transition-transform group-hover/btn:rotate-12" />
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-accent/10 opacity-0 transition-opacity group-hover/btn:opacity-100" />
          </Button>
        </Link>
      </CardContent>
    </Card>
  );

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
          </div>

          {/* Header */}
          <div className="mb-8">
            <h1 className="mb-3 text-balance text-4xl font-bold tracking-tight md:text-5xl lg:text-6xl">
              <span className="bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
                Battle Decks
              </span>
            </h1>
            <p className="text-pretty text-lg text-muted-foreground md:text-xl">
              Discover and share winning deck strategies
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
