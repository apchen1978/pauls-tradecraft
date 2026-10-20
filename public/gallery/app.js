import { COLLECTION, PIECES, validatePieces } from "./pieces.js";

validatePieces(PIECES);
const lang = new URLSearchParams(location.search).get("lang") === "en" ? "en" : "zh";
const copy = COLLECTION[lang];
const $ = (id) => document.getElementById(id);
document.documentElement.lang = lang === "en" ? "en" : "zh-Hant";
document.title = `${copy.title} · Paul’s Tradecraft`;
for (const [id, key] of Object.entries({ title: "title", subtitle: "subtitle", skip: "skip", hint: "hint", "pair-title": "pairTitle", "pair-note": "pairNote", "more-title": "moreTitle", "more-note": "moreNote", back: "back", close: "close", previous: "previous", next: "next", "made-label": "made" })) $(id).textContent = copy[key];
$("home").href = `/?lang=${lang}`;
$("home").ariaLabel = copy.home;
$("back").href = `/ai-lab/?lang=${lang}#spirit-end`;
document.querySelectorAll(".languages a").forEach((a) => {
  if (a.getAttribute("lang") === document.documentElement.lang) a.setAttribute("aria-current", "page");
  else a.removeAttribute("aria-current");
});

const dialog = $("viewer");
let selected = 0;
let trigger;
function showPainting(index) {
  selected = (index + PIECES.length) % PIECES.length;
  const piece = PIECES[selected];
  $("viewer-source").srcset = piece.imageSmall;
  const image = $("viewer-image");
  image.width = piece.width;
  image.height = piece.height;
  image.alt = piece.alt[lang];
  image.src = piece.image;
  $("viewer-art").className = `viewer-art frame-${piece.frame}`;
  $("viewer-title").textContent = piece.title[lang];
  $("viewer-caption").textContent = piece.caption[lang];
  $("viewer-made").textContent = piece.made[lang];
}
function openPainting(index, button) {
  trigger = button;
  showPainting(index);
  dialog.showModal();
  document.body.classList.add("viewing");
}
function makePainting(piece, index) {
  const article = document.createElement("article");
  article.className = "painting";
  article.dataset.piece = piece.id;
  const button = document.createElement("button");
  button.type = "button";
  button.className = `art-button frame-${piece.frame}`;
  button.setAttribute("aria-label", copy.open + piece.title[lang]);
  button.setAttribute("aria-haspopup", "dialog");
  const image = document.createElement("img");
  image.src = piece.thumbnail;
  image.width = piece.width;
  image.height = piece.height;
  image.alt = piece.alt[lang];
  image.loading = index < 2 ? "eager" : "lazy";
  image.decoding = "async";
  button.append(image);
  button.addEventListener("click", () => openPainting(index, button));
  const title = document.createElement("h3");
  title.textContent = piece.title[lang];
  const caption = document.createElement("p");
  caption.textContent = piece.caption[lang];
  article.append(button, title, caption);
  return article;
}
PIECES.forEach((piece, index) => {
  const slot = piece.id === "harbor-dusk" ? "solo" : index < 2 ? "harbours" : "collection";
  $(slot).append(makePainting(piece, index));
});
$("solo-section").hidden = false;
$("close").addEventListener("click", () => dialog.close());
$("previous").addEventListener("click", () => showPainting(selected - 1));
$("next").addEventListener("click", () => showPainting(selected + 1));
dialog.addEventListener("keydown", (event) => {
  if (event.key === "Tab") {
    const controls = [...dialog.querySelectorAll("button:not([disabled]), a[href]")];
    const first = controls[0];
    const last = controls[controls.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }
  if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
    event.preventDefault();
    showPainting(selected + (event.key === "ArrowRight" ? 1 : -1));
  }
});
dialog.addEventListener("close", () => {
  document.body.classList.remove("viewing");
  trigger?.focus({ preventScroll: true });
});
dialog.addEventListener("click", (event) => {
  if (event.target !== dialog) return;
  const bounds = dialog.getBoundingClientRect();
  if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) dialog.close();
});
