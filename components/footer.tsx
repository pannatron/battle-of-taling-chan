import Link from "next/link"
import Image from "next/image"
import { Swords } from "lucide-react"

export function Footer() {
  return (
    <footer className="relative border-t border-border/40 bg-background/80 backdrop-blur-xl">
      <div className="absolute inset-0 -z-10 bg-gradient-to-t from-primary/5 to-transparent" />

      <div className="container mx-auto px-4 py-16 md:px-6 md:py-20">
        <div className="grid gap-12 md:grid-cols-4">
          <div className="md:col-span-2">
            <Link href="/" className="group mb-6 flex items-center gap-3">
              <div className="relative">
                <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-primary via-accent to-secondary opacity-50 blur-sm transition-opacity group-hover:opacity-75" />
                <div className="relative flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary via-accent to-secondary p-[2px]">
                  <div className="flex h-full w-full items-center justify-center rounded-xl bg-background">
                    <Swords className="h-6 w-6 text-foreground" />
                  </div>
                </div>
              </div>
              <span className="text-xl font-bold text-foreground">Battle of Taling Chan</span>
            </Link>
            <p className="mb-6 max-w-md text-sm leading-relaxed text-muted-foreground">
              Fan-made decklist showcase for the Battle of TalingChan TCG. Not affiliated with or endorsed by the original developers. All game content belongs to its respective owners.
            </p>
            <p className="text-xs text-muted-foreground/60">© 2025 Battle of Taling Chan. All rights reserved.</p>
          </div>

          <div>
            <h3 className="mb-6 text-sm font-bold text-foreground">Platform</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link
                  href="/decks"
                  className="text-muted-foreground transition-colors hover:text-foreground hover:underline hover:decoration-primary"
                >
                  Deck Lists
                </Link>
              </li>
              <li>
                <Link
                  href="/tournaments"
                  className="text-muted-foreground transition-colors hover:text-foreground hover:underline hover:decoration-primary"
                >
                  Tournaments
                </Link>
              </li>
              <li>
                <Link
                  href="/marketplace"
                  className="text-muted-foreground transition-colors hover:text-foreground hover:underline hover:decoration-primary"
                >
                  Marketplace
                </Link>
              </li>
              <li>
                <Link
                  href="/leaderboard"
                  className="text-muted-foreground transition-colors hover:text-foreground hover:underline hover:decoration-primary"
                >
                  Leaderboard
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-6 text-sm font-bold text-foreground">Community</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link
                  href="/about"
                  className="text-muted-foreground transition-colors hover:text-foreground hover:underline hover:decoration-primary"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  href="/rules"
                  className="text-muted-foreground transition-colors hover:text-foreground hover:underline hover:decoration-primary"
                >
                  Rules & Guidelines
                </Link>
              </li>
              <li>
                <Link
                  href="/support"
                  className="text-muted-foreground transition-colors hover:text-foreground hover:underline hover:decoration-primary"
                >
                  Support
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-muted-foreground transition-colors hover:text-foreground hover:underline hover:decoration-primary"
                >
                  Contact
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Official Game Credit Section */}
        <div className="mt-12 pt-8 border-t border-border/40">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-center sm:text-left">
            <Image
              src="/BOT logo.jpg"
              alt="Battle of TalingChan Official Logo"
              width={60}
              height={60}
              className="rounded-lg flex-shrink-0"
            />
            <div>
              <p className="text-xs font-semibold text-muted-foreground mb-1">
                Fan-made decklist showcase for the Battle of TalingChan TCG
              </p>
              <p className="text-xs text-muted-foreground/70">
                Not affiliated with or endorsed by the original developers
              </p>
              <p className="text-xs text-muted-foreground/70">
                All game content belongs to its respective owners
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
