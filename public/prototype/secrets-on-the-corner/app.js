const copy = {
  zh: {
    skip: "跳至內容", draft: "示意玩具，不是店家分析。", title: "街角的秘密", heroPrompt: "先記下第一眼 ↘", backToScene: "再看其他光點 ↑",
    intro: "一間小店門口排了隊。這是穩定生意的訊號，還是今晚的一刻？",
    lede: "從街角的細節開始。你不必猜對答案；只要找到下一個值得問的問題。",
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
    disclosure: "示意玩具，虛構情境；不是真實店家的營運分析，你的選擇不預測生意結果。",
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
    compareSharedLabel: "兩個情境都看見", compareShared: "幾位客人在等候。",
    compareUnknownLabel: "仍不知道", compareUnknown: "這是否在多個日子持續、每個人為何等候，以及是否會回訪。",
    compareNextLabel: "下一個可查問題", compareNext: "在相近的平日與週末時段重複記錄等候、取預訂與現買。",
    compareCardTitle: "兩個時段的對照", compareCardText: "平日和週末的情境設定都呈現幾位客人在等候。",
    routeProgress: n => n ? "你已經試過不同的追查方向。" : "",
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
      weekday: { seen: "平日傍晚有幾位客人在等候。", possible: "此刻確實有人願意停下來等。", unknown: "其他平日與週末也一樣嗎？每個人為什麼排隊？" },
      weekend: { seen: "週末傍晚有幾位客人在等候。", possible: "此刻確實有人願意停下來等。", unknown: "平日傍晚也一樣嗎？每個人為什麼排隊？" },
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
    count: n => n === clueOrder.length ? "細節都看過了" : "還有細節沒看",
    seenList: names => `已看：${names.join("、")}`,
    need: () => "再多看幾處，就能選個問題。",
    ready: "線索夠開始提問了；也可以把其他地方看完。",
    imageAlt: "十二月黃昏的街角麵包店，店內透著暖光，幾個人在門口等候，旁邊路燈亮起。",
    resultBoundary: "這是虛構情境；排隊不能證明穩定需求或擴店可行。",
    cardCaption: "一段隊伍，是線索，不是結論。", cardFirst: "第一眼想到",
    cardSeen: "看到的線索", cardNext: "下一個問題", cardAction: "先做的小觀察",
    cardBoundary: "這是虛構情境；排隊不能證明穩定需求或擴店可行。",
    clues: {
      window: { name: "櫥窗", seen: "架上還有好幾盤麵包，一位店員正忙著服務。", possible: "排隊也可能與服務速度有關。", unknown: "平均要等多久？忙碌只發生在這一刻嗎？" },
      bags: { name: "紙袋", seen: "櫃檯放著幾個已包好的紙袋。", possible: "有些人也許是來取預訂，而非臨時購買。", unknown: "預訂佔多少？這些人還會再來嗎？" },
      queue: { name: "隊伍", seen: "今晚有幾位客人在等候。", possible: "此刻確實有人願意停下來等。", unknown: "平日也是這樣嗎？每個人為什麼排隊？" },
      lamp: { name: "路燈", seen: "路燈已亮，街上進入傍晚。", possible: "你看到的是一天中的一個時段。", unknown: "上午、午間和其他日子又如何？" },
    },
    questions: {
      rhythm: { title: "不同時段也會排嗎？", tease: "確認今晚是不是例外。", result: "先看一整天的節奏", action: "在不同日子記下不同時段的等候與來客，再比較週末和平日。", lensSeen: "你看過路燈：眼前只是傍晚的一段，值得再比較其他時段。", lensMissing: "還沒看路燈？今晚的隊伍，不能代表整天的節奏。" },
      reason: { title: "大家是為什麼而等？", tease: "區分預訂、現買與等候原因。", result: "先問隊伍為何形成", action: "問幾位願意回答的客人是來取預訂還是現買，並觀察等在哪一段。", lensSeen: "你看過紙袋：已包好的袋子讓預訂取貨成為一種可能。", lensMissing: "還沒看紙袋？同一條隊伍裡，可能有人在等不同的事。" },
      capacity: { title: "慢的是哪一道工序？", tease: "先找出等待發生的地方。", result: "先找真正的瓶頸", action: "觀察取貨、結帳與補貨各花多久，再試一項可撤回的小改動。", lensSeen: "你看過櫥窗：架上有貨，等待也可能發生在服務過程。", lensMissing: "還沒看櫥窗？先分清缺貨、結帳與取貨哪裡讓人停下。" },
    },
  },
  en: {
    skip: "Skip to content", draft: "A toy, not a shop analysis.", title: "Secrets on the Corner", heroPrompt: "Keep a first thought ↘", backToScene: "Explore another point ↑",
    intro: "A line forms outside a small shop. Is it a sign of steady business—or one moment tonight?",
    lede: "Start with the details. There is no answer to guess; find a better question to ask next.",
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
    disclosure: "A toy set in a fictional scene. Not an analysis of a real shop; your choices don't predict business outcomes.",
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
    compareSharedLabel: "Seen in both scenarios", compareShared: "People are waiting.",
    compareUnknownLabel: "Still unknown", compareUnknown: "Whether this continues across days, why each person is waiting, and whether they return.",
    compareNextLabel: "A useful next question", compareNext: "Repeat notes at similar weekday and weekend times, separating waits, pre-order pickups, and walk-in purchases.",
    compareCardTitle: "Two moments compared", compareCardText: "Both weekday and weekend settings show people waiting.",
    routeProgress: n => n ? "You have tried different ways to follow a clue." : "",
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
      weekday: { seen: "People are waiting on a weekday evening.", possible: "Some people are willing to pause here now.", unknown: "Is this true on other weekdays and weekends? Why is each person waiting?" },
      weekend: { seen: "People are waiting on a weekend evening.", possible: "Some people are willing to pause here now.", unknown: "Is this true on weekdays too? Why is each person waiting?" },
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
    count: n => n === clueOrder.length ? "Details explored" : "More details to explore",
    seenList: names => `Seen: ${names.join(", ")}`,
    need: () => "Look at a few more details to choose a question.",
    ready: "You can ask a question now—or inspect the other details first.",
    imageAlt: "A warm bakery window on a December evening, several people waiting outside, and a streetlamp lighting the lane.",
    resultBoundary: "This is a fictional scenario; a queue cannot establish steady demand or whether expansion would work.",
    cardCaption: "A line is a clue, not a conclusion.", cardFirst: "First thought",
    cardSeen: "Observed clues", cardNext: "Next question", cardAction: "Small observation",
    cardBoundary: "This is a fictional scenario; a queue cannot establish steady demand or whether expansion would work.",
    clues: {
      window: { name: "The window", seen: "Several trays still hold bread while one baker serves customers.", possible: "The line may partly reflect service speed.", unknown: "How long is the wait? Is it busy only now?" },
      bags: { name: "Paper bags", seen: "Several packed paper bags wait on the counter.", possible: "Some people may be picking up pre-orders rather than shopping on impulse.", unknown: "What share is pre-ordered? Do they return?" },
      queue: { name: "The line", seen: "People are waiting tonight.", possible: "Some people are willing to pause here now.", unknown: "Is this typical? Why is each person waiting?" },
      lamp: { name: "The streetlamp", seen: "The lamp is on: it is already evening.", possible: "You are seeing one slice of the day.", unknown: "What happens in the morning, at noon, or on other days?" },
    },
    questions: {
      rhythm: { title: "Does the line appear at other times?", tease: "Find out whether tonight is unusual.", result: "Look at the whole day's rhythm", action: "Record waits and visits at different times for a week, comparing weekdays and the weekend.", lensSeen: "You noticed the lamp: this is only a glimpse of the evening. Other times are still worth checking.", lensMissing: "Haven't looked at the lamp? Tonight's line cannot stand in for the whole day." },
      reason: { title: "What is everyone waiting for?", tease: "Separate pre-orders, purchases, and delay.", result: "Ask why the line forms", action: "Ask a few willing customers whether they are collecting orders or buying now, and observe where the wait occurs.", lensSeen: "You noticed the bags: packed orders make pickup one possible reason for waiting.", lensMissing: "Haven't looked at the bags? People in the same line may be waiting for different things." },
      capacity: { title: "Where does the wait happen?", tease: "Find the slow part of the process.", result: "Find the real bottleneck", action: "Observe the time spent on pickup, payment, and restocking; then try one reversible change.", lensSeen: "You noticed the window: bread is available, so service may be part of the wait.", lensMissing: "Haven't looked at the window? First separate a sellout from slow payment or pickup." },
    },
  },
};


