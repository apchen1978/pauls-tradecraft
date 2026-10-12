// 你是哪一種隊友？ / What kind of teammate are you?
// Self-contained Garage toy. No network calls, no storage. The share link's `c`
// param is the three choice letters; `lang` only picks the language.
//
// Choice → type (A–D kept; Paul approved those lines. E–F added later):
//   Scenario 1 專案死線前一晚 / The night before the deadline
//     A umbrella 擋雨的人    B cocoa 晚安熱可可
//     C spark 腦內煙火師     D mapkeeper 地圖收藏家
//     E strategist 軍師      F queen 女王
//   Scenario 2 社團成果展佈置 / Setting up the club showcase
//     A umbrella             B finisher 最後一擊
//     C soundtrack BGM 擔當  D mapkeeper
//     E messenger 傳令兵     F designer 設計師
//   Scenario 3 線上組隊打王倒數 / Countdown to the boss fight
//     A cocoa                B spark
//     C finisher             D soundtrack
//     E strategist           F messenger
//
// Resolve (deterministic):
//   1. A type chosen at least twice wins.
//   2. Three different types: the winning scenario is (i + j + k) mod 3,
//      where A=0 … F=5 are the choice indexes.
//      A–D indexes are unchanged, so every old ABCD code still resolves
//      the same way. Across those 64 codes the scores stay
//      umbrella 10, cocoa 11, spark 11, mapkeeper 10, finisher 11, soundtrack 11.
//      strategist and messenger each appear twice, so a pair of them wins.
//      queen and designer appear once and can win the tie-break, then a
//      rarity gate keeps them only when the other two choice indexes have
//      the same parity (both even or both odd). Otherwise that win passes
//      to the next scenario's choice. The queen slot then splits on the
//      middle letter: even index (A/C/E) is 銀河之女, odd (B/D/F) is
//      M-31仙女座. FAE is 銀河之女; FBD is M-31仙女座. Three codes each.
//      AFC stays designer.
//      A three-way tie that uses E or F, and did not keep queen or designer,
//      becomes 聯盟 / Alliance when the choice-index sum mod 7 is 1
//      (EEA → alliance). That gate never sees a pure A–D code, so all 64
//      old codes stay put. Before the next gate the counts were
//      umbrella 24, cocoa 23, finisher 22, spark 24, mapkeeper 24,
//      soundtrack 23, strategist 22, messenger 21, alliance 21,
//      queen 6, designer 6.
//      A later gate, still only on codes that use E or F and did not
//      keep queen, designer, or alliance, turns the result into
//      傳教士 / Missionary when the choice-index sum mod 9 is 0
//      (AFE → missionary) and 使徒 / Apostle when that sum mod 9 is 7
//      (ACF → apostle). Pure A–D codes never reach it. The two queens
//      stay at 3 each, and designer stays at 6. Across 216 codes the counts are
//      umbrella 19, cocoa 20, finisher 19, spark 20, mapkeeper 18,
//      soundtrack 19, strategist 18, messenger 18, alliance 21,
//      missionary 16, apostle 16, galaxy 3, andromeda 3, designer 6.
//      守護者 always uses MG. 聯盟 uses the winged horse in
//      assets/winged-horse.webp (the same horse drawing as the live card).
//      The other roles use their anime portraits
//      (assets/<role>.webp) instead of MG. Crowns are only on the two queens.
//      Each picture is loaded only when that card is shown.
//
// Worked examples:
//   AAA majority → umbrella
//   BBC majority → finisher
//   CCD majority → soundtrack
//   ABA tie (0+1+0) mod 3 = 1 → finisher
//   BBD tie (1+1+3) mod 3 = 2 → soundtrack
//   DAA tie (3+0+0) mod 3 = 0 → mapkeeper
//   ACB tie (0+2+1) mod 3 = 0 → umbrella
//   BBB tie (1+1+1) mod 3 = 0 → cocoa

export const ASSET = "/mg-mini-demo/assets/";

export const POSES = {
  think: {
    motion: "float",
    ms: 280,
    frames: ["waiting/00.webp", "waiting/01.webp", "waiting/02.webp", "waiting/03.webp", "waiting/04.webp", "waiting/05.webp"],
  },
  heart: {
    motion: "float",
    ms: 260,
    frames: ["heart/00.webp", "heart/01.webp", "heart/02.webp", "heart/03.webp"],
  },
  jump: {
    motion: "squash",
    ms: 140,
    frames: ["jumping/00.webp", "jumping/01.webp", "jumping/02.webp", "jumping/03.webp", "jumping/04.webp"],
  },
  dance: {
    motion: "bob",
    ms: 110,
    frames: [
      "running-left/00.webp",
      "running-right/01.webp",
      "running-left/02.webp",
      "running-right/03.webp",
      "running-left/04.webp",
      "running-right/05.webp",
    ],
  },
  idle: {
    motion: "float",
    ms: 280,
    frames: ["idle/00.webp", "idle/01.webp", "idle/02.webp", "idle/03.webp", "idle/04.webp", "idle/05.webp"],
  },
  wave: {
    motion: "bob",
    ms: 180,
    frames: ["waving/00.webp", "waving/01.webp", "waving/02.webp", "waving/03.webp"],
  },
};

