import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Eye, Heart, TrendingUp, Zap } from "lucide-react"

const sampleDecks = [
  {
    name: "Dragon Storm Control",
    author: "ThaiMaster99",
    archetype: "Control",
    wins: 45,
    views: 1250,
    likes: 89,
    gradient: "from-blue-500 via-cyan-500 to-blue-600",
  },
  {
    name: "Aggro Red Rush",
    author: "BangkokAce",
    archetype: "Aggro",
    wins: 38,
    views: 980,
    likes: 67,
    gradient: "from-red-500 via-orange-500 to-red-600",
  },
  {
    name: "Combo Infinite Loop",
    author: "ComboKing",
    archetype: "Combo",
    wins: 52,
    views: 1580,
    likes: 124,
    gradient: "from-purple-500 via-pink-500 to-purple-600",
  },
]

export function DeckShowcase() {
  return (
    <section className="relative py-24 md:py-32">
      <div className="absolute inset-0 -z-10">
        <div className="absolute right-0 top-0 h-96 w-96 animate-pulse rounded-full bg-secondary/10 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-96 w-96 animate-pulse rounded-full bg-primary/10 blur-3xl animation-delay-2000" />
      </div>

      <div className="container relative mx-auto px-4 md:px-6">
        <div className="mb-16 flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
          <div>
            <h2 className="mb-3 text-balance text-4xl font-bold tracking-tight md:text-5xl">
              <span className="bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
                Top Performing
              </span>{" "}
              <span className="text-foreground">Decks</span>
            </h2>
            <p className="text-pretty text-lg text-muted-foreground">Winning strategies from recent tournaments</p>
          </div>
          <Button
            variant="outline"
            className="hidden border-glow bg-card/50 font-semibold backdrop-blur-sm hover:bg-card md:inline-flex"
          >
            View All Decks
          </Button>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {sampleDecks.map((deck, index) => (
            <Card
              key={index}
              className="group relative overflow-hidden border-border bg-card/50 backdrop-blur-sm transition-all hover:border-glow hover:card-glow"
            >
              <div className={`h-1 bg-gradient-to-r ${deck.gradient}`} />
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />

              <CardHeader className="relative pb-4">
                <div className="mb-3 flex items-start justify-between gap-2">
                  <h3 className="text-xl font-bold text-foreground group-hover:text-glow">{deck.name}</h3>
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

        <div className="mt-8 text-center md:hidden">
          <Button
            variant="outline"
            className="w-full border-glow bg-card/50 font-semibold backdrop-blur-sm hover:bg-card"
          >
            View All Decks
          </Button>
        </div>
      </div>
    </section>
  )
}