// Scenario-written question examples, not a record of an actual inquiry or Paul's advice.
copy.zh.letter = {
  title: "外地來的一封信", invitation: "店門口的信箱裡，多了一封信。", open: "拆開看看", skip: "先不拆信，看結果", close: "收起信件", sender: "小葵 · 河對岸的咖啡館", greeting: "您好：",
  paragraphs: [
    ["我在河對岸開了間小咖啡館。朋友帶來您家的麵包，咖啡還沒喝完，紙袋就空了。大家都問，下回還吃得到嗎？"],
    ["想請您之後", {id:"regular"}, {id:"some"}, "過來，", {id:"same"}, "就好，", {id:"trial"}, "。"],
    ["最想要", {id:"spec"}, "。", {id:"delivery"}, "。"],
    ["費用的部分，", {id:"pay"}, "。"], ["期待合作！"], ["河對岸的咖啡館　小葵"],
    ["附註：聽說這條街上，有一間晚上總亮著暖燈的工作室？"]
  ],
  hints: "點信裡有底線的說法，看看哪些事還不清楚。", possible: "可能意味 · 猜測", ask: "可以回問 · 問法示例", source: "這些是虛構情境中的問法示例，供你整理問題。", voice: "來信很熱情；實際需要的量、時間與合作方式，仍要問清楚。", noteClose: "放回信裡", progress: "還有說法可以看看", progressDone: "信裡的說法都看過了", compose: "回信要先問什麼", composeTitle: "選幾個你想先問的問題", composeHint: "先把要確認的事說清楚。寫進回信，也還要等對方回答。空格代表這封回信能先放的問題。", emptySlot: "留給想先問的事", capacity: "回信空格已滿。可以先移除問題，再換別的。", tones: ["謝謝您喜歡我們的麵包！", "很高興收到您的信。"], toneLabel: "回信開頭", draft: "回信草稿", picked: "這封回信先問", unasked: "這次未問，仍待確認", waiting: "已寫入回信，等待對方回答", waitingHint: "寫進回信的問題也尚未確認；先後順序不代表哪個問題更正確。", thanks: "期待您的回覆，我們再一起確認。", feedback: "這個問題想先釐清：", up: "往前移", down: "往後移", remove: "移除", save: "收好回信草稿", back: "回頭讀信", edit: "修改回信草稿", resultTitle: "外地來信：還要問清楚", boundary: "一封熱情的信是線索，不是訂單。", tradeLine: "排隊不等於買單，就像詢盤不等於訂單。",
  notes: {
    some: {phrase:"送一些", name:"每次的量", seen:"送一些過來", possible:"對方可能有持續購買的興趣。", unknown:"需要多少、每次是否相同，都還不知道。", question:"每次大概需要多少？會不會有時多、有時少？", learn:"每次需要準備多少"},
    regular: {phrase:"固定", name:"送達的頻率", seen:"固定送來", possible:"對方可能希望反覆收到麵包。", unknown:"多久送、哪些時候送、遇到假日怎麼辦？", question:"希望多久送一次、固定在哪些時候？", learn:"希望送達的時機與頻率"},
    same: {phrase:"量就跟現在差不多", name:"共同的參考", seen:"量就跟現在差不多", possible:"對方心裡可能有個參考。", unknown:"是朋友帶回去的量，還是店裡賣的量？雙方可能想得不一樣。", question:"您說的「跟現在差不多」，是以哪次為準？", learn:"雙方說的是哪個參考"},
    trial: {phrase:"先送一陣子看看", name:"試送與後續", seen:"先送一陣子看看", possible:"對方可能想先試，再決定是否繼續。", unknown:"試送多久、觀察什麼、如何決定繼續，都還沒說清楚。", question:"試送期間，您會看什麼來決定要不要繼續？", learn:"試送後如何討論下一步"},
    spec: {phrase:"您的招牌那款，口味可以再調整一點", name:"款式與調整", seen:"招牌那款，口味可以再調整", possible:"對方可能喜歡原味，也想做些改變。", unknown:"想改甜度、大小，還是其他地方？調整後怎麼比對？", question:"想調整的是哪個地方？可以先寄樣品確認嗎？", learn:"想改什麼，以及如何比對"},
    delivery: {phrase:"送的方式您看怎麼方便", name:"送達與收取", seen:"送的方式您看怎麼方便", possible:"對方可能願意討論不同的送法。", unknown:"誰送、誰收、如何保鮮、受損時怎麼處理，還未確認。", question:"送到的時候誰收？麵包要怎麼包才不會壓壞？", learn:"送達與保護麵包的安排"},
    pay: {phrase:"等送過幾次再一起算", name:"費用與結清", seen:"送過之後再結清", possible:"對方可能希望稍後結清費用。", unknown:"如何計算、何時付清、中途停送如何處理，都還不知道。", question:"費用怎麼算、什麼時候結清？如果中途想停，要怎麼說好？", learn:"費用、結清時機與停送安排"}
  }
};
copy.en.letter = {
  title:"A letter from across the river", invitation:"A letter has arrived in the mailbox outside the shop.", open:"Open the letter", skip:"Leave it for now", close:"Put the letter away", sender:"Sunny · The café across the river", greeting:"Dear baker,",
  paragraphs:[
    ["I run a little café across the river. A friend brought your bread. Before we'd finished our coffee, the paper bag was empty. Everyone asked whether there would be more next time."],
    ["Could you ",{id:"some"}," ",{id:"regular"},"? ",{id:"same"}," would be fine, and we could ",{id:"trial"},"."],
    ["We'd love ",{id:"spec"},". ",{id:"delivery"},"."], ["As for payment, ",{id:"pay"},"."], ["Looking forward to working together!"], ["Sunny, the café across the river"], ["P.S. I hear there's a workshop on your street whose warm light stays on at night?"]
  ],
  hints:"Select the underlined phrases to explore what is still unclear.", possible:"Might mean · A guess", ask:"Could ask · Example wording", source:"These are question examples written for this fictional scene.", voice:"The letter sounds warm. The amount, timing and arrangements still need asking.", noteClose:"Back to the letter", progress:"There are more phrases to explore", progressDone:"You've explored the phrases in the letter", compose:"What would you ask first?", composeTitle:"Pick a few questions to ask first", composeHint:"Make clear what needs checking. Writing a question doesn't confirm its answer. The spaces show what fits in this reply.", emptySlot:"Room for a question", capacity:"The reply spaces are full. Remove a question to choose another.", tones:["Thank you for enjoying our bread!", "So glad to get your letter."], toneLabel:"Opening line", draft:"Reply draft", picked:"In this reply, you'd ask", unasked:"Not asked yet, still unconfirmed", waiting:"Written into the reply, awaiting an answer", waitingHint:"The questions in your reply are unconfirmed too. Their order isn't a right-or-wrong ranking.", thanks:"We look forward to your reply, so we can check the details together.", feedback:"This question aims to clarify: ", up:"Move earlier", down:"Move later", remove:"Remove", save:"Keep this reply draft", back:"Read the letter again", edit:"Edit the reply draft", resultTitle:"The letter: still to ask", boundary:"A warm letter is a clue, not an order.", tradeLine:"A queue is not a sale, just as an inquiry is not an order.",
  notes:{
    some:{phrase:"deliver some", name:"Amount each time", seen:"Deliver some", possible:"She may be interested in buying regularly.", unknown:"How much would she need, and would it vary?", question:"Roughly how much would you need each time? Would it vary?", learn:"How much to prepare each time"},
    regular:{phrase:"regularly", name:"Delivery frequency", seen:"Regularly", possible:"She may want recurring deliveries.", unknown:"How often, at what times, and what about holidays?", question:"How often would you like deliveries, and on which days?", learn:"When and how often to deliver"},
    same:{phrase:"About the same as now", name:"A shared reference", seen:"About the same as now", possible:"She may have a reference in mind.", unknown:"The amount her friend brought, or what our shop sells? We may picture different things.", question:"When you say 'about the same as now', which occasion do you mean?", learn:"Which reference both sides mean"},
    trial:{phrase:"try it for a while", name:"Trial and next steps", seen:"Try it for a while", possible:"She may want to try before deciding whether to continue.", unknown:"For how long, what will she observe, and how will continuing be decided?", question:"During the trial, what will you look at to decide whether to continue?", learn:"How to discuss the next step after a trial"},
    spec:{phrase:"your signature loaf, maybe with the taste adjusted a little", name:"Loaf and changes", seen:"Signature loaf, taste adjusted", possible:"She may like the original but want something changed.", unknown:"Sweetness, size, or something else? How will the result be compared?", question:"What would you like adjusted? Could we send a sample to check first?", learn:"What to change and how to compare it"},
    delivery:{phrase:"Deliver however suits you", name:"Delivery and receiving", seen:"Deliver however suits you", possible:"She may be open to discussing different delivery methods.", unknown:"Who delivers, who receives it, how it stays fresh, and how damage is handled are unconfirmed.", question:"Who will receive the delivery, and how should the bread be packed so it isn't squashed?", learn:"Receiving and protecting the bread"},
    pay:{phrase:"let's settle up after a few deliveries", name:"Payment and stopping", seen:"Settle up after deliveries", possible:"She may prefer to settle the costs later.", unknown:"How costs are worked out, when payment is due, and what happens if deliveries stop are unknown.", question:"How will payment be worked out and when? If either of us wants to stop, how should we agree that?", learn:"Payment timing and arrangements for stopping"}
  }
};
Object.assign(copy.zh, { draft:"示意玩具，不是店家分析。", disclosure:"示意玩具，虛構情境；不是真實店家的營運分析，你的選擇不預測生意結果。", count: n => n === clueOrder.length ? "細節都看過了" : "還有細節沒看", need: () => "再多看幾處，就能選個問題。", routeProgress: n => n ? "你已經試過不同的追查方向。" : "", more:"再多看一點", tradeBridgeLabel:"下一站 · 一盞燈的約定", tradeBridgeTitle:"把想要的，慢慢說清楚。", tradeBridgeBody:"帶著想問的問題，走進工作室，試著把材質、尺寸與包裝的期待講清楚。", tradeBridgeLink:"走進一盞燈的約定 ↗", tradeSecondary:"或前往：貿易街 ↗" });
Object.assign(copy.en, { draft:"A toy, not a shop analysis.", disclosure:"A toy set in a fictional scene. Not an analysis of a real shop; your choices don't predict business outcomes.", count: n => n === clueOrder.length ? "You've explored the details" : "More details to explore", need: () => "Look at a few more details to choose a question.", routeProgress: n => n ? "You've tried different ways to follow a clue." : "", more:"See more", tradeBridgeLabel:"Next · A Lamp, As Promised", tradeBridgeTitle:"Make clear what you have in mind.", tradeBridgeBody:"Take your questions into the workshop and explore how to agree on materials, size and packaging.", tradeBridgeLink:"Explore A Lamp, As Promised ↗", tradeSecondary:"Or visit: Trade Street ↗" });


