"use client"

import { Button } from "@/components/ui/button"
import { ArrowRight, Trophy, Sparkles, Flame } from "lucide-react"
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
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [showSinButton, setShowSinButton] = useState(true)

  const scrollToSinCards = () => {
    // เริ่มเอฟเฟกต์ transition
    setIsTransitioning(true)
    
    // รอให้แอนิเมชันเล่นครึ่งหนึ่งแล้วค่อย scroll
    setTimeout(() => {
      const section = document.getElementById('sin-cards-section');
      if (section) {
        section.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
      
      // ปิดเอฟเฟกต์หลังจาก scroll เสร็จ
      setTimeout(() => {
        setIsTransitioning(false)
      }, 1000)
    }, 600)
  };

  // Character carousel effect
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % characters.length)
    }, 3000) // Change every 3 seconds

    return () => clearInterval(interval)
  }, [characters.length])

  // Scroll detection to hide/show sin button
  useEffect(() => {
    const handleScroll = () => {
      const sinCardsSection = document.getElementById('sin-cards-section');
      if (sinCardsSection) {
        const sinCardsSectionTop = sinCardsSection.getBoundingClientRect().top;
        const windowHeight = window.innerHeight;
        
        // ซ่อนปุ่มเมื่อ sin cards section เข้ามาในหน้าจอ (ประมาณ 20% ของหน้าจอ)
        if (sinCardsSectionTop < windowHeight * 0.8) {
          setShowSinButton(false);
        } else {
          setShowSinButton(true);
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    // เช็คตอน mount ด้วย
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      {/* Simple Hell Transition Overlay - เอาแค่เอฟเฟกต์เบลอและมืดลง */}
      {isTransitioning && (
        <div className="fixed inset-0 z-[9999] pointer-events-none">
          {/* Dark Overlay with Vortex */}
          <div className="absolute inset-0 bg-black/70 animate-fade-in backdrop-blur-md">
            <div className="absolute inset-0 bg-gradient-radial from-transparent via-orange-950/30 to-black/90 animate-pulse" />
          </div>

          {/* Fire Particles Rising from Bottom */}
          <div className="absolute inset-0 overflow-hidden">
            {[...Array(25)].map((_, i) => (
              <div
                key={i}
                className="absolute bottom-0 w-2 h-2 bg-gradient-to-t from-orange-500 via-red-500 to-transparent rounded-full animate-fire-rise opacity-70 blur-sm"
                style={{
                  left: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 0.5}s`,
                  animationDuration: `${1.5 + Math.random() * 2}s`,
                }}
              />
            ))}
          </div>

          {/* Screen Shake Effect */}
          <div className="absolute inset-0 animate-screen-shake">
            <div className="absolute inset-0 bg-gradient-to-t from-orange-900/10 via-transparent to-transparent" />
          </div>
        </div>
      )}

      <section className={`relative overflow-hidden py-16 md:py-24 max-w-full transition-all duration-500 ${isTransitioning ? 'blur-sm scale-95' : ''}`}>
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
                    className="group relative min-w-[200px] overflow-hidden rounded-xl border-2 border-border px-8 py-6 text-base font-bold transition-all hover:scale-105 hover:border-primary/50"
                    asChild
                  >
                    <Link href="/deck-lists" className="flex items-center justify-center gap-2">
                      <span className="relative z-10">Explore Decks</span>
                      <Sparkles className="relative z-10 h-5 w-5 transition-transform group-hover:rotate-12" />
                    </Link>
                  </Button>
                </div>
              </div>

              {/* Right Side - Character Showcase */}
              <div className="order-1 lg:order-2">
                <div className="flex items-center justify-center gap-2 md:gap-4 h-[380px] md:h-[430px] lg:h-[500px]">
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

        {/* บาป Button - Fixed Bottom Right - แสดง/ซ่อนตาม scroll position */}
        <div 
          className={`fixed bottom-8 right-8 z-50 transition-all duration-500 ${
            showSinButton && !isTransitioning 
              ? 'opacity-100 translate-y-0' 
              : 'opacity-0 translate-y-4 pointer-events-none'
          }`}
        >
          <button
            onClick={scrollToSinCards}
            disabled={isTransitioning}
            className="cursor-pointer transition-all duration-300 hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <img 
              src="/sin-button.gif" 
              alt="บาป"
              className="w-auto h-20 object-contain drop-shadow-2xl"
              style={{
                filter: 'drop-shadow(0 4px 12px rgba(0, 0, 0, 0.5))',
              }}
            />
          </button>
        </div>
      </section>
    </>
  )
}