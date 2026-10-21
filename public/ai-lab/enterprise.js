// Part II is an industry-neutral framework illustration. No live systems or APIs are used.
export const PART_TWO = {
  zh: {
    partKicker: "PART II · ENTERPRISE",
    partTitle: "第二部・企業篇",
    partIntro: [
      "第一部從 Paul 個人與小團隊的經驗出發；第二部把鏡頭拉遠，思考多個部門的企業如何安排 agent 權限。",
      "這是一套思考框架，不是任何一家公司的案例；第二部是延伸閱讀，想深入再往下讀，不看也不影響前面的內容。",
    ],
    no: "13",
    title: "給 agent 開權限：開多少才剛好？",
    lead: "替示範公司的 agent 選一項任務，再調整它能碰哪些系統。每次切換，都會立即看到任務能否完成、還缺什麼，或權限是否開得太寬。",
    demo: "示範／虛構情境",
    deskTitle: "權限台",
    deskLead: "先從唯讀開始。需要寫入或對外寄出時，讓負責人先確認。",
    systemHeading: "系統",
    systems: {
      products: "產品資料庫",
      crm: "客戶紀錄（CRM）",
      erp: "訂單與財務系統（ERP）",
      email: "對外信箱",
    },
    permissions: { read: "讀取", write: "寫入", send: "對外送出" },
    notApplicable: "不適用",
    emailNote: "信箱只設定「對外送出」；其他系統不提供寄信權限。",
    approval: "寫入核心系統或對外寄出前，需要負責人確認",
    taskLabel: "選一個任務",
    tasks: [
      { id: "products", name: "把產品資料整理給設計同事", hint: "只需查看產品資訊；不需改資料或寄信。" },
      { id: "reply", name: "草擬一封詢價回覆", hint: "詢價內容已提供；查閱產品資料後，只草擬、不寄出。" },
      { id: "followup", name: "更新一筆客戶的跟進狀態", hint: "先查看客戶紀錄；更新前由負責人確認。" },
    ],
    resultTitle: "目前設定下會發生什麼？",
    statuses: {
      safe: "做得到・風險低",
      broad: "做得到・權限偏寬",
      missing: "做不到・權限不足",
      risky: "做得到・風險高",
    },
    results: {
      products: "可以讀取產品資料，整理成設計同事可用的摘要；不會改動原始資料。",
      reply: "可以依詢價內容和產品資料草擬回覆；草稿留在這裡，不會寄出。",
      followup: "可以查看客戶紀錄；待負責人確認後，再更新跟進狀態並留下紀錄。",
    },
    missing: "要完成這項任務，還需要：",
    risks: {
      send: "對外送出權限已開，且沒有人工確認；未審閱的回覆可能直接寄出。",
      erp: "訂單與財務系統的寫入權限已開，且沒有人工確認；agent 可能改動核心紀錄。",
      write: "核心系統的寫入權限已開，且沒有人工確認；資料可能在未覆核前被改動。",
    },
    extra: "目前有不屬於這項任務的額外權限；可再收窄到剛好夠用。",
    revealTitle: "查看三項任務的「剛好夠用」設定",
    revealLead: "每項任務只保留完成它所需的權限；凡是寫入或寄出，都加上負責人確認。",
    justEnough: [
      { id: "products", name: "整理產品資料", access: "產品資料庫：讀取。其他寫入與寄出權限關閉。" },
      { id: "reply", name: "草擬詢價回覆", access: "產品資料庫：讀取。只產生草稿；信箱寄出權限關閉。" },
      { id: "followup", name: "更新跟進狀態", access: "客戶紀錄：讀取與寫入；更新前由負責人確認並留下紀錄。" },
    ],
    principlesTitle: "三條原則",
    principles: [
      "只開完成這項任務需要的權限。",
      "能唯讀就不要開寫入。",
      "寫入核心系統與對外送出，先由負責人確認並留下紀錄。",
    ],
  },
  en: {
    partKicker: "PART II · ENTERPRISE",
    partTitle: "Part II · The enterprise",
    partIntro: [
      "Part I draws on Paul's work with AI personally and in a small team. Part II steps back to consider how an enterprise with multiple departments might set agent access.",
      "This is a thinking framework, not a case study of any one company. Part II is optional further reading; the earlier chapters stand on their own.",
    ],
    no: "13",
    title: "Giving an agent access: how much is just enough?",
    lead: "Choose a task for an agent in a fictional company, then adjust which systems it can access. Each change shows whether the task can be done, what is missing, or whether access is too broad.",
    demo: "Illustration / fictional scenario",
    deskTitle: "Access desk",
    deskLead: "Start with read-only. When a task needs a write or an external send, ask the decision-maker to review first.",
    systemHeading: "System",
    systems: {
      products: "Product database",
      crm: "Customer records (CRM)",
      erp: "Orders and finance (ERP)",
      email: "External email",
    },
    permissions: { read: "Read", write: "Write", send: "Send externally" },
    notApplicable: "N/A",
    emailNote: "Only external sending is configurable for email; the other systems cannot send messages.",
    approval: "Require decision-maker approval before core-system writes or external sends",
    taskLabel: "Choose a task",
    tasks: [
      { id: "products", name: "Prepare product information for a design colleague", hint: "Needs product information only; no edits or email." },
      { id: "reply", name: "Draft a reply to an enquiry", hint: "The enquiry is provided; look up product information, then draft without sending." },
      { id: "followup", name: "Update a customer's follow-up status", hint: "Read the customer record; get approval before changing it." },
    ],
    resultTitle: "What happens with these settings?",
    statuses: {
      safe: "Can do · Lower risk",
      broad: "Can do · Access too broad",
      missing: "Cannot do · Access missing",
      risky: "Can do · High risk",
    },
    results: {
      products: "It can read product information and prepare a summary for the design colleague without changing the source data.",
      reply: "It can draft a reply from the enquiry and product information. The draft stays here; it is not sent.",
      followup: "It can read the customer record, then update the follow-up status after the decision-maker approves and record the change.",
    },
    missing: "To complete this task, it still needs:",
    risks: {
      send: "External sending is enabled without human approval; an unreviewed reply could go out directly.",
      erp: "Write access to orders and finance is enabled without human approval; core records could be changed.",
      write: "Write access to a core system is enabled without human approval; data could change before review.",
    },
    extra: "Some enabled access is not needed for this task; narrow it to what is just enough.",
    revealTitle: "See the just-enough settings for each task",
    revealLead: "Keep only the access each task needs. Add decision-maker approval to every write or external send.",
    justEnough: [
      { id: "products", name: "Prepare product information", access: "Product database: read. Keep write and send access off." },
      { id: "reply", name: "Draft an enquiry reply", access: "Product database: read. Create a draft; keep email sending off." },
      { id: "followup", name: "Update follow-up status", access: "Customer records: read and write; require approval and record the change." },
    ],
    principlesTitle: "Three principles",
    principles: [
      "Grant only the access needed for the task.",
      "If read-only is enough, do not grant write access.",
      "Require decision-maker approval and keep a record for core-system writes and external sends.",
    ],
  },
};