export const TYPES = {
  umbrella: {
    pose: "think",
    prop: "umbrella",
    zh: {
      name: "擋雨的人",
      role: "坦克",
      funny: "大家在崩潰的時候，你已經默默把雷都踩完了。",
      gentle: "有你在前面，大家才敢往前走。",
      literary: "「我不說累，只是把雨收進傘裡。」",
      strength: "扛得住壓力，讓人安心。",
      alt: "短黑髮、深棕眼睛、穿松綠雨衣、面向左側撐傘的人",
    },
    en: {
      name: "The Umbrella",
      role: "Tank",
      funny: "Everyone else is panicking; you've already quietly stepped on every landmine.",
      gentle: "With you up front, everyone dares to move forward.",
      literary: "\"I don't say I'm tired. I just fold the rain into my umbrella.\"",
      strength: "Takes the pressure so others feel safe.",
      alt: "A person with short black hair and dark brown eyes, in a pine-green raincoat, facing left with an umbrella",
    },
  },
  cocoa: {
    pose: "heart",
    prop: "drink",
    zh: {
      name: "晚安熱可可",
      role: "守護者",
      funny: "隊上唯一記得大家還沒吃飯的人。",
      gentle: "因為有你，大家才撐得到最後。",
      literary: "「把每個人的疲倦，泡成一杯溫的。」",
      strength: "看得見別人的狀態，懂得照顧。",
      alt: "MG 頭上有愛心，捧著一杯熱飲",
    },
    en: {
      name: "The Cocoa",
      role: "Guardian",
      funny: "The only one on the team who remembers nobody has eaten yet.",
      gentle: "Because of you, the team makes it to the end.",
      literary: "\"I brew everyone's tiredness into something warm.\"",
      strength: "Notices how people are doing, and looks after them.",
      alt: "MG with a heart overhead, holding a warm drink",
    },
  },
  finisher: {
    pose: "jump",
    prop: null,
    zh: {
      name: "最後一擊",
      role: "刺客／輸出",
      funny: "前面看起來都在滑手機，最後一刻一刀收工。",
      gentle: "關鍵時刻交給你，大家很放心。",
      literary: "「我不急，我在等那個剛剛好的時刻。」",
      strength: "爆發力強，會收尾。",
      alt: "短黑髮、琥珀色眼睛、穿炭灰背心與銅金襯衫、面向右側的人",
    },
    en: {
      name: "The Finisher",
      role: "Assassin / damage",
      funny: "Looks like you're scrolling the whole time, then you finish it in one clean strike.",
      gentle: "When it counts, everyone is happy to hand it to you.",
      literary: "\"I'm not in a hurry. I'm waiting for the moment that's just right.\"",
      strength: "Strong in the clutch, and actually finishes things.",
      alt: "A person with cropped black hair and amber eyes, in a charcoal vest and brass-gold shirt, facing right",
    },
  },
  spark: {
    pose: "think",
    prop: "spark",
    zh: {
      name: "腦內煙火師",
      role: "點子",
      funny: "你的點子一半是天才，另一半天才到大家聽不懂。",
      gentle: "你讓大家看見另一條路。",
      literary: "「別人看到牆，我看到一扇還沒畫上的窗。」",
      strength: "換個角度想，點子多。",
      alt: "捲曲赤褐髮、綠色眼睛、穿靛藍上衣、看向上方的人",
    },
    en: {
      name: "The Spark",
      role: "Ideas",
      funny: "Half your ideas are genius; the other half are so genius nobody understands them.",
      gentle: "You show everyone there's another way.",
      literary: "\"Others see a wall. I see a window nobody has drawn yet.\"",
      strength: "Sees things from a new angle, full of ideas.",
      alt: "A person with curly auburn hair and green eyes, in an indigo tunic, looking up",
    },
  },
  mapkeeper: {
    pose: "think",
    prop: "map",
    zh: {
      name: "地圖收藏家",
      role: "斥候",
      funny: "還沒開工，你已經知道插座在哪、誰會遲到。",
      gentle: "有你先看路，大家少繞很多冤枉路。",
      literary: "「我喜歡在出發前，先把風景讀一遍。」",
      strength: "觀察仔細，先把事情理清楚。",
      alt: "栗色短髮、榛色眼睛、穿橄欖外套、回頭看著空白地圖的人",
    },
    en: {
      name: "The Mapkeeper",
      role: "Scout",
      funny: "Before anything starts, you already know where the sockets are and who'll be late.",
      gentle: "Because you scout ahead, nobody has to take the long way round.",
      literary: "\"I like to read the scenery once before I set off.\"",
      strength: "Observant; sorts things out before they get messy.",
      alt: "A person with a chestnut bob and hazel eyes, in an olive jacket, looking back at a blank map",
    },
  },
  soundtrack: {
    pose: "dance",
    prop: "headphones",
    zh: {
      name: "BGM 擔當",
      role: "吟遊詩人",
      funny: "進度不一定有，但氣氛一定有。",
      gentle: "你讓辛苦的事變得好過一點。",
      literary: "「每一段努力，都值得一首配樂。」",
      strength: "帶氣氛，讓大家凝聚在一起。",
      alt: "銅紅短髮、棕色眼睛、戴大耳機、穿暖金色外套的人",
    },
    en: {
      name: "The Soundtrack",
      role: "Bard",
      funny: "Progress? Maybe. Vibes? Always.",
      gentle: "You make the hard parts a little easier.",
      literary: "\"Every bit of effort deserves its own soundtrack.\"",
      strength: "Lifts the mood and pulls people together.",
      alt: "A person with a copper-red bob and brown eyes, in a warm gold jacket and large headphones",
    },
  },
  strategist: {
    pose: "think",
    prop: "plan",
    zh: {
      name: "先看全局",
      role: "軍師",
      funny: "大家都衝了，你還在問：所以我們要去哪？",
      gentle: "你把整條路看完，大家才不會白跑。",
      literary: "「我不是慢，我是在把下一步想清楚。」",
      strength: "先看整盤，再決定怎麼走。",
      alt: "穿著深綠色長外套、站得很直的人",
    },
    en: {
      name: "Sees the Whole Board",
      role: "Strategist",
      funny: "Everyone's already charging, and you're still asking where you're actually going.",
      gentle: "You look at the whole path first, so nobody has to run it twice.",
      literary: "\"I'm not slow. I'm making the next step make sense.\"",
      strength: "Sees the whole picture before moving.",
      alt: "A person standing straight in a long deep-green coat",
    },
  },
  messenger: {
    pose: "wave",
    prop: "note",
    zh: {
      name: "話送到了",
      role: "傳令兵",
      funny: "你說到最後一個人終於回：收到。",
      gentle: "有你在中間跑，沒有人漏接那句話。",
      literary: "「一句話要到齊，才算說完。」",
      strength: "把話送到每一個人手上。",
      alt: "深色超短髮、藍灰眼睛、邁步揮手、身上有珊瑚色帶子的人",
    },
    en: {
      name: "Gets It Through",
      role: "Messenger",
      funny: "You keep saying it until the last person finally answers: got it.",
      gentle: "With you running the middle, nobody misses the message.",
      literary: "\"A sentence isn't finished until it reaches everyone.\"",
      strength: "Gets the word into every person's hands.",
      alt: "A person with very short dark hair and blue-grey eyes, mid-stride and waving, with a coral sash",
    },
  },
  galaxy: {
    pose: "idle",
    prop: "crown",
    zh: {
      name: "銀河之女",
      role: "女王",
      funny: "你一站出來，滑手機的人都把臉抬起來了。",
      gentle: "你把這場的中心放得很輕，人卻願意靠過來。",
      literary: "「不是大聲，是這一圈終於有了中心。」",
      strength: "定得住場，也讓人想站到你旁邊。",
      alt: "黑長直髮、深棕眼睛、戴細金冠、穿白底紫金邊長裙的人",
    },
    en: {
      name: "Daughter of the Galaxy",
      role: "Queen",
      funny: "You step out, and even the person scrolling looks up.",
      gentle: "You set the center of the room so lightly that people still come closer.",
      literary: "\"Not louder. This circle finally has a center.\"",
      strength: "Holds the room, and makes people want to stand beside you.",
      alt: "A black-haired woman with dark brown eyes, a slim gold crown, and a floor-length white gown with purple-gold trim",
    },
  },
  andromeda: {
    pose: "wave",
    prop: "crown",
    zh: {
      name: "M-31仙女座",
      role: "女王",
      funny: "你一笑，原本各做各的人都轉過來了。",
      gentle: "你站在前面，大家就有了一個可以跟上的亮度。",
      literary: "「不是搶位置，是這場本來就缺一道光。」",
      strength: "把場面點亮，也讓人跟得上。",
      alt: "金長髮、藍眼睛、戴寬金冠、穿香檳色長裙、面向右側的人",
    },
    en: {
      name: "M-31 Andromeda",
      role: "Queen",
      funny: "You smile, and people who were each doing their own thing turn around.",
      gentle: "With you in front, everyone has a brightness they can follow.",
      literary: "\"Not taking the spot. The room was missing a light.\"",
      strength: "Lights the scene, and gives people something to follow.",
      alt: "A blonde woman with blue eyes, a wide gold crown, and a floor-length champagne gown, facing right",
    },
  },
  designer: {
    pose: "think",
    prop: "palette",
    zh: {
      name: "順眼就對了",
      role: "設計師",
      funny: "東西還沒排完，你已經在看這兩個顏色配不配。",
      gentle: "你讓整場看起來是故意的，不是剛好。",
      literary: "「好看不是加裝飾，是讓人想靠近。」",
      strength: "有眼光，把東西排得剛剛好。",
      alt: "不對稱黑髮帶一綹苔綠、灰色眼睛、穿色塊衣服、拿著色盤的人",
    },
    en: {
      name: "Makes It Look Right",
      role: "Designer",
      funny: "It isn't lined up yet, and you're already asking if those two colors belong together.",
      gentle: "You make the whole thing look intentional, not accidental.",
      literary: "\"Looking good isn't extra decoration. It's how you invite people closer.\"",
      strength: "Has an eye for it, and lines things up just so.",
      alt: "A person with asymmetric black hair, a moss-green streak, and grey eyes, in color-blocked clothes, holding a palette",
    },
  },
  alliance: {
    pose: "idle",
    prop: null,
    zh: {
      name: "援軍到了",
      role: "聯盟",
      funny: "你一聲招呼，同伴就從後面趕上來了。",
      gentle: "散開的人看見你，就知道該往哪裡靠。",
      literary: "「不是只來一個，是後面那一排也到了。」",
      strength: "喊得動同伴，也接得住趕來的人。",
      alt: "有翅膀的白馬",
    },
    en: {
      name: "Reinforcements Are Here",
      role: "Alliance",
      funny: "One call from you, and companions come up from behind.",
      gentle: "When people scatter, they see you and know where to gather.",
      literary: "\"Not just one arrival. The whole line behind them, too.\"",
      strength: "Can call companions in, and make room when they arrive.",
      alt: "A winged white horse",
    },
  },
  missionary: {
    pose: "wave",
    prop: "card",
    zh: {
      name: "這件事值得說",
      role: "傳教士",
      funny: "你講到第三遍，連在滑手機的人都開始點頭。",
      gentle: "你在意的那件事，會變成大家願意一起試的事。",
      literary: "「不是說服，是把一個想法轉到別人看得到的角度。」",
      strength: "把一件事講清楚，也講得讓人想靠近。",
      alt: "黑色捲髮、藍綠眼睛、穿赤陶色長外套、面向右側拿著空白卡片的人",
    },
    en: {
      name: "Worth Saying Out Loud",
      role: "Missionary",
      funny: "By the third time you say it, even the person scrolling has started to nod.",
      gentle: "The thing you care about becomes something the team is willing to try.",
      literary: "\"Not a speech. You turn an idea until someone else can see it.\"",
      strength: "Can say a thing plainly, and make people want to come closer.",
      alt: "A person with short black coils and teal eyes, in a terracotta coat, facing right with a blank card",
    },
  },
  apostle: {
    pose: "idle",
    prop: "bundle",
    zh: {
      name: "我接著走",
      role: "使徒",
      funny: "大家還沒講完，你已經把那句話收進自己的做法裡。",
      gentle: "你把大家認定的事，一步一步做成。",
      literary: "「不是我起的頭，是我願意把它走到下一個路口。」",
      strength: "認同一件事之後，就真的跟著做完。",
      alt: "灰棕短髮、深灰眼睛、穿藏青外套、往左走並捧著布包的人",
    },
    en: {
      name: "I'll Carry It On",
      role: "Apostle",
      funny: "The sentence isn't even finished, and you've already folded it into how you work.",
      gentle: "You take what the team has settled on, and you actually do it.",
      literary: "\"I didn't start it. I'm willing to walk it to the next corner.\"",
      strength: "Once an idea is yours, you carry it all the way through.",
      alt: "A person with cropped ash-brown hair and dark grey eyes, in a navy jacket, walking left with a plain cloth bundle",
    },
  },
};

