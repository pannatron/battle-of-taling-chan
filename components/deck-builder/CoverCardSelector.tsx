import { useState, useEffect } from 'react';
import { Card as CardType } from '@/types/card';
import { DeckCard } from '@/hooks/useDeckBuilder';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ImageIcon, X } from 'lucide-react';
import Image from 'next/image';
import { getRarityColor } from '@/lib/deckCardUtils';
import { getAllCards } from '@/lib/api';

interface CoverCardSelectorProps {
  selectedCards: DeckCard[];
  coverCardId: string;
  setCoverCardId: (value: string) => void;
  coverCardId2: string;
  setCoverCardId2: (value: string) => void;
}

export function CoverCardSelector({
  selectedCards,
  coverCardId,
  setCoverCardId,
  coverCardId2,
  setCoverCardId2,
}: CoverCardSelectorProps) {
  const [allVariants, setAllVariants] = useState<CardType[]>([]);
  const [allVariants2, setAllVariants2] = useState<CardType[]>([]);
  const [loadingVariants, setLoadingVariants] = useState(false);
  const [loadingVariants2, setLoadingVariants2] = useState(false);

  // Group cards by name
  const cardsByName = selectedCards.reduce((acc, card) => {
    if (!acc[card.name]) {
      acc[card.name] = [];
    }
    acc[card.name].push(card);
    return acc;
  }, {} as Record<string, typeof selectedCards>);

  const uniqueNames = Object.keys(cardsByName).sort();
  const selectedCoverCard = selectedCards.find(card => card._id === coverCardId);
  const selectedCoverCard2 = selectedCards.find(card => card._id === coverCardId2);

  // Fetch all variants for cover card 1
  useEffect(() => {
    const fetchAllVariants = async () => {
      if (!coverCardId || coverCardId === 'none') {
        setAllVariants([]);
        return;
      }

      const selectedCard = selectedCards.find(card => card._id === coverCardId);
      if (!selectedCard) return;

      setLoadingVariants(true);
      try {
        const allCards = await getAllCards();
        const variants = allCards.filter(
          (card: CardType) => card.name === selectedCard.name
        );
        setAllVariants(variants);
      } catch (error) {
        console.error('Failed to fetch card variants:', error);
        const deckVariants = selectedCards.filter(
          card => card.name === selectedCard.name
        );
        setAllVariants(deckVariants as CardType[]);
      } finally {
        setLoadingVariants(false);
      }
    };

    fetchAllVariants();
  }, [coverCardId, selectedCards]);

  // Fetch all variants for cover card 2
  useEffect(() => {
    const fetchAllVariants2 = async () => {
      if (!coverCardId2 || coverCardId2 === 'none') {
        setAllVariants2([]);
        return;
      }

      const selectedCard = selectedCards.find(card => card._id === coverCardId2);
      if (!selectedCard) return;

      setLoadingVariants2(true);
      try {
        const allCards = await getAllCards();
        const variants = allCards.filter(
          (card: CardType) => card.name === selectedCard.name
        );
        setAllVariants2(variants);
      } catch (error) {
        console.error('Failed to fetch card variants:', error);
        const deckVariants = selectedCards.filter(
          card => card.name === selectedCard.name
        );
        setAllVariants2(deckVariants as CardType[]);
      } finally {
        setLoadingVariants2(false);
      }
    };

    fetchAllVariants2();
  }, [coverCardId2, selectedCards]);

  if (selectedCards.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      {/* Cover Card 1 */}
      <div className="space-y-1.5">
        <Label htmlFor="coverCard" className="text-xs flex items-center gap-1">
          <ImageIcon className="h-3 w-3" />
          Cover Card (Primary)
        </Label>
        <Select value={coverCardId} onValueChange={setCoverCardId}>
          <SelectTrigger id="coverCard" className="h-8 text-sm">
            <SelectValue placeholder="Select cover card..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">None</SelectItem>
            {uniqueNames.map((name) => {
              const cardsWithName = cardsByName[name];
              const firstCard = cardsWithName[0];
              return (
                <SelectItem key={firstCard._id} value={firstCard._id}>
                  <div className="flex items-center gap-2">
                    {firstCard.imageUrl ? (
                      <div className="relative w-6 h-9 flex-shrink-0">
                        <Image
                          src={firstCard.imageUrl}
                          alt={name}
                          fill
                          className="object-contain rounded"
                          sizes="24px"
                        />
                      </div>
                    ) : (
                      <div className="w-6 h-9 flex-shrink-0 bg-muted rounded flex items-center justify-center text-[8px] text-muted-foreground">
                        N/A
                      </div>
                    )}
                    <span className="truncate">{name}</span>
                  </div>
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
        
        {/* Cover Card 1 Preview */}
        {coverCardId && coverCardId !== 'none' && (() => {
          const currentCard = selectedCoverCard || allVariants.find(v => v._id === coverCardId);
          
          return (
            <div className="mt-2">
              <div className="flex items-start gap-2">
                <div className="relative w-24 h-36 rounded-lg overflow-hidden border-2 border-primary shadow-lg flex-shrink-0">
                  {currentCard?.imageUrl ? (
                    <Image
                      src={currentCard.imageUrl}
                      alt={currentCard.name}
                      fill
                      className="object-contain"
                      sizes="96px"
                    />
                  ) : (
                    <div className="w-full h-full bg-muted flex items-center justify-center text-xs text-muted-foreground">
                      {loadingVariants ? 'Loading...' : 'No Image'}
                    </div>
                  )}
                </div>
                
                {allVariants.length > 0 && (
                  <div className="flex-1">
                    <Label className="text-[10px] text-muted-foreground mb-1 block">
                      Art Variant ({allVariants.length} available)
                    </Label>
                    <div className="space-y-1 max-h-40 overflow-y-auto">
                      {loadingVariants ? (
                        <div className="text-xs text-muted-foreground px-2 py-1">
                          Loading variants...
                        </div>
                      ) : (
                        allVariants.map((variant) => (
                          <button
                            key={variant._id}
                            type="button"
                            onClick={() => setCoverCardId(variant._id)}
                            className={`w-full text-left px-2 py-1 rounded text-xs transition-colors ${
                              variant._id === coverCardId
                                ? 'bg-primary text-primary-foreground font-medium'
                                : 'bg-muted hover:bg-muted/80'
                            }`}
                          >
                            {variant.rare}
                            {variant.series && (
                              <span className="text-[10px] opacity-70 ml-1">
                                ({variant.series})
                              </span>
                            )}
                          </button>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })()}
      </div>

      {/* Cover Card 2 (Hybrid Mode) */}
      <div className="space-y-1.5 pt-2 border-t">
        <div className="flex items-center justify-between">
          <Label htmlFor="coverCard2" className="text-xs flex items-center gap-1">
            <ImageIcon className="h-3 w-3" />
            Cover Card 2 (Hybrid)
            <Badge variant="outline" className="text-[8px] px-1 py-0 ml-1">
              Optional
            </Badge>
          </Label>
          {coverCardId2 && coverCardId2 !== 'none' && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-5 px-1 text-xs"
              onClick={() => setCoverCardId2('none')}
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>
        <Select value={coverCardId2} onValueChange={setCoverCardId2}>
          <SelectTrigger id="coverCard2" className="h-8 text-sm">
            <SelectValue placeholder="Select second cover (optional)..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">None</SelectItem>
            {uniqueNames.map((name) => {
              const cardsWithName = cardsByName[name];
              const firstCard = cardsWithName[0];
              return (
                <SelectItem key={firstCard._id} value={firstCard._id}>
                  <div className="flex items-center gap-2">
                    {firstCard.imageUrl ? (
                      <div className="relative w-6 h-9 flex-shrink-0">
                        <Image
                          src={firstCard.imageUrl}
                          alt={name}
                          fill
                          className="object-contain rounded"
                          sizes="24px"
                        />
                      </div>
                    ) : (
                      <div className="w-6 h-9 flex-shrink-0 bg-muted rounded flex items-center justify-center text-[8px] text-muted-foreground">
                        N/A
                      </div>
                    )}
                    <span className="truncate">{name}</span>
                  </div>
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
        
        {/* Cover Card 2 Preview */}
        {coverCardId2 && coverCardId2 !== 'none' && (() => {
          const currentCard = selectedCoverCard2 || allVariants2.find(v => v._id === coverCardId2);
          
          return (
            <div className="mt-2">
              <div className="flex items-start gap-2">
                <div className="relative w-24 h-36 rounded-lg overflow-hidden border-2 border-secondary shadow-lg flex-shrink-0">
                  {currentCard?.imageUrl ? (
                    <Image
                      src={currentCard.imageUrl}
                      alt={currentCard.name}
                      fill
                      className="object-contain"
                      sizes="96px"
                    />
                  ) : (
                    <div className="w-full h-full bg-muted flex items-center justify-center text-xs text-muted-foreground">
                      {loadingVariants2 ? 'Loading...' : 'No Image'}
                    </div>
                  )}
                </div>
                
                {allVariants2.length > 0 && (
                  <div className="flex-1">
                    <Label className="text-[10px] text-muted-foreground mb-1 block">
                      Art Variant ({allVariants2.length} available)
                    </Label>
                    <div className="space-y-1 max-h-40 overflow-y-auto">
                      {loadingVariants2 ? (
                        <div className="text-xs text-muted-foreground px-2 py-1">
                          Loading variants...
                        </div>
                      ) : (
                        allVariants2.map((variant) => (
                          <button
                            key={variant._id}
                            type="button"
                            onClick={() => setCoverCardId2(variant._id)}
                            className={`w-full text-left px-2 py-1 rounded text-xs transition-colors ${
                              variant._id === coverCardId2
                                ? 'bg-secondary text-secondary-foreground font-medium'
                                : 'bg-muted hover:bg-muted/80'
                            }`}
                          >
                            {variant.rare}
                            {variant.series && (
                              <span className="text-[10px] opacity-70 ml-1">
                                ({variant.series})
                              </span>
                            )}
                          </button>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })()}
      </div>

      {/* Hybrid Preview */}
      {coverCardId && coverCardId !== 'none' && coverCardId2 && coverCardId2 !== 'none' && (
        <div className="pt-2 border-t">
          <Label className="text-[10px] text-muted-foreground mb-2 block">
            Hybrid Preview (Split View)
          </Label>
          <div className="relative w-full h-40 rounded-lg overflow-hidden border-2 border-accent shadow-lg">
            <div className="flex h-full">
              {/* Left Half */}
              <div className="relative w-1/2 h-full overflow-hidden">
                {(selectedCoverCard || allVariants.find(v => v._id === coverCardId))?.imageUrl ? (
                  <Image
                    src={(selectedCoverCard || allVariants.find(v => v._id === coverCardId))!.imageUrl}
                    alt="Cover 1"
                    fill
                    className="object-cover object-left"
                    sizes="200px"
                  />
                ) : (
                  <div className="w-full h-full bg-muted flex items-center justify-center text-xs">
                    Cover 1
                  </div>
                )}
              </div>
              
              {/* Divider */}
              <div className="w-[2px] bg-accent/50 shrink-0" />
              
              {/* Right Half */}
              <div className="relative w-1/2 h-full overflow-hidden">
                {(selectedCoverCard2 || allVariants2.find(v => v._id === coverCardId2))?.imageUrl ? (
                  <Image
                    src={(selectedCoverCard2 || allVariants2.find(v => v._id === coverCardId2))!.imageUrl}
                    alt="Cover 2"
                    fill
                    className="object-cover object-right"
                    sizes="200px"
                  />
                ) : (
                  <div className="w-full h-full bg-muted flex items-center justify-center text-xs">
                    Cover 2
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
