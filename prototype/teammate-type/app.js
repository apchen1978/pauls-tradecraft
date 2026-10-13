// 十二月的燈 / December Lights — 你是哪一種隊友？ / What kind of teammate are you?
// Self-contained Garage toy. No network calls, no storage. The share link's `c`
// param is the three choice letters; `with` is an optional second card; `lang`
// only picks the language. Scoring does not read `with`.
//
// Choice → type (A–D kept; Paul approved those lines. E–F added later):
//   Scenario 1 專案死線前一晚 / The night before the deadline
//     A umbrella 擋雨的人    B cocoa 晚安熱可可
//     C spark 腦內煙火師     D mapkeeper 地圖收藏家
//     E strategist 軍師      F queen 女王
//     G craftsman 修好了     H recorder 靚仔
//   Scenario 2 社團成果展佈置 / Setting up the club showcase
//     A umbrella             B finisher 最後一擊
//     C soundtrack BGM 擔當  D mapkeeper
//     E messenger 傳令兵     F designer 設計師
//     G craftsman            H recorder
//   Scenario 3 線上組隊打王倒數 / Countdown to the boss fight
//     A cocoa                B spark
//     C finisher             D soundtrack
//     E strategist           F messenger
//     G craftsman            H recorder
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
//      仙女座女王. FAE is 銀河之女; FBD is 仙女座女王. Three codes each.
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
//      G and H never appear in those 216 codes, so every old result stays.
//      A code that uses G or H keeps the same rules, except a three-way tie
//      whose choice-index sum mod 12 is 6 becomes a queen (even middle
//      index 銀河之女, odd 仙女座女王). Majority G or H still wins, so
//      GGG is 修好了 and HHH is 靚仔. Across 512 codes the queens are
//      9 each, 18/512, inside 3–5%, and still the rarest scores.
//      The rare frame and badge are only the two queens. Designer keeps
//      these same codes and is a normal card.
//      守護者 always uses MG. 聯盟 uses the winged horse in
//      assets/winged-horse.webp (the same horse drawing as the live card).
//      The other roles use their anime portraits
//      (assets/<role>.webp) instead of MG. Crowns are only on the two queens.
//      Each picture is loaded only when that card is shown, or when the
//      cast list is opened. The quiz itself does not request them.
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

import { ROLE_ORDER, SAMPLE_CODES, GAZE, dialogueFor, extractCode, shouldFaceIn } from "./duo.js";

export const ASSET = "/mg-mini-demo/assets/";

