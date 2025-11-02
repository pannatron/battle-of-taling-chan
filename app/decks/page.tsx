import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Eye, Heart, TrendingUp, Zap } from "lucide-react"
import { getAllDecks } from "@/lib/api"

export default async function DecksPage() {
  const decks = await getAllDecks()

  return (
    <div className="min-h-screen bg-background">
      <div className="relative py-24 md:py-32">
        <div className="absolute inset-0 -z-10">
          <div className="absolute right-0 top-0 h-96 w-96 animate-pulse rounded-full bg-secondary/10 blur-3xl" />
          <div className="absolute bottom-0 left-1/3 h-96 w-96 animate-pulse rounded-full bg-primary/10 blur-3xl animation-delay-2000" />
        </div>

        <div className="container relative mx-auto px-4 md:px-6">
          <div className="mb-16">
            <h1 className="mb-3 text-balance text-4xl font-bold tracking-tight md:text-5xl lg:text-6xl">
              <span className="bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
                Top Performing
              </span>{" "}
              <span className="text-foreground">Decks</span>
            </h1>
            <p className="text-pretty text-lg text-muted-foreground md:text-xl">
              Winning strategies from recent tournaments
            </p>
          </div>

          {decks.length === 0 ? (
            <div className="rounded-lg border border-border bg-card/50 p-12 text-center backdrop-blur-sm">
              <p className="text-lg text-muted-foreground">
                No decks found. Create your first deck to get started!
              </p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {decks.map((deck) => (
                <Card
                  key={deck._id}
                  className="group relative overflow-hidden border-border bg-card/50 backdrop-blur-sm transition-all hover:border-glow hover:card-glow"
                >
                  <div className={`h-1 bg-gradient-to-r ${deck.gradient}`} />
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />

                  <CardHeader className="relative pb-4">
                    <div className="mb-3 flex items-start justify-between gap-2">
                      <h3 className="text-xl font-bold text-foreground group-hover:text-glow">
                        {deck.name}
                      </h3>
                      <Badge
                        variant="secondary"
                        className="border border-border/40 bg-muted/50 font-semibold backdrop-blur-sm"
                      >
                        {deck.archetype}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">by {deck.author}</p>
                  </CardHeader>

                  <CardContent className="relative space-y-4">
                    {deck.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {deck.description}
                      </p>
                    )}

                    <div className="flex items-center gap-6 text-sm">
                      <div className="flex items-center gap-1.5">
                        <div className="rounded-md bg-accent/20 p-1">
                          <TrendingUp className="h-3.5 w-3.5 text-accent" />
                        </div>
                        <span className="font-bold text-foreground">{deck.wins}</span>
                        <span className="text-muted-foreground">wins</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <Eye className="h-3.5 w-3.5" />
                        <span>{deck.views}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <Heart className="h-3.5 w-3.5" />
                        <span>{deck.likes}</span>
                      </div>
                    </div>

                    <Button
                      className="group/btn relative w-full overflow-hidden border-border/40 bg-card/50 font-semibold backdrop-blur-sm hover:border-glow"
                      variant="outline"
                    >
                      <span className="relative z-10 flex items-center gap-2">
                        View Deck
                        <Zap className="h-4 w-4 transition-transform group-hover/btn:rotate-12" />
                      </span>
                      <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-accent/10 opacity-0 transition-opacity group-hover/btn:opacity-100" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
