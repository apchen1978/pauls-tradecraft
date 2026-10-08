// Pure state for the six-gate trade decision demo.
// Navigation (which gate is open) stays in navReducer.
// Workflow status stays in flowReducer. Selecting a gate never changes status.

export const STATUS = {
  PENDING: "PENDING",
  ACTIVE: "ACTIVE",
  PASSED: "PASSED",
  HOLD: "HOLD",
  BLOCKED: "BLOCKED",
};

export const STAGE_IDS = ["lead", "qualification", "rfq", "risk-check", "quote", "approval"];

export const APPROVAL_RECORD = "SIMULATED_APPROVAL";

const STAGE_FIELDS = ["title", "description", "tool", "person", "evidence", "output", "gate", "pass", "blocked"];

export function createFlowState() {
  return {
    stages: Object.fromEntries(STAGE_IDS.map((id) => [id, STATUS.PENDING])),
    approvalRecord: null,
    paymentSecurityEvidence: "missing",
  };
}

export function createNavState() {
  return { selectedId: "lead" };
}

export function passedCount(stages) {
  return STAGE_IDS.reduce((count, id) => count + (stages[id] === STATUS.PASSED ? 1 : 0), 0);
}

export function earlierUnresolved(stages, id) {
  const index = STAGE_IDS.indexOf(id);
  if (index <= 0) return [];
  return STAGE_IDS.slice(0, index).filter((stageId) => stages[stageId] !== STATUS.PASSED);
}

export function passRefusal(state, id) {
  if (!STAGE_IDS.includes(id)) return { stageId: id, code: "unknown", blockers: [] };
  const blockers = earlierUnresolved(state.stages, id);
  if (blockers.length) return { stageId: id, code: "prerequisites", blockers };
  if (id === "risk-check" && state.paymentSecurityEvidence !== "simulated") {
    return { stageId: id, code: "missing-payment-security", blockers: [] };
  }
  return null;
}

function invalidateDownstream(stages, id) {
  const index = STAGE_IDS.indexOf(id);
  for (const later of STAGE_IDS.slice(index + 1)) {
    if (stages[later] === STATUS.PASSED || stages[later] === STATUS.ACTIVE) {
      stages[later] = STATUS.BLOCKED;
    }
  }
}

function seal(state, stages) {
  return {
    ...state,
    stages,
    approvalRecord: stages.approval === STATUS.PASSED ? APPROVAL_RECORD : null,
  };
}

function sameStages(left, right) {
  return STAGE_IDS.every((id) => left[id] === right[id]);
}

export function flowReducer(state, action) {
  switch (action.type) {
    case "PASS": {
      if (passRefusal(state, action.id)) return state;
      if (state.stages[action.id] === STATUS.PASSED) return state;
      const stages = { ...state.stages, [action.id]: STATUS.PASSED };
      const next = STAGE_IDS[STAGE_IDS.indexOf(action.id) + 1];
      if (next && stages[next] === STATUS.PENDING) stages[next] = STATUS.ACTIVE;
      return seal(state, stages);
    }
    case "HOLD":
    case "BLOCK": {
      if (!STAGE_IDS.includes(action.id)) return state;
      const nextStatus = action.type === "HOLD" ? STATUS.HOLD : STATUS.BLOCKED;
      const stages = { ...state.stages, [action.id]: nextStatus };
      invalidateDownstream(stages, action.id);
      const next = seal(state, stages);
      if (next.approvalRecord === state.approvalRecord && sameStages(next.stages, state.stages)) return state;
      return next;
    }
    case "RESOLVE_PAYMENT_EVIDENCE": {
      if (state.paymentSecurityEvidence === "simulated") return state;
      return { ...state, paymentSecurityEvidence: "simulated" };
    }
    case "RESET": {
      const fresh = createFlowState();
      if (
        state.approvalRecord === fresh.approvalRecord
        && state.paymentSecurityEvidence === fresh.paymentSecurityEvidence
        && sameStages(state.stages, fresh.stages)
      ) return state;
      return fresh;
    }
    default:
      return state;
  }
}

