// Fixed, fictional examples. This chapter keeps no state beyond the current page.
export const REGISTRY = {
  zh: {
    no: "17",
    title: "做好了，有人在用嗎？",
    opening: [
      "示範公司做了幾個小工具。",
      "過了一段時間，大家還是回到原本的做法。",
      "工具未必不好；只是負責人、資料來源或回頭檢視的安排，可能還沒說清楚。",
    ],
    demo: "示範／虛構情境",
    registerTitle: "示範公司的工具登記冊",
    registerNote: "這是一張團隊自己維護的表，不是特定軟體。",
    columns: ["工具名稱", "負責人", "能碰的系統", "資料來源", "回頭檢視", "目前狀態"],
    detailLabels: ["問題在哪裡", "可以怎麼補"],
    rows: [
      {
        id: "quote-summary", tool: "詢價摘要小工具", owner: "業務同事", systems: "產品資料庫・唯讀", source: "目前使用的產品資料表", review: "資料來源更新時回看", status: "健康",
        issue: "負責人、系統範圍和資料來源都寫清楚，也安排了回看時機。",
        fix: "維持現有記錄；來源或用途改變時，再確認這些欄位仍合用。",
      },
      {
        id: "quote-draft", tool: "報價草稿助手", owner: "", systems: "產品資料庫・唯讀", source: "產品資料表", review: "尚未安排", status: "待補負責人",
        issue: "沒有人接手維護，遇到內容過期或出錯時，使用者不知道找誰。",
        fix: "先指定願意照看它的負責人，並約好何時回來檢查。",
      },
      {
        id: "customer-followup", tool: "客戶跟進整理", owner: "客服同事", systems: "客戶紀錄・可寫入", source: "客戶紀錄", review: "流程變更時回看", status: "權限偏寬",
        issue: "這個整理任務只需要讀取，現在卻開了寫入權限。",
        fix: "先收回不需要的寫入權限；若日後確實要更新資料，再另設確認和紀錄。",
      },
      {
        id: "product-lookup", tool: "產品資料查詢", owner: "產品資料管理的同事", systems: "產品資料庫・唯讀", source: "來源不清或內容已過期", review: "尚未安排", status: "來源待確認",
        issue: "看不出資料從哪裡來，也不知道內容是否仍有效。",
        fix: "標明使用的資料表與維護人；來源或內容更新時回頭核對。",
      },
      {
        id: "weekly-brief", tool: "週報產生器", owner: "部門助理", systems: "內部資料・唯讀", source: "部門週報資料夾", review: "很久沒回看", status: "待決定去留",
        issue: "很久沒有人使用，也還沒有人決定要保留或收起來。",
        fix: "問清楚是否還有人需要；若沒有，就記下停止維護的決定與原因。",
      },
    ],
    questionsTitle: "不用先追數字，可以先問",
    questions: ["這個月誰用過？", "哪一步讓人停下來？", "沒人負責的工具，要留還是要下架？"],
    failuresTitle: "出錯也要留下紀錄",
    failuresText: "出錯的案例寫在登記冊旁，和順利完成的案例一樣值得回看。對照第 10 章的「怎麼錯」和第 16 章寫下的判斷，才知道該補哪個缺口。",
    c10Link: "回看「怎麼錯」",
    c16Link: "回看「把判斷寫下來」",
    closingTitle: "第二部，到這裡收尾",
    closing: [
      "第 13 章先看權限該開到哪裡。",
      "第 14 章看什麼時候輪到 agent，第 15 章看一句話怎麼變成工具。",
      "第 16 章把判斷寫下來；這一章再問，誰負責、誰回頭看。",
      "這些是我現在的看法，AI 變得很快；下面是我最近看到的。",
    ],
    bridge: "判斷寫下來了，工具包也準備好；還有最後一個問題：做好了，有人在用嗎？",
    rail: "工具有人用嗎？",
  },
  en: {
    no: "17",
    title: "Built is not the same as used",
    opening: [
      "A fictional company built several small tools.",
      "After a while, people went back to their old ways of working.",
      "The tools may be fine; ownership, data sources or a review plan may simply be unclear.",
    ],
    demo: "Illustration / fictional scenario",
    registerTitle: "A fictional tool register",
    registerNote: "A team-maintained table, not a dedicated software product.",
    columns: ["Tool", "Owner", "Systems it can access", "Data source", "Review", "Current status"],
    detailLabels: ["What needs attention", "One way to address it"],
    rows: [
      {
        id: "quote-summary", tool: "Enquiry summary helper", owner: "A sales colleague", systems: "Product database · read-only", source: "Current product table", review: "Revisit when the source changes", status: "Healthy",
        issue: "The owner, system scope and source are clear, with a review point in place.",
        fix: "Keep the record current; check these fields again when the source or purpose changes.",
      },
      {
        id: "quote-draft", tool: "Quote draft helper", owner: "", systems: "Product database · read-only", source: "Product table", review: "Not arranged", status: "Owner needed",
        issue: "No one is responsible for upkeep, so users may not know whom to tell when content is stale or something goes wrong.",
        fix: "Name someone willing to look after it and agree when to review it.",
      },
      {
        id: "customer-followup", tool: "Customer follow-up organiser", owner: "A customer-service colleague", systems: "Customer records · write access", source: "Customer records", review: "Revisit when the process changes", status: "Access is too broad",
        issue: "This organising task only needs read access, but write access is enabled.",
        fix: "Remove write access that is not needed. If updates are needed later, add human review and a record.",
      },
      {
        id: "product-lookup", tool: "Product lookup", owner: "A colleague who manages product data", systems: "Product database · read-only", source: "Unclear source or outdated content", review: "Not arranged", status: "Source needs checking",
        issue: "It is unclear where the information came from or whether it is still current.",
        fix: "Name the source table and its maintainer; revisit it when the source or content changes.",
      },
      {
        id: "weekly-brief", tool: "Weekly brief maker", owner: "A department assistant", systems: "Internal data · read-only", source: "Department brief folder", review: "Not revisited recently", status: "Keep or retire?",
        issue: "It has not been used for a while, and no one has decided whether to keep it.",
        fix: "Find out whether anyone still needs it. If not, record the decision to retire it and why.",
      },
    ],
    questionsTitle: "Start with everyday questions, not a score",
    questions: ["Who used this this month?", "Where did someone get stuck?", "If no one owns it, should it stay or be retired?"],
    failuresTitle: "Keep the cases that went wrong, too",
    failuresText: "Record errors beside the register; they are just as useful to revisit as successful cases. Compare them with chapter 10 on mistakes and the judgment written down in chapter 16 to see which gap needs attention.",
    c10Link: "Revisit “How AI goes wrong”",
    c16Link: "Revisit “Write the judgment down”",
    closingTitle: "That brings Part II to a close",
    closing: [
      "Chapter 13 asks how much access to grant.",
      "Chapter 14 asks when an agent should take a turn; chapter 15 follows one instruction becoming a tool.",
      "Chapter 16 puts judgment into words; this chapter asks who owns the tool and comes back to review it.",
      "These are my current views, and AI changes quickly. Below are some things I have seen recently.",
    ],
    bridge: "The judgment is written down and the toolkit is ready. One last question: has anyone used it?",
    rail: "Is anyone using it?",
  },
};

