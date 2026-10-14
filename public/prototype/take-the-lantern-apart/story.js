// A Lamp, As Promised: story layer. Diana takes the lamp apart and asks the probing questions;
// Yiyi helps Chiensi sort out what they want. Reactions are fixed per option (never random).
// No numbers, no scoring, no promises about safety, performance, cost, timing or orders.

export const NAMES = {
  diana: { zh: "戴安娜", en: "Diana" },
  yiyi: { zh: "依依姐", en: "Yiyi" },
  chiensi: { zh: "千禧", en: "Chiensi" },
};

export const PORTRAIT = {
  diana: "assets/diana-work.webp",
  dianaAsk: "assets/diana-ask.webp",
  yiyi: "assets/yiyi-work.webp",
  yiyiAsk: "assets/yiyi-ask.webp",
  chiensi: "assets/kid-chiensi.webp",
};

// who: speaker; pic: portrait key (defaults to who).
export const LINES = {
  s1Chiensi: { who: "chiensi", zh: "我想要像照片裡那樣的燈，放在讀書角！", en: "I'd like a lamp like the one in the photo, for our reading nook!" },
  s1Yiyi: { who: "yiyi", zh: "那裡有書、有杯子，還有人喜歡把信攤開來讀。", en: "There are books and cups there. Some people like to spread out letters to read, too." },
  s1Diana: { who: "diana", zh: "那我們除了看它的樣子，也看看它要陪人做什麼。", en: "Then let's look at more than its shape. What will people do beside it?" },
  s2Shade: { who: "diana", pic: "dianaAsk", zh: "從這裡能看到燈罩的接合，也能看看表面怎麼處理。", en: "Here you can see how the shade joins together, and how its surface is finished." },
  s2Base: { who: "yiyi", pic: "yiyiAsk", zh: "照片看不到這一面。空著的銘牌，還有事情等我們問清楚。", en: "The photo doesn't show this side. The blank plate reminds us there are still things to ask." },
  s4Diana: { who: "diana", pic: "dianaAsk", zh: "樣子比較清楚了。它要去哪裡、怎麼用，我們還要再問。", en: "The idea is clearer now. We still need to ask where it will go and how it will be used." },
  s4Yiyi: { who: "yiyi", zh: "我們先想到了窗邊。其他位置是不是也需要燈，還沒有問過。", en: "We started with the window. We haven't asked whether the other places need lamps, too." },
  s5Chiensi: { who: "chiensi", zh: "我知道還要問什麼了。下次，我把答案一起帶來。", en: "Now I know what else to ask. Next time, I'll bring the answers, too." },
  s5Yiyi: { who: "yiyi", zh: "不用急著把每個空格填滿。先記住我們想做的，也記住還不知道的。", en: "We don't have to fill every blank just yet. Let's keep what we want to make, and what we still don't know." },
  s5Diana: { who: "diana", zh: "等這些事說清楚，再一起看看下一步。", en: "Once those details are clear, we'll look at the next step together." },
};

// Shown under each part before the player picks anything there.
export const PROMPTS = {
  shade: { who: "yiyi", zh: "我們喜歡那張照片的光。但讀書時，也想看清楚每一行。", en: "We like the light in that photo. When we read, we'd like to see each line clearly, too." },
  colour: { who: "yiyi", zh: "窗外是夜色，照片又有暖光。我們喜歡的顏色，最好再用樣品看看。", en: "The photo has a dark window and warm light. Let's check the colour we like against a sample." },
  base: null,
  size: { who: "yiyi", zh: "那張桌上還放著書和杯子。先比一比，再量一量。", en: "The table also holds books and cups. Let's compare first, then measure." },
  pack: { who: "chiensi", zh: "如果不是親手送去，它還能好好到達嗎？", en: "If we can't carry it there ourselves, how will it arrive safely?" },
};

