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
import { Search, Plus, Trash2, Save, X, ArrowLeft, Heart } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

interface DeckCard extends CardType {
  quantity: number;
  isLifeCard?: boolean;
}

export default function DeckBuilderPage() {
  const router = useRouter();
  const [searchResults, setSearchResults] = useState<CardType[]>([]);
  const [selectedCards, setSelectedCards] = useState<DeckCard[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Search filters
  const [nameFilter, setNameFilter] = useState('');
  const [nameSuggestions, setNameSuggestions] = useState<CardType[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
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
  }, []);

  // Auto-search when filters change
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      performSearch();
    }, 300); // Debounce for 300ms

    return () => clearTimeout(timeoutId);
  }, [nameFilter, typeFilter, rarityFilter, seriesFilter, colorFilter]);

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

  const loadNameSuggestions = async (searchTerm: string) => {
    if (searchTerm.length < 1) {
      setNameSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const results = await searchCards({
      name: searchTerm,
      type: typeFilter && typeFilter !== 'all' ? typeFilter : undefined,
      rarity: rarityFilter && rarityFilter !== 'all' ? rarityFilter : undefined,
      series: seriesFilter && seriesFilter !== 'all' ? seriesFilter : undefined,
      color: colorFilter && colorFilter !== 'all' ? colorFilter : undefined,
    });

    setNameSuggestions(results.slice(0, 10)); // Limit to 10 suggestions
    setShowSuggestions(true);
  };

  const handleNameInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setNameFilter(value);
    if (value.length > 0) {
      loadNameSuggestions(value);
    }
  };

  const selectSuggestion = (cardName: string) => {
    setNameFilter(cardName);
    setShowSuggestions(false);
    setNameSuggestions([]);
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

  const getTotalCardCount = () => {
    return selectedCards
      .filter((card) => !card.isLifeCard)
      .reduce((total, card) => total + card.quantity, 0);
  };

  const getLifeCardCount = () => {
    return selectedCards
      .filter((card) => card.isLifeCard)
      .reduce((total, card) => total + card.quantity, 0);
  };

  const getOnlyOneCardCount = () => {
    return selectedCards
      .filter((card) => card.isLifeCard === false && card.ex === 'Only #1')
      .reduce((total, card) => total + card.quantity, 0);
  };

  const getMaxDeckSize = () => {
    const onlyOneCount = getOnlyOneCardCount();
    return onlyOneCount > 0 ? 49 : 50;
  };

  const getCardQuantity = (cardId: string, isLifeCard: boolean = false, isOnlyOne: boolean = false) => {
    if (isOnlyOne) {
      const card = selectedCards.find(
        (c) => c._id === cardId && c.ex === 'Only #1' && !c.isLifeCard
      );
      return card ? card.quantity : 0;
    }
    const card = selectedCards.find(
      (c) => c._id === cardId && c.isLifeCard === isLifeCard
    );
    return card ? card.quantity : 0;
  };

  const addCardToDeck = (card: CardType) => {
    // Auto-detect if card is a life card based on type
    const isLifeCard = card.type === 'Life';
    const isOnlyOne = card.ex === 'Only #1';
    
    if (isLifeCard) {
      const totalLifeCards = getLifeCardCount();
      if (totalLifeCards >= 5) {
        alert('ไลฟ์การ์ดเต็มแล้ว! (จำกัด 5 ใบ)');
        return;
      }

      const existingCard = selectedCards.find(
        (c) => c._id === card._id && c.isLifeCard
      );
      if (existingCard) {
        if (existingCard.quantity >= 1) {
          alert('ใส่ไลฟ์การ์ดใบนี้ได้แค่ 1 ใบ');
          return;
        }
      } else {
        setSelectedCards([...selectedCards, { ...card, quantity: 1, isLifeCard: true }]);
      }
    } else if (isOnlyOne) {
      const totalOnlyOne = getOnlyOneCardCount();
      if (totalOnlyOne >= 1) {
        alert('Only One การ์ดเต็มแล้ว! (จำกัด 1 ใบ)');
        return;
      }

      const existingCard = selectedCards.find(
        (c) => c._id === card._id && c.ex === 'Only #1'
      );
      if (existingCard) {
        alert('ใส่ Only One การ์ดได้แค่ 1 ใบ');
        return;
      } else {
        setSelectedCards([...selectedCards, { ...card, quantity: 1, isLifeCard: false }]);
      }
    } else {
      const maxDeckSize = getMaxDeckSize();
      const totalCards = getTotalCardCount();
      if (totalCards >= maxDeckSize) {
        alert(`เด็คเต็มแล้ว! (จำกัด ${maxDeckSize} ใบ)`);
        return;
      }

      const existingCard = selectedCards.find(
        (c) => c._id === card._id && !c.isLifeCard
      );
      if (existingCard) {
        if (existingCard.quantity >= 4) {
          alert('ใส่การ์ดใบนี้ได้สูงสุด 4 ใบ');
          return;
        }
        setSelectedCards(
          selectedCards.map((c) =>
            c._id === card._id && !c.isLifeCard
              ? { ...c, quantity: c.quantity + 1 }
              : c
          )
        );
      } else {
        setSelectedCards([
          ...selectedCards,
          { ...card, quantity: 1, isLifeCard: false },
        ]);
      }
    }
  };

  const removeCardFromDeck = (cardId: string, isLifeCard: boolean = false, isOnlyOne: boolean = false) => {
    if (isOnlyOne) {
      setSelectedCards(
        selectedCards.filter(
          (c) => !(c._id === cardId && c.ex === 'Only #1')
        )
      );
      return;
    }

    const existingCard = selectedCards.find(
      (c) => c._id === cardId && c.isLifeCard === isLifeCard
    );
    if (existingCard && existingCard.quantity > 1) {
      setSelectedCards(
        selectedCards.map((c) =>
          c._id === cardId && c.isLifeCard === isLifeCard
            ? { ...c, quantity: c.quantity - 1 }
            : c
        )
      );
    } else {
      setSelectedCards(
        selectedCards.filter(
          (c) => !(c._id === cardId && c.isLifeCard === isLifeCard)
        )
      );
    }
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

    const lifeCardCount = getLifeCardCount();
    if (lifeCardCount !== 5) {
      alert('กรุณาเลือกไลฟ์การ์ดให้ครบ 5 ใบ');
      return;
    }

    setSaving(true);
    // Expand card IDs based on quantities (only deck cards, not life cards)
    const cardIds: string[] = [];
    selectedCards
      .filter((card) => !card.isLifeCard)
      .forEach((card) => {
        for (let i = 0; i < card.quantity; i++) {
          cardIds.push(card._id);
        }
      });

    const deck = {
      name: deckName,
      author: deckAuthor,
      archetype: deckArchetype || 'Other',
      description: deckDescription,
      cardIds,
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

  const lifeCards = selectedCards.filter((card) => card.isLifeCard);
  const onlyOneCards = selectedCards.filter((card) => !card.isLifeCard && card.ex === 'Only #1');
  const deckCards = selectedCards.filter((card) => !card.isLifeCard && card.ex !== 'Only #1');

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4 max-w-[1800px]">
        <div className="mb-6">
          <Link
            href="/decks"
            className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Decks
          </Link>
          <h1 className="mb-2 bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-4xl font-extrabold tracking-tight text-transparent">
            Deck Builder
          </h1>
          <p className="text-muted-foreground">
            Build your deck with 5 life cards, 1 only one card (optional), and up to {getMaxDeckSize()} deck cards
          </p>
        </div>

        <div className="flex gap-4">
          {/* Left Sidebar - Filters */}
          <div className="w-64 shrink-0">
            <Card className="border-2 sticky top-4">
              <CardHeader className="pb-3">
                <h2 className="text-xl font-bold">🔍 Filters</h2>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-1.5 relative">
                  <Label htmlFor="name" className="text-xs font-semibold">
                    Card Name
                  </Label>
                  <Input
                    id="name"
                    placeholder="Search..."
                    value={nameFilter}
                    onChange={handleNameInputChange}
                    onFocus={() => {
                      if (nameFilter && nameSuggestions.length > 0) {
                        setShowSuggestions(true);
                      }
                    }}
                    onBlur={() => {
                      // Delay to allow clicking on suggestions
                      setTimeout(() => setShowSuggestions(false), 200);
                    }}
                    className="h-8 text-sm"
                    autoComplete="off"
                  />
                  
                  {/* Suggestions Dropdown */}
                  {showSuggestions && nameSuggestions.length > 0 && (
                    <div className="absolute z-50 w-full mt-1 bg-popover border border-border rounded-md shadow-lg max-h-60 overflow-y-auto">
                      {nameSuggestions.map((card) => (
                        <div
                          key={card._id}
                          className="px-3 py-2 hover:bg-accent cursor-pointer transition-colors flex items-center gap-2 text-sm"
                          onClick={() => selectSuggestion(card.name)}
                        >
                          {card.imageUrl && (
                            <div className="relative w-8 h-12 flex-shrink-0">
                              <Image
                                src={card.imageUrl}
                                alt={card.name}
                                fill
                                className="object-contain rounded"
                                sizes="32px"
                              />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="font-medium truncate">{card.name}</div>
                            <div className="text-xs text-muted-foreground flex items-center gap-1">
                              <Badge variant="outline" className="text-[10px] px-1 py-0">
                                {card.type}
                              </Badge>
                              <Badge 
                                variant="outline" 
                                className={`text-[10px] px-1 py-0 bg-gradient-to-r ${getRarityColor(card.rare)} text-white border-0`}
                              >
                                {card.rare}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="type" className="text-xs font-semibold">
                    Type
                  </Label>
                  <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger id="type" className="h-8 text-sm">
                      <SelectValue />
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

                <div className="space-y-1.5">
                  <Label htmlFor="rarity" className="text-xs font-semibold">
                    Rarity
                  </Label>
                  <Select value={rarityFilter} onValueChange={setRarityFilter}>
                    <SelectTrigger id="rarity" className="h-8 text-sm">
                      <SelectValue />
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

                <div className="space-y-1.5">
                  <Label htmlFor="series" className="text-xs font-semibold">
                    Series
                  </Label>
                  <Select value={seriesFilter} onValueChange={setSeriesFilter}>
                    <SelectTrigger id="series" className="h-8 text-sm">
                      <SelectValue />
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

                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    onClick={clearFilters}
                    className="flex-1 h-8 text-xs"
                  >
                    <X className="mr-1 h-3 w-3" />
                    Clear Filters
                  </Button>
                </div>

                {/* Deck Info in Sidebar */}
                <div className="border-t pt-4 mt-4 space-y-3">
                  <h3 className="text-sm font-bold">📝 Deck Info</h3>
                  
                  <div className="space-y-1.5">
                    <Label htmlFor="deckName" className="text-xs">
                      Name <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="deckName"
                      placeholder="Deck name"
                      value={deckName}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDeckName(e.target.value)}
                      className="h-8 text-sm"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="deckAuthor" className="text-xs">
                      Author <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="deckAuthor"
                      placeholder="Your name"
                      value={deckAuthor}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDeckAuthor(e.target.value)}
                      className="h-8 text-sm"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="deckArchetype" className="text-xs">
                      Archetype
                    </Label>
                    <Input
                      id="deckArchetype"
                      placeholder="e.g. Aggro"
                      value={deckArchetype}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDeckArchetype(e.target.value)}
                      className="h-8 text-sm"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="deckDescription" className="text-xs">
                      Description
                    </Label>
                    <Textarea
                      id="deckDescription"
                      placeholder="Deck strategy..."
                      value={deckDescription}
                      onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setDeckDescription(e.target.value)}
                      rows={3}
                      className="text-sm"
                    />
                  </div>

                  <Button
                    className="w-full bg-gradient-to-r from-primary via-accent to-secondary font-bold"
                    onClick={handleSaveDeck}
                    disabled={saving || selectedCards.length === 0}
                  >
                    <Save className="mr-2 h-4 w-4" />
                    {saving ? 'Saving...' : 'Save Deck'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 space-y-4">
            {/* Life Cards and Only One Section - Side by Side */}
            <div className="grid grid-cols-2 gap-4">
              {/* Life Cards Section */}
              <Card className="border-2">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold flex items-center gap-2">
                    <Heart className="h-5 w-5 text-red-500 fill-red-500" />
                    Life Cards{' '}
                    <span className="bg-gradient-to-r from-red-500 to-pink-500 bg-clip-text text-transparent">
                      ({getLifeCardCount()}/5)
                    </span>
                  </h2>
                  {lifeCards.length > 0 && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setSelectedCards(selectedCards.filter(c => !c.isLifeCard))}
                    >
                      Clear
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {lifeCards.length === 0 ? (
                  <div className="py-8 text-center text-sm text-muted-foreground border-2 border-dashed rounded-lg">
                    Click + on Life button in search results to add life cards
                  </div>
                ) : (
                  <div className="flex gap-2 flex-wrap">
                    {lifeCards.map((card) => (
                      <div
                        key={`life-${card._id}`}
                        className="group relative w-20 transition-all hover:scale-[3] hover:z-50"
                      >
                        {card.imageUrl && (
                          <div className="relative aspect-[2/3] overflow-hidden rounded border-2 border-red-500 bg-muted/30 shadow-lg">
                            <Image
                              src={card.imageUrl}
                              alt={card.name}
                              fill
                              className="object-contain"
                              sizes="80px"
                            />
                            {/* Hover overlay with controls */}
                            <div className="absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1 p-1">
                              <div className="flex items-center gap-1">
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  className="h-6 w-6 p-0 text-xs"
                                  onClick={() => removeCardFromDeck(card._id, true)}
                                >
                                  -
                                </Button>
                                <span className="text-white text-xs font-bold w-4 text-center">
                                  {card.quantity}
                                </span>
                                <Button
                                  size="sm"
                                  variant="default"
                                  className="h-6 w-6 p-0 text-xs"
                                  onClick={() => addCardToDeck(card)}
                                  disabled={card.quantity >= 1}
                                >
                                  +
                                </Button>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Only One Section */}
            <Card className="border-2">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold flex items-center gap-2">
                    <span className="text-2xl">⭐</span>
                    Only One{' '}
                    <span className="bg-gradient-to-r from-yellow-500 to-orange-500 bg-clip-text text-transparent">
                      ({getOnlyOneCardCount()}/1)
                    </span>
                  </h2>
                  {onlyOneCards.length > 0 && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setSelectedCards(selectedCards.filter(c => c.ex !== 'Only #1'))}
                    >
                      Clear
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {onlyOneCards.length === 0 ? (
                  <div className="py-8 text-center text-sm text-muted-foreground border-2 border-dashed rounded-lg">
                    Click cards with "Only #1" Ex to add here
                  </div>
                ) : (
                  <div className="flex gap-2 flex-wrap">
                    {onlyOneCards.map((card) => (
                      <div
                        key={`only-${card._id}`}
                        className="group relative w-20 transition-all hover:scale-[3] hover:z-50"
                      >
                        {card.imageUrl && (
                          <div className="relative aspect-[2/3] overflow-hidden rounded border-2 border-yellow-500 bg-muted/30 shadow-lg">
                            <Image
                              src={card.imageUrl}
                              alt={card.name}
                              fill
                              className="object-contain"
                              sizes="80px"
                            />
                            {/* Hover overlay with controls */}
                            <div className="absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1 p-1">
                              <Button
                                size="sm"
                                variant="destructive"
                                className="h-6 px-2 text-xs"
                                onClick={() => removeCardFromDeck(card._id, false, true)}
                              >
                                Remove
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
            </div>

            {/* Deck Cards Section */}
            <Card className="border-2">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold">
                    🎴 Main Deck{' '}
                    <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                      ({getTotalCardCount()}/{getMaxDeckSize()})
                    </span>
                  </h2>
                  {deckCards.length > 0 && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setSelectedCards(selectedCards.filter(c => c.isLifeCard || c.ex === 'Only #1'))}
                    >
                      Clear
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {deckCards.length === 0 ? (
                  <div className="py-8 text-center text-sm text-muted-foreground border-2 border-dashed rounded-lg">
                    Click + on Deck button in search results to add cards to main deck
                  </div>
                ) : (
                  <div className="flex gap-2 flex-wrap">
                    {deckCards.map((card) => (
                      <div
                        key={`deck-${card._id}`}
                        className="group relative w-20 transition-all hover:scale-[3] hover:z-50"
                      >
                        {card.imageUrl && (
                          <div className="relative aspect-[2/3] overflow-hidden rounded border-2 border-border bg-muted/30 shadow-lg">
                            <Image
                              src={card.imageUrl}
                              alt={card.name}
                              fill
                              className="object-contain"
                              sizes="80px"
                            />
                            {/* Quantity badge */}
                            <div className="absolute top-1 right-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground shadow-lg ring-2 ring-background">
                              {card.quantity}
                            </div>
                            {/* Hover overlay with controls */}
                            <div className="absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1 p-1">
                              <div className="flex items-center gap-1">
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  className="h-6 w-6 p-0 text-xs"
                                  onClick={() => removeCardFromDeck(card._id, false)}
                                >
                                  -
                                </Button>
                                <span className="text-white text-xs font-bold w-4 text-center">
                                  {card.quantity}
                                </span>
                                <Button
                                  size="sm"
                                  variant="default"
                                  className="h-6 w-6 p-0 text-xs"
                                  onClick={() => addCardToDeck(card)}
                                  disabled={card.quantity >= 4 || getTotalCardCount() >= getMaxDeckSize()}
                                >
                                  +
                                </Button>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Search Results */}
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
                  <div className="py-12 text-center text-muted-foreground">
                    Loading...
                  </div>
                ) : searchResults.length === 0 ? (
                  <div className="py-12 text-center text-muted-foreground">
                    No cards found
                  </div>
                ) : (
                  <div className="grid gap-2 grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10">
                    {searchResults.map((card) => (
                      <div
                        key={card._id}
                        onClick={() => addCardToDeck(card)}
                        className="group relative overflow-hidden rounded-lg border border-border bg-card/50 backdrop-blur-sm transition-all hover:scale-[2.5] hover:z-50 hover:shadow-2xl cursor-pointer"
                      >
                        <div
                          className={`h-0.5 bg-gradient-to-r ${getRarityColor(card.rare)}`}
                        />
                        <div className="p-1">
                          {card.imageUrl && (
                            <div className="relative aspect-[2/3] overflow-hidden rounded border border-border bg-muted/30">
                              <Image
                                src={card.imageUrl}
                                alt={card.name}
                                fill
                                className="object-contain"
                                sizes="100px"
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