// Owner steering: story first, light questions on the surface, optional depth in notes.
Object.assign(copy.zh.letter, {
  arrival:"晚風把店門吹得輕響。信箱裡有張摺得很整齊的信紙，署名是河對岸的小葵。", compose:"你會怎麼回這封信？", composeTitle:"挑幾句，留在回信裡", composeHint:"不用問完所有事情。先選你最想知道的，也可以回頭讀信。", emptySlot:"在這裡留個想問的問題", capacity:"信紙先留這些。想換個問題，可以把原來的拿掉。", source:"信與筆記都是虛構故事；這裡提供問法示例。", waiting:"回信草稿寫好了，還要等小葵回答。", waitingHint:"寫進回信，也還沒問到答案。其他疑問先留在筆記裡。", unasked:"還留在筆記裡，還沒確認", feedback:"這句想問的是：", resultTitle:"信折好了，故事還沒結束", savedStory:"你把照片壓在信紙旁，替回信留好位置。小葵還沒回答，街角已經多了些值得期待的事。",
});
Object.assign(copy.en.letter, {
  arrival:"The evening breeze rattles the shop door. In the mailbox is a neatly folded letter, signed by Sunny from across the river.", compose:"How would you reply?", composeTitle:"Choose a few lines for your reply", composeHint:"You don't have to ask everything. Pick what you're curious about, or read the letter again.", emptySlot:"Leave room for a question", capacity:"Let's leave these on the page for now. Remove a question if you'd like to swap it.", source:"The letter and notes belong to a fictional story. The questions are examples.", waiting:"The reply draft is ready. We're still waiting for Sunny's answers.", waitingHint:"A question on the page isn't an answer yet. The other questions stay in your notes.", unasked:"Still in your notes, still unconfirmed", feedback:"This line asks about: ", resultTitle:"The letter is folded. The story isn't over.", savedStory:"You set the photo beside the paper and make room for a reply. Sunny hasn't answered yet, but there's something new to look forward to on this corner.",
});
const lightLetter = {
  zh: {
    some:["每次想要多少？", "多少麵包", "你把空紙袋攤平，想像下次要放進多少麵包。答案，還在河對岸。"],
    regular:["想什麼時候收到麵包？", "什麼時候送", "麵包出爐的時候，未必正好是咖啡館方便收貨的時候。你把這句留在回信裡。"],
    same:["你說的「差不多」，是像哪次？", "像哪次那樣", "同樣一句「差不多」，也可能讓人想起不同的紙袋。你決定先問清楚。"],
    trial:["想先試到什麼時候？", "先試看看", "這可以是個小小的開始。至於什麼時候再聊聊，你留了個問題給小葵。"],
    spec:["想調整哪個味道？", "想換什麼味道", "你在「招牌」旁留了個記號。照片拍得到麵包，卻拍不到小葵想要的味道。"],
    delivery:["送到哪裡，交給誰？", "送去哪裡", "麵包要過河，還要找到接它的人。你把目的地的空白，留給小葵補上。"],
    pay:["什麼時候方便結清？", "什麼時候結清", "你把這句寫得平常又客氣。好好說清楚，也是讓彼此安心的一種方式。"]
  },
  en: {
    some:["How much would you like each time?", "How much bread", "You flatten the empty paper bag and imagine the bread it might hold. The answer is still across the river."],
    regular:["When would you like the bread to arrive?", "When to deliver", "Fresh from the oven may not mean a convenient time for the café. You leave the question in your reply."],
    same:["When you say 'the same', which occasion do you mean?", "Same as when", "The same words might bring different paper bags to mind. You decide to ask."],
    trial:["How long would you like to try it?", "Trying it out", "It could be a small beginning. You leave Sunny a question about when to talk again."],
    spec:["What would you like to change about the taste?", "A different taste", "You leave a mark beside 'signature loaf'. A photograph can show bread, but not the taste Sunny has in mind."],
    delivery:["Where should it go, and who will receive it?", "Where it goes", "The bread needs to cross the river and reach someone waiting for it. You leave the destination for Sunny to fill in."],
    pay:["When would you like to settle up?", "When to settle up", "You write it plainly and kindly. Clear words can help both sides feel at ease."]
  }
};
for (const language of ["zh", "en"]) {
  for (const [id, [question, name, story]] of Object.entries(lightLetter[language])) Object.assign(copy[language].letter.notes[id], {question, name, story, learn: name});
}

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

