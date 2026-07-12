import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import TrustedBy from "./components/TrustedBy";
import Features from "./components/Features";
import Workflow from "./components/Workflow";
import Stats from "./components/Stats";
import BusinessRules from "./components/BusinessRules";
import Modules from "./components/Modules";
import WhyTransitOps from "./components/WhyTransitOps";
import CTA from "./components/CTA";
import Footer from "./components/Footer";

export default function LandingPage() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <TrustedBy />
        <Features />
        <Workflow />
        <Stats />
        <BusinessRules />
        <Modules />
        <WhyTransitOps />
        <CTA />
      </main>
      <Footer />
    </>
  );
}