const SIZE_REACT = { who: "diana", zh: "這是想要的尺寸方向；實際尺寸和允許的差距，還要寫清楚。", en: "That gives us a size to aim for. We still need the measurements and allowable variation." };
const COLOUR_REACT = { who: null, zh: "顏色先記下，實物比對方式還要確認。", en: "Colour noted; how to compare it with the real item still needs confirming." };

// Shown once the player picks that option.
export const REACT = {
  shade: {
    paper: { who: "diana", zh: "紙的紋理先記下來。耐熱等使用要求，我們還要另外確認。", en: "Let's note the paper texture. Heat resistance and other use requirements still need checking." },
    glass: { who: "chiensi", zh: "這個看起來像照片！送過去時，要怎麼保護它？", en: "This looks like the photo! How will we protect it on the way?" },
    metal: { who: "diana", zh: "這些小孔的樣子可以記下來。孔邊和表面怎麼處理，也要講好。", en: "We can note the pattern of these small holes. The edges and surface finish need to be agreed, too." },
  },
  colour: { ivory: COLOUR_REACT, night: COLOUR_REACT, persimmon: COLOUR_REACT },
  base: {
    wood: { who: "yiyi", zh: "木紋像每本書留下的折角，不會每個都一樣。我們能接受哪些差別？", en: "Wood grain is like the creases a book gathers: no two are quite the same. What differences are we happy with?" },
    ceramic: { who: "diana", zh: "釉色很值得近看，也需要說清楚可以接受的差異。", en: "The glaze is worth a closer look. We should agree which variations are acceptable." },
    brass: { who: "chiensi", zh: "照片裡也有這種暖暖的顏色。表面會一直是這樣嗎？", en: "The photo has this warm colour, too. Will the finish stay like this?" },
  },
  size: { s: SIZE_REACT, m: SIZE_REACT, l: SIZE_REACT },
  pack: {
    kraft: { who: "yiyi", zh: "簡單的盒子也可以很用心。裡面怎麼固定，還要一起看。", en: "A simple box can still be thoughtful. We need to look at how the lamp is held inside." },
    gift: { who: "diana", zh: "開盒的感覺可以先選，保護燈的方法也要講好。", en: "We can choose how opening the box should feel, and agree how to protect the lamp." },
    bulk: { who: "yiyi", zh: "如果要放在幾個地方，每箱怎麼分、燈怎麼隔開，都得說清楚。", en: "If the lamps are going to different places, we need to agree how to pack and separate them." },
  },
};

export const PART_QUESTION = {
  shade: { zh: "是照片裡的樣子，還是身邊的用法？", en: "The look in the photo, or how we'll use it?" },
  colour: { zh: "照片裡的夜色，也會改變顏色", en: "The night in the photo changes the colour, too" },
  base: { zh: "近看，才會發現不同", en: "Look closely, and differences appear" },
  size: { zh: "書旁邊，還留得下什麼？", en: "What else fits beside the books?" },
  pack: { zh: "它怎麼抵達那扇窗？", en: "How will it reach that window?" },
};

