import { COPY, LAB_TEXT, LINKS, ROLE_IDS, TIER_IDS } from "./content.js";
const $ = (id) => document.getElementById(id);
const queryLang = new URLSearchParams(location.search).get("lang");
const state = { lang: ["zh", "en"].includes(queryLang) ? queryLang : (navigator.language.startsWith("zh") ? "zh" : "en"), tier: null, rolesVisible: false, role: null, begun: false, delegated: false, selected: null, corrected: false };
const reduced = () => matchMedia("(prefers-reduced-motion: reduce)").matches;
const tierButtons = TIER_IDS.map((id) => {
  const button = document.createElement("button");
  button.type = "button"; button.className = "tier"; button.dataset.tier = id;
  button.append(document.createElement("strong"), document.createElement("span"));
  button.addEventListener("click", () => { state.tier = id; render(); });
  $("tiers").append(button); return button;
});
const roleButtons = ROLE_IDS.map((id) => {
  const button = document.createElement("button");
  button.type = "button"; button.className = "role-card"; button.dataset.role = id;
  button.setAttribute("aria-controls", "role-detail");
  const tags = document.createElement("span"); tags.className = "role-mini-tags"; tags.setAttribute("aria-hidden", "true");
  tags.append(document.createElement("span"), document.createElement("span"), document.createElement("span"));
  button.append(document.createElement("strong"), document.createElement("span"), tags);
  button.addEventListener("click", () => { state.role = id; render(); reveal($("role-detail")); });
  $("role-cards").append(button); return button;
});
const roleFields = Array.from({ length: 5 }, () => {
  const term = document.createElement("dt"), value = document.createElement("dd");
  $("role-fields").append(term, value); return { term, value };
});
const steps = Array.from({ length: 6 }, () => {
  const item = document.createElement("li");
  item.append(document.createElement("span"), document.createElement("strong"));
  $("steps").append(item); return item;
});
const facts = Array.from({ length: 3 }, () => { const item = document.createElement("li"); $("facts").append(item); return item; });
const claims = Array.from({ length: 3 }, (_, i) => {
  const button = document.createElement("button"); button.type = "button"; button.dataset.claim = String(i);
  button.addEventListener("click", () => { state.selected = i; render(); });
  $("claims").append(button); return button;
});
function render() {
  const t = COPY[state.lang], lab = LAB_TEXT[state.lang];
  document.documentElement.lang = state.lang === "zh" ? "zh-Hant" : "en";
  document.title = `${t.title.join(" ")} · Paul's Tradecraft`;
  document.querySelectorAll("[data-copy]").forEach((node) => { node.textContent = t[node.dataset.copy]; });
  $("title-a").textContent = t.title[0]; $("title-b").textContent = t.title[1];
  document.querySelectorAll("[data-lang]").forEach((button) => button.setAttribute("aria-pressed", String(button.dataset.lang === state.lang)));
  tierButtons.forEach((button, i) => {
    button.children[0].textContent = lab.c0.tiers[TIER_IDS[i]].name;
    button.children[1].textContent = t.counts[i];
    button.setAttribute("aria-pressed", String(state.tier === TIER_IDS[i]));
    button.title = lab.c0.tiers[TIER_IDS[i]].d;
  });
  $("tier-reply").textContent = state.tier ? (t.replies[state.tier] ?? lab.c0.tiers[state.tier].reply) : t.pick;
  $("begin").disabled = !state.tier;
  $("source-full").textContent = lab.c0.source;
  $("report").href = LINKS.decoder; $("original").href = LINKS.x;
  $("roles-stage").hidden = !state.rolesVisible;
  roleButtons.forEach((button, i) => {
    const role = t.roles[ROLE_IDS[i]];
    button.children[0].textContent = role.name;
    button.children[1].textContent = role.teaser;
    [t.agentTag, t.toolTag, t.humanTag].forEach((label, j) => { button.children[2].children[j].textContent = label; });
    button.setAttribute("aria-pressed", String(state.role === ROLE_IDS[i]));
    button.setAttribute("aria-expanded", String(state.role === ROLE_IDS[i]));
  });
  $("role-detail").hidden = !state.role;
  if (state.role) {
    const role = t.roles[state.role];
    $("role-name").textContent = role.name;
    roleFields.forEach(({ term, value }, i) => {
      term.textContent = t.roleFields[i]; value.textContent = role.fields[i];
    });
  }
  $("buyer-work").hidden = state.role !== "sales";
  $("buyer-work").href = `/?lang=${state.lang}#overseas-customer-development`;
  $("role-continue").textContent = state.role === "owner" ? t.roleContinueOwner : t.roleContinue;
  $("glossary-terms").replaceChildren(...t.glossary.flatMap(([word, explanation]) => {
    const term = document.createElement("dt"), value = document.createElement("dd");
    term.textContent = word; value.textContent = explanation; return [term, value];
  }));
  $("chat-reply").textContent = lab.c2.chatReply; $("chat-note").textContent = lab.c2.chatNote;
  $("activity").hidden = !state.begun; $("workbench").hidden = !state.delegated;
  $("delegate").setAttribute("aria-expanded", String(state.delegated));
  $("delegate").disabled = state.delegated;
  steps.forEach((node, i) => {
    node.children[0].textContent = t.stepActors[i];
    node.children[1].textContent = t.stepNames[i];
  });
  facts.forEach((node, i) => { node.textContent = t.facts[i]; });
  claims.forEach((button, i) => {
    button.textContent = i === 2 && state.corrected ? t.corrected : t.claims[i];
    button.classList.toggle("selected", state.selected === i);
    button.classList.toggle("fixed", i === 2 && state.corrected);
    button.setAttribute("aria-pressed", String(state.selected === i));
    button.disabled = state.corrected;
  });
  $("feedback").textContent = state.corrected ? t.correctedFeedback : state.selected === null ? "" : t.feedback[state.selected];
  $("correct").hidden = state.selected !== 2 || state.corrected;
  $("completion").hidden = !state.corrected;
  document.body.dataset.phase = state.corrected ? "complete" : state.delegated ? "review" : state.begun ? "chat" : "intro";
  $("lab").href = `/ai-lab/?lang=${state.lang}#c2`;
  $("back-home").href = `/?lang=${state.lang}#works`;
  for (const id of ["home", "footer-home"]) $(id).href = `/?lang=${state.lang}`;
}
function reveal(node) {
  node.scrollIntoView({ block: "start", behavior: reduced() ? "instant" : "smooth" });
  node.focus({ preventScroll: true });
}
document.querySelectorAll("[data-lang]").forEach((button) => button.addEventListener("click", () => {
  state.lang = button.dataset.lang;
  const url = new URL(location.href); url.searchParams.set("lang", state.lang); history.replaceState(null, "", url);
  render();
}));
$("begin").addEventListener("click", () => { state.rolesVisible = true; render(); reveal($("roles-stage")); });
$("role-continue").addEventListener("click", () => { state.begun = true; render(); reveal($("activity")); });
$("delegate").addEventListener("click", () => {
  state.delegated = true; render();
  $("workbench").scrollIntoView({ block: "start", behavior: reduced() ? "instant" : "smooth" });
  claims[0].focus({ preventScroll: true });
});
$("show-all").addEventListener("click", () => $("steps").classList.add("settled"));
$("correct").addEventListener("click", () => { state.corrected = true; render(); reveal($("completion")); });
$("restart").addEventListener("click", () => {
  state.rolesVisible = false; state.role = null; state.begun = false; state.delegated = false; state.selected = null; state.corrected = false;
  $("steps").classList.remove("settled"); render(); reveal($("begin"));
});
// Make the current language shareable, including when chosen from navigator.language.
const initialUrl = new URL(location.href); initialUrl.searchParams.set("lang", state.lang); history.replaceState(null, "", initialUrl);
render();