export function navReducer(state, action) {
  const index = STAGE_IDS.indexOf(state.selectedId);
  switch (action.type) {
    case "SELECT":
      if (!STAGE_IDS.includes(action.id) || action.id === state.selectedId) return state;
      return { selectedId: action.id };
    case "NEXT":
      if (index >= STAGE_IDS.length - 1) return state;
      return { selectedId: STAGE_IDS[index + 1] };
    case "PREV":
      if (index <= 0) return state;
      return { selectedId: STAGE_IDS[index - 1] };
    case "RESET":
      return state.selectedId === "lead" ? state : createNavState();
    default:
      return state;
  }
}

function stageCopy(zh, en) {
  for (const field of STAGE_FIELDS) {
    if (!zh[field] || !en[field]) throw new Error(`Missing stage field ${field}`);
  }
  return { zh, en };
}

export const stages = [
  {
    id: "lead",
    order: 1,
    ...stageCopy(
      {
        title: "詢盤",
        description: "把剛進來的詢問整理成一份可以判斷的檔案。",
        tool: "整理詢盤內容，抽出買方資訊與產品類別，並把需求排成結構。",
        person: "判斷來源是否可信，以及這筆詢問值不值得花時間。",
        evidence: "此示範：虛構的 Kensington Pattern Co. 詢問美式純紙牆紙，想了解第一櫃的可能性。沒有真實信件，也沒有接觸。",
        output: "詢盤檔案（Lead Profile）",
        gate: "是否已有開始資格判斷的最低資訊。",
        pass: "買方、產品類別與詢問目的都已寫下，負責人認為值得繼續。",
        blocked: "來源無法辨識，或資訊少到不能開始資格判斷。",
      },
      {
        title: "Lead",
        description: "Organize a new inquiry into a file a person can judge.",
        tool: "Organize the inquiry, extract buyer information and product category, and structure the requirements.",
        person: "Judge whether the source is credible and whether the inquiry deserves attention.",
        evidence: "In this demo, fictional Kensington Pattern Co. asks about American-style pure-paper wallpaper and a possible first container. There is no real letter and no contact.",
        output: "Lead Profile",
        gate: "Whether there is enough information to start qualification.",
        pass: "Buyer, product category, and the purpose of the inquiry are written down, and the decision-maker judges it worth continuing.",
        blocked: "The source cannot be identified, or there is too little information to start qualification.",
      },
    ),
  },
  {
    id: "qualification",
    order: 2,
    ...stageCopy(
      {
        title: "資格",
        description: "看這筆詢問在商業上是否值得排優先。",
        tool: "整理需求、數量、目標價格、時程與付款期待，並標出還缺的資訊。",
        person: "判斷商業吸引力與優先順序。",
        evidence: "數量仍是假設：希望朝一個 20 呎櫃。價格帶是 FOB 上海每卷 USD 10–15。MOQ 1,000 直米。對方真正的付款條件尚未確認。",
        output: "資格評分卡（Qualification Scorecard）",
        gate: "資訊是否足夠向供應端詢價。",
        pass: "產品、數量範圍與價格帶已足夠起草詢價；缺的項目維持未知，不補成事實。",
        blocked: "數量、規格或價格帶缺到無法詢價。",
      },
      {
        title: "Qualification",
        description: "Judge whether the inquiry is commercially worth prioritizing.",
        tool: "Prepare requirements, volume, target price, timing, and payment expectations, and list what is still missing.",
        person: "Judge commercial attractiveness and priority.",
        evidence: "Volume is still an assumption: a possible 20-foot container. The price band is FOB Shanghai USD 10–15 per roll. MOQ is 1,000 linear meters (直米). The buyer's actual payment terms are not confirmed.",
        output: "Qualification Scorecard",
        gate: "Whether there is enough information to request supplier quotes.",
        pass: "Product, volume range, and price band are enough to draft an RFQ. Gaps stay unknown and are not filled in as facts.",
        blocked: "Volume, specification, or price band is too incomplete to request a quote.",
      },
    ),
  },
  {
    id: "rfq",
    order: 3,
    matrix: {
      zh: [
        { label: "MOQ", value: "1,000 直米", note: "案例條件" },
        { label: "規格", value: "0.686 × 8.23 m", note: "待與實際卷長核對" },
        { label: "Incoterms", value: "FOB 上海", note: "假設" },
        { label: "交期", value: "未知", note: "未查核" },
      ],
      en: [
        { label: "MOQ", value: "1,000 linear meters (直米)", note: "Case condition" },
        { label: "Specification", value: "0.686 × 8.23 m", note: "Roll length still to check" },
        { label: "Incoterms", value: "FOB Shanghai", note: "Assumption" },
        { label: "Lead time", value: "Unknown", note: "Not checked" },
      ],
    },
    ...stageCopy(
      {
        title: "詢價",
        description: "把詢價條件擺開，看供應假設有沒有依據。",
        tool: "整理 RFQ，比較供應報價的 MOQ、規格、交期與 Incoterms，並標出不一致。",
        person: "確認配置、供應是否做得到，以及哪些差異要緊。",
        evidence: "卷規格 0.686 × 8.23 m。MOQ 1,000 直米，以卷長估算約 122 卷，仍須與實際卷長核對。貿易條件假設為 FOB 上海。此示範沒有多家回覆，不把單一假設寫成已比價完成。",
        output: "詢價比較表（RFQ Comparison Matrix）",
        gate: "成本與供應假設是否都有證據。",
        pass: "規格、MOQ、Incoterms 與交期都標明是假設、案例條件或未知；不一致沒有被抹平。",
        blocked: "把尚未核對的裝櫃量或卷長寫成已確認的供應事實。",
      },
      {
        title: "RFQ",
        description: "Lay out the RFQ and see whether the supply assumptions have evidence.",
        tool: "Structure the RFQ, compare supplier quotes on MOQ, specification, lead time, and Incoterms, and flag inconsistencies.",
        person: "Confirm the configuration, whether supply is feasible, and which differences matter.",
        evidence: "Roll size 0.686 × 8.23 m. MOQ 1,000 linear meters (直米), about 122 rolls if that roll length holds, still to be checked. The assumed Incoterm is FOB Shanghai. This demo has no set of supplier replies, so one assumption is not presented as a finished comparison.",
        output: "RFQ Comparison Matrix",
        gate: "Whether cost and supply assumptions have evidence.",
        pass: "Specification, MOQ, Incoterms, and lead time are each marked as an assumption, a case condition, or unknown. Inconsistencies are not smoothed over.",
        blocked: "An unchecked container load or roll length is written down as a confirmed supply fact.",
      },
    ),
  },
  {
    id: "risk-check",
    order: 4,
    ...stageCopy(
      {
        title: "風險檢查",
        description: "把付款、毛利、交付與缺證放在同一張登記上。缺失的證據維持缺失。",
        tool: "整理付款暴露、參考毛利、交易對手、交付與合規旗標，以及缺證登記。",
        person: "決定風險是否可接受、要不要補證，以及繼續還是暫緩。",
        evidence: "付款接受線是訂金 30%，餘款出貨前付清。這是負責人願意放上桌的線，不是對方已同意的條件。報價毛利地板大約 35%，是報價時的地板，不是已發生的成效。付款保障（例如信用狀或出口信用保險）在此示範中缺失。",
        output: "風險登記／決策備忘（Risk Register / Decision Memo）",
        gate: "關鍵風險已處理，或被明確升級。缺失的證據不可顯示為已查核。",
        pass: "付款保障的缺證已用標明為模擬的方式補上，且前面的關卡都已通過。模擬補上不是實際查核。",
        blocked: "缺付款保障證據卻顯示為已查核，或關鍵風險既未處理也未升級。",
      },
      {
        title: "Risk Check",
        description: "Put payment, margin, delivery, and missing evidence on one register. Missing evidence stays missing.",
        tool: "Prepare payment exposure, an indicative margin, counterparty, delivery and compliance flags, and a missing-evidence register.",
        person: "Decide risk appetite, whether to request evidence, and whether to continue or hold.",
        evidence: "The acceptable payment line is a 30% deposit, with the balance before shipment. That is the line the decision-maker will put on the table, not a term the buyer has accepted. The quote-margin floor is about 35%: a floor at quotation, not a result that has already occurred. Payment security, such as a letter of credit or export credit insurance, is missing in this demo.",
        output: "Risk Register / Decision Memo",
        gate: "Critical risks are resolved or explicitly escalated. Missing evidence is never shown as verified.",
        pass: "The missing payment-security evidence has been filled by the labelled simulation, and the earlier gates have passed. Simulated evidence is not an actual check.",
        blocked: "Missing payment-security evidence is shown as verified, or a critical risk is neither resolved nor escalated.",
      },
    ),
  },
  {
    id: "quote",
    order: 5,
    ...stageCopy(
      {
        title: "報價",
        description: "起草一份還不能發出的報價。",
        tool: "起草報價、毛利、假設與尚缺的條件。",
        person: "決定價格、付款條件、交付義務，以及願意承諾的範圍。",
        evidence: "可談的價格落在 FOB 上海每卷 USD 10–15，而且報價毛利仍守得住大約 35% 的地板。認證、打樣與交期仍是未知。通過這一關只代表可以送交授權檢視。",
        output: "報價草稿（Draft Quotation）",
        gate: "是否可以進入授權檢視。可送交檢視，不是發出報價的許可。",
        pass: "價格、付款、交付義務與尚未承諾的項目都寫在草稿上，並標明可送交檢視，只供檢視。",
        blocked: "把草稿當成已經可以發給買方的報價。",
      },
      {
        title: "Quote",
        description: "Draft a quotation that is not yet ready to send.",
        tool: "Draft the quotation, the margin, the assumptions, and the conditions still missing.",
        person: "Decide price, payment terms, delivery obligations, and what may be committed.",
        evidence: "A discussable price sits within FOB Shanghai USD 10–15 per roll, and only if the quote-margin floor of about 35% still holds. Certification, sampling, and lead time remain unknown. Passing this gate only means the draft can go to authorization review.",
        output: "Draft Quotation",
        gate: "Whether it is ready for authorization review. QUOTE_READY is not permission to issue the quotation.",
        pass: "Price, payment, delivery obligations, and items not yet committed are on the draft, and QUOTE_READY is marked as review-only.",
        blocked: "The draft is treated as a quotation that may already be sent to the buyer.",
      },
    ),
  },
  {
    id: "approval",
    order: 6,
    ...stageCopy(
      {
        title: "核准",
        description: "把證據與未解風險交給負責人做模擬核准。此示範不建立真實授權。",
        tool: "呈現證據、摘要尚未解決的風險，並準備紀錄。",
        person: "核准、拒絕、要求修改，或接受、拒絕一項風險。",
        evidence: "前五關的產出是否齊備。未解項目仍留在紀錄上，不在這裡消失。",
        output: "模擬核准紀錄（Simulated Approval Record）",
        gate: "真實系統裡需要明確的人為授權。此示範不寄出任何東西，也不建立真實授權。",
        pass: "第 1 到第 5 關都已通過，且負責人按下模擬核准。結果標成模擬核准。",
        blocked: "前五關有任一關尚未通過，或把模擬紀錄標成真實授權。",
      },
      {
        title: "Approval",
        description: "Hand the evidence and open risks to the decision-maker for a simulated approval. This demo does not create a real authorization.",
        tool: "Present the evidence, summarize open risks, and prepare the record.",
        person: "Approve, reject, request a revision, or accept or decline a risk.",
        evidence: "Whether the outputs of gates 1–5 are complete. Open items stay on the record; they do not disappear here.",
        output: "Simulated Approval Record",
        gate: "A real system would require explicit human authorization. This demo never sends anything and never creates a real authorization.",
        pass: "Gates 1–5 have passed, and the decision-maker records a simulated approval. The result is labelled SIMULATED_APPROVAL.",
        blocked: "Any of gates 1–5 has not passed, or the simulated record is labelled as a real authorization.",
      },
    ),
  },
];

