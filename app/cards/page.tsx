import { getCardsBySeries } from '@/lib/api';
import { CardItem } from '@/components/card-item';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default async function CardsPage() {
  const cards = await getCardsBySeries('SD01');

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border/40 bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-6">
          <Link href="/">
            <Button variant="ghost" size="sm" className="mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Button>
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold tracking-tight">
                <span className="bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
                  Card Gallery
                </span>
              </h1>
              <p className="mt-2 text-muted-foreground">
                Series: SD01 - ตัวตึงไกรลาส
              </p>
            </div>
            <div className="rounded-lg border border-border/40 bg-muted/30 px-4 py-2 backdrop-blur-sm">
              <div className="text-sm text-muted-foreground">Total Cards</div>
              <div className="text-2xl font-bold text-foreground">{cards.length}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Cards Grid */}
      <div className="container mx-auto px-4 py-12">
        {cards.length === 0 ? (
          <div className="flex min-h-[400px] items-center justify-center rounded-lg border border-border/40 bg-card/30 backdrop-blur-sm">
            <div className="text-center">
              <p className="text-lg text-muted-foreground">No cards found</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Please make sure the backend is running
              </p>
            </div>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {cards.map((card) => (
              <CardItem key={card._id} card={card} />
            ))}
          </div>
        )}
      </div>

      {/* Background Effects */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute right-0 top-0 h-96 w-96 animate-pulse rounded-full bg-secondary/10 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-96 w-96 animate-pulse rounded-full bg-primary/10 blur-3xl animation-delay-2000" />
      </div>
    </div>
  );
}
