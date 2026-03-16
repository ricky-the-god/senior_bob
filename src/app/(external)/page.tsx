import { CTAFooter, FeatureSection, Footer, Hero, HowItWorks, NavHeader, UseCases } from "@/components/landing";
import { AnimatedShaderBackground } from "@/components/ui/animated-shader-background";

export default function LandingPage() {
  return (
    <div className="relative min-h-screen bg-background text-foreground">
      <AnimatedShaderBackground />
      <NavHeader />
      <main>
        <Hero />
        <FeatureSection />
        <HowItWorks />
        <UseCases />
        <CTAFooter />
      </main>
      <Footer />
    </div>
  );
}
