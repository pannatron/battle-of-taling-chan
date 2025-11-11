import { Header } from "@/components/header"
import { Hero } from "@/components/hero"
import { Footer } from "@/components/footer"
import { SinCardsMain } from '@/components/sin-cards-main';

export default function Home() {
  return (
    <main className="min-h-screen">
      <Header />
      <Hero />
      <SinCardsMain /> {/* เพิ่มตรงนี้ */}
      <Footer />
    </main>
  );
}
