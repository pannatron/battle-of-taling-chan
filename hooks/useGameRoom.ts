import { useState, useEffect } from 'react';
import Ably from 'ably';
import { GameRoom, GameRoomEvent } from '@/types/game';

export function useGameRoom(roomId: string | null) {
  const [gameRoom, setGameRoom] = useState<GameRoom | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!roomId) return;

    const ablyKey = process.env.NEXT_PUBLIC_ABLY_SUBSCRIBE_KEY;
    if (!ablyKey) {
      setError('Ably key not configured');
      return;
    }

    let isActive = true; // Flag to track if effect is still active

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

    // Initialize Ably client
    const client = new Ably.Realtime({
      key: ablyKey,
      closeOnUnload: true,
      disconnectedRetryTimeout: 15000,
      suspendedRetryTimeout: 30000,
    });

    // Get the channel for this specific room
    const channel = client.channels.get(`game-room:${roomId}`);

    // Subscribe to channel events
    channel.subscribe((message) => {
      if (!isActive) return; // Ignore messages if effect is cleaning up
      
      const event = message.data as GameRoomEvent;
      
      console.log('Received game room event:', event);

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
        default:
          console.log('Unknown event type:', event.type);
      }
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

    // Cleanup function
    return () => {
      isActive = false; // Mark effect as inactive
      
      // Remove the rejection handler
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);

      // Remove connection event listeners
      client.connection.off('connected', handleConnected);
      client.connection.off('disconnected', handleDisconnected);
      client.connection.off('failed', handleFailed);
      
      // Clean up channel and connection properly
      const cleanup = async () => {
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

        try {
          // Close the client connection if it's not already closed/closing
          if (client.connection.state !== 'closed' && client.connection.state !== 'closing') {
            client.close();
          }
        } catch (error) {
          // Silently ignore cleanup errors
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