const replyLimit = 2;
const letterOrder = ["some", "regular", "same", "trial", "spec", "delivery", "pay"];
const letterViewed = new Set();
let replySelection = [];
let replyTone = 0;
let letterComplete = false;
let savedReply = null;
let letterStage = "read";
let activeLetterNote = null;
let letterNoteTrigger = null;

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
  node("field-note").setAttribute("aria-label", t.notebook);
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
  node("discovery-count").replaceChildren();
  const progressText = document.createElement("span"); progressText.textContent = t.count(viewed.size);
  const dots = document.createElement("span"); dots.className = "progress-dots"; dots.setAttribute("aria-hidden", "true");
  clueOrder.forEach(id => { const dot = document.createElement("i"); dot.classList.toggle("seen", viewed.has(id)); dots.append(dot); });
  node("discovery-count").append(dots, progressText);
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
  renderLetterResult();
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
}

function chooseScenario(next) {
  if (scenario === next) return;
  scenario = next;
  resetLetter();
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
  node("trade-bridge-link").href = `/prototype/take-the-lantern-apart/?lang=${lang}`;
  node("trade-secondary-link").href = `/prototype/trade-street/?lang=${lang}`;
  updateScenarioControls();
  node("scene-image").alt = copy[lang].imageAlt;
  const url = new URL(location.href);
  url.searchParams.set("lang", lang);
  url.searchParams.set("period", scenario);
  history.replaceState(null, "", url);
  renderQuestions();
  renderNote();
  renderLetter();
  renderResult();
}