const $ = (id) => document.getElementById(id);
const element = (tag, className, text) => {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
};
const openRows = new Set();

function buildSection() {
  const section = element("section", "chapter deeper registry");
  section.id = "c17";
  section.setAttribute("aria-labelledby", "registry-title");

  const number = element("p", "no", "17");
  const title = element("h2", null, ""); title.id = "registry-title";
  const opening = element("div", "registry-opening"); opening.id = "registry-opening";
  const demo = element("p", "demo", ""); demo.id = "registry-demo";

  const register = element("section", "registry-board"); register.setAttribute("aria-labelledby", "registry-board-title");
  const boardTitle = element("h3", null, ""); boardTitle.id = "registry-board-title";
  const boardNote = element("p", "sub registry-note", ""); boardNote.id = "registry-board-note";
  const table = document.createElement("table"); table.className = "registry-table";
  const caption = element("caption", "registry-sr-only", ""); caption.id = "registry-caption";
  const head = document.createElement("thead");
  const headRow = document.createElement("tr");
  const body = document.createElement("tbody"); body.id = "registry-rows";
  head.append(headRow); table.append(caption, head, body);
  register.append(boardTitle, boardNote, table);

  const questions = element("section", "registry-reading"); questions.setAttribute("aria-labelledby", "registry-questions-title");
  const questionsTitle = element("h3", null, ""); questionsTitle.id = "registry-questions-title";
  const questionList = document.createElement("ul"); questionList.id = "registry-questions";
  questions.append(questionsTitle, questionList);

  const failures = element("section", "registry-reading"); failures.setAttribute("aria-labelledby", "registry-failures-title");
  const failuresTitle = element("h3", null, ""); failuresTitle.id = "registry-failures-title";
  const failuresText = element("p", "sub", ""); failuresText.id = "registry-failures-text";
  const links = element("p", "registry-links"); links.id = "registry-links";
  failures.append(failuresTitle, failuresText, links);

  const closing = element("section", "registry-closing"); closing.setAttribute("aria-labelledby", "registry-closing-title");
  const closingTitle = element("h3", null, ""); closingTitle.id = "registry-closing-title";
  const closingBody = element("div", "registry-closing-body"); closingBody.id = "registry-closing-body";
  closing.append(closingTitle, closingBody);

  section.append(number, title, opening, demo, register, questions, failures, closing);
  return { section, headRow, body };
}

