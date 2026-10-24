const language = new URLSearchParams(location.search).get("lang") === "en" ? "en" : "zh";
const copy = document.querySelector(`[data-language="${language}"]`);
document.documentElement.lang = language === "zh" ? "zh-Hant" : "en";
document.querySelectorAll("[data-language]").forEach((article) => { article.hidden = article !== copy; });
document.querySelectorAll("[data-language-link]").forEach((link) => {
  link.setAttribute("aria-current", String(link.dataset.languageLink === language ? "page" : "false"));
});
document.querySelectorAll("[data-destination]").forEach((link) => {
  if (link.dataset.destination === "room") link.href = `/prototype/roomverse-3d/?lang=${language}`;
  if (link.dataset.destination === "lab") link.href = `/ai-lab/?lang=${language}#c12`;
});
document.querySelector("#brand-link").href = `/ai-lab/?lang=${language}#c12`;
document.querySelector("#skip-link").textContent = language === "zh" ? "跳至內容" : "Skip to content";
document.title = language === "zh" ? "這是怎麼做出來的：一個人與幾個 AI · AI Lab" : "How this was made: one person and a few AIs · AI Lab";
