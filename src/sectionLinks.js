import { scrollToElement } from "./calmScroll.js";

// The Garage section hides most experiments in a <details>; open it before scrolling
// so anchor links land on visible content.
export function openGarageThenScroll() {
  const moreExperiments = document.getElementById("garage-more");
  if (moreExperiments) moreExperiments.open = true;
  requestAnimationFrame(() => {
    const garage = document.getElementById("garage");
    if (garage) scrollToElement(garage);
  });
}