export const workflowEntry = {
  zh: {
    cta: "走一遍六道關卡",
    note: "同一份虛構的純紙牆紙詢盤，在下方案例裡操作。示範／成效未驗證。",
  },
  en: {
    cta: "Walk the six gates",
    note: "The same fictional pure-paper wallpaper inquiry, in the case detail below. Demo / outcomes not validated.",
  },
};

export const workflowCopy = {
  zh: {
    title: "從詢盤到報價：六道關卡",
    intro: "一筆詢盤要走到報價，中間有六道關卡。工具先把資料整理好；價格、風險與承諾由人決定。",
    complement: "走到最後只留下一筆模擬核准紀錄，不會送出任何文件。",
    scenarioTitle: "虛構情境 · 美式純紙牆紙 · 第一櫃",
    scenarioBody: "虛構的 Kensington Pattern Co. 詢問美式純紙牆紙，想把第一張單做到一個櫃子。沒有真實接觸。FOB 上海每卷 USD 10–15。卷規格 0.686 × 8.23 m。MOQ 1,000 直米。付款接受線：訂金 30%，餘款出貨前付清。報價毛利地板大約 35%。這些是條件，不是已發生的成效。",
    storyLink: "同一份虛構條件的四站故事線",
    selectHint: "點一關只會打開它，不會把它標為通過。",
    columnsTool: "工具先整理",
    columnsPerson: "由人決定",
    evidenceLabel: "需要的證據",
    outputLabel: "產出",
    gateLabel: "決策關卡",
    passLabel: "通過條件",
    blockedLabel: "受阻條件",
    matrixLabel: "這一關的供應假設",
    registerLabel: "缺證登記",
    viewing: "檢視中",
    progressLabel: "關卡進度",
    progress: (passed, total) => `已通過 ${passed}／${total}`,
    passAction: "標為通過",
    approvalAction: "記錄模擬核准",
    holdAction: "暫緩／需要證據",
    prevAction: "上一步",
    nextAction: "下一步",
    resetAction: "重設",
    stagesLabel: "六道關卡",
    resolveAction: "模擬補上付款保障證據",
    resolveNote: "這個動作只改示範裡的缺證狀態，不是真實查核，也不會把缺失顯示為已查核。",
    resolveDone: "已用模擬方式補上",
    evidenceMissing: "付款保障：缺失 · 未查核",
    evidenceSimulated: "付款保障：模擬已補上 · 不是實際查核",
    quoteReady: "可送交檢視 · 可送交授權檢視，不是發出報價的許可。",
    approvalBanner: "模擬核准 · 模擬核准紀錄。沒有送出任何文件，也沒有建立授權。",
    disclosure: "互動示範，使用合成資料。不會發生真實交易或授權。",
    demoLabel: "示範／成效未驗證",
    lockedInspect: "這一關還沒到可以通過的時候，仍然可以打開查看。",
    status: {
      PENDING: "待檢查",
      ACTIVE: "進行中",
      PASSED: "已通過",
      HOLD: "暫緩",
      BLOCKED: "受阻",
    },
  },
  en: {
    title: "From Inquiry to Quote: Six Decision Gates",
    intro: "Six gates sit between an inquiry and a quotation. Tools prepare the record. A person decides price, risk, and any commitment.",
    complement: "The last step leaves a simulated approval record only. Nothing is sent.",
    scenarioTitle: "Fictional scenario · pure-paper wallpaper · first container",
    scenarioBody: "Fictional Kensington Pattern Co. asks about American-style pure-paper wallpaper and whether a first order could fill one container. There was no real contact. FOB Shanghai USD 10–15 per roll. Roll size 0.686 × 8.23 m. MOQ 1,000 linear meters (直米). Acceptable payment line: 30% deposit, balance before shipment. Quote-margin floor about 35%. These are conditions, not results that have occurred.",
    storyLink: "The four-station storyline for these same fictional conditions",
    selectHint: "Selecting a gate opens it. It does not mark the gate as passed.",
    columnsTool: "Prepared by tools",
    columnsPerson: "Decided by a person",
    evidenceLabel: "Required evidence",
    outputLabel: "Output",
    gateLabel: "Decision gate",
    passLabel: "Pass condition",
    blockedLabel: "Blocked condition",
    matrixLabel: "Supply assumptions at this gate",
    registerLabel: "Missing-evidence register",
    viewing: "Viewing",
    progressLabel: "Gate progress",
    progress: (passed, total) => `${passed} of ${total} passed`,
    passAction: "Mark as passed",
    approvalAction: "Record simulated approval",
    holdAction: "Hold / needs evidence",
    prevAction: "Previous",
    nextAction: "Next",
    resetAction: "Reset",
    stagesLabel: "Six gates",
    resolveAction: "Simulate resolving payment-security evidence",
    resolveNote: "This action only changes the missing-evidence state inside the demo. It is not an actual check, and it does not show a gap as checked.",
    resolveDone: "Simulated as provided",
    evidenceMissing: "Payment security: missing · not checked",
    evidenceSimulated: "Payment security: simulated as provided · not an actual check",
    quoteReady: "QUOTE_READY · Ready for authorization review, not permission to issue.",
    approvalBanner: "SIMULATED_APPROVAL · Simulated approval record. Nothing was sent, and no authorization was created.",
    disclosure: "Interactive demonstration using synthetic data. No real transaction or authorization occurs.",
    demoLabel: "Demo / outcomes not validated",
    lockedInspect: "This gate is not ready to pass. It can still be opened and read.",
    status: {
      PENDING: "Pending",
      ACTIVE: "Active",
      PASSED: "Passed",
      HOLD: "Hold",
      BLOCKED: "Blocked",
    },
  },
};

