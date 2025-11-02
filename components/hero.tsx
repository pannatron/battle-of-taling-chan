import { Button } from "@/components/ui/button"
import { ArrowRight, Trophy, Sparkles } from "lucide-react"
import Link from "next/link"

export function Hero() {
  return (
    <section className="relative overflow-hidden py-24 md:py-40">
      <div className="absolute inset-0 -z-10">
        <div className="gradient-glow absolute inset-0" />
        <div className="absolute left-1/4 top-0 h-96 w-96 animate-pulse rounded-full bg-primary/20 blur-3xl" />
        <div className="absolute right-1/4 top-1/3 h-96 w-96 animate-pulse rounded-full bg-accent/20 blur-3xl animation-delay-2000" />
        <div className="absolute bottom-0 left-1/2 h-96 w-96 animate-pulse rounded-full bg-secondary/20 blur-3xl animation-delay-4000" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:40px_40px]" />
      </div>

      <div className="container relative z-10">
        <div className="mx-auto max-w-5xl text-center">
          <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-glow bg-card/50 px-6 py-3 text-sm font-medium text-foreground backdrop-blur-sm">
            <Sparkles className="h-4 w-4 text-primary" />
            <span>Season 2025 Now Live</span>
            <Trophy className="h-4 w-4 text-accent" />
          </div>

          <h1 className="mb-6 text-balance text-5xl font-bold tracking-tight md:text-7xl lg:text-8xl">
            <span className="bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
              Build Your Ultimate
            </span>
            <br />
            <span className="text-glow">Deck Collection</span>
          </h1>

          <p className="mb-10 text-pretty text-lg text-muted-foreground md:text-xl lg:text-2xl">
            Join Thailand's premier trading card game community.
            <br className="hidden md:block" />
            Create legendary decks, trade rare cards, dominate tournaments.
          </p>

          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button
              size="lg"
              className="group relative w-full overflow-hidden bg-gradient-to-r from-primary to-accent text-lg font-semibold sm:w-auto"
              asChild
            >
              <Link href="/decks/create">
                <span className="relative z-10">Create Deck</span>
                <ArrowRight className="relative z-10 ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                <div className="absolute inset-0 bg-gradient-to-r from-accent to-primary opacity-0 transition-opacity group-hover:opacity-100" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="w-full border-glow bg-card/50 text-lg font-semibold backdrop-blur-sm hover:bg-card sm:w-auto"
              asChild
            >
              <Link href="/decks">Explore Decks</Link>
            </Button>
          </div>

          <div className="mt-20 grid grid-cols-1 gap-6 sm:grid-cols-3">
            {[
              { value: "2,500+", label: "Active Players", color: "primary" },
              { value: "8,000+", label: "Deck Lists", color: "secondary" },
              { value: "150+", label: "Tournaments", color: "accent" },
            ].map((stat, index) => (
              <div
                key={index}
                className="group relative overflow-hidden rounded-2xl border border-border bg-card/30 p-6 backdrop-blur-sm transition-all hover:border-glow hover:card-glow"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                <div className="relative">
                  <div className={`mb-2 text-4xl font-bold text-${stat.color} md:text-5xl`}>{stat.value}</div>
                  <div className="text-sm font-medium text-muted-foreground">{stat.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
