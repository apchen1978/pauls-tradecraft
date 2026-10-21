import { ENQUIRY } from "./content.js";

const $ = (id) => document.getElementById(id);
const el = (tag, cls, text) => {
  const node = document.createElement(tag);
  if (cls) node.className = cls;
  if (text !== undefined) node.textContent = text;
  return node;
};
const ns = "http://www.w3.org/2000/svg";

const state = {
  lang: (() => {
    const q = new URLSearchParams(location.search).get("lang");
    if (q === "zh" || q === "en") return q;
    return (navigator.language || "").toLowerCase().startsWith("zh") ? "zh" : "en";
  })(),
  step: 0,
  approved: false,
  edited: false,
  editing: false,
  draft: "",
  showRisk: false,
};

const copy = () => ENQUIRY[state.lang];
const unlocked = () => state.approved || state.edited;
const currentDraft = () => (state.edited ? state.draft : copy().draftText);

function drawRoute() {
  const svg = $("route-svg");
  const count = copy().steps.length;
  const pts = Array.from({ length: count }, (_, i) => [28 + i * ((600 - 56) / (count - 1)), 18]);
  svg.replaceChildren();
  pts.forEach((point, index) => {
    if (!index) return;
    const line = document.createElementNS(ns, "line");
    line.setAttribute("x1", pts[index - 1][0]);
    line.setAttribute("y1", pts[index - 1][1]);
    line.setAttribute("x2", point[0]);
    line.setAttribute("y2", point[1]);
    if (index <= state.step) line.setAttribute("class", "on");
    svg.appendChild(line);
  });
  pts.forEach((point, index) => {
    const circle = document.createElementNS(ns, "circle");
    circle.setAttribute("cx", point[0]);
    circle.setAttribute("cy", point[1]);
    circle.setAttribute("r", index === state.step ? 7 : 4.5);
    if (index === state.step) circle.setAttribute("class", "now");
    else if (index < state.step) circle.setAttribute("class", "done");
    svg.appendChild(circle);
  });
}

function reviewStatus(x) {
  if (state.approved && state.edited) return x.bothStatus;
  if (state.approved) return x.approvedStatus;
  if (state.edited) return x.editedStatus;
  return "";
}

function renderBody(x, step) {
  const body = $("step-body");
  body.replaceChildren();
  if (step.id === "arrive") {
    const letter = el("article", "letter");
    letter.id = "letter";
    const meta = el("dl", "letter-meta");
    for (const [label, value] of [[x.email.fromLabel, x.email.from], [x.email.companyLabel, x.email.company], [x.email.subjectLabel, x.email.subject]]) {
      const row = el("div");
      row.append(el("dt", null, label), el("dd", null, value));
      meta.appendChild(row);
    }
    letter.appendChild(meta);
    x.email.paragraphs.forEach((paragraph) => letter.appendChild(el("p", null, paragraph)));
    const sign = el("p", "signoff");
    sign.append(document.createTextNode(x.email.signoff), el("span", null, x.email.role));
    letter.appendChild(sign);
    body.appendChild(letter);
    return;
  }
  if (step.id === "summary") {
    body.appendChild(el("h3", "block-title", x.summaryTitle));
    const facts = el("div", "facts");
    x.fields.forEach((field) => {
      const row = el("div", "fact");
      row.dataset.field = field.id;
      row.append(el("dt", null, field.label), el("dd", null, field.value));
      facts.appendChild(row);
    });
    body.appendChild(facts);
    return;
  }
  if (step.id === "draft") {
    body.appendChild(el("h3", "block-title", x.questionsTitle));
    const questions = el("ol", "questions");
    x.questions.forEach((question) => questions.appendChild(el("li", null, question)));
    body.append(questions, el("h3", "block-title", x.quoteTitle), el("p", "quote-note", x.quoteNote));
    const quote = el("div", "quote");
    quote.id = "quote";
    x.quoteLines.forEach((line) => {
      const row = el("div", "quote-line");
      row.append(el("strong", null, line.label), el("span", "quote-value", line.value), el("span", "tag", line.tag));
      quote.appendChild(row);
    });
    body.appendChild(quote);
    return;
  }
  if (step.id === "review") {
    const notSent = el("p", "not-sent", x.notSent);
    notSent.id = "not-sent";
    if (!unlocked() || state.editing) body.appendChild(el("p", "review-lead", x.reviewLead));
    body.appendChild(notSent);
    body.appendChild(el("h3", "block-title", x.draftLabel));
    if (state.editing) {
      const area = el("textarea");
      area.id = "draft";
      area.value = state.edited ? state.draft : x.draftText;
      body.appendChild(area);
      const keep = el("button", "ghost", x.keepEdit);
      keep.type = "button";
      keep.id = "keep-edit";
      keep.addEventListener("click", () => {
        state.draft = area.value;
        state.edited = true;
        state.editing = false;
        render();
      });
      body.appendChild(keep);
    } else {
      const preview = el("pre", "draft", currentDraft());
      preview.id = "draft-preview";
      body.appendChild(preview);
    }
    const actions = el("div", "review-actions");
    const approve = el("button", "primary", x.approve);
    approve.type = "button";
    approve.id = "approve";
    approve.addEventListener("click", () => { state.approved = true; state.editing = false; render(); });
    const edit = el("button", "ghost", x.edit);
    edit.type = "button";
    edit.id = "edit";
    edit.addEventListener("click", () => { state.editing = true; render(); });
    actions.append(approve, edit);
    body.appendChild(actions);
    const status = reviewStatus(x);
    if (status) {
      const note = el("p", "review-status", status);
      note.id = "review-status";
      note.setAttribute("role", "status");
      body.appendChild(note);
    }
    return;
  }
  if (step.id === "follow") {
    body.appendChild(el("p", "follow-intro", x.followIntro));
    x.follow.forEach((note) => {
      const card = el("article", "follow");
      card.dataset.day = note.dayMark;
      const sep = state.lang === "zh" ? "：" : ": ";
      card.append(el("h3", null, note.day), el("p", "subject", `${note.subjectLabel}${sep}${note.subject}`), el("p", null, note.body));
      body.appendChild(card);
    });
    return;
  }
  const columns = el("div", "compare");
  const human = el("div", "panel human");
  human.appendChild(el("h3", null, x.humanTitle));
  const humanList = el("ul");
  humanList.id = "human-did";
  const humanLines = [x.humanRead];
  if (state.edited) humanLines.push(x.humanEdit);
  if (state.approved) humanLines.push(x.humanApprove);
  humanLines.push(x.humanSend, x.humanFollow);
  humanLines.forEach((line) => humanList.appendChild(el("li", null, line)));
  human.appendChild(humanList);
  const ai = el("div", "panel agent");
  ai.appendChild(el("h3", null, x.aiTitle));
  const aiList = el("ul");
  aiList.id = "ai-did";
  x.aiDid.forEach((line) => aiList.appendChild(el("li", null, line)));
  ai.appendChild(aiList);
  columns.append(human, ai);
  body.appendChild(columns);
}

