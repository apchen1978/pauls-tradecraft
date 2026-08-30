// methods.js — Methodology articles (working-principles content).
// 方法論文章：全部從既有工具與決策紀律衍生，零捏造；不宣稱客戶成效。
// 與 codex-handoff-bridge/articles/ 同步。

export const methods = [
  {
    id: "unknown",
    title: { zh: "為什麼 UNKNOWN 比猜測重要", en: "Why UNKNOWN beats guessing" },
    summary: {
      zh: "把不知道的留下來、標成 UNKNOWN、而且不猜——這不是保守，是更快。",
      en: "Keep what you don't know labeled UNKNOWN, and don't guess — it's not caution, it's speed.",
    },
    body: {
      zh: [
        "談海外商機時，最常見的對話是：「客戶好像很有興趣，他說量很大。」「好像」「他說」——兩句話裡藏著三個未知：量多大？誰說的？有沒有證據？",
        "大部分業務的直覺是把它們填滿：估一個數字、猜一個意願、補一個結論。我的做法相反——把不知道的留下來，標成 UNKNOWN，而且不猜。",
        "猜測的代價：假設你估算「客戶年採購 5 萬件」，這個數字會開始自己走路——你按它算產能、算報價、算投資回報。但如果你只是「好像」，你其實是在用一個假設蓋第二個假設。更糟的是：猜測會關閉追問。",
        "UNKNOWN 不是失敗，是任務清單：每一項未知都對應一個可執行的求證動作——要文件、要書面條件、要確認供應商關係。",
        "證據的三個層級：已證實（書面 RFQ、採購訂單、合約）可以排入評估；待驗證（第三方資料庫、電話轉述）只能當線索必須交叉確認；未知（沒有來源的「好像」）不進入判斷，先列為求證項。",
        "對老闆來說，一份「很多 UNKNOWN」的評估比一份「全都有答案但都是猜的」貴重得多——前者保護你不做錯誤承諾，後者只會讓你在簽字後才發現地基是空的。",
        "一句話：不知道，就說不知道，然後把「怎麼知道」變成下一步。猜得漂亮，不如問得清楚。",
      ],
      en: [
        "The most common line in overseas deal conversations: \"The client seems interested — he said the volume is big.\" \"Seems\" and \"he said\" hide three unknowns: how big, who said it, and is there evidence.",
        "Most sales instincts fill the gaps: estimate a number, guess an intent, complete the picture. My approach is the opposite — keep what is unknown labeled UNKNOWN, and don't guess. It's not caution; it's speed.",
        "The cost of guessing: estimate \"50,000 units a year\" and the number starts walking on its own — you size capacity, pricing, and ROI against it. If it was only \"seems like\", you are stacking assumptions on an empty foundation. Worse: guessing closes the follow-up question.",
        "UNKNOWN is not failure — it is a task list. Each unknown maps to one actionable verification step: ask for the document, the written terms, the supplier confirmation.",
        "Three evidence tiers: CONFIRMED (written RFQ, PO, contract) may enter evaluation; VERIFICATION_REQUIRED (third-party databases, phone relay) is only a lead and must be cross-checked; UNKNOWN (sourceless \"seems like\") does not enter judgment — it becomes a verification item.",
        "For an owner, an assessment full of UNKNOWNs is worth more than one with answers that are all guesses — the first protects you from wrong commitments; the second reveals the empty foundation only after you sign.",
        "In one line: if you don't know, say you don't know, then turn \"how to find out\" into the next step. Guessing prettily is worth less than asking clearly.",
      ],
    },
  },
  {
    id: "fob",
    title: { zh: "Incoterm 只寫 FOB 時，責任邊界在哪", en: "When the RFQ just says FOB, where is the responsibility boundary?" },
    summary: {
      zh: "FOB 是起點不是終點。報價前先問清楚三個必問，把責任邊界寫進文件。",
      en: "FOB is a starting point, not the end. Ask the three questions before quoting, and put the boundary in writing.",
    },
    body: {
      zh: [
        "客戶回信：「FOB 報價，請給最好價格。」兩個字 FOB 看起來很清楚——但報價前的真正問題一個都沒回答：哪個港口？裝貨範圍到哪？運費內含嗎？之後的保險、關稅誰負責？",
        "FOB（Free On Board）的責任分界點：賣方把貨物裝上指定港口的船上，責任交接。在那之前是賣方的，之後是買方的。但「之後」是一長串：海運費、保險、目的港費用、進口清關、關稅、內陸運送。",
        "報價單上寫 FOB 的三個必問：哪個起運港？裝貨與出口清關誰負責？報價含哪些費用？",
        "常見誤區：FOB 的價格與 DDP 的價格不能直接比——責任範圍完全不同；「之後都是買方的」不等於賣方沒風險；口頭確認不算，責任邊界必須落在書面 RFQ 或合約裡。",
        "談判紀律：報價前先把責任基礎寫清楚——交貨條件、起運港（書面確認）、報價內含項目、不包含項目。這份基礎聲明比價格本身更能保護你。",
        "一句話：FOB 是起點不是終點。報價前先問清楚三個必問，把責任邊界寫進文件——比爭取一個好價格更值錢。",
      ],
      en: [
        "The client replies: \"FOB quote, please give best price.\" Two letters FOB look clear — but the real questions before quoting are unanswered: which port? Loading scope? Is freight included? Who carries insurance and duties after that?",
        "FOB's responsibility handover: the seller loads the goods on board at the named port, and responsibility transfers there. Before that is the seller's; after is the buyer's. But \"after\" is a long list: ocean freight, insurance, destination charges, import clearance, duties, inland delivery.",
        "Three must-ask questions when a quote says FOB: which loading port? Who handles loading and export clearance? What costs are included in the price?",
        "Common traps: an FOB price and a DDP price cannot be compared directly — the responsibility scopes are different; \"everything after is the buyer's\" does not mean the seller has no risk; verbal confirmation is not enough — the boundary belongs in the written RFQ or contract.",
        "Negotiation discipline: write the responsibility basis before quoting — delivery term, named port (in writing), what the price includes, what it excludes. That basis statement protects you more than the price itself.",
        "In one line: FOB is a starting point, not the end. Ask the three questions before quoting, and put the boundary in writing.",
      ],
    },
  },
  {
    id: "payment-window",
    title: { zh: "哪 7 天的付款承諾最危險", en: "Which 7 days of payment commitment are the most dangerous" },
    summary: {
      zh: "整月總額騙人，7 日高峰誠實。談付款條件前，先算承諾窗。",
      en: "Monthly totals lie; the 7-day peak is honest. Calculate the commitment window before negotiating terms.",
    },
    body: {
      zh: [
        "談新合約時，業務最常問：「這個月總共要付多少？」但真正的風險問題是另一個：「把它加進來後，最集中的連續 7 天會多出多少付款承諾？」",
        "整月總額看不出危險——如果 30 天的付款集中在同一個星期，那一週的現金壓力可能讓公司喘不過氣。用試算表算很容易出錯：算錯窗、混幣別、無法對帳。",
        "一個例子（方法示範，非客戶成效）：已有兩筆承諾（Deal A：45,000、Deal B：38,000，落在同一 7 日窗），談第三筆（Deal C：52,000）——加入前高峰 83,000，Deal C 增量 +52,000，加入後高峰 135,000。",
        "三個紀律：逐幣別分開算（不混算）；可重跑、可對帳（改一個數字即時重算、每個數字追得到貢獻事件）；未輸入的承諾不算（缺的保持 UNKNOWN，不硬湊）。",
        "談判應用：「我們需要 90 天付款」——不要只回「可以」或「不行」。先算：這筆承諾落在哪個窗、峰值增量多少、對你最緊張的那週影響多大。有數字再談，而不是有感覺再談。",
        "一句話：整月總額騙人，7 日高峰誠實。談付款條件前，先算承諾窗。",
      ],
      en: [
        "When negotiating a new deal, the usual question is \"what's the monthly total?\" The real risk question is different: \"Once this is added, how much extra commitment lands in the most concentrated 7-calendar-day window?\"",
        "A monthly total hides the danger — if 30 days of payments concentrate in one week, that week's cash pressure can be suffocating. Spreadsheets get this wrong easily: wrong window, mixed currencies, hard to audit.",
        "An example (method demo, not a client result): two existing commitments (Deal A: 45,000, Deal B: 38,000 in the same 7-day window), negotiating a third (Deal C: 52,000) — peak before 83,000, Deal C increment +52,000, peak after 135,000.",
        "Three disciplines: separate currencies (never mix); rerunnable and auditable (recalculate instantly, every figure traces to contributing events); un-entered commitments don't count (missing stays UNKNOWN, never forced in).",
        "Negotiation application: \"We need 90-day terms\" — don't just answer yes or no. First calculate: which window does this land in, how much does the peak grow, what does it do to your tightest week. Negotiate with numbers, not feelings.",
        "In one line: monthly totals lie; the 7-day peak is honest. Calculate the commitment window before negotiating terms.",
      ],
    },
  },
  {
    id: "quote-basis",
    title: { zh: "報價基礎不同時，為什麼不能比價", en: "Why you can't compare quotes with different bases" },
    summary: {
      zh: "先比基礎，再比價錢。基礎不同的報價，最低價是幻覺。",
      en: "Compare the basis before the price. With different bases, the lowest price is an illusion.",
    },
    body: {
      zh: [
        "「第一家報 $100（FOB），第二家報 $120（DDP）——第二家貴 20%。」真的是這樣嗎？不是。FOB 只含貨物到裝船，DDP 含送到目的地加進口清關。$120 可能比 $100 更便宜——因為責任範圍完全不同。",
        "比價前先比三件事：交貨條件（Incoterm）——責任範圍不同，價格不可比；幣別——混幣別比價等於自己偷偷換匯率；報價內含——運費、保險、檢驗費、模具費內含項目不同，單價沒有意義。",
        "Rule 4：基礎不同就不排名。不是「排名但標註」，是「不排」。因為一旦排了，人就忍不住看「誰便宜」——而這個「便宜」是假象。",
        "統一基礎的做法：跟供應商說「請都用 FOB 寧波報，內含出口清關與裝船，不含海運」或「請都用 DDP 上海報」——把基礎統一，價格才有比較的意義。",
        "一句話：先比基礎，再比價錢。基礎不同的報價，最低價是幻覺。",
      ],
      en: [
        "\"Supplier A quotes $100 (FOB), Supplier B quotes $120 (DDP) — B is 20% more expensive.\" Is it? No. FOB covers goods to the ship; DDP covers delivery to destination plus import clearance. $120 may be cheaper — the scopes are entirely different.",
        "Compare three things before the price: the delivery term (Incoterm) — different responsibility scope means incomparable prices; the currency — mixing currencies is silently doing your own FX conversion; what's included — freight, insurance, inspection, tooling; different inclusions make unit prices meaningless.",
        "Rule 4: different bases are never ranked. Not \"ranked with a note\" — not ranked at all. Once ranked, people can't help looking at who's cheaper — and that \"cheaper\" is an illusion.",
        "How to unify the basis: tell suppliers \"quote FOB Ningbo, export clearance and loading included, ocean freight excluded\" or \"quote DDP Shanghai\" — unify the basis, then the prices mean something.",
        "In one line: compare the basis before the price. With different bases, the lowest price is an illusion.",
      ],
    },
  },
  {
    id: "structure",
    title: { zh: "一筆商機從發現到決定，缺的常常不是資訊是結構", en: "From discovery to decision, what's missing is usually structure, not information" },
    summary: {
      zh: "資訊不缺，結構缺。把商機放進五步結構，卡住的地方會自己浮出來。",
      en: "Information isn't missing; structure is. Put the deal into five steps and the stuck point reveals itself.",
    },
    body: {
      zh: [
        "業務常說：「這單資訊很多，但就是無法決定。」資訊多不等於能決定。真正卡住的原因，通常是沒有結構——不知道這筆商機現在走到哪一步、缺什麼、誰負責補。",
        "五步結構：1. 發現候選客戶（誰值得投入時間，含來源與未知）；2. 確認可用證據（哪些訊號能進入評估，其餘 UNKNOWN）；3. 評估目前位置（交易結構、控制因素、目前建議）；4. 檢視付款與淨貢獻（承諾暴露、收入成本拆開）；5. 留下決策資產（建議、人的決定、重跑條件分開保存）。",
        "結構讓證據缺口現形：沒有結構時，「無法決定」是一團模糊。有結構時，它變成精確的缺口清單——而每一項缺口都是下一步行動：要文件、要條件、要報價明細。",
        "為什麼決定要留下：三個月後回頭，「當初為什麼決定接這單」往往說不清楚。留下決策資產不是文書工作，是下一次決定的輸入：市場變了、條件變了，你知道該重跑哪一步。",
        "一句話：資訊不缺，結構缺。把商機放進五步結構，卡住的地方會自己浮出來。",
      ],
      en: [
        "Salespeople often say: \"There's a lot of information, we just can't decide.\" More information doesn't equal decidability. What usually blocks is a lack of structure — not knowing which step the deal is at, what's missing, and who fills it.",
        "The five-step structure: 1. Discover candidate buyers (who deserves time, with sources and unknowns); 2. Confirm usable evidence (which signals may enter evaluation; the rest stay UNKNOWN); 3. Assess the current position (deal structure, control items, current recommendation); 4. Review payment and net contribution (commitment exposure, revenue and cost separated); 5. Leave a decision asset (recommendation, human decision, and rerun conditions kept distinct).",
        "Structure makes evidence gaps visible: without it, \"can't decide\" is a blur. With it, the blur becomes a precise gap list — and each gap is a next action: ask for the document, the terms, the quote detail.",
        "Why record the decision: three months later, \"why did we take this deal\" is often unanswerable. Leaving a decision asset is not paperwork — it's the input for the next decision: when the market or terms change, you know which step to rerun.",
        "In one line: information isn't missing; structure is. Put the deal into five steps and the stuck point reveals itself.",
      ],
    },
  },
];
