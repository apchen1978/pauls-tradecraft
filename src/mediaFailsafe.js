import { useEffect } from "react";

// iOS Safari (and the LINE / Facebook WKWebView) intermittently never starts a
// request for <img loading="lazy">, especially inside overflow:hidden rounded
// cards and after a closed <details> opens. There is no console error: the
// element stays complete=false, naturalWidth=0, and the card looks empty.
// Desktop browsers and Playwright's Linux WebKit do not reproduce it.
// This watcher uses real layout boxes, not the browser's lazy-load observer,
// and forces a fetch once a cover is near the viewport. Reveal animations that
// stay at opacity 0 while on screen are opened after a short wait so a missed
// IntersectionObserver cannot leave a loaded image invisible.

const NEAR_PX = 640;
const STUCK_MS = 1500;
const RESTART_MS = 2500;

function closedDetails(img) {
  let el = img.parentElement;
  while (el) {
    if (el.tagName === "DETAILS" && !el.open) return el;
    el = el.parentElement;
  }
  return null;
}

function intersects(el, margin) {
  const rect = el.getBoundingClientRect();
  if (rect.width < 2 || rect.height < 2) return false;
  return rect.bottom > -margin && rect.top < window.innerHeight + margin;
}

function wake(img) {
  if (img.complete && img.naturalWidth > 0) return;
  const src = img.getAttribute("src");
  if (!src) return;
  img.loading = "eager";
  if (img.dataset.wakeSrc !== src) {
    img.dataset.wakeSrc = src;
    img.dataset.wakeAt = String(performance.now());
    img.dataset.wakeRestart = "";
    img.decode?.().catch(() => {});
    return;
  }
  const waited = performance.now() - Number(img.dataset.wakeAt || 0);
  if (waited > RESTART_MS && img.dataset.wakeRestart !== src) {
    img.dataset.wakeRestart = src;
    // Reassigning the same URL restarts a lazy load WebKit had dropped.
    img.src = src;
    img.decode?.().catch(() => {});
  }
}

function scanImages() {
  for (const img of document.querySelectorAll("img")) {
    if (closedDetails(img)) continue;
    const host = img.closest("article, figure, a") || img;
    if (intersects(img, NEAR_PX) || (img.getBoundingClientRect().height < 2 && intersects(host, 0))) {
      wake(img);
    }
  }
}

function unstickReveals(now) {
  for (const el of document.querySelectorAll("main [style*='opacity']")) {
    if (!(el instanceof HTMLElement)) continue;
    if (el.closest(".decision-flow")) continue;
    const style = getComputedStyle(el);
    const hidden = Number(style.opacity) < 0.05 || style.visibility === "hidden";
    if (!hidden) {
      delete el.dataset.stuckAt;
      continue;
    }
    if (!intersects(el, 0)) continue;
    const since = Number(el.dataset.stuckAt || 0);
    if (!since) {
      el.dataset.stuckAt = String(now);
      continue;
    }
    if (now - since < STUCK_MS) continue;
    el.style.opacity = "1";
    el.style.visibility = "visible";
    delete el.dataset.stuckAt;
  }
}

export function useMediaFailsafe() {
  useEffect(() => {
    let frame = 0;
    const run = () => {
      scanImages();
      unstickReveals(performance.now());
    };
    const schedule = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(run);
    };
    const onToggle = (event) => {
      const details = event.target;
      if (!(details instanceof HTMLDetailsElement) || !details.open) return;
      for (const img of details.querySelectorAll("img")) wake(img);
      schedule();
    };
    const onPageShow = () => {
      for (const img of document.querySelectorAll("img")) {
        delete img.dataset.wakeSrc;
        delete img.dataset.wakeAt;
        delete img.dataset.wakeRestart;
      }
      schedule();
    };
    run();
    const interval = window.setInterval(run, 800);
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    window.addEventListener("pageshow", onPageShow);
    document.addEventListener("toggle", onToggle, true);
    return () => {
      cancelAnimationFrame(frame);
      window.clearInterval(interval);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      window.removeEventListener("pageshow", onPageShow);
      document.removeEventListener("toggle", onToggle, true);
    };
  }, []);
}
