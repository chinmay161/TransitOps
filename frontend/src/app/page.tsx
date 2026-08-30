import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import Workflow from "./components/Workflow";
import BusinessRules from "./components/BusinessRules";
import Modules from "./components/Modules";
import WhyTransitOps from "./components/WhyTransitOps";
import Footer from "./components/Footer";
import { AuthRedirect } from "@/components/auth/auth-redirect";

export default function LandingPage() {
  return (
    <>
      <AuthRedirect />
      <Navbar />
      <main>
        <Hero />
        <Workflow />
        <BusinessRules />
        <Modules />
        <WhyTransitOps />
      </main>
      <Footer />
    </>
  );
}