export const POSES = {
  think: {
    motion: "float",
    ms: 280,
    frames: ["waiting/00.webp", "waiting/01.webp", "waiting/02.webp", "waiting/03.webp", "waiting/04.webp", "waiting/05.webp"],
  },
  heart: {
    motion: "float",
    ms: 480,
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
      person: "阿白",
      name: "擋雨的人",
      role: "坦克",
      funny: "大家在崩潰的時候，你已經默默把雷都踩完了。",
      gentle: "有你在前面，大家才敢往前走。",
      literary: "「我不說累，只是把雨收進傘裡。」",
      strength: "扛得住壓力，讓人安心。",
      alt: "短黑髮、深棕眼睛、穿松綠雨衣、面向左側撐傘的人",
    },
    en: {
      person: "Abai",
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
      person: "MG",
      name: "晚安熱可可",
      role: "守護者",
      funny: "隊上唯一記得大家還沒吃飯的人。",
      gentle: "因為有你，大家才撐得到最後。",
      literary: "「把每個人的疲倦，泡成一杯溫的。」",
      strength: "看得見別人的狀態，懂得照顧。",
      alt: "橘色虎斑小貓，白嘴白胸白爪，項圈牌子寫著 MG，身旁有一杯熱可可",
    },
    en: {
      person: "MG",
      name: "The Cocoa",
      role: "Guardian",
      funny: "The only one on the team who remembers nobody has eaten yet.",
      gentle: "Because of you, the team makes it to the end.",
      literary: "\"I brew everyone's tiredness into something warm.\"",
      strength: "Notices how people are doing, and looks after them.",
      alt: "An orange tabby kitten with a white muzzle, chest and paws, a collar tag reading MG, and a cup of hot cocoa",
    },
  },
  finisher: {
    pose: "jump",
    prop: null,
    zh: {
      person: "塞安",
      name: "最後一擊",
      role: "刺客",
      funny: "前面看起來都在滑手機，最後一刻一刀收工。",
      gentle: "關鍵時刻交給你，大家很放心。",
      literary: "「我不急，我在等那個剛剛好的時刻。」",
      strength: "爆發力強，會收尾。",
      alt: "短黑髮、琥珀色眼睛、穿炭灰背心與銅金襯衫、面向右側的人",
    },
    en: {
      person: "Zion",
      name: "The Finisher",
      role: "Assassin",
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
      person: "阿閃",
      name: "腦內煙火師",
      role: "點子",
      funny: "你的點子一半是天才，另一半天才到大家聽不懂。",
      gentle: "你讓大家看見另一條路。",
      literary: "「別人看到牆，我看到一扇還沒畫上的窗。」",
      strength: "換個角度想，點子多。",
      alt: "捲曲赤褐髮、綠色眼睛、穿靛藍上衣、看向上方的人",
    },
    en: {
      person: "Flick",
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
      person: "莉婭",
      name: "地圖收藏家",
      role: "斥候",
      funny: "還沒開工，你已經知道插座在哪、誰會遲到。",
      gentle: "有你先看路，大家少繞很多冤枉路。",
      literary: "「我喜歡在出發前，先把風景讀一遍。」",
      strength: "觀察仔細，先把事情理清楚。",
      alt: "栗色短髮、榛色眼睛、穿橄欖外套、回頭看著空白地圖的人",
    },
    en: {
      person: "Leia",
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
      person: "樂樂",
      name: "BGM 擔當",
      role: "吟遊詩人",
      funny: "進度不一定有，但氣氛一定有。",
      gentle: "你讓辛苦的事變得好過一點。",
      literary: "「每一段努力，都值得一首配樂。」",
      strength: "帶氣氛，讓大家凝聚在一起。",
      alt: "銅紅短髮、棕色眼睛、戴大耳機、穿暖金色外套的人",
    },
    en: {
      person: "Remi",
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
      person: "墨衡",
      name: "先看全局",
      role: "軍師",
      funny: "大家都衝了，你還在問：所以我們要去哪？",
      gentle: "你把整條路看完，大家才不會白跑。",
      literary: "「我不是慢，我是在把下一步想清楚。」",
      strength: "先看整盤，再決定怎麼走。",
      alt: "穿著深綠色長外套、站得很直的人",
    },
    en: {
      person: "Rook",
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
      person: "阿修",
      name: "話送到了",
      role: "傳令兵",
      funny: "你說到最後一個人終於回：收到。",
      gentle: "有你在中間跑，沒有人漏接那句話。",
      literary: "「一句話要到齊，才算說完。」",
      strength: "把話送到每一個人手上。",
      alt: "深色超短髮、藍灰眼睛、邁步揮手、身上有珊瑚色帶子的男生",
    },
    en: {
      person: "Shiu",
      name: "Gets It Through",
      role: "Messenger",
      funny: "You keep saying it until the last person finally answers: got it.",
      gentle: "With you running the middle, nobody misses the message.",
      literary: "\"A sentence isn't finished until it reaches everyone.\"",
      strength: "Gets the word into every person's hands.",
      alt: "A young man with very short dark hair and blue-grey eyes, mid-stride and waving, with a coral sash",
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
      alt: "黑長直髮、深棕眼睛、戴細金冠、穿白底紫金星紋長裙與短披風的人",
    },
    en: {
      name: "Daughter of the Galaxy",
      role: "Queen",
      funny: "You step out, and even the person scrolling looks up.",
      gentle: "You set the center of the room so lightly that people still come closer.",
      literary: "\"Not louder. This circle finally has a center.\"",
      strength: "Holds the room, and makes people want to stand beside you.",
      alt: "A black-haired woman with dark brown eyes, a slim gold crown, a floor-length white gown with purple-gold stars, and a short cape",
    },
  },
  andromeda: {
    pose: "wave",
    prop: "crown",
    egg: "M-31",
    zh: {
      person: "Holly",
      name: "仙女座女王",
      role: "女王",
      funny: "你一笑，原本各做各的人都轉過來了。",
      gentle: "你站在前面，大家就有了一個可以跟上的亮度。",
      literary: "「不是搶位置，是這場本來就缺一道光。」",
      strength: "把場面點亮，也讓人跟得上。",
      alt: "金長髮、藍眼睛、戴寬金冠、穿香檳色長裙、面向右側的人",
    },
    en: {
      person: "Holly",
      name: "Queen of Andromeda",
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
      person: "苔苔",
      name: "順眼就對了",
      role: "設計師",
      funny: "東西還沒排完，你已經在看這兩個顏色配不配。",
      gentle: "你讓整場看起來是故意的，不是剛好。",
      literary: "「好看不是加裝飾，是讓人想靠近。」",
      strength: "有眼光，把東西排得剛剛好。",
      alt: "不對稱黑髮帶一綹苔綠、灰色眼睛、穿色塊衣服、拿著色盤的人",
    },
    en: {
      person: "Moss",
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
      person: "玉仔",
      mark: "照夜玉獅子",
      name: "援軍到了",
      role: "聯盟",
      funny: "你一聲招呼，同伴就從後面趕上來了。",
      gentle: "散開的人看見你，就知道該往哪裡靠。",
      literary: "「不是只來一個，是後面那一排也到了。」",
      strength: "喊得動同伴，也接得住趕來的人。",
      alt: "有翅膀的白馬",
    },
    en: {
      person: "Yuzai",
      mark: "Night-Shining Jade Lion",
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
      person: "言歌",
      name: "這件事值得說",
      role: "傳教士",
      funny: "你講到第三遍，連在滑手機的人都開始點頭。",
      gentle: "你在意的那件事，會變成大家願意一起試的事。",
      literary: "「不是說服，是把一個想法轉到別人看得到的角度。」",
      strength: "把一件事講清楚，也講得讓人想靠近。",
      alt: "黑色捲髮、藍綠眼睛、穿赤陶色長外套、面向右側拿著空白卡片的人",
    },
    en: {
      person: "Echo",
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
      person: "保羅",
      name: "我接著走",
      role: "使徒",
      funny: "大家還沒講完，你已經把那句話收進自己的做法裡。",
      gentle: "你把大家認定的事，一步一步做成。",
      literary: "「不是我起的頭，是我願意把它走到下一個路口。」",
      strength: "認同一件事之後，就真的跟著做完。",
      alt: "灰棕短髮、深灰眼睛、穿藏青外套、往左走並捧著布包的人",
    },
    en: {
      person: "Paul",
      name: "I'll Carry It On",
      role: "Apostle",
      funny: "The sentence isn't even finished, and you've already folded it into how you work.",
      gentle: "You take what the team has settled on, and you actually do it.",
      literary: "\"I didn't start it. I'm willing to walk it to the next corner.\"",
      strength: "Once an idea is yours, you carry it all the way through.",
      alt: "A person with cropped ash-brown hair and dark grey eyes, in a navy jacket, walking left with a plain cloth bundle",
    },
  },
  craftsman: {
    pose: "think",
    prop: null,
    zh: {
      person: "戴安娜",
      name: "修好了",
      role: "工匠",
      funny: "什麼都想順手改良，連沒壞的也拆開看看。",
      gentle: "壞掉的東西到你手上，隔天就會回來，還多了一個小改良。",
      literary: "「壞了的，我留一晚。明天還你的時候，會多一個小地方。」",
      strength: "看到東西壞了就先修，不等開會。",
      alt: "深棕短髮綁小馬尾、琥珀灰眼睛、穿芥末黃工作圍裙、面向左側拿扳手的人",
    },
    en: {
      person: "Diana",
      name: "Fixed It",
      role: "Craftsman",
      funny: "You improve whatever is in reach, and you'll open something that wasn't even broken.",
      gentle: "A broken thing in your hands comes back the next day, with one small improvement.",
      literary: "\"Leave the broken one with me overnight. Tomorrow it comes back with one extra fix.\"",
      strength: "Sees something broken and fixes it, without waiting for a meeting.",
      alt: "A person with a short dark-brown ponytail and amber-grey eyes, in a mustard work apron, facing left with a wrench",
    },
  },
  recorder: {
    pose: "idle",
    prop: null,
    zh: {
      person: "靚仔",
      name: "拍下來了",
      role: "記錄者",
      funny: "一直在拍，合照裡永遠沒有他自己。",
      gentle: "大家忙完回頭，才發現他把每個瞬間都留下來了。",
      literary: "「你們往前走。我把剛剛那一下留在這裡。」",
      strength: "記得過程，讓大家看見自己做了什麼。",
      alt: "淺灰紫短髮、深藍眼睛、穿奶油色背心、把底片相機舉向前面的人",
    },
    en: {
      person: "Lenz",
      name: "Got the Shot",
      role: "Keeper of Moments",
      funny: "Always shooting, and never in the group picture.",
      gentle: "Everyone turns around at the end and finds you kept each moment.",
      literary: "\"You go on ahead. I'll leave that last moment right here.\"",
      strength: "Remembers the process, and lets people see what they did.",
      alt: "A person with a pale grey-purple bob and deep blue eyes, in a cream vest, holding a film camera toward the front",
    },
  },
};

export const FACTIONS = {
  galaxy: {
    mark: "🌌",
    zh: "銀河隊",
    en: "Galaxy Team",
    leader: "galaxy",
    members: ["galaxy", "alliance", "recorder", "umbrella"],
    place: { zh: "屋頂觀星", en: "rooftop stargazing" },
    motto: { zh: "安靜地站穩，大家自然會靠過來。", en: "Stand quietly, and people come closer." },
    pin: { zh: "銀河隊", en: "Galaxy" },
  },
  andromeda: {
    mark: "✨",
    zh: "仙女隊",
    en: "Andromeda Team",
    leader: "andromeda",
    members: ["andromeda", "spark", "soundtrack", "missionary"],
    place: { zh: "露天舞台", en: "open-air stage" },
    motto: { zh: "先把光點起來，大家就想跟上。", en: "Light it up, and people want to follow." },
    pin: { zh: "仙女隊", en: "Andromeda" },
  },
  chart: {
    mark: "🗺️",
    zh: "星圖隊",
    en: "Star-Map Team",
    leader: null,
    members: ["mapkeeper", "strategist", "finisher", "designer"],
    place: { zh: "鐘樓", en: "clock tower" },
    motto: { zh: "先看清楚，路就不會白跑。", en: "See it clearly, and nobody runs the wrong way." },
    pin: { zh: "星圖隊", en: "Star-Map" },
  },
  lantern: {
    mark: "🏮",
    zh: "燈下隊",
    en: "Lantern Team",
    leader: null,
    members: ["cocoa", "messenger", "apostle", "craftsman"],
    place: { zh: "暖窗小屋", en: "cottages with warm windows" },
    motto: { zh: "有人照顧、有人修補、有人記得，隊伍才走得久。", en: "Someone looks after, someone mends, someone remembers. That is how a team lasts." },
    pin: { zh: "燈下隊", en: "Lantern" },
  },
};

