import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Eye, Heart, TrendingUp, Zap } from "lucide-react"
import Link from "next/link"
import { getAllDecks, getCardById } from "@/lib/api"
import Image from "next/image"

export async function DeckShowcase() {
  const allDecks = await getAllDecks()
  const topDecks = allDecks.slice(0, 3)
  
  // Get first card image for each deck
  const decksWithImages = await Promise.all(
    topDecks.map(async (deck) => {
      const firstCardId = deck.cardIds?.[0]
      const firstCard = firstCardId ? await getCardById(firstCardId) : null
      return {
        ...deck,
        coverImage: firstCard?.imageUrl || null
      }
    })
  )
  
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
          <Link href="/decks">
            <Button
              variant="outline"
              className="hidden border-glow bg-card/50 font-semibold backdrop-blur-sm hover:bg-card md:inline-flex"
            >
              View All Decks
            </Button>
          </Link>
        </div>

        {topDecks.length === 0 ? (
          <div className="rounded-lg border border-border bg-card/50 p-12 text-center backdrop-blur-sm">
            <p className="text-lg text-muted-foreground">
              No decks available yet. Check back soon!
            </p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {decksWithImages.map((deck) => (
              <Link href={`/decks/${deck._id}`} key={deck._id}>
                <Card className="group relative aspect-[3/4] overflow-hidden border-border bg-card/50 backdrop-blur-sm transition-all hover:border-glow hover:card-glow">
                  {/* Background Image */}
                  <div className="absolute inset-0">
                    {deck.coverImage ? (
                      <Image
                        src={deck.coverImage}
                        alt={deck.name}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-110"
                        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      />
                    ) : (
                      <div className="h-full w-full bg-gradient-to-br from-muted to-muted/50" />
                    )}
                  </div>

                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent opacity-90" />
                  
                  {/* Top Badge */}
                  <div className="absolute right-4 top-4 z-10">
                    <Badge
                      variant="secondary"
                      className="border border-white/20 bg-black/50 font-semibold backdrop-blur-md"
                    >
                      {deck.archetype}
                    </Badge>
                  </div>

                  {/* Content */}
                  <div className="absolute inset-0 flex flex-col justify-end p-6">
                    <div className="space-y-3">
                      <div>
                        <h3 className="mb-2 text-2xl font-bold text-white group-hover:text-glow">
                          {deck.name}
                        </h3>
                        <p className="text-sm text-white/80">by {deck.author}</p>
                      </div>

                      <div className="flex items-center gap-4 text-sm text-white/90">
                        <div className="flex items-center gap-1.5">
                          <div className="rounded-md bg-white/10 p-1 backdrop-blur-sm">
                            <TrendingUp className="h-3.5 w-3.5" />
                          </div>
                          <span className="font-bold">{deck.wins}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Eye className="h-3.5 w-3.5" />
                          <span>{deck.views}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Heart className="h-3.5 w-3.5" />
                          <span>{deck.likes}</span>
                        </div>
                      </div>

                      <Button
                        className="group/btn relative w-full overflow-hidden border-white/20 bg-white/10 font-semibold text-white backdrop-blur-md hover:bg-white/20 hover:border-white/40"
                        variant="outline"
                      >
                        <span className="relative z-10 flex items-center justify-center gap-2">
                          View Deck
                          <Zap className="h-4 w-4 transition-transform group-hover/btn:rotate-12" />
                        </span>
                      </Button>
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}

        <div className="mt-8 text-center md:hidden">
          <Link href="/decks" className="block">
            <Button
              variant="outline"
              className="w-full border-glow bg-card/50 font-semibold backdrop-blur-sm hover:bg-card"
            >
              View All Decks
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}
