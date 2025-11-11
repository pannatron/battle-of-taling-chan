"use client"

import { Button } from "@/components/ui/button"
import { ArrowRight, Trophy, Sparkles } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { useState, useEffect } from "react"


export function Hero() {
  const characters = [
    { id: 1, image: "/character/1.png", name: "Hero 1", type: "female" },
    { id: 2, image: "/character/2.png", name: "Hero 2", type: "female" },
    { id: 3, image: "/character/3.png", name: "Hero 3", type: "female" },
    { id: 11, image: "/character/11.png", name: "Hero 11", type: "male" },
    { id: 12, image: "/character/12.png", name: "Hero 12", type: "male" },
    { id: 13, image: "/character/13.png", name: "Hero 13", type: "male" },
  ]

  const [currentIndex, setCurrentIndex] = useState(0)

  const scrollToSinCards = () => {
    const section = document.getElementById('sin-cards-section');
    if (section) {
      section.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % characters.length)
    }, 3000) // Change every 3 seconds

    return () => clearInterval(interval)
  }, [characters.length])

  return (
    <section className="relative overflow-hidden py-16 md:py-24 max-w-full">
      <div className="absolute inset-0 -z-10">
        <div className="gradient-glow absolute inset-0" />
        <div className="absolute left-1/4 top-0 h-96 w-96 animate-pulse rounded-full bg-primary/20 blur-3xl" />
        <div className="absolute right-1/4 top-1/3 h-96 w-96 animate-pulse rounded-full bg-accent/20 blur-3xl animation-delay-2000" />
        <div className="absolute bottom-0 left-1/2 h-96 w-96 animate-pulse rounded-full bg-secondary/20 blur-3xl animation-delay-4000" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:40px_40px]" />
      </div>

      <div className="container relative z-10 mx-auto px-4 md:px-6">
        <div className="mx-auto max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            {/* Left Side - Content and Buttons */}
            <div className="order-2 lg:order-1">
              {/* Badge */}
              <div className="mb-6 inline-flex items-center justify-center gap-2 rounded-full border border-glow bg-card/50 px-6 py-3 text-sm font-medium text-foreground backdrop-blur-sm">
                <Sparkles className="h-4 w-4 text-primary" />
                <span>Season 2025 Now Live</span>
                <Trophy className="h-4 w-4 text-accent" />
              </div>

              {/* Heading */}
              <h1 className="mb-6 text-balance text-3xl font-bold tracking-tight md:text-5xl lg:text-6xl">
                <span className="bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
                  Build Your Ultimate
                </span>
                <br />
                <span className="text-glow">Deck Collection</span>
              </h1>

              {/* Description */}
              <p className="mb-4 text-pretty text-base text-muted-foreground md:text-lg">
                Fan-made decklist showcase for the Battle of TalingChan TCG.
                <br className="hidden md:block" />
                Not affiliated with or endorsed by the original developers.
              </p>

              {/* Official Game Credit */}
              <div className="mb-8 flex items-center gap-3 rounded-xl border border-border/40 bg-card/30 backdrop-blur-sm p-4 max-w-fit">
                <Image
                  src="/BOT logo.jpg"
                  alt="Battle of TalingChan Official Logo"
                  width={48}
                  height={48}
                  className="rounded-lg flex-shrink-0"
                />
                <div>
                  <p className="text-xs font-semibold text-muted-foreground">
                    Battle of TalingChan TCG
                  </p>
                  <p className="text-xs text-muted-foreground/70">
                    All game content belongs to its respective owners
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mb-8 flex flex-col items-start gap-4 sm:flex-row sm:gap-6">
                <Button
                  size="lg"
                  className="group relative min-w-[200px] overflow-hidden rounded-xl bg-gradient-to-r from-primary via-primary/90 to-accent px-8 py-6 text-base font-bold shadow-xl shadow-primary/30 transition-all hover:scale-105 hover:shadow-2xl hover:shadow-primary/40"
                  asChild
                >
                  <Link href="/deck-builder" className="flex items-center justify-center gap-2">
                    <span className="relative z-10">Create Deck</span>
                    <ArrowRight className="relative z-10 h-5 w-5 transition-transform group-hover:translate-x-1" />
                    <div className="absolute inset-0 bg-gradient-to-r from-accent via-accent/90 to-primary opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                  </Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="group min-w-[200px] rounded-xl border-2 border-primary/50 bg-background/80 px-8 py-6 text-base font-bold backdrop-blur-sm transition-all hover:scale-105 hover:border-primary hover:bg-primary/10 hover:shadow-xl hover:shadow-primary/20"
                  asChild
                >
                  <Link href="/decks" className="flex items-center justify-center gap-2">
                    <span>Explore Decks</span>
                    <Sparkles className="h-4 w-4 transition-transform group-hover:rotate-12" />
                  </Link>
                </Button>
              </div>
            </div>

            {/* Right Side - Premium Character Slideshow */}
            <div className="order-1 lg:order-2 relative overflow-visible">
              <div className="relative h-[280px] md:h-[360px] lg:h-[420px] flex flex-row items-center justify-center gap-2 md:gap-4 px-2 md:px-4">
                {/* Previous Character Preview - Left */}
                <div className="hidden md:block relative w-[90px] lg:w-[110px] h-[190px] lg:h-[220px] flex-shrink-0">
                  <div className="relative w-full h-full rounded-2xl overflow-hidden opacity-40 grayscale hover:grayscale-0 hover:opacity-70 transition-all duration-500 cursor-pointer bg-background/30 dark:bg-background/10"
                       onClick={() => setCurrentIndex((currentIndex - 1 + characters.length) % characters.length)}>
                    <Image
                      src={characters[(currentIndex - 1 + characters.length) % characters.length].image}
                      alt="Previous character"
                      fill
                      className="object-contain"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background/60 via-transparent to-transparent" />
                  </div>
                </div>

                {/* Main Character Display - Center (LARGEST) */}
                <div className="relative flex-1 w-full max-w-[200px] sm:max-w-[230px] md:max-w-[330px] lg:max-w-[400px] h-full rounded-3xl overflow-hidden bg-background/50 dark:bg-background/20 backdrop-blur-sm shadow-2xl">
                  <div className="relative w-full h-full">
                    {characters.map((character, index) => (
                      <div
                        key={character.id}
                        className={`absolute inset-0 transition-all duration-1000 ${
                          index === currentIndex
                            ? "opacity-100 scale-100"
                            : "opacity-0 scale-95"
                        }`}
                      >
                        <div className="relative w-full h-full">
                          <Image
                            src={character.image}
                            alt={character.name}
                            fill
                            className="object-contain drop-shadow-2xl"
                            priority={index === 0}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-background/40 dark:from-background/30 via-transparent to-transparent" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Next Character Preview - Right */}
                <div className="hidden md:block relative w-[90px] lg:w-[110px] h-[190px] lg:h-[220px] flex-shrink-0">
                  <div className="relative w-full h-full rounded-2xl overflow-hidden opacity-40 grayscale hover:grayscale-0 hover:opacity-70 transition-all duration-500 cursor-pointer bg-background/30 dark:bg-background/10"
                       onClick={() => setCurrentIndex((currentIndex + 1) % characters.length)}>
                    <Image
                      src={characters[(currentIndex + 1) % characters.length].image}
                      alt="Next character"
                      fill
                      className="object-contain"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background/60 via-transparent to-transparent" />
                  </div>
                </div>
              </div>

              {/* Navigation Dots */}
              <div className="mt-6 flex justify-center gap-2">
                {characters.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentIndex(index)}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      index === currentIndex
                        ? "w-8 bg-primary"
                        : "w-2 bg-muted-foreground/30 hover:bg-muted-foreground/50"
                    }`}
                    aria-label={`Go to slide ${index + 1}`}
                  />
                ))}
              </div>

              {/* การ์ดบาป Button - ใต้ Dots (All screens) */}
              <div className="mt-8 flex justify-center">
                <div className="relative inline-block">
                  <Button
                    size="sm"
                    className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-purple-600 via-indigo-600 to-cyan-600 px-6 py-3 shadow-xl transition-all duration-300 hover:scale-105 hover:shadow-purple-500/50 border border-purple-400/40"
                    onClick={scrollToSinCards}
                  >
                    {/* Animated background gradient */}
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-700 via-indigo-700 to-cyan-700 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                    
                    {/* Animated glow effect */}
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="absolute inset-0 bg-gradient-to-t from-transparent via-purple-500/20 to-cyan-500/30 animate-pulse" />
                    </div>

                    {/* Sparkle effects */}
                    <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-all duration-300">
                      <Sparkles className="h-3 w-3 text-cyan-200 animate-pulse" />
                    </div>
                    <div className="absolute bottom-1 left-1 opacity-0 group-hover:opacity-100 transition-all duration-300">
                      <Sparkles className="h-3 w-3 text-purple-200 animate-pulse" />
                    </div>

                    {/* Button content */}
                    <div className="relative z-20 flex items-center gap-2">
                      <span className="text-base font-bold text-white drop-shadow-lg">การ์ดบาป</span>
                    </div>

                    {/* Glow effect */}
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-purple-400 via-indigo-400 to-cyan-400 opacity-0 blur-lg transition-opacity duration-300 group-hover:opacity-50 -z-10" />
                  </Button>

                  {/* Comment Badge - Above Button */}
                  <div className="absolute -top-2 left-1/2 -translate-x-1/2 -translate-y-full">
                    <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 via-indigo-500/20 to-cyan-500/20 blur-md" />
                      <div className="relative bg-gradient-to-r from-purple-900/90 via-indigo-900/90 to-cyan-900/90 backdrop-blur-sm border border-purple-400/30 rounded-full px-3 py-1 shadow-lg">
                        <span className="text-[10px] font-medium text-cyan-100 whitespace-nowrap">
                          ประจำเดือนธันวาคม 2568
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Pulsing ring effect */}
                  <div className="absolute inset-0 rounded-xl animate-ping opacity-10 bg-gradient-to-br from-purple-500 via-indigo-500 to-cyan-500 -z-10" 
                       style={{ animationDuration: '3s' }} />
                </div>
              </div>
            </div>
          </div>

          {/* Stats - Below the two columns */}
          <div className="mt-16">

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 max-w-6xl mx-auto">
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
                    <div className={`mb-2 text-3xl font-bold text-${stat.color} md:text-4xl`}>{stat.value}</div>
                    <div className="text-sm font-medium text-muted-foreground">{stat.label}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}