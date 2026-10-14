const copy = {
  zh: {
    skip: "跳至內容", draft: "互動示範", title: "街角的秘密", heroPrompt: "先記下第一眼 ↘", backToScene: "再看其他光點 ↑",
    intro: "一間小店門口排了隊。這是穩定生意的訊號，還是今晚的一刻？",
    lede: "從四個細節開始。你不必猜對答案；只要找到下一個值得問的問題。",
    start: "走近看看", explore: "沿著這條街，先看見什麼？",
    exploreHint: "點畫面上的光點，打開一張觀察筆記。", notebook: "觀察筆記",
    impressionTitle: "第一眼，你怎麼看這條隊伍？",
    impressionHint: "先留下直覺，之後看看線索讓你想追問什麼。可以跳過，沒有標準答案。",
    impressionSteady: "生意可能一直很好", impressionPickup: "也許很多人來取預訂",
    impressionUncertain: "現在還說不準", impressionSkip: "先看線索 →",
    impressionSaved: value => `你第一眼想到：${value}`,
    reflectionBefore: "你第一眼想到", reflectionNow: "現在你想追問",
    reflectionHint: "這不是對錯判定；線索讓下一個問題更清楚。",
    emptyTitle: "慢一點，看得更多。",
    emptyBody: "麵包香、等候的人、亮起的路燈。哪個細節會改變你的第一印象？",
    decisionTitle: "如果明天只能多問一件事？",
    decisionIntro: "隊伍是真的；原因還沒確定。選一個你想先查的方向。",
    resultLabel: "你的觀察卡", youSaw: "你看到了", nextStep: "明天的小動作",
    boundaryTitle: "還不能說", download: "下載觀察卡", again: "換個問題再看",
    disclosure: "虛構互動示範／成效未驗證。這不是真實店家的營運分析；你的選擇不預測生意結果。",
    tradeBridgeLabel: "把方法帶到貿易街", tradeBridgeTitle: "一櫃貨出海，也要先問對問題。",
    tradeBridgeBody: "剛才練習分清線索與結論。接著看看一櫃貨經過十二站時，哪些事情要由誰接力確認。",
    tradeBridgeLink: "走進貿易街 ↗",
    contrastTitle: "同一個問題，兩種可能的回答", contrastHint: "點開比較下一步。這是假設對照，不是你選完問題後的預測結果。",
    contrastEmpty: "答案還沒出現。先看看兩種回答，會如何改變下一步。", assumptionLabel: "假設問到的回答", contrastAction: "這時可以先做",
    timelineSeen: "今晚看見", timelineAsk: "明天詢問", timelineFollow: "接著追查",
    followupTitle: "接著只追一個訊號", followupHint: "假設這是明天問到的答案，你接下來會先記哪件事？",
    followupEmpty: "選一個訊號，再看它能解答什麼、仍不能解答什麼。", followupLearn: "這能幫你看清", followupUnknown: "仍不能因此說",
    cardFollowup: "接著追查", cardStillUnknown: "仍不能說",
    scenarioLabel: "換個時段看看", scenarioGroup: "選擇觀察時段",
    scenarios: { weekday: "平日傍晚", weekend: "週末傍晚" },
    compareTitle: "把兩個時段放在一起看", compareHint: "同一幅插畫呈現兩種時段設定。",
    comparePrompt: "兩個時段都點過「隊伍」，就能查看對照。",
    compareWeekdayLabel: "平日傍晚", compareWeekendLabel: "週末傍晚",
    compareSharedLabel: "兩個情境都看見", compareShared: "三位客人在等候。",
    compareUnknownLabel: "仍不知道", compareUnknown: "這是否在多個日子持續、每個人為何等候，以及是否會回訪。",
    compareNextLabel: "下一個可查問題", compareNext: "在相近的平日與週末時段重複記錄等候、取預訂與現買。",
    compareCardTitle: "兩個時段的對照", compareCardText: "平日和週末的情境設定都呈現三位客人在等候。",
    routeProgress: n => `已走過 ${n}/6 條追查路線`,
    businessLabel: "放到生意裡是……",
    business: {
      rhythm: { weekday: "平日傍晚有人排隊，是一個線索；還要比較其他時段和回訪，才能看出來客是否持續。", weekend: "週末傍晚有人排隊，是一個線索；還要比較平日和回訪，不能把週末尖峰當成每天的需求。" },
      reason: { weekday: "平日傍晚的隊伍裡，可能有人取預訂；人數不等於臨時進店購買的人數。", weekend: "週末傍晚的隊伍裡，可能有人取預訂；人數不等於臨時進店購買的人數。" },
      capacity: { weekday: "平日傍晚等候久，可能卡在結帳或出爐；找出慢點仍不代表適合開分店。", weekend: "週末傍晚等候久，可能是尖峰服務負荷；加快流程仍不代表適合開分店。" },
    },
    businessChainTitle: "從線索到交易，還差幾個確認？",
    businessChainIntro: "排隊是起點。每往下一步，都要補上新的觀察。",
    businessChainQueueTitle: "看見等候", businessChainQueue: "有人停下來等；還不知道他們為什麼等，或最後是否購買。",
    businessChainReasonTitle: "弄清原因", businessChainReason: "分清現場購買、預訂取貨或其他等候原因；原因本身仍不代表交易完成。",
    businessChainSaleTitle: "確認交易", businessChainSale: "觀察是否有人完成購買；一次交易仍不能說明會不會回來。",
    businessChainReturnTitle: "觀察回訪與供應", businessChainReturn: "看客人是否再來，也看店家能否持續供應與服務。",
    businessChainTradeBridge: "放到貿易裡也是一樣：排隊不等於買單，就像詢盤不等於訂單。",
    scenarioQueue: {
      weekday: { seen: "平日傍晚有三位客人在等候。", possible: "此刻確實有人願意停下來等。", unknown: "其他平日與週末也一樣嗎？每個人為什麼排隊？" },
      weekend: { seen: "週末傍晚有三位客人在等候。", possible: "此刻確實有人願意停下來等。", unknown: "平日傍晚也一樣嗎？每個人為什麼排隊？" },
    },
    scenarioRhythm: {
      weekday: [
        { answer: "週末傍晚也經常有人等", action: "把平日與週末相近時段分開記錄，再看等候和回訪是否一起持續。" },
        { answer: "平日傍晚才偶爾排隊", action: "記下幾個平日晚間的來客與剩貨，確認眼前是否只是短暫尖峰。" },
      ],
      weekend: [
        { answer: "平日傍晚也經常有人等", action: "把平日與週末相近時段分開記錄，再看等候和回訪是否一起持續。" },
        { answer: "週末或限量出爐時才排", action: "對照週末尖峰與出爐時段，先確認隊伍是否集中在特定時刻。" },
      ],
    },
    seen: "看到的", possible: "可能意味", unknown: "還不知道",
    count: n => `已看過 ${n} / 4 處`,
    seenList: names => `已看：${names.join("、")}`,
    need: n => `再看 ${n} 處細節，就能選一個問題。`,
    ready: "線索夠開始提問了；也可以把其他地方看完。",
    imageAlt: "十二月黃昏的街角麵包店，店內透著暖光，幾個人在門口等候，旁邊路燈亮起。",
    resultBoundary: "這是虛構情境；排隊不能證明穩定需求或擴店可行。",
    cardCaption: "一段隊伍，是線索，不是結論。", cardFirst: "第一眼想到",
    cardSeen: "看到的線索", cardNext: "下一個問題", cardAction: "先做的小觀察",
    cardBoundary: "這是虛構情境；排隊不能證明穩定需求或擴店可行。",
    clues: {
      window: { name: "櫥窗", seen: "架上還有好幾盤麵包，一位店員正忙著服務。", possible: "排隊也可能與服務速度有關。", unknown: "平均要等多久？忙碌只發生在這一刻嗎？" },
      bags: { name: "紙袋", seen: "櫃檯放著幾個已包好的紙袋。", possible: "有些人也許是來取預訂，而非臨時購買。", unknown: "預訂佔多少？這些人還會再來嗎？" },
      queue: { name: "隊伍", seen: "今晚有三位客人在等候。", possible: "此刻確實有人願意停下來等。", unknown: "平日也是這樣嗎？每個人為什麼排隊？" },
      lamp: { name: "路燈", seen: "路燈已亮，街上進入傍晚。", possible: "你看到的是一天中的一個時段。", unknown: "上午、午間和其他日子又如何？" },
    },
    questions: {
      rhythm: { title: "不同時段也會排嗎？", tease: "確認今晚是不是例外。", result: "先看一整天的節奏", action: "用一週記下不同時段的等候與來客，再比較週末和平日。", lensSeen: "你看過路燈：眼前只是傍晚的一段，值得再比較其他時段。", lensMissing: "還沒看路燈？今晚的隊伍，不能代表整天的節奏。" },
      reason: { title: "大家是為什麼而等？", tease: "區分預訂、現買與等候原因。", result: "先問隊伍為何形成", action: "問幾位願意回答的客人是來取預訂還是現買，並觀察等在哪一段。", lensSeen: "你看過紙袋：已包好的袋子讓預訂取貨成為一種可能。", lensMissing: "還沒看紙袋？同一條隊伍裡，可能有人在等不同的事。" },
      capacity: { title: "慢的是哪一道工序？", tease: "先找出等待發生的地方。", result: "先找真正的瓶頸", action: "觀察取貨、結帳與補貨各花多久，再試一項可撤回的小改動。", lensSeen: "你看過櫥窗：架上有貨，等待也可能發生在服務過程。", lensMissing: "還沒看櫥窗？先分清缺貨、結帳與取貨哪裡讓人停下。" },
    },
  },
  en: {
    skip: "Skip to content", draft: "Interactive demo", title: "Secrets on the Corner", heroPrompt: "Keep a first thought ↘", backToScene: "Explore another point ↑",
    intro: "A line forms outside a small shop. Is it a sign of steady business—or one moment tonight?",
    lede: "Start with four details. There is no answer to guess; find a better question to ask next.",
    start: "Take a closer look", explore: "What do you notice on this street?",
    exploreHint: "Select a glowing point to open a field note.", notebook: "Field notes",
    impressionTitle: "What does the line suggest at first glance?",
    impressionHint: "Keep your first thought, then see what the clues make you ask. You can skip this; there is no right answer.",
    impressionSteady: "Business may be steady", impressionPickup: "Perhaps many are collecting pre-orders",
    impressionUncertain: "Too soon to tell", impressionSkip: "Explore the clues →",
    impressionSaved: value => `Your first thought: ${value}`,
    reflectionBefore: "At first you thought", reflectionNow: "Now you want to ask",
    reflectionHint: "This is not a right-or-wrong verdict. The clues help sharpen your next question.",
    emptyTitle: "Slow down. See more.",
    emptyBody: "Fresh bread, waiting neighbors, a streetlamp turning on. Which detail changes your first impression?",
    decisionTitle: "If you could ask one more question tomorrow?",
    decisionIntro: "The line is real. Its cause is still unclear. Choose what you would check first.",
    resultLabel: "Your field card", youSaw: "You observed", nextStep: "A small move tomorrow",
    boundaryTitle: "What you cannot claim yet", download: "Download field card", again: "Try another question",
    disclosure: "Fictional interactive demo / outcomes not validated. This is not an analysis of a real shop; your choice does not predict a business outcome.",
    tradeBridgeLabel: "Take the method to Trade Street", tradeBridgeTitle: "A container journey starts with better questions, too.",
    tradeBridgeBody: "You just separated clues from conclusions. Now see who needs to confirm what as one container passes through twelve stops.",
    tradeBridgeLink: "Explore Trade Street ↗",
    contrastTitle: "One question, two possible answers", contrastHint: "Open each answer to compare the next move. These are hypothetical alternatives, not predictions from your choice.",
    contrastEmpty: "You do not have an answer yet. Explore how two different answers would change the next move.", assumptionLabel: "Hypothetical answer", contrastAction: "A next move in this case",
    timelineSeen: "Seen tonight", timelineAsk: "Ask tomorrow", timelineFollow: "Follow a signal",
    followupTitle: "Follow just one signal next", followupHint: "If tomorrow brought this answer, what would you track first?",
    followupEmpty: "Choose a signal to see what it could clarify and what it still could not prove.", followupLearn: "This could clarify", followupUnknown: "It still would not prove",
    cardFollowup: "Signal to follow", cardStillUnknown: "Still unproven",
    scenarioLabel: "Change the time", scenarioGroup: "Choose a time to observe",
    scenarios: { weekday: "Weekday evening", weekend: "Weekend evening" },
    compareTitle: "Put the two moments side by side", compareHint: "One illustration shows two different time settings.",
    comparePrompt: "Select the queue in both time settings to see the comparison.",
    compareWeekdayLabel: "Weekday evening", compareWeekendLabel: "Weekend evening",
    compareSharedLabel: "Seen in both scenarios", compareShared: "Three people are waiting.",
    compareUnknownLabel: "Still unknown", compareUnknown: "Whether this continues across days, why each person is waiting, and whether they return.",
    compareNextLabel: "A useful next question", compareNext: "Repeat notes at similar weekday and weekend times, separating waits, pre-order pickups, and walk-in purchases.",
    compareCardTitle: "Two moments compared", compareCardText: "Both weekday and weekend settings show three people waiting.",
    routeProgress: n => `${n} of 6 follow-up routes explored`,
    businessLabel: "In a business, this could mean…",
    business: {
      rhythm: { weekday: "A weekday-evening line is one clue. Compare other times and repeat visits before calling the traffic steady.", weekend: "A weekend-evening line is one clue. Compare weekdays and repeat visits; a weekend peak is not everyday demand." },
      reason: { weekday: "Some people in a weekday-evening line may be collecting pre-orders; the line does not equal walk-in purchases.", weekend: "Some people in a weekend-evening line may be collecting pre-orders; the line does not equal walk-in purchases." },
      capacity: { weekday: "A long weekday-evening wait may come from payment or baking. Finding the slow step alone does not justify another shop.", weekend: "A long weekend-evening wait may come from peak service load. A faster process alone does not justify another shop." },
    },
    businessChainTitle: "From a signal to a sale: what still needs checking?",
    businessChainIntro: "A queue is a starting point. Each next step needs another observation.",
    businessChainQueueTitle: "Notice the wait", businessChainQueue: "People have stopped to wait. We do not yet know why, or whether they will buy.",
    businessChainReasonTitle: "Find the reason", businessChainReason: "Separate walk-in purchases, pre-order pickups, and other reasons for waiting. The reason alone does not confirm a sale.",
    businessChainSaleTitle: "Confirm a transaction", businessChainSale: "Observe whether a purchase is completed. One sale still cannot tell us whether someone will return.",
    businessChainReturnTitle: "Look for return visits and supply", businessChainReturn: "See whether people come back and whether the shop can keep serving them.",
    businessChainTradeBridge: "The same goes for trade: a queue is not a sale, just as an inquiry is not an order.",
    scenarioQueue: {
      weekday: { seen: "Three people are waiting on a weekday evening.", possible: "Some people are willing to pause here now.", unknown: "Is this true on other weekdays and weekends? Why is each person waiting?" },
      weekend: { seen: "Three people are waiting on a weekend evening.", possible: "Some people are willing to pause here now.", unknown: "Is this true on weekdays too? Why is each person waiting?" },
    },
    scenarioRhythm: {
      weekday: [
        { answer: "People often wait on weekend evenings too", action: "Track weekday and weekend waits at comparable times, then see whether waits and repeat visits persist together." },
        { answer: "The line appears only on some weekday evenings", action: "Note weekday visits and leftovers for several evenings to see whether this is a short peak." },
      ],
      weekend: [
        { answer: "People often wait on weekday evenings too", action: "Track weekday and weekend waits at comparable times, then see whether waits and repeat visits persist together." },
        { answer: "The line appears only on weekends or at limited releases", action: "Compare the weekend peak with baking times to see whether the line clusters around one moment." },
      ],
    },
    seen: "Observed", possible: "It might mean", unknown: "Still unknown",
    count: n => `${n} of 4 details seen`,
    seenList: names => `Seen: ${names.join(", ")}`,
    need: n => `Explore ${n} more detail${n === 1 ? "" : "s"} to choose a question.`,
    ready: "You can ask a question now—or inspect the other details first.",
    imageAlt: "A warm bakery window on a December evening, several people waiting outside, and a streetlamp lighting the lane.",
    resultBoundary: "This is a fictional scenario; a queue cannot establish steady demand or whether expansion would work.",
    cardCaption: "A line is a clue, not a conclusion.", cardFirst: "First thought",
    cardSeen: "Observed clues", cardNext: "Next question", cardAction: "Small observation",
    cardBoundary: "This is a fictional scenario; a queue cannot establish steady demand or whether expansion would work.",
    clues: {
      window: { name: "The window", seen: "Several trays still hold bread while one baker serves customers.", possible: "The line may partly reflect service speed.", unknown: "How long is the wait? Is it busy only now?" },
      bags: { name: "Paper bags", seen: "Several packed paper bags wait on the counter.", possible: "Some people may be picking up pre-orders rather than shopping on impulse.", unknown: "What share is pre-ordered? Do they return?" },
      queue: { name: "The line", seen: "Three people are waiting tonight.", possible: "Some people are willing to pause here now.", unknown: "Is this typical? Why is each person waiting?" },
      lamp: { name: "The streetlamp", seen: "The lamp is on: it is already evening.", possible: "You are seeing one slice of the day.", unknown: "What happens in the morning, at noon, or on other days?" },
    },
    questions: {
      rhythm: { title: "Does the line appear at other times?", tease: "Find out whether tonight is unusual.", result: "Look at the whole day's rhythm", action: "Record waits and visits at different times for a week, comparing weekdays and the weekend.", lensSeen: "You noticed the lamp: this is only a glimpse of the evening. Other times are still worth checking.", lensMissing: "Haven't looked at the lamp? Tonight's line cannot stand in for the whole day." },
      reason: { title: "What is everyone waiting for?", tease: "Separate pre-orders, purchases, and delay.", result: "Ask why the line forms", action: "Ask a few willing customers whether they are collecting orders or buying now, and observe where the wait occurs.", lensSeen: "You noticed the bags: packed orders make pickup one possible reason for waiting.", lensMissing: "Haven't looked at the bags? People in the same line may be waiting for different things." },
      capacity: { title: "Where does the wait happen?", tease: "Find the slow part of the process.", result: "Find the real bottleneck", action: "Observe the time spent on pickup, payment, and restocking; then try one reversible change.", lensSeen: "You noticed the window: bread is available, so service may be part of the wait.", lensMissing: "Haven't looked at the window? First separate a sellout from slow payment or pickup." },
    },
  },
};