const built = typeof document === "undefined" ? null : buildSection();

function rowMarkup(row, x) {
  const item = document.createElement("tr");
  item.className = "registry-item";
  item.id = `registry-item-${row.id}`;
  const toolCell = document.createElement("td");
  toolCell.dataset.label = x.columns[0];
  const toggle = element("button", "registry-toggle", row.tool);
  toggle.type = "button";
  toggle.id = `registry-toggle-${row.id}`;
  toggle.setAttribute("aria-controls", `registry-detail-${row.id}`);
  toggle.setAttribute("aria-expanded", String(openRows.has(row.id)));
  toggle.addEventListener("click", () => {
    if (openRows.has(row.id)) openRows.delete(row.id); else openRows.add(row.id);
    render();
    $(`registry-toggle-${row.id}`)?.focus();
  });
  toolCell.append(toggle);
  const cells = [row.owner, row.systems, row.source, row.review, row.status];
  const rowNode = [toolCell, ...cells.map((value, index) => {
    const cell = document.createElement("td");
    cell.dataset.label = x.columns[index + 1];
    if (index === cells.length - 1) {
      const status = element("span", `registry-status${row.id === "quote-summary" ? " is-healthy" : ""}`, value);
      cell.append(status);
    } else cell.textContent = value;
    return cell;
  })];
  rowNode.forEach((cell) => item.append(cell));

  const detailRow = document.createElement("tr");
  detailRow.className = "registry-detail-row";
  detailRow.hidden = !openRows.has(row.id);
  const detailCell = document.createElement("td"); detailCell.colSpan = x.columns.length;
  const panel = element("div", "registry-detail"); panel.id = `registry-detail-${row.id}`;
  const issue = element("p", null, "");
  issue.append(element("strong", null, `${x.detailLabels[0]}：`), document.createTextNode(row.issue));
  const fix = element("p", null, "");
  fix.append(element("strong", null, `${x.detailLabels[1]}：`), document.createTextNode(row.fix));
  panel.append(issue, fix);
  detailCell.append(panel); detailRow.append(detailCell);
  return [item, detailRow];
}

function render() {
  const lang = document.documentElement.lang.startsWith("en") ? "en" : "zh";
  const x = REGISTRY[lang];
  const { section, headRow, body } = built;
  if (!section.isConnected) {
    const latest = $("latest");
    if (latest) latest.before(section); else $("main")?.append(section);
  }
  $("registry-title").textContent = x.title;
  $("registry-opening").replaceChildren(...x.opening.map((text) => element("p", "sub", text)));
  $("registry-demo").textContent = x.demo;
  $("registry-board-title").textContent = x.registerTitle;
  $("registry-board-note").textContent = x.registerNote;
  $("registry-caption").textContent = x.registerTitle;
  headRow.replaceChildren(...x.columns.map((text) => element("th", null, text)));
  body.replaceChildren(...x.rows.flatMap((row) => rowMarkup(row, x)));
  $("registry-questions-title").textContent = x.questionsTitle;
  $("registry-questions").replaceChildren(...x.questions.map((text) => element("li", null, text)));
  $("registry-failures-title").textContent = x.failuresTitle;
  $("registry-failures-text").textContent = x.failuresText;
  const link10 = element("a", null, x.c10Link); link10.href = "#c10";
  const link16 = element("a", null, x.c16Link); link16.href = "#c16";
  $("registry-links").replaceChildren(link10, document.createTextNode(" · "), link16);
  $("registry-closing-title").textContent = x.closingTitle;
  $("registry-closing-body").replaceChildren(...x.closing.map((text) => element("p", "sub", text)));

  const chapter16 = $("c16");
  if (chapter16) {
    let bridge = $("c16-to-c17");
    if (!bridge) { bridge = element("p", "sub chapter-bridge"); bridge.id = "c16-to-c17"; chapter16.append(bridge); }
    bridge.textContent = x.bridge;
  }
}

if (built) {
  render();
  new MutationObserver(render).observe(document.documentElement, { attributes: true, attributeFilter: ["lang"] });

  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) document.querySelectorAll(".rail-dot").forEach((link) => link.classList.toggle("on", link.dataset.target === "c17"));
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    observer.observe(built.section);
  }
}
