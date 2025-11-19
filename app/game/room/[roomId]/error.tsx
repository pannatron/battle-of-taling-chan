'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function GameRoomError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();

  useEffect(() => {
    // Log the error to console
    console.error('Game room error:', error);
  }, [error]);

  return (
    <div className="container mx-auto py-8 px-4">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <div className="flex items-center gap-2">
            <AlertCircle className="h-6 w-6 text-destructive" />
            <CardTitle>Game Room Error</CardTitle>
          </div>
          <CardDescription>
            Failed to load the game room. This could be due to:
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
            <li>Network connection issues</li>
            <li>The room no longer exists</li>
            <li>Real-time connection failure</li>
            <li>Authentication issues</li>
          </ul>
          
          <div className="p-4 bg-destructive/10 rounded-lg">
            <p className="text-sm font-mono text-destructive break-all">
              {error.message || 'Unknown error occurred'}
            </p>
          </div>
          
          <div className="flex gap-2">
            <Button onClick={reset} className="flex-1">
              Try again
            </Button>
            <Button
              variant="outline"
              onClick={() => router.push('/game/lobby')}
              className="flex-1"
            >
              Back to Lobby
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
