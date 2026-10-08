// gsap only drives two below-the-fold fades, so it is not part of the main bundle.
// It is requested once the page has finished loading (so it never competes with the
// hero image or the main script) and every caller shares the same promise.
// Until it arrives, those sections simply show their normal, visible state.
let loading = null;

export function loadGsap() {
  if (!loading) {
    loading = new Promise((resolve, reject) => {
      const start = () => import("gsap").then((module) => module.gsap).then(resolve, reject);
      if (document.readyState === "complete") start();
      else window.addEventListener("load", start, { once: true });
    });
  }
  return loading;
}