const ABOUT = {
  galaxy: ["關於玉仔：喊一聲，後面那一排就到了。", "About Yuzai: one call, and the line behind them arrives."],
  alliance: ["關於銀河之女：她站出來，這一圈就有了中心。", "About Daughter of the Galaxy: when she steps out, the circle has a center."],
  recorder: ["關於阿白：他撐著傘，我把傘下的每個人都拍進來。", "About Abai: he holds the umbrella, and I fit everyone under it into the shot."],
  umbrella: ["關於銀河之女：她站在中間，我把雨擋在外面。", "About Daughter of the Galaxy: she stands in the middle, and I keep the rain outside."],
  andromeda: ["關於言歌：光點起來之後，有人把那件事轉給大家看。", "About Echo: once the light is on, someone turns the idea so everyone can see it."],
  spark: ["關於言歌：我丟出一個點子，有人把它說成大家想聽的話。", "About Echo: I toss out an idea, and someone turns it into words everyone wants to hear."],
  soundtrack: ["關於阿閃：煙火一亮，配樂就接上。", "About Flick: the fireworks go up, and the music comes in."],
  missionary: ["關於 Holly：舞台的燈亮了，我把這件事說給台下的人聽。", "About Holly: once the stage lights come on, I tell the crowd why it matters."],
  mapkeeper: ["關於墨衡：地圖畫完，他才決定往哪走。", "About Rook: once the map is drawn, he decides where to go."],
  strategist: ["關於莉婭：出發前，口袋裡永遠有一張空白地圖。", "About Leia: before setting off, there's always a blank map in that pocket."],
  finisher: ["關於墨衡：我等那一秒，他先看完整盤。", "About Rook: I wait for that one second; he looks at the whole board first."],
  designer: ["關於莉婭：她帶回一張空白地圖，我讓它看起來值得出發。", "About Leia: she brings back a blank map, and I make it look worth setting out for."],
  cocoa: ["關於戴安娜：她修好暖爐，我負責把可可端過去。", "About Diana: she fixes the heater, and I bring the cocoa over."],
  messenger: ["關於保羅：我把話送到，他接著走下去。", "About Paul: I deliver the words, and he carries them on."],
  apostle: ["關於阿修：他跑在前面報信，我跟在後面把事走完。", "About Shiu: he runs ahead with the news, and I follow to see it through."],
  craftsman: ["關於 MG：修到半夜，旁邊總有一杯熱可可。", "About MG: fixing things late at night, there's always a hot cocoa nearby."],
};

export function identityLine(text) {
  if (!text.person) return `${text.name} · ${text.role}`;
  return `${text.person} · ${text.role} · ${text.name}`;
}

export function shortName(text) {
  return text.person || text.name;
}

export function previewLine(text) {
  return `${shortName(text)} · ${text.role}`;
}

for (const [factionId, faction] of Object.entries(FACTIONS)) {
  for (const id of faction.members) TYPES[id].faction = factionId;
}
for (const [id, lines] of Object.entries(ABOUT)) {
  // Name the teammate as a teammate, so the line is not read as this card's own name.
  TYPES[id].zh.about = lines[0].replace(/^關於\s*/, "關於隊友");
  TYPES[id].en.about = lines[1].replace(/^About /, "About teammate ");
}

export function isRare(typeId) {
  return typeId === "galaxy" || typeId === "andromeda";
}

export function factionLabel(typeId, lang) {
  const faction = FACTIONS[TYPES[typeId].faction];
  const lead = faction.leader === typeId ? (lang === "zh" ? " · 隊長" : " · Lead") : "";
  return `${faction.mark} ${faction[lang]}${lead}`;
}

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
      { id: "G", type: "craftsman", zh: "先把一直當機的那台電腦修好，大家才不會一直等。", en: "Fix the computer that keeps freezing, so nobody has to keep waiting." },
      { id: "H", type: "recorder", zh: "先把今晚每個人做的事記下來，明天才看得到。", en: "Write down what everyone did tonight, so tomorrow it's still there." },
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
      { id: "G", type: "craftsman", zh: "展板歪了？我帶了螺絲起子。", en: "The board is crooked? I brought a screwdriver." },
      { id: "H", type: "recorder", zh: "拍下每個人佈置的樣子，結束後做成一張合照牆。", en: "Photograph how each person set things up, and make a wall of it afterward." },
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
      { id: "G", type: "craftsman", zh: "先把卡住的裝備弄好，再進場。", en: "Get the stuck gear working, then go in." },
      { id: "H", type: "recorder", zh: "先開錄影，等一下贏了要有紀錄。", en: "Start recording, so there's a record when we win." },
    ],
  },
];

export const UI = {
  zh: {
    htmlLang: "zh-Hant",
    title: "十二月的燈",
    subtitle: "你是哪一種隊友？",
    description: "十二月的燈。你是哪一種隊友？示意玩具，不是心理測驗。同樣的選擇，永遠得到同一張卡。",
    skip: "跳至內容",
    eyebrow: "Digital Garage · 輕科技玩具",
    langGroup: "語言",
    h1: "十二月的燈",
    intro: "歡迎來到照夜鎮。每個人都有自己的本事。一起完成一件小事，就讓夜晚亮一點。",
    lede: "不是問卷，是三個小情境。看你怎麼做，就知道你是哪一種隊友。",
    hint: "每個情境選一次。同樣的選擇，永遠得到同一張卡。",
    boundary: "示意玩具，不是心理測驗。",
    start: "出發",
    startLamp: "照夜大燈，出發",
    coverHome: "返回",
    coverHint: "點街區認識隊員，點中央的燈出發",
    lockup: "照夜鎮 Nightglow",
    mapAlt: "照夜鎮夜景：左上是銀河隊的屋頂觀星，右上是仙女隊的舞台，左下是星圖隊的鐘樓，右下是燈下隊的小屋，中央是照夜大燈。",
    seeAll: "看全部角色",
    closePreview: "關閉",
    teamList: "四個隊伍",
    entryTitle: "照夜鎮",
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
    stored: "不儲存任何資料。分享連結帶三個選擇；加了另一張卡時，也會帶上。",
    duoTitle: "兩人小劇場",
    duoHint: "選另一個隊友，或貼上朋友的三個字母、分享連結。",
    duoPick: "選一個角色",
    duoPlaceholder: "例如 EEA，或整段連結",
    duoOpen: "看這一幕",
    duoBad: "這組字母還找不到對應的角色，檢查一下朋友的三個字母。",
    duoYou: "你",
    duoFriend: "朋友",
    duoDownload: "下載這一幕",
    again: "再玩一次",
    copy: "複製連結",
    copied: "連結已複製",
    copyFallback: "這次沒複製到。",
    share: "分享",
    download: "下載角色卡",
    downloadFail: "這次沒畫成圖片，連結一樣能分享。",
    back: "回到 Digital Garage",
    galleryTitle: "十六種隊友",
    galleryLead: "四個隊伍，各四個人。點一張，看那張卡。",
  },
  en: {
    htmlLang: "en",
    title: "December Lights",
    subtitle: "What kind of teammate are you?",
    description: "December Lights. What kind of teammate are you? A toy, not a personality test. The same choices always make the same card.",
    skip: "Skip to content",
    eyebrow: "Digital Garage · Light-tech toys",
    langGroup: "Language",
    h1: "December Lights",
    intro: "Welcome to Nightglow. Everyone brings something to the team. Each small thing you accomplish together makes the night a little brighter.",
    lede: "Not a questionnaire. Three short scenes. How you act is the kind of teammate you are.",
    hint: "One choice per scene. The same choices always make the same card.",
    boundary: "A toy, not a personality test.",
    start: "Set out",
    startLamp: "Nightglow lamp, set out",
    coverHome: "Back",
    coverHint: "Tap a district to meet the team. Tap the lamp in the center to set out.",
    lockup: "照夜鎮 Nightglow",
    mapAlt: "Nightglow at night: Galaxy Team stargazing at the top left, Andromeda Team's stage at the top right, the Star-Map Team clock tower at the bottom left, Lantern Team cottages at the bottom right, and the lamp in the center.",
    seeAll: "See every role",
    closePreview: "Close",
    teamList: "Four teams",
    entryTitle: "Nightglow",
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
    stored: "Nothing is stored. The share link carries the three choices, and a second card when you add one.",
    duoTitle: "A short scene for two",
    duoHint: "Pick another teammate, or paste a friend's three letters or share link.",
    duoPick: "Pick a role",
    duoPlaceholder: "For example EEA, or the whole link",
    duoOpen: "Play this scene",
    duoBad: "These letters haven't found a role yet. Check the three letters your friend sent.",
    duoYou: "You",
    duoFriend: "Friend",
    duoDownload: "Download this scene",
    again: "Play again",
    copy: "Copy link",
    copied: "Link copied",
    copyFallback: "That copy didn't land.",
    share: "Share",
    download: "Download card",
    downloadFail: "The picture didn't save this time. The link still shares the card.",
    back: "Back to the Digital Garage",
    galleryTitle: "Sixteen teammates",
    galleryLead: "Four teams, four people each. Open one to see that card.",
  },
};