const alternatives = {
  zh: {
    rhythm: [
      { answer: "平日晚間也經常有人等", action: "分開記錄新客、熟客與等候時間，再看持續的來客和服務負荷是否一起出現。" },
      { answer: "只有週末或限量出爐時才排", action: "先看尖峰與出爐時段的關係，試調整取貨節奏；不要把短暫尖峰當成全天需求。" },
    ],
    reason: [
      { answer: "多數人是來取預訂", action: "比較約定取貨與實際等候的時間，試把取貨與現買的交接分清楚。" },
      { answer: "多數人是臨時進店買", action: "問客人為什麼選這間店，並觀察不同時段的來客與回訪，確認吸引力是否持續。" },
    ],
    capacity: [
      { answer: "麵包有貨，慢在取貨或結帳", action: "先量交接與結帳的等候，試簡化一項步驟，再比較是否真的縮短等待。" },
      { answer: "客人在等下一批麵包出爐", action: "記下品項售罄與補貨的時間，先試小批次排程調整，再看等待與剩貨一起怎麼變。" },
    ],
  },
  en: {
    rhythm: [
      { answer: "People often wait on weekday evenings too", action: "Track new and returning customers separately, alongside wait times, to see whether repeat visits and service pressure persist together." },
      { answer: "The line appears only on weekends or at limited releases", action: "Compare peaks with baking times and try a small pickup adjustment. A short rush alone does not establish all-day demand." },
    ],
    reason: [
      { answer: "Most people are collecting pre-orders", action: "Compare promised pickup times with actual waits, then try a clearer handoff for pickups and walk-in purchases." },
      { answer: "Most people are walking in to buy now", action: "Ask why customers chose this shop and observe visits and returns at different times to check whether its appeal persists." },
    ],
    capacity: [
      { answer: "Bread is available; pickup or payment is slow", action: "Measure handoff and payment waits, simplify one step, and compare whether the wait actually falls." },
      { answer: "Customers are waiting for the next batch", action: "Record sellout and restocking times, try a small batch-scheduling change, and observe both waiting and leftover bread." },
    ],
  },
};

