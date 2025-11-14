"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Menu, Swords, Sparkles } from "lucide-react"
import { useState } from "react"
import { ThemeToggle } from "@/components/theme-toggle"
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs"

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto grid h-20 grid-cols-[auto_1fr] lg:grid-cols-[1fr_auto_1fr] items-center gap-4 px-4 md:px-6">
        <div className="flex items-center">
          <Link href="/" className="group flex items-center gap-3 flex-shrink-0">
            <div className="relative">
              <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-primary via-accent to-secondary opacity-75 blur-sm transition-opacity group-hover:opacity-100" />
              <div className="relative flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary via-accent to-secondary p-[2px]">
                <div className="flex h-full w-full items-center justify-center rounded-xl bg-background">
                  <Swords className="h-6 w-6 text-foreground" />
                </div>
              </div>
            </div>
            <span className="text-xl font-bold text-foreground hidden sm:inline">Battle of Taling Chan</span>
          </Link>
        </div>

        <nav className="hidden items-center gap-6 lg:flex">
          <Link
            href="/decks"
            className="relative text-sm font-medium text-muted-foreground transition-colors hover:text-foreground after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-0 after:bg-gradient-to-r after:from-primary after:to-accent after:transition-all hover:after:w-full"
          >
            Deck Lists
          </Link>
          <Link
            href="/deck-builder"
            className="relative text-sm font-medium text-muted-foreground transition-colors hover:text-foreground after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-0 after:bg-gradient-to-r after:from-primary after:to-accent after:transition-all hover:after:w-full"
          >
            Deck Builder
          </Link>
          <div className="relative flex flex-col items-center gap-0 text-sm font-medium text-muted-foreground/50 cursor-not-allowed">
            <span>Tournaments</span>
            <span className="text-[10px] text-accent/70">(Coming Soon)</span>
          </div>
          <div className="relative flex flex-col items-center gap-0 text-sm font-medium text-muted-foreground/50 cursor-not-allowed">
            <span className="flex items-center gap-1">
              Marketplace
              <Sparkles className="h-3 w-3 text-accent/50" />
            </span>
            <span className="text-[10px] text-accent/70">(Coming Soon)</span>
          </div>
        </nav>

        <div className="flex items-center justify-end gap-2 sm:gap-3">
          <ThemeToggle />
          <SignedOut>
            <SignInButton mode="modal">
              <Button variant="ghost" className="hidden lg:inline-flex">
                Log in
              </Button>
            </SignInButton>
            <SignInButton mode="modal">
              <Button className="hidden bg-gradient-to-r from-primary to-accent font-semibold lg:inline-flex">
                Sign up
              </Button>
            </SignInButton>
          </SignedOut>
          <SignedIn>
            <div className="[&_.cl-userButtonTrigger]:h-8 [&_.cl-userButtonTrigger]:w-8 md:[&_.cl-userButtonTrigger]:h-10 md:[&_.cl-userButtonTrigger]:w-10">
              <UserButton afterSignOutUrl="/" />
            </div>
          </SignedIn>
          <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
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
            <Link href="/deck-builder" className="text-sm font-medium text-muted-foreground hover:text-foreground">
              Deck Builder
            </Link>
            <div className="flex flex-col items-start gap-0 text-sm font-medium text-muted-foreground/50 cursor-not-allowed">
              <span>Tournaments</span>
              <span className="text-[10px] text-accent/70">(Coming Soon)</span>
            </div>
            <div className="flex flex-col items-start gap-0 text-sm font-medium text-muted-foreground/50 cursor-not-allowed">
              <span className="flex items-center gap-1">
                Marketplace
                <Sparkles className="h-3 w-3 text-accent/50" />
              </span>
              <span className="text-[10px] text-accent/70">(Coming Soon)</span>
            </div>
            <SignedOut>
              <div className="flex flex-col gap-2 pt-2">
                <SignInButton mode="modal">
                  <Button variant="outline" className="w-full border-border/40 bg-card/50 backdrop-blur-sm">
                    Log in
                  </Button>
                </SignInButton>
                <SignInButton mode="modal">
                  <Button className="w-full bg-gradient-to-r from-primary to-accent font-semibold">Sign up</Button>
                </SignInButton>
              </div>
            </SignedOut>
            <SignedIn>
              <div className="flex items-center gap-2 pt-2">
                <div className="[&_.cl-userButtonTrigger]:h-8 [&_.cl-userButtonTrigger]:w-8">
                  <UserButton afterSignOutUrl="/" />
                </div>
                <span className="text-sm text-muted-foreground">Your Account</span>
              </div>
            </SignedIn>
          </nav>
        </div>
      )}
    </header>
  )
}
