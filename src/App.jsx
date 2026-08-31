import { MotionConfig } from "motion/react";
import { LangProvider, useLang } from "./i18n.jsx";
import Nav from "./components/Nav.jsx";
import Hero from "./components/Hero.jsx";
import StartHere from "./components/StartHere.jsx";
import DealReadiness from "./components/DealReadiness.jsx";
import CommercialOutcomes from "./components/CommercialOutcomes.jsx";
import Works from "./components/Works.jsx";
import Verification from "./components/Verification.jsx";
import Methods from "./components/Methods.jsx";
import Capabilities from "./components/Capabilities.jsx";
import HowIWork from "./components/HowIWork.jsx";
import About from "./components/About.jsx";
import Contact from "./components/Contact.jsx";
import Footer from "./components/Footer.jsx";

function SkipLink() {
  const { t } = useLang();
  return (
    <a href="#main" className="skip-link">
      {t.nav.skipToContent}
    </a>
  );
}

export default function App() {
  return (
    <LangProvider>
      <MotionConfig reducedMotion="user">
        <SkipLink />
        <div className="min-h-[100dvh]">
          <Nav />
          <main id="main">
            <Hero />
            <StartHere />
            <DealReadiness />
            <CommercialOutcomes />
            <Works />
            <Verification />
            <Methods />
            <Capabilities />
            <HowIWork />
            <About />
            <Contact />
          </main>
          <Footer />
        </div>
      </MotionConfig>
    </LangProvider>
  );
}
