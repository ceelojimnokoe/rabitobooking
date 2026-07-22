import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Hero } from "@/components/landing/hero";
import { ProcessSteps } from "@/components/landing/process-steps";
import { ServicesSection } from "@/components/landing/services-section";
import { ComingSoonSection } from "@/components/landing/coming-soon-section";

export default function Home() {
  return (
    <div className="flex min-h-full flex-1 flex-col">
      <SiteHeader />
      <main className="flex-1">
        <Hero />
        <ProcessSteps />
        <ServicesSection />
        <ComingSoonSection />
      </main>
      <SiteFooter />
    </div>
  );
}
