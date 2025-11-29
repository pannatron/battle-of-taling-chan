import { useState, useEffect } from 'react';
import { GameRoom, GameRoomEvent } from '@/types/game';

export function useGameRoom(roomId: string | null) {
  const [gameRoom, setGameRoom] = useState<GameRoom | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined' || !roomId) return;

    const ablyKey = process.env.NEXT_PUBLIC_ABLY_SUBSCRIBE_KEY;
    if (!ablyKey) {
      setError('Ably key not configured');
      return;
    }

    let isActive = true; // Flag to track if effect is still active
    let client: any = null;
    let channel: any = null;

    // Add global handler for unhandled promise rejections during cleanup
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      // Suppress Ably connection/channel closure errors
      if (
        event.reason?.message?.includes('Connection closed') ||
        event.reason?.message?.includes('superseded') ||
        event.reason?.code === 90001 // Ably channel detached error
      ) {
        event.preventDefault();
      }
    };
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    // Dynamically import Ably to avoid SSR issues
    const initializeAbly = async () => {
      try {
        const Ably = (await import('ably')).default;
        
        // Initialize Ably client
        client = new Ably.Realtime({
          key: ablyKey,
          closeOnUnload: true,
          disconnectedRetryTimeout: 15000,
          suspendedRetryTimeout: 30000,
        });

        // Get the channel for this specific room
        channel = client.channels.get(`game-room:${roomId}`);

        // Subscribe to channel events
        channel.subscribe((message: any) => {
          if (!isActive) return; // Ignore messages if effect is cleaning up
          
          const event = message.data as GameRoomEvent;
          
          console.log('Received game room event:', event);

          // Save scroll position BEFORE updating state
          const savedScrollY = window.scrollY;
          const savedScrollX = window.scrollX;

          switch (event.type) {
            case 'room-update':
              setGameRoom(event.data);
              break;
            case 'player-joined':
              setGameRoom(event.data);
              break;
            case 'player-left':
              setGameRoom(event.data);
              break;
            case 'seat-taken':
              setGameRoom(event.data);
              break;
            case 'deck-selected':
              setGameRoom(event.data);
              break;
            case 'player-ready':
              setGameRoom(event.data);
              break;
            case 'game-start':
              setGameRoom(event.data);
              break;
            case 'dice-roll':
              // Dice roll event - trigger a custom event that game-board can listen to
              const diceEvent = new CustomEvent('dice-roll-result', { 
                detail: event.data 
              });
              window.dispatchEvent(diceEvent);
              console.log('Dice roll event received:', event.data);
              break;
            case 'turn-change':
              // Turn change event - trigger a custom event for notifications
              const turnEvent = new CustomEvent('turn-change', { 
                detail: event.data 
              });
              window.dispatchEvent(turnEvent);
              console.log('Turn change event received:', event.data);
              break;
            case 'game-end':
              // Game end event - trigger a custom event for game over popup
              const gameOverEvent = new CustomEvent('game-over', { 
                detail: {
                  winner: event.data.winnerUsername,
                  loser: event.data.loserUsername,
                }
              });
              window.dispatchEvent(gameOverEvent);
              console.log('Game end event received:', event.data);
              break;
            case 'card-discard':
              // Card discard event - trigger a custom event for discard animation
              const discardEvent = new CustomEvent('card-discard', { 
                detail: event.data 
              });
              window.dispatchEvent(discardEvent);
              console.log('Card discard event received:', event.data);
              break;
            case 'card-magic-use':
              // Magic card usage event - trigger a custom event for magic animation
              const magicEvent = new CustomEvent('card-magic-use', { 
                detail: event.data 
              });
              window.dispatchEvent(magicEvent);
              console.log('Magic card usage event received:', event.data);
              break;
            default:
              console.log('Unknown event type:', event.type);
          }

          // Restore scroll position after React finishes rendering
          // Use requestAnimationFrame to ensure DOM has updated
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
        });

        // Handle connection state changes
        const handleConnected = () => {
          if (!isActive) return;
          console.log('Connected to Ably');
          setIsConnected(true);
          setError(null);
        };

        const handleDisconnected = () => {
          if (!isActive) return;
          console.log('Disconnected from Ably');
          setIsConnected(false);
        };

        const handleFailed = (stateChange: any) => {
          if (!isActive) return;
          console.error('Ably connection failed:', stateChange);
          setError('Connection failed');
          setIsConnected(false);
        };

        client.connection.on('connected', handleConnected);
        client.connection.on('disconnected', handleDisconnected);
        client.connection.on('failed', handleFailed);
      } catch (err) {
        console.error('Failed to initialize Ably:', err);
        setError('Failed to initialize real-time connection');
      }
    };

    initializeAbly();

    // Cleanup function
    return () => {
      isActive = false; // Mark effect as inactive
      
      // Remove the rejection handler
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);

      // Only cleanup if client and channel were initialized
      if (client) {
        // Remove connection event listeners
        try {
          client.connection.off('connected');
          client.connection.off('disconnected');
          client.connection.off('failed');
        } catch (err) {
          // Silently ignore
        }
      }
      
      // Clean up channel and connection properly
      const cleanup = async () => {
        if (channel) {
          try {
            // First unsubscribe from all channel events
            await channel.unsubscribe();
            
            // Only detach if the channel is attached or attaching
            if (channel.state === 'attached' || channel.state === 'attaching') {
              await channel.detach();
            }
          } catch (error) {
            // Silently ignore cleanup errors (common during navigation/unmount)
          }
        }

        if (client) {
          try {
            // Close the client connection if it's not already closed/closing
            if (client.connection.state !== 'closed' && client.connection.state !== 'closing') {
              client.close();
            }
          } catch (error) {
            // Silently ignore cleanup errors
          }
        }
      };

      // Execute cleanup
      cleanup();
    };
  }, [roomId]);

  return {
    gameRoom,
    isConnected,
    error,
    setGameRoom, // Allow manual updates
  };
}
