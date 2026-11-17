// Full-screen "dock" for Rooms 01, 02 and 03 (Paul, 2026-11-17).
//
// Problem: in full screen the mood / view / "randomise" controls were one full-width strip with a dark gradient, about 110 px tall, stuck to the bottom edge. It hid the
// lower part of the room (the record player and its hint in Room 02, the models under the nook in Room 03) and dimmed everything behind it.
//
// DESKTOP (a window at least 769 px wide with a mouse): the strip is a compact, centred, slightly translucent plate only as wide as its buttons, and a small button
// beside it folds the whole thing away ("Hide controls") and brings it back ("Show controls"). The choice is remembered in this browser.
//
// PHONE (anything else, added 2026-11-17 after Paul found the strip covers the picture on a phone too): it rests in the background. Entering full screen shows only a
// small translucent tag at the bottom ("Controls"); a tap floats the strip up, and it settles back by itself a few seconds after the last tap on it, or as soon as the
// visitor taps the picture. Nothing is remembered: every full screen opens with the picture clear.
//
// Nothing here changes the 3D scene.
//
// Use: initImmersiveDock({ room: document.querySelector(".room"), controls: document.getElementById("immersiveControls") })

const STORAGE_KEY = "roomverse.dock.collapsed";
const DESKTOP = "(min-width: 769px) and (hover: hover) and (pointer: fine)";
const PHONE_SETTLE_MS = 6000; // how long the strip stays up on a phone after the last tap on it
const LABEL = {
  hide: { zh: "收起控制列", en: "Hide controls" },
  show: { zh: "展開控制列", en: "Show controls" },
  tag: { zh: "控制列", en: "Controls" },
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
@media not all and ${DESKTOP} {
  .room.is-immersive .immersive-controls { transform: none; opacity: 1; visibility: visible; transition: transform .24s ease, opacity .24s ease, visibility 0s; }
  .room.is-immersive.dock-collapsed .immersive-controls {
    transform: translateY(100%); opacity: 0; visibility: hidden; pointer-events: none;
    transition: transform .24s ease, opacity .24s ease, visibility 0s .24s;
  }
  .room.is-immersive .dock-toggle {
    display: block; position: absolute; z-index: 8; right: calc(8px + env(safe-area-inset-right)); bottom: calc(10px + env(safe-area-inset-bottom)); /* in the corner, so the hint bubble in the middle stays readable */
    min-height: 34px; padding: 6px 12px; border: 1px solid #fff8; border-radius: 999px; background: rgba(41, 53, 45, 0.72); color: #fff;
    -webkit-backdrop-filter: blur(4px); backdrop-filter: blur(4px); font: 700 12px system-ui, sans-serif; cursor: pointer; transition: bottom .24s ease, opacity .24s ease;
  }
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

  const desktop = window.matchMedia(DESKTOP);
  let collapsed = false, settleTimer = 0;
  const stored = () => { try { return localStorage.getItem(STORAGE_KEY) === "1"; } catch { return false; /* private window or blocked storage: start open */ } };
  const lang = () => ((document.documentElement.lang || "").toLowerCase().startsWith("zh") ? "zh" : "en");
  const place = () => { // sit just above the plate when it is open, at the bottom when it is folded away
    toggle.style.bottom = collapsed ? "" : `${Math.round(controls.offsetHeight + (desktop.matches ? 24 : 18))}px`;
  };
  const apply = () => {
    room.classList.toggle("dock-collapsed", collapsed);
    toggle.setAttribute("aria-expanded", String(!collapsed));
    toggle.setAttribute("aria-controls", controls.id || "immersiveControls");
    const words = desktop.matches ? LABEL[collapsed ? "show" : "hide"] : LABEL[collapsed ? "tag" : "hide"];
    toggle.textContent = (collapsed ? "▲ " : "▼ ") + words[lang()];
    place();
  };
  const settle = () => { clearTimeout(settleTimer); settleTimer = 0; }; // stop the phone countdown
  const arm = () => { // phone only: the strip settles back a few seconds after the last tap on it
    settle();
    if (desktop.matches || collapsed) return;
    settleTimer = setTimeout(() => { settleTimer = 0; if (!desktop.matches && !collapsed) { collapsed = true; apply(); } }, PHONE_SETTLE_MS);
  };
  const set = (value, { remember = false } = {}) => {
    collapsed = Boolean(value);
    if (remember && desktop.matches) { try { localStorage.setItem(STORAGE_KEY, collapsed ? "1" : "0"); } catch { /* not remembered, still works */ } }
    apply();
    if (collapsed) settle(); else arm();
  };

  toggle.addEventListener("click", () => set(!collapsed, { remember: true }));
  // Phone: a tap or scroll on the strip keeps it up a little longer; a tap on the picture sends it back.
  for (const type of ["pointerdown", "click", "scroll"]) controls.addEventListener(type, arm, { capture: true, passive: true });
  room.addEventListener("pointerdown", (event) => {
    if (desktop.matches || collapsed || controls.contains(event.target) || toggle.contains(event.target)) return;
    set(true);
  }, { capture: true, passive: true });

  // Phone: every full screen opens with the picture clear. Desktop: the remembered choice.
  const wasImmersive = { value: room.classList.contains("is-immersive") };
  new MutationObserver(() => {
    const now = room.classList.contains("is-immersive");
    if (now && !wasImmersive.value) set(desktop.matches ? stored() : true);
    if (!now) settle();
    wasImmersive.value = now;
  }).observe(room, { attributes: true, attributeFilter: ["class"] });
  desktop.addEventListener?.("change", () => set(desktop.matches ? stored() : true)); // a window resized across the line between phone and desktop

  if (window.ResizeObserver) new ResizeObserver(place).observe(controls);
  new MutationObserver(apply).observe(document.documentElement, { attributes: true, attributeFilter: ["lang"] }); // the page changed language
  collapsed = desktop.matches ? stored() : true;
  apply();
  return { toggle, isCollapsed: () => collapsed, setCollapsed: (value) => set(value) };
}