// Measure every line before drawing: long replies grow the PNG rather than truncate.
function cardLines(ctx, text, width) {
  const tokens = lang === "en" ? text.split(/(\s+)/) : [...text];
  const lines = []; let line = "";
  for (const token of tokens) {
    if (line && ctx.measureText(line + token).width > width) { lines.push(line.trimEnd()); line = token.trimStart(); }
    else line += token;
    while (ctx.measureText(line).width > width) {
      let length = line.length;
      while (length > 1 && ctx.measureText(line.slice(0, length)).width > width) length--;
      lines.push(line.slice(0, length)); line = line.slice(length);
    }
  }
  if (line) lines.push(line.trimEnd());
  return lines;
}

function downloadCard() {
  if (!chosenQuestion) return;
  const t = copy[lang], question = t.questions[chosenQuestion], canvas = document.createElement("canvas");
  canvas.width = 1200; const ctx = canvas.getContext("2d");
  const left = [[t.cardSeen, clueOrder.filter(id => viewed.has(id)).map(id => `${getClue(id).name}${lang === "zh" ? "：" : ": "}${getClue(id).seen}`)]];
  if (firstImpression !== null) left.push([t.cardFirst, [t[`impression${firstImpression[0].toUpperCase()}${firstImpression.slice(1)}`]]]);
  if (viewedByScenario.weekday.has("queue") && viewedByScenario.weekend.has("queue")) left.push([t.compareCardTitle, [t.compareCardText]], [t.compareNextLabel, [t.compareNext]]);
  const right = [[t.cardNext, [question.title]]];
  let action = question.action;
  if (chosenAlternative !== null) { const answer = getAlternatives()[chosenAlternative]; right.push([t.assumptionLabel, [answer.answer]]); action = answer.action; }
  right.push([t.cardAction, [action]], [t.businessLabel, [t.business[chosenQuestion][scenario]]]);
  if (chosenAlternative !== null && chosenFollowup !== null) { const signal = followups[lang][chosenQuestion][chosenAlternative][chosenFollowup]; right.push([t.cardFollowup, [signal.title, signal.learn]], [t.cardStillUnknown, [signal.unknown]]); }
  const plans = [];
  function paragraph(text, x, y, width, font = "26px system-ui, sans-serif", color = "#172934", lineHeight = 38) {
    ctx.font = font; const lines = cardLines(ctx, text, width);
    lines.forEach(line => { plans.push({ text: line, x, y, font, color }); y += lineHeight; });
    return y;
  }
  let y = paragraph(t.title, 72, 76, 720, "700 28px system-ui, sans-serif", "#9e5d37");
  paragraph(t.scenarios[scenario], 850, 76, 280, "22px system-ui, sans-serif", "#3e5360");
  y = paragraph(question.result, 72, y + 36, 1056, "700 52px serif", "#172934", 65) + 35;
  function column(sections, x, top) {
    for (const [title, values] of sections) {
      top = paragraph(title, x, top, 475, "700 25px system-ui, sans-serif", "#9e5d37") + 10;
      for (const value of values) top = paragraph(value, x, top, 475) + 18;
      top += 20;
    } return top;
  }
  y = Math.max(column(left, 72, y), column(right, 650, y)) + 35;
  if (letterComplete) {
    const l = t.letter, selected = savedReply.selection;
    y = paragraph(l.title, 72, y, 1056, "700 32px serif", "#9e5d37", 44) + 12;
    y = paragraph(l.savedStory, 72, y, 1056) + 16;
    for (const id of selected) y = paragraph(l.notes[id].story, 72, y, 1056) + 16;
    y = paragraph(l.tones[savedReply.tone], 72, y, 1056) + 16;
    y = paragraph(l.picked, 72, y, 1056, "700 25px system-ui, sans-serif", "#9e5d37") + 10;
    for (const id of selected) y = paragraph(l.notes[id].question, 72, y, 1056) + 16;
    y = paragraph(l.waiting, 72, y, 1056, "700 25px system-ui, sans-serif") + 16;
    y = paragraph(l.unasked, 72, y, 1056, "700 25px system-ui, sans-serif", "#9e5d37") + 10;
    for (const id of letterOrder.filter(id => !selected.includes(id))) y = paragraph(l.notes[id].name, 72, y, 1056) + 8;
    y = paragraph(l.waitingHint, 72, y + 12, 1056) + 20;
    y = paragraph(l.source, 72, y, 1056, "23px system-ui, sans-serif", "#3e5360", 35) + 20;
    y = paragraph(l.boundary, 72, y, 1056, "700 26px system-ui, sans-serif") + 10;
    y = paragraph(l.tradeLine, 72, y, 1056) + 30;
  }
  y = paragraph(t.cardStillUnknown, 72, y, 1056, "700 25px system-ui, sans-serif", "#9e5d37") + 12;
  y = paragraph(t.cardBoundary, 72, y, 1056, "23px system-ui, sans-serif", "#3e5360", 35);
  canvas.height = Math.max(1700, Math.ceil(y + 60));
  ctx.fillStyle = "#f4f0e7"; ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#193644"; ctx.fillRect(0, 0, canvas.width, 13);
  plans.forEach(item => { ctx.font = item.font; ctx.fillStyle = item.color; ctx.fillText(item.text, item.x, item.y); });
  const link = document.createElement("a");
  link.download = lang === "zh" ? "街角的秘密-觀察卡.png" : "secrets-on-the-corner-field-card.png";
  link.href = canvas.toDataURL("image/png"); document.body.append(link); link.click(); link.remove();
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
  if (!node("field-note").open) node("field-note").showModal();
  const heading = node("note-content").querySelector("h3");
  heading.tabIndex = -1;
  heading.focus({ preventScroll: true });
  if (chosenQuestion) renderResult();
}));
node("download").addEventListener("click", downloadCard);
node("try-again").addEventListener("click", () => {
  resetLetter();
  chosenQuestion = null;
  chosenAlternative = null;
  chosenFollowup = null;
  node("result").hidden = true;
  node("decision-title").focus({ preventScroll: true });
});

