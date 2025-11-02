import { Card, CardContent } from "@/components/ui/card"
import { Layers, Users, TrendingUp, ShoppingBag } from "lucide-react"

const features = [
  {
    icon: Layers,
    title: "Deck Builder",
    description:
      "Create and manage your deck lists with our intuitive builder. Import, export, and share with the community.",
    gradient: "from-primary to-secondary",
  },
  {
    icon: Users,
    title: "Community Hub",
    description: "Connect with players across Thailand. Share strategies, discuss meta, and find local tournaments.",
    gradient: "from-secondary to-accent",
  },
  {
    icon: TrendingUp,
    title: "Meta Analysis",
    description: "Track winning decks, analyze trends, and stay ahead of the competition with real-time statistics.",
    gradient: "from-accent to-primary",
  },
  {
    icon: ShoppingBag,
    title: "Marketplace",
    description: "Buy, sell, and trade cards with confidence. Auction system coming soon for rare collectibles.",
    gradient: "from-primary via-accent to-secondary",
  },
]

export function Features() {
  return (
    <section className="relative py-24 md:py-32">
      <div className="absolute inset-0 -z-10">
        <div className="absolute left-0 top-1/4 h-96 w-96 animate-pulse rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute right-0 bottom-1/4 h-96 w-96 animate-pulse rounded-full bg-accent/10 blur-3xl animation-delay-2000" />
      </div>

      <div className="container relative mx-auto px-4 md:px-6">
        <div className="mx-auto mb-16 max-w-3xl text-center">
          <h2 className="mb-6 text-balance text-4xl font-bold tracking-tight md:text-5xl lg:text-6xl">
            <span className="bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
              Everything You Need
            </span>
            <br />
            <span className="text-foreground">to Dominate</span>
          </h2>
          <p className="text-pretty text-lg text-muted-foreground md:text-xl">
            Powerful tools designed for competitive players and collectors
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, index) => (
            <Card
              key={index}
              className="group relative overflow-hidden border-border bg-card/50 backdrop-blur-sm transition-all hover:border-glow hover:card-glow"
            >
              <div
                className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 transition-opacity group-hover:opacity-10`}
              />
              <CardContent className="relative p-6">
                <div
                  className={`mb-6 inline-flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br ${feature.gradient} p-[2px]`}
                >
                  <div className="flex h-full w-full items-center justify-center rounded-xl bg-card">
                    <feature.icon className="h-6 w-6 text-foreground" />
                  </div>
                </div>
                <h3 className="mb-3 text-xl font-bold text-foreground">{feature.title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