const followups = {
  zh: {
    rhythm: [
      [
        { title: "熟客是否再來", learn: "記下願意回答的回訪者，看看這週的等候是否持續由同一批人支撐。", unknown: "回訪本身仍不能推算另一間店的需求。" },
        { title: "等候是否變長", learn: "在相同時段記下從排隊到取貨的時間，分開看來客與服務負荷。", unknown: "等待時間仍不能說明顧客會不會持續購買。" },
      ],
      [
        { title: "尖峰碰上哪次出爐", learn: "對照出爐時刻與隊伍起落，看看尖峰是否集中在特定一批商品。", unknown: "一次尖峰仍不是全天穩定需求。" },
        { title: "平日剩貨與等待", learn: "把平日剩貨和等待一起記下，看看忙碌與供給是否只在週末錯開。", unknown: "幾天的記錄仍不足以判定擴店。" },
      ],
    ],
    reason: [
      [
        { title: "預訂取貨是否準時", learn: "對照約定與實際取貨時間，找出客人究竟在等哪個交接環節。", unknown: "取貨流程順暢，不代表現買需求增加。" },
        { title: "現買客等在哪裡", learn: "分開觀察現買與取貨的隊伍，看看兩種服務是否互相擠在一起。", unknown: "分流改善仍不能證明會有更多客人。" },
      ],
      [
        { title: "客人是否回訪", learn: "記下願意回答的人是否曾來過，再和不同時段的來客一起看。", unknown: "幾位客人的回答不能代表全部顧客。" },
        { title: "為何走進這間店", learn: "問願意回答的客人是被品項、位置，還是剛好路過吸引。", unknown: "說出的理由，不等於日後一定會再買。" },
      ],
    ],
    capacity: [
      [
        { title: "慢在結帳還是交付", learn: "把等待分成排隊、付款與拿到麵包三段，先找到時間花在哪裡。", unknown: "找出慢點，仍不能說明需求是否長期存在。" },
        { title: "小改動後等候有沒有縮短", learn: "只改一個可撤回的步驟，對照相近時段的等候與出錯情況。", unknown: "流程變快，不等於值得開第二間店。" },
      ],
      [
        { title: "哪項麵包先售罄", learn: "記下品項與售罄時刻，看看等待是否集中在少數商品。", unknown: "熱賣一款，不能代表整間店的需求。" },
        { title: "下一批之後是否剩貨", learn: "連同下一批出爐後的等待與剩貨一起觀察，避免只看到排隊。", unknown: "一週的供給調整仍不是擴店結論。" },
      ],
    ],
  },
  en: {
    rhythm: [
      [
        { title: "Do familiar faces return?", learn: "Note willing returning visitors to see whether the week's waits are sustained by the same people.", unknown: "Repeat visits alone cannot estimate demand for another shop." },
        { title: "Does the wait grow?", learn: "At comparable times, record the minutes from joining the line to receiving bread; separate arrivals from service load.", unknown: "Wait time alone cannot show whether customers will keep buying." },
      ],
      [
        { title: "Which bake creates the peak?", learn: "Compare baking times with the rise and fall of the line to see whether one batch drives the rush.", unknown: "One rush still cannot establish all-day demand." },
        { title: "Weekday leftovers and waits", learn: "Track both leftover bread and weekday waits to see when supply and visitors are out of step.", unknown: "A few days of notes cannot decide an expansion." },
      ],
    ],
    reason: [
      [
        { title: "Are pre-orders ready on time?", learn: "Compare promised and actual pickup times to locate the handoff that makes people wait.", unknown: "A smooth pickup flow does not establish stronger walk-in demand." },
        { title: "Where do walk-ins wait?", learn: "Observe pickups and walk-ins separately to see whether the two services crowd each other.", unknown: "A better queue does not prove that more people will come." },
      ],
      [
        { title: "Do customers return?", learn: "Ask willing visitors whether they have been here before and compare arrivals across different times.", unknown: "A few answers cannot stand in for all customers." },
        { title: "Why this bakery?", learn: "Ask willing visitors whether a product, the location, or a chance stop brought them in.", unknown: "A stated reason is not a promise to buy again." },
      ],
    ],
    capacity: [
      [
        { title: "Is it payment or handoff?", learn: "Split the wait into line, payment, and receiving bread to see where minutes are spent.", unknown: "Finding the slow step does not establish lasting demand." },
        { title: "Does one small change help?", learn: "Change one reversible step, then compare waits and mistakes at similar times.", unknown: "A faster process alone cannot justify a second shop." },
      ],
      [
        { title: "Which bread sells out first?", learn: "Note products and sellout times to see whether waiting clusters around a few items.", unknown: "One popular item cannot represent demand for the whole shop." },
        { title: "What remains after the next bake?", learn: "Watch both waits and leftovers after the next batch instead of looking at the line alone.", unknown: "A week of supply changes is still not an expansion verdict." },
      ],
    ],
  },
};