function letterTextElement(tag, text, className) {
  const element = document.createElement(tag);
  element.textContent = text;
  if (className) element.className = className;
  return element;
}

function resetLetter() {
  letterViewed.clear(); replySelection = []; replyTone = 0;
  letterComplete = false; savedReply = null; letterStage = "read"; activeLetterNote = null;
  if (node("letter-dialog").open) node("letter-dialog").close();
  renderLetter(); renderLetterResult();
}

function renderLetterNote() {
  const area = node("letter-note"); area.replaceChildren();
  if (!activeLetterNote) { if (area.open) area.close(); return; }
  const t = copy[lang], l = t.letter, note = l.notes[activeLetterNote];
  const title = letterTextElement("h3", note.name); title.id = "letter-note-title"; title.tabIndex = -1;
  const close = letterTextElement("button", l.noteClose); close.type = "button";
  close.addEventListener("click", () => {
    area.close();
  });
  area.append(title, makePart(t.seen, note.seen), makePart(l.possible, note.possible), makePart(t.unknown, note.unknown), makePart(l.ask, note.question), close);
}

function renderLetter() {
  const l = copy[lang].letter;
  document.querySelectorAll("[data-letter]").forEach(element => { element.textContent = l[element.dataset.letter]; });
  const paper = node("letter-paper"); paper.replaceChildren(letterTextElement("p", l.greeting));
  l.paragraphs.forEach(parts => {
    const paragraph = document.createElement("p");
    parts.forEach(part => {
      if (typeof part === "string") { paragraph.append(document.createTextNode(part)); return; }
      const button = letterTextElement("button", l.notes[part.id].phrase, "letter-phrase");
      button.type = "button"; button.dataset.letterClue = part.id;
      button.setAttribute("aria-expanded", String(activeLetterNote === part.id));
      button.setAttribute("aria-controls", "letter-note");
      button.classList.toggle("explored", letterViewed.has(part.id));
      button.addEventListener("click", () => {
        activeLetterNote = part.id; letterViewed.add(part.id); letterNoteTrigger = button;
        paper.querySelectorAll("button").forEach(item => { item.setAttribute("aria-expanded", String(item === button)); item.classList.toggle("explored", letterViewed.has(item.dataset.letterClue)); });
        renderLetterNote(); node("letter-note").showModal(); updateLetterProgress();
        node("letter-note").querySelector("h3").focus({ preventScroll: true });
      });
      paragraph.append(button);
    });
    paper.append(paragraph);
  });
  node("letter-reading").hidden = letterStage !== "read";
  node("letter-composing").hidden = letterStage !== "compose";
  node("letter-open").textContent = letterComplete ? l.edit : l.open;
  node("letter-skip").hidden = letterComplete;
  node("reply-tone").replaceChildren(...l.tones.map((text, i) => { const option = letterTextElement("option", text); option.value = String(i); return option; }));
  node("reply-tone").value = String(replyTone);
  renderLetterNote(); updateLetterProgress(); renderReply();
  if (activeLetterNote) letterNoteTrigger = paper.querySelector(`[data-letter-clue="${activeLetterNote}"]`);
}

