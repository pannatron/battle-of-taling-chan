'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, Layers, RotateCw, Search, X } from 'lucide-react';
import { GamePlayer } from '@/types/game';
import { Card as CardType } from '@/types/card';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';
import { drawCard, playCard, discardCard, moveFieldCardToHell, moveFieldCardToHand, moveFieldCardToDeck, searchCardFromDeck, searchCardFromHell } from '@/lib/api';

interface GameBoardProps {
  roomId: string;
  gameRoom: any;
  user: any;
  playerCards: { [playerId: string]: CardType[] };
  loadingCards: boolean;
  onRefresh: () => void;
}

export function GameBoard({ roomId, gameRoom, user, playerCards, loadingCards, onRefresh }: GameBoardProps) {
  const { toast } = useToast();
  const [selectedCard, setSelectedCard] = useState<{ id: string; index: number } | null>(null);
  const [selectedFieldCard, setSelectedFieldCard] = useState<string | null>(null);
  const [actionInProgress, setActionInProgress] = useState(false);
  const [showDeckActions, setShowDeckActions] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [showSearchHellModal, setShowSearchHellModal] = useState(false);
  const [showZoneSelector, setShowZoneSelector] = useState(false);
  const [selectedZone, setSelectedZone] = useState<'avatar' | 'magic' | 'land' | 'field' | null>(null);
  const [moveCardMode, setMoveCardMode] = useState(false);
  const [cardToMove, setCardToMove] = useState<string | null>(null);
  // Track rotation state for each field card: { [cardInstanceId]: boolean} - true means horizontal
  const [rotatedCards, setRotatedCards] = useState<{ [key: string]: boolean }>({});

  const player1 = gameRoom.players[0];
  const player2 = gameRoom.players[1];
  const currentUserPlayer = gameRoom.players.find((p: GamePlayer) => p.userId === user?.id);
  const opponentPlayer = gameRoom.players.find((p: GamePlayer) => p.userId !== user?.id);

  const currentUserCards = currentUserPlayer ? (playerCards[currentUserPlayer.userId] || []) : [];
  const opponentCards = opponentPlayer ? (playerCards[opponentPlayer.userId] || []) : [];
  
  // Helper function to find card data by cardId
  const findCardData = (cardId: string, cardsArray: CardType[]): CardType | null => {
    return cardsArray.find(c => c._id === cardId) || null;
  };

  // Get unique deck cards with full card data
  const deckCards = currentUserPlayer?.deck?.map((cardId: string) => 
    findCardData(cardId, currentUserCards)
  ).filter((card: CardType | null): card is CardType => card !== null) || [];

  const handleDrawCard = async () => {
    if (!user || actionInProgress) return;
    
    setActionInProgress(true);
    try {
      await drawCard(roomId, { userId: user.id });
      toast({
        title: 'Success',
        description: 'Drew a card from deck',
      });
      onRefresh();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to draw card',
        variant: 'destructive',
      });
    } finally {
      setActionInProgress(false);
    }
  };

  const handlePlayCard = async (cardInstanceId: string, zone?: string) => {
    if (!user || actionInProgress) return;
    
    setActionInProgress(true);
    try {
      await playCard(roomId, { userId: user.id, cardInstanceId });
      toast({
        title: 'Success',
        description: `Card played to ${zone || 'field'}`,
      });
      setSelectedCard(null);
      setShowZoneSelector(false);
      setSelectedZone(null);
      onRefresh();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to play card',
        variant: 'destructive',
      });
    } finally {
      setActionInProgress(false);
    }
  };

  const handleZoneSelection = (zone: 'avatar' | 'magic' | 'land' | 'field') => {
    setSelectedZone(zone);
    if (selectedCard) {
      handlePlayCard(selectedCard.id, zone);
    }
  };

  const handleMoveCardBetweenZones = (sourceCardId: string, targetSlot: number) => {
    if (!cardToMove) return;
    
    // In a real implementation, you'd call an API to move cards between zones
    // For now, we'll just show a message
    toast({
      title: 'Move Card',
      description: 'Card movement between zones (feature in development)',
    });
    
    setMoveCardMode(false);
    setCardToMove(null);
  };

  const startMoveCard = (cardInstanceId: string) => {
    setCardToMove(cardInstanceId);
    setMoveCardMode(true);
    toast({
      title: 'Move Mode',
      description: 'Click on an empty slot or another card to swap positions',
    });
  };

  const cancelMoveMode = () => {
    setMoveCardMode(false);
    setCardToMove(null);
  };

  const handleDiscardCard = async (cardInstanceId: string) => {
    if (!user || actionInProgress) return;
    
    setActionInProgress(true);
    try {
      await discardCard(roomId, { userId: user.id, cardInstanceId });
      toast({
        title: 'Success',
        description: 'Card discarded to hell',
      });
      setSelectedCard(null);
      onRefresh();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to discard card',
        variant: 'destructive',
      });
    } finally {
      setActionInProgress(false);
    }
  };

  const toggleCardRotation = (cardInstanceId: string) => {
    setRotatedCards(prev => ({
      ...prev,
      [cardInstanceId]: !prev[cardInstanceId]
    }));
  };

  const handleMoveFieldCardToHell = async (cardInstanceId: string) => {
    if (!user || actionInProgress) return;
    
    setActionInProgress(true);
    try {
      await moveFieldCardToHell(roomId, { userId: user.id, cardInstanceId });
      toast({
        title: 'Success',
        description: 'Card moved to hell',
      });
      setSelectedFieldCard(null);
      onRefresh();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to move card to hell',
        variant: 'destructive',
      });
    } finally {
      setActionInProgress(false);
    }
  };

  const handleMoveFieldCardToHand = async (cardInstanceId: string) => {
    if (!user || actionInProgress) return;
    
    setActionInProgress(true);
    try {
      await moveFieldCardToHand(roomId, { userId: user.id, cardInstanceId });
      toast({
        title: 'Success',
        description: 'Card returned to hand',
      });
      setSelectedFieldCard(null);
      onRefresh();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to move card to hand',
        variant: 'destructive',
      });
    } finally {
      setActionInProgress(false);
    }
  };

  const handleMoveFieldCardToDeck = async (cardInstanceId: string) => {
    if (!user || actionInProgress) return;
    
    setActionInProgress(true);
    try {
      await moveFieldCardToDeck(roomId, { userId: user.id, cardInstanceId });
      toast({
        title: 'Success',
        description: 'Card returned to deck',
      });
      setSelectedFieldCard(null);
      onRefresh();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to move card to deck',
        variant: 'destructive',
      });
    } finally {
      setActionInProgress(false);
    }
  };

  const handleSearchCard = async (cardId: string) => {
    if (!user || actionInProgress) return;
    
    setActionInProgress(true);
    try {
      await searchCardFromDeck(roomId, { userId: user.id, cardId });
      toast({
        title: 'Success',
        description: 'Card searched from deck to hand',
      });
      setShowSearchModal(false);
      onRefresh();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to search card',
        variant: 'destructive',
      });
    } finally {
      setActionInProgress(false);
    }
  };

  const handleSearchHellCard = async (cardInstanceId: string) => {
    if (!user || actionInProgress) return;
    
    setActionInProgress(true);
    try {
      await searchCardFromHell(roomId, { userId: user.id, cardInstanceId });
      toast({
        title: 'Success',
        description: 'Card searched from hell to hand',
      });
      setShowSearchHellModal(false);
      onRefresh();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to search card from hell',
        variant: 'destructive',
      });
    } finally {
      setActionInProgress(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Wrapper with relative positioning for land zone */}
      <div className="relative">
        {/* Opponent Side */}
        {/* Opponent Header - Outside Card */}
        <div className="mb-2 flex items-center justify-between px-2">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            <span className="font-semibold">{opponentPlayer?.username || 'Opponent'} (Seat {opponentPlayer?.seat})</span>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <Badge variant="outline">Deck: {opponentPlayer?.deck?.length || 0}</Badge>
            <Badge variant="outline">Life: {opponentPlayer?.lifeCards?.length || 0}</Badge>
          </div>
        </div>
        <Card>
        <CardContent className="space-y-4 pt-6">
          {/* Opponent's Hand */}
          <div>
            <p className="text-sm text-muted-foreground mb-2">Hand ({opponentPlayer?.hand?.length || 0})</p>
            <div className="grid grid-cols-5 gap-2">
              {opponentPlayer?.hand?.map((_: any, idx: number) => (
                <div key={idx} className="relative aspect-[2/3] rounded-lg overflow-hidden border-2 border-border shadow-md">
                  <div className="w-full h-full bg-gradient-to-br from-blue-900 via-purple-900 to-blue-900 flex items-center justify-center border-4 border-yellow-600 rounded-lg">
                    <div className="text-center text-yellow-400">
                      <div className="text-2xl font-bold">BOT</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Opponent's Magic Zone */}
          <div>
            <p className="text-sm text-muted-foreground mb-2">Magic Zone (0/4)</p>
            <div className="grid grid-cols-4 gap-3 max-w-3xl">
              {[0, 1, 2, 3].map((slotIdx) => (
                <div key={slotIdx} className="relative">
                  <div className="relative aspect-[2/3] rounded-lg overflow-hidden border-2 border-dashed border-purple-500/25 bg-purple-500/5 transition-all">
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                      <Layers className="h-6 w-6 opacity-30" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Opponent's Field */}
          <div>
            <p className="text-sm text-muted-foreground mb-2">Field ({opponentPlayer?.field?.length || 0}/4)</p>
            <div className="relative flex items-center max-w-4xl">
              {/* Left Side - 2 slots */}
              <div className="grid grid-cols-2 gap-3 w-[40%]">
                {[0, 1].map((slotIdx) => {
                  const fieldCard = opponentPlayer?.field?.[slotIdx];
                  const cardData = fieldCard ? findCardData(fieldCard.cardId, opponentCards) : null;
                  const isRotated = fieldCard && rotatedCards[fieldCard.id];
                  
                  return (
                    <div key={slotIdx} className={`relative ${isRotated ? 'col-span-1' : ''}`}>
                      <div 
                        className={`relative rounded-lg overflow-hidden border-2 ${
                          fieldCard ? 'border-primary hover:border-primary/80' : 'border-dashed border-muted-foreground/25'
                        } bg-muted/20 transition-all duration-200 ${
                          fieldCard ? 'hover:scale-150 hover:z-20' : ''
                        } ${
                          isRotated 
                            ? 'aspect-[3/2]' 
                            : 'aspect-[2/3]'
                        }`}
                      >
                        {fieldCard && cardData?.imageUrl ? (
                          <>
                            <Image
                              src={cardData.imageUrl}
                              alt={cardData.name || 'Card'}
                              fill
                              className={isRotated ? 'object-contain rotate-90' : 'object-cover'}
                            />
                            <button
                              onClick={() => toggleCardRotation(fieldCard.id)}
                              className="absolute top-1 right-1 bg-black/50 hover:bg-black/70 text-white p-1 rounded transition-colors z-10"
                              title="Rotate card"
                            >
                              <RotateCw className="h-3 w-3" />
                            </button>
                          </>
                        ) : fieldCard ? (
                          <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                            <div className="text-center">
                              <Layers className="h-6 w-6 mx-auto mb-1" />
                              <p className="text-xs">Loading...</p>
                            </div>
                          </div>
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                            <Layers className="h-6 w-6" />
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Land Zone - Absolute positioned in the center, spanning across both sides */}
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 translate-y-0 flex items-center justify-center z-20">
                <div className="relative w-48 aspect-[2/3] rounded-lg overflow-hidden border-4 border-amber-600 bg-gradient-to-br from-amber-950/90 via-yellow-900/90 to-amber-950/90 shadow-2xl">
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="text-center">
                      <Layers className="h-10 w-10 mx-auto mb-2 opacity-40 text-amber-500" />
                      <p className="text-base font-bold text-amber-500">LAND</p>
                    </div>
                  </div>
                  {/* Decorative glow */}
                  <div className="absolute inset-0 bg-gradient-to-br from-amber-400/10 via-transparent to-amber-400/10 pointer-events-none"></div>
                </div>
              </div>

              {/* Right Side - 2 slots */}
              <div className="grid grid-cols-2 gap-3 w-[40%] ml-auto">
                {[2, 3].map((slotIdx) => {
                  const fieldCard = opponentPlayer?.field?.[slotIdx];
                  const cardData = fieldCard ? findCardData(fieldCard.cardId, opponentCards) : null;
                  const isRotated = fieldCard && rotatedCards[fieldCard.id];
                  
                  return (
                    <div key={slotIdx} className={`relative ${isRotated ? 'col-span-1' : ''}`}>
                      <div 
                        className={`relative rounded-lg overflow-hidden border-2 ${
                          fieldCard ? 'border-primary hover:border-primary/80' : 'border-dashed border-muted-foreground/25'
                        } bg-muted/20 transition-all duration-200 ${
                          fieldCard ? 'hover:scale-150 hover:z-20' : ''
                        } ${
                          isRotated 
                            ? 'aspect-[3/2]' 
                            : 'aspect-[2/3]'
                        }`}
                      >
                        {fieldCard && cardData?.imageUrl ? (
                          <>
                            <Image
                              src={cardData.imageUrl}
                              alt={cardData.name || 'Card'}
                              fill
                              className={isRotated ? 'object-contain rotate-90' : 'object-cover'}
                            />
                            <button
                              onClick={() => toggleCardRotation(fieldCard.id)}
                              className="absolute top-1 right-1 bg-black/50 hover:bg-black/70 text-white p-1 rounded transition-colors z-10"
                              title="Rotate card"
                            >
                              <RotateCw className="h-3 w-3" />
                            </button>
                          </>
                        ) : fieldCard ? (
                          <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                            <div className="text-center">
                              <Layers className="h-6 w-6 mx-auto mb-1" />
                              <p className="text-xs">Loading...</p>
                            </div>
                          </div>
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                            <Layers className="h-6 w-6" />
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Current User Side */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              {currentUserPlayer?.username || 'You'} (Seat {currentUserPlayer?.seat})
            </div>
            <div className="flex items-center gap-4 text-sm font-normal">
              <Badge variant="outline">Deck: {currentUserPlayer?.deck?.length || 0}</Badge>
              <Badge variant="outline">Life: {currentUserPlayer?.lifeCards?.length || 0}</Badge>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            {/* Main Play Area */}
            <div className="flex-1 space-y-4">
              {/* Current User's Field */}
              <div>
                <p className="text-sm text-muted-foreground mb-2">Your Field ({currentUserPlayer?.field?.length || 0}/4)</p>
                {selectedFieldCard && !moveCardMode && (
                  <div className="mb-2 flex gap-2 bg-secondary/10 p-2 rounded-lg flex-wrap">
                    <Button
                      size="sm"
                      onClick={() => startMoveCard(selectedFieldCard)}
                      disabled={actionInProgress}
                      className="bg-indigo-600 hover:bg-indigo-700"
                    >
                      Move Card
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleMoveFieldCardToHell(selectedFieldCard)}
                      disabled={actionInProgress}
                    >
                      To Hell
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleMoveFieldCardToHand(selectedFieldCard)}
                      disabled={actionInProgress}
                    >
                      To Hand
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => handleMoveFieldCardToDeck(selectedFieldCard)}
                      disabled={actionInProgress}
                    >
                      To Deck
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setSelectedFieldCard(null)}
                    >
                      Cancel
                    </Button>
                  </div>
                )}
                {moveCardMode && cardToMove && (
                  <div className="mb-2 p-3 bg-indigo-500/20 border-2 border-indigo-500 rounded-lg">
                    <p className="text-sm font-semibold mb-2">Move Mode: Click on a zone slot to move the card</p>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={cancelMoveMode}
                    >
                      Cancel Move
                    </Button>
                  </div>
                )}
                <div className="relative flex items-center justify-between max-w-4xl">
                  {/* Left Side - 2 slots */}
                  <div className="grid grid-cols-2 gap-3 w-[40%]">
                    {[0, 1].map((slotIdx) => {
                      const fieldCard = currentUserPlayer?.field?.[slotIdx];
                      const cardData = fieldCard ? findCardData(fieldCard.cardId, currentUserCards) : null;
                      const isRotated = fieldCard && rotatedCards[fieldCard.id];
                      const isSelected = selectedFieldCard === fieldCard?.id;
                      
                      return (
                        <div key={slotIdx} className={`relative ${isRotated ? 'col-span-1' : ''}`}>
                          <button
                            onClick={() => {
                              if (moveCardMode && !fieldCard) {
                                handleMoveCardBetweenZones('', slotIdx);
                              } else if (fieldCard) {
                                setSelectedFieldCard(isSelected ? null : fieldCard.id);
                              }
                            }}
                            disabled={!fieldCard && !moveCardMode}
                            className={`w-full relative rounded-lg overflow-hidden border-2 ${
                              isSelected ? 'border-blue-500 ring-4 ring-blue-300' : 
                              moveCardMode && !fieldCard ? 'border-indigo-500 border-dashed animate-pulse' :
                              fieldCard ? 'border-primary hover:border-primary/80' : 'border-dashed border-muted-foreground/25'
                            } bg-muted/20 transition-all duration-200 ${
                              fieldCard && !isSelected ? 'hover:scale-150 hover:z-20' : ''
                            } ${
                              isRotated 
                                ? 'aspect-[3/2]' 
                                : 'aspect-[2/3]'
                            } ${fieldCard || moveCardMode ? 'cursor-pointer' : 'cursor-default'}`}
                          >
                            {fieldCard && cardData?.imageUrl ? (
                              <>
                                <Image
                                  src={cardData.imageUrl}
                                  alt={cardData.name || 'Card'}
                                  fill
                                  className={isRotated ? 'object-contain rotate-90' : 'object-cover'}
                                />
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggleCardRotation(fieldCard.id);
                                  }}
                                  className="absolute top-1 right-1 bg-black/50 hover:bg-black/70 text-white p-1 rounded transition-colors z-10"
                                  title="Rotate card"
                                >
                                  <RotateCw className="h-3 w-3" />
                                </button>
                                {isSelected && (
                                  <div className="absolute inset-0 bg-blue-500/20 flex items-center justify-center pointer-events-none">
                                    <div className="bg-blue-500 text-white px-2 py-1 rounded text-xs font-bold">
                                      SELECTED
                                    </div>
                                  </div>
                                )}
                              </>
                            ) : fieldCard ? (
                              <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                                <div className="text-center">
                                  <Layers className="h-6 w-6 mx-auto mb-1" />
                                  <p className="text-xs">Loading...</p>
                                </div>
                              </div>
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                                <Layers className="h-6 w-6" />
                              </div>
                            )}
                          </button>
                        </div>
                      );
                    })}
                  </div>

                  {/* Right Side - 2 slots */}
                  <div className="grid grid-cols-2 gap-3 w-[40%]">
                    {[2, 3].map((slotIdx) => {
                      const fieldCard = currentUserPlayer?.field?.[slotIdx];
                      const cardData = fieldCard ? findCardData(fieldCard.cardId, currentUserCards) : null;
                      const isRotated = fieldCard && rotatedCards[fieldCard.id];
                      const isSelected = selectedFieldCard === fieldCard?.id;
                      
                      return (
                        <div key={slotIdx} className={`relative ${isRotated ? 'col-span-1' : ''}`}>
                          <button
                            onClick={() => {
                              if (moveCardMode && !fieldCard) {
                                handleMoveCardBetweenZones('', slotIdx);
                              } else if (fieldCard) {
                                setSelectedFieldCard(isSelected ? null : fieldCard.id);
                              }
                            }}
                            disabled={!fieldCard && !moveCardMode}
                            className={`w-full relative rounded-lg overflow-hidden border-2 ${
                              isSelected ? 'border-blue-500 ring-4 ring-blue-300' : 
                              moveCardMode && !fieldCard ? 'border-indigo-500 border-dashed animate-pulse' :
                              fieldCard ? 'border-primary hover:border-primary/80' : 'border-dashed border-muted-foreground/25'
                            } bg-muted/20 transition-all duration-200 ${
                              fieldCard && !isSelected ? 'hover:scale-150 hover:z-20' : ''
                            } ${
                              isRotated 
                                ? 'aspect-[3/2]' 
                                : 'aspect-[2/3]'
                            } ${fieldCard || moveCardMode ? 'cursor-pointer' : 'cursor-default'}`}
                          >
                            {fieldCard && cardData?.imageUrl ? (
                              <>
                                <Image
                                  src={cardData.imageUrl}
                                  alt={cardData.name || 'Card'}
                                  fill
                                  className={isRotated ? 'object-contain rotate-90' : 'object-cover'}
                                />
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggleCardRotation(fieldCard.id);
                                  }}
                                  className="absolute top-1 right-1 bg-black/50 hover:bg-black/70 text-white p-1 rounded transition-colors z-10"
                                  title="Rotate card"
                                >
                                  <RotateCw className="h-3 w-3" />
                                </button>
                                {isSelected && (
                                  <div className="absolute inset-0 bg-blue-500/20 flex items-center justify-center pointer-events-none">
                                    <div className="bg-blue-500 text-white px-2 py-1 rounded text-xs font-bold">
                                      SELECTED
                                    </div>
                                  </div>
                                )}
                              </>
                            ) : fieldCard ? (
                              <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                                <div className="text-center">
                                  <Layers className="h-6 w-6 mx-auto mb-1" />
                                  <p className="text-xs">Loading...</p>
                                </div>
                              </div>
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                                <Layers className="h-6 w-6" />
                              </div>
                            )}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Current User's Magic Zone */}
              <div>
                <p className="text-sm text-muted-foreground mb-2">Magic Zone (0/4)</p>
                <div className="grid grid-cols-4 gap-3 max-w-3xl">
                  {[0, 1, 2, 3].map((slotIdx) => (
                    <div key={slotIdx} className="relative">
                      <div className="relative aspect-[2/3] rounded-lg overflow-hidden border-2 border-dashed border-purple-500/25 bg-purple-500/5 transition-all">
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                          <Layers className="h-6 w-6 opacity-30" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Current User's Hand */}
              <div>
                <p className="text-sm text-muted-foreground mb-2">Your Hand ({currentUserPlayer?.hand?.length || 0})</p>
                {selectedCard && !showZoneSelector && (
                  <div className="mb-2 flex gap-2 bg-primary/10 p-2 rounded-lg">
                    <Button
                      size="sm"
                      onClick={() => setShowZoneSelector(true)}
                      disabled={actionInProgress || (currentUserPlayer?.field?.length || 0) >= 4}
                    >
                      Play Card (Select Zone)
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDiscardCard(selectedCard.id)}
                      disabled={actionInProgress}
                    >
                      Discard
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setSelectedCard(null)}
                    >
                      Cancel
                    </Button>
                  </div>
                )}
                {selectedCard && showZoneSelector && (
                  <div className="mb-2 p-3 bg-blue-500/20 border-2 border-blue-500 rounded-lg">
                    <p className="text-sm font-semibold mb-2">Select Zone to Play Card:</p>
                    <div className="flex gap-2 flex-wrap">
                      <Button
                        size="sm"
                        onClick={() => handleZoneSelection('field')}
                        disabled={actionInProgress}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        Field Zone
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleZoneSelection('avatar')}
                        disabled={actionInProgress}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        Avatar Zone
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleZoneSelection('magic')}
                        disabled={actionInProgress}
                        className="bg-purple-600 hover:bg-purple-700"
                      >
                        Magic Zone
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleZoneSelection('land')}
                        disabled={actionInProgress}
                        className="bg-amber-600 hover:bg-amber-700"
                      >
                        Land Zone
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setShowZoneSelector(false);
                          setSelectedZone(null);
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
                <div className="grid grid-cols-5 gap-2">
                  {currentUserPlayer?.hand?.map((cardInHand: any, idx: number) => {
                    const cardData = findCardData(cardInHand.cardId, currentUserCards);
                    const isSelected = selectedCard?.id === cardInHand.id;
                    
                    return (
                      <button
                        key={cardInHand.id}
                        onClick={() => setSelectedCard(isSelected ? null : { id: cardInHand.id, index: idx })}
                        className={`relative aspect-[2/3] rounded-lg overflow-hidden border-2 ${
                          isSelected ? 'border-yellow-500 ring-4 ring-yellow-300' : 'border-primary'
                        } shadow-lg hover:scale-105 transition-transform cursor-pointer`}
                      >
                        {cardData?.imageUrl ? (
                          <Image
                            src={cardData.imageUrl}
                            alt={cardData.name || 'Card'}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-muted flex items-center justify-center">
                            <p className="text-xs text-center p-2">Loading...</p>
                          </div>
                        )}
                        {isSelected && (
                          <div className="absolute inset-0 bg-yellow-500/20 flex items-center justify-center">
                            <div className="bg-yellow-500 text-white px-2 py-1 rounded text-xs font-bold">
                              SELECTED
                            </div>
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Deck & Hell Area - Side Panel (RIGHT SIDE) */}
            <div className="flex flex-col gap-4 w-32 flex-shrink-0">
              <div className="flex flex-col items-center">
                <div className="relative w-24 aspect-[2/3] rounded-lg overflow-hidden border-4 border-green-600 shadow-xl">
                  <div className="w-full h-full bg-gradient-to-br from-green-900 via-emerald-900 to-green-900 flex flex-col items-center justify-center text-white">
                    <Layers className="h-6 w-6 mb-1" />
                    <div className="text-lg font-bold">{currentUserPlayer?.deck?.length || 0}</div>
                    <div className="text-xs">Cards</div>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mt-1 mb-1">Deck Pile</p>
                <div className="flex flex-col gap-1 w-full">
                  <Button
                    size="sm"
                    onClick={handleDrawCard}
                    disabled={actionInProgress || !currentUserPlayer?.deck?.length}
                    className="w-full text-xs"
                  >
                    Draw
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setShowSearchModal(true)}
                    disabled={actionInProgress || !currentUserPlayer?.deck?.length}
                    className="w-full text-xs"
                  >
                    <Search className="h-3 w-3 mr-1" />
                    Search
                  </Button>
                </div>
              </div>

              <div className="flex flex-col items-center">
                <div className="relative w-24 aspect-[2/3] rounded-lg overflow-hidden border-4 border-red-600 shadow-xl">
                  {currentUserPlayer?.hell && currentUserPlayer.hell.length > 0 ? (
                    <div className="w-full h-full bg-gradient-to-br from-red-900 via-orange-900 to-red-900 flex flex-col items-center justify-center text-white">
                      <div className="text-2xl font-bold">{currentUserPlayer.hell.length}</div>
                      <div className="text-xs">Cards</div>
                    </div>
                  ) : (
                    <div className="w-full h-full bg-muted flex items-center justify-center text-muted-foreground">
                      <div className="text-center">
                        <div className="text-xs">Empty</div>
                      </div>
                    </div>
                  )}
                </div>
                <p className="text-sm text-muted-foreground mt-1 mb-1">Hell (Discard)</p>
                <div className="flex flex-col gap-1 w-full">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setShowSearchHellModal(true)}
                    disabled={actionInProgress || !currentUserPlayer?.hell?.length}
                    className="w-full text-xs"
                  >
                    <Search className="h-3 w-3 mr-1" />
                    Search
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Search Card Modal */}
      {showSearchModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-4xl max-h-[80vh] flex flex-col">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Search className="h-5 w-5" />
                  Search Card from Deck
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setShowSearchModal(false)}
                  disabled={actionInProgress}
                >
                  <X className="h-4 w-4" />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="overflow-y-auto flex-1">
              <p className="text-sm text-muted-foreground mb-4">
                Click on a card to search it from your deck to your hand ({deckCards.length} cards in deck)
              </p>
              <div className="grid grid-cols-4 gap-3">
                {deckCards.map((card: CardType) => (
                  <button
                    key={card._id}
                    onClick={() => handleSearchCard(card._id)}
                    disabled={actionInProgress}
                    className="relative aspect-[2/3] rounded-lg overflow-hidden border-2 border-primary shadow-lg hover:scale-105 hover:border-yellow-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {card.imageUrl ? (
                      <Image
                        src={card.imageUrl}
                        alt={card.name || 'Card'}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-muted flex items-center justify-center">
                        <p className="text-xs text-center p-2">{card.name || 'Card'}</p>
                      </div>
                    )}
                  </button>
                ))}
              </div>
              {deckCards.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <Layers className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No cards in deck</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Search Hell Modal */}
      {showSearchHellModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-4xl max-h-[80vh] flex flex-col">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Search className="h-5 w-5" />
                  Search Card from Hell
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setShowSearchHellModal(false)}
                  disabled={actionInProgress}
                >
                  <X className="h-4 w-4" />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="overflow-y-auto flex-1">
              <p className="text-sm text-muted-foreground mb-4">
                Click on a card to search it from your hell to your hand ({currentUserPlayer?.hell?.length || 0} cards in hell)
              </p>
              <div className="grid grid-cols-4 gap-3">
                {currentUserPlayer?.hell?.map((hellCard: any) => {
                  const cardData = findCardData(hellCard.cardId, currentUserCards);
                  return (
                    <button
                      key={hellCard.id}
                      onClick={() => handleSearchHellCard(hellCard.id)}
                      disabled={actionInProgress}
                      className="relative aspect-[2/3] rounded-lg overflow-hidden border-2 border-red-500 shadow-lg hover:scale-105 hover:border-yellow-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {cardData?.imageUrl ? (
                        <Image
                          src={cardData.imageUrl}
                          alt={cardData.name || 'Card'}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-muted flex items-center justify-center">
                          <p className="text-xs text-center p-2">{cardData?.name || 'Loading...'}</p>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
              {(!currentUserPlayer?.hell || currentUserPlayer.hell.length === 0) && (
                <div className="text-center py-8 text-muted-foreground">
                  <Layers className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No cards in hell</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
      </div>
    </div>
  );
}