const clueOrder = ["window", "bags", "queue", "lamp"];
const questionOrder = ["rhythm", "reason", "capacity"];
const questionClue = { rhythm: "lamp", reason: "bags", capacity: "window" };
const viewed = new Set();
const viewedByScenario = { weekday: new Set(), weekend: new Set() };
const exploredRoutes = new Set();
let activeClue = null;
let chosenQuestion = null;
let chosenAlternative = null;
let chosenFollowup = null;
let lang = new URLSearchParams(location.search).get("lang") === "en" ? "en" : "zh";
let scenario = new URLSearchParams(location.search).get("period") === "weekend" ? "weekend" : "weekday";
let firstImpression = null;
let impressionSkipped = false;

const node = id => document.getElementById(id);

function renderImpression() {
  const panel = node("first-impression");
  panel.hidden = impressionSkipped || (viewed.size > 0 && firstImpression === null);
  document.querySelector(".hero-prompt").hidden = panel.hidden;
  document.querySelector(".start-link").href = panel.hidden ? "#explore-title" : "#first-impression";
  if (panel.hidden) return;
  const options = node("impression-options");
  options.hidden = viewed.size > 0;
  document.querySelectorAll("[data-impression]").forEach(button => {
    button.setAttribute("aria-pressed", String(button.dataset.impression === firstImpression));
  });
  const status = node("impression-status");
  status.hidden = viewed.size === 0 || firstImpression === null;
  if (!status.hidden) status.textContent = copy[lang].impressionSaved(copy[lang][`impression${firstImpression[0].toUpperCase()}${firstImpression.slice(1)}`]);
}

