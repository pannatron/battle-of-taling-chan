'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getGameRooms, createGameRoom, joinGameRoom } from '@/lib/api';
import { GameRoom } from '@/types/game';
import { Users, Play, RefreshCw, Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function GameLobbyPage() {
  const router = useRouter();
  const { user } = useUser();
  const { toast } = useToast();
  const [rooms, setRooms] = useState<GameRoom[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [roomName, setRoomName] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);

  const fetchRooms = async () => {
    setLoading(true);
    try {
      const fetchedRooms = await getGameRooms();
      setRooms(fetchedRooms);
    } catch (error) {
      console.error('Error fetching rooms:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch game rooms',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms();
    // Refresh rooms every 5 seconds
    const interval = setInterval(fetchRooms, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleCreateRoom = async () => {
    if (!user) {
      toast({
        title: 'Error',
        description: 'You must be signed in to create a room',
        variant: 'destructive',
      });
      return;
    }

    if (!roomName.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a room name',
        variant: 'destructive',
      });
      return;
    }

    setCreating(true);
    try {
      const room = await createGameRoom({
        roomName: roomName.trim(),
        userId: user.id,
        username: user.username || user.firstName || 'Player',
      });

      toast({
        title: 'Success',
        description: 'Room created successfully',
      });

      // Navigate to the created room
      router.push(`/game/room/${room.roomId}`);
    } catch (error) {
      console.error('Error creating room:', error);
      toast({
        title: 'Error',
        description: 'Failed to create room',
        variant: 'destructive',
      });
    } finally {
      setCreating(false);
    }
  };

  const handleJoinRoom = async (roomId: string) => {
    if (!user) {
      toast({
        title: 'Error',
        description: 'You must be signed in to join a room',
        variant: 'destructive',
      });
      return;
    }

    try {
      await joinGameRoom(roomId, {
        userId: user.id,
        username: user.username || user.firstName || 'Player',
      });

      // Navigate to the room
      router.push(`/game/room/${roomId}`);
    } catch (error) {
      console.error('Error joining room:', error);
      toast({
        title: 'Error',
        description: 'Failed to join room',
        variant: 'destructive',
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'waiting':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            Waiting
          </span>
        );
      case 'ready':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            Ready
          </span>
        );
      case 'in_progress':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            In Progress
          </span>
        );
      case 'finished':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            Finished
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">Game Lobby</h1>
            <p className="text-muted-foreground">
              Join an existing room or create your own to start playing
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={fetchRooms}
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
            <Button
              onClick={() => setShowCreateForm(!showCreateForm)}
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              Create Room
            </Button>
          </div>
        </div>

        {showCreateForm && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Create New Game Room</CardTitle>
              <CardDescription>
                Enter a name for your game room
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Input
                  placeholder="Room name (e.g., Epic Battle #1)"
                  value={roomName}
                  onChange={(e) => setRoomName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleCreateRoom();
                  }}
                  disabled={creating}
                />
                <Button onClick={handleCreateRoom} disabled={creating}>
                  {creating ? 'Creating...' : 'Create'}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowCreateForm(false);
                    setRoomName('');
                  }}
                  disabled={creating}
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {loading && rooms.length === 0 ? (
          <div className="text-center py-12">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">Loading rooms...</p>
          </div>
        ) : rooms.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Play className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">No Active Rooms</h3>
              <p className="text-muted-foreground mb-4">
                Be the first to create a game room!
              </p>
              <Button onClick={() => setShowCreateForm(true)}>
                Create Room
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {rooms.map((room) => (
              <Card key={room.roomId} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{room.roomName}</CardTitle>
                      <CardDescription className="mt-1">
                        Host: {room.players.find(p => p.userId === room.hostUserId)?.username || 'Unknown'}
                      </CardDescription>
                    </div>
                    {getStatusBadge(room.status)}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span>
                        Players: {room.players.length}/2
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span>
                        Spectators: {room.spectators.length}/{room.maxSpectators}
                      </span>
                    </div>
                    <Button
                      className="w-full"
                      onClick={() => handleJoinRoom(room.roomId)}
                      disabled={room.status === 'finished'}
                    >
                      {room.status === 'in_progress'
                        ? 'Watch Game'
                        : room.players.length >= 2
                        ? 'Join as Spectator'
                        : 'Join Room'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