export const SCENARIOS = [
  {
    id: "deadline",
    zh: {
      setting: "職場",
      title: "專案死線前一晚",
      prompt: "你們的簡報明天早上要交，現在是深夜，大家都還在線上。你會……",
    },
    en: {
      setting: "At work",
      title: "The night before the deadline",
      prompt: "The presentation is due tomorrow morning. It is late, and everyone is still online. You…",
    },
    choices: [
      { id: "A", type: "umbrella", zh: "把最難、沒人想碰的那一段直接扛下來。", en: "Take the hardest part nobody wants." },
      { id: "B", type: "cocoa", zh: "幫大家叫宵夜，順便提醒誰該去睡一下。", en: "Order late-night food and tell someone to get some sleep." },
      { id: "C", type: "spark", zh: "「等等，我們整個換個做法會不會比較快？」", en: "\"Wait, what if we just did this a totally different way?\"" },
      { id: "D", type: "mapkeeper", zh: "先把每個人的進度整理成一張表，看還缺什麼。", en: "Put everyone's progress into one list to see what's missing." },
      { id: "E", type: "strategist", zh: "先把整晚要做的事在腦裡走一遍，再動手。", en: "Walk the whole night through in your head, then start." },
      { id: "F", type: "queen", zh: "在語音裡定調：今晚照這個走，大家跟上。", en: "Set the tone on voice: this is the plan tonight, everyone follow." },
    ],
  },
  {
    id: "showcase",
    zh: {
      setting: "社團",
      title: "社團成果展佈置",
      prompt: "明天就要開展，場地還是一片空。你會……",
    },
    en: {
      setting: "A club",
      title: "Setting up the club showcase",
      prompt: "The showcase opens tomorrow, and the room is still empty. You…",
    },
    choices: [
      { id: "A", type: "umbrella", zh: "搬最重的展板，爬最高的梯子。", en: "Carry the heaviest boards and climb the tallest ladder." },
      { id: "B", type: "finisher", zh: "一個人把最麻煩的燈光和線路快速搞定。", en: "Sort out the trickiest lights and cables, fast, on your own." },
      { id: "C", type: "soundtrack", zh: "先放音樂，邊佈置邊帶氣氛。", en: "Put on music first and keep the mood up while setting up." },
      { id: "D", type: "mapkeeper", zh: "先繞場一圈，找出插座、動線和可能出包的地方。", en: "Walk the room first: sockets, foot traffic, what could go wrong." },
      { id: "E", type: "messenger", zh: "跑一圈，把每個人的位置說到對方點頭。", en: "Lap the room and say each person's spot until they nod." },
      { id: "F", type: "designer", zh: "先把海報、燈光和桌子的顏色配在一起，再開始釘。", en: "Match the posters, lights, and tables before anyone starts pinning." },
    ],
  },
  {
    id: "party",
    zh: {
      setting: "遊戲組隊",
      title: "線上組隊打王倒數",
      prompt: "王要出來了，隊伍在語音裡等。你會……",
    },
    en: {
      setting: "In a party",
      title: "Countdown to the boss fight",
      prompt: "The boss is about to show up, and the party is waiting on voice. You…",
    },
    choices: [
      { id: "A", type: "cocoa", zh: "確認每個人的補給夠不夠。", en: "Check everyone has enough supplies." },
      { id: "B", type: "spark", zh: "提出一個很怪但可能有用的打法。", en: "Pitch a weird plan that just might work." },
      { id: "C", type: "finisher", zh: "「最後一擊交給我。」", en: "\"Leave the last hit to me.\"" },
      { id: "D", type: "soundtrack", zh: "在語音裡喊口號、講幹話，讓大家不要緊張。", en: "Shout a battle cry and crack jokes so nobody's nervous." },
      { id: "E", type: "strategist", zh: "開打前，先把王的動作和大家站哪講清楚。", en: "Before the fight, spell out the boss's moves and where everyone stands." },
      { id: "F", type: "messenger", zh: "把打法重複說到最後一個人也回「收到」。", en: "Repeat the plan until the last person says they've got it." },
    ],
  },
];