function getClue(id) {
  const clue = copy[lang].clues[id];
  return id === "queue" ? { ...clue, ...copy[lang].scenarioQueue[scenario] } : clue;
}

function getAlternatives(question = chosenQuestion) {
  if (question === "rhythm") return copy[lang].scenarioRhythm[scenario];
  return alternatives[lang][question];
}

function updateRouteProgress() {
  node("route-progress").textContent = copy[lang].routeProgress(exploredRoutes.size);
}

function updateScenarioControls() {
  const t = copy[lang];
  document.querySelector(".scenario-switch").setAttribute("aria-label", t.scenarioGroup);
  document.querySelectorAll("[data-scenario]").forEach(button => {
    button.textContent = t.scenarios[button.dataset.scenario];
    button.setAttribute("aria-pressed", String(button.dataset.scenario === scenario));
  });
  updateRouteProgress();
}

function renderScenarioComparison() {
  const available = viewedByScenario.weekday.has("queue") && viewedByScenario.weekend.has("queue");
  const section = node("scenario-comparison");
  section.hidden = !available;
  if (!available) return;
  node("comparison-weekday").textContent = copy[lang].scenarioQueue.weekday.seen;
  node("comparison-weekend").textContent = copy[lang].scenarioQueue.weekend.seen;
}

