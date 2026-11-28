// Desktop full-screen "dock" for Rooms 01, 02 and 03 (Paul, 2026-11-17).
//
// Problem: in full screen on a desktop window the mood / view / "randomise" controls were one full-width strip with a dark gradient, about 110 px tall,
// stuck to the bottom edge. It hid the lower part of the room: the record player in Room 02, the models under the nook in Room 03, and it dimmed everything behind it.
//
// Fix, desktop only (a window at least 769 px wide with a mouse): the strip becomes a compact, centred, slightly translucent plate that is only as wide as its
// buttons, and a small button beside it folds the whole thing away ("Hide controls") and brings it back ("Show controls"). The choice is remembered in this browser.
// Phones and tablets (2026-11-20): keep the full-width strip, but get the same fold-away button, so the strip can be hidden to see the whole room. Nothing here changes the 3D scene.
//
// Use: initImmersiveDock({ room: document.querySelector(".room"), controls: document.getElementById("immersiveControls") })

const STORAGE_KEY = "roomverse.dock.collapsed";
const DESKTOP = "(min-width: 769px) and (hover: hover) and (pointer: fine)";
const LABEL = {
  hide: { zh: "收起控制列", en: "Hide controls" },
  show: { zh: "展開控制列", en: "Show controls" },
};

const CSS = `
.dock-toggle { display: none; }
@media ${DESKTOP} {
  .room.is-immersive .immersive-controls {
    left: 0; right: 0; bottom: 12px; width: max-content; max-width: calc(100vw - 24px); margin: 0 auto; /* centred without a transform, so a late change of width never slides */
    padding: 8px 10px; gap: 6px; border-radius: 20px;
    background: rgba(23, 32, 26, 0.62); backdrop-filter: blur(6px); -webkit-backdrop-filter: blur(6px);
    transform: none; opacity: 1; visibility: visible;
    transition: transform .22s ease, opacity .22s ease, visibility 0s;
  }
  .room.is-immersive.dock-collapsed .immersive-controls {
    transform: translateY(calc(100% + 24px)); opacity: 0; visibility: hidden; pointer-events: none;
    transition: transform .22s ease, opacity .22s ease, visibility 0s .22s;
  }
  .room.is-immersive .dock-toggle {
    display: block; position: absolute; z-index: 8; right: calc(12px + env(safe-area-inset-right)); bottom: 12px;
    min-height: 36px; padding: 6px 14px; border: 1px solid #fffa; border-radius: 999px; background: #29352de8; color: #fff;
    font: 700 13px system-ui, sans-serif; cursor: pointer; transition: bottom .22s ease;
  }
  .room.is-immersive .dock-toggle:focus-visible { outline: 3px solid #ffe2a8; outline-offset: 2px; }
}
/* Phones and tablets (Paul 2026-11-20: the bottom strip hid too much of Room 01 on a phone): the same fold-away button, a little bigger for a thumb; the strip slides out of the way and the choice is remembered. */
@media not all and (min-width: 769px) and (hover: hover) and (pointer: fine) {
  .room.is-immersive .immersive-controls { transition: transform .22s ease, opacity .22s ease, visibility 0s; }
  .room.is-immersive.dock-collapsed .immersive-controls {
    transform: translateY(calc(100% + 24px)); opacity: 0; visibility: hidden; pointer-events: none;
    transition: transform .22s ease, opacity .22s ease, visibility 0s .22s;
  }
  .room.is-immersive .dock-toggle {
    display: block; position: absolute; z-index: 8; right: calc(10px + env(safe-area-inset-right)); bottom: 12px;
    min-height: 40px; padding: 8px 14px; border: 1px solid #fffa; border-radius: 999px; background: #29352de8; color: #fff;
    font: 700 13px system-ui, sans-serif; cursor: pointer; transition: bottom .22s ease;
  }
  .room.is-immersive .dock-toggle:focus-visible { outline: 3px solid #ffe2a8; outline-offset: 2px; }
}
`;

export function initImmersiveDock({ room, controls }) {
  if (!room || !controls || room.querySelector(":scope > .dock-toggle")) return null;
  if (!document.getElementById("immersiveDockStyle")) {
    const style = document.createElement("style");
    style.id = "immersiveDockStyle";
    style.textContent = CSS;
    document.head.append(style);
  }
  const toggle = document.createElement("button");
  toggle.type = "button";
  toggle.className = "dock-toggle";
  room.append(toggle);

  let collapsed = false;
  try { collapsed = localStorage.getItem(STORAGE_KEY) === "1"; } catch { /* private window or blocked storage: start open */ }

  const label = () => (document.documentElement.lang || "").toLowerCase().startsWith("zh") ? "zh" : "en";
  const place = () => { // sit just above the plate when it is open, in the corner when it is folded away
    toggle.style.bottom = collapsed ? "12px" : `${Math.round(controls.offsetHeight + 24)}px`;
  };
  const apply = () => {
    room.classList.toggle("dock-collapsed", collapsed);
    toggle.setAttribute("aria-expanded", String(!collapsed));
    toggle.setAttribute("aria-controls", controls.id || "immersiveControls");
    toggle.textContent = (collapsed ? "▲ " : "▼ ") + LABEL[collapsed ? "show" : "hide"][label()];
    place();
  };
  toggle.addEventListener("click", () => {
    collapsed = !collapsed;
    try { localStorage.setItem(STORAGE_KEY, collapsed ? "1" : "0"); } catch { /* not remembered, still works */ }
    apply();
  });
  if (window.ResizeObserver) new ResizeObserver(place).observe(controls);
  new MutationObserver(apply).observe(document.documentElement, { attributes: true, attributeFilter: ["lang"] }); // the page changed language
  apply();
  return { toggle, isCollapsed: () => collapsed, setCollapsed: (value) => { collapsed = Boolean(value); apply(); } };
}
