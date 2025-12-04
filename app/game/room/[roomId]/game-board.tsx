'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, Layers, RotateCw, Search, X } from 'lucide-react';
import { GamePlayer } from '@/types/game';
import { Card as CardType } from '@/types/card';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';
import { drawCard, drawCardFromBottom, viewDeckBottom, playCard, discardCard, moveFieldCardToHell, moveFieldCardToHand, moveFieldCardToDeck, searchCardFromDeck, searchCardFromHell, shuffleDeck, flipLifeCard, moveAvatarToOpponentField, toggleCardRotation, moveHandCardToDeck, updateCardPower, rollDice, endTurn, surrender, scryDeck as scryDeckAPI, resolveScry as resolveScryAPI } from '@/lib/api';
import { ScryModal } from '@/components/game/ScryModal';

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
  const [selectedCards, setSelectedCards] = useState<Array<{ id: string; index: number; order: number }>>([]);
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
  const [powerInputValue, setPowerInputValue] = useState<string>('');
  const [showPowerInput, setShowPowerInput] = useState(false);
  const [showOpponentHellModal, setShowOpponentHellModal] = useState(false);
  const [diceResult, setDiceResult] = useState<number | null>(null);
  const [isRolling, setIsRolling] = useState(false);
  const [showDiceResult, setShowDiceResult] = useState(false);
  const [diceRollUsername, setDiceRollUsername] = useState<string>('');
  const [diceTimeoutId, setDiceTimeoutId] = useState<NodeJS.Timeout | null>(null);
  const [showTurnNotification, setShowTurnNotification] = useState(false);
  const [turnNotificationMessage, setTurnNotificationMessage] = useState<{ title: string; message: string } | null>(null);
  const [isHandVisible, setIsHandVisible] = useState(true);
  const [discardAnimation, setDiscardAnimation] = useState<{
    cardName: string;
    cardImageUrl: string | null;
    username: string;
  } | null>(null);
  const [showDiscardAnimation, setShowDiscardAnimation] = useState(false);
  const [discardQueue, setDiscardQueue] = useState<Array<{
    cardName: string;
    cardImageUrl: string | null;
    username: string;
  }>>([]);
  const [isProcessingDiscard, setIsProcessingDiscard] = useState(false);
  const [magicAnimation, setMagicAnimation] = useState<{
    cardName: string;
    cardImageUrl: string | null;
    username: string;
    isReact?: boolean;
  } | null>(null);
  const [showMagicAnimation, setShowMagicAnimation] = useState(false);
  const [magicQueue, setMagicQueue] = useState<Array<{
    cardName: string;
    cardImageUrl: string | null;
    username: string;
    isReact?: boolean;
  }>>([]);
  const [isProcessingMagic, setIsProcessingMagic] = useState(false);
  const [showScryInput, setShowScryInput] = useState(false);
  const [scryCount, setScryCount] = useState<string>('3');
  const [scryedCards, setScryedCards] = useState<any[]>([]);
  const [showScryModal, setShowScryModal] = useState(false);
  const [selectedScryCards, setSelectedScryCards] = useState<{
    toHand: string[];
    toTop: string[];
    toBottom: string[];
  }>({ toHand: [], toTop: [], toBottom: [] });

  // Prevent scrolling during actions to avoid jittering
  useEffect(() => {
    if (actionInProgress) {
      // Disable scrolling
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
    } else {
      // Re-enable scrolling
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    }

    // Cleanup on unmount
    return () => {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    };
  }, [actionInProgress]);

  // Listen for card discard events from ALL players
  useEffect(() => {
    const handleCardDiscard = (event: any) => {
      const { username, cardName, cardImageUrl } = event.detail;
      
      // Add to queue
      setDiscardQueue(prev => [...prev, {
        cardName: cardName || 'Card',
        cardImageUrl: cardImageUrl || null,
        username,
      }]);
    };

    window.addEventListener('card-discard', handleCardDiscard);

    return () => {
      window.removeEventListener('card-discard', handleCardDiscard);
    };
  }, []);

  // Listen for magic card usage events from ALL players
  useEffect(() => {
    const handleMagicUse = (event: any) => {
      const { username, cardName, cardImageUrl, isReact } = event.detail;
      
      // Add to queue
      setMagicQueue(prev => [...prev, {
        cardName: cardName || 'Magic Card',
        cardImageUrl: cardImageUrl || null,
        username,
        isReact: isReact || false,
      }]);
    };

    window.addEventListener('card-magic-use', handleMagicUse);

    return () => {
      window.removeEventListener('card-magic-use', handleMagicUse);
    };
  }, []);

  // Process discard queue
  useEffect(() => {
    if (isProcessingDiscard || discardQueue.length === 0) return;
    
    setIsProcessingDiscard(true);
    const nextCard = discardQueue[0];
    
    // Show animation
    setDiscardAnimation(nextCard);
    setShowDiscardAnimation(true);
    
    // Hide after 3 seconds
    setTimeout(() => {
      setShowDiscardAnimation(false);
      setTimeout(() => {
        setDiscardAnimation(null);
        setDiscardQueue(prev => prev.slice(1)); // Remove from queue
        setIsProcessingDiscard(false);
      }, 400);
    }, 3000);
  }, [discardQueue, isProcessingDiscard]);

  // Process magic queue
  useEffect(() => {
    if (isProcessingMagic || magicQueue.length === 0) return;
    
    setIsProcessingMagic(true);
    const nextCard = magicQueue[0];
    
    // Show animation
    setMagicAnimation(nextCard);
    setShowMagicAnimation(true);
    
    // Hide after 3 seconds
    setTimeout(() => {
      setShowMagicAnimation(false);
      setTimeout(() => {
        setMagicAnimation(null);
        setMagicQueue(prev => prev.slice(1)); // Remove from queue
        setIsProcessingMagic(false);
      }, 400);
    }, 3000);
  }, [magicQueue, isProcessingMagic]);

  // Listen for dice roll events from ALL players (including self)
  useEffect(() => {
    const handleDiceRollResult = (event: any) => {
      const { userId: rollerUserId, username, result } = event.detail;
      
      // Clear any pending timeout
      if (diceTimeoutId) {
        clearTimeout(diceTimeoutId);
        setDiceTimeoutId(null);
      }
      
      // Wait for animation to complete (1.5s) before showing result
      setTimeout(() => {
        setDiceRollUsername(username);
        setDiceResult(result);
        setIsRolling(false);
        setShowDiceResult(true);
        
        toast({
          title: '🎲 Dice Roll',
          description: `${username} rolled a ${result}!`,
        });
        
        // Hide result after 4 seconds (total 5.5s from start)
        setTimeout(() => {
          setShowDiceResult(false);
          setDiceResult(null);
          setDiceRollUsername('');
        }, 4000);
      }, 1500);
    };

    const handleTurnChange = (event: any) => {
      const { currentPlayer, previousPlayer, turnNumber } = event.detail;
      
      if (!currentPlayer || !user?.id) return;
      
      // Show large center notification to both players
      if (currentPlayer.userId === user.id) {
        // It's now your turn
        setTurnNotificationMessage({
          title: '🎯 Your Turn',
          message: `Turn ${turnNumber}`
        });
        setShowTurnNotification(true);
        
        toast({
          title: "Your Turn",
          description: `Turn ${turnNumber} - It's your move!`,
          duration: 5000,
        });
      } else {
        // Opponent's turn
        setTurnNotificationMessage({
          title: '⏳ Opponent\'s Turn',
          message: `${currentPlayer.username} - Turn ${turnNumber}`
        });
        setShowTurnNotification(true);
        
        toast({
          title: "Opponent's Turn",
          description: `${currentPlayer.username} is now taking Turn ${turnNumber}`,
          duration: 5000,
        });
      }
      
      // Hide notification after 3 seconds
      setTimeout(() => {
        setShowTurnNotification(false);
        setTimeout(() => setTurnNotificationMessage(null), 500); // Clear after fade out
      }, 3000);
    };

    window.addEventListener('dice-roll-result', handleDiceRollResult);
    window.addEventListener('turn-change', handleTurnChange);

    return () => {
      window.removeEventListener('dice-roll-result', handleDiceRollResult);
      window.removeEventListener('turn-change', handleTurnChange);
      if (diceTimeoutId) {
        clearTimeout(diceTimeoutId);
      }
    };
  }, [toast, diceTimeoutId, user]);

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

  const handleDrawCardFromBottom = async () => {
    if (!user || actionInProgress) return;
    
    setActionInProgress(true);
    try {
      await drawCardFromBottom(roomId, { userId: user.id });
      toast({
        title: 'Success',
        description: 'Drew a card from bottom of deck',
      });
      onRefresh();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to draw card from bottom',
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
      // Remove the played card from selected cards
      setSelectedCards(prev => prev.filter(c => c.id !== cardInstanceId));
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

  const handleZoneSelection = async (zone: 'avatar' | 'magic' | 'land' | 'field' | 'construct') => {
    setSelectedZone(zone);
    if (selectedCards.length > 0) {
      // Play cards in order
      for (const card of selectedCards.sort((a, b) => a.order - b.order)) {
        await handlePlayCard(card.id, zone);
      }
      setSelectedCards([]);
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
      // Remove the discarded card from selected cards
      setSelectedCards(prev => prev.filter(c => c.id !== cardInstanceId));
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

  const handleScryDeck = async () => {
    if (!user || actionInProgress) return;
    
    const count = parseInt(scryCount);
    if (isNaN(count) || count < 1 || count > 10) {
      toast({
        title: 'Error',
        description: 'Please enter a number between 1 and 10',
        variant: 'destructive',
      });
      return;
    }

    setActionInProgress(true);
    try {
      const result = await scryDeckAPI(roomId, { 
        userId: user.id, 
        count 
      });
      
      if (result && result.cards) {
        setScryedCards(result.cards);
        setShowScryModal(true);
      }
      
      toast({
        title: 'Scrying',
        description: `Viewing top ${result.count} card${result.count > 1 ? 's' : ''} of your deck`,
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to scry deck',
        variant: 'destructive',
      });
    } finally {
      setActionInProgress(false);
    }
  };

  const handleResolveScry = async (cardsToHand: string[], cardsToTop: string[], cardsToBottom: string[]) => {
    if (!user || actionInProgress) return;
    
    setActionInProgress(true);
    try {
      await resolveScryAPI(roomId, {
        userId: user.id,
        cardsToHand,
        cardsToTop,
        cardsToBottom
      });
      
      toast({
        title: 'Success',
        description: 'Scry resolved successfully',
      });
      
      setShowScryModal(false);
      setScryedCards([]);
      onRefresh();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to resolve scry',
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

  const handleMoveHandCardToDeck = async (cardInstanceId: string, position: 'top' | 'bottom') => {
    if (!user || actionInProgress) return;
    
    setActionInProgress(true);
    try {
      await moveHandCardToDeck(roomId, { userId: user.id, cardInstanceId, position });
      toast({
        title: 'Success',
        description: `Card returned to ${position} of deck`,
      });
      // Remove the moved card from selected cards
      setSelectedCards(prev => prev.filter(c => c.id !== cardInstanceId));
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

  const handleUpdateCardPower = async (cardInstanceId: string) => {
    if (!user || actionInProgress) return;
    
    const power = parseInt(powerInputValue);
    if (isNaN(power)) {
      toast({
        title: 'Error',
        description: 'Please enter a valid number',
        variant: 'destructive',
      });
      return;
    }
    
    setActionInProgress(true);
    try {
      await updateCardPower(roomId, { userId: user.id, cardInstanceId, power });
      toast({
        title: 'Success',
        description: `Card power updated to ${power}`,
      });
      setPowerInputValue('');
      setShowPowerInput(false);
      onRefresh();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update card power',
        variant: 'destructive',
      });
    } finally {
      setActionInProgress(false);
    }
  };

  const handleRollDice = async () => {
    // Prevent multiple clicks while rolling
    if (isRolling || !user) return;
    
    // Clear any existing states
    setDiceResult(null);
    setDiceRollUsername('');
    
    // Start rolling animation
    setIsRolling(true);
    setShowDiceResult(true);
    
    // Set timeout protection (10 seconds)
    const timeoutId = setTimeout(() => {
      setIsRolling(false);
      setShowDiceResult(false);
      setDiceResult(null);
      setDiceRollUsername('');
      toast({
        title: 'Timeout',
        description: 'Dice roll timed out. Please try again.',
        variant: 'destructive',
      });
    }, 10000);
    
    setDiceTimeoutId(timeoutId);
    
    try {
      // Call API to roll dice (server will broadcast result via Ably)
      // The result will be received via the dice-roll event listener
      await rollDice(roomId, { 
        userId: user.id, 
        username: user.username || 'Player' 
      });
    } catch (error: any) {
      // Clear timeout on error
      if (timeoutId) {
        clearTimeout(timeoutId);
        setDiceTimeoutId(null);
      }
      
      // Reset all states
      setIsRolling(false);
      setShowDiceResult(false);
      setDiceResult(null);
      setDiceRollUsername('');
      
      toast({
        title: 'Error',
        description: error.message || 'Failed to roll dice',
        variant: 'destructive',
      });
    }
  };

  const handleEndTurn = async () => {
    if (!user || actionInProgress) return;
    
    setActionInProgress(true);
    try {
      await endTurn(roomId, { userId: user.id });
      toast({
        title: 'Success',
        description: 'Turn ended. Magic usage counters reset.',
      });
      onRefresh();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to end turn',
        variant: 'destructive',
      });
    } finally {
      setActionInProgress(false);
    }
  };

  const handleSurrender = async () => {
    if (!user || actionInProgress) return;
    
    // Confirm surrender
    const confirmed = window.confirm('Are you sure you want to surrender?');
    if (!confirmed) return;
    
    setActionInProgress(true);
    try {
      await surrender(roomId, { userId: user.id });
      toast({
        title: 'Surrendered',
        description: 'You have surrendered the game.',
        variant: 'destructive',
      });
      onRefresh();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to surrender',
        variant: 'destructive',
      });
    } finally {
      setActionInProgress(false);
    }
  };

  // Check if player can surrender (must have 5 face-up life cards)
  const canSurrender = currentUserPlayer?.lifeCards?.filter((lc: any) => lc.faceUp).length === 5;

  // Determine current turn player
  const currentTurnPlayer = gameRoom.currentTurn 
    ? gameRoom.players.find((p: GamePlayer) => p.userId === gameRoom.currentTurn)
    : null;
  const isYourTurn = currentTurnPlayer?.userId === user?.id;

  return (
    <div className="space-y-6 pb-20">
      {/* Turn Indicator - Always Visible at Top */}
      {currentTurnPlayer && (
        <div className="flex justify-center mb-4 sticky top-0 z-30 bg-background/95 backdrop-blur-sm py-2">
          <div className={`px-8 py-3 rounded-xl font-bold text-lg shadow-lg border-2 transition-all ${
            isYourTurn 
              ? 'bg-gradient-to-r from-emerald-600 to-green-600 text-white border-emerald-400' 
              : 'bg-gradient-to-r from-slate-700 to-slate-800 text-slate-200 border-slate-500'
          }`}>
            <span className="mr-2">🎯</span>
            Current Turn: <span className="font-extrabold">{currentTurnPlayer.username}</span>
          </div>
        </div>
      )}

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
            <Badge 
              variant="outline" 
              className={`font-bold ${
                !currentTurnPlayer 
                  ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500'
                  : currentTurnPlayer.userId === opponentPlayer?.userId 
                    ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500' 
                    : 'bg-slate-700/20 text-slate-400 border-slate-600'
              }`}
            >
              {!currentTurnPlayer 
                ? '⏱️ Starting...' 
                : currentTurnPlayer.userId === opponentPlayer?.userId 
                  ? '🎯 Their Turn' 
                  : '⏳ Waiting'}
            </Badge>
          </div>
        </div>
        <Card>
        <CardContent className="space-y-4 pt-6">
          {/* Opponent's Hand */}
          <div>
            <p className="text-sm text-muted-foreground mb-2">Hand ({opponentPlayer?.hand?.length || 0})</p>
            <div className="flex justify-center">
              {(opponentPlayer?.hand?.length || 0) > 0 ? (
                <div className="relative w-32 aspect-[2/3] rounded-lg overflow-hidden border-4 border-yellow-600 shadow-xl">
                  <div className="w-full h-full bg-gradient-to-br from-blue-900 via-purple-900 to-blue-900 flex flex-col items-center justify-center">
                    <div className="text-center text-yellow-400">
                      <div className="text-3xl font-bold mb-2">BOT</div>
                      <div className="text-5xl font-extrabold">{opponentPlayer.hand.length}</div>
                      <div className="text-sm mt-1">Cards</div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-muted-foreground text-sm">No cards in hand</div>
              )}
            </div>
          </div>


{/* Opponent's Magic Zone & Deck/Hell - Side by Side */}
<div className="flex gap-6">
  {/* Magic Zone */}
  <div className="flex-1">
    <p className="text-sm text-muted-foreground mb-2">
      Magic Zone ({opponentPlayer?.magicZone?.length || 0}/4)
    </p>

    <div className="grid grid-cols-4 gap-3">
      {[0, 1, 2, 3].map((slotIdx) => {
        const magicCard = opponentPlayer?.magicZone?.[slotIdx];
        const cardData = magicCard ? findCardData(magicCard.cardId, opponentCards) : null;

        return (
          <div key={slotIdx} className="relative">
            <div
              className={`w-full relative aspect-[2/3] rounded-lg overflow-hidden border-2 ${
                magicCard
                  ? 'border-purple-500 hover:border-purple-400'
                  : 'border-dashed border-purple-500/25'
              } bg-purple-500/5 transition-all ${
                magicCard ? 'hover:scale-150 hover:z-20' : ''
              }`}
            >
              {magicCard && cardData?.imageUrl ? (
                <Image
                  src={cardData.imageUrl}
                  alt={cardData.name || 'Card'}
                  fill
                  className="object-cover"
                  priority
                  quality={100}
                  sizes="(max-width: 768px) 150px, 225px"
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

  {/* Deck & Hell Area - Next to Magic Zone, aligned to bottom */}
  <div className="flex flex-col gap-2 flex-shrink-0 self-end">
    <div className="flex gap-2">
      {/* Deck Pile */}
      <div className="flex flex-col items-center">
        <div className="relative w-24 aspect-[2/3] rounded-lg overflow-hidden border-4 border-green-600 shadow-xl">
          <div className="w-full h-full bg-gradient-to-br from-green-900 via-emerald-900 to-green-900 flex flex-col items-center justify-center text-white">
            <Layers className="h-6 w-6 mb-1" />
            <div className="text-lg font-bold">{opponentPlayer?.deck?.length || 0}</div>
            <div className="text-xs">Cards</div>
          </div>
        </div>
        <p className="text-sm text-muted-foreground mt-1 mb-1">Deck</p>
      </div>

      {/* Hell Pile - Clickable */}
      <div className="flex flex-col items-center">
        <button
          onClick={() => setShowOpponentHellModal(true)}
          disabled={!opponentPlayer?.hell || opponentPlayer.hell.length === 0}
          className="relative w-24 aspect-[2/3] rounded-lg overflow-hidden border-4 border-red-600 shadow-xl hover:border-red-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:scale-110"
        >
          {opponentPlayer?.hell && opponentPlayer.hell.length > 0 ? (
            <div className="w-full h-full bg-gradient-to-br from-red-900 via-orange-900 to-red-900 flex flex-col items-center justify-center text-white">
              <div className="text-2xl font-bold">{opponentPlayer.hell.length}</div>
              <div className="text-xs">Cards</div>
            </div>
          ) : (
            <div className="w-full h-full bg-muted flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <div className="text-xs">Empty</div>
              </div>
            </div>
          )}
        </button>
        <p className="text-sm text-muted-foreground mt-1 mb-1">Hell</p>
      </div>
    </div>
    {opponentPlayer?.hell && opponentPlayer.hell.length > 0 && (
      <p className="text-xs text-muted-foreground text-center">Click to view</p>
    )}
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
                        } bg-blue-500/5 transition-all ${avatarCard ? 'hover:scale-[2.5] hover:z-20' : ''}`}
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
                              priority
                              quality={100}
                              sizes="(max-width: 768px) 300px, 450px"
                            />
                            {avatarCard.currentPower !== undefined && (
                              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-purple-600/90 text-white px-4 py-2 rounded-full text-3xl font-bold border-4 border-white shadow-2xl">
                                {avatarCard.currentPower}
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
                                  loading="lazy"
                                  quality={75}
                                  sizes="(max-width: 768px) 80px, 120px"
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
                                priority
                                quality={100}
                                sizes="(max-width: 768px) 384px, 576px"
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
                        } bg-blue-500/5 transition-all ${avatarCard ? 'hover:scale-[2.5] hover:z-20' : ''}`}
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
                              priority
                              quality={100}
                              sizes="(max-width: 768px) 300px, 450px"
                            />
                            {avatarCard.currentPower !== undefined && (
                              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-purple-600/90 text-white px-4 py-2 rounded-full text-3xl font-bold border-4 border-white shadow-2xl">
                                {avatarCard.currentPower}
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
              <div className="grid grid-cols-3 gap-2 mb-4">
                {[0, 1, 2].map((slotIdx) => {
                  const constructCard = opponentPlayer?.constructZone?.[slotIdx];
                  const cardData = constructCard ? findCardData(constructCard.cardId, opponentCards) : null;
                  
                  return (
                    <div key={slotIdx} className="relative">
                      <div className={`relative aspect-[2/3] rounded-lg overflow-hidden border-2 ${
                        constructCard ? 'border-orange-500 hover:border-orange-400' : 'border-dashed border-orange-500/25'
                      } bg-orange-500/5 transition-all ${constructCard ? 'hover:scale-[4] hover:z-20' : ''}`}>
                        {constructCard && cardData?.imageUrl ? (
                          <Image
                            src={cardData.imageUrl}
                            alt={cardData.name || 'Card'}
                            fill
                            className="object-cover"
                            priority
                            quality={100}
                            sizes="(max-width: 768px) 400px, 600px"
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
              
              {/* Opponent's Life Cards */}
              <div>
                <p className="text-sm text-muted-foreground mb-2 text-center">Life Cards ({opponentPlayer?.lifeCards?.length || 0})</p>
                  <div className="flex gap-2 justify-center">
                    {opponentPlayer?.lifeCards?.map((lifeCard: any, idx: number) => {
                      const cardData = lifeCard ? findCardData(lifeCard.cardId, opponentCards) : null;
                      
                      return (
                        <div key={idx} className="relative">
                          <div className="relative w-16 aspect-[2/3] rounded-lg overflow-hidden border-2 border-red-500 shadow-md hover:scale-[5] hover:z-30 transition-all">
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
                                priority
                                quality={100}
                                sizes="(max-width: 768px) 400px, 500px"
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
            <div className="flex items-center gap-2 text-sm font-normal">
              <Badge variant="outline">Deck: {currentUserPlayer?.deck?.length || 0}</Badge>
              <Badge variant="outline">Life: {currentUserPlayer?.lifeCards?.length || 0}</Badge>
              <Badge 
                variant="outline" 
                className={`font-bold ${
                  !currentTurnPlayer 
                    ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500'
                    : isYourTurn 
                      ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500' 
                      : 'bg-slate-700/20 text-slate-400 border-slate-600'
                }`}
              >
                {!currentTurnPlayer 
                  ? '⏱️ Starting...' 
                  : isYourTurn 
                    ? '🎯 Your Turn' 
                    : '⏳ Waiting'}
              </Badge>
              <Button
                size="sm"
                onClick={handleEndTurn}
                disabled={actionInProgress || (currentTurnPlayer && !isYourTurn)}
                className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white font-bold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                End Turn
              </Button>
              <Button
                size="sm"
                onClick={handleSurrender}
                disabled={actionInProgress || !canSurrender}
                variant="destructive"
                className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                title={!canSurrender ? "You can only surrender when you have 5 face-up life cards" : "Surrender the game"}
              >
                Surrender
              </Button>
            </div>
          </CardTitle>
          
          {/* Magic Quota Display - Below End Turn Button */}
          <div className="flex items-center justify-end gap-1 text-[10px] bg-gradient-to-r from-purple-500/10 via-blue-500/10 to-purple-500/10 px-2 py-1 rounded border border-purple-500/20 mt-2">
            <span className="font-semibold text-purple-300">🎴 Magic Quota:</span>
            <Badge variant="outline" className="bg-blue-500/10 border-blue-500/30 text-[9px] px-1 py-0 h-4">
              N: {currentUserPlayer?.magicQuota?.normal.max - (currentUserPlayer?.magicQuota?.normal.used || 0)}/{currentUserPlayer?.magicQuota?.normal.max || 1}
            </Badge>
            <Badge variant="outline" className="bg-purple-500/10 border-purple-500/30 text-[9px] px-1 py-0 h-4">
              R: {currentUserPlayer?.magicQuota?.react.max - (currentUserPlayer?.magicQuota?.react.used || 0)}/{currentUserPlayer?.magicQuota?.react.max || 1}
            </Badge>
            <Badge variant="outline" className="bg-pink-500/10 border-pink-500/30 text-[9px] px-1 py-0 h-4">
              M: {currentUserPlayer?.magicQuota?.modification.max - (currentUserPlayer?.magicQuota?.modification.used || 0)}/{currentUserPlayer?.magicQuota?.modification.max || 1}
            </Badge>
            <Badge variant="outline" className="bg-green-500/10 border-green-500/30 text-[9px] px-1 py-0 h-4">
              L: {currentUserPlayer?.magicQuota?.land.max - (currentUserPlayer?.magicQuota?.land.used || 0)}/{currentUserPlayer?.magicQuota?.land.max || 1}
            </Badge>
            <Badge variant="outline" className="bg-red-500/10 border-red-500/30 text-[9px] px-1 py-0 h-4">
              อ2: {currentUserPlayer?.magicQuota?.noSecondTime.max - (currentUserPlayer?.magicQuota?.noSecondTime.used || 0)}/{currentUserPlayer?.magicQuota?.noSecondTime.max || 1}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          
          {/* Main Play Area */}
          <div className="space-y-4">
              {/* Current User's Avatar Zone & Construct Zone - Side by Side */}
              <div className="flex gap-6">
                {/* Avatar Zone */}
                <div className="flex-1 relative">
                  <p className="text-sm text-muted-foreground mb-2">Your Avatar Zone ({currentUserPlayer?.avatarZone?.length || 0}/4)</p>
                {/* Floating action buttons above avatar zone */}
                {selectedMagicCard && currentUserPlayer?.avatarZone?.find((c: any) => c.id === selectedMagicCard) && (
                  <div className="absolute top-8 left-0 right-0 z-30 flex justify-center pointer-events-none">
                    <div className="bg-blue-900/95 backdrop-blur-md border-2 border-blue-500/50 rounded-lg shadow-2xl p-1.5 flex gap-1 flex-wrap max-w-md pointer-events-auto">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleToggleCardRotation(selectedMagicCard)}
                        className="h-7 px-2 text-xs bg-blue-600/80 hover:bg-blue-700 text-white"
                        disabled={actionInProgress}
                        title="Rotate Card"
                      >
                        <RotateCw className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 px-2 text-xs bg-purple-600/80 hover:bg-purple-700 text-white"
                        onClick={() => {
                          setShowPowerInput(!showPowerInput);
                          if (!showPowerInput) {
                            const card = currentUserPlayer?.avatarZone?.find((c: any) => c.id === selectedMagicCard);
                            setPowerInputValue(card?.currentPower?.toString() || '');
                          }
                        }}
                        disabled={actionInProgress}
                        title="Set Power"
                      >
                        ⚡
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 px-2 text-xs bg-green-600/80 hover:bg-green-700 text-white"
                        onClick={() => handleMoveAvatarToOpponentField(selectedMagicCard)}
                        disabled={actionInProgress}
                        title="Move to Opponent Field"
                      >
                        ↑
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 px-2 text-xs bg-red-600/80 hover:bg-red-700 text-white"
                        onClick={() => {
                          handleMoveFieldCardToHell(selectedMagicCard);
                          setSelectedMagicCard(null);
                        }}
                        disabled={actionInProgress}
                        title="To Hell"
                      >
                        🔥
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 px-2 text-xs bg-slate-600/80 hover:bg-slate-700 text-white"
                        onClick={() => {
                          handleMoveFieldCardToHand(selectedMagicCard);
                          setSelectedMagicCard(null);
                        }}
                        disabled={actionInProgress}
                        title="To Hand"
                      >
                        👋
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 px-2 text-xs bg-slate-600/80 hover:bg-slate-700 text-white"
                        onClick={() => {
                          handleMoveFieldCardToDeck(selectedMagicCard);
                          setSelectedMagicCard(null);
                        }}
                        disabled={actionInProgress}
                        title="To Deck"
                      >
                        📚
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 px-2 text-xs bg-slate-500/80 hover:bg-slate-600 text-white"
                        onClick={() => {
                          setSelectedMagicCard(null);
                          setShowPowerInput(false);
                          setPowerInputValue('');
                        }}
                        title="Cancel"
                      >
                        ✕
                      </Button>
                    </div>
                  </div>
                )}
                {/* Power input floating above */}
                {selectedMagicCard && currentUserPlayer?.avatarZone?.find((c: any) => c.id === selectedMagicCard) && showPowerInput && (
                  <div className="absolute top-16 left-0 right-0 z-30 flex justify-center pointer-events-none">
                    <div className="bg-purple-900/95 backdrop-blur-md border-2 border-purple-500/50 rounded-lg shadow-2xl p-2 flex gap-2 items-center pointer-events-auto">
                      <input
                        type="number"
                        value={powerInputValue}
                        onChange={(e) => setPowerInputValue(e.target.value)}
                        className="w-16 h-7 px-2 text-xs rounded border border-purple-500 bg-background text-foreground"
                        placeholder="0"
                        disabled={actionInProgress}
                      />
                      <Button
                        size="sm"
                        className="h-7 px-2 text-xs bg-purple-600 hover:bg-purple-700"
                        onClick={() => handleUpdateCardPower(selectedMagicCard)}
                        disabled={actionInProgress || !powerInputValue}
                      >
                        ✓
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 px-2 text-xs"
                        onClick={() => {
                          setShowPowerInput(false);
                          setPowerInputValue('');
                        }}
                      >
                        ✕
                      </Button>
                    </div>
                  </div>
                )}
                {/* Floating land zone action buttons */}
                {selectedFieldCard && currentUserPlayer?.landZone?.find((c: any) => c.id === selectedFieldCard) && (
                  <div className="absolute top-8 left-0 right-0 z-30 flex justify-center pointer-events-none">
                    <div className="bg-amber-900/95 backdrop-blur-md border-2 border-amber-500/50 rounded-lg shadow-2xl p-1.5 flex gap-1 pointer-events-auto">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 px-2 text-xs bg-red-600/80 hover:bg-red-700 text-white"
                        onClick={() => handleMoveFieldCardToHell(selectedFieldCard)}
                        disabled={actionInProgress}
                        title="To Hell"
                      >
                        🔥
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 px-2 text-xs bg-slate-600/80 hover:bg-slate-700 text-white"
                        onClick={() => handleMoveFieldCardToHand(selectedFieldCard)}
                        disabled={actionInProgress}
                        title="To Hand"
                      >
                        👋
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 px-2 text-xs bg-slate-600/80 hover:bg-slate-700 text-white"
                        onClick={() => handleMoveFieldCardToDeck(selectedFieldCard)}
                        disabled={actionInProgress}
                        title="To Deck"
                      >
                        📚
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 px-2 text-xs bg-slate-500/80 hover:bg-slate-600 text-white"
                        onClick={() => setSelectedFieldCard(null)}
                        title="Cancel"
                      >
                        ✕
                      </Button>
                    </div>
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
                              avatarCard && !isSelected ? 'hover:scale-[2.5] hover:z-20' : ''
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
                                {avatarCard.currentPower !== undefined && (
                                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-purple-600/90 text-white px-4 py-2 rounded-full text-3xl font-bold border-4 border-white shadow-2xl">
                                    {avatarCard.currentPower}
                                  </div>
                                )}
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
                              avatarCard && !isSelected ? 'hover:scale-[2.5] hover:z-20' : ''
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
                                {avatarCard.currentPower !== undefined && (
                                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-purple-600/90 text-white px-4 py-2 rounded-full text-3xl font-bold border-4 border-white shadow-2xl">
                                    {avatarCard.currentPower}
                                  </div>
                                )}
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
                <div className="flex-shrink-0 relative" style={{ width: '280px' }}>
                  <p className="text-sm text-muted-foreground mb-2">Your Construct Zone ({currentUserPlayer?.constructZone?.length || 0}/3)</p>
                  {/* Floating construct action buttons */}
                  {selectedConstructCard && currentUserPlayer?.constructZone?.find((c: any) => c.id === selectedConstructCard) && (
                    <div className="absolute top-8 left-0 right-0 z-30 flex justify-center pointer-events-none">
                      <div className="bg-orange-900/95 backdrop-blur-md border-2 border-orange-500/50 rounded-lg shadow-2xl p-1.5 flex gap-1 pointer-events-auto">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 px-2 text-xs bg-red-600/80 hover:bg-red-700 text-white"
                          onClick={() => {
                            handleMoveFieldCardToHell(selectedConstructCard);
                            setSelectedConstructCard(null);
                          }}
                          disabled={actionInProgress}
                          title="To Hell"
                        >
                          🔥
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 px-2 text-xs bg-slate-600/80 hover:bg-slate-700 text-white"
                          onClick={() => {
                            handleMoveFieldCardToHand(selectedConstructCard);
                            setSelectedConstructCard(null);
                          }}
                          disabled={actionInProgress}
                          title="To Hand"
                        >
                          👋
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 px-2 text-xs bg-slate-600/80 hover:bg-slate-700 text-white"
                          onClick={() => {
                            handleMoveFieldCardToDeck(selectedConstructCard);
                            setSelectedConstructCard(null);
                          }}
                          disabled={actionInProgress}
                          title="To Deck"
                        >
                          📚
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 px-2 text-xs bg-slate-500/80 hover:bg-slate-600 text-white"
                          onClick={() => setSelectedConstructCard(null)}
                          title="Cancel"
                        >
                          ✕
                        </Button>
                      </div>
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
                              constructCard && !isSelected ? 'hover:scale-[4] hover:z-20' : ''
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
                              className="relative w-16 aspect-[2/3] rounded-lg overflow-hidden border-2 border-red-500 shadow-md hover:scale-[5] hover:z-30 transition-all cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
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
                <div className="flex-1 relative">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm text-muted-foreground">Your Magic Zone ({currentUserPlayer?.magicZone?.length || 0}/4)</p>
                    <Button
                      size="sm"
                      onClick={handleRollDice}
                      disabled={isRolling}
                      className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold"
                    >
                      🎲 Roll Dice
                    </Button>
                  </div>
                  {/* Floating magic zone action buttons */}
                  {selectedMagicCard && currentUserPlayer?.magicZone?.find((c: any) => c.id === selectedMagicCard) && (
                    <div className="absolute top-12 left-0 right-0 z-30 flex justify-center pointer-events-none">
                      <div className="bg-purple-900/95 backdrop-blur-md border-2 border-purple-500/50 rounded-lg shadow-2xl p-1.5 flex gap-1 pointer-events-auto">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 px-2 text-xs bg-red-600/80 hover:bg-red-700 text-white"
                          onClick={() => {
                            handleMoveFieldCardToHell(selectedMagicCard);
                            setSelectedMagicCard(null);
                          }}
                          disabled={actionInProgress}
                          title="To Hell"
                        >
                          🔥
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 px-2 text-xs bg-slate-600/80 hover:bg-slate-700 text-white"
                          onClick={() => {
                            handleMoveFieldCardToHand(selectedMagicCard);
                            setSelectedMagicCard(null);
                          }}
                          disabled={actionInProgress}
                          title="To Hand"
                        >
                          👋
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 px-2 text-xs bg-slate-600/80 hover:bg-slate-700 text-white"
                          onClick={() => {
                            handleMoveFieldCardToDeck(selectedMagicCard);
                            setSelectedMagicCard(null);
                          }}
                          disabled={actionInProgress}
                          title="To Deck"
                        >
                          📚
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 px-2 text-xs bg-slate-500/80 hover:bg-slate-600 text-white"
                          onClick={() => setSelectedMagicCard(null)}
                          title="Cancel"
                        >
                          ✕
                        </Button>
                      </div>
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
                                magicCard && !isSelected ? 'hover:scale-[2.5] hover:z-20' : ''
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
                                magicCard && !isSelected ? 'hover:scale-[2.5] hover:z-20' : ''
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

                  {/* Action Buttons - Aligned with Deck and Hell */}
                  <div className="flex gap-2">
                    {/* Deck Buttons */}
                    <div className="flex flex-col gap-1 w-24">
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          onClick={handleDrawCard}
                          disabled={actionInProgress || !currentUserPlayer?.deck?.length}
                          className="text-[10px] px-2 py-1 h-7 flex-1"
                        >
                          Top
                        </Button>
                        <Button
                          size="sm"
                          onClick={handleDrawCardFromBottom}
                          disabled={actionInProgress || !currentUserPlayer?.deck?.length}
                          className="text-[10px] px-2 py-1 h-7 bg-blue-600 hover:bg-blue-700 flex-1"
                        >
                          Btm
                        </Button>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setShowSearchModal(true)}
                        disabled={actionInProgress || !currentUserPlayer?.deck?.length}
                        className="w-full text-[10px] px-2 py-1 h-7"
                      >
                        <Search className="h-3 w-3 mr-1" />
                        Search
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={handleShuffleDeck}
                        disabled={actionInProgress || !currentUserPlayer?.deck?.length}
                        className="w-full text-[10px] px-2 py-1 h-7"
                      >
                        <RotateCw className="h-3 w-3 mr-1" />
                        Shuffle
                      </Button>
                      <div className="flex gap-1">
                        <input
                          type="number"
                          min="1"
                          max="10"
                          value={scryCount}
                          onChange={(e) => setScryCount(e.target.value)}
                          className="w-8 h-7 px-1 text-[10px] rounded border border-cyan-500 bg-background text-foreground text-center"
                          disabled={actionInProgress || !currentUserPlayer?.deck?.length}
                        />
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={handleScryDeck}
                          disabled={actionInProgress || !currentUserPlayer?.deck?.length}
                          className="flex-1 text-[10px] px-2 py-1 h-7 bg-cyan-600 hover:bg-cyan-700 text-white border-cyan-500"
                        >
                          👁️ Scry
                        </Button>
                      </div>
                    </div>
                    
                    {/* Hell Buttons */}
                    <div className="flex flex-col gap-1 w-24">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setShowSearchHellModal(true)}
                        disabled={actionInProgress || !currentUserPlayer?.hell?.length}
                        className="w-full text-[10px] px-2 py-1 h-7"
                      >
                        <Search className="h-3 w-3 mr-1" />
                        Search
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

            {/* Current User's Hand - Fixed with Hide Button */}
            <div className="fixed bottom-0 left-0 right-0 z-40 pointer-events-none">

              {/* Small Toggle Modal - Bottom Right Corner */}
              <button
                onClick={() => setIsHandVisible(!isHandVisible)}
                className="fixed bottom-4 right-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white px-3 py-2 rounded-lg shadow-lg z-50 flex items-center gap-2 text-xs font-semibold pointer-events-auto hover:from-purple-700 hover:to-blue-700"
              >
                {isHandVisible ? (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3 h-3">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                    </svg>
                    Hide Hand
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3 h-3">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Show Hand
                  </>
                )}
              </button>

              <div className={`transition-all duration-300 pointer-events-none ${isHandVisible ? 'opacity-100' : 'opacity-0 h-0 overflow-hidden'}`}>
                
                {/* Floating Zone Selector - Above hand cards */}
                {selectedCards.length > 0 && showZoneSelector && (
                  <div className="absolute bottom-[290px] left-0 right-0 z-40 flex justify-center pointer-events-none">
                    <div className="bg-blue-900/95 backdrop-blur-md border-2 border-blue-500/50 rounded-lg shadow-2xl p-2 pointer-events-auto max-w-lg">
                      <p className="text-xs font-semibold mb-2 text-center text-white">
                        Select Zone ({selectedCards.length} card{selectedCards.length > 1 ? 's' : ''}):
                      </p>
                      <div className="flex gap-1.5 flex-wrap justify-center">
                        <Button
                          size="sm"
                          onClick={() => handleZoneSelection('avatar')}
                          disabled={actionInProgress}
                          className="h-7 px-3 text-xs bg-blue-600/80 hover:bg-blue-700"
                        >
                          Avatar
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleZoneSelection('magic')}
                          disabled={actionInProgress}
                          className="h-7 px-3 text-xs bg-purple-600/80 hover:bg-purple-700"
                        >
                          Magic
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleZoneSelection('construct')}
                          disabled={actionInProgress}
                          className="h-7 px-3 text-xs bg-orange-600/80 hover:bg-orange-700"
                        >
                          Construct
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleZoneSelection('land')}
                          disabled={actionInProgress}
                          className="h-7 px-3 text-xs bg-amber-600/80 hover:bg-amber-700"
                        >
                          Land
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setShowZoneSelector(false);
                            setSelectedZone(null);
                          }}
                          className="h-7 px-3 text-xs bg-slate-500/80 hover:bg-slate-600"
                        >
                          ✕
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Floating Hand Card Action Buttons - Above hand cards */}
                {selectedCards.length > 0 && !showZoneSelector && (
                  <div className="absolute bottom-[290px] left-0 right-0 z-40 flex justify-center pointer-events-none">
                    <div className="bg-slate-900/95 backdrop-blur-md border-2 border-slate-500/50 rounded-lg shadow-2xl p-2 pointer-events-auto max-w-2xl">
                      <p className="text-xs font-semibold mb-2 text-center text-white">
                        {selectedCards.length} card{selectedCards.length > 1 ? 's' : ''} selected
                      </p>
                      <div className="flex gap-1.5 flex-wrap justify-center">
                        <Button
                          size="sm"
                          onClick={() => setShowZoneSelector(true)}
                          disabled={actionInProgress}
                          className="h-7 px-3 text-xs bg-green-600/80 hover:bg-green-700"
                        >
                          Play
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={async () => {
                            for (const card of selectedCards.sort((a, b) => a.order - b.order)) {
                              await handleDiscardCard(card.id);
                            }
                          }}
                          disabled={actionInProgress}
                          className="h-7 px-3 text-xs bg-red-600/80 hover:bg-red-700 text-white"
                        >
                          Discard
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={async () => {
                            for (const card of selectedCards.sort((a, b) => a.order - b.order)) {
                              await handleMoveHandCardToDeck(card.id, 'top');
                            }
                          }}
                          disabled={actionInProgress}
                          className="h-7 px-3 text-xs bg-green-600/80 hover:bg-green-700 text-white"
                          title="Return to Top of Deck"
                        >
                          📚↑
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={async () => {
                            for (const card of selectedCards.sort((a, b) => a.order - b.order)) {
                              await handleMoveHandCardToDeck(card.id, 'bottom');
                            }
                          }}
                          disabled={actionInProgress}
                          className="h-7 px-3 text-xs bg-blue-600/80 hover:bg-blue-700 text-white"
                          title="Return to Bottom of Deck"
                        >
                          📚↓
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setSelectedCards([])}
                          className="h-7 px-3 text-xs bg-slate-500/80 hover:bg-slate-600 text-white"
                        >
                          ✕
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Hand Cards - Overlapping Fan Layout */}
                <div className="relative flex justify-center items-end pointer-events-none" style={{ height: '280px', paddingBottom: '10px' }}>
                  {currentUserPlayer?.hand?.map((cardInHand: any, idx: number) => {
                    const cardData = findCardData(cardInHand.cardId, currentUserCards);
                    const selectedCard = selectedCards.find(c => c.id === cardInHand.id);
                    const isSelected = !!selectedCard;
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
                        onClick={(e) => {
                          // Reset transform immediately when clicking
                          e.currentTarget.style.transform = `translateX(calc(-50% + ${xPosition}px)) translateY(${yOffset}px) rotate(${rotation}deg)`;
                          e.currentTarget.style.zIndex = String(100);
                          
                          // Toggle selection with order tracking
                          if (isSelected) {
                            setSelectedCards(prev => prev.filter(c => c.id !== cardInHand.id));
                          } else {
                            const nextOrder = selectedCards.length + 1;
                            setSelectedCards(prev => [...prev, { id: cardInHand.id, index: idx, order: nextOrder }]);
                          }
                        }}
                        className={`absolute w-40 aspect-[2/3] rounded-lg overflow-hidden border-2 ${
                          isSelected ? 'border-yellow-500 ring-4 ring-yellow-300' : 'border-primary'
                        } shadow-lg cursor-pointer transition-all duration-300 ease-out pointer-events-auto`}
                        style={{
                          left: '50%',
                          bottom: '0',
                          transform: `translateX(calc(-50% + ${xPosition}px)) translateY(${yOffset}px) rotate(${rotation}deg)`,
                          zIndex: isSelected ? 100 : 10 + idx,
                          transformOrigin: 'bottom center',
                        }}
                        onMouseEnter={(e) => {
                          // Don't scale if ANY card is selected
                          if (selectedCards.length === 0) {
                            e.currentTarget.style.transform = `translateX(calc(-50% + ${xPosition}px)) translateY(-80px) rotate(0deg) scale(3)`;
                            e.currentTarget.style.zIndex = '99';
                          }
                        }}
                        onMouseLeave={(e) => {
                          // Reset to normal position if not selected
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
                        {isSelected && selectedCard && (
                          <div className="absolute inset-0 bg-yellow-500/20 flex items-center justify-center pointer-events-none">
                            <div className="bg-yellow-500 text-white px-3 py-2 rounded-full text-2xl font-extrabold shadow-lg border-2 border-white">
                              {selectedCard.order}
                            </div>
                          </div>
                        )}
                      </button>
                    );
                  })}
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

      {/* Scry Modal - New Enhanced Version */}
      <ScryModal
        isOpen={showScryModal}
        onClose={() => {
          setShowScryModal(false);
          setScryedCards([]);
        }}
        scryedCards={scryedCards}
        onResolve={handleResolveScry}
        isProcessing={actionInProgress}
        showForBothPlayers={false}
        activePlayerName={currentUserPlayer?.username || 'You'}
      />

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

      {/* Dice Roll Result Display - Enhanced 3D Animation */}
      {showDiceResult && diceResult && (
        <div className="fixed inset-0 flex items-center justify-center z-[100] pointer-events-none">
          <style jsx>{`
            @keyframes roll {
              0% { transform: rotateX(0deg) rotateY(0deg) rotateZ(0deg); }
              100% { transform: rotateX(720deg) rotateY(720deg) rotateZ(720deg); }
            }
            
            .dice-container {
              perspective: 1000px;
              width: 200px;
              height: 200px;
            }
            
            .dice {
              width: 200px;
              height: 200px;
              position: relative;
              transform-style: preserve-3d;
              animation: ${isRolling ? 'roll 1.5s ease-out' : 'none'};
            }
            
            .dice-face {
              position: absolute;
              width: 200px;
              height: 200px;
              background: linear-gradient(145deg, #ffffff, #f0f0f0);
              border: 4px solid #333;
              border-radius: 20px;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 80px;
              box-shadow: inset 0 5px 10px rgba(0,0,0,0.1);
            }
            
            .dice-face::before {
              content: '';
              position: absolute;
              width: 100%;
              height: 100%;
              border-radius: 16px;
              background: radial-gradient(circle at 30% 30%, rgba(255,255,255,0.8), transparent);
            }
            
            .dice-dot {
              width: 30px;
              height: 30px;
              background: #333;
              border-radius: 50%;
              position: absolute;
              box-shadow: inset 0 2px 4px rgba(0,0,0,0.3);
            }
            
            /* Position dots for each face */
            .face-1 .dice-dot { top: 50%; left: 50%; transform: translate(-50%, -50%); }
            
            .face-2 .dice-dot:nth-child(1) { top: 25%; left: 25%; }
            .face-2 .dice-dot:nth-child(2) { bottom: 25%; right: 25%; }
            
            .face-3 .dice-dot:nth-child(1) { top: 25%; left: 25%; }
            .face-3 .dice-dot:nth-child(2) { top: 50%; left: 50%; transform: translate(-50%, -50%); }
            .face-3 .dice-dot:nth-child(3) { bottom: 25%; right: 25%; }
            
            .face-4 .dice-dot:nth-child(1) { top: 25%; left: 25%; }
            .face-4 .dice-dot:nth-child(2) { top: 25%; right: 25%; }
            .face-4 .dice-dot:nth-child(3) { bottom: 25%; left: 25%; }
            .face-4 .dice-dot:nth-child(4) { bottom: 25%; right: 25%; }
            
            .face-5 .dice-dot:nth-child(1) { top: 25%; left: 25%; }
            .face-5 .dice-dot:nth-child(2) { top: 25%; right: 25%; }
            .face-5 .dice-dot:nth-child(3) { top: 50%; left: 50%; transform: translate(-50%, -50%); }
            .face-5 .dice-dot:nth-child(4) { bottom: 25%; left: 25%; }
            .face-5 .dice-dot:nth-child(5) { bottom: 25%; right: 25%; }
            
            .face-6 .dice-dot:nth-child(1) { top: 25%; left: 25%; }
            .face-6 .dice-dot:nth-child(2) { top: 25%; right: 25%; }
            .face-6 .dice-dot:nth-child(3) { top: 50%; left: 25%; }
            .face-6 .dice-dot:nth-child(4) { top: 50%; right: 25%; }
            .face-6 .dice-dot:nth-child(5) { bottom: 25%; left: 25%; }
            .face-6 .dice-dot:nth-child(6) { bottom: 25%; right: 25%; }
            
            /* 3D positioning of faces */
            .face-front  { transform: rotateY(0deg) translateZ(100px); }
            .face-back   { transform: rotateY(180deg) translateZ(100px); }
            .face-right  { transform: rotateY(90deg) translateZ(100px); }
            .face-left   { transform: rotateY(-90deg) translateZ(100px); }
            .face-top    { transform: rotateX(90deg) translateZ(100px); }
            .face-bottom { transform: rotateX(-90deg) translateZ(100px); }
            
            /* Show result face */
            .show-1 { transform: rotateX(0deg) rotateY(0deg) rotateZ(0deg) !important; }
            .show-2 { transform: rotateX(0deg) rotateY(180deg) rotateZ(0deg) !important; }
            .show-3 { transform: rotateX(0deg) rotateY(-90deg) rotateZ(0deg) !important; }
            .show-4 { transform: rotateX(0deg) rotateY(90deg) rotateZ(0deg) !important; }
            .show-5 { transform: rotateX(-90deg) rotateY(0deg) rotateZ(0deg) !important; }
            .show-6 { transform: rotateX(90deg) rotateY(0deg) rotateZ(0deg) !important; }
          `}</style>
          
          <div className="dice-container">
            <div className={`dice ${!isRolling ? `show-${diceResult}` : ''}`}>
              {/* Face 1 */}
              <div className="dice-face face-front face-1">
                <div className="dice-dot"></div>
              </div>
              
              {/* Face 2 */}
              <div className="dice-face face-back face-2">
                <div className="dice-dot"></div>
                <div className="dice-dot"></div>
              </div>
              
              {/* Face 3 */}
              <div className="dice-face face-right face-3">
                <div className="dice-dot"></div>
                <div className="dice-dot"></div>
                <div className="dice-dot"></div>
              </div>
              
              {/* Face 4 */}
              <div className="dice-face face-left face-4">
                <div className="dice-dot"></div>
                <div className="dice-dot"></div>
                <div className="dice-dot"></div>
                <div className="dice-dot"></div>
              </div>
              
              {/* Face 5 */}
              <div className="dice-face face-top face-5">
                <div className="dice-dot"></div>
                <div className="dice-dot"></div>
                <div className="dice-dot"></div>
                <div className="dice-dot"></div>
                <div className="dice-dot"></div>
              </div>
              
              {/* Face 6 */}
              <div className="dice-face face-bottom face-6">
                <div className="dice-dot"></div>
                <div className="dice-dot"></div>
                <div className="dice-dot"></div>
                <div className="dice-dot"></div>
                <div className="dice-dot"></div>
                <div className="dice-dot"></div>
              </div>
            </div>
          </div>
          
          {!isRolling && diceResult && (
            <div className="absolute bottom-32 text-center animate-bounce">
              <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-3 rounded-full text-2xl font-bold shadow-2xl border-4 border-yellow-400">
                {diceRollUsername} rolled a {diceResult}! 🎲
              </div>
            </div>
          )}
        </div>
      )}

      {/* Turn Notification Display - Large Center Screen */}
      {showTurnNotification && turnNotificationMessage && (
        <div 
          className={`fixed inset-0 flex items-center justify-center z-[100] pointer-events-none transition-opacity duration-500 ${
            showTurnNotification ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <div className="text-center">
            <div className={`inline-block px-12 py-8 rounded-2xl text-white font-bold shadow-xl border-4 ${
              turnNotificationMessage.title.includes('Your Turn')
                ? 'bg-gradient-to-br from-slate-700 via-slate-800 to-slate-900 border-slate-500/50'
                : 'bg-gradient-to-br from-slate-800 via-slate-900 to-black border-slate-600/50'
            }`}>
              <div className="text-5xl mb-3 drop-shadow-lg">
                {turnNotificationMessage.title}
              </div>
              <div className="text-3xl drop-shadow-md text-slate-300">
                {turnNotificationMessage.message}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View Opponent Hell Modal */}
      {showOpponentHellModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-4xl max-h-[80vh] flex flex-col">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Layers className="h-5 w-5" />
                  Opponent's Hell
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setShowOpponentHellModal(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="overflow-y-auto flex-1">
              <p className="text-sm text-muted-foreground mb-4">
                Viewing opponent's hell zone ({opponentPlayer?.hell?.length || 0} cards)
              </p>
              <div className="grid grid-cols-4 gap-3">
                {opponentPlayer?.hell?.map((hellCard: any) => {
                  const cardData = findCardData(hellCard.cardId, opponentCards);
                  return (
                    <div
                      key={hellCard.id}
                      className="relative aspect-[2/3] rounded-lg overflow-hidden border-2 border-red-500 shadow-lg hover:scale-105 transition-all"
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
                    </div>
                  );
                })}
              </div>
              {(!opponentPlayer?.hell || opponentPlayer.hell.length === 0) && (
                <div className="text-center py-8 text-muted-foreground">
                  <Layers className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>Opponent's hell is empty</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Card Discard Animation Overlay */}
      {showDiscardAnimation && discardAnimation && (
        <div className={`fixed inset-0 flex items-center justify-center z-[100] pointer-events-none transition-opacity duration-300 ${
          showDiscardAnimation ? 'opacity-100' : 'opacity-0'
        }`}>
          <style jsx>{`
            @keyframes cardFall {
              0% {
                transform: translateY(-50vh) scale(0.8) rotate(-10deg);
                opacity: 0;
              }
              20% {
                opacity: 1;
                transform: translateY(0) scale(1) rotate(0deg);
              }
              80% {
                opacity: 1;
                transform: translateY(0) scale(1) rotate(0deg);
              }
              100% {
                transform: translateY(50vh) scale(0.8) rotate(10deg);
                opacity: 0;
              }
            }
            
            @keyframes fireGlow {
              0%, 100% {
                box-shadow: 0 0 15px rgba(255, 69, 0, 0.6);
              }
              50% {
                box-shadow: 0 0 25px rgba(255, 69, 0, 0.8);
              }
            }
            
            .discard-card {
              animation: cardFall 2.8s ease-in-out forwards, fireGlow 0.5s ease-in-out infinite;
            }
          `}</style>
          
          <div className="discard-card w-64 aspect-[2/3] rounded-lg overflow-hidden border-2 border-red-500 shadow-xl">
            <div className="w-full h-full relative bg-gradient-to-br from-red-900 via-orange-900 to-red-900">
              {discardAnimation.cardImageUrl ? (
                <Image
                  src={discardAnimation.cardImageUrl}
                  alt={discardAnimation.cardName}
                  fill
                  className="object-cover"
                  priority
                  quality={100}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white text-xl font-bold">
                  {discardAnimation.cardName}
                </div>
              )}
              {/* Subtle overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-red-600/40 via-transparent to-transparent pointer-events-none" />
            </div>
          </div>
          
          {/* Minimal text notification */}
          <div className="absolute bottom-24 text-center">
            <div className="bg-slate-900/90 text-white px-4 py-2 rounded-lg text-sm font-semibold shadow-lg border border-red-500/50">
              {discardAnimation.username} → Hell
            </div>
          </div>
        </div>
      )}

      {/* Magic Card Usage Animation Overlay - Normal Magic */}
      {showMagicAnimation && magicAnimation && !magicAnimation.isReact && (
        <div className={`fixed inset-0 flex items-center justify-center z-[100] pointer-events-none transition-opacity duration-300 ${
          showMagicAnimation ? 'opacity-100' : 'opacity-0'
        }`}>
          <style jsx>{`
            @keyframes magicReveal {
              0% {
                transform: scale(0.3) rotateY(-180deg);
                opacity: 0;
              }
              15% {
                transform: scale(1.1) rotateY(0deg);
                opacity: 1;
              }
              30% {
                transform: scale(1) rotateY(0deg);
              }
              70% {
                transform: scale(1) rotateY(0deg);
              }
              85% {
                transform: scale(1.1) rotateY(0deg);
              }
              100% {
                transform: scale(0.3) rotateY(180deg);
                opacity: 0;
              }
            }
            
            @keyframes magicGlow {
              0%, 100% {
                box-shadow: 0 0 20px rgba(147, 51, 234, 0.6),
                           0 0 40px rgba(147, 51, 234, 0.4),
                           0 0 60px rgba(147, 51, 234, 0.2);
              }
              50% {
                box-shadow: 0 0 30px rgba(147, 51, 234, 0.8),
                           0 0 60px rgba(147, 51, 234, 0.6),
                           0 0 90px rgba(147, 51, 234, 0.4);
              }
            }
            
            @keyframes magicParticles {
              0% {
                transform: translateY(0) scale(1);
                opacity: 1;
              }
              100% {
                transform: translateY(-100px) scale(0);
                opacity: 0;
              }
            }
            
            @keyframes magicRing {
              0% {
                transform: scale(0.8);
                opacity: 0;
              }
              50% {
                opacity: 0.6;
              }
              100% {
                transform: scale(2);
                opacity: 0;
              }
            }
            
            .magic-card {
              animation: magicReveal 2.8s ease-in-out forwards, magicGlow 0.6s ease-in-out infinite;
            }
            
            .magic-particle {
              position: absolute;
              width: 8px;
              height: 8px;
              background: radial-gradient(circle, rgba(147, 51, 234, 1), rgba(147, 51, 234, 0));
              border-radius: 50%;
              animation: magicParticles 1.5s ease-out infinite;
            }
            
            .magic-ring {
              position: absolute;
              width: 280px;
              height: 280px;
              border: 3px solid rgba(147, 51, 234, 0.6);
              border-radius: 50%;
              animation: magicRing 2s ease-out infinite;
            }
          `}</style>
          
          {/* Magic rings */}
          <div className="magic-ring" style={{ animationDelay: '0s' }}></div>
          <div className="magic-ring" style={{ animationDelay: '0.4s' }}></div>
          <div className="magic-ring" style={{ animationDelay: '0.8s' }}></div>
          
          {/* Magic particles */}
          {[...Array(12)].map((_, i) => (
            <div
              key={i}
              className="magic-particle"
              style={{
                left: `calc(50% + ${Math.cos((i * Math.PI * 2) / 12) * 150}px)`,
                top: `calc(50% + ${Math.sin((i * Math.PI * 2) / 12) * 150}px)`,
                animationDelay: `${i * 0.1}s`,
              }}
            />
          ))}
          
          {/* Magic card */}
          <div className="magic-card w-64 aspect-[2/3] rounded-lg overflow-hidden border-2 border-purple-500 shadow-2xl">
            <div className="w-full h-full relative bg-gradient-to-br from-purple-900 via-fuchsia-900 to-purple-900">
              {magicAnimation.cardImageUrl ? (
                <Image
                  src={magicAnimation.cardImageUrl}
                  alt={magicAnimation.cardName}
                  fill
                  className="object-cover"
                  priority
                  quality={100}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white text-xl font-bold">
                  {magicAnimation.cardName}
                </div>
              )}
              {/* Mystical overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-purple-600/40 via-transparent to-fuchsia-600/40 pointer-events-none" />
              
              {/* Sparkle effects */}
              <div className="absolute inset-0 pointer-events-none">
                {[...Array(8)].map((_, i) => (
                  <div
                    key={i}
                    className="absolute w-2 h-2 bg-white rounded-full"
                    style={{
                      left: `${Math.random() * 100}%`,
                      top: `${Math.random() * 100}%`,
                      animation: `magicParticles ${1 + Math.random()}s ease-out infinite`,
                      animationDelay: `${Math.random() * 2}s`,
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
          
          {/* Magic usage notification */}
          <div className="absolute bottom-24 text-center">
            <div className="bg-gradient-to-r from-purple-900/90 via-fuchsia-900/90 to-purple-900/90 text-white px-6 py-3 rounded-lg text-sm font-semibold shadow-2xl border-2 border-purple-500/70">
              <div className="flex items-center gap-2">
                <span className="text-xl">✨</span>
                <span>{magicAnimation.username} used Magic!</span>
                <span className="text-xl">✨</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* React Magic Animation Overlay - Enhanced Counter/Deflection Effect */}
      {showMagicAnimation && magicAnimation && magicAnimation.isReact && (
        <div className={`fixed inset-0 flex items-center justify-center z-[100] pointer-events-none transition-opacity duration-300 ${
          showMagicAnimation ? 'opacity-100' : 'opacity-0'
        }`}>
          <style jsx>{`
            @keyframes counterStrike {
              0% {
                transform: translateX(-120vw) translateY(20vh) scale(0.6) rotateY(-180deg) rotateZ(20deg);
                opacity: 0;
              }
              15% {
                transform: translateX(-40vw) translateY(10vh) scale(0.8) rotateY(-90deg) rotateZ(10deg);
                opacity: 0.8;
              }
              35% {
                transform: translateX(0) translateY(0) scale(1.3) rotateY(0deg) rotateZ(0deg);
                opacity: 1;
              }
              50% {
                transform: translateX(0) translateY(0) scale(1.2) rotateY(0deg) rotateZ(-5deg);
              }
              65% {
                transform: translateX(0) translateY(0) scale(1.3) rotateY(0deg) rotateZ(5deg);
              }
              85% {
                transform: translateX(40vw) translateY(-10vh) scale(0.8) rotateY(90deg) rotateZ(-10deg);
                opacity: 0.8;
              }
              100% {
                transform: translateX(120vw) translateY(-20vh) scale(0.6) rotateY(180deg) rotateZ(-20deg);
                opacity: 0;
              }
            }
            
            @keyframes deflectShield {
              0% {
                transform: scale(0.5) rotate(0deg);
                opacity: 0;
              }
              20% {
                transform: scale(1.3) rotate(45deg);
                opacity: 0.9;
              }
              40% {
                transform: scale(1.1) rotate(90deg);
                opacity: 0.8;
              }
              60% {
                transform: scale(1.3) rotate(135deg);
                opacity: 0.9;
              }
              80% {
                transform: scale(1) rotate(180deg);
                opacity: 0.6;
              }
              100% {
                transform: scale(0.5) rotate(225deg);
                opacity: 0;
              }
            }
            
            @keyframes counterArrow {
              0% {
                transform: translateX(-300px) scale(0);
                opacity: 0;
              }
              20% {
                transform: translateX(-150px) scale(1);
                opacity: 1;
              }
              50% {
                transform: translateX(0) scale(1.5);
                opacity: 1;
              }
              80% {
                transform: translateX(150px) scale(1);
                opacity: 1;
              }
              100% {
                transform: translateX(300px) scale(0);
                opacity: 0;
              }
            }
            
            @keyframes impactWave {
              0% {
                transform: scale(0) rotate(0deg);
                opacity: 0;
              }
              10% {
                opacity: 0.8;
              }
              50% {
                transform: scale(3) rotate(180deg);
                opacity: 0.4;
              }
              100% {
                transform: scale(5) rotate(360deg);
                opacity: 0;
              }
            }
            
            @keyframes energySurge {
              0% {
                transform: translateX(-100%) scaleX(0);
                opacity: 0;
              }
              30% {
                opacity: 1;
              }
              50% {
                transform: translateX(0) scaleX(1);
              }
              70% {
                opacity: 1;
              }
              100% {
                transform: translateX(100%) scaleX(0);
                opacity: 0;
              }
            }
            
            @keyframes counterGlow {
              0%, 100% {
                box-shadow: 
                  0 0 40px rgba(249, 115, 22, 0.8),
                  0 0 80px rgba(59, 130, 246, 0.6),
                  0 0 120px rgba(34, 211, 238, 0.4),
                  inset 0 0 40px rgba(59, 130, 246, 0.4);
              }
              50% {
                box-shadow: 
                  0 0 60px rgba(249, 115, 22, 1),
                  0 0 120px rgba(59, 130, 246, 0.9),
                  0 0 180px rgba(34, 211, 238, 0.7),
                  inset 0 0 60px rgba(59, 130, 246, 0.6);
              }
            }
            
            @keyframes reflectionFlash {
              0%, 100% {
                opacity: 0;
              }
              50% {
                opacity: 1;
              }
            }
            
            .react-card {
              animation: counterStrike 3s cubic-bezier(0.68, -0.55, 0.265, 1.55) forwards, counterGlow 0.4s ease-in-out infinite;
            }
            
            .deflect-shield {
              position: absolute;
              width: 350px;
              height: 350px;
              border: 6px solid rgba(249, 115, 22, 0.9);
              border-radius: 50%;
              animation: deflectShield 3s ease-in-out forwards;
            }
            
            .counter-arrow {
              position: absolute;
              width: 150px;
              height: 8px;
              background: linear-gradient(90deg, 
                transparent,
                rgba(249, 115, 22, 1) 10%,
                rgba(251, 146, 60, 1) 50%,
                rgba(249, 115, 22, 1) 90%,
                transparent
              );
              box-shadow: 0 0 15px rgba(249, 115, 22, 1), 0 0 30px rgba(249, 115, 22, 0.5);
              animation: counterArrow 3s ease-in-out infinite;
            }
            
            .counter-arrow::before {
              content: '';
              position: absolute;
              right: -20px;
              top: 50%;
              transform: translateY(-50%);
              width: 0;
              height: 0;
              border-left: 25px solid rgba(249, 115, 22, 1);
              border-top: 15px solid transparent;
              border-bottom: 15px solid transparent;
              filter: drop-shadow(0 0 10px rgba(249, 115, 22, 0.8));
            }
            
            .impact-wave {
              position: absolute;
              width: 300px;
              height: 300px;
              border: 5px solid rgba(59, 130, 246, 0.7);
              border-radius: 50%;
              animation: impactWave 1.5s ease-out infinite;
            }
            
            .energy-surge {
              position: absolute;
              width: 100%;
              height: 12px;
              background: linear-gradient(90deg,
                transparent,
                rgba(34, 211, 238, 0.8),
                rgba(59, 130, 246, 1),
                rgba(34, 211, 238, 0.8),
                transparent
              );
              box-shadow: 0 0 20px rgba(59, 130, 246, 0.8);
              animation: energySurge 1.5s ease-in-out infinite;
            }
          `}</style>
          
          {/* Deflection shields - rotating and pulsing */}
          {[...Array(3)].map((_, i) => (
            <div
              key={`shield-${i}`}
              className="deflect-shield"
              style={{
                animationDelay: `${i * 0.2}s`,
                width: `${350 - i * 40}px`,
                height: `${350 - i * 40}px`,
              }}
            />
          ))}
          
          {/* Impact waves - expanding circles */}
          {[...Array(4)].map((_, i) => (
            <div
              key={`wave-${i}`}
              className="impact-wave"
              style={{
                animationDelay: `${i * 0.3}s`,
              }}
            />
          ))}
          
          {/* Counter arrows - showing deflection direction */}
          {[...Array(6)].map((_, i) => (
            <div
              key={`arrow-${i}`}
              className="counter-arrow"
              style={{
                top: `calc(50% + ${Math.sin((i * Math.PI * 2) / 6) * 140}px)`,
                left: `calc(50% + ${Math.cos((i * Math.PI * 2) / 6) * 140}px)`,
                transform: `rotate(${(i * 360) / 6}deg)`,
                animationDelay: `${i * 0.15}s`,
              }}
            />
          ))}
          
          {/* Energy surges - horizontal beams */}
          {[...Array(5)].map((_, i) => (
            <div
              key={`surge-${i}`}
              className="energy-surge"
              style={{
                top: `calc(50% + ${(i - 2) * 60}px)`,
                animationDelay: `${i * 0.3}s`,
              }}
            />
          ))}
          
          {/* React magic card - with intense counter styling */}
          <div className="react-card w-72 aspect-[2/3] rounded-xl overflow-hidden border-8 shadow-2xl relative"
            style={{
              borderImage: 'linear-gradient(45deg, rgba(249, 115, 22, 1), rgba(59, 130, 246, 1), rgba(34, 211, 238, 1), rgba(249, 115, 22, 1)) 1',
            }}>
            <div className="w-full h-full relative bg-gradient-to-br from-orange-600 via-blue-900 to-cyan-900">
              {magicAnimation.cardImageUrl ? (
                <Image
                  src={magicAnimation.cardImageUrl}
                  alt={magicAnimation.cardName}
                  fill
                  className="object-cover"
                  priority
                  quality={100}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white text-xl font-bold">
                  {magicAnimation.cardName}
                </div>
              )}
              
              {/* Dynamic counter overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500/40 via-blue-600/20 to-cyan-500/40 pointer-events-none" />
              
              {/* Reflection flashes */}
              <div className="absolute inset-0 pointer-events-none overflow-hidden">
                {[...Array(3)].map((_, i) => (
                  <div
                    key={`flash-${i}`}
                    className="absolute w-full h-full bg-gradient-to-r from-transparent via-white/60 to-transparent"
                    style={{
                      animation: `shine ${2 + i * 0.5}s ease-in-out infinite`,
                      animationDelay: `${i * 0.5}s`,
                      transform: 'translateX(-100%) skewX(-25deg)',
                    }}
                  />
                ))}
              </div>
              
              {/* Energy particles */}
              {[...Array(20)].map((_, i) => (
                <div
                  key={`particle-${i}`}
                  className="absolute rounded-full"
                  style={{
                    width: `${4 + Math.random() * 6}px`,
                    height: `${4 + Math.random() * 6}px`,
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                    background: i % 2 === 0 
                      ? 'radial-gradient(circle, rgba(249, 115, 22, 1), transparent)'
                      : 'radial-gradient(circle, rgba(59, 130, 246, 1), transparent)',
                    animation: 'reflectionFlash 0.5s ease-in-out infinite',
                    animationDelay: `${Math.random() * 2}s`,
                    boxShadow: i % 2 === 0
                      ? '0 0 15px rgba(249, 115, 22, 0.8)'
                      : '0 0 15px rgba(59, 130, 246, 0.8)',
                  }}
                />
              ))}
              
              {/* X-shaped counter indicator */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="relative w-48 h-48">
                  <div className="absolute inset-0 border-4 border-orange-500 rounded-full animate-pulse" 
                    style={{ animation: 'deflectShield 1.5s ease-in-out infinite' }} />
                  <div className="absolute top-1/2 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-orange-400 to-transparent transform -translate-y-1/2 rotate-45"
                    style={{ boxShadow: '0 0 20px rgba(249, 115, 22, 0.8)' }} />
                  <div className="absolute top-1/2 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-orange-400 to-transparent transform -translate-y-1/2 -rotate-45"
                    style={{ boxShadow: '0 0 20px rgba(249, 115, 22, 0.8)' }} />
                </div>
              </div>
            </div>
            
            {/* Enhanced counter badge */}
            <div className="absolute top-3 right-3 bg-gradient-to-r from-orange-600 to-blue-600 text-white px-4 py-2 rounded-lg text-sm font-black border-2 border-white shadow-2xl animate-pulse">
              🛡️ COUNTER 🛡️
            </div>
            
            {/* Deflection indicator arrows on card */}
            <div className="absolute left-2 top-1/2 transform -translate-y-1/2">
              <div className="text-orange-400 text-2xl font-black animate-bounce" style={{ textShadow: '0 0 10px rgba(249, 115, 22, 1)' }}>
                {'<<<'}
              </div>
            </div>
            <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
              <div className="text-orange-400 text-2xl font-black animate-bounce" style={{ textShadow: '0 0 10px rgba(249, 115, 22, 1)' }}>
                {'>>>'}
              </div>
            </div>
          </div>
          
          {/* Enhanced counter notification */}
          <div className="absolute bottom-24 text-center">
            <div className="bg-gradient-to-r from-orange-600/95 via-blue-900/95 to-cyan-600/95 text-white px-8 py-4 rounded-xl text-lg font-black shadow-2xl border-4 border-orange-400 animate-pulse">
              <div className="flex items-center gap-3">
                <span className="text-3xl">🛡️</span>
                <div className="flex flex-col">
                  <span className="text-2xl text-orange-300">⚡ COUNTER! ⚡</span>
                  <span className="text-sm font-semibold">{magicAnimation.username} deflected the attack!</span>
                </div>
                <span className="text-3xl">↩️</span>
              </div>
            </div>
          </div>
          
          <style jsx>{`
            @keyframes shine {
              0% {
                transform: translateX(-100%) skewX(-25deg);
              }
              100% {
                transform: translateX(200%) skewX(-25deg);
              }
            }
          `}</style>
        </div>
      )}
      </div>
    </div>
  );
}
