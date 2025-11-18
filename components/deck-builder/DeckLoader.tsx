'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, Download, X, Sparkles } from 'lucide-react';
import { getAllDecks } from '@/lib/api';
import { Deck } from '@/types/deck';

interface DeckLoaderProps {
  onLoadDeck: (deckId: string) => void;
  onClose: () => void;
  loading?: boolean;
}

export function DeckLoader({ onLoadDeck, onClose, loading }: DeckLoaderProps) {
  const { user } = useUser();
  const [allDecks, setAllDecks] = useState<Deck[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'my'>('all');
  const [loadingDecks, setLoadingDecks] = useState(true);
  const [selectedDeckId, setSelectedDeckId] = useState<string | null>(null);

  useEffect(() => {
    loadDecks();
  }, []);

  const loadDecks = async () => {
    setLoadingDecks(true);
    const decks = await getAllDecks();
    setAllDecks(decks);
    setLoadingDecks(false);
  };

  const filteredDecks = () => {
    let decks = allDecks;
    
    // Filter by user if on "my" tab
    if (activeTab === 'my' && user) {
      decks = decks.filter(deck => deck.userId === user.id);
    }
    
    // Filter by search query
    if (searchQuery) {
      decks = decks.filter(deck =>
        deck.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        deck.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
        deck.archetype.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    return decks;
  };

  const handleLoadDeck = (deckId: string) => {
    setSelectedDeckId(deckId);
    onLoadDeck(deckId);
  };

  const displayedDecks = filteredDecks();
  const myDecksCount = user ? allDecks.filter(deck => deck.userId === user.id).length : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <CardHeader className="border-b border-border/50">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Load Deck
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Select a deck to load into the builder
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="shrink-0"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Search Bar */}
          <div className="mt-4">
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
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mt-4">
            <Button
              variant={activeTab === 'all' ? 'default' : 'outline'}
              onClick={() => setActiveTab('all')}
              className="gap-2"
              size="sm"
            >
              <Search className="h-4 w-4" />
              All Decks
            </Button>
            {user && (
              <Button
                variant={activeTab === 'my' ? 'default' : 'outline'}
                onClick={() => setActiveTab('my')}
                className="gap-2"
                size="sm"
              >
                <Sparkles className="h-4 w-4" />
                My Decks ({myDecksCount})
              </Button>
            )}
          </div>
        </CardHeader>

        <CardContent className="flex-1 overflow-y-auto p-6">
          {loadingDecks ? (
            <div className="flex items-center justify-center py-12">
              <p className="text-muted-foreground">Loading decks...</p>
            </div>
          ) : displayedDecks.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <p className="text-muted-foreground">
                {searchQuery
                  ? 'No decks found matching your search.'
                  : activeTab === 'my'
                  ? 'You haven\'t created any decks yet.'
                  : 'No decks available.'}
              </p>
            </div>
          ) : (
            <div className="grid gap-4">
              {displayedDecks.map((deck) => (
                <Card
                  key={deck._id}
                  className="group relative overflow-hidden border-border bg-card/50 backdrop-blur-sm transition-all hover:border-primary/50"
                >
                  <div className={`h-1 bg-gradient-to-r ${deck.gradient}`} />
                  
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-lg font-bold text-foreground truncate">
                            {deck.name}
                          </h3>
                          <Badge variant="secondary" className="shrink-0">
                            {deck.archetype}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          by {deck.author}
                        </p>
                        {deck.description && (
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {deck.description}
                          </p>
                        )}
                      </div>

                      <Button
                        onClick={() => handleLoadDeck(deck._id)}
                        disabled={loading || selectedDeckId === deck._id}
                        className="gap-2 shrink-0"
                        size="sm"
                      >
                        <Download className="h-4 w-4" />
                        {selectedDeckId === deck._id ? 'Loading...' : 'Load'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
