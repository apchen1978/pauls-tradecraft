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
  {
    id: "verified",
    title: { zh: "「已驗證」不等於「商業採用」", en: "Verified does not mean adopted" },
    summary: {
      zh: "檢查會過，不代表有人願意付錢。把「交付證明」與「市場證明」分成兩條線。",
      en: "Passing checks does not mean someone will pay. Keep artifact proof and market proof on two separate lines.",
    },
    body: {
      zh: [
        "「已驗證」三個字現在到處都是：工具說它已驗證、供應商說它已驗證、AI 產出也說它已驗證。第一個該問的問題不是「可信嗎」，而是「驗證了什麼」。",
        "我把它拆成兩條線。第一條是交付證明：東西做得出來、規格對得上、可以重跑、能上線。這一條能被客觀檢查——建置會不會過、檢查數字是多少、公開網址打不打得開。",
        "第二條是市場證明：有人真的用、願意付錢、願意再買一次。這一條沒有檔案可以交，只有行為能證明。",
        "兩條線混在一起的代價很高。對內會過度樂觀：按「已驗證」去備料、擴編、投資；對外會過度承諾：把「我們做得到」講成「已經很多人買」。兩種錯誤都很貴，而且通常在簽字之後才發現。",
        "我的做法很簡單，但很少人這樣做：每一項聲明都標明它屬於哪一條線。屬於交付證明的，附上可重跑的檢查；屬於市場證明的，如果還沒有，就寫 PENDING 或 UNKNOWN——不寫成「即將」、也不寫成「預期」。",
        "對老闆的實際用處：當你知道哪些是交付證明、哪些還沒有市場證明，承諾的邊界就自己出現了——可以先承諾做得到什麼，不能承諾賣得掉什麼。決策不會因此變保守，而是變精確。",
        "一句話：可以證明「做得出來」，不等於證明「賣得掉」；兩條線分開，你才知道下一步該補哪一種證據。",
      ],
      en: [
        "\"Verified\" is everywhere now: tools say it, suppliers say it, AI output says it. The first question is not \"can I trust it\" but \"verified for what\".",
        "I split it into two lines. The first is artifact proof: it can be built, it meets the spec, it can be rerun, it can go live. This line can be checked objectively — does the build pass, what do the checks report, does the public URL open.",
        "The second is market proof: someone actually uses it, pays for it, and buys again. There is no document to hand over for this line — only behaviour proves it.",
        "Mixing the two lines is expensive. Internally it creates over-optimism: pre-buying, hiring, and investing against the word \"verified\". Externally it creates over-promising: turning \"we can build it\" into \"many people already buy it\". Both mistakes are costly, and both usually surface after signature.",
        "My practice is simple but rare: label which line every claim belongs to. Artifact proof ships with a rerunnable check; market proof that does not exist yet is written as PENDING or UNKNOWN — never as \"coming soon\", never as \"expected\".",
        "The practical value for an owner: once you know which claims are artifact proof and which have no market proof yet, the boundary of commitment appears by itself — you can commit to what you can deliver, not to what will sell. Decision-making does not become more cautious; it becomes more precise.",
        "In one line: proving you can build something is not proof that it sells. Separate the two lines and you know which evidence you need next.",
      ],
    },
  },
  {
    id: "authority",
    title: { zh: "誰有權拍板？把「決策權未知」當成正式狀態", en: "Who can actually sign? Treat decision authority as a first-class unknown" },
    summary: {
      zh: "對方很熱情，不代表他有授權。把「最終核准人」當成一個正式欄位，不猜、不假設。",
      en: "Enthusiasm is not authorization. Make \"final approver\" a real field — never guessed, never assumed.",
    },
    body: {
      zh: [
        "最貴的誤會之一：談了三個月、條件都說「沒問題」、樣品也確認了——最後一刻才發現，對口的人沒有簽核權，而他上面的人從沒看過這筆單。",
        "為什麼會這樣？因為我們習慣把「有回應的人」當成「能決定的人」。前者每天回訊息；後者往往根本不知道是誰。",
        "所以我把它當成一個正式欄位：最終核准人。填不出來，就寫 UNKNOWN——不猜名字、也不假設層級。「應該是採購經理吧」這種假設，正是三個月後翻車的原因。",
        "決策權要問到三個層次：誰簽名？超過什麼金額或條件要往上報？如果他不簽，誰會反對？第三個問題最常被跳過，但反對者往往才是真正的關卡。",
        "這件事直接決定你能承諾什麼。決策權未知時，報價可以給、樣品可以送，但產能保留、備料保留、付款條件不放寬——承諾留在自己手上，等授權鏈清楚了再放。",
        "好消息是它可推進：每次會議都能往前一格——誰參與、誰看過、誰有否決權。這比「感覺快成了」可靠得多。",
        "一句話：客戶的熱情不是授權；在知道誰能拍板之前，先把承諾留在自己手上。",
      ],
      en: [
        "One of the most expensive misunderstandings: three months of talks, every condition \"no problem\", samples approved — and at the last moment you learn that your contact cannot sign, and the person above them has never seen the deal.",
        "Why does it happen? Because we treat \"the person who replies\" as \"the person who decides\". One answers messages daily; the other is often not even identifiable.",
        "So I treat it as a real field: final approver. If it cannot be filled in, it is written as UNKNOWN — no guessed name, no assumed level. \"It is probably the procurement manager\" is exactly the assumption that collapses three months later.",
        "Decision authority has three layers to ask about: who signs? Above what amount or term does it go higher? And if they do not sign, who objects? The third question is skipped most often, yet the objector is frequently the real gate.",
        "This directly sets what you can promise. While decision authority is unknown, you can quote and send samples, but keep capacity reserved, keep materials unreserved, and do not loosen payment terms — hold the commitment on your side until the authorization chain is clear.",
        "The good news is that it can be advanced: every meeting moves it one square — who is involved, who has read it, who holds a veto. That is far more reliable than \"it feels close\".",
        "In one line: enthusiasm is not authorization. Until you know who can sign, keep the commitment on your side of the table.",
      ],
    },
  },
];