function makePart(label, value) {
  const wrapper = document.createElement("div");
  wrapper.className = "clue-part";
  const kicker = document.createElement("span");
  kicker.textContent = label;
  const text = document.createElement("p");
  text.textContent = value;
  wrapper.append(kicker, text);
  return wrapper;
}

function renderNote() {
  const area = node("note-content");
  area.replaceChildren();
  const t = copy[lang];
  if (!activeClue) {
    const lamp = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    lamp.setAttribute("class", "note-lamp");
    lamp.setAttribute("viewBox", "0 0 70 100");
    lamp.setAttribute("aria-hidden", "true");
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("d", "M35 5v11M24 27h22l8 24H16l8-24Zm-8 24h38M35 51v39M19 91h32");
    path.setAttribute("fill", "none");
    path.setAttribute("stroke", "currentColor");
    path.setAttribute("stroke-width", "2");
    lamp.append(path);
    const heading = document.createElement("h3"); heading.textContent = t.emptyTitle;
    const body = document.createElement("p"); body.textContent = t.emptyBody;
    area.append(lamp, heading, body);
  } else {
    const clue = getClue(activeClue);
    const heading = document.createElement("h3"); heading.textContent = clue.name;
    area.append(heading, makePart(t.seen, clue.seen), makePart(t.possible, clue.possible), makePart(t.unknown, clue.unknown));
  }
  node("seen-list").textContent = viewed.size ? t.seenList(clueOrder.filter(id => viewed.has(id)).map(id => t.clues[id].name)) : "";
  node("note-back").hidden = !activeClue;
  node("discovery-count").textContent = t.count(viewed.size);
  node("decision-hint").textContent = viewed.size < 2 ? t.need(2 - viewed.size) : t.ready;
  updateRouteProgress();
  renderScenarioComparison();
  renderImpression();
  document.querySelectorAll(".hotspot").forEach(button => {
    const name = t.clues[button.dataset.clue].name;
    button.setAttribute("aria-label", name);
    button.querySelector("span").textContent = name;
    button.setAttribute("aria-pressed", String(activeClue === button.dataset.clue));
  });
  document.querySelectorAll(".question").forEach(button => { button.disabled = viewed.size < 2; });
  if (viewed.size >= 2) renderQuestions();
}

function renderQuestions() {
  const container = node("questions");
  container.replaceChildren();
  questionOrder.forEach(id => {
    const question = copy[lang].questions[id];
    const button = document.createElement("button");
    button.className = "question";
    button.type = "button";
    button.dataset.question = id;
    button.disabled = viewed.size < 2;
    const icon = document.createElement("span"); icon.className = "question-mark"; icon.setAttribute("aria-hidden", "true"); icon.textContent = "?";
    const label = document.createElement("span");
    const strong = document.createElement("strong"); strong.textContent = question.title;
    const small = document.createElement("small"); small.textContent = question.tease;
    const lens = document.createElement("span");
    lens.className = "question-lens";
    lens.textContent = viewed.has(questionClue[id]) ? question.lensSeen : question.lensMissing;
    label.append(strong, small, lens);
    button.append(icon, label);
    button.addEventListener("click", () => chooseQuestion(id));
    container.append(button);
  });
}

function renderResult() {
  if (!chosenQuestion) return;
  const t = copy[lang];
  const question = t.questions[chosenQuestion];
  node("result-title").textContent = question.result;
  const reflection = node("result-reflection");
  reflection.hidden = firstImpression === null;
  if (firstImpression !== null) {
    node("reflection-before").textContent = t[`impression${firstImpression[0].toUpperCase()}${firstImpression.slice(1)}`];
    node("reflection-now").textContent = question.title;
  }
  node("result-lens").textContent = viewed.has(questionClue[chosenQuestion]) ? question.lensSeen : question.lensMissing;
  node("result-action").textContent = question.action;
  node("result-boundary").textContent = t.resultBoundary;
  node("result-business-text").textContent = t.business[chosenQuestion][scenario];
  const list = node("result-seen");
  list.replaceChildren();
  clueOrder.filter(id => viewed.has(id)).forEach(id => {
    const item = document.createElement("li");
    const clue = getClue(id);
    item.textContent = `${clue.name}${lang === "zh" ? "：" : ": "}${clue.seen}`;
    list.append(item);
  });
  renderAlternatives();
}

function renderAlternatives() {
  const container = node("alternatives");
  container.replaceChildren();
  getAlternatives().forEach((alternative, index) => {
    const button = document.createElement("button");
    button.type = "button"; button.className = "alternative";
    button.dataset.alternative = index;
    button.setAttribute("aria-pressed", String(chosenAlternative === index));
    button.textContent = alternative.answer;
    button.addEventListener("click", () => {
      chosenAlternative = index;
      chosenFollowup = null;
      container.querySelectorAll("button").forEach((item, i) => item.setAttribute("aria-pressed", String(i === index)));
      renderAlternativeDetail();
    });
    container.append(button);
  });
  renderAlternativeDetail();
}