const LETTERS = "ABCDEFGH";

function resolveCore(code) {
  if (typeof code !== "string" || !/^[ABCDEFGH]{3}$/.test(code)) return null;
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

export function resolveChoices(code) {
  const result = resolveCore(code);
  if (!result || !/[GH]/.test(code)) return result;
  if (!result.tie || result.type === "galaxy" || result.type === "andromeda") return result;
  const indexes = [...code].map((letter) => LETTERS.indexOf(letter));
  const sum = indexes[0] + indexes[1] + indexes[2];
  if (sum % 12 !== 6) return result;
  return { code, type: indexes[1] % 2 === 0 ? "galaxy" : "andromeda", tie: true };
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

export function readPartner(search) {
  const params = new URLSearchParams(typeof search === "string" ? search : "");
  const raw = (params.get("with") || "").toUpperCase();
  return resolveChoices(raw) ? raw : null;
}

export function shareSearch(code, lang, partner) {
  const params = new URLSearchParams();
  params.set("c", code);
  if (partner && resolveChoices(partner)) params.set("with", partner);
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
  craftsman: "#E7D7A8",
  recorder: "#E4DDD4",
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
  craftsman: "assets/craftsman.webp",
  recorder: "assets/recorder.webp",
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

const STICKY_TAIL = /^[了。，、：；！？…]+$/;

function reflowKeepingHead(ctx, text, maxWidth) {
  const chars = Array.from(text);
  const lines = [];
  let chunk = "";
  const minChars = text.startsWith("關於") ? 4 : 1;
  for (const ch of chars) {
    const next = chunk + ch;
    const sticky = /[了。，、：；！？…]/.test(ch);
    const tooWide = ctx.measureText(next).width > maxWidth;
    const longEnough = Array.from(chunk).length >= minChars;
    if (chunk && tooWide && !sticky && longEnough) {
      lines.push(chunk);
      chunk = ch;
    } else chunk = next;
  }
  if (chunk) lines.push(chunk);
  if (lines.length > 1 && STICKY_TAIL.test(lines[lines.length - 1])) {
    const last = lines.pop();
    lines[lines.length - 1] += last;
  }
  return lines.length ? lines : [""];
}

function repairOrphans(ctx, lines, maxWidth) {
  const merged = [];
  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i];
    if (line === "關於" && i + 1 < lines.length) {
      lines[i + 1] = line + lines[i + 1];
      continue;
    }
    if (merged.length && STICKY_TAIL.test(line)) {
      merged[merged.length - 1] += line;
      continue;
    }
    merged.push(line);
  }
  const out = [];
  for (const line of merged) {
    if (ctx.measureText(line).width <= maxWidth + 0.5) out.push(line);
    else out.push(...reflowKeepingHead(ctx, line, maxWidth));
  }
  return out.length ? out : [""];
}

export function wrapLines(ctx, text, maxWidth) {
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
      const sticky = /[了。，、：；！？…]/.test(ch);
      if (chunk && ctx.measureText(next).width > maxWidth && !sticky && !(chunk === "關於")) {
        lines.push(chunk);
        chunk = ch;
      } else chunk = next;
    }
    line = chunk;
  }
  if (line) lines.push(line);
  return repairOrphans(ctx, lines.length ? lines : [""], maxWidth);
}