export const UI = {
  zh: {
    htmlLang: "zh-Hant",
    title: "你是哪一種隊友？",
    description: "三個小情境，看你怎麼做，就知道你是哪一種隊友。示意玩具，不是心理測驗。同樣的選擇，永遠得到同一張卡。",
    skip: "跳至內容",
    eyebrow: "Digital Garage · 輕科技玩具",
    langGroup: "語言",
    h1: "你是哪一種隊友？",
    lede: "不是問卷，是三個小情境。看你怎麼做，就知道你是哪一種隊友。",
    hint: "每個情境選一次。同樣的選擇，永遠得到同一張卡。",
    boundary: "示意玩具，不是心理測驗。",
    progress: (n) => `情境 ${n} / 3`,
    choicesLabel: "選一個做法",
    backStep: "上一個情境",
    kicker: "你的隊友卡",
    roleLabel: "組隊角色",
    funny: "搞笑",
    gentle: "溫和",
    literary: "文青",
    strength: "長處",
    rare: "稀有",
    picks: (code) => `你的選擇 ${code}`,
    same: "朋友照著選，會得到同一張卡。",
    stored: "不儲存任何資料。分享連結只帶三個選擇。",
    again: "再玩一次",
    copy: "複製分享連結",
    copied: "連結已複製",
    copyFallback: "可以從下面的欄位複製",
    share: "分享",
    download: "下載角色卡",
    downloadFail: "這次沒畫成圖片，連結一樣能分享。",
    back: "回到 Digital Garage",
  },
  en: {
    htmlLang: "en",
    title: "What kind of teammate are you?",
    description: "Three short scenes. How you act is the kind of teammate you are. A toy, not a personality test. The same choices always make the same card.",
    skip: "Skip to content",
    eyebrow: "Digital Garage · Light-tech toys",
    langGroup: "Language",
    h1: "What kind of teammate are you?",
    lede: "Not a questionnaire. Three short scenes. How you act is the kind of teammate you are.",
    hint: "One choice per scene. The same choices always make the same card.",
    boundary: "A toy, not a personality test.",
    progress: (n) => `Scene ${n} of 3`,
    choicesLabel: "Pick one",
    backStep: "Previous scene",
    kicker: "Your teammate card",
    roleLabel: "Party role",
    funny: "Funny",
    gentle: "Gentle",
    literary: "Literary",
    strength: "Strength",
    rare: "Rare",
    picks: (code) => `Your choices ${code}`,
    same: "A friend who picks the same way gets the same card.",
    stored: "Nothing is stored. The share link carries only the three choices.",
    again: "Play again",
    copy: "Copy share link",
    copied: "Link copied",
    copyFallback: "Copy it from the field below",
    share: "Share",
    download: "Download card",
    downloadFail: "The picture didn't save this time. The link still shares the card.",
    back: "Back to the Digital Garage",
  },
};

const LETTERS = "ABCDEF";

export function resolveChoices(code) {
  if (typeof code !== "string" || !/^[ABCDEF]{3}$/.test(code)) return null;
  const indexes = [...code].map((letter) => LETTERS.indexOf(letter));
  if (indexes.some((choiceIndex, scenarioIndex) => !SCENARIOS[scenarioIndex].choices[choiceIndex])) return null;
  const types = indexes.map((choiceIndex, scenarioIndex) => SCENARIOS[scenarioIndex].choices[choiceIndex].type);
  const counts = {};
  for (const type of types) counts[type] = (counts[type] || 0) + 1;
  const majority = Object.entries(counts).find(([, n]) => n >= 2);
  if (majority) return { code, type: majority[0], tie: false };
  const scenarioIndex = (indexes[0] + indexes[1] + indexes[2]) % 3;
  let type = types[scenarioIndex];
  if (type === "queen" || type === "designer") {
    const others = indexes.filter((_, index) => index !== scenarioIndex);
    const sameParity = (others[0] + others[1]) % 2 === 0;
    if (!sameParity) type = types[(scenarioIndex + 1) % 3];
  }
  const usesNewLetter = indexes.some((choiceIndex) => choiceIndex >= 4);
  const sum = indexes[0] + indexes[1] + indexes[2];
  if (usesNewLetter && type !== "queen" && type !== "designer" && sum % 7 === 1) {
    return { code, type: "alliance", tie: true };
  }
  if (usesNewLetter && type !== "queen" && type !== "designer" && sum % 9 === 0) {
    return { code, type: "missionary", tie: true };
  }
  if (usesNewLetter && type !== "queen" && type !== "designer" && sum % 9 === 7) {
    return { code, type: "apostle", tie: true };
  }
  if (type === "queen") type = indexes[1] % 2 === 0 ? "galaxy" : "andromeda";
  return { code, type, tie: true };
}

export function distribution(letters = LETTERS) {
  const counts = {};
  for (const id of Object.keys(TYPES)) counts[id] = 0;
  for (const a of letters) {
    for (const b of letters) {
      for (const c of letters) counts[resolveChoices(a + b + c).type] += 1;
    }
  }
  return counts;
}

export function readRoute(search) {
  const params = new URLSearchParams(typeof search === "string" ? search : "");
  const lang = params.get("lang") === "en" ? "en" : "zh";
  const raw = (params.get("c") || "").toUpperCase();
  const code = resolveChoices(raw) ? raw : null;
  return { lang, code };
}