function render() {
  const x = copy();
  const step = x.steps[state.step];
  document.documentElement.lang = x.htmlLang;
  document.title = x.docTitle;
  $("skip").textContent = x.skip;
  $("home").href = `/ai-lab/?lang=${state.lang}`;
  $("home").setAttribute("aria-label", x.home);
  document.querySelectorAll("#lang-group button").forEach((button) => {
    button.setAttribute("aria-pressed", String(button.dataset.lang === state.lang));
  });
  $("kicker").textContent = x.kicker;
  $("badge").textContent = x.badge;
  $("title").textContent = x.title;
  $("lead").textContent = x.lead;
  $("fiction").textContent = x.fiction;
  $("stepper-label").textContent = x.stepsLabel;
  $("stepper").replaceChildren(...x.steps.map((item, index) => {
    const li = el("li");
    const button = el("button", null, item.name);
    button.type = "button";
    button.disabled = index > 3 && !unlocked();
    if (index === state.step) button.setAttribute("aria-current", "step");
    button.addEventListener("click", () => {
      if (button.disabled) return;
      state.step = index;
      render();
    });
    li.appendChild(button);
    return li;
  }));
  $("panel").dataset.step = step.id;
  $("step-title").textContent = step.heading;
  $("why").textContent = step.why;
  renderBody(x, step);
  const onReview = step.id === "review";
  const blocked = onReview && (state.editing || !unlocked());
  $("back").textContent = x.prev;
  $("back").disabled = state.step === 0;
  $("next").textContent = x.next;
  $("next").disabled = blocked || state.step === x.steps.length - 1;
  $("gate").hidden = !blocked;
  $("gate").textContent = x.gate;
  $("no-review").textContent = state.showRisk ? x.toggleBack : x.toggle;
  $("no-review").setAttribute("aria-pressed", String(state.showRisk));
  $("risk").hidden = !state.showRisk;
  $("risk-lead").textContent = x.riskLead;
  $("risk-list").replaceChildren(...x.risks.map((risk) => el("li", null, risk)));
  $("risk-note").textContent = x.riskNote;
  $("back-link").textContent = x.back;
  $("back-link").href = `/ai-lab/?lang=${state.lang}#c3`;
  $("footer").textContent = x.footer;
  drawRoute();
}

document.querySelectorAll("#lang-group button").forEach((button) => {
  button.addEventListener("click", () => {
    state.lang = button.dataset.lang;
    const url = new URL(location.href);
    url.searchParams.set("lang", state.lang);
    history.replaceState(null, "", url);
    render();
  });
});
$("back").addEventListener("click", () => { if (state.step > 0) { state.step -= 1; render(); } });
$("next").addEventListener("click", () => {
  const x = copy();
  const blocked = x.steps[state.step].id === "review" && (state.editing || !unlocked());
  if (blocked || state.step >= x.steps.length - 1) return;
  state.step += 1;
  render();
});
$("no-review").addEventListener("click", () => { state.showRisk = !state.showRisk; render(); });

render();
