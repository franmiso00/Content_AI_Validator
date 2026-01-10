import { LandingHeader } from "@/components/landing/LandingHeader";
import { Hero } from "@/components/landing/Hero";
import { ProblemSection } from "@/components/landing/ProblemSection";
import { SolutionSection } from "@/components/landing/SolutionSection";
import { FeaturesGrid } from "@/components/landing/FeaturesGrid";
import { ForWhomSection } from "@/components/landing/ForWhomSection";
import { CTASection } from "@/components/landing/CTASection";

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      <LandingHeader />
      <main>
        <Hero />
        <ProblemSection />
        <SolutionSection />
        <FeaturesGrid />
        <ForWhomSection />
        <CTASection />
      </main>
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4 text-center">
          <p className="text-gray-400">
            © 2026 ContentValidator. Todos los derechos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
}
