import { useEffect } from "react";
import { MotionConfig } from "motion/react";
import { LangProvider, useLang } from "./i18n.jsx";
import { scrollToElement, useCalmScroll } from "./calmScroll.js";
import Nav from "./components/Nav.jsx";
import Hero from "./components/Hero.jsx";
import ThreeQuestions from "./components/ThreeQuestions.jsx";
import OneDeal from "./components/OneDeal.jsx";
import HumanAiEditorial from "./components/HumanAiEditorial.jsx";
import { WorksFlagship, default as Works } from "./components/Works.jsx";
import DealReadiness from "./components/DealReadiness.jsx";
import Capabilities from "./components/Capabilities.jsx";
import Library from "./components/Library.jsx";
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

// Open every collapsed <details> that wraps an in-page anchor target, so links
// into the library or the collapsed works catalog land on visible content.
function revealHash(hash) {
  if (!hash || hash.length < 2) return null;
  const target = document.getElementById(decodeURIComponent(hash.slice(1)));
  if (!target) return null;
  for (let el = target.parentElement; el; el = el.parentElement) {
    if (el.tagName === "DETAILS" && !el.open) el.open = true;
  }
  if (target.tagName === "DETAILS" && !target.open) target.open = true;
  return target;
}

function useHashReveal() {
  useEffect(() => {
    const onClick = (event) => {
      const link = event.target.closest?.('a[href^="#"]');
      if (link) revealHash(link.getAttribute("href"));
    };
    const onHashChange = () => revealHash(window.location.hash);
    document.addEventListener("click", onClick, true);
    window.addEventListener("hashchange", onHashChange);
    // A target inside a just-opened panel can move as fonts and images above it
    // load, so re-align once the page has settled.
    const initial = revealHash(window.location.hash);
    if (initial) {
      const align = () => scrollToElement(initial);
      requestAnimationFrame(align);
      if (document.readyState !== "complete") window.addEventListener("load", align, { once: true });
      document.fonts?.ready.then(align);
      setTimeout(align, 1200);
    }
    return () => {
      document.removeEventListener("click", onClick, true);
      window.removeEventListener("hashchange", onHashChange);
    };
  }, []);
}

export default function App() {
  useHashReveal();
  useCalmScroll();
  return (
    <LangProvider>
      <MotionConfig reducedMotion="user">
        <SkipLink />
        <div className="min-h-[100dvh]">
          <Nav />
          <main id="main">
            <Hero />
            <ThreeQuestions />
            <OneDeal />
            <WorksFlagship />
            <HumanAiEditorial />
            <Works />
            <Capabilities />
            <DealReadiness />
            <Library />
            <About />
            <Contact />
          </main>
          <Footer />
        </div>
      </MotionConfig>
    </LangProvider>
  );
}
