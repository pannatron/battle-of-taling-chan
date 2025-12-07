'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X, Eye, ArrowUp, ArrowDown, Hand } from 'lucide-react';
import { Card as CardType } from '@/types/card';
import Image from 'next/image';

interface ScryModalProps {
  isOpen: boolean;
  onClose: () => void;
  scryedCards: CardType[];
  onResolve: (cardsToHand: string[], cardsToTop: string[], cardsToBottom: string[]) => void;
  isProcessing: boolean;
  showForBothPlayers?: boolean;
  activePlayerName?: string;
  isOpponentView?: boolean;
  opponentAssignments?: Map<string, CardAssignment>;
}

interface CardAssignment {
  cardId: string;
  uniqueKey: string; // Unique key for this specific card instance
  destination: 'hand' | 'top' | 'bottom';
  order: number; // Order within that destination
}

export function ScryModal({
  isOpen,
  onClose,
  scryedCards,
  onResolve,
  isProcessing,
  showForBothPlayers = false,
  activePlayerName = 'Player',
  isOpponentView = false,
  opponentAssignments = new Map()
}: ScryModalProps) {
  // Track assignments with order for each destination
  const [assignments, setAssignments] = useState<Map<string, CardAssignment>>(new Map());

  if (!isOpen) return null;

  // Use opponent assignments if in opponent view mode
  const displayAssignments = isOpponentView ? opponentAssignments : assignments;

  // Generate unique key for each card based on its position in the array
  const getUniqueKey = (cardId: string, index: number) => `${cardId}-${index}`;

  const handleAssignCard = (uniqueKey: string, cardId: string, destination: 'hand' | 'top' | 'bottom') => {
    setAssignments(prev => {
      const newAssignments = new Map(prev);
      
      // Get current cards in the destination
      const cardsInDestination = Array.from(newAssignments.values())
        .filter(a => a.destination === destination);
      
      // Calculate next order number for this destination
      const nextOrder = cardsInDestination.length + 1;
      
      // Remove card from previous assignment if exists
      if (newAssignments.has(uniqueKey)) {
        const oldAssignment = newAssignments.get(uniqueKey)!;
        const oldDestination = oldAssignment.destination;
        
        // Re-number remaining cards in old destination
        if (oldDestination !== destination) {
          Array.from(newAssignments.entries()).forEach(([key, assignment]) => {
            if (assignment.destination === oldDestination && assignment.order > oldAssignment.order) {
              newAssignments.set(key, {
                ...assignment,
                order: assignment.order - 1
              });
            }
          });
        }
      }
      
      // Add new assignment
      newAssignments.set(uniqueKey, {
        cardId,
        uniqueKey,
        destination,
        order: nextOrder
      });
      
      return newAssignments;
    });
  };

  const handleRemoveCard = (uniqueKey: string) => {
    setAssignments(prev => {
      const newAssignments = new Map(prev);
      const assignment = newAssignments.get(uniqueKey);
      
      if (assignment) {
        // Re-number remaining cards in same destination
        Array.from(newAssignments.entries()).forEach(([key, a]) => {
          if (a.destination === assignment.destination && a.order > assignment.order) {
            newAssignments.set(key, {
              ...a,
              order: a.order - 1
            });
          }
        });
        
        newAssignments.delete(uniqueKey);
      }
      
      return newAssignments;
    });
  };

  const handleConfirm = () => {
    const cardsToHand: string[] = [];
    const cardsToTop: string[] = [];
    const cardsToBottom: string[] = [];
    
    // Sort by order within each destination
    const sortedAssignments = Array.from(assignments.values()).sort((a, b) => a.order - b.order);
    
    sortedAssignments.forEach(assignment => {
      if (assignment.destination === 'hand') {
        cardsToHand.push(assignment.cardId);
      } else if (assignment.destination === 'top') {
        cardsToTop.push(assignment.cardId);
      } else if (assignment.destination === 'bottom') {
        cardsToBottom.push(assignment.cardId);
      }
    });
    
    onResolve(cardsToHand, cardsToTop, cardsToBottom);
    setAssignments(new Map());
  };

  const handleCancel = () => {
    setAssignments(new Map());
    onClose();
  };

  const getCardAssignment = (uniqueKey: string): CardAssignment | null => {
    return displayAssignments.get(uniqueKey) || null;
  };

  const allCardsAssigned = scryedCards.length > 0 && displayAssignments.size === scryedCards.length;

  const getDestinationStats = () => {
    const stats = { hand: 0, top: 0, bottom: 0 };
    displayAssignments.forEach(assignment => {
      stats[assignment.destination]++;
    });
    return stats;
  };

  const stats = getDestinationStats();

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-6xl max-h-[90vh] flex flex-col">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              <span>👁️ Scrying - Top {scryedCards.length} Cards</span>
              {showForBothPlayers && (
                <Badge variant="secondary" className="ml-2">
                  {activePlayerName} is Scrying
                </Badge>
              )}
            </div>
            <Button
              size="sm"
              variant="ghost"
              onClick={handleCancel}
              disabled={isProcessing}
            >
              <X className="h-4 w-4" />
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="overflow-y-auto flex-1">
          {isOpponentView ? (
            // Opponent view - showing real-time selections
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground text-center font-semibold text-lg">
                👁️ {activePlayerName} is Scrying - Watch their selections in real-time
              </p>
              
              {/* Summary of opponent's selections */}
              <div className="flex gap-2 justify-center text-xs flex-wrap mb-4">
                <Badge className="bg-gradient-to-r from-blue-600 to-blue-500 border-0 shadow-md text-white text-sm py-1.5 px-3">
                  <ArrowUp className="h-4 w-4 mr-1" />
                  To Top: {stats.top}
                </Badge>
                <Badge className="bg-gradient-to-r from-green-600 to-green-500 border-0 shadow-md text-white text-sm py-1.5 px-3">
                  <Hand className="h-4 w-4 mr-1" />
                  To Hand: {stats.hand}
                </Badge>
                <Badge className="bg-gradient-to-r from-orange-600 to-orange-500 border-0 shadow-md text-white text-sm py-1.5 px-3">
                  <ArrowDown className="h-4 w-4 mr-1" />
                  To Bottom: {stats.bottom}
                </Badge>
                <Badge variant="outline" className="bg-slate-500/10 border-slate-400 text-sm py-1.5 px-3">
                  Unassigned: {scryedCards.length - displayAssignments.size}
                </Badge>
              </div>

              {/* Cards grid with opponent's selections */}
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                {scryedCards.map((card, idx) => {
                  const uniqueKey = getUniqueKey(card._id, idx);
                  const assignment = getCardAssignment(uniqueKey);
                  const isAssigned = assignment !== null;

                  return (
                    <div key={uniqueKey} className="space-y-1.5">
                      {/* Card Image */}
                      <div
                        className={`relative aspect-[2/3] rounded-lg overflow-hidden border-2 shadow-lg transition-all duration-300 ${
                          isAssigned 
                            ? assignment.destination === 'hand' 
                              ? 'border-green-400 ring-2 ring-green-300 shadow-green-500/50' 
                              : assignment.destination === 'top'
                              ? 'border-blue-400 ring-2 ring-blue-300 shadow-blue-500/50'
                              : 'border-orange-400 ring-2 ring-orange-300 shadow-orange-500/50'
                            : 'border-cyan-400/60'
                        }`}
                      >
                        {card.imageUrl ? (
                          <Image
                            src={card.imageUrl}
                            alt={card.name || 'Card'}
                            fill
                            className="object-cover"
                            priority
                            quality={100}
                          />
                        ) : (
                          <div className="w-full h-full bg-muted flex items-center justify-center">
                            <p className="text-[10px] text-center p-1">{card.name || 'Card'}</p>
                          </div>
                        )}
                        
                        {/* Original Position Indicator */}
                        <div className="absolute top-1 left-1 bg-gradient-to-br from-cyan-500 to-cyan-700 text-white px-2 py-0.5 rounded-md text-[10px] font-bold shadow-md">
                          #{idx + 1}
                        </div>
                        
                        {/* Show opponent's selection */}
                        {isAssigned && (
                          <div className="absolute inset-0 bg-gradient-to-b from-black/60 to-black/80 flex items-center justify-center backdrop-blur-[2px] animate-in fade-in duration-300">
                            <div className={`px-3 py-2 rounded-lg text-center shadow-2xl border border-white/20 ${
                              assignment.destination === 'hand' 
                                ? 'bg-gradient-to-br from-green-500 to-green-700' 
                                : assignment.destination === 'top'
                                ? 'bg-gradient-to-br from-blue-500 to-blue-700'
                                : 'bg-gradient-to-br from-orange-500 to-orange-700'
                            }`}>
                              <div className="text-2xl mb-1 drop-shadow-lg">
                                {assignment.destination === 'hand' ? '👋' : assignment.destination === 'top' ? '⬆️' : '⬇️'}
                              </div>
                              <div className="text-white font-bold text-xs tracking-wider drop-shadow-md">
                                {assignment.destination === 'top' && 'TOP'}
                                {assignment.destination === 'hand' && 'HAND'}
                                {assignment.destination === 'bottom' && 'BOTTOM'}
                              </div>
                              <div className="text-white text-xl font-extrabold drop-shadow-lg mt-1">
                                #{assignment.order}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
              
              <p className="text-center text-sm text-muted-foreground italic mt-4">
                Waiting for {activePlayerName} to confirm their selections...
              </p>
            </div>
          ) : (
            // Interactive mode for active player
            <div className="space-y-3">
              {/* Summary */}
              <div className="flex gap-2 justify-center text-xs flex-wrap">
                <Badge className="bg-gradient-to-r from-blue-600 to-blue-500 border-0 shadow-md text-white">
                  <ArrowUp className="h-3 w-3 mr-1" />
                  Top: {stats.top}
                </Badge>
                <Badge className="bg-gradient-to-r from-green-600 to-green-500 border-0 shadow-md text-white">
                  <Hand className="h-3 w-3 mr-1" />
                  Hand: {stats.hand}
                </Badge>
                <Badge className="bg-gradient-to-r from-orange-600 to-orange-500 border-0 shadow-md text-white">
                  <ArrowDown className="h-3 w-3 mr-1" />
                  Bottom: {stats.bottom}
                </Badge>
                <Badge variant="outline" className="bg-slate-500/10 border-slate-400 text-xs">
                  Remaining: {scryedCards.length - assignments.size}
                </Badge>
              </div>

              {/* Cards Grid */}
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
                {scryedCards.map((card, idx) => {
                  const uniqueKey = getUniqueKey(card._id, idx);
                  const assignment = getCardAssignment(uniqueKey);
                  const isAssigned = assignment !== null;

                  return (
                    <div key={uniqueKey} className="space-y-1.5 transform transition-all duration-200 hover:scale-105">
                      {/* Card Image */}
                      <div
                        className={`relative aspect-[2/3] rounded-lg overflow-hidden border-2 shadow-lg transition-all duration-300 ${
                          isAssigned 
                            ? assignment.destination === 'hand' 
                              ? 'border-green-400 ring-2 ring-green-300 shadow-green-500/50' 
                              : assignment.destination === 'top'
                              ? 'border-blue-400 ring-2 ring-blue-300 shadow-blue-500/50'
                              : 'border-orange-400 ring-2 ring-orange-300 shadow-orange-500/50'
                            : 'border-cyan-400/60 hover:border-cyan-300 hover:shadow-cyan-500/30'
                        }`}
                      >
                        {card.imageUrl ? (
                          <Image
                            src={card.imageUrl}
                            alt={card.name || 'Card'}
                            fill
                            className="object-cover"
                            priority
                            quality={100}
                          />
                        ) : (
                          <div className="w-full h-full bg-muted flex items-center justify-center">
                            <p className="text-[10px] text-center p-1">{card.name || 'Card'}</p>
                          </div>
                        )}
                        
                        {/* Original Position Indicator */}
                        <div className="absolute top-1 left-1 bg-gradient-to-br from-cyan-500 to-cyan-700 text-white px-2 py-0.5 rounded-md text-[10px] font-bold shadow-md">
                          #{idx + 1}
                        </div>
                        
                        {/* Destination Badge with Order */}
                        {isAssigned && (
                          <div className="absolute inset-0 bg-gradient-to-b from-black/60 to-black/80 flex items-center justify-center backdrop-blur-[2px] animate-in fade-in duration-300">
                            <div className={`px-3 py-2 rounded-lg text-center shadow-2xl border border-white/20 ${
                              assignment.destination === 'hand' 
                                ? 'bg-gradient-to-br from-green-500 to-green-700' 
                                : assignment.destination === 'top'
                                ? 'bg-gradient-to-br from-blue-500 to-blue-700'
                                : 'bg-gradient-to-br from-orange-500 to-orange-700'
                            }`}>
                              <div className="text-2xl mb-1 drop-shadow-lg">
                                {assignment.destination === 'hand' ? '👋' : assignment.destination === 'top' ? '⬆️' : '⬇️'}
                              </div>
                              <div className="text-white font-bold text-xs tracking-wider drop-shadow-md">
                                {assignment.destination === 'top' && 'TOP'}
                                {assignment.destination === 'hand' && 'HAND'}
                                {assignment.destination === 'bottom' && 'BOTTOM'}
                              </div>
                              <div className="text-white text-xl font-extrabold drop-shadow-lg mt-1">
                                #{assignment.order}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="grid grid-cols-3 gap-1">
                        <Button
                          size="sm"
                          onClick={() => handleAssignCard(uniqueKey, card._id, 'top')}
                          disabled={isProcessing}
                          className={`h-8 text-[10px] flex items-center justify-center p-1 transition-all duration-200 shadow-md ${
                            assignment?.destination === 'top'
                              ? 'bg-gradient-to-br from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 ring-2 ring-blue-300 shadow-blue-500/50 scale-105' 
                              : 'bg-gradient-to-br from-blue-600/60 to-blue-700/60 hover:from-blue-600 hover:to-blue-700'
                          }`}
                          title="Top of Deck"
                        >
                          <ArrowUp className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleAssignCard(uniqueKey, card._id, 'hand')}
                          disabled={isProcessing}
                          className={`h-8 text-[10px] flex items-center justify-center p-1 transition-all duration-200 shadow-md ${
                            assignment?.destination === 'hand'
                              ? 'bg-gradient-to-br from-green-500 to-green-700 hover:from-green-600 hover:to-green-800 ring-2 ring-green-300 shadow-green-500/50 scale-105' 
                              : 'bg-gradient-to-br from-green-600/60 to-green-700/60 hover:from-green-600 hover:to-green-700'
                          }`}
                          title="To Hand"
                        >
                          <Hand className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleAssignCard(uniqueKey, card._id, 'bottom')}
                          disabled={isProcessing}
                          className={`h-8 text-[10px] flex items-center justify-center p-1 transition-all duration-200 shadow-md ${
                            assignment?.destination === 'bottom'
                              ? 'bg-gradient-to-br from-orange-500 to-orange-700 hover:from-orange-600 hover:to-orange-800 ring-2 ring-orange-300 shadow-orange-500/50 scale-105' 
                              : 'bg-gradient-to-br from-orange-600/60 to-orange-700/60 hover:from-orange-600 hover:to-orange-700'
                          }`}
                          title="Bottom of Deck"
                        >
                          <ArrowDown className="h-3.5 w-3.5" />
                        </Button>
                      </div>

                      {/* Remove Button */}
                      {isAssigned && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleRemoveCard(uniqueKey)}
                          disabled={isProcessing}
                          className="w-full h-6 text-[10px] p-0 border-red-300 text-red-600 hover:bg-red-50 hover:text-red-700 hover:border-red-400 transition-all duration-200 shadow-sm animate-in fade-in duration-300"
                        >
                          <X className="h-3 w-3 mr-0.5" />
                          Clear
                        </Button>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Confirm Button - Only show for active player */}
              {!isOpponentView && (
                <>
                  <div className="flex gap-2 justify-end pt-3">
                    <Button
                      variant="outline"
                      onClick={handleCancel}
                      disabled={isProcessing}
                      size="sm"
                      className="hover:bg-slate-100 transition-colors duration-200"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleConfirm}
                      disabled={isProcessing || !allCardsAssigned}
                      className="bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-600 hover:from-cyan-600 hover:via-blue-600 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50"
                      size="sm"
                    >
                      {isProcessing ? 'Processing...' : 'Confirm Scry ✨'}
                    </Button>
                  </div>
                  {!allCardsAssigned && assignments.size > 0 && (
                    <p className="text-xs text-yellow-600 text-center font-medium animate-pulse bg-yellow-50 py-2 rounded-md">
                      ⚠️ Please assign all {scryedCards.length} cards (Remaining: {scryedCards.length - assignments.size})
                    </p>
                  )}
                </>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
