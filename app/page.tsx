import { Header } from "@/components/header"
import { Hero } from "@/components/hero"
import { CharacterShowcase } from "@/components/character-showcase"
import { Features } from "@/components/features"
import { DeckShowcase } from "@/components/deck-showcase"
import { Footer } from "@/components/footer"

export default function Home() {
  return (
    <main className="min-h-screen">
      <Header />
      <Hero />
      <CharacterShowcase />
      <Features />
      <DeckShowcase />
      <Footer />
    </main>
  )
}
