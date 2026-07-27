import { LandingHeader } from './landing-header';
import { HeroSection } from './hero-section';
import { FeaturesSection } from './features-section';
import { TemplateShowcaseSection } from './template-showcase-section';
import { StatsSection } from './stats-section';
import { CTASection } from './cta-section';
import { LandingFooter } from './landing-footer';

export function LandingPage() {
  return (
    <div className="codenest-landing min-h-screen bg-[#070b0a] text-white">
      <LandingHeader />
      <main>
        <HeroSection />
        <FeaturesSection />
        <TemplateShowcaseSection />
        <div id="about">
          <StatsSection />
        </div>
        <CTASection />
      </main>
      <LandingFooter />
    </div>
  );
}
