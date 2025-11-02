"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Menu, Swords, Sparkles } from "lucide-react"
import { useState } from "react"

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-20 items-center justify-between">
        <Link href="/" className="group flex items-center gap-3">
          <div className="relative">
            <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-primary via-accent to-secondary opacity-75 blur-sm transition-opacity group-hover:opacity-100" />
            <div className="relative flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary via-accent to-secondary p-[2px]">
              <div className="flex h-full w-full items-center justify-center rounded-xl bg-background">
                <Swords className="h-6 w-6 text-foreground" />
              </div>
            </div>
          </div>
          <span className="text-xl font-bold text-foreground">Battle of Taling Chan</span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          <Link
            href="/decks"
            className="relative text-sm font-medium text-muted-foreground transition-colors hover:text-foreground after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-0 after:bg-gradient-to-r after:from-primary after:to-accent after:transition-all hover:after:w-full"
          >
            Deck Lists
          </Link>
          <Link
            href="/tournaments"
            className="relative text-sm font-medium text-muted-foreground transition-colors hover:text-foreground after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-0 after:bg-gradient-to-r after:from-primary after:to-accent after:transition-all hover:after:w-full"
          >
            Tournaments
          </Link>
          <Link
            href="/marketplace"
            className="relative flex items-center gap-1 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-0 after:bg-gradient-to-r after:from-primary after:to-accent after:transition-all hover:after:w-full"
          >
            Marketplace
            <Sparkles className="h-3 w-3 text-accent" />
          </Link>
          <Link
            href="/about"
            className="relative text-sm font-medium text-muted-foreground transition-colors hover:text-foreground after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-0 after:bg-gradient-to-r after:from-primary after:to-accent after:transition-all hover:after:w-full"
          >
            About
          </Link>
        </nav>

        <div className="flex items-center gap-4">
          <Button variant="ghost" className="hidden md:inline-flex">
            Log in
          </Button>
          <Button className="hidden bg-gradient-to-r from-primary to-accent font-semibold md:inline-flex">
            Sign up
          </Button>
          <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            <Menu className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="border-t border-border/40 bg-background/95 p-4 backdrop-blur-xl md:hidden">
          <nav className="flex flex-col gap-4">
            <Link href="/decks" className="text-sm font-medium text-muted-foreground hover:text-foreground">
              Deck Lists
            </Link>
            <Link href="/tournaments" className="text-sm font-medium text-muted-foreground hover:text-foreground">
              Tournaments
            </Link>
            <Link
              href="/marketplace"
              className="flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground"
            >
              Marketplace
              <Sparkles className="h-3 w-3 text-accent" />
            </Link>
            <Link href="/about" className="text-sm font-medium text-muted-foreground hover:text-foreground">
              About
            </Link>
            <div className="flex flex-col gap-2 pt-2">
              <Button variant="outline" className="w-full border-border/40 bg-card/50 backdrop-blur-sm">
                Log in
              </Button>
              <Button className="w-full bg-gradient-to-r from-primary to-accent font-semibold">Sign up</Button>
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}
