'use client';

import { useEffect, useState, memo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useGameRoom } from '@/hooks/useGameRoom';
import { getGameRoom, selectDeck, takeSeat, setPlayerReady, leaveGameRoom, getCardById } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Users, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { GameRoom, GamePlayer } from '@/types/game';
import { Card as CardType } from '@/types/card';
import Image from 'next/image';
import { GameBoard } from './game-board';
import { DeckPreviewDialog } from '@/components/deck-preview-dialog';
import { Eye } from 'lucide-react';

// Separate GameOverModal component with memo to prevent re-renders
const GameOverModal = memo(({ 
  isWinner, 
  gameOverData, 
  redirectCountdown, 
  onReturnToLobby 
}: {
  isWinner: boolean;
  gameOverData: { winner: string; loser: string };
  redirectCountdown: number;
  onReturnToLobby: () => void;
}) => {
  return (
    <div 
      className="fixed inset-0 bg-black/80 flex items-center justify-center z-[200]"
      style={{
        animation: 'fadeIn 0.3s ease-out'
      }}
    >
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes zoomIn {
          from { 
            opacity: 0;
            transform: scale(0.95);
          }
          to { 
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>
      <div 
        className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl p-8 max-w-md w-full mx-4 border-4 shadow-2xl"
        style={{
          borderColor: isWinner ? '#10b981' : '#ef4444',
          animation: 'zoomIn 0.3s ease-out'
        }}
      >
        {/* Result Icon - Static animation, won't re-trigger */}
        <div className="text-center mb-6">
          {isWinner ? (
            <div className="inline-block" style={{ animation: 'bounce 1s ease-in-out infinite' }}>
              <div className="text-9xl mb-4">🏆</div>
              <h2 className="text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-yellow-200 to-yellow-400 drop-shadow-[0_0_30px_rgba(250,204,21,0.5)] mb-2" style={{
                textShadow: '0 0 20px rgba(250,204,21,0.8), 0 0 40px rgba(250,204,21,0.4)'
              }}>
                WINNER
              </h2>
              <p className="text-2xl font-bold text-green-400" style={{ animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' }}>
                Congratulations!
              </p>
            </div>
          ) : (
            <div className="inline-block">
              <div className="text-8xl mb-2">😔</div>
              <h2 className="text-4xl font-bold text-red-400 drop-shadow-lg">
                DEFEAT
              </h2>
            </div>
          )}
        </div>

        {/* Game Result Info */}
        <div className="bg-slate-950/50 rounded-xl p-6 mb-6 border border-slate-700">
          <div className="space-y-3 text-center">
            <div className="flex items-center justify-center gap-2">
              <span className="text-lg text-slate-400">Winner:</span>
              <span className="text-2xl font-bold text-green-400">{gameOverData.winner}</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <span className="text-lg text-slate-400">Loser:</span>
              <span className="text-2xl font-bold text-red-400">{gameOverData.loser}</span>
            </div>
          </div>
        </div>

        {/* Countdown - Smooth number transition */}
        <div className="text-center mb-4">
          <p className="text-slate-400 text-sm mb-2">
            Returning to room in
          </p>
          <div 
            className="text-5xl font-bold text-white tabular-nums"
            style={{
              willChange: 'contents',
              minHeight: '3.75rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            {redirectCountdown}
          </div>
        </div>

        {/* Manual Continue Button */}
        <Button
          onClick={onReturnToLobby}
          className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold py-3 text-lg"
        >
          Continue
        </Button>
      </div>
    </div>
  );
});

GameOverModal.displayName = 'GameOverModal';

export default function GameRoomPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useUser();
  const { toast } = useToast();
  const roomId = params.roomId as string;

  const { gameRoom, isConnected, error: wsError, setGameRoom } = useGameRoom(roomId);
  const [loading, setLoading] = useState(true);
  const [refetchTrigger, setRefetchTrigger] = useState(0);
  const [playerCards, setPlayerCards] = useState<{ [playerId: string]: CardType[] }>({});
  const [loadingCards, setLoadingCards] = useState(false);
  const [previewDeckId, setPreviewDeckId] = useState<string | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [showGameOver, setShowGameOver] = useState(false);
  const [gameOverData, setGameOverData] = useState<{ winner: string; loser: string } | null>(null);
  const [redirectCountdown, setRedirectCountdown] = useState(10);

  // Fetch room data
  useEffect(() => {
    const fetchRoom = async () => {
      try {
        // Save scroll position before fetching
        const savedScrollY = window.scrollY;
        const savedScrollX = window.scrollX;
        
        // Only show loading on initial load
        if (refetchTrigger === 0) {
          setLoading(true);
        }
        
        const room = await getGameRoom(roomId);
        setGameRoom(room);
        console.log('Room data fetched:', room);
        
        // Restore scroll position after React finishes rendering
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            // Double RAF to ensure all layout calculations are complete
            if (window.scrollY !== savedScrollY || window.scrollX !== savedScrollX) {
              window.scrollTo({
                top: savedScrollY,
                left: savedScrollX,
                behavior: 'auto' as ScrollBehavior
              });
            }
          });
        });
      } catch (error) {
        console.error('Error fetching room:', error);
        toast({
          title: 'Error',
          description: 'Failed to load game room',
          variant: 'destructive',
        });
      } finally {
        if (refetchTrigger === 0) {
          setLoading(false);
        }
      }
    };

    fetchRoom();
  }, [roomId, toast, setGameRoom, refetchTrigger]);

  // Fetch card data when game starts
  useEffect(() => {
    const fetchCards = async () => {
      if (!gameRoom || (gameRoom.status !== 'in_progress' && gameRoom.status !== 'mulligan') || !gameRoom.players) {
        return;
      }

      // Save scroll position before fetching
      const savedScrollY = window.scrollY;
      const savedScrollX = window.scrollX;
      
      setLoadingCards(true);
      const cardCache: { [playerId: string]: CardType[] } = {};

      try {
        for (const player of gameRoom.players) {
          const allCardIds: string[] = [];
          
          // Collect card IDs from hand
          if (player.hand && player.hand.length > 0) {
            allCardIds.push(...player.hand.map(c => c.cardId));
          }
          
          // Collect card IDs from field
          if (player.field && player.field.length > 0) {
            allCardIds.push(...player.field.map(c => c.cardId));
          }
          
          // Collect card IDs from deck
          if (player.deck && player.deck.length > 0) {
            allCardIds.push(...player.deck);
          }
          
          // Collect card IDs from hell
          if (player.hell && player.hell.length > 0) {
            allCardIds.push(...player.hell.map(c => c.cardId));
          }
          
          // Collect card IDs from magic zone
          if (player.magicZone && player.magicZone.length > 0) {
            allCardIds.push(...player.magicZone.map((c: any) => c.cardId));
          }
          
          // Collect card IDs from avatar zone
          if (player.avatarZone && player.avatarZone.length > 0) {
            allCardIds.push(...player.avatarZone.map((c: any) => c.cardId));
          }
          
          // Collect card IDs from land zone
          if (player.landZone && player.landZone.length > 0) {
            allCardIds.push(...player.landZone.map((c: any) => c.cardId));
          }
          
          // Collect card IDs from construct zone
          if (player.constructZone && player.constructZone.length > 0) {
            allCardIds.push(...player.constructZone.map((c: any) => c.cardId));
          }
          
          // Collect card IDs from life cards
          if (player.lifeCards && player.lifeCards.length > 0) {
            allCardIds.push(...player.lifeCards.map((c: any) => c.cardId));
          }
          
          // Fetch all unique card data
          if (allCardIds.length > 0) {
            const uniqueCardIds = [...new Set(allCardIds)];
            const cards = await Promise.all(
              uniqueCardIds.map(async (cardId) => {
                const card = await getCardById(cardId);
                return card;
              })
            );
            cardCache[player.userId] = cards.filter((c): c is CardType => c !== null);
          }
        }
        setPlayerCards(cardCache);
        
        // Restore scroll position after React finishes rendering
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            // Double RAF to ensure all layout calculations are complete
            if (window.scrollY !== savedScrollY || window.scrollX !== savedScrollX) {
              window.scrollTo({
                top: savedScrollY,
                left: savedScrollX,
                behavior: 'auto' as ScrollBehavior
              });
            }
          });
        });
      } catch (error) {
        console.error('Error fetching card data:', error);
      } finally {
        setLoadingCards(false);
      }
    };

    fetchCards();
  }, [gameRoom]);

  // Listen for game over events
  useEffect(() => {
    const handleGameOver = (event: any) => {
      const { winner, loser } = event.detail;
      setGameOverData({ winner, loser });
      setShowGameOver(true);
      setRedirectCountdown(10);
      
      // Start countdown - close modal and stay in room
      let countdown = 10;
      const countdownInterval = setInterval(() => {
        countdown--;
        if (countdown <= 0) {
          clearInterval(countdownInterval);
          // Close modal and refresh room data to show waiting room state
          setShowGameOver(false);
          setGameOverData(null);
          setRefetchTrigger(prev => prev + 1);
        } else {
          setRedirectCountdown(countdown);
        }
      }, 1000);
      
      return () => clearInterval(countdownInterval);
    };

    window.addEventListener('game-over', handleGameOver);
    return () => window.removeEventListener('game-over', handleGameOver);
  }, []);

  // Refetch room data when page becomes visible (returning from deck selection)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        console.log('Page became visible, refetching room data...');
        setRefetchTrigger(prev => prev + 1);
      }
    };

    const handleFocus = () => {
      console.log('Window focused, refetching room data...');
      setRefetchTrigger(prev => prev + 1);
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  const handleTakeSeat = async (seat: number) => {
    if (!user || !gameRoom) return;

    try {
      await takeSeat(roomId, {
        userId: user.id,
        username: user.username || user.firstName || 'Player',
        seat,
      });
      toast({
        title: 'Success',
        description: `You are now in seat ${seat}`,
      });
    } catch (error) {
      console.error('Error taking seat:', error);
      toast({
        title: 'Error',
        description: 'Failed to take seat',
        variant: 'destructive',
      });
    }
  };


  const handleToggleReady = async () => {
    if (!user || !gameRoom) return;

    const currentPlayer = gameRoom.players.find(p => p.userId === user.id);
    const newReadyState = !currentPlayer?.isReady;

    try {
      await setPlayerReady(roomId, {
        userId: user.id,
        isReady: newReadyState,
      });
      toast({
        title: 'Success',
        description: newReadyState ? 'You are ready!' : 'Ready status removed',
      });
    } catch (error) {
      console.error('Error setting ready status:', error);
      toast({
        title: 'Error',
        description: 'Failed to update ready status',
        variant: 'destructive',
      });
    }
  };

  const handleLeaveRoom = async () => {
    if (!user) return;

    try {
      await leaveGameRoom(roomId, { userId: user.id });
      toast({
        title: 'Success',
        description: 'Left the room',
      });
      router.push('/game/lobby');
    } catch (error) {
      console.error('Error leaving room:', error);
      toast({
        title: 'Error',
        description: 'Failed to leave room',
        variant: 'destructive',
      });
    }
  };

  const handlePreviewDeck = (deckId: string) => {
    setPreviewDeckId(deckId);
    setIsPreviewOpen(true);
  };

  const handleSelectDeckFromPreview = async (deckId: string) => {
    if (!user) return;

    try {
      await selectDeck(roomId, {
        userId: user.id,
        deckId,
      });
      setIsPreviewOpen(false);
      toast({
        title: 'Success',
        description: 'Deck selected!',
      });
    } catch (error) {
      console.error('Error selecting deck:', error);
      toast({
        title: 'Error',
        description: 'Failed to select deck',
        variant: 'destructive',
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      waiting: <Badge variant="outline" className="bg-yellow-100 text-yellow-800">Waiting</Badge>,
      ready: <Badge variant="outline" className="bg-green-100 text-green-800">Ready</Badge>,
      in_progress: <Badge variant="outline" className="bg-blue-100 text-blue-800">In Progress</Badge>,
      finished: <Badge variant="outline" className="bg-gray-100 text-gray-800">Finished</Badge>,
    };
    return badges[status as keyof typeof badges] || null;
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  if (!gameRoom) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Card>
          <CardContent className="py-12 text-center">
            <XCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">Room Not Found</h3>
            <p className="text-muted-foreground mb-4">
              This game room doesn't exist or has been closed.
            </p>
            <Button onClick={() => router.push('/game/lobby')}>
              Back to Lobby
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentPlayer = gameRoom?.players?.find((p: GamePlayer) => p.userId === user?.id);
  const isHost = gameRoom?.hostUserId === user?.id;
  const canStart = (gameRoom?.players?.length || 0) === 2 && 
                   gameRoom?.players?.every((p: GamePlayer) => p.isReady && p.deckId);

  // If game is in progress or mulligan phase, show game board
  if (gameRoom?.status === 'in_progress' || gameRoom?.status === 'mulligan') {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="icon"
                onClick={() => router.push('/game/lobby')}
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div>
                <h1 className="text-3xl font-bold">{gameRoom.roomName}</h1>
                <p className="text-muted-foreground">
                  Game In Progress
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="bg-blue-100 text-blue-800">
                In Progress
              </Badge>
            </div>
          </div>

          {/* Game Board Component */}
          <GameBoard
            roomId={roomId}
            gameRoom={gameRoom}
            user={user}
            playerCards={playerCards}
            loadingCards={loadingCards}
            onRefresh={() => setRefetchTrigger(prev => prev + 1)}
          />
        </div>
      </div>
    );
  }

  // Waiting room view
  return (
    <div className="container mx-auto py-8 px-4">
      {/* Game Over Modal */}
      {showGameOver && gameOverData && (
        <GameOverModal
          isWinner={gameOverData.winner === (user?.username || user?.firstName || 'Player')}
          gameOverData={gameOverData}
          redirectCountdown={redirectCountdown}
          onReturnToLobby={() => {
            // Close modal immediately and stay in room
            setShowGameOver(false);
            setGameOverData(null);
            setRefetchTrigger(prev => prev + 1);
          }}
        />
      )}
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="icon"
              onClick={() => router.push('/game/lobby')}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold">{gameRoom.roomName}</h1>
              <p className="text-muted-foreground">
                Room ID: {roomId.slice(0, 8)}...
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {getStatusBadge(gameRoom.status)}
            {isConnected ? (
              <Badge variant="outline" className="bg-green-100 text-green-800">
                Connected
              </Badge>
            ) : (
              <Badge variant="outline" className="bg-red-100 text-red-800">
                Disconnected
              </Badge>
            )}
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Player Seats */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Players
              </CardTitle>
              <CardDescription>
                {gameRoom?.players?.length || 0}/2 players
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {[1, 2].map((seat) => {
                  const player = gameRoom?.players?.find(p => p.seat === seat);
                const isCurrentPlayer = player?.userId === user?.id;
                
                return (
                  <div
                    key={seat}
                    className={`p-4 rounded-lg border-2 ${
                      isCurrentPlayer
                        ? 'border-primary bg-primary/5'
                        : player
                        ? 'border-border bg-muted/50'
                        : 'border-dashed border-muted-foreground/25 bg-background'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold">
                          Seat {seat}
                          {player?.userId === gameRoom?.hostUserId && (
                            <Badge variant="outline" className="ml-2">Host</Badge>
                          )}
                        </h3>
                        {player ? (
                          <div className="mt-1 space-y-1">
                            <p className="text-sm text-muted-foreground">
                              {player.username}
                            </p>
                            {player.deckId && (
                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className="text-xs">
                                  Deck Selected
                                </Badge>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => player.deckId && handlePreviewDeck(player.deckId)}
                                  className="h-6 px-2"
                                >
                                  <Eye className="h-3 w-3 mr-1" />
                                  View Deck
                                </Button>
                              </div>
                            )}
                            {player.isReady ? (
                              <div className="flex items-center gap-1 text-green-600">
                                <CheckCircle2 className="h-4 w-4" />
                                <span className="text-xs">Ready</span>
                              </div>
                            ) : (
                              <div className="flex items-center gap-1 text-muted-foreground">
                                <XCircle className="h-4 w-4" />
                                <span className="text-xs">Not Ready</span>
                              </div>
                            )}
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground">Waiting for player...</p>
                        )}
                      </div>
                      {!player && user && !currentPlayer && (
                        <Button
                          size="sm"
                          onClick={() => handleTakeSeat(seat)}
                          disabled={gameRoom.status !== 'waiting'}
                        >
                          Join
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* Spectators */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Spectators
              </CardTitle>
              <CardDescription>
                {gameRoom?.spectators?.length || 0}/{gameRoom?.maxSpectators || 0} spectators
              </CardDescription>
            </CardHeader>
            <CardContent>
              {(gameRoom?.spectators?.length || 0) > 0 ? (
                <div className="space-y-2">
                  {gameRoom?.spectators?.map((spectator) => (
                    <div
                      key={spectator.userId}
                      className="p-3 rounded-lg bg-muted/50"
                    >
                      <p className="font-medium">{spectator.username}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-8">
                  No spectators yet
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Deck Preview Dialog */}
        <DeckPreviewDialog
          deckId={previewDeckId}
          isOpen={isPreviewOpen}
          onClose={() => setIsPreviewOpen(false)}
          onSelectDeck={currentPlayer ? handleSelectDeckFromPreview : undefined}
          showSelectButton={!!currentPlayer}
        />

        {/* Actions */}
        {currentPlayer && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Actions</CardTitle>
              <CardDescription>
                Prepare for the game
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => router.push(`/decks?roomId=${roomId}`)}
                  disabled={gameRoom?.status !== 'waiting'}
                >
                  {currentPlayer.deckId ? 'Change Deck' : 'Select Deck'}
                </Button>
                <Button
                  onClick={handleToggleReady}
                  disabled={!currentPlayer?.deckId || gameRoom?.status !== 'waiting'}
                  variant={currentPlayer.isReady ? 'outline' : 'default'}
                >
                  {currentPlayer.isReady ? 'Not Ready' : 'Ready'}
                </Button>
              </div>
              <Button
                variant="destructive"
                onClick={handleLeaveRoom}
                className="w-full"
              >
                Leave Room
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Connection Status */}
        {wsError && (
          <Card className="mt-6 border-destructive">
            <CardContent className="py-4">
              <p className="text-sm text-destructive">
                Connection error: {wsError}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