export const STORY = {
  zh: {
    sub: "冬夜裡，有人帶著一張照片，來找一盞適合讀書的光。",
    noteCard: "我們想替窗邊準備一盞燈。照片在這裡，其他的，想和你一起想清楚。",
    start: "推開工作室的門",
    s1title: "照片沒有拍到的事",
    s1narr: "千禧把照片放上桌。依依姐帶來一本書，書頁間夾著一片乾葉。",
    talkMore: "聽他們聊聊",
    s1go: "把照片放到工作台",
    s1skip: "直接看燈",
    leafBtn: "看看書籤",
    leafText: "書頁間的乾葉有一道小裂縫。依依姐說，書籤不必漂亮，能記住上次讀到哪裡就很好。",
    leafClose: "放回書頁",
    s2title: "把燈轉一轉",
    s2hint: "轉一轉，看看照片裡沒拍到的地方。",
    baseHint: "插頭、電壓和安全要求，要依使用地點另行確認。",
    mg: "MG 把墊圈撥到旁邊，又裝作一直坐得很端正。",
    s2go: "一起拆開看看",
    s3title: "把心願慢慢說清楚",
    s3intro: "桌上多了幾種零件。每選一樣，這盞燈就離想像近一點，也多一件值得問清楚的事。",
    mgBox: "MG 已經替自己選好了盒子。",
    noteBtn: "讀讀短箋",
    noteText: "希望桌上還放得下一本攤開的書。",
    noteMore: "一句生活裡的心願，也能變成要量清楚的尺寸。",
    noteClose: "先記著",
    mgBtn: "看看 MG",
    mgText: "MG 坐進盒子，尾巴還留在外面。千禧忍著笑，把真正要裝的燈放到旁邊。",
    mgClose: "把盒子留給燈",
    s3go: "把這些想法記下來",
    s4title: "還有一句，想問清楚",
    s4narr: "燈的外觀預覽亮了。依依姐翻到書裡的空白頁，戴安娜把還沒確認的事列在旁邊。",
    s4go: "收下這張約定草稿",
    s5title: "我們想做的那盞燈",
    s5narr: "千禧把照片放回口袋。這次，旁邊多了一張寫得更清楚的約定草稿。",
    again: "換一種約定",
    cardSub: "我們想做的那盞燈",
    nextBody: "我們把想法記下了。接著到貿易街，看看貨物如何走過交付的每一步。",
    altYiyi: "依依姐微笑著陪在一旁", altYiyiAsk: "依依姐拿著書發問", altChiensi: "千禧舉著相機",
  },
  en: {
    sub: "On a winter evening, a photograph brings someone in search of a light for reading.",
    noteCard: "We'd like a lamp for the window-side reading nook. Here's a photograph. We'd love your help figuring out the rest.",
    start: "Step into the workshop",
    s1title: "What the photo didn't show",
    s1narr: "Chiensi lays the photo on the bench. Yiyi brings a book, with a dried leaf tucked between its pages.",
    talkMore: "Hear them talk",
    s1go: "Put the photo on the bench",
    s1skip: "Go straight to the lamp",
    leafBtn: "Look at the bookmark",
    leafText: "The dried leaf has a small split. Yiyi says a bookmark doesn't have to be perfect. It just needs to keep your place.",
    leafClose: "Put it back",
    s2title: "Turn the lamp",
    s2hint: "Turn the lamp. Look at the parts the photograph couldn't show.",
    baseHint: "Plug, voltage and safety requirements still need to be checked for the destination.",
    mg: "MG nudges a washer aside, then sits as though nothing happened.",
    s2go: "Take a look inside",
    s3title: "Saying what we want, bit by bit",
    s3intro: "A few more parts appear on the bench. Each choice brings the lamp closer to the idea, and adds something worth checking.",
    mgBox: "MG has already chosen a box for itself.",
    noteBtn: "Read the note",
    noteText: "Please leave room for an open book on the table.",
    noteMore: "A small wish from daily life can become a measurement we need to check.",
    noteClose: "Keep it in mind",
    mgBtn: "Check on MG",
    mgText: "MG settles into the box, leaving its tail outside. Chiensi holds back a laugh and puts the actual lamp beside it.",
    mgClose: "Save the box for the lamp",
    s3go: "Note our choices",
    s4title: "One more thing to ask",
    s4narr: "The lamp glows in the visual preview. Yiyi opens the book to a blank page, and Diana notes what still needs checking.",
    s4go: "Keep this draft agreement",
    s5title: "The lamp we'd like to make",
    s5narr: "Chiensi slips the photo back into a pocket. This time, there's a clearer draft agreement beside it.",
    again: "Try a different set of choices",
    cardSub: "The lamp we'd like to make",
    nextBody: "We've noted our idea. Next, visit Trade Street to explore each step of getting goods delivered.",
    altYiyi: "Yiyi smiling beside them", altYiyiAsk: "Yiyi asking a question with a book in hand", altChiensi: "Chiensi holding a camera",
  },
};