function renderAlternativeDetail() {
  const area = node("alternative-detail");
  area.replaceChildren();
  if (chosenAlternative === null) {
    node("followup").hidden = true;
    const hint = document.createElement("p"); hint.textContent = copy[lang].contrastEmpty;area.append(hint);
    return;
  }
  const selected = getAlternatives()[chosenAlternative];
  area.append(makePart(copy[lang].contrastAction, selected.action));
  node("followup").hidden = false;
  renderFollowups();
}

function renderFollowups() {
  const options = node("followup-options");
  options.replaceChildren();
  followups[lang][chosenQuestion][chosenAlternative].forEach((item, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "followup-option";
    button.dataset.followup = index;
    button.setAttribute("aria-pressed", String(chosenFollowup === index));
    button.textContent = item.title;
    button.addEventListener("click", () => {
      chosenFollowup = index;
      exploredRoutes.add(`${chosenQuestion}:${chosenAlternative}`);
      updateRouteProgress();
      options.querySelectorAll("button").forEach((option, i) => option.setAttribute("aria-pressed", String(i === index)));
      renderFollowupDetail();
    });
    options.append(button);
  });
  renderFollowupDetail();
}

function renderFollowupDetail() {
  const area = node("followup-detail");
  area.replaceChildren();
  const t = copy[lang];
  if (chosenFollowup === null) {
    const hint = document.createElement("p");
    hint.textContent = t.followupEmpty;
    area.append(hint);
    return;
  }
  const item = followups[lang][chosenQuestion][chosenAlternative][chosenFollowup];
  area.append(makePart(t.followupLearn, item.learn), makePart(t.followupUnknown, item.unknown));
}

function chooseQuestion(id) {
  if (viewed.size < 2) return;
  chosenQuestion = id;
  chosenAlternative = null;
  chosenFollowup = null;
  node("result").hidden = false;
  renderResult();
  node("result-title").focus({ preventScroll: true });
  node("result").scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "start" });
}

function chooseScenario(next) {
  if (scenario === next) return;
  scenario = next;
  chosenQuestion = null;
  chosenAlternative = null;
  chosenFollowup = null;
  node("result").hidden = true;
  const url = new URL(location.href);
  url.searchParams.set("period", scenario);
  history.replaceState(null, "", url);
  updateScenarioControls();
  renderScenarioComparison();
  renderNote();
  renderQuestions();
}

function setLanguage(next) {
  lang = next;
  document.documentElement.lang = lang === "zh" ? "zh-Hant" : "en";
  document.title = lang === "zh" ? "街角的秘密 · Secrets on the Corner" : "Secrets on the Corner · 街角的秘密";
  document.querySelectorAll("[data-i18n]").forEach(element => { element.textContent = copy[lang][element.dataset.i18n]; });
  document.querySelectorAll("[data-lang]").forEach(button => button.setAttribute("aria-pressed", String(button.dataset.lang === lang)));
  node("trade-bridge-link").href = `/prototype/trade-street/?lang=${lang}`;
  updateScenarioControls();
  node("scene-image").alt = copy[lang].imageAlt;
  const url = new URL(location.href);
  url.searchParams.set("lang", lang);
  url.searchParams.set("period", scenario);
  history.replaceState(null, "", url);
  renderQuestions();
  renderNote();
  renderResult();
}

function wrapText(ctx, text, x, y, maxWidth, lineHeight, maxLines = 99) {
  let line = "", count = 0;
  const tokens = lang === "en" ? text.split(/(\s+)/) : [...text];
  for (const token of tokens) {
    if (ctx.measureText(line + token).width > maxWidth && line) {
      ctx.fillText(line, x, y); y += lineHeight; count++;
      if (count >= maxLines) return y;
      line = token.trimStart();
    } else line += token;
  }
  if (line && count < maxLines) { ctx.fillText(line, x, y); y += lineHeight; }
  return y;
}