export const SYSTEMS = [
  { id: "products", permissions: ["read", "write", null] },
  { id: "crm", permissions: ["read", "write", null] },
  { id: "erp", permissions: ["read", "write", null] },
  { id: "email", permissions: [null, null, "send"] },
];

export const TASK_REQUIREMENTS = {
  products: [["products", "read"]],
  reply: [["products", "read"]],
  followup: [["crm", "read"], ["crm", "write"]],
};

// A plain-language start for decision-makers, placed before chapter 13.
// Written copy only. No outcome figures.
export const ADOPTION = {
  zh: {
    kicker: "五步",
    title: "企業導入五步",
    lead: "給想把 AI 放進日常工作的中小企業負責人。一次只處理一件又痛、又會重複的事。這五步是一種起步方式，不是唯一的順序，也不寫成效。",
    steps: [
      {
        title: "先挑一件又痛又重複的事",
        body: "例如詢盤怎麼接待、報價之後怎麼跟。做窗簾、壁布、地毯這類室內軟裝時，規格和交期常常要來回確認。先從你已經在重複做的一件開始。",
      },
      {
        title: "把真實例子收進來",
        body: "留下真實的詢盤、報價，以及後來怎麼跟的紀錄。不必先做成漂亮的表。要看得出當時缺了什麼，以及人是怎麼判斷的。",
      },
      {
        title: "先做一條小流程，中間留給人看",
        body: "讓 AI 幫忙整理、草擬，或標出下一步。價格、交期，以及要寄出去的內容，都要有人看過才算。",
      },
      {
        title: "負責人點頭，團隊先用幾週",
        body: "負責人看過並同意之後，讓實際在做這件事的人先用幾週。遇到不順就記下來，先不必加新的做法。",
      },
      {
        title: "回頭看，再選下一件",
        body: "看哪裡省了事、哪裡仍要人接手、哪裡大家又回到舊做法。值得留的留下，不值得的就停。下一件仍然從一件具體的事開始。",
      },
    ],
    linksLead: "想先看一封虛構詢盤怎麼走完，或想約時間談。",
    note: "那一頁是寫好的虛構例子，不是真實模型的輸出。",
  },
  en: {
    kicker: "FIVE STEPS",
    title: "Five steps to bring AI into a company",
    lead: "For decision-makers at smaller firms who want AI in everyday work. Start with one task that is painful and keeps coming back. These five steps are a way to begin, not the only order, and they claim no results.",
    steps: [
      {
        title: "Pick one painful, repetitive task",
        body: "For example, how an enquiry is received and how a quote is followed up. With interior soft furnishings such as curtains, fabric-backed wallcovering, and rugs, specification and lead time often go back and forth. Start with one task you already repeat.",
      },
      {
        title: "Collect real examples",
        body: "Keep real enquiries, quotes, and notes on what happened next. They do not need to become a tidy table. They need to show what was missing, and how a person decided.",
      },
      {
        title: "Build a small flow, with a person in the middle",
        body: "Let AI help organise, draft, or mark the next step. Price, lead time, and anything that goes out still count only after a person has looked.",
      },
      {
        title: "The decision-maker agrees, then the team uses it for a few weeks",
        body: "After the decision-maker has seen the flow and agreed, the people who do the work use it for a few weeks. When something feels awkward, write it down. There is no need to add more yet.",
      },
      {
        title: "Review, then choose the next task",
        body: "Notice where the work got lighter, where a person still had to step in, and where people returned to the old way. Keep what is worth keeping. Stop what is not. The next task still starts as one concrete job.",
      },
    ],
    linksLead: "See one fictional enquiry from start to finish, or talk it through.",
    note: "That page is a written fictional example, not output from a real model.",
  },
};