export function stageById(id) {
  return stages.find((stage) => stage.id === id) || null;
}

export function describeRefusal(refusal, lang) {
  if (!refusal) return "";
  const copy = workflowCopy[lang];
  const names = (refusal.blockers || [])
    .map((id) => stageById(id)?.[lang]?.title)
    .filter(Boolean);
  const list = names.join(lang === "zh" ? "、" : ", ");
  if (refusal.code === "prerequisites") {
    const base = lang === "zh"
      ? `前面還有關卡未通過：${list}。這些關卡通過之前，這一關不能標為通過。`
      : `Earlier gates are still unresolved: ${list}. This gate cannot pass until they do.`;
    if (refusal.stageId === "approval") {
      return lang === "zh"
        ? `核准還沒有打開。第 1 到第 5 關都要先通過。${base}`
        : `Approval stays closed until gates 1–5 have passed. ${base}`;
    }
    return base;
  }
  if (refusal.code === "missing-payment-security") {
    return lang === "zh"
      ? "付款保障證據仍然缺失。缺失的證據不能顯示為已查核。請先暫緩，或使用標明為模擬的補證動作，再由人決定是否通過。"
      : "Payment-security evidence is still missing. Missing evidence is not shown as checked. Hold the gate, or use the labelled simulated resolution, then let a person decide whether it passes.";
  }
  return copy.lockedInspect;
}

export function collectPublicText() {
  const chunks = [];
  const walk = (value) => {
    if (typeof value === "string") chunks.push(value);
    else if (Array.isArray(value)) value.forEach(walk);
    else if (value && typeof value === "object") Object.values(value).forEach(walk);
  };
  walk(stages);
  walk(workflowEntry);
  walk(workflowCopy);
  return chunks.join("\n");
}
