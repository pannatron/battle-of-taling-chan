'use client';

import { useState, useEffect } from 'react';
import { Card as CardType } from '@/types/card';
import { searchCards, getDistinctCardValues, createDeck } from '@/lib/api';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, Plus, Trash2, Save, X, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function DeckBuilderPage() {
  const router = useRouter();
  const [searchResults, setSearchResults] = useState<CardType[]>([]);
  const [selectedCards, setSelectedCards] = useState<CardType[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Search filters
  const [nameFilter, setNameFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [rarityFilter, setRarityFilter] = useState('all');
  const [seriesFilter, setSeriesFilter] = useState('all');
  const [colorFilter, setColorFilter] = useState('all');

  // Deck metadata
  const [deckName, setDeckName] = useState('');
  const [deckAuthor, setDeckAuthor] = useState('');
  const [deckArchetype, setDeckArchetype] = useState('');
  const [deckDescription, setDeckDescription] = useState('');

  // Filter options
  const [types, setTypes] = useState<string[]>([]);
  const [rarities, setRarities] = useState<string[]>([]);
  const [series, setSeries] = useState<string[]>([]);
  const [colors, setColors] = useState<string[]>([]);

  useEffect(() => {
    loadFilterOptions();
    performSearch();
  }, []);

  const loadFilterOptions = async () => {
    const [typesData, raritiesData, seriesData, colorsData] = await Promise.all([
      getDistinctCardValues('type'),
      getDistinctCardValues('rare'),
      getDistinctCardValues('series'),
      getDistinctCardValues('color'),
    ]);

    setTypes(typesData);
    setRarities(raritiesData);
    setSeries(seriesData);
    setColors(colorsData);
  };

  const performSearch = async () => {
    setLoading(true);
    const results = await searchCards({
      name: nameFilter || undefined,
      type: typeFilter && typeFilter !== 'all' ? typeFilter : undefined,
      rarity: rarityFilter && rarityFilter !== 'all' ? rarityFilter : undefined,
      series: seriesFilter && seriesFilter !== 'all' ? seriesFilter : undefined,
      color: colorFilter && colorFilter !== 'all' ? colorFilter : undefined,
    });
    setSearchResults(results);
    setLoading(false);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    performSearch();
  };

  const addCardToDeck = (card: CardType) => {
    if (!selectedCards.find((c) => c._id === card._id)) {
      setSelectedCards([...selectedCards, card]);
    }
  };

  const removeCardFromDeck = (cardId: string) => {
    setSelectedCards(selectedCards.filter((c) => c._id !== cardId));
  };

  const clearFilters = () => {
    setNameFilter('');
    setTypeFilter('all');
    setRarityFilter('all');
    setSeriesFilter('all');
    setColorFilter('all');
    performSearch();
  };

  const handleSaveDeck = async () => {
    if (!deckName || !deckAuthor || selectedCards.length === 0) {
      alert('กรุณากรอกชื่อเด็ค ชื่อผู้สร้าง และเลือกการ์ดอย่างน้อย 1 ใบ');
      return;
    }

    setSaving(true);
    const deck = {
      name: deckName,
      author: deckAuthor,
      archetype: deckArchetype || 'Other',
      description: deckDescription,
      cardIds: selectedCards.map((c) => c._id),
      wins: 0,
      views: 0,
      likes: 0,
      gradient: 'from-blue-500 to-purple-600',
    };

    const result = await createDeck(deck);
    setSaving(false);

    if (result) {
      alert('สร้างเด็คสำเร็จ!');
      router.push('/decks');
    } else {
      alert('เกิดข้อผิดพลาดในการสร้างเด็ค');
    }
  };

  const getRarityColor = (rare: string) => {
    switch (rare) {
      case 'UR':
        return 'from-yellow-500 to-orange-500';
      case 'SR':
        return 'from-purple-500 to-pink-500';
      case 'PR':
        return 'from-blue-500 to-cyan-500';
      case 'CBR':
        return 'from-red-500 to-orange-500';
      default:
        return 'from-gray-500 to-gray-600';
    }
  };

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <Link
            href="/decks"
            className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Decks
          </Link>
          <h1 className="mb-2 bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-5xl font-extrabold tracking-tight text-transparent">
            Deck Builder
          </h1>
          <p className="text-lg text-muted-foreground">
            Search cards and build your deck
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left Column - Search and Results */}
          <div className="space-y-6 lg:col-span-2">
            {/* Search Filters */}
            <Card className="border-2">
              <CardHeader>
                <h2 className="text-2xl font-bold tracking-tight">🔍 Search Cards</h2>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSearch} className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-sm font-semibold">
                        Card Name
                      </Label>
                      <Input
                        id="name"
                        placeholder="Search card name..."
                        value={nameFilter}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNameFilter(e.target.value)}
                        className="border-2 font-medium transition-all focus:border-primary"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="type" className="text-sm font-semibold">
                        Type
                      </Label>
                      <Select value={typeFilter} onValueChange={setTypeFilter}>
                        <SelectTrigger id="type">
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All</SelectItem>
                          {types.map((type) => (
                            <SelectItem key={type} value={type}>
                              {type}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="rarity" className="text-sm font-semibold">
                        Rarity
                      </Label>
                      <Select
                        value={rarityFilter}
                        onValueChange={setRarityFilter}
                      >
                        <SelectTrigger id="rarity">
                          <SelectValue placeholder="Select rarity" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All</SelectItem>
                          {rarities.map((rarity) => (
                            <SelectItem key={rarity} value={rarity}>
                              {rarity}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="series" className="text-sm font-semibold">
                        Series
                      </Label>
                      <Select
                        value={seriesFilter}
                        onValueChange={setSeriesFilter}
                      >
                        <SelectTrigger id="series">
                          <SelectValue placeholder="Select series" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All</SelectItem>
                          {series.map((s) => (
                            <SelectItem key={s} value={s}>
                              {s}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      type="submit"
                      disabled={loading}
                      className="bg-gradient-to-r from-primary to-accent font-semibold"
                    >
                      <Search className="mr-2 h-4 w-4" />
                      Search
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={clearFilters}
                      className="border-2 font-semibold"
                    >
                      <X className="mr-2 h-4 w-4" />
                      Clear Filters
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            {/* Search Results */}
            <Card className="border-2">
              <CardHeader>
                <h2 className="text-2xl font-bold tracking-tight">
                  📋 Search Results{' '}
                  <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                    ({searchResults.length} cards)
                  </span>
                </h2>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="py-12 text-center text-muted-foreground">
                    Loading...
                  </div>
                ) : searchResults.length === 0 ? (
                  <div className="py-12 text-center text-muted-foreground">
                    No cards found
                  </div>
                ) : (
                  <div className="grid gap-4 sm:grid-cols-2">
                    {searchResults.map((card) => (
                      <div
                        key={card._id}
                        className="group relative overflow-hidden rounded-lg border border-border bg-card/50 backdrop-blur-sm transition-all hover:border-glow"
                      >
                        <div
                          className={`h-1 bg-gradient-to-r ${getRarityColor(card.rare)}`}
                        />
                        <div className="p-4">
                          <div className="mb-2 flex items-start justify-between gap-2">
                            <h3 className="font-thai flex-1 font-bold text-foreground line-clamp-2">
                              {card.name}
                            </h3>
                            <Badge variant="secondary" className="text-xs">
                              {card.type}
                            </Badge>
                          </div>
                          <div className="mb-3 flex items-center gap-2 text-xs text-muted-foreground">
                            <span className="font-mono">{card.print}</span>
                            <span>•</span>
                            <Badge variant="outline" className="text-xs">
                              {card.rare}
                            </Badge>
                          </div>
                          <div className="flex gap-2 text-xs">
                            {card.cost && (
                              <div className="rounded bg-muted/50 px-2 py-1">
                                Cost: {card.cost}
                              </div>
                            )}
                            {card.power && (
                              <div className="rounded bg-muted/50 px-2 py-1">
                                Power: {card.power}
                              </div>
                            )}
                          </div>
                          <Button
                            size="sm"
                            className="mt-3 w-full"
                            onClick={() => addCardToDeck(card)}
                            disabled={selectedCards.some(
                              (c) => c._id === card._id
                            )}
                          >
                            <Plus className="mr-2 h-4 w-4" />
                            {selectedCards.some((c) => c._id === card._id)
                              ? 'Added'
                              : 'Add to Deck'}
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Deck Builder */}
          <div className="space-y-6">
            {/* Deck Info */}
            <Card className="border-2">
              <CardHeader>
                <h2 className="text-2xl font-bold tracking-tight">📝 Deck Information</h2>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="deckName" className="text-sm font-semibold">
                    Deck Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="deckName"
                    placeholder="Your deck name"
                    value={deckName}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDeckName(e.target.value)}
                    className="border-2 font-medium transition-all focus:border-primary"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="deckAuthor" className="text-sm font-semibold">
                    Author <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="deckAuthor"
                    placeholder="Your name"
                    value={deckAuthor}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDeckAuthor(e.target.value)}
                    className="border-2 font-medium transition-all focus:border-primary"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="deckArchetype" className="text-sm font-semibold">
                    Deck Archetype
                  </Label>
                  <Input
                    id="deckArchetype"
                    placeholder="e.g. Aggro, Control, Combo"
                    value={deckArchetype}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDeckArchetype(e.target.value)}
                    className="border-2 font-medium transition-all focus:border-primary"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="deckDescription" className="text-sm font-semibold">
                    Description
                  </Label>
                  <Textarea
                    id="deckDescription"
                    placeholder="Describe your deck strategy and playstyle"
                    value={deckDescription}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setDeckDescription(e.target.value)}
                    rows={4}
                    className="border-2 font-medium transition-all focus:border-primary"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Selected Cards */}
            <Card className="border-2">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold tracking-tight">
                    🎴 Cards in Deck{' '}
                    <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                      ({selectedCards.length})
                    </span>
                  </h2>
                  {selectedCards.length > 0 && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setSelectedCards([])}
                    >
                      Clear All
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {selectedCards.length === 0 ? (
                  <div className="py-8 text-center text-sm text-muted-foreground">
                    No cards in deck yet
                  </div>
                ) : (
                  <div className="space-y-2">
                    {selectedCards.map((card) => (
                      <div
                        key={card._id}
                        className="flex items-center gap-2 rounded-lg border border-border bg-card/50 p-3"
                      >
                        <div className="flex-1">
                          <div className="font-thai font-semibold text-foreground line-clamp-1">
                            {card.name}
                          </div>
                          <div className="flex gap-2 text-xs text-muted-foreground">
                            <span>{card.type}</span>
                            <span>•</span>
                            <span>{card.rare}</span>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => removeCardFromDeck(card._id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Save Button */}
            <Button
              className="w-full bg-gradient-to-r from-primary via-accent to-secondary font-bold text-lg shadow-lg transition-all hover:shadow-xl"
              size="lg"
              onClick={handleSaveDeck}
              disabled={saving || selectedCards.length === 0}
            >
              <Save className="mr-2 h-5 w-5" />
              {saving ? 'Saving...' : 'Save Deck'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
