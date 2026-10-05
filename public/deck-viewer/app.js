/* 簡報翻閱器 — Executive Capability Deck（9 頁） */
"use strict";
const TOTAL = 9;
let current = 1;

const img = document.getElementById("slideImg");
const counter = document.getElementById("counter");
const fill = document.getElementById("fill");
const prev = document.getElementById("prev");
const next = document.getElementById("next");

function show() {
  img.src = `page-${String(current).padStart(2, "0")}.png`;
  counter.textContent = `${current} / ${TOTAL}`;
  fill.style.width = `${(current / TOTAL) * 100}%`;
  prev.disabled = current <= 1;
  next.disabled = current >= TOTAL;
}

function go(delta) {
  const target = Math.min(TOTAL, Math.max(1, current + delta));
  if (target !== current) {
    current = target;
    show();
  }
}

prev.addEventListener("click", () => go(-1));
next.addEventListener("click", () => go(1));
document.addEventListener("keydown", (e) => {
  if (e.key === "ArrowLeft") go(-1);
  if (e.key === "ArrowRight") go(1);
  if (e.key === "Home") { current = 1; show(); }
  if (e.key === "End") { current = TOTAL; show(); }
});

/* 手機：點左右半邊翻頁；觸控滑動 */
const stage = document.getElementById("stage");
let touchX = null;
stage.addEventListener("click", (e) => {
  if (e.target.closest("button")) return;
  const rect = stage.getBoundingClientRect();
  if (e.clientX > rect.left + rect.width / 2) go(1);
  else go(-1);
});
stage.addEventListener("touchstart", (e) => { touchX = e.touches[0].clientX; }, { passive: true });
stage.addEventListener("touchend", (e) => {
  if (touchX === null) return;
  const dx = e.changedTouches[0].clientX - touchX;
  if (Math.abs(dx) > 40) go(dx < 0 ? 1 : -1);
  touchX = null;
}, { passive: true });

show();
