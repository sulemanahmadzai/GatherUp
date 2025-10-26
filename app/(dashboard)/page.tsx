import HeroSection from "@/components/sections/HeroSection";
import FeaturesSection from "@/components/sections/FeaturesSection";
import AboutSection from "@/components/sections/AboutSection";
import TestimonialSection from "@/components/sections/TestimonialSection";
import StatsSection from "@/components/sections/StatsSection";
import ContactSection from "@/components/sections/ContactSection";
import Footer from "@/components/sections/Footer";

export default function HomePage() {
  return (
    <div className="bg-white">
      <HeroSection />
      <FeaturesSection />
      <AboutSection />
      <StatsSection />
      <TestimonialSection />
      <ContactSection />
      <Footer />
    </div>
  );
}