function updateLetterProgress() {
  const l = copy[lang].letter, progress = node("letter-progress"); progress.replaceChildren();
  const dots = document.createElement("span"); dots.className = "progress-dots"; dots.setAttribute("aria-hidden", "true");
  letterOrder.forEach(id => { const dot = document.createElement("i"); dot.classList.toggle("seen", letterViewed.has(id)); dots.append(dot); });
  progress.append(dots, letterTextElement("span", letterViewed.size === letterOrder.length ? l.progressDone : l.progress));
  node("letter-compose").hidden = false;
}

function renderReplyPreview() {
  const l = copy[lang].letter, preview = node("reply-preview"); preview.replaceChildren(letterTextElement("p", l.tones[replyTone]));
  const list = document.createElement("ul"); list.className = "reply-questions";
  replySelection.forEach(id => list.append(letterTextElement("li", l.notes[id].question)));
  preview.append(list, letterTextElement("p", l.thanks));
  preview.append(makePart(l.unasked, letterOrder.filter(id => !replySelection.includes(id)).map(id => l.notes[id].name).join(lang === "zh" ? "、" : "; ")));
  preview.append(letterTextElement("p", l.waitingHint, "letter-source"));
}

function renderReply() {
  const l = copy[lang].letter, choices = node("reply-options"); choices.replaceChildren();
  letterOrder.forEach(id => {
    const button = letterTextElement("button", l.notes[id].question, "reply-question"); button.type = "button"; button.dataset.replyQuestion = id;
    button.setAttribute("aria-pressed", String(replySelection.includes(id)));
    button.disabled = replySelection.length === replyLimit && !replySelection.includes(id);
    button.addEventListener("click", () => {
      replySelection = replySelection.includes(id) ? replySelection.filter(value => value !== id) : [...replySelection, id];
      renderReply(); choices.querySelector(`[data-reply-question="${id}"]`).focus({ preventScroll: true });
    }); choices.append(button);
  });
  node("reply-capacity").textContent = replySelection.length === replyLimit ? l.capacity : "";
  const slots = node("reply-slots"); slots.replaceChildren();
  for (let i = 0; i < replyLimit; i++) {
    const id = replySelection[i], slot = document.createElement("div"); slot.className = "reply-slot";
    if (!id) { slot.append(letterTextElement("span", l.emptySlot)); slots.append(slot); continue; }
    slot.append(letterTextElement("strong", l.notes[id].name));
    [["up", -1], ["down", 1], ["remove", 0]].forEach(([action, delta]) => {
      const button = letterTextElement("button", l[action]); button.type = "button"; button.dataset.replyAction = action; button.dataset.replyId = id;
      button.setAttribute("aria-label", `${l[action]} · ${l.notes[id].name}`);
      button.disabled = action === "up" ? i === 0 : action === "down" ? i === replySelection.length - 1 : false;
      button.addEventListener("click", () => {
        if (action === "remove") replySelection = replySelection.filter(value => value !== id);
        else [replySelection[i], replySelection[i + delta]] = [replySelection[i + delta], replySelection[i]];
        renderReply();
        const target = action === "remove" ? choices.querySelector(`[data-reply-question="${id}"]`) : slots.querySelector(`[data-reply-action="${action}"][data-reply-id="${id}"]:not(:disabled)`);
        (target || node("reply-save")).focus({ preventScroll: true });
      }); slot.append(button);
    }); slots.append(slot);
  }
  node("reply-save").disabled = replySelection.length === 0;
  renderReplyPreview();
}