export function shareSearch(code, lang) {
  const params = new URLSearchParams();
  params.set("c", code);
  params.set("lang", lang === "en" ? "en" : "zh");
  return params.toString();
}

const PROPS = {
  umbrella: `<path d="M10 34c0-14 9.8-24 22-24s22 10 22 24" fill="#F08A6E" stroke="#193A35" stroke-width="2.5"/><path d="M10 34h44M32 10v24" fill="none" stroke="#193A35" stroke-width="2.5"/><path d="M32 34c8 0 10 8 10 8" fill="none" stroke="#193A35" stroke-width="2.5" stroke-linecap="round"/><path d="M32 42v12" stroke="#193A35" stroke-width="2.5" stroke-linecap="round"/>`,
  drink: `<rect x="22" y="18" width="20" height="28" rx="4" fill="#F6F3ED" stroke="#193A35" stroke-width="2.5"/><path d="M26 30h12" stroke="#F08A6E" stroke-width="3" stroke-linecap="round"/><path d="M30 14c2-4 6-4 4-8M38 16c2-3 5-3 4-7" fill="none" stroke="#62716A" stroke-width="2" stroke-linecap="round"/>`,
  spark: `<g stroke="#F08A6E" stroke-width="2.5" stroke-linecap="round" fill="none"><path d="M32 6v14M32 44v14M6 32h14M44 32h14M13 13l9 9M42 42l9 9M51 13l-9 9M22 42l-9 9"/></g><circle cx="32" cy="32" r="5" fill="#F08A6E" stroke="#193A35" stroke-width="2"/>`,
  map: `<rect x="8" y="14" width="48" height="36" rx="3" fill="#F6F3ED" stroke="#193A35" stroke-width="2.5"/><path d="M32 14v36M14 28c6 5 8-5 14 0M36 34c5 5 8-3 12 1" fill="none" stroke="#193A35" stroke-width="2"/><circle cx="22" cy="40" r="3" fill="#F08A6E"/>`,
  headphones: `<path d="M14 34c0-12 8-20 18-20s18 8 18 20" fill="none" stroke="#193A35" stroke-width="2.5" stroke-linecap="round"/><rect x="8" y="30" width="10" height="16" rx="3" fill="#193A35"/><rect x="46" y="30" width="10" height="16" rx="3" fill="#193A35"/>`,
  plan: `<rect x="14" y="10" width="36" height="44" rx="3" fill="#F6F3ED" stroke="#193A35" stroke-width="2.5"/><path d="M22 24h20M22 32h16M22 40h12" fill="none" stroke="#193A35" stroke-width="2.5" stroke-linecap="round"/>`,
  note: `<rect x="8" y="16" width="48" height="32" rx="3" fill="#F6F3ED" stroke="#193A35" stroke-width="2.5"/><path d="M8 16l24 18L56 16" fill="none" stroke="#F08A6E" stroke-width="2.5"/>`,
  crown: `<path d="M10 44l6-22 10 12 6-18 6 18 10-12 6 22z" fill="#F08A6E" stroke="#193A35" stroke-width="2.5" stroke-linejoin="round"/><rect x="12" y="44" width="40" height="8" rx="2" fill="#8A6A2B" stroke="#193A35" stroke-width="2"/>`,
  palette: `<ellipse cx="30" cy="34" rx="20" ry="15" fill="#F6F3ED" stroke="#193A35" stroke-width="2.5"/><circle cx="20" cy="30" r="4" fill="#F08A6E"/><circle cx="32" cy="26" r="4" fill="#8A6A2B"/><circle cx="40" cy="34" r="4" fill="#193A35"/><circle cx="28" cy="40" r="3.5" fill="#DDE7DE" stroke="#193A35" stroke-width="1.5"/>`,
  card: `<rect x="16" y="12" width="32" height="40" rx="3" fill="#F6F3ED" stroke="#193A35" stroke-width="2.5"/><circle cx="32" cy="30" r="5" fill="#F08A6E"/>`,
  bundle: `<rect x="14" y="20" width="36" height="26" rx="6" fill="#E8DDC6" stroke="#193A35" stroke-width="2.5"/><path d="M32 20v26M14 33h36" fill="none" stroke="#193A35" stroke-width="2"/>`,
};

const WASH = {
  umbrella: "#D7E4DC",
  cocoa: "#F6D4C8",
  finisher: "#E6DFD4",
  spark: "#F8DCD2",
  mapkeeper: "#DDE7DE",
  soundtrack: "#E8DDC6",
  strategist: "#D5DDD8",
  messenger: "#E3E8E1",
  galaxy: "#D9E0F2",
  andromeda: "#F8E7C9",
  designer: "#E8DFD6",
  alliance: "#E3DDF2",
  missionary: "#F3D7C4",
  apostle: "#D5DCE6",
};

const emblems = {};

const PORTRAIT_SRC = {
  umbrella: "assets/umbrella.webp",
  finisher: "assets/finisher.webp",
  spark: "assets/spark.webp",
  mapkeeper: "assets/mapkeeper.webp",
  soundtrack: "assets/soundtrack.webp",
  strategist: "assets/strategist.webp",
  messenger: "assets/messenger.webp",
  designer: "assets/designer.webp",
  galaxy: "assets/galaxy.webp",
  andromeda: "assets/andromeda.webp",
  missionary: "assets/missionary.webp",
  apostle: "assets/apostle.webp",
};

const HORSE_SRC = "assets/winged-horse.webp";

function readyImage(id, expectedSrc) {
  if (typeof document === "undefined") return null;
  const node = document.getElementById(id);
  if (!node || !node.complete || node.naturalWidth <= 0) return null;
  if (expectedSrc && node.getAttribute("src") !== expectedSrc) return null;
  return node;
}

function preloadEmblems() {
  for (const [kind, markup] of Object.entries(PROPS)) {
    const img = new Image();
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256" viewBox="0 0 64 64">${markup}</svg>`;
    img.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
    emblems[kind] = img;
  }
}

const FONT = "\"PingFang TC\", \"Microsoft JhengHei\", \"Noto Sans CJK TC\", \"WenQuanYi Micro Hei\", \"Droid Sans Fallback\", sans-serif";

function $(id) {
  return document.getElementById(id);
}

function el(tag, cls, text) {
  const node = document.createElement(tag);
  if (cls) node.className = cls;
  if (text != null) node.textContent = text;
  return node;
}

function propNode(kind) {
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("viewBox", "0 0 64 64");
  svg.setAttribute("aria-hidden", "true");
  svg.classList.add("prop", `prop-${kind}`);
  svg.innerHTML = PROPS[kind];
  return svg;
}

