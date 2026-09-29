import { useEffect } from "react";
import Lenis from "lenis";
import Snap from "lenis/snap";
import "lenis/dist/lenis.css";

// Calm desktop reading: a fast mouse-wheel spin no longer flings the page to
// the bottom. Wheel input is damped and capped per event, and when a scroll
// comes to rest near a section or a work card, the page settles on it so each
// work can be read. Touch devices, small screens and reduced-motion users keep
// native scrolling untouched.

const NAV_HEIGHT = 76; // desktop sticky nav (md:h-[76px])
const SETTLE_GAP = 12; // breathing room between the nav and a settled item
const MAX_WHEEL_STEP = 120; // px per wheel event before smoothing
// A burst of wheel input may travel about one screen at full speed (≈1 screen/s sustained); beyond
// that, input within the window only crawls, so a hard flick cannot skip
// past several works. Budget frees up as the window slides.
const BURST_WINDOW_MS = 800;
const BURST_BUDGET_SCREENS = 0.9;
const OVER_BUDGET_FACTOR = 0.2;

// Items the page may settle on: major sections, the flagship card, and each
// row of work cards (cards in one grid row share a top, so they dedupe).
const SETTLE_TARGETS = "main > section, #works article[id], #works-catalog article[id], #library > div > div > details";

function settlePoints() {
  const tops = new Set();
  for (const el of document.querySelectorAll(SETTLE_TARGETS)) {
    if (!el.offsetParent && el.tagName !== "SECTION") continue; // inside a closed <details>
    const top = Math.round(el.getBoundingClientRect().top + window.scrollY - NAV_HEIGHT - SETTLE_GAP);
    if (top > 0) tops.add(top);
  }
  return [...tops];
}

let activeLenis = null;

// Scroll an element into place, through Lenis when it drives the page so the
// two never fight over the position (honours scroll-padding and scroll-margin).
export function scrollToElement(element) {
  if (activeLenis) activeLenis.scrollTo(element, { immediate: true, force: true });
  else element.scrollIntoView();
}

export function useCalmScroll() {
  useEffect(() => {
    const desktop = window.matchMedia("(hover: hover) and (pointer: fine) and (min-width: 1024px)");
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (!desktop.matches || reduced.matches) return undefined;

    let burst = []; // [timestamp, |deltaY|] of recent wheel input
    const lenis = new Lenis({
      autoRaf: true,
      lerp: 0.085,
      wheelMultiplier: 0.8,
      allowNestedScroll: true,
      // Anchor scrolls honour scroll-padding-top and scroll-margin, like native.
      anchors: true,
      virtualScroll: (data) => {
        if (data.event.type !== "wheel") return true;
        let deltaY = Math.max(-MAX_WHEEL_STEP, Math.min(MAX_WHEEL_STEP, data.deltaY));
        const now = performance.now();
        burst = burst.filter(([time]) => now - time < BURST_WINDOW_MS);
        const used = burst.reduce((sum, [, distance]) => sum + distance, 0);
        if (used > window.innerHeight * BURST_BUDGET_SCREENS) deltaY *= OVER_BUDGET_FACTOR;
        burst.push([now, Math.abs(deltaY)]);
        data.deltaY = deltaY;
        return true;
      },
    });

    activeLenis = lenis;

    const snap = new Snap(lenis, {
      type: "proximity",
      distanceThreshold: "18%",
      debounce: 420,
      lerp: 0.09,
    });

    let removers = [];
    const refresh = () => {
      removers.forEach((remove) => remove());
      removers = settlePoints().map((value) => snap.add(value));
    };
    refresh();

    // Page height changes when panels open or images load: recompute points.
    let frame = 0;
    const scheduleRefresh = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        lenis.resize();
        refresh();
      });
    };
    const observer = new ResizeObserver(scheduleRefresh);
    observer.observe(document.body);
    document.addEventListener("toggle", scheduleRefresh, true);

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      document.removeEventListener("toggle", scheduleRefresh, true);
      removers.forEach((remove) => remove());
      snap.destroy();
      lenis.destroy();
      activeLenis = null;
    };
  }, []);
}
