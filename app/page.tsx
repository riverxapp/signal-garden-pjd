import { Navbar } from "@/components/Navbar";
import { HeroSection } from "@/components/HeroSection";

export default function Home() {
  return (
    <div className="relative flex min-h-screen flex-col bg-background">
      <Navbar />
      <main className="flex flex-1 flex-col">
        <HeroSection />
      </main>
    </div>
  );
}