function wrapLines(ctx, text, maxWidth) {
  const lines = [];
  const words = String(text).split(/\s+/).filter(Boolean);
  let line = "";
  const pushChunk = (chunk) => {
    if (!line) {
      line = chunk;
      return;
    }
    const next = `${line} ${chunk}`;
    if (ctx.measureText(next).width <= maxWidth) line = next;
    else {
      lines.push(line);
      line = chunk;
    }
  };
  for (const word of words.length ? words : [""]) {
    if (ctx.measureText(word).width <= maxWidth) {
      pushChunk(word);
      continue;
    }
    if (line) {
      lines.push(line);
      line = "";
    }
    let chunk = "";
    for (const ch of Array.from(word)) {
      const next = chunk + ch;
      if (chunk && ctx.measureText(next).width > maxWidth) {
        lines.push(chunk);
        chunk = ch;
      } else chunk = next;
    }
    line = chunk;
  }
  if (line) lines.push(line);
  return lines.length ? lines : [""];
}

function boot() {
  const route = readRoute(location.search);
  const state = {
    lang: route.lang,
    step: 0,
    picks: route.code ? [...route.code] : [],
    code: route.code,
  };
  let poseTimer = null;

  function stopPose() {
    if (poseTimer) clearInterval(poseTimer);
    poseTimer = null;
  }

  function playPose(type) {
    stopPose();
    const pose = POSES[type.pose];
    const img = $("mg");
    const stage = $("stage");
    img.alt = type[state.lang].alt;
    img.src = ASSET + pose.frames[0];
    stage.classList.remove("motion-float", "motion-bob", "motion-squash");
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!reduce) stage.classList.add(`motion-${pose.motion}`);
    if (!reduce && pose.frames.length > 1) {
      let frame = 0;
      poseTimer = setInterval(() => {
        frame = (frame + 1) % pose.frames.length;
        img.src = ASSET + pose.frames[frame];
      }, pose.ms);
    }
    const prop = $("prop");
    prop.textContent = "";
    if (type.prop) prop.appendChild(propNode(type.prop));
  }

  function persist() {
    const next = new URL(location.href);
    next.search = "";
    next.hash = "";
    if (state.code) next.searchParams.set("c", state.code);
    next.searchParams.set("lang", state.lang);
    history.replaceState(null, "", next);
  }

  function shareUrl() {
    const next = new URL(location.href);
    next.search = shareSearch(state.code, state.lang);
    next.hash = "";
    return next.toString();
  }

  function render(focus) {
    const ui = UI[state.lang];
    const other = state.lang === "zh" ? "en" : "zh";
    document.documentElement.lang = ui.htmlLang;
    document.title = `${ui.title} — Paul's Tradecraft`;
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute("content", ui.description);
    $("skip").textContent = ui.skip;
    $("eyebrow").textContent = ui.eyebrow;
    $("lang-group").setAttribute("aria-label", ui.langGroup);
    document.querySelectorAll("[data-set-lang]").forEach((button) => {
      button.setAttribute("aria-pressed", String(button.dataset.setLang === state.lang));
    });
    $("boundary").textContent = ui.boundary;
    $("title").textContent = ui.h1;
    $("lede").textContent = ui.lede;
    $("hint").textContent = ui.hint;
    $("foot-boundary").textContent = ui.boundary;
    $("stored").textContent = ui.stored;
    const back = $("back");
    back.textContent = ui.back;
    back.href = `/?lang=${state.lang}#garage`;

    const quiz = $("quiz");
    const result = $("result");
    if (!state.code) {
      stopPose();
      $("stage").classList.remove("with-horse", "with-queen", "motion-float", "motion-bob", "motion-squash");
      $("horse").setAttribute("hidden", "");
      $("queen-art").setAttribute("hidden", "");
      $("mg").hidden = false;
      $("rare").hidden = true;
      $("companion").hidden = true;
      quiz.hidden = false;
      result.hidden = true;
      const scenario = SCENARIOS[state.step];
      const copy = scenario[state.lang];
      $("progress").textContent = ui.progress(state.step + 1);
      $("setting").textContent = copy.setting;
      $("scenario-title").textContent = copy.title;
      $("prompt").textContent = copy.prompt;
      $("choices").setAttribute("aria-label", ui.choicesLabel);
      const choices = $("choices");
      choices.textContent = "";
      scenario.choices.forEach((choice) => {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "choice";
        button.appendChild(el("span", "letter", choice.id));
        button.appendChild(el("span", "choice-text", choice[state.lang]));
        button.addEventListener("click", () => choose(choice.id));
        choices.appendChild(button);
      });
      const backStep = $("back-step");
      backStep.hidden = state.step === 0;
      backStep.textContent = ui.backStep;
      if (focus === "scenario") $("scenario-title").focus();
      return;
    }

    const resolved = resolveChoices(state.code);
    const type = TYPES[resolved.type];
    const text = type[state.lang];
    quiz.hidden = true;
    result.hidden = false;
    $("card-kicker").textContent = ui.kicker;
    $("card-name").textContent = text.name;
    $("other-name").textContent = type[other].name;
    $("role").textContent = `${ui.roleLabel} · ${text.role}`;
    const lines = $("lines");
    lines.textContent = "";
    [
      ["funny", ui.funny, text.funny],
      ["gentle", ui.gentle, text.gentle],
      ["literary", ui.literary, text.literary],
      ["strength", ui.strength, text.strength],
    ].forEach(([key, label, body]) => {
      const block = el("div", `line line-${key}`);
      block.appendChild(el("p", "line-label", label));
      const bodyEl = el("p", "line-body");
      if (key === "funny") bodyEl.appendChild(el("span", "mark", body));
      else bodyEl.textContent = body;
      block.appendChild(bodyEl);
      lines.appendChild(block);
    });
    $("picks-label").textContent = ui.picks(state.code);
    $("same").textContent = ui.same;
    $("card-boundary").textContent = ui.boundary;
    $("again").textContent = ui.again;
    $("copy-link").textContent = ui.copy;
    $("share-btn").textContent = ui.share;
    $("download").textContent = ui.download;
    $("share-label").textContent = ui.copy;
    $("share-url").value = shareUrl();
    $("status").textContent = "";
    const rare = resolved.type === "galaxy" || resolved.type === "andromeda" || resolved.type === "designer";
    $("rare").hidden = !rare;
    $("rare").textContent = rare ? ui.rare : "";
    showCompanion(type, resolved.type);
    if (focus === "card") $("card-name").focus();
  }

  function showCompanion(type, typeId) {
    const stage = $("stage");
    const horse = $("horse");
    const queenArt = $("queen-art");
    const img = $("mg");
    const caption = $("companion");
    const portraitSrc = PORTRAIT_SRC[typeId];
    const alliance = typeId === "alliance";
    stage.classList.toggle("with-horse", alliance);
    stage.classList.toggle("with-queen", Boolean(portraitSrc));
    if (portraitSrc) {
      if (queenArt.getAttribute("src") !== portraitSrc) queenArt.setAttribute("src", portraitSrc);
      queenArt.removeAttribute("hidden");
    } else {
      queenArt.setAttribute("hidden", "");
    }
    if (alliance) {
      if (horse.getAttribute("src") !== HORSE_SRC) horse.setAttribute("src", HORSE_SRC);
      horse.removeAttribute("hidden");
    } else horse.setAttribute("hidden", "");
    img.hidden = alliance || Boolean(portraitSrc);
    caption.hidden = true;
    caption.textContent = "";
    if (portraitSrc || alliance) {
      stopPose();
      stage.classList.remove("motion-float", "motion-bob", "motion-squash");
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (!reduce) stage.classList.add("motion-float");
      if (portraitSrc) queenArt.alt = type[state.lang].alt;
      if (alliance) {
        horse.alt = type[state.lang].alt;
        horse.setAttribute("aria-hidden", "false");
        horse.removeAttribute("aria-label");
      }
      $("prop").textContent = "";
      return;
    }
    horse.alt = "";
    horse.setAttribute("aria-hidden", "true");
    horse.removeAttribute("aria-label");
    playPose(type);
  }

  function choose(id) {
    if (state.code) return;
    const picks = state.picks.slice(0, state.step);
    picks[state.step] = id;
    state.picks = picks;
    if (state.step < 2) {
      state.step += 1;
      render("scenario");
      return;
    }
    state.code = picks.join("");
    persist();
    render("card");
  }

  async function copyLink() {
    const ui = UI[state.lang];
    const field = $("share-url");
    try {
      await navigator.clipboard.writeText(field.value);
      $("status").textContent = ui.copied;
    } catch {
      field.focus();
      field.select();
      $("status").textContent = ui.copyFallback;
    }
  }

  async function shareNative() {
    const ui = UI[state.lang];
    const field = $("share-url");
    if (!navigator.share) return;
    try {
      await navigator.share({ title: ui.title, text: ui.boundary, url: field.value });
    } catch {
      /* dismissed share sheet */
    }
  }

  function downloadCard() {
    const ui = UI[state.lang];
    const resolved = resolveChoices(state.code);
    if (!resolved) return;
    const type = TYPES[resolved.type];
    const text = type[state.lang];
    const other = state.lang === "zh" ? "en" : "zh";
    const width = 1080;
    // 2160×4400 export. 2160×3240 cannot keep both a 40–50% picture and
    // full-size English lines; this height does, and the shrink loop below
    // still refuses to let the last line meet the footer.
    const height = 2200;
    const scale = 2;
    const pad = 108;
    const inner = width - pad * 2;
    const canvas = document.createElement("canvas");
    canvas.width = width * scale;
    canvas.height = height * scale;
    const ctx = canvas.getContext("2d");
    ctx.setTransform(scale, 0, 0, scale, 0, 0);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.textBaseline = "top";

    const wash = ctx.createLinearGradient(0, 0, width, height);
    wash.addColorStop(0, "#F6F3ED");
    wash.addColorStop(0.55, "#F6F3ED");
    wash.addColorStop(1, WASH[resolved.type] || "#DDE7DE");
    ctx.fillStyle = wash;
    ctx.fillRect(0, 0, width, height);
    ctx.save();
    ctx.globalAlpha = 0.045;
    ctx.strokeStyle = "#193A35";
    ctx.lineWidth = 2;
    for (let x = -height; x < width; x += 22) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x + height, height);
      ctx.stroke();
    }
    ctx.restore();

    ctx.strokeStyle = "#193A35";
    ctx.lineWidth = 8;
    roundRect(ctx, 28, 28, width - 56, height - 56, 40);
    ctx.stroke();
    ctx.lineWidth = 2;
    roundRect(ctx, 48, 48, width - 96, height - 96, 28);
    ctx.stroke();
    ctx.fillStyle = "#F08A6E";
    for (const [x, y] of [[64, 64], [width - 64, 64], [64, height - 64], [width - 64, height - 64]]) {
      ctx.beginPath();
      ctx.arc(x, y, 7, 0, Math.PI * 2);
      ctx.fill();
    }
    const rare = resolved.type === "galaxy" || resolved.type === "andromeda" || resolved.type === "designer";
    if (rare) {
      ctx.strokeStyle = resolved.type === "designer" ? "#6E8B74" : resolved.type === "andromeda" ? "#D4B06A" : "#C4A15A";
      ctx.lineWidth = 5;
      roundRect(ctx, 36, 36, width - 72, height - 72, 36);
      ctx.stroke();
    }

    const center = (line, y, font, color) => {
      ctx.font = font;
      ctx.fillStyle = color;
      const w = ctx.measureText(line).width;
      ctx.fillText(line, Math.round((width - w) / 2), y);
    };

    center(ui.kicker, 64, `700 40px ${FONT}`, "#62716A");

    const BOUNDARY = 54;
    const BASE = { LABEL: 54, PICKS: 48, BODY: 40, FUNNY: 44, NAME: 58, OTHER: 32, ROLE: 36 };
    const artTop = 128;
    const lead = (size) => size + 8;
    const measureCard = (textScale) => {
      const sz = {};
      for (const key of Object.keys(BASE)) sz[key] = Math.max(22, Math.round(BASE[key] * textScale));
      ctx.font = `700 ${BOUNDARY}px ${FONT}`;
      const boundaryLines = wrapLines(ctx, ui.boundary, inner);
      ctx.font = `600 ${sz.PICKS}px ${FONT}`;
      const picksLines = wrapLines(ctx, ui.picks(state.code), inner);
      ctx.font = `700 ${sz.NAME}px ${FONT}`;
      const nameLines = wrapLines(ctx, text.name, inner);
      ctx.font = `600 ${sz.OTHER}px ${FONT}`;
      const otherLines = wrapLines(ctx, type[other].name, inner);
      ctx.font = `700 ${sz.ROLE}px ${FONT}`;
      const roleLines = wrapLines(ctx, `${ui.roleLabel} · ${text.role}`, inner);
      ctx.font = `700 ${sz.FUNNY}px ${FONT}`;
      const funnyLines = wrapLines(ctx, text.funny, inner);
      const sectionLines = [text.gentle, text.literary, text.strength].map((body, index) => {
        ctx.font = `${index === 2 ? 600 : 500} ${sz.BODY}px ${FONT}`;
        return wrapLines(ctx, body, inner);
      });
      const footerH = picksLines.length * lead(sz.PICKS) + 14 + boundaryLines.length * lead(BOUNDARY);
      let bodyH = nameLines.length * lead(sz.NAME);
      bodyH += 8 + otherLines.length * lead(sz.OTHER);
      bodyH += 6 + roleLines.length * lead(sz.ROLE);
      bodyH += rare ? 58 : 12;
      bodyH += sz.LABEL + 10 + funnyLines.length * lead(sz.FUNNY) + 10;
      sectionLines.forEach((lines) => {
        bodyH += sz.LABEL + 10 + lines.length * lead(sz.BODY) + 8;
      });
      return { sz, boundaryLines, picksLines, nameLines, otherLines, roleLines, funnyLines, sectionLines, footerH, bodyH };
    };
    const cardFits = (ratio, measured) => {
      const artH = Math.round(height * ratio);
      const footerTop = height - 48 - 56 - measured.footerH;
      return artTop + artH + 16 + measured.bodyH <= footerTop - 20;
    };
    let textScale = 1;
    let artRatio = 0.46;
    let plan = measureCard(textScale);
    if (!cardFits(artRatio, plan)) {
      for (let ratio = 44; ratio >= 40; ratio -= 2) {
        artRatio = ratio / 100;
        if (cardFits(artRatio, plan)) break;
      }
    }
    if (!cardFits(artRatio, plan)) {
      for (let scale = 96; scale >= 72; scale -= 2) {
        textScale = scale / 100;
        plan = measureCard(textScale);
        if (cardFits(artRatio, plan)) break;
      }
    }
    while (!cardFits(artRatio, plan) && textScale > 0.6) {
      textScale = Math.round((textScale - 0.02) * 100) / 100;
      plan = measureCard(textScale);
    }
    if (cardFits(artRatio, plan)) {
      for (let ratio = Math.round(artRatio * 100) + 2; ratio <= 50; ratio += 2) {
        if (!cardFits(ratio / 100, plan)) break;
        artRatio = ratio / 100;
      }
    }
    const artH = Math.round(height * artRatio);
    const footerTop = height - 48 - 56 - plan.footerH;
    const { sz, boundaryLines, picksLines, nameLines, otherLines, roleLines, funnyLines, sectionLines } = plan;

    const portrait = readyImage("queen-art", PORTRAIT_SRC[resolved.type]);
    const horseNode = readyImage("horse", HORSE_SRC);
    let artBottom = artTop;
    const fitDraw = (image, maxW, shiftX = 0) => {
      let drawH = artH;
      let drawW = (image.naturalWidth / image.naturalHeight) * drawH;
      if (drawW > maxW) {
        drawW = maxW;
        drawH = drawW * (image.naturalHeight / image.naturalWidth);
      }
      let x = Math.round((width - drawW) / 2 + shiftX);
      x = Math.max(56, Math.min(x, width - 56 - Math.round(drawW)));
      ctx.drawImage(image, x, artTop, drawW, drawH);
      return artTop + drawH;
    };
    if (resolved.type === "alliance" && horseNode) artBottom = fitDraw(horseNode, 1000);
    else if (portrait) artBottom = fitDraw(portrait, 640);
    else {
      const img = $("mg");
      // Square sprite: shift left so the top-right emblem stays clear of the face.
      if (img.complete && img.naturalWidth > 0) artBottom = fitDraw(img, 800, -90);
    }

    const emblem = type.prop ? emblems[type.prop] : null;
    if (emblem && emblem.complete && emblem.naturalWidth > 0) {
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.arc(width - 168, 196, 58, 0, Math.PI * 2);
      ctx.fill();
      ctx.lineWidth = 3;
      ctx.strokeStyle = "#193A35";
      ctx.stroke();
      ctx.drawImage(emblem, width - 214, 150, 92, 92);
    }

    let y = artBottom + 16;
    nameLines.forEach((line) => {
      center(line, y, `700 ${sz.NAME}px ${FONT}`, "#193A35");
      y += lead(sz.NAME);
    });
    otherLines.forEach((line) => {
      center(line, y, `600 ${sz.OTHER}px ${FONT}`, "#62716A");
      y += lead(sz.OTHER);
    });
    y += 8;
    roleLines.forEach((line) => {
      center(line, y, `700 ${sz.ROLE}px ${FONT}`, "#142C29");
      y += lead(sz.ROLE);
    });
    y += 6;
    if (rare) {
      ctx.font = `700 28px ${FONT}`;
      const badge = ui.rare;
      const badgeW = ctx.measureText(badge).width + 36;
      const badgeX = Math.round((width - badgeW) / 2);
      ctx.fillStyle = "#F08A6E";
      roundRect(ctx, badgeX, y, badgeW, 42, 21);
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = "#193A35";
      ctx.stroke();
      ctx.fillStyle = "#142C29";
      ctx.fillText(badge, badgeX + 18, y + 8);
      y += 58;
    } else {
      y += 12;
    }

    const drawLabel = (label) => {
      ctx.font = `700 ${sz.LABEL}px ${FONT}`;
      ctx.fillStyle = "#8A6A2B";
      ctx.fillText(label, pad, y);
      y += sz.LABEL + 10;
    };
    drawLabel(ui.funny);
    funnyLines.forEach((line) => {
      ctx.font = `700 ${sz.FUNNY}px ${FONT}`;
      const w = ctx.measureText(line).width;
      ctx.fillStyle = "#F08A6E";
      ctx.fillRect(pad, y + Math.round(sz.FUNNY * 0.62), Math.min(w, inner), Math.max(12, Math.round(sz.FUNNY * 0.36)));
      ctx.fillStyle = "#193A35";
      ctx.fillText(line, pad, y);
      y += lead(sz.FUNNY);
    });
    y += 10;
    [text.gentle, text.literary, text.strength].forEach((body, index) => {
      drawLabel([ui.gentle, ui.literary, ui.strength][index]);
      const weight = index === 2 ? 600 : 500;
      sectionLines[index].forEach((line) => {
        ctx.font = `${weight} ${sz.BODY}px ${FONT}`;
        ctx.fillStyle = "#193A35";
        ctx.fillText(line, pad, y);
        y += lead(sz.BODY);
      });
      y += 8;
    });

    let foot = footerTop;
    picksLines.forEach((line) => {
      ctx.font = `600 ${sz.PICKS}px ${FONT}`;
      ctx.fillStyle = "#62716A";
      ctx.fillText(line, pad, foot);
      foot += lead(sz.PICKS);
    });
    foot += 14;
    boundaryLines.forEach((line) => {
      ctx.font = `700 ${BOUNDARY}px ${FONT}`;
      ctx.fillStyle = "#193A35";
      ctx.fillText(line, pad, foot);
      foot += lead(BOUNDARY);
    });

    try {
      const link = document.createElement("a");
      link.href = canvas.toDataURL("image/png");
      link.download = `teammate-${state.code}.png`;
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch {
      $("status").textContent = ui.downloadFail;
    }
  }

  document.querySelectorAll("[data-set-lang]").forEach((button) => {
    button.addEventListener("click", () => {
      if (button.dataset.setLang === state.lang) return;
      state.lang = button.dataset.setLang;
      persist();
      render();
    });
  });
  $("back-step").addEventListener("click", () => {
    if (state.code || state.step === 0) return;
    state.step -= 1;
    render("scenario");
  });
  $("again").addEventListener("click", () => {
    state.code = null;
    state.picks = [];
    state.step = 0;
    persist();
    render("scenario");
  });
  $("copy-link").addEventListener("click", copyLink);
  $("share-btn").addEventListener("click", shareNative);
  $("download").addEventListener("click", downloadCard);
  if (!navigator.share) $("share-btn").hidden = true;

  preloadEmblems();

  if (!state.code && new URLSearchParams(location.search).has("c")) persist();
  render(state.code ? "card" : null);
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

if (typeof document !== "undefined") boot();