function boot() {
  const route = readRoute(location.search);
  const state = {
    lang: route.lang,
    step: 0,
    picks: route.code ? [...route.code] : [],
    code: route.code,
    withCode: route.code ? readPartner(location.search) : null,
    duoNote: route.code && new URLSearchParams(location.search).get("with") && !readPartner(location.search) ? "bad" : "",
    started: Boolean(route.code),
    district: null,
    districtOpener: null,
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
    if (state.code && state.withCode) next.searchParams.set("with", state.withCode);
    next.searchParams.set("lang", state.lang);
    history.replaceState(null, "", next);
  }

  function shareUrl() {
    const next = new URL(location.href);
    next.search = shareSearch(state.code, state.lang, state.withCode);
    next.hash = "";
    return next.toString();
  }

  function portraitFor(typeId) {
    if (typeId === "cocoa") return ASSET + POSES.heart.frames[0];
    if (typeId === "alliance") return HORSE_SRC;
    return PORTRAIT_SRC[typeId];
  }

  function paintGalleryChrome() {
    const ui = UI[state.lang];
    $("gallery-title").textContent = ui.galleryTitle;
    $("gallery-lead").textContent = ui.galleryLead;
    if ($("gallery").open) fillGallery();
  }

  function fillGallery() {
    const list = $("gallery-list");
    list.textContent = "";
    for (const faction of Object.values(FACTIONS)) {
      const block = el("section", "faction-block");
      block.appendChild(el("h3", "faction-name", `${faction.mark} ${faction[state.lang]}`));
      const grid = el("div", "role-grid");
      for (const id of faction.members) {
        const text = TYPES[id][state.lang];
        const tile = document.createElement("a");
        tile.className = "role-tile";
        tile.href = `?c=${SAMPLE_CODES[id]}&lang=${state.lang}`;
        const img = document.createElement("img");
        img.src = portraitFor(id);
        img.alt = text.alt;
        tile.appendChild(img);
        tile.appendChild(el("span", "tile-name", identityLine(text)));
        if (text.mark) tile.appendChild(el("span", "tile-sub", text.mark));
        tile.appendChild(el("span", "tile-badge", factionLabel(id, state.lang)));
        grid.appendChild(tile);
      }
      block.appendChild(grid);
      list.appendChild(block);
    }
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
    $("title").textContent = ui.h1;
    $("subtitle").textContent = ui.subtitle;
    $("intro").textContent = ui.intro;
    $("lede").textContent = ui.lede;
    $("hint").textContent = ui.hint;
    $("foot-boundary").textContent = ui.boundary;
    $("stored").textContent = ui.stored;
    const back = $("back");
    const home = `/?lang=${state.lang}#garage`;
    back.textContent = ui.back;
    back.href = home;
    $("cover-home").textContent = ui.coverHome;
    $("cover-home").href = home;
    paintGalleryChrome();

    const quiz = $("quiz");
    const result = $("result");
    const showEntry = !state.code && !state.started;
    $("entry").hidden = !showEntry;
    $("main").classList.toggle("entry-open", showEntry);
    if (showEntry) {
      stopPose();
      $("stage").classList.remove("with-horse", "with-queen", "motion-float", "motion-bob", "motion-squash");
      closeDuoStage();
      quiz.hidden = true;
      result.hidden = true;
      paintEntry();
      return;
    }
    closeDistrict();
    if (!state.code) {
      stopPose();
      $("stage").classList.remove("with-horse", "with-queen", "motion-float", "motion-bob", "motion-squash");
      $("horse").setAttribute("hidden", "");
      $("queen-art").setAttribute("hidden", "");
      $("mg").hidden = false;
      $("rare").hidden = true;
      $("card-egg").hidden = true;
      $("card-sub").hidden = true;
      $("companion").hidden = true;
      closeDuoStage();
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
    $("card-name").textContent = identityLine(text);
    $("card-mark").hidden = !text.mark;
    $("card-mark").textContent = text.mark || "";
    $("card-egg").hidden = !type.egg;
    $("card-egg").textContent = type.egg || "";
    $("card-sub").hidden = true;
    $("other-name").textContent = identityLine(type[other]);
    $("role").hidden = true;
    $("role").textContent = "";
    $("faction").textContent = factionLabel(resolved.type, state.lang);
    $("about").textContent = text.about;
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
    paintShare(shareUrl());
    $("status").textContent = "";
    const rare = isRare(resolved.type);
    $("rare").hidden = !rare;
    $("rare").textContent = rare ? ui.rare : "";
    showCompanion(type, resolved.type);
    renderDuo();
    if (focus === "card") (state.withCode ? $("duo-left-name") : $("card-name")).focus();
  }

  const DUO_THEMES = ["theme-queens", "theme-royal", "theme-alliance", "theme-cocoa", "theme-plain"];

  function duoTheme(a, b) {
    const ids = [a, b];
    if (ids.includes("galaxy") && ids.includes("andromeda")) return "theme-queens";
    if (ids.includes("alliance")) return "theme-alliance";
    if (ids.includes("galaxy") || ids.includes("andromeda")) return "theme-royal";
    if (ids.includes("cocoa")) return "theme-cocoa";
    return "theme-plain";
  }

  function closeDuoStage() {
    const stage = $("duo-stage");
    stage.hidden = true;
    stage.classList.remove("is-open", ...DUO_THEMES);
    delete stage.dataset.pair;
    $("card").hidden = false;
    $("main").classList.remove("duo-open");
    clearDuoImages();
  }

  function portraitSrc(typeId) {
    if (typeId === "cocoa") return ASSET + POSES.heart.frames[0];
    if (typeId === "alliance") return HORSE_SRC;
    return PORTRAIT_SRC[typeId];
  }

  function clearDuoImages() {
    for (const id of ["duo-left", "duo-right"]) {
      const img = $(id);
      if (!img) return;
      img.removeAttribute("src");
      img.alt = "";
      img.classList.remove("face-in");
    }
    for (const id of ["duo-left-lines", "duo-right-lines", "duo-lines"]) {
      const node = $(id);
      if (node) node.textContent = "";
    }
  }

  function renderDuo() {
    const ui = UI[state.lang];
    $("duo-title").textContent = ui.duoTitle;
    $("duo-hint").textContent = ui.duoHint;
    $("duo-code").placeholder = ui.duoPlaceholder;
    $("duo-open").textContent = ui.duoOpen;
    $("duo-download").textContent = ui.duoDownload;
    $("duo-boundary").textContent = ui.boundary;
    const select = $("duo-pick");
    const previous = select.value;
    select.textContent = "";
    select.appendChild(new Option(ui.duoPick, ""));
    for (const id of ROLE_ORDER) select.appendChild(new Option(shortName(TYPES[id][state.lang]), id));
    const partner = state.withCode ? resolveChoices(state.withCode) : null;
    select.value = partner ? partner.type : previous;
    if (document.activeElement !== $("duo-code")) $("duo-code").value = state.withCode || "";
    $("duo-status").textContent = state.duoNote === "bad" ? ui.duoBad : "";
    if (!partner) {
      closeDuoStage();
      return;
    }
    const mine = resolveChoices(state.code);
    const stage = $("duo-stage");
    stage.hidden = false;
    stage.classList.remove(...DUO_THEMES);
    stage.classList.add(duoTheme(mine.type, partner.type));
    $("card").hidden = true;
    $("main").classList.add("duo-open");
    paintDuoCard("left", mine.type, state.code, ui.duoYou);
    paintDuoCard("right", partner.type, state.withCode, ui.duoFriend);
    const scene = dialogueFor(mine.type, partner.type);
    const list = $("duo-lines");
    list.textContent = "";
    for (const line of scene.lines) {
      const side = line.speaker === mine.type ? "from-left" : "from-right";
      const row = el("p", `duo-line ${side}`);
      row.appendChild(el("span", "duo-speaker", shortName(TYPES[line.speaker][state.lang])));
      row.appendChild(el("span", "duo-text", line[state.lang]));
      list.appendChild(row);
    }
    const pairKey = `${state.code}|${state.withCode}`;
    if (stage.dataset.pair !== pairKey) {
      stage.classList.remove("is-open");
      void stage.offsetWidth;
      stage.dataset.pair = pairKey;
    }
    stage.classList.add("is-open");
  }

  function paintDuoCard(slot, typeId, code, tag) {
    const ui = UI[state.lang];
    const other = state.lang === "zh" ? "en" : "zh";
    const type = TYPES[typeId];
    const text = type[state.lang];
    const card = $(`duo-card-${slot}`);
    card.classList.remove("rare-galaxy", "rare-andromeda", "rare-designer");
    if (isRare(typeId)) card.classList.add(`rare-${typeId}`);
    $(`duo-${slot}-kicker`).textContent = ui.kicker;
    const frame = $(`duo-${slot}-stage`);
    frame.classList.toggle("with-queen", Boolean(PORTRAIT_SRC[typeId]));
    frame.classList.toggle("with-horse", typeId === "alliance");
    const img = $(`duo-${slot}`);
    const src = portraitSrc(typeId);
    if (img.getAttribute("src") !== src) img.setAttribute("src", src);
    img.alt = text.alt;
    img.classList.toggle("face-in", shouldFaceIn(GAZE[typeId], slot));
    $(`duo-${slot}-name`).textContent = identityLine(text);
    $(`duo-${slot}-mark`).hidden = !text.mark;
    $(`duo-${slot}-mark`).textContent = text.mark || "";
    $(`duo-${slot}-egg`).hidden = !type.egg;
    $(`duo-${slot}-egg`).textContent = type.egg || "";
    $(`duo-${slot}-sub`).hidden = true;
    $(`duo-${slot}-other`).textContent = identityLine(type[other]);
    $(`duo-${slot}-role`).hidden = true;
    $(`duo-${slot}-role`).textContent = "";
    $(`duo-${slot}-faction`).textContent = factionLabel(typeId, state.lang);
    $(`duo-${slot}-about`).textContent = text.about;
    const rare = isRare(typeId);
    $(`duo-${slot}-rare`).hidden = !rare;
    $(`duo-${slot}-rare`).textContent = rare ? ui.rare : "";
    $(`duo-${slot}-tag`).textContent = tag;
    const lines = $(`duo-${slot}-lines`);
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
    $(`duo-${slot}-picks`).textContent = ui.picks(code);
  }

  function openPartner(raw) {
    const ui = UI[state.lang];
    const code = extractCode(raw);
    if (!code || !resolveChoices(code)) {
      state.duoNote = "bad";
      $("duo-status").textContent = ui.duoBad;
      return;
    }
    state.duoNote = "";
    state.withCode = code;
    $("duo-status").textContent = "";
    persist();
    render();
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

  function paintShare(url) {
    const short = $("share-short");
    short.dataset.url = url;
    short.textContent = new URL(url).search || url;
  }

  async function copyLink() {
    const ui = UI[state.lang];
    const url = $("share-short").dataset.url || "";
    try {
      await navigator.clipboard.writeText(url);
      $("status").textContent = ui.copied;
    } catch {
      $("status").textContent = ui.copyFallback;
    }
  }

  async function shareNative() {
    const ui = UI[state.lang];
    const url = $("share-short").dataset.url || "";
    if (!navigator.share) return;
    try {
      await navigator.share({ title: ui.title, text: `${ui.subtitle} ${ui.boundary}`, url });
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
    const rare = isRare(resolved.type);
    if (rare) {
      ctx.strokeStyle = resolved.type === "andromeda" ? "#D4B06A" : "#C4A15A";
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

    const badgeClear = 250;
    const headerInner = width - pad - badgeClear;
    const headerCenter = (line, y, font, color) => {
      ctx.font = font;
      ctx.fillStyle = color;
      const w = ctx.measureText(line).width;
      const x = Math.round(pad + Math.max(0, (headerInner - w) / 2));
      ctx.fillText(line, x, y);
    };
    headerCenter(ui.title, 64, `700 48px ${FONT}`, "#193A35");
    ctx.font = `600 32px ${FONT}`;
    const subLines = wrapLines(ctx, ui.subtitle, headerInner);
    const subTop = 124;
    subLines.forEach((line, index) => {
      headerCenter(line, subTop + index * 42, `600 32px ${FONT}`, "#62716A");
    });

    const BOUNDARY = 54;
    const BASE = { LABEL: 54, PICKS: 48, BODY: 40, FUNNY: 44, NAME: 58, OTHER: 32, ROLE: 36 };
    const artTop = subTop + subLines.length * 42 + 20;
    const lead = (size) => size + 8;
    const measureCard = (textScale) => {
      const sz = {};
      for (const key of Object.keys(BASE)) sz[key] = Math.max(22, Math.round(BASE[key] * textScale));
      ctx.font = `700 ${BOUNDARY}px ${FONT}`;
      const boundaryLines = wrapLines(ctx, ui.boundary, inner);
      ctx.font = `600 ${sz.PICKS}px ${FONT}`;
      const picksLines = wrapLines(ctx, ui.picks(state.code), inner);
      ctx.font = `700 ${sz.NAME}px ${FONT}`;
      const nameLines = wrapLines(ctx, identityLine(text), inner);
      ctx.font = `700 24px ${FONT}`;
      const markLines = text.mark ? wrapLines(ctx, text.mark, inner) : [];
      ctx.font = `600 ${sz.OTHER}px ${FONT}`;
      const otherLines = wrapLines(ctx, identityLine(type[other]), inner);
      const roleLines = [];
      ctx.font = `700 30px ${FONT}`;
      const factionLines = wrapLines(ctx, factionLabel(resolved.type, state.lang), inner);
      ctx.font = `500 ${sz.BODY}px ${FONT}`;
      const aboutLines = wrapLines(ctx, text.about, inner);
      ctx.font = `700 ${sz.FUNNY}px ${FONT}`;
      const funnyLines = wrapLines(ctx, text.funny, inner);
      const sectionLines = [text.gentle, text.literary, text.strength].map((body, index) => {
        ctx.font = `${index === 2 ? 600 : 500} ${sz.BODY}px ${FONT}`;
        return wrapLines(ctx, body, inner);
      });
      const footerH = picksLines.length * lead(sz.PICKS) + 14 + boundaryLines.length * lead(BOUNDARY);
      let bodyH = nameLines.length * lead(sz.NAME);
      bodyH += markLines.length ? markLines.length * 32 : 0;
      bodyH += type.egg ? 34 : 0;
      bodyH += 8 + otherLines.length * lead(sz.OTHER);
      bodyH += roleLines.length ? 6 + roleLines.length * lead(sz.ROLE) : 0;
      bodyH += 10 + factionLines.length * 42;
      bodyH += aboutLines.length * lead(sz.BODY) + 12;
      bodyH += rare ? 58 : 12;
      bodyH += sz.LABEL + 10 + funnyLines.length * lead(sz.FUNNY) + 10;
      sectionLines.forEach((lines) => {
        bodyH += sz.LABEL + 10 + lines.length * lead(sz.BODY) + 8;
      });
      return { sz, boundaryLines, picksLines, nameLines, markLines, otherLines, roleLines, factionLines, aboutLines, funnyLines, sectionLines, footerH, bodyH };
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
    const { sz, boundaryLines, picksLines, nameLines, markLines, otherLines, roleLines, factionLines, aboutLines, funnyLines, sectionLines } = plan;

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
      if (img.complete && img.naturalWidth > 0) {
        const tall = img.naturalHeight > img.naturalWidth;
        artBottom = fitDraw(img, tall ? 640 : 800, tall ? 0 : -90);
      }
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
    markLines.forEach((line) => {
      center(line, y, `700 24px ${FONT}`, "#62716A");
      y += 32;
    });
    if (type.egg) {
      ctx.save();
      ctx.letterSpacing = "0.22em";
      center(type.egg, y, `600 22px ${FONT}`, "#62716A");
      ctx.restore();
      y += 34;
    }
    otherLines.forEach((line) => {
      center(line, y, `600 ${sz.OTHER}px ${FONT}`, "#62716A");
      y += lead(sz.OTHER);
    });
    y += 8;
    roleLines.forEach((line) => {
      center(line, y, `700 ${sz.ROLE}px ${FONT}`, "#142C29");
      y += lead(sz.ROLE);
    });
    y += 10;
    factionLines.forEach((line) => {
      ctx.font = `700 30px ${FONT}`;
      const badgeW = Math.min(inner, ctx.measureText(line).width + 36);
      const badgeX = Math.round((width - badgeW) / 2);
      ctx.fillStyle = "#DDE7DE";
      roundRect(ctx, badgeX, y, badgeW, 42, 21);
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = "#193A35";
      ctx.stroke();
      ctx.fillStyle = "#142C29";
      ctx.fillText(line, badgeX + 18, y + 6);
      y += 42;
    });
    y += 8;
    aboutLines.forEach((line) => {
      center(line, y, `500 ${sz.BODY}px ${FONT}`, "#193A35");
      y += lead(sz.BODY);
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

  function rareStroke(typeId) {
    if (typeId === "andromeda") return "#D4B06A";
    if (typeId === "galaxy") return "#C4A15A";
    return "";
  }

  function downloadDuo() {
    const ui = UI[state.lang];
    const mine = resolveChoices(state.code);
    const partner = state.withCode ? resolveChoices(state.withCode) : null;
    if (!mine || !partner) return;
    const other = state.lang === "zh" ? "en" : "zh";
    const queens = ["galaxy", "andromeda"].includes(mine.type) && ["galaxy", "andromeda"].includes(partner.type);
    const width = 1080;
    const scale = 2;
    const BOUNDARY = 54;
    const colW = 420;
    const canvas = document.createElement("canvas");
    canvas.width = width * scale;
    canvas.height = 400 * scale;
    const ctx = canvas.getContext("2d");
    ctx.setTransform(scale, 0, 0, scale, 0, 0);

    ctx.font = `700 ${BOUNDARY}px ${FONT}`;
    const boundaryLines = wrapLines(ctx, ui.boundary, width - 176);
    const boundaryH = boundaryLines.length * (BOUNDARY + 8);
    const people = [mine, partner].map((resolved, index) => {
      const text = TYPES[resolved.type][state.lang];
      ctx.font = `700 42px ${FONT}`;
      const nameLines = wrapLines(ctx, identityLine(text), colW - 28);
      ctx.font = `700 22px ${FONT}`;
      const markLines = text.mark ? wrapLines(ctx, text.mark, colW - 28) : [];
      ctx.font = `600 28px ${FONT}`;
      const otherLines = wrapLines(ctx, identityLine(TYPES[resolved.type][other]), colW - 28);
      const roleLines = [];
      const rare = Boolean(rareStroke(resolved.type));
      const egg = TYPES[resolved.type].egg || "";
      ctx.font = `700 24px ${FONT}`;
      const factionLines = wrapLines(ctx, factionLabel(resolved.type, state.lang), colW - 36);
      ctx.font = `500 22px ${FONT}`;
      const aboutLines = wrapLines(ctx, text.about, colW - 28);
      const metaH = nameLines.length * 50 + markLines.length * 28 + (egg ? 28 : 0) + otherLines.length * 36 + roleLines.length * 40 + factionLines.length * 36 + aboutLines.length * 30 + (rare ? 56 : 10);
      return {
        slot: index === 0 ? "left" : "right",
        resolved,
        text,
        nameLines,
        markLines,
        otherLines,
        roleLines,
        factionLines,
        aboutLines,
        rare,
        egg,
        metaH,
      };
    });
    const metaH = Math.max(people[0].metaH, people[1].metaH);
    const scene = dialogueFor(mine.type, partner.type);
    const bubbleMax = 800;
    const bubbles = scene.lines.map((line) => {
      const speaker = shortName(TYPES[line.speaker][state.lang]);
      ctx.font = `700 26px ${FONT}`;
      const speakerW = ctx.measureText(speaker).width;
      ctx.font = `500 32px ${FONT}`;
      const textLines = wrapLines(ctx, line[state.lang], bubbleMax - 52);
      const textW = Math.max(speakerW, ...textLines.map((item) => ctx.measureText(item).width));
      return {
        speaker,
        side: line.speaker === mine.type ? "left" : "right",
        textLines,
        bubbleW: Math.min(bubbleMax, Math.ceil(textW) + 52),
        h: 18 + 32 + textLines.length * 44 + 16,
      };
    });
    const artH = 520;
    const bubblesH = bubbles.reduce((sum, bubble) => sum + bubble.h + 16, 0);
    const artTop = 148;
    const textTop = artTop + artH + 20;
    const bubbleTop = textTop + metaH + 36;
    const height = bubbleTop + bubblesH + 48 + boundaryH + 120;

    canvas.height = height * scale;
    ctx.setTransform(scale, 0, 0, scale, 0, 0);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.textBaseline = "top";

    if (queens) {
      const wash = ctx.createLinearGradient(0, 0, 0, height);
      wash.addColorStop(0, "#140E24");
      wash.addColorStop(0.55, "#2A1744");
      wash.addColorStop(1, "#160E28");
      ctx.fillStyle = wash;
      ctx.fillRect(0, 0, width, height);
      const glow = ctx.createRadialGradient(width / 2, 40, 20, width / 2, 40, 480);
      glow.addColorStop(0, "rgba(212,176,106,0.34)");
      glow.addColorStop(1, "rgba(212,176,106,0)");
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, width, 560);
      ctx.fillStyle = "#FFF6D8";
      for (let i = 0; i < 72; i += 1) {
        const x = ((i * 97) % 1000) + 40;
        const y = ((i * 193) % (height - 100)) + 40;
        ctx.globalAlpha = 0.4 + (i % 5) * 0.1;
        ctx.beginPath();
        ctx.arc(x, y, (i % 3) + 0.8, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    } else {
      ctx.fillStyle = "#F6F3ED";
      ctx.fillRect(0, 0, width, height);
      ctx.save();
      ctx.globalAlpha = 0.5;
      const leftWash = ctx.createLinearGradient(0, height * 0.4, 0, height);
      leftWash.addColorStop(0, "rgba(246,243,237,0)");
      leftWash.addColorStop(1, WASH[mine.type] || "#DDE7DE");
      ctx.fillStyle = leftWash;
      ctx.fillRect(0, height * 0.4, width / 2, height * 0.6);
      const rightWash = ctx.createLinearGradient(0, height * 0.4, 0, height);
      rightWash.addColorStop(0, "rgba(246,243,237,0)");
      rightWash.addColorStop(1, WASH[partner.type] || "#DDE7DE");
      ctx.fillStyle = rightWash;
      ctx.fillRect(width / 2, height * 0.4, width / 2, height * 0.6);
      ctx.restore();
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
    }

    ctx.strokeStyle = queens ? "#C4A15A" : "#193A35";
    ctx.lineWidth = 8;
    roundRect(ctx, 28, 28, width - 56, height - 56, 40);
    ctx.stroke();
    ctx.strokeStyle = queens ? "#E8D5A3" : "#193A35";
    ctx.lineWidth = 2;
    roundRect(ctx, 48, 48, width - 96, height - 96, 28);
    ctx.stroke();
    ctx.fillStyle = queens ? "#E4C77A" : "#F08A6E";
    for (const [x, y] of [[64, 64], [width - 64, 64], [64, height - 64], [width - 64, height - 64]]) {
      ctx.beginPath();
      ctx.arc(x, y, 7, 0, Math.PI * 2);
      ctx.fill();
    }

    const ink = queens ? "#F6F3ED" : "#193A35";
    const moss = queens ? "#E7D7B0" : "#62716A";
    ctx.font = `700 40px ${FONT}`;
    ctx.fillStyle = moss;
    const title = ui.duoTitle;
    ctx.fillText(title, Math.round((width - ctx.measureText(title).width) / 2), 74);

    const columns = [100, width - 100 - colW];
    people.forEach((person, index) => {
      const x = columns[index];
      const stroke = rareStroke(person.resolved.type);
      if (stroke) {
        ctx.strokeStyle = stroke;
        ctx.lineWidth = 5;
        roundRect(ctx, x - 12, artTop - 16, colW + 24, textTop + metaH + 16 - (artTop - 16), 28);
        ctx.stroke();
      }
      const img = readyImage(`duo-${person.slot}`, portraitSrc(person.resolved.type));
      if (img) {
        let drawH = artH - 20;
        let drawW = (img.naturalWidth / img.naturalHeight) * drawH;
        const maxW = colW - 20;
        if (drawW > maxW) {
          drawW = maxW;
          drawH = drawW * (img.naturalHeight / img.naturalWidth);
        }
        const dx = x + (colW - drawW) / 2;
        const dy = artTop + artH - drawH;
        ctx.save();
        ctx.fillStyle = queens ? "rgba(246,243,237,0.16)" : "rgba(25,58,53,0.08)";
        ctx.beginPath();
        ctx.ellipse(x + colW / 2, artTop + artH - 4, Math.max(54, drawW * 0.4), 12, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
        ctx.save();
        if (img.classList.contains("face-in")) {
          ctx.translate(dx + drawW, dy);
          ctx.scale(-1, 1);
          ctx.drawImage(img, 0, 0, drawW, drawH);
        } else ctx.drawImage(img, dx, dy, drawW, drawH);
        ctx.restore();
      }
      let y = textTop;
      const mid = x + colW / 2;
      const centerAt = (line, font, color) => {
        ctx.font = font;
        ctx.fillStyle = color;
        ctx.fillText(line, Math.round(mid - ctx.measureText(line).width / 2), y);
      };
      person.nameLines.forEach((line) => {
        centerAt(line, `700 42px ${FONT}`, ink);
        y += 50;
      });
      person.markLines.forEach((line) => {
        centerAt(line, `700 22px ${FONT}`, moss);
        y += 28;
      });
      if (person.egg) {
        ctx.save();
        ctx.letterSpacing = "0.2em";
        centerAt(person.egg, `600 18px ${FONT}`, moss);
        ctx.restore();
        y += 28;
      }
      person.otherLines.forEach((line) => {
        centerAt(line, `600 28px ${FONT}`, moss);
        y += 36;
      });
      person.roleLines.forEach((line) => {
        centerAt(line, `700 30px ${FONT}`, ink);
        y += 40;
      });
      person.factionLines.forEach((line) => {
        centerAt(line, `700 24px ${FONT}`, ink);
        y += 36;
      });
      person.aboutLines.forEach((line) => {
        centerAt(line, `500 22px ${FONT}`, ink);
        y += 30;
      });
      if (person.rare) {
        y += 6;
        ctx.font = `700 26px ${FONT}`;
        const badge = ui.rare;
        const badgeW = ctx.measureText(badge).width + 36;
        const badgeX = Math.round(mid - badgeW / 2);
        ctx.fillStyle = "#F08A6E";
        roundRect(ctx, badgeX, y, badgeW, 40, 20);
        ctx.fill();
        ctx.lineWidth = 2;
        ctx.strokeStyle = "#193A35";
        ctx.stroke();
        ctx.fillStyle = "#142C29";
        ctx.fillText(badge, badgeX + 18, y + 7);
      }
    });

    let y = bubbleTop;
    bubbles.forEach((bubble) => {
      const x = bubble.side === "left" ? 92 : width - 92 - bubble.bubbleW;
      ctx.fillStyle = "rgba(255,255,255,0.94)";
      ctx.strokeStyle = queens ? "#C4A15A" : "#193A35";
      ctx.lineWidth = 3;
      roundRect(ctx, x, y, bubble.bubbleW, bubble.h, 22);
      ctx.fill();
      ctx.stroke();
      ctx.font = `700 26px ${FONT}`;
      ctx.fillStyle = "#8A6A2B";
      const speakerW = ctx.measureText(bubble.speaker).width;
      const speakerX = bubble.side === "left" ? x + 24 : x + bubble.bubbleW - 24 - speakerW;
      ctx.fillText(bubble.speaker, speakerX, y + 16);
      ctx.font = `500 32px ${FONT}`;
      ctx.fillStyle = "#193A35";
      let lineY = y + 52;
      bubble.textLines.forEach((line) => {
        const lineW = ctx.measureText(line).width;
        const lineX = bubble.side === "left" ? x + 24 : x + bubble.bubbleW - 24 - lineW;
        ctx.fillText(line, lineX, lineY);
        lineY += 44;
      });
      y += bubble.h + 16;
    });

    let foot = height - 96 - boundaryH;
    ctx.strokeStyle = queens ? "rgba(246,243,237,0.45)" : "rgba(25,58,53,0.35)";
    ctx.lineWidth = 2;
    ctx.setLineDash([10, 8]);
    ctx.beginPath();
    ctx.moveTo(88, foot - 20);
    ctx.lineTo(width - 88, foot - 20);
    ctx.stroke();
    ctx.setLineDash([]);
    boundaryLines.forEach((line) => {
      ctx.font = `700 ${BOUNDARY}px ${FONT}`;
      ctx.fillStyle = ink;
      ctx.fillText(line, 88, foot);
      foot += BOUNDARY + 8;
    });

    try {
      const link = document.createElement("a");
      link.href = canvas.toDataURL("image/png");
      link.download = `teammate-${state.code}-with-${state.withCode}.png`;
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch {
      $("status").textContent = ui.downloadFail;
    }
  }

  function paintEntry() {
    const ui = UI[state.lang];
    $("town-map").alt = ui.mapAlt;
    $("start").textContent = ui.start;
    $("entry-boundary").textContent = ui.boundary;
    $("cover-hint").textContent = ui.coverHint;
    $("lockup").textContent = ui.lockup;
    $("subtitle").textContent = ui.subtitle;
    $("see-all").textContent = ui.seeAll;
    $("entry-title").textContent = ui.entryTitle;
    $("district-close").textContent = ui.closePreview;
    $("team-fallback").setAttribute("aria-label", ui.teamList);
    for (const button of document.querySelectorAll("[data-faction]")) {
      const faction = FACTIONS[button.dataset.faction];
      button.setAttribute("aria-label", `${faction.mark} ${faction[state.lang]}，${faction.place[state.lang]}`);
      const pin = button.querySelector(".pin-label");
      if (pin) pin.textContent = faction.pin[state.lang];
    }
    for (const button of document.querySelectorAll(".hotspot-lamp")) {
      button.setAttribute("aria-label", ui.startLamp);
    }
    const list = $("team-fallback");
    list.textContent = "";
    const sep = state.lang === "zh" ? "、" : ", ";
    const colon = state.lang === "zh" ? "：" : ": ";
    for (const faction of Object.values(FACTIONS)) {
      const names = faction.members.map((id) => shortName(TYPES[id][state.lang])).join(sep);
      list.appendChild(el("li", "", `${faction.mark} ${faction[state.lang]}${colon}${names}`));
    }
    if (state.district) paintDistrict();
  }

  function paintDistrict() {
    const faction = FACTIONS[state.district];
    if (!faction) return;
    const ui = UI[state.lang];
    $("district-title").textContent = `${faction.mark} ${faction[state.lang]}`;
    $("district-motto").textContent = faction.motto[state.lang];
    $("district-close").textContent = ui.closePreview;
    const members = $("district-members");
    members.textContent = "";
    for (const id of faction.members) {
      const text = TYPES[id][state.lang];
      const link = document.createElement("a");
      link.className = "member";
      link.href = `?c=${SAMPLE_CODES[id]}&lang=${state.lang}`;
      const img = document.createElement("img");
      img.src = portraitFor(id);
      img.alt = "";
      img.width = 56;
      img.height = 56;
      link.appendChild(img);
      const copy = el("span", "member-copy");
      copy.appendChild(el("span", "member-name", previewLine(text)));
      if (text.mark) copy.appendChild(el("span", "member-mark", text.mark));
      link.appendChild(copy);
      members.appendChild(link);
    }
  }

  function openDistrict(id, opener) {
    state.district = id;
    state.districtOpener = opener;
    paintDistrict();
    document.documentElement.classList.add("district-open");
    $("district").hidden = false;
    $("district-close").focus({ preventScroll: true });
  }

  function closeDistrict() {
    if ($("district").hidden) {
      state.district = null;
      return;
    }
    $("district").hidden = true;
    document.documentElement.classList.remove("district-open");
    const opener = state.districtOpener;
    state.district = null;
    state.districtOpener = null;
    if (opener) opener.focus();
  }

  function startQuiz() {
    closeDistrict();
    state.started = true;
    render("scenario");
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
    state.withCode = null;
    state.duoNote = "";
    state.picks = [];
    state.step = 0;
    state.started = false;
    $("duo-status").textContent = "";
    persist();
    render();
    $("start").focus();
  });
  document.querySelectorAll("[data-faction]").forEach((button) => {
    button.addEventListener("click", () => openDistrict(button.dataset.faction, button));
  });
  document.querySelectorAll("[data-start]").forEach((button) => {
    button.addEventListener("click", startQuiz);
  });
  $("district-close").addEventListener("click", closeDistrict);
  $("district").addEventListener("click", (event) => {
    if (event.target === $("district")) closeDistrict();
  });
  $("see-all").addEventListener("click", () => {
    $("gallery").open = true;
  });
  function districtFocusables() {
    return [...$("district-sheet").querySelectorAll("button, a, input, select, textarea")].filter((node) => !node.hidden && !node.disabled);
  }

  document.addEventListener("keydown", (event) => {
    if ($("district").hidden) return;
    if (event.key === "Escape") {
      event.preventDefault();
      closeDistrict();
      return;
    }
    if (event.key !== "Tab") return;
    const items = districtFocusables();
    if (!items.length) return;
    const first = items[0];
    const last = items[items.length - 1];
    const inside = $("district-sheet").contains(document.activeElement);
    if (!inside || (event.shiftKey && document.activeElement === first)) {
      event.preventDefault();
      (event.shiftKey ? last : first).focus({ preventScroll: true });
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus({ preventScroll: true });
    }
  });
  document.addEventListener("focusin", (event) => {
    if ($("district").hidden || $("district-sheet").contains(event.target)) return;
    const [first] = districtFocusables();
    if (first) first.focus({ preventScroll: true });
  });
  $("duo-open").addEventListener("click", () => openPartner($("duo-code").value));
  $("duo-code").addEventListener("keydown", (event) => {
    if (event.key === "Enter") openPartner($("duo-code").value);
  });
  $("duo-pick").addEventListener("change", () => {
    const id = $("duo-pick").value;
    if (!id) return;
    openPartner(SAMPLE_CODES[id]);
  });
  $("copy-link").addEventListener("click", copyLink);
  $("share-btn").addEventListener("click", shareNative);
  $("download").addEventListener("click", downloadCard);
  $("duo-download").addEventListener("click", downloadDuo);
  $("gallery").addEventListener("toggle", () => {
    if ($("gallery").open) fillGallery();
  });
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
