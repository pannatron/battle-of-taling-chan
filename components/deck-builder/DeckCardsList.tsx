import { DeckCard } from '@/hooks/useDeckBuilder';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart } from 'lucide-react';
import Image from 'next/image';

interface DeckCardsListProps {
  lifeCards: DeckCard[];
  onlyOneCards: DeckCard[];
  sideDeckCards: DeckCard[];
  deckCards: DeckCard[];
  getLifeCardCount: () => number;
  getOnlyOneCardCount: () => number;
  getSideDeckCardCount: () => number;
  getTotalCardCount: () => number;
  getMaxDeckSize: () => number;
  isMainDeckFull: () => boolean;
  onAddCard: (card: DeckCard, target: 'main' | 'life' | 'side') => void;
  onRemoveCard: (cardId: string, isLife: boolean, isOnlyOne: boolean, isSideDeck: boolean) => void;
  onClearSection: (section: 'life' | 'onlyOne' | 'sideDeck' | 'deck') => void;
}

export function DeckCardsList({
  lifeCards,
  onlyOneCards,
  sideDeckCards,
  deckCards,
  getLifeCardCount,
  getOnlyOneCardCount,
  getSideDeckCardCount,
  getTotalCardCount,
  getMaxDeckSize,
  isMainDeckFull,
  onAddCard,
  onRemoveCard,
  onClearSection,
}: DeckCardsListProps) {
  const sideDeckOnlyOneCards = sideDeckCards.filter((card) => card.ex === 'Only #1');
  const sideDeckRegularCards = sideDeckCards.filter((card) => card.ex !== 'Only #1');

  return (
    <>
      {/* Life Cards & Only One - Combined Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-3">
        <Card className="border-2">
          <CardContent className="pt-2 pb-2 md:pt-3 md:pb-3">
            <div className="flex gap-2 sm:gap-4 items-stretch">
              {/* Life Cards Section */}
              <div className="flex-1 flex flex-col">
                <h2 className="text-xs sm:text-sm font-bold flex items-center gap-1 leading-5 sm:leading-6 mb-1 sm:mb-1.5">
                  <Heart className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-red-500 fill-red-500" />
                  Life{' '}
                  <span className="bg-gradient-to-r from-red-500 to-pink-500 bg-clip-text text-transparent">
                    ({getLifeCardCount()}/5)
                  </span>
                </h2>
                {lifeCards.length === 0 ? (
                  <div className="py-3 sm:py-4 text-center text-xs text-muted-foreground border-2 border-dashed rounded-lg">
                    Add life cards
                  </div>
                ) : (
                  <>
                    <div className="flex gap-1 sm:gap-1.5 justify-start flex-wrap mb-1 sm:mb-1.5">
                      {lifeCards.map((card) => (
                        <div
                          key={`life-${card._id}`}
                          className="group relative w-12 sm:w-16 transition-all hover:scale-[2] sm:hover:scale-[3] hover:z-50"
                        >
                          <div className="relative aspect-[2/3] overflow-hidden rounded border border-red-500 sm:border-2 bg-muted/30 shadow-lg">
                            {card.imageUrl ? (
                              <Image
                                src={card.imageUrl}
                                alt={card.name}
                                fill
                                className="object-contain"
                                sizes="64px"
                              />
                            ) : (
                              <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground">
                                <div className="text-xl mb-0.5">🃏</div>
                                <div className="text-[7px] text-center px-0.5 leading-tight">
                                  {card.name}
                                </div>
                              </div>
                            )}
                            <div className="absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-0.5 sm:gap-1 p-0.5 sm:p-1">
                              <div className="flex items-center gap-0.5 sm:gap-1">
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  className="h-5 w-5 sm:h-6 sm:w-6 p-0 text-[10px] sm:text-xs"
                                  onClick={() => onRemoveCard(card._id, true, false, false)}
                                >
                                  -
                                </Button>
                                <span className="text-white text-[10px] sm:text-xs font-bold w-3 sm:w-4 text-center">
                                  {card.quantity}
                                </span>
                                <Button
                                  size="sm"
                                  variant="default"
                                  className="h-5 w-5 sm:h-6 sm:w-6 p-0 text-[10px] sm:text-xs"
                                  onClick={() => onAddCard(card, 'life')}
                                  disabled={card.quantity >= 1}
                                >
                                  +
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onClearSection('life')}
                      className="h-4 sm:h-5 px-1 sm:px-1.5 text-[9px] sm:text-[10px] w-fit"
                    >
                      Clear
                    </Button>
                  </>
                )}
              </div>

              {/* Only One Section */}
              <div className="flex-shrink-0 flex flex-col items-start">
                <h2 className="text-xs sm:text-sm font-bold flex items-center gap-1 leading-5 sm:leading-6 mb-1 sm:mb-1.5">
                  <span className="text-sm sm:text-base leading-5 sm:leading-6">⭐</span>
                  Only One{' '}
                  <span className="bg-gradient-to-r from-yellow-500 to-orange-500 bg-clip-text text-transparent">
                    ({getOnlyOneCardCount()}/1)
                  </span>
                </h2>
                {onlyOneCards.length === 0 ? (
                  <div className="w-12 sm:w-16 py-3 sm:py-4 text-center text-xs text-muted-foreground border-2 border-dashed rounded-lg">
                    Only #1
                  </div>
                ) : (
                  <>
                    <div className="flex gap-1 sm:gap-1.5 mb-1 sm:mb-1.5">
                      {onlyOneCards.map((card) => (
                        <div
                          key={`only-${card._id}`}
                          className="group relative w-12 sm:w-16 transition-all hover:scale-[2] sm:hover:scale-[3] hover:z-50"
                        >
                          <div className="relative aspect-[2/3] overflow-hidden rounded border border-yellow-500 sm:border-2 bg-muted/30 shadow-lg">
                            {card.imageUrl ? (
                              <Image
                                src={card.imageUrl}
                                alt={card.name}
                                fill
                                className="object-contain"
                                sizes="64px"
                              />
                            ) : (
                              <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground">
                                <div className="text-xl mb-0.5">🃏</div>
                                <div className="text-[7px] text-center px-0.5 leading-tight">
                                  {card.name}
                                </div>
                              </div>
                            )}
                            <div className="absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-0.5 sm:gap-1 p-0.5 sm:p-1">
                              <Button
                                size="sm"
                                variant="destructive"
                                className="h-5 sm:h-6 px-1.5 sm:px-2 text-[10px] sm:text-xs"
                                onClick={() => onRemoveCard(card._id, false, true, false)}
                              >
                                Remove
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onClearSection('onlyOne')}
                      className="h-4 sm:h-5 px-1 sm:px-1.5 text-[9px] sm:text-[10px] w-fit"
                    >
                      Clear
                    </Button>
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Side Deck Section */}
        <Card className="border-2">
          <CardContent className="pt-2 pb-2 md:pt-3 md:pb-3">
            <div className="flex items-center justify-between mb-1 sm:mb-1.5">
              <h2 className="text-xs sm:text-sm font-bold flex items-center gap-1">
                <span className="text-sm sm:text-base">🔄</span>
                Side Deck{' '}
                <span className="bg-gradient-to-r from-cyan-500 to-blue-500 bg-clip-text text-transparent">
                  ({getSideDeckCardCount()}/11)
                </span>
              </h2>
              {sideDeckCards.length > 0 && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onClearSection('sideDeck')}
                  className="h-4 sm:h-5 px-1 sm:px-1.5 text-[9px] sm:text-[10px]"
                >
                  Clear
                </Button>
              )}
            </div>
            {sideDeckCards.length === 0 ? (
              <div className="py-3 sm:py-4 text-center text-xs text-muted-foreground border-2 border-dashed rounded-lg">
                {isMainDeckFull() ? 'Right-click to add' : 'Fill main deck first'}
              </div>
            ) : (
              <div className="flex gap-1 sm:gap-1.5 flex-wrap">
                {sideDeckOnlyOneCards.map((card) => (
                  <div
                    key={`side-only-${card._id}`}
                    className="group relative w-12 sm:w-16 transition-all hover:scale-[2] sm:hover:scale-[3] hover:z-50"
                  >
                    <div className="relative aspect-[2/3] overflow-hidden rounded border border-yellow-500 sm:border-2 bg-muted/30 shadow-lg">
                      {card.imageUrl ? (
                        <Image
                          src={card.imageUrl}
                          alt={card.name}
                          fill
                          className="object-contain"
                          sizes="64px"
                        />
                      ) : (
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground">
                          <div className="text-xl mb-0.5">🃏</div>
                          <div className="text-[7px] text-center px-0.5 leading-tight">
                            {card.name}
                          </div>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-0.5 sm:gap-1 p-0.5 sm:p-1">
                        <Button
                          size="sm"
                          variant="destructive"
                          className="h-5 sm:h-6 px-1.5 sm:px-2 text-[10px] sm:text-xs"
                          onClick={() => onRemoveCard(card._id, false, false, true)}
                        >
                          Remove
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}

                {sideDeckOnlyOneCards.length > 0 && sideDeckRegularCards.length > 0 && (
                  <div className="w-2 sm:w-4"></div>
                )}

                {sideDeckRegularCards.map((card) => (
                  <div
                    key={`side-regular-${card._id}`}
                    className="group relative w-12 sm:w-16 transition-all hover:scale-[2] sm:hover:scale-[3] hover:z-50"
                  >
                    <div className="relative aspect-[2/3] overflow-hidden rounded border border-cyan-500 sm:border-2 bg-muted/30 shadow-lg">
                      {card.imageUrl ? (
                        <Image
                          src={card.imageUrl}
                          alt={card.name}
                          fill
                          className="object-contain"
                          sizes="64px"
                        />
                      ) : (
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground">
                          <div className="text-xl mb-0.5">🃏</div>
                          <div className="text-[7px] text-center px-0.5 leading-tight">
                            {card.name}
                          </div>
                        </div>
                      )}
                      <div className="absolute top-0.5 right-0.5 flex h-3 w-3 sm:h-4 sm:w-4 items-center justify-center rounded-full bg-cyan-500 text-[7px] sm:text-[8px] font-bold text-white shadow-lg ring-1 ring-background">
                        {card.quantity}
                      </div>
                      <div className="absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-0.5 sm:gap-1 p-0.5 sm:p-1">
                        <div className="flex items-center gap-0.5 sm:gap-1">
                          <Button
                            size="sm"
                            variant="destructive"
                            className="h-5 w-5 sm:h-6 sm:w-6 p-0 text-[10px] sm:text-xs"
                            onClick={() => onRemoveCard(card._id, false, false, true)}
                          >
                            -
                          </Button>
                          <span className="text-white text-[10px] sm:text-xs font-bold w-3 sm:w-4 text-center">
                            {card.quantity}
                          </span>
                          <Button
                            size="sm"
                            variant="default"
                            className="h-5 w-5 sm:h-6 sm:w-6 p-0 text-[10px] sm:text-xs"
                            onClick={() => onAddCard(card, 'side')}
                            disabled={card.quantity >= 4 || getSideDeckCardCount() >= 11}
                          >
                            +
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Main Deck Section */}
      <Card className="border-2">
        <CardHeader className="pb-2 md:pb-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base sm:text-lg md:text-xl font-bold">
              🎴 Main Deck{' '}
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                ({getTotalCardCount()}/{getMaxDeckSize()})
              </span>
            </h2>
            {deckCards.length > 0 && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onClearSection('deck')}
                className="text-xs sm:text-sm"
              >
                Clear
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {deckCards.length === 0 ? (
            <div className="py-6 sm:py-8 text-center text-xs sm:text-sm text-muted-foreground border-2 border-dashed rounded-lg">
              Click + on Deck button in search results to add cards to main deck
            </div>
          ) : (
            <div className="flex gap-1.5 sm:gap-2 flex-wrap">
              {deckCards.map((card) => (
                <div
                  key={`deck-${card._id}`}
                  className="group relative w-14 sm:w-16 md:w-20 transition-all hover:scale-[2] sm:hover:scale-[2.5] md:hover:scale-[3] hover:z-50"
                >
                  <div className="relative aspect-[2/3] overflow-hidden rounded border border-border sm:border-2 bg-muted/30 shadow-lg">
                    {card.imageUrl ? (
                      <Image
                        src={card.imageUrl}
                        alt={card.name}
                        fill
                        className="object-contain"
                        sizes="80px"
                      />
                    ) : (
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground">
                        <div className="text-2xl mb-1">🃏</div>
                        <div className="text-[8px] text-center px-1 leading-tight">
                          {card.name}
                        </div>
                      </div>
                    )}
                    <div className="absolute top-0.5 right-0.5 sm:top-1 sm:right-1 flex h-4 w-4 sm:h-5 sm:w-5 items-center justify-center rounded-full bg-primary text-[8px] sm:text-[10px] font-bold text-primary-foreground shadow-lg ring-1 sm:ring-2 ring-background">
                      {card.quantity}
                    </div>
                    <div className="absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-0.5 sm:gap-1 p-0.5 sm:p-1">
                      <div className="flex items-center gap-0.5 sm:gap-1">
                        <Button
                          size="sm"
                          variant="destructive"
                          className="h-5 w-5 sm:h-6 sm:w-6 p-0 text-[10px] sm:text-xs"
                          onClick={() => onRemoveCard(card._id, false, false, false)}
                        >
                          -
                        </Button>
                        <span className="text-white text-[10px] sm:text-xs font-bold w-3 sm:w-4 text-center">
                          {card.quantity}
                        </span>
                        <Button
                          size="sm"
                          variant="default"
                          className="h-5 w-5 sm:h-6 sm:w-6 p-0 text-[10px] sm:text-xs"
                          onClick={() => onAddCard(card, 'main')}
                          disabled={card.quantity >= 4 || getTotalCardCount() >= getMaxDeckSize()}
                        >
                          +
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
}
