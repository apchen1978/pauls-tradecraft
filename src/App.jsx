import { lazy, Suspense, useCallback, useEffect, useState } from "react";
import { MotionConfig } from "motion/react";
import { LangProvider, useLang } from "./i18n.jsx";
import { scrollToElement, useCalmScroll } from "./calmScroll.js";
import Nav from "./components/Nav.jsx";
import Hero from "./components/Hero.jsx";
import Footer from "./components/Footer.jsx";

const BelowFold = lazy(() => import("./BelowFold.jsx"));

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

function useHashReveal(belowReady) {
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
    // Sections below the hero load as a separate chunk, so wait for them
    // before looking for the target.
    const initial = belowReady ? revealHash(window.location.hash) : null;
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
  }, [belowReady]);
}

export default function App() {
  const [belowReady, setBelowReady] = useState(false);
  const onBelowReady = useCallback(() => setBelowReady(true), []);
  useHashReveal(belowReady);
  useCalmScroll();
  return (
    <LangProvider>
      <MotionConfig reducedMotion="user">
        <SkipLink />
        <div className="min-h-[100dvh]">
          <Nav />
          <main id="main">
            <Hero />
            <Suspense fallback={<div className="min-h-[100dvh]" aria-hidden="true" />}>
              <BelowFold onReady={onBelowReady} />
            </Suspense>
          </main>
          <Footer />
        </div>
      </MotionConfig>
    </LangProvider>
  );
}
