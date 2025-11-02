import Image from "next/image"
import { Users, Sparkles } from "lucide-react"

export function CharacterShowcase() {
  const femaleCharacters = [
    { id: 1, name: "Character 1", image: "/character/1.png" },
    { id: 2, name: "Character 2", image: "/character/2.png" },
    { id: 3, name: "Character 3", image: "/character/3.png" },
  ]

  const maleCharacters = [
    { id: 11, name: "Character 11", image: "/character/11.png" },
    { id: 12, name: "Character 12", image: "/character/12.png" },
    { id: 13, name: "Character 13", image: "/character/13.png" },
  ]

  return (
    <section className="relative py-24 md:py-32 overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <div className="absolute left-0 top-1/4 h-96 w-96 animate-pulse rounded-full bg-accent/20 blur-3xl" />
        <div className="absolute right-0 bottom-1/4 h-96 w-96 animate-pulse rounded-full bg-primary/20 blur-3xl animation-delay-2000" />
      </div>

      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center mb-16">
          <div className="mb-6 inline-flex items-center justify-center gap-2 rounded-full border border-glow bg-card/50 px-6 py-3 text-sm font-medium text-foreground backdrop-blur-sm">
            <Sparkles className="h-4 w-4 text-primary" />
            <span>Meet Our Heroes</span>
          </div>
          <h2 className="mb-4 text-4xl font-bold tracking-tight md:text-5xl lg:text-6xl">
            <span className="bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
              Choose Your Champion
            </span>
          </h2>
          <p className="text-lg text-muted-foreground md:text-xl">
            Select from powerful heroes, each with unique abilities and playstyles
          </p>
        </div>

        {/* Female Characters */}
        <div className="mb-20">
          <div className="mb-8 flex items-center justify-center gap-3">
            <Users className="h-6 w-6 text-accent" />
            <h3 className="text-2xl font-bold md:text-3xl text-glow">Female Warriors</h3>
          </div>
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {femaleCharacters.map((character, index) => (
              <div
                key={character.id}
                className="group relative overflow-hidden rounded-3xl border border-border bg-card/30 backdrop-blur-sm transition-all hover:border-glow hover:card-glow"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-accent/10 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                <div className="relative aspect-[3/4] overflow-hidden">
                  <Image
                    src={character.image}
                    alt={character.name}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                    priority={index === 0}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent opacity-60" />
                </div>
                <div className="relative p-6">
                  <h4 className="text-xl font-bold mb-2">{character.name}</h4>
                  <div className="inline-flex items-center rounded-full bg-accent/20 px-3 py-1 text-xs font-medium text-accent">
                    <Sparkles className="mr-1 h-3 w-3" />
                    Hero
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Male Characters */}
        <div>
          <div className="mb-8 flex items-center justify-center gap-3">
            <Users className="h-6 w-6 text-primary" />
            <h3 className="text-2xl font-bold md:text-3xl text-glow">Male Champions</h3>
          </div>
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {maleCharacters.map((character, index) => (
              <div
                key={character.id}
                className="group relative overflow-hidden rounded-3xl border border-border bg-card/30 backdrop-blur-sm transition-all hover:border-glow hover:card-glow"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                <div className="relative aspect-[3/4] overflow-hidden">
                  <Image
                    src={character.image}
                    alt={character.name}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                    priority={index === 0}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent opacity-60" />
                </div>
                <div className="relative p-6">
                  <h4 className="text-xl font-bold mb-2">{character.name}</h4>
                  <div className="inline-flex items-center rounded-full bg-primary/20 px-3 py-1 text-xs font-medium text-primary">
                    <Sparkles className="mr-1 h-3 w-3" />
                    Hero
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