function renderLetterResult() {
  const l = copy[lang].letter, content = node("letter-result-content"); content.hidden = !letterComplete; content.replaceChildren();
  node("letter-result-title").textContent = letterComplete ? l.resultTitle : l.invitation;
  node("letter-open").textContent = letterComplete ? l.edit : l.open;
  node("letter-skip").hidden = letterComplete;
  if (!letterComplete) return;
  const selected = savedReply.selection;
  const questions = document.createElement("ul"); questions.className = "reply-questions";
  selected.forEach(id => questions.append(letterTextElement("li", l.notes[id].question)));
  content.append(letterTextElement("p", l.savedStory, "letter-ending"), ...selected.map(id => letterTextElement("p", l.notes[id].story, "letter-story")), letterTextElement("h4", l.picked), questions, letterTextElement("p", l.waiting), makePart(l.unasked, letterOrder.filter(id => !selected.includes(id)).map(id => l.notes[id].name).join(lang === "zh" ? "、" : "; ")), letterTextElement("p", l.waitingHint, "letter-source"), letterTextElement("p", l.boundary, "letter-conclusion"), letterTextElement("p", l.tradeLine));
}

node("letter-open").addEventListener("click", () => {
  if (savedReply) { replySelection = [...savedReply.selection]; replyTone = savedReply.tone; }
  letterStage = letterComplete ? "compose" : "read"; renderLetter(); node("letter-dialog").showModal(); node("letter-title").focus({ preventScroll: true });
});
node("letter-note").addEventListener("close", () => { activeLetterNote = null; letterNoteTrigger?.setAttribute("aria-expanded", "false"); letterNoteTrigger?.focus({ preventScroll: true }); });
node("letter-close").addEventListener("click", () => node("letter-dialog").close());
node("letter-dialog").addEventListener("close", () => { if (!node("result").hidden) node("letter-open").focus({ preventScroll: true }); });
node("letter-skip").addEventListener("click", () => node("download").focus({ preventScroll: true }));
node("letter-compose").addEventListener("click", () => { letterStage = "compose"; renderLetter(); node("reply-title").focus({ preventScroll: true }); });
node("reply-back").addEventListener("click", () => { letterStage = "read"; renderLetter(); node("letter-title").focus({ preventScroll: true }); });
node("reply-tone").addEventListener("change", event => { replyTone = Number(event.target.value); renderReplyPreview(); });
node("reply-save").addEventListener("click", () => {
  if (!replySelection.length) return;
  savedReply = { selection: [...replySelection], tone: replyTone };
  letterComplete = true; renderLetterResult(); node("letter-dialog").close();
});
node("note-back").addEventListener("click", () => node("field-note").close());
node("field-note").addEventListener("close", () => {
  document.querySelector(`[data-clue="${activeClue}"]`)?.focus({ preventScroll: true });
});

setLanguage(lang);
