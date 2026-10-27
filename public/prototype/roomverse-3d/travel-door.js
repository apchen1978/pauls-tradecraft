import { ROOMS } from "./rooms.js?v=2";

const COPY = {
  zh: { title: "要去哪？", close: "×", closeLabel: "關閉旅行選擇", go: "推開那扇門", action: "看看其他房間", button: "去別的房間 · Travel" },
  en: { title: "Where to?", close: "×", closeLabel: "Close room choices", go: "Step through the door", action: "Explore other rooms", button: "Travel to another room" },
};

export function listedDestinations(currentRoom) {
  return ROOMS.filter((room) => room.listed && room.id !== currentRoom);
}

export function travelUrl(destination, currentRoom, lang) {
  const url = new URL(destination.url, location.origin);
  url.searchParams.set("lang", lang === "en" ? "en" : "zh");
  url.searchParams.set("from", currentRoom);
  return url.href;
}

export function initTravelDoor({ currentRoom, getLang, onChoose, beforeOpen = () => {}, afterClose = () => {} }) {
  const copy = () => COPY[getLang() === "en" ? "en" : "zh"];
  const triggers = [...document.querySelectorAll("[data-travel-door-trigger]")];
  const dialog = document.createElement("dialog");
  dialog.className = "travel-door-dialog";
  dialog.dataset.currentRoom = currentRoom;
  dialog.setAttribute("aria-labelledby", "travelDoorTitle");
  dialog.innerHTML = `<div class="travel-door-head"><h2 id="travelDoorTitle"></h2><button class="travel-door-close" type="button"></button></div><div class="travel-door-list"></div>`;
  document.body.append(dialog);
  const title = dialog.querySelector("#travelDoorTitle");
  const close = dialog.querySelector(".travel-door-close");
  const list = dialog.querySelector(".travel-door-list");
  let returnFocus = null;

  function render() {
    const c = copy();
    title.textContent = c.title;
    close.textContent = c.close;
    close.setAttribute("aria-label", c.closeLabel);
    const lang = getLang() === "en" ? "en" : "zh";
    list.replaceChildren(...listedDestinations(currentRoom).map((destination) => {
      const card = document.createElement("article");
      card.className = "travel-door-card";
      const img = document.createElement("img");
      img.src = destination.cover.mobile;
      img.alt = destination.name[lang];
      img.loading = "lazy";
      const meta = document.createElement("div");
      meta.className = "travel-door-meta";
      const heading = document.createElement("h3");
      heading.textContent = destination.name[lang];
      const city = document.createElement("p");
      city.textContent = destination.city[lang];
      const action = document.createElement("button");
      action.type = "button";
      action.className = "travel-door-go";
      action.textContent = c.go;
      action.addEventListener("click", () => {
        const href = travelUrl(destination, currentRoom, lang);
        dialog.close();
        onChoose(destination, href);
      });
      meta.append(heading, city);
      card.append(img, meta, action);
      return card;
    }));
  }

  function open(trigger) {
    if (dialog.open) return;
    render();
    returnFocus = trigger instanceof HTMLElement ? trigger : document.activeElement;
    beforeOpen(trigger);
    dialog.showModal();
    close.focus({ preventScroll: true });
  }

  close.addEventListener("click", () => dialog.close());
  dialog.addEventListener("keydown", (event) => {
    if (event.key !== "Tab") return;
    const focusable = [...dialog.querySelectorAll("button:not([disabled]), a[href], [tabindex]:not([tabindex='-1'])")];
    const first = focusable[0], last = focusable.at(-1);
    if (!first || !last) return;
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  });
  dialog.addEventListener("click", (event) => { if (event.target === dialog) dialog.close(); });
  dialog.addEventListener("close", () => {
    afterClose(returnFocus);
    if (returnFocus instanceof HTMLElement && returnFocus.isConnected) returnFocus.focus({ preventScroll: true });
  });
  triggers.forEach((trigger) => {
    trigger.classList.add("travel-door-trigger");
    trigger.addEventListener("click", () => open(trigger));
  });
  return {
    open,
    refresh: render,
    destinations: () => listedDestinations(currentRoom),
    element: dialog,
  };
}