function downloadCard() {
  if (!chosenQuestion) return;
  const t = copy[lang], question = t.questions[chosenQuestion];
  const canvas = document.createElement("canvas");
  canvas.width = 1200; canvas.height = 1700;
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#f4f0e7"; ctx.fillRect(0,0,1200,1700);
  ctx.fillStyle = "#193644"; ctx.fillRect(0,0,1200,13);
  ctx.fillStyle = "#9e5d37"; ctx.font = "700 23px system-ui, sans-serif"; ctx.fillText(t.title, 72,76);
  ctx.fillStyle = "#3e5360"; ctx.font = "600 22px system-ui, sans-serif"; ctx.fillText(t.scenarios[scenario], 850,76);
  ctx.fillStyle = "#172934"; ctx.font = "700 58px serif";
  const headingEnd = wrapText(ctx,question.result,72,160,1056,69,2);
  const contentTop = headingEnd + 70;
  ctx.strokeStyle = "#aebbbb"; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(72,headingEnd+12);ctx.lineTo(1128,headingEnd+12);ctx.stroke();
  ctx.fillStyle = "#9e5d37"; ctx.font = "700 24px system-ui, sans-serif";ctx.fillText(t.cardSeen,72,contentTop);
  ctx.fillStyle = "#172934";ctx.font = "26px system-ui, sans-serif";
  let y = contentTop + 49;
  clueOrder.filter(id=>viewed.has(id)).forEach(id => {
    const clue = getClue(id);
    y=wrapText(ctx,clue.name+(lang === "zh" ? "：" : ": ")+clue.seen,72,y,475,37,3)+19;
  });
  if (firstImpression !== null) {
    ctx.fillStyle = "#9e5d37"; ctx.font = "700 22px system-ui, sans-serif"; ctx.fillText(t.cardFirst,72,y+16);
    ctx.fillStyle = "#172934"; ctx.font = "24px system-ui, sans-serif";
    wrapText(ctx,t[`impression${firstImpression[0].toUpperCase()}${firstImpression.slice(1)}`],72,y+53,475,35,3);
    y += 134;
  }
  if (viewedByScenario.weekday.has("queue") && viewedByScenario.weekend.has("queue")) {
    ctx.fillStyle = "#9e5d37"; ctx.font = "700 22px system-ui, sans-serif"; ctx.fillText(t.compareCardTitle,72,y+12);
    ctx.fillStyle = "#172934"; ctx.font = "23px system-ui, sans-serif";
    const compareEnd = wrapText(ctx,t.compareCardText,72,y+52,475,34,5);
    ctx.fillStyle = "#9e5d37"; ctx.font = "700 20px system-ui, sans-serif"; ctx.fillText(t.compareNextLabel,72,compareEnd+20);
    ctx.fillStyle = "#172934"; ctx.font = "22px system-ui, sans-serif";
    wrapText(ctx,t.compareNext,72,compareEnd+55,475,32,4);
  }
  ctx.fillStyle = "#9e5d37";ctx.font = "700 24px system-ui, sans-serif";ctx.fillText(t.cardNext,650,contentTop);
  ctx.fillStyle = "#172934";ctx.font = "700 29px system-ui, sans-serif";
  let rightY=wrapText(ctx,question.title,650,contentTop+49,450,42,3)+28;
  let action = question.action;
  if (chosenAlternative !== null) {
    const selected = getAlternatives()[chosenAlternative];
    ctx.fillStyle = "#9e5d37";ctx.font = "700 23px system-ui, sans-serif";ctx.fillText(t.assumptionLabel,650,rightY);
    ctx.fillStyle = "#172934";ctx.font = "25px system-ui, sans-serif";
    rightY=wrapText(ctx,selected.answer,650,rightY+43,450,36,3)+27;
    action=selected.action;
  }
  ctx.fillStyle = "#9e5d37";ctx.font = "700 24px system-ui, sans-serif";ctx.fillText(t.cardAction,650,rightY);
  ctx.fillStyle = "#172934";ctx.font = "25px system-ui, sans-serif";
  rightY = wrapText(ctx,action,650,rightY+46,450,37,6) + 28;
  ctx.fillStyle = "#9e5d37";ctx.font = "700 22px system-ui, sans-serif";ctx.fillText(t.businessLabel,650,rightY);
  ctx.fillStyle = "#172934";ctx.font = "23px system-ui, sans-serif";
  rightY = wrapText(ctx,t.business[chosenQuestion][scenario],650,rightY+38,450,33,5)+24;
  if (chosenAlternative !== null && chosenFollowup !== null) {
    const signal = followups[lang][chosenQuestion][chosenAlternative][chosenFollowup];
    ctx.fillStyle = "#9e5d37";ctx.font = "700 24px system-ui, sans-serif";ctx.fillText(t.cardFollowup,650,rightY);
    ctx.fillStyle = "#172934";ctx.font = "700 25px system-ui, sans-serif";
    rightY = wrapText(ctx,signal.title,650,rightY+40,450,36,2) + 12;
    ctx.font = "23px system-ui, sans-serif";
    rightY = wrapText(ctx,signal.learn,650,rightY,450,34,5) + 20;
    ctx.fillStyle = "#9e5d37";ctx.font = "700 22px system-ui, sans-serif";ctx.fillText(t.cardStillUnknown,650,rightY);
    ctx.fillStyle = "#172934";ctx.font = "23px system-ui, sans-serif";
    wrapText(ctx,signal.unknown,650,rightY+38,450,34,4);
  }
  ctx.strokeStyle = "#aebbbb";ctx.beginPath();ctx.moveTo(72,1540);ctx.lineTo(1128,1540);ctx.stroke();
  ctx.fillStyle = "#9e5d37";ctx.font = "700 22px system-ui, sans-serif";ctx.fillText(t.cardStillUnknown,72,1582);
  ctx.fillStyle = "#3e5360";ctx.font = "21px system-ui, sans-serif";wrapText(ctx,t.cardBoundary,72,1622,1050,31,2);
  const link = document.createElement("a");
  link.download = lang === "zh" ? "街角的秘密-觀察卡.png" : "secrets-on-the-corner-field-card.png";
  link.href = canvas.toDataURL("image/png");
  document.body.append(link);
  link.click();
  link.remove();
}

document.querySelectorAll("[data-lang]").forEach(button => button.addEventListener("click", () => setLanguage(button.dataset.lang)));
document.querySelectorAll("[data-scenario]").forEach(button => button.addEventListener("click", () => chooseScenario(button.dataset.scenario)));
document.querySelectorAll("[data-impression]").forEach(button => button.addEventListener("click", () => {
  if (viewed.size > 0) return;
  firstImpression = button.dataset.impression;
  renderImpression();
}));
node("impression-skip").addEventListener("click", () => {
  if (viewed.size > 0) return;
  firstImpression = null;
  impressionSkipped = true;
  renderImpression();
});
document.querySelectorAll(".hotspot").forEach(button => button.addEventListener("click", () => {
  activeClue = button.dataset.clue;
  viewed.add(activeClue);
  viewedByScenario[scenario].add(activeClue);
  renderScenarioComparison();
  renderNote();
  const heading = node("note-content").querySelector("h3");
  heading.tabIndex = -1;
  heading.focus({ preventScroll: true });
  node("field-note").scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "start" });
  if (chosenQuestion) renderResult();
}));
node("download").addEventListener("click", downloadCard);
node("try-again").addEventListener("click", () => {
  chosenQuestion = null;
  chosenAlternative = null;
  chosenFollowup = null;
  node("result").hidden = true;
  node("decision-title").focus({ preventScroll: true });
  node("decision").scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "start" });
});
setLanguage(lang);
