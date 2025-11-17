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
import { drawCard, playCard, discardCard, moveFieldCardToHell, moveFieldCardToHand, moveFieldCardToDeck, searchCardFromDeck, searchCardFromHell, shuffleDeck, flipLifeCard, moveAvatarToOpponentField, toggleCardRotation } from '@/lib/api';

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
  const [selectedMagicCard, setSelectedMagicCard] = useState<string | null>(null);
  const [selectedConstructCard, setSelectedConstructCard] = useState<string | null>(null);
  const [actionInProgress, setActionInProgress] = useState(false);
  const [showDeckActions, setShowDeckActions] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [showSearchHellModal, setShowSearchHellModal] = useState(false);
  const [showZoneSelector, setShowZoneSelector] = useState(false);
  const [selectedZone, setSelectedZone] = useState<'avatar' | 'magic' | 'land' | 'field' | 'construct' | null>(null);
  const [moveCardMode, setMoveCardMode] = useState(false);
  const [cardToMove, setCardToMove] = useState<string | null>(null);

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
      await playCard(roomId, { userId: user.id, cardInstanceId, zone });
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

  const handleZoneSelection = (zone: 'avatar' | 'magic' | 'land' | 'field' | 'construct') => {
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

  const handleToggleCardRotation = async (cardInstanceId: string) => {
    if (!user || actionInProgress) return;
    
    setActionInProgress(true);
    try {
      await toggleCardRotation(roomId, { userId: user.id, cardInstanceId });
      toast({
        title: 'Success',
        description: 'Card rotated',
      });
      onRefresh();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to rotate card',
        variant: 'destructive',
      });
    } finally {
      setActionInProgress(false);
    }
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

  const handleShuffleDeck = async () => {
    if (!user || actionInProgress) return;
    
    setActionInProgress(true);
    try {
      await shuffleDeck(roomId, { userId: user.id });
      toast({
        title: 'Success',
        description: 'Deck shuffled',
      });
      onRefresh();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to shuffle deck',
        variant: 'destructive',
      });
    } finally {
      setActionInProgress(false);
    }
  };

  const handleFlipLifeCard = async (lifeCardInstanceId: string) => {
    if (!user || actionInProgress) return;
    
    setActionInProgress(true);
    try {
      await flipLifeCard(roomId, { userId: user.id, lifeCardInstanceId });
      toast({
        title: 'Success',
        description: 'Life card flipped',
      });
      onRefresh();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to flip life card',
        variant: 'destructive',
      });
    } finally {
      setActionInProgress(false);
    }
  };

  const handleMoveAvatarToOpponentField = async (cardInstanceId: string) => {
    if (!user || actionInProgress) return;
    
    setActionInProgress(true);
    try {
      await moveAvatarToOpponentField(roomId, { userId: user.id, cardInstanceId });
      toast({
        title: 'Success',
        description: 'Avatar moved to opponent field',
      });
      setSelectedMagicCard(null);
      onRefresh();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to move avatar to opponent field',
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
            <p className="text-sm text-muted-foreground mb-2">Magic Zone ({opponentPlayer?.magicZone?.length || 0}/4)</p>
            <div className="flex items-center justify-between max-w-3xl mx-auto">
              {/* Left Side - 2 Magic slots */}
              <div className="grid grid-cols-2 gap-2 w-[40%]">
                {[0, 1].map((slotIdx) => {
                  const magicCard = opponentPlayer?.magicZone?.[slotIdx];
                  const cardData = magicCard ? findCardData(magicCard.cardId, opponentCards) : null;
                  
                  return (
                    <div key={slotIdx} className="relative">
                      <div className={`relative aspect-[2/3] rounded-lg overflow-hidden border-2 ${
                        magicCard ? 'border-purple-500 hover:border-purple-400' : 'border-dashed border-purple-500/25'
                      } bg-purple-500/5 transition-all ${magicCard ? 'hover:scale-150 hover:z-20' : ''}`}>
                        {magicCard && cardData?.imageUrl ? (
                          <Image
                            src={cardData.imageUrl}
                            alt={cardData.name || 'Card'}
                            fill
                            className="object-cover"
                          />
                        ) : magicCard ? (
                          <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                            <div className="text-center">
                              <Layers className="h-6 w-6 mx-auto mb-1" />
                              <p className="text-xs">Loading...</p>
                            </div>
                          </div>
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                            <Layers className="h-6 w-6 opacity-30" />
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Center Gap */}
              <div className="w-[20%]"></div>

              {/* Right Side - 2 Magic slots */}
              <div className="grid grid-cols-2 gap-2 w-[40%]">
                {[2, 3].map((slotIdx) => {
                  const magicCard = opponentPlayer?.magicZone?.[slotIdx];
                  const cardData = magicCard ? findCardData(magicCard.cardId, opponentCards) : null;
                  
                  return (
                    <div key={slotIdx} className="relative">
                      <div className={`relative aspect-[2/3] rounded-lg overflow-hidden border-2 ${
                        magicCard ? 'border-purple-500 hover:border-purple-400' : 'border-dashed border-purple-500/25'
                      } bg-purple-500/5 transition-all ${magicCard ? 'hover:scale-150 hover:z-20' : ''}`}>
                        {magicCard && cardData?.imageUrl ? (
                          <Image
                            src={cardData.imageUrl}
                            alt={cardData.name || 'Card'}
                            fill
                            className="object-cover"
                          />
                        ) : magicCard ? (
                          <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                            <div className="text-center">
                              <Layers className="h-6 w-6 mx-auto mb-1" />
                              <p className="text-xs">Loading...</p>
                            </div>
                          </div>
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                            <Layers className="h-6 w-6 opacity-30" />
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Opponent's Avatar Zone & Construct Zone - Side by Side */}
          <div className="flex gap-6">
            {/* Avatar Zone */}
            <div className="flex-1">
              <p className="text-sm text-muted-foreground mb-2">Avatar Zone ({opponentPlayer?.avatarZone?.length || 0}/4)</p>
              <div className="relative flex items-center max-w-4xl">
                {/* Left Side - 2 Avatar slots */}
                <div className="grid grid-cols-2 gap-3 w-[40%]">
                {[0, 1].map((slotIdx) => {
                  const avatarCard = opponentPlayer?.avatarZone?.[slotIdx];
                  const cardData = avatarCard ? findCardData(avatarCard.cardId, opponentCards) : null;
                  
                  // Read rotation state from server data
                  const isRotated = avatarCard?.rotated || false;
                  
                  return (
                    <div key={slotIdx} className="relative">
                      <div 
                        className={`relative aspect-[2/3] rounded-lg overflow-hidden border-2 ${
                          avatarCard ? 'border-blue-500 hover:border-blue-400' : 'border-dashed border-blue-500/25'
                        } bg-blue-500/5 transition-all ${avatarCard ? 'hover:scale-150 hover:z-20' : ''}`}
                        style={{
                          transform: isRotated ? 'rotate(90deg)' : 'rotate(0deg)',
                          transition: 'transform 0.3s ease-in-out, scale 0.2s ease-in-out'
                        }}
                      >
                        {avatarCard && cardData?.imageUrl ? (
                          <Image
                            src={cardData.imageUrl}
                            alt={cardData.name || 'Card'}
                            fill
                            className="object-cover"
                          />
                        ) : avatarCard ? (
                          <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                            <div className="text-center">
                              <Layers className="h-6 w-6 mx-auto mb-1" />
                              <p className="text-xs">Loading...</p>
                            </div>
                          </div>
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                            <Layers className="h-6 w-6 opacity-30" />
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
                </div>

                {/* Land Zone - Absolute positioned in the center */}
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 translate-y-0 flex items-center justify-center z-20">
                {/* Combine both players' land zone cards */}
                {(currentUserPlayer?.landZone?.length > 0 || opponentPlayer?.landZone?.length > 0) ? (
                  <div className="flex gap-1">
                    {/* Display current user's land zone cards */}
                    {currentUserPlayer?.landZone?.map((landCard: any, idx: number) => {
                      const cardData = landCard ? findCardData(landCard.cardId, currentUserCards) : null;
                      const isSelected = selectedFieldCard === landCard?.id;
                      
                      return (
                        <div key={`user-land-${idx}`} className="relative">
                          <button
                            onClick={() => {
                              if (landCard) {
                                setSelectedFieldCard(isSelected ? null : landCard.id);
                              }
                            }}
                            disabled={!landCard}
                            className={`relative w-32 aspect-[2/3] rounded-lg overflow-hidden border-4 ${
                              isSelected ? 'border-yellow-400 ring-4 ring-yellow-300' : 'border-amber-600 hover:border-amber-400'
                            } shadow-2xl transition-all ${
                              landCard && !isSelected ? 'hover:scale-[3] hover:z-40' : ''
                            } ${landCard ? 'cursor-pointer' : 'cursor-default'}`}
                          >
                            {cardData?.imageUrl ? (
                              <>
                                <Image
                                  src={cardData.imageUrl}
                                  alt={cardData.name || 'Land Card'}
                                  fill
                                  className="object-cover"
                                />
                                {isSelected && (
                                  <div className="absolute inset-0 bg-amber-500/20 flex items-center justify-center pointer-events-none">
                                    <div className="bg-amber-500 text-white px-2 py-1 rounded text-xs font-bold">
                                      SELECTED
                                    </div>
                                  </div>
                                )}
                              </>
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-muted-foreground bg-gradient-to-br from-amber-950/90 via-yellow-900/90 to-amber-950/90">
                                <div className="text-center">
                                  <Layers className="h-6 w-6 mx-auto mb-1" />
                                  <p className="text-xs">Loading...</p>
                                </div>
                              </div>
                            )}
                          </button>
                        </div>
                      );
                    })}
                    {/* Display opponent's land zone cards */}
                    {opponentPlayer?.landZone?.map((landCard: any, idx: number) => {
                      const cardData = landCard ? findCardData(landCard.cardId, opponentCards) : null;
                      
                      return (
                        <div key={`opp-land-${idx}`} className="relative">
                          <div className="relative w-32 aspect-[2/3] rounded-lg overflow-hidden border-4 border-amber-600 shadow-2xl hover:scale-[3] transition-all hover:z-40">
                            {cardData?.imageUrl ? (
                              <Image
                                src={cardData.imageUrl}
                                alt={cardData.name || 'Land Card'}
                                fill
                                className="object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-muted-foreground bg-gradient-to-br from-amber-950/90 via-yellow-900/90 to-amber-950/90">
                                <div className="text-center">
                                  <Layers className="h-6 w-6 mx-auto mb-1" />
                                  <p className="text-xs">Loading...</p>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
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
                )}
                </div>

                {/* Right Side - 2 Avatar slots */}
                <div className="grid grid-cols-2 gap-3 w-[40%] ml-auto">
                {[2, 3].map((slotIdx) => {
                  const avatarCard = opponentPlayer?.avatarZone?.[slotIdx];
                  const cardData = avatarCard ? findCardData(avatarCard.cardId, opponentCards) : null;
                  
                  // Read rotation state from server data
                  const isRotated = avatarCard?.rotated || false;
                  
                  return (
                    <div key={slotIdx} className="relative">
                      <div 
                        className={`relative aspect-[2/3] rounded-lg overflow-hidden border-2 ${
                          avatarCard ? 'border-blue-500 hover:border-blue-400' : 'border-dashed border-blue-500/25'
                        } bg-blue-500/5 transition-all ${avatarCard ? 'hover:scale-150 hover:z-20' : ''}`}
                        style={{
                          transform: isRotated ? 'rotate(90deg)' : 'rotate(0deg)',
                          transition: 'transform 0.3s ease-in-out, scale 0.2s ease-in-out'
                        }}
                      >
                        {avatarCard && cardData?.imageUrl ? (
                          <Image
                            src={cardData.imageUrl}
                            alt={cardData.name || 'Card'}
                            fill
                            className="object-cover"
                          />
                        ) : avatarCard ? (
                          <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                            <div className="text-center">
                              <Layers className="h-6 w-6 mx-auto mb-1" />
                              <p className="text-xs">Loading...</p>
                            </div>
                          </div>
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                            <Layers className="h-6 w-6 opacity-30" />
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
                </div>
              </div>
            </div>

            {/* Construct Zone */}
            <div className="flex-shrink-0" style={{ width: '280px' }}>
              <p className="text-sm text-muted-foreground mb-2">Construct Zone ({opponentPlayer?.constructZone?.length || 0}/3)</p>
              <div className="grid grid-cols-3 gap-2">
                {[0, 1, 2].map((slotIdx) => {
                  const constructCard = opponentPlayer?.constructZone?.[slotIdx];
                  const cardData = constructCard ? findCardData(constructCard.cardId, opponentCards) : null;
                  
                  return (
                    <div key={slotIdx} className="relative">
                      <div className={`relative aspect-[2/3] rounded-lg overflow-hidden border-2 ${
                        constructCard ? 'border-orange-500 hover:border-orange-400' : 'border-dashed border-orange-500/25'
                      } bg-orange-500/5 transition-all ${constructCard ? 'hover:scale-[3] hover:z-20' : ''}`}>
                        {constructCard && cardData?.imageUrl ? (
                          <Image
                            src={cardData.imageUrl}
                            alt={cardData.name || 'Card'}
                            fill
                            className="object-cover"
                          />
                        ) : constructCard ? (
                          <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                            <div className="text-center">
                              <Layers className="h-6 w-6 mx-auto mb-1" />
                              <p className="text-xs">Loading...</p>
                            </div>
                          </div>
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                            <Layers className="h-6 w-6 opacity-30" />
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
              
              {/* Opponent's Life Cards - below Construct Zone */}
              <div className="mt-4">
                <p className="text-sm text-muted-foreground mb-2">Life Cards ({opponentPlayer?.lifeCards?.length || 0})</p>
                <div className="flex gap-2 justify-center">
                  {opponentPlayer?.lifeCards?.map((lifeCard: any, idx: number) => {
                    const cardData = lifeCard ? findCardData(lifeCard.cardId, opponentCards) : null;
                    
                    return (
                      <div key={idx} className="relative">
                        <div className="relative w-16 aspect-[2/3] rounded-lg overflow-hidden border-2 border-red-500 shadow-md hover:scale-300 hover:z-30 transition-all">
                          {!lifeCard.faceUp ? (
                            <div className="w-full h-full bg-gradient-to-br from-red-900 via-rose-900 to-red-900 flex items-center justify-center">
                              <div className="text-white text-xs font-bold">LIFE</div>
                            </div>
                          ) : cardData?.imageUrl ? (
                            <Image
                              src={cardData.imageUrl}
                              alt={cardData.name || 'Life Card'}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-muted flex items-center justify-center text-muted-foreground">
                              <div className="text-center">
                                <Layers className="h-4 w-4 mx-auto mb-1" />
                                <p className="text-xs">Loading...</p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
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
          {/* Main Play Area */}
          <div className="space-y-4">
              {/* Current User's Avatar Zone & Construct Zone - Side by Side */}
              <div className="flex gap-6">
                {/* Avatar Zone */}
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground mb-2">Your Avatar Zone ({currentUserPlayer?.avatarZone?.length || 0}/4)</p>
                {selectedMagicCard && currentUserPlayer?.avatarZone?.find((c: any) => c.id === selectedMagicCard) && (
                  <div className="mb-2 flex gap-2 bg-blue-500/10 p-2 rounded-lg flex-wrap">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleToggleCardRotation(selectedMagicCard)}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                      disabled={actionInProgress}
                    >
                      <RotateCw className="h-4 w-4 mr-1" />
                      Rotate
                    </Button>
                    <Button
                      size="sm"
                      className="bg-green-600 hover:bg-green-700"
                      onClick={() => handleMoveAvatarToOpponentField(selectedMagicCard)}
                      disabled={actionInProgress}
                    >
                      Move to Opponent Field
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => {
                        handleMoveFieldCardToHell(selectedMagicCard);
                        setSelectedMagicCard(null);
                      }}
                      disabled={actionInProgress}
                    >
                      To Hell
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => {
                        handleMoveFieldCardToHand(selectedMagicCard);
                        setSelectedMagicCard(null);
                      }}
                      disabled={actionInProgress}
                    >
                      To Hand
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => {
                        handleMoveFieldCardToDeck(selectedMagicCard);
                        setSelectedMagicCard(null);
                      }}
                      disabled={actionInProgress}
                    >
                      To Deck
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setSelectedMagicCard(null)}
                    >
                      Cancel
                    </Button>
                  </div>
                )}
                {selectedFieldCard && currentUserPlayer?.landZone?.find((c: any) => c.id === selectedFieldCard) && (
                  <div className="mb-2 flex gap-2 bg-amber-500/10 p-2 rounded-lg flex-wrap">
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
                <div className="relative flex items-center max-w-4xl">
                  {/* Left Side - 2 Avatar slots */}
                  <div className="grid grid-cols-2 gap-3 w-[40%]">
                    {[0, 1].map((slotIdx) => {
                      const avatarCard = currentUserPlayer?.avatarZone?.[slotIdx];
                      const cardData = avatarCard ? findCardData(avatarCard.cardId, currentUserCards) : null;
                      const isSelected = selectedMagicCard === avatarCard?.id;
                      
                      // Read rotation state from server data (field name is 'rotated', not 'isRotated')
                      const isRotated = avatarCard?.rotated || false;
                      
                      return (
                        <div key={slotIdx} className="relative">
                          <button
                            onClick={() => {
                              if (avatarCard) {
                                setSelectedMagicCard(isSelected ? null : avatarCard.id);
                              }
                            }}
                            disabled={!avatarCard}
                            className={`w-full relative aspect-[2/3] rounded-lg overflow-hidden border-2 ${
                              isSelected ? 'border-blue-300 ring-4 ring-blue-300' : 
                              avatarCard ? 'border-blue-500 hover:border-blue-400' : 'border-dashed border-blue-500/25'
                            } bg-blue-500/5 ${
                              avatarCard && !isSelected ? 'hover:scale-150 hover:z-20' : ''
                            } ${avatarCard ? 'cursor-pointer' : 'cursor-default'}`}
                            style={{
                              transform: isRotated ? 'rotate(90deg)' : 'rotate(0deg)',
                              transition: 'transform 0.3s ease-in-out, scale 0.2s ease-in-out'
                            }}
                          >
                            {avatarCard && cardData?.imageUrl ? (
                              <>
                                <Image
                                  src={cardData.imageUrl}
                                  alt={cardData.name || 'Card'}
                                  fill
                                  className="object-cover"
                                />
                                {isSelected && (
                                  <div className="absolute inset-0 bg-blue-500/20 flex items-center justify-center pointer-events-none">
                                    <div className="bg-blue-500 text-white px-2 py-1 rounded text-xs font-bold">
                                      SELECTED
                                    </div>
                                  </div>
                                )}
                              </>
                            ) : avatarCard ? (
                              <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                                <div className="text-center">
                                  <Layers className="h-6 w-6 mx-auto mb-1" />
                                  <p className="text-xs">Loading...</p>
                                </div>
                              </div>
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                                <Layers className="h-6 w-6 opacity-30" />
                              </div>
                            )}
                          </button>
                        </div>
                      );
                    })}
                  </div>

                  {/* Right Side - 2 Avatar slots */}
                  <div className="grid grid-cols-2 gap-3 w-[40%] ml-auto">
                    {[2, 3].map((slotIdx) => {
                      const avatarCard = currentUserPlayer?.avatarZone?.[slotIdx];
                      const cardData = avatarCard ? findCardData(avatarCard.cardId, currentUserCards) : null;
                      const isSelected = selectedMagicCard === avatarCard?.id;
                      
                      // Read rotation state from server data (field name is 'rotated', not 'isRotated')
                      const isRotated = avatarCard?.rotated || false;
                      
                      return (
                        <div key={slotIdx} className="relative">
                          <button
                            onClick={() => {
                              if (avatarCard) {
                                setSelectedMagicCard(isSelected ? null : avatarCard.id);
                              }
                            }}
                            disabled={!avatarCard}
                            className={`w-full relative aspect-[2/3] rounded-lg overflow-hidden border-2 ${
                              isSelected ? 'border-blue-300 ring-4 ring-blue-300' : 
                              avatarCard ? 'border-blue-500 hover:border-blue-400' : 'border-dashed border-blue-500/25'
                            } bg-blue-500/5 ${
                              avatarCard && !isSelected ? 'hover:scale-150 hover:z-20' : ''
                            } ${avatarCard ? 'cursor-pointer' : 'cursor-default'}`}
                            style={{
                              transform: isRotated ? 'rotate(90deg)' : 'rotate(0deg)',
                              transition: 'transform 0.3s ease-in-out, scale 0.2s ease-in-out'
                            }}
                          >
                            {avatarCard && cardData?.imageUrl ? (
                              <>
                                <Image
                                  src={cardData.imageUrl}
                                  alt={cardData.name || 'Card'}
                                  fill
                                  className="object-cover"
                                />
                                {isSelected && (
                                  <div className="absolute inset-0 bg-blue-500/20 flex items-center justify-center pointer-events-none">
                                    <div className="bg-blue-500 text-white px-2 py-1 rounded text-xs font-bold">
                                      SELECTED
                                    </div>
                                  </div>
                                )}
                              </>
                            ) : avatarCard ? (
                              <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                                <div className="text-center">
                                  <Layers className="h-6 w-6 mx-auto mb-1" />
                                  <p className="text-xs">Loading...</p>
                                </div>
                              </div>
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                                <Layers className="h-6 w-6 opacity-30" />
                              </div>
                            )}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
                </div>

                {/* Construct Zone */}
                <div className="flex-shrink-0" style={{ width: '280px' }}>
                  <p className="text-sm text-muted-foreground mb-2">Your Construct Zone ({currentUserPlayer?.constructZone?.length || 0}/3)</p>
                  {selectedConstructCard && currentUserPlayer?.constructZone?.find((c: any) => c.id === selectedConstructCard) && (
                    <div className="mb-2 flex gap-2 bg-orange-500/10 p-2 rounded-lg flex-wrap">
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => {
                          handleMoveFieldCardToHell(selectedConstructCard);
                          setSelectedConstructCard(null);
                        }}
                        disabled={actionInProgress}
                      >
                        To Hell
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => {
                          handleMoveFieldCardToHand(selectedConstructCard);
                          setSelectedConstructCard(null);
                        }}
                        disabled={actionInProgress}
                      >
                        To Hand
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => {
                          handleMoveFieldCardToDeck(selectedConstructCard);
                          setSelectedConstructCard(null);
                        }}
                        disabled={actionInProgress}
                      >
                        To Deck
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSelectedConstructCard(null)}
                      >
                        Cancel
                      </Button>
                    </div>
                  )}
                  <div className="grid grid-cols-3 gap-2">
                    {[0, 1, 2].map((slotIdx) => {
                      const constructCard = currentUserPlayer?.constructZone?.[slotIdx];
                      const cardData = constructCard ? findCardData(constructCard.cardId, currentUserCards) : null;
                      const isSelected = selectedConstructCard === constructCard?.id;
                      
                      return (
                        <div key={slotIdx} className="relative">
                          <button
                            onClick={() => {
                              if (constructCard) {
                                setSelectedConstructCard(isSelected ? null : constructCard.id);
                              }
                            }}
                            disabled={!constructCard}
                            className={`w-full relative aspect-[2/3] rounded-lg overflow-hidden border-2 ${
                              isSelected ? 'border-orange-300 ring-4 ring-orange-300' : 
                              constructCard ? 'border-orange-500 hover:border-orange-400' : 'border-dashed border-orange-500/25'
                            } bg-orange-500/5 transition-all ${
                              constructCard && !isSelected ? 'hover:scale-[3] hover:z-20' : ''
                            } ${constructCard ? 'cursor-pointer' : 'cursor-default'}`}
                          >
                            {constructCard && cardData?.imageUrl ? (
                              <>
                                <Image
                                  src={cardData.imageUrl}
                                  alt={cardData.name || 'Card'}
                                  fill
                                  className="object-cover"
                                />
                                {isSelected && (
                                  <div className="absolute inset-0 bg-orange-500/20 flex items-center justify-center pointer-events-none">
                                    <div className="bg-orange-500 text-white px-2 py-1 rounded text-xs font-bold">
                                      SELECTED
                                    </div>
                                  </div>
                                )}
                              </>
                            ) : constructCard ? (
                              <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                                <div className="text-center">
                                  <Layers className="h-6 w-6 mx-auto mb-1" />
                                  <p className="text-xs">Loading...</p>
                                </div>
                              </div>
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                                <Layers className="h-6 w-6 opacity-30" />
                              </div>
                            )}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                  
                  {/* Current User's Life Cards - below Construct Zone */}
                  <div className="mt-4">
                    <p className="text-sm text-muted-foreground mb-2">Your Life Cards ({currentUserPlayer?.lifeCards?.length || 0})</p>
                    <div className="flex gap-2 justify-center">
                      {currentUserPlayer?.lifeCards?.map((lifeCard: any, idx: number) => {
                        const cardData = lifeCard ? findCardData(lifeCard.cardId, currentUserCards) : null;
                        
                        return (
                          <div key={idx} className="relative">
                            <button
                              onClick={() => handleFlipLifeCard(lifeCard.id)}
                              disabled={actionInProgress}
                              className="relative w-16 aspect-[2/3] rounded-lg overflow-hidden border-2 border-red-500 shadow-md hover:scale-300 hover:z-30 transition-all cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              {!lifeCard.faceUp ? (
                                <div className="w-full h-full bg-gradient-to-br from-red-900 via-rose-900 to-red-900 flex items-center justify-center">
                                  <div className="text-white text-xs font-bold">LIFE</div>
                                </div>
                              ) : cardData?.imageUrl ? (
                                <Image
                                  src={cardData.imageUrl}
                                  alt={cardData.name || 'Life Card'}
                                  fill
                                  className="object-cover"
                                />
                              ) : (
                                <div className="w-full h-full bg-muted flex items-center justify-center text-muted-foreground">
                                  <div className="text-center">
                                    <Layers className="h-4 w-4 mx-auto mb-1" />
                                    <p className="text-xs">Loading...</p>
                                  </div>
                                </div>
                              )}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>

              {/* Current User's Magic Zone & Deck/Hell - Side by Side */}
              <div className="flex gap-6">
                {/* Magic Zone */}
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground mb-2">Your Magic Zone ({currentUserPlayer?.magicZone?.length || 0}/4)</p>
                  {selectedMagicCard && currentUserPlayer?.magicZone?.find((c: any) => c.id === selectedMagicCard) && (
                    <div className="mb-2 flex gap-2 bg-purple-500/10 p-2 rounded-lg flex-wrap">
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => {
                          handleMoveFieldCardToHell(selectedMagicCard);
                          setSelectedMagicCard(null);
                        }}
                        disabled={actionInProgress}
                      >
                        To Hell
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => {
                          handleMoveFieldCardToHand(selectedMagicCard);
                          setSelectedMagicCard(null);
                        }}
                        disabled={actionInProgress}
                      >
                        To Hand
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => {
                          handleMoveFieldCardToDeck(selectedMagicCard);
                          setSelectedMagicCard(null);
                        }}
                        disabled={actionInProgress}
                      >
                        To Deck
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSelectedMagicCard(null)}
                      >
                        Cancel
                      </Button>
                    </div>
                  )}
                  <div className="relative flex items-center max-w-4xl">
                    {/* Left Side - 2 Magic slots */}
                    <div className="grid grid-cols-2 gap-3 w-[40%]">
                      {[0, 1].map((slotIdx) => {
                        const magicCard = currentUserPlayer?.magicZone?.[slotIdx];
                        const cardData = magicCard ? findCardData(magicCard.cardId, currentUserCards) : null;
                        const isSelected = selectedMagicCard === magicCard?.id;
                        
                        return (
                          <div key={slotIdx} className="relative">
                            <button
                              onClick={() => {
                                if (magicCard) {
                                  setSelectedMagicCard(isSelected ? null : magicCard.id);
                                }
                              }}
                              disabled={!magicCard}
                              className={`w-full relative aspect-[2/3] rounded-lg overflow-hidden border-2 ${
                                isSelected ? 'border-purple-300 ring-4 ring-purple-300' : 
                                magicCard ? 'border-purple-500 hover:border-purple-400' : 'border-dashed border-purple-500/25'
                              } bg-purple-500/5 transition-all ${
                                magicCard && !isSelected ? 'hover:scale-150 hover:z-20' : ''
                              } ${magicCard ? 'cursor-pointer' : 'cursor-default'}`}
                            >
                              {magicCard && cardData?.imageUrl ? (
                                <>
                                  <Image
                                    src={cardData.imageUrl}
                                    alt={cardData.name || 'Card'}
                                    fill
                                    className="object-cover"
                                  />
                                  {isSelected && (
                                    <div className="absolute inset-0 bg-purple-500/20 flex items-center justify-center pointer-events-none">
                                      <div className="bg-purple-500 text-white px-2 py-1 rounded text-xs font-bold">
                                        SELECTED
                                      </div>
                                    </div>
                                  )}
                                </>
                              ) : magicCard ? (
                                <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                                  <div className="text-center">
                                    <Layers className="h-6 w-6 mx-auto mb-1" />
                                    <p className="text-xs">Loading...</p>
                                  </div>
                                </div>
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                                  <Layers className="h-6 w-6 opacity-30" />
                                </div>
                              )}
                            </button>
                          </div>
                        );
                      })}
                    </div>

                    {/* Right Side - 2 Magic slots */}
                    <div className="grid grid-cols-2 gap-3 w-[40%] ml-auto">
                      {[2, 3].map((slotIdx) => {
                        const magicCard = currentUserPlayer?.magicZone?.[slotIdx];
                        const cardData = magicCard ? findCardData(magicCard.cardId, currentUserCards) : null;
                        const isSelected = selectedMagicCard === magicCard?.id;
                        
                        return (
                          <div key={slotIdx} className="relative">
                            <button
                              onClick={() => {
                                if (magicCard) {
                                  setSelectedMagicCard(isSelected ? null : magicCard.id);
                                }
                              }}
                              disabled={!magicCard}
                              className={`w-full relative aspect-[2/3] rounded-lg overflow-hidden border-2 ${
                                isSelected ? 'border-purple-300 ring-4 ring-purple-300' : 
                                magicCard ? 'border-purple-500 hover:border-purple-400' : 'border-dashed border-purple-500/25'
                              } bg-purple-500/5 transition-all ${
                                magicCard && !isSelected ? 'hover:scale-150 hover:z-20' : ''
                              } ${magicCard ? 'cursor-pointer' : 'cursor-default'}`}
                            >
                              {magicCard && cardData?.imageUrl ? (
                                <>
                                  <Image
                                    src={cardData.imageUrl}
                                    alt={cardData.name || 'Card'}
                                    fill
                                    className="object-cover"
                                  />
                                  {isSelected && (
                                    <div className="absolute inset-0 bg-purple-500/20 flex items-center justify-center pointer-events-none">
                                      <div className="bg-purple-500 text-white px-2 py-1 rounded text-xs font-bold">
                                        SELECTED
                                      </div>
                                    </div>
                                  )}
                                </>
                              ) : magicCard ? (
                                <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                                  <div className="text-center">
                                    <Layers className="h-6 w-6 mx-auto mb-1" />
                                    <p className="text-xs">Loading...</p>
                                  </div>
                                </div>
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                                  <Layers className="h-6 w-6 opacity-30" />
                                </div>
                              )}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Deck & Hell Area - Between Magic and Construct (Horizontal Layout) */}
                <div className="flex flex-col gap-2 flex-shrink-0">
                  <div className="flex gap-2">
                    {/* Deck Pile */}
                    <div className="flex flex-col items-center">
                      <div className="relative w-24 aspect-[2/3] rounded-lg overflow-hidden border-4 border-green-600 shadow-xl">
                        <div className="w-full h-full bg-gradient-to-br from-green-900 via-emerald-900 to-green-900 flex flex-col items-center justify-center text-white">
                          <Layers className="h-6 w-6 mb-1" />
                          <div className="text-lg font-bold">{currentUserPlayer?.deck?.length || 0}</div>
                          <div className="text-xs">Cards</div>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1 mb-1">Deck</p>
                    </div>

                    {/* Hell Pile */}
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
                      <p className="text-sm text-muted-foreground mt-1 mb-1">Hell</p>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <div className="flex flex-col gap-1 w-24">
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
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={handleShuffleDeck}
                        disabled={actionInProgress || !currentUserPlayer?.deck?.length}
                        className="w-full text-xs"
                      >
                        <RotateCw className="h-3 w-3 mr-1" />
                        Shuffle
                      </Button>
                    </div>
                    <div className="flex flex-col gap-1 w-24">
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
                        onClick={() => handleZoneSelection('construct')}
                        disabled={actionInProgress}
                        className="bg-orange-600 hover:bg-orange-700"
                      >
                        Construct Zone
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
                {/* Hand Cards - Overlapping Fan Layout */}
                <div className="relative flex justify-center items-end" style={{ height: '280px', paddingBottom: '20px' }}>
                  {currentUserPlayer?.hand?.map((cardInHand: any, idx: number) => {
                    const cardData = findCardData(cardInHand.cardId, currentUserCards);
                    const isSelected = selectedCard?.id === cardInHand.id;
                    const totalCards = currentUserPlayer?.hand?.length || 1;
                    
                    // Calculate fan positions (right-side up - narrow at top, wide at bottom)
                    const spreadAngle = Math.min(40, totalCards * 8); // Max spread of 40 degrees
                    const angleStep = totalCards > 1 ? spreadAngle / (totalCards - 1) : 0;
                    const rotation = spreadAngle/2 - (idx * angleStep); // Inverted rotation
                    
                    // Horizontal offset for overlap effect
                    const baseOffset = -60; // Overlap amount in pixels
                    const centerOffset = ((totalCards - 1) * baseOffset) / 2;
                    const xPosition = (idx * baseOffset) - centerOffset;
                    
                    // Vertical offset for arc effect (cards at edges are lower)
                    const yOffset = Math.abs(rotation) * 1.5; // Positive to move cards down at edges
                    
                    return (
                      <button
                        key={cardInHand.id}
                        onClick={() => setSelectedCard(isSelected ? null : { id: cardInHand.id, index: idx })}
                        className={`absolute w-40 aspect-[2/3] rounded-lg overflow-hidden border-2 ${
                          isSelected ? 'border-yellow-500 ring-4 ring-yellow-300' : 'border-primary'
                        } shadow-lg cursor-pointer transition-all duration-300 ease-out`}
                        style={{
                          left: '50%',
                          bottom: '0',
                          transform: `translateX(calc(-50% + ${xPosition}px)) translateY(${yOffset}px) rotate(${rotation}deg)`,
                          zIndex: isSelected ? 100 : 10 + idx,
                          transformOrigin: 'bottom center',
                        }}
                        onMouseEnter={(e) => {
                          if (!isSelected) {
                            e.currentTarget.style.transform = `translateX(calc(-50% + ${xPosition}px)) translateY(-60px) rotate(0deg) scale(1.1)`;
                            e.currentTarget.style.zIndex = '99';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!isSelected) {
                            e.currentTarget.style.transform = `translateX(calc(-50% + ${xPosition}px)) translateY(${yOffset}px) rotate(${rotation}deg)`;
                            e.currentTarget.style.zIndex = String(10 + idx);
                          }
                        }}
                      >
                        {cardData?.imageUrl ? (
                          <Image
                            src={cardData.imageUrl}
                            alt={cardData.name || 'Card'}
                            fill
                            className="object-cover pointer-events-none"
                          />
                        ) : (
                          <div className="w-full h-full bg-muted flex items-center justify-center">
                            <p className="text-xs text-center p-2">Loading...</p>
                          </div>
                        )}
                        {isSelected && (
                          <div className="absolute inset-0 bg-yellow-500/20 flex items-center justify-center pointer-events-none">
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
