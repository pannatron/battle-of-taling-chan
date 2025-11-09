import { Card as CardType } from '@/types/card';
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
import { X, Save } from 'lucide-react';
import Image from 'next/image';
import { getRarityColor } from '@/lib/deckCardUtils';

interface DeckFiltersProps {
  nameFilter: string;
  setNameFilter: (value: string) => void;
  nameSuggestions: CardType[];
  showSuggestions: boolean;
  setShowSuggestions: (value: boolean) => void;
  loadNameSuggestions: (searchTerm: string) => void;
  typeFilter: string;
  setTypeFilter: (value: string) => void;
  rarityFilter: string;
  setRarityFilter: (value: string) => void;
  seriesFilter: string;
  setSeriesFilter: (value: string) => void;
  types: string[];
  rarities: string[];
  series: string[];
  clearFilters: () => void;
  deckName: string;
  setDeckName: (value: string) => void;
  deckArchetype: string;
  setDeckArchetype: (value: string) => void;
  deckDescription: string;
  setDeckDescription: (value: string) => void;
  handleSaveDeck: () => void;
  saving: boolean;
  hasCards: boolean;
}

export function DeckFilters({
  nameFilter,
  setNameFilter,
  nameSuggestions,
  showSuggestions,
  setShowSuggestions,
  loadNameSuggestions,
  typeFilter,
  setTypeFilter,
  rarityFilter,
  setRarityFilter,
  seriesFilter,
  setSeriesFilter,
  types,
  rarities,
  series,
  clearFilters,
  deckName,
  setDeckName,
  deckArchetype,
  setDeckArchetype,
  deckDescription,
  setDeckDescription,
  handleSaveDeck,
  saving,
  hasCards,
}: DeckFiltersProps) {
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
  };

  return (
    <Card className="border-2 lg:sticky lg:top-4">
      <CardHeader className="pb-2 md:pb-3">
        <h2 className="text-lg md:text-xl font-bold">🔍 Filters</h2>
      </CardHeader>
      <CardContent className="space-y-2 md:space-y-3">
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
              setTimeout(() => setShowSuggestions(false), 200);
            }}
            className="h-8 text-sm"
            autoComplete="off"
          />

          {showSuggestions && nameSuggestions.length > 0 && (
            <div className="absolute z-50 w-full mt-1 bg-popover border border-border rounded-md shadow-lg max-h-60 overflow-y-auto">
              {nameSuggestions.map((card) => (
                <div
                  key={card._id}
                  className="px-3 py-2 hover:bg-accent cursor-pointer transition-colors flex items-center gap-2 text-sm"
                  onClick={() => selectSuggestion(card.name)}
                >
                  {card.imageUrl ? (
                    <div className="relative w-8 h-12 flex-shrink-0">
                      <Image
                        src={card.imageUrl}
                        alt={card.name}
                        fill
                        className="object-contain rounded"
                        sizes="32px"
                      />
                    </div>
                  ) : (
                    <div className="w-8 h-12 flex-shrink-0 bg-muted rounded flex items-center justify-center text-xs text-muted-foreground">
                      N/A
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
              {types.filter(type => type && type.trim() !== '').map((type) => (
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
              {rarities.filter(rarity => rarity && rarity.trim() !== '').map((rarity) => (
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
              {series.filter(s => s && s.trim() !== '').map((s) => (
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

        {/* Deck Info */}
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
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                setDeckDescription(e.target.value)
              }
              rows={3}
              className="text-sm"
            />
          </div>

          <Button
            className="w-full bg-gradient-to-r from-primary via-accent to-secondary font-bold"
            onClick={handleSaveDeck}
            disabled={saving || !hasCards}
          >
            <Save className="mr-2 h-4 w-4" />
            {saving ? 'Saving...' : 'Save Deck'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
