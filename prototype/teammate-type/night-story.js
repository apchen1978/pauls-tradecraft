// An optional Nightglow scene after the role card. It does not affect the
// three-letter result, share URL, or the existing two-person scene.
export const NIGHT_PARTNERS = ["missionary", "apostle", "strategist", "umbrella"];

export const NIGHT_COPY = {
  zh: {
    ariaLabel: "今晚的燈",
    kicker: "角色找到了，故事還沒結束。",
    open: "接著玩 · 把燈留到最後",
    close: "收起今晚的故事",
    title: "把燈留給最後回家的人",
    intro: "演出散場，廣場的大燈還照著回家的路。舞台台階覆了雪，音響也還在外面。最後離開的鄰居，需要有人多留一會兒。",
    lookTitle: "先看看現場",
    lookSteps: "台階上的雪",
    lookGear: "還在外面的音響",
    clueHint: "點一處，看看大家還在忙什麼。",
    clues: {
      steps: "第一級台階又覆上一層薄雪，還有人要從這裡走回廣場。",
      gear: "音響的防雪布只蓋了一半，旁邊還有折椅等著搬進屋簷。",
    },
    partnerTitle: "邀一位隊友留下",
    partnerHint: "你顧一邊，另一邊交給隊友。",
    actionTitle: "你想先顧哪一邊？",
    actions: {
      path: "通往大燈的路",
      stage: "舞台上的東西",
    },
    endingTitle: "燈還亮著，大家也都回來了",
    yourPart: "你這一邊",
    partnerPart: "隊友那一邊",
    outcomes: {
      path: "你先留意回廣場的路。最後一位鄰居走過清出的台階時，舞台那邊也收妥了。",
      stage: "你先留意舞台上的東西。隊友照看回廣場的台階，最後一位鄰居抬頭就看見那盞燈。",
    },
    ending: "廣場的大燈一直亮到大家都走上回家的路。今晚這件小事，是你們一起完成的。",
    mapAlt: "雪夜的照夜鎮，廣場大燈照亮通往四個街區的石板路",
    followupIntro: "廣場的燈照著路，還有三隊正把今晚的小事接力做完。",
    routeLabel: "四隊接力",
    teamPickerLabel: "點一隊，看看隊員",
    next: "接著去下一站",
    reveal: "回廣場看看",
    finaleKicker: "四隊都回來了",
    finaleTitle: "今晚，大家都在這裡",
    finaleBody: "舞台收好了，路看清了，窗邊的燈也修好了。最後，大家在廣場的大燈下停一停，靚仔替四隊拍下這一晚。",
    finaleAlt: "照夜鎮雪夜的四隊合影時刻：銀河之女與 Holly 站在中央，靚仔從左前方舉相機對著她們，旁邊是有翅膀的白馬，MG 坐在大家腳前",
    downloadPostcard: "下載四隊合照明信片",
  },
  en: {
    ariaLabel: "Tonight's lamp",
    kicker: "You found your role. The night is not over.",
    open: "Keep playing · Leave the lamp on",
    close: "Close tonight's story",
    title: "A light for the last person home",
    intro: "The show is over. The lamp in the square still lights the way home. Snow has settled on the stage steps, and the speakers are still outside. The last neighbor leaving could use someone staying a little longer.",
    lookTitle: "Look around first",
    lookSteps: "Snow on the steps",
    lookGear: "Speakers still outside",
    clueHint: "Choose a spot to see what still needs doing.",
    clues: {
      steps: "Fresh snow covers the first step. Someone still needs to walk from here to the square.",
      gear: "The snow cover only reaches halfway over the speakers. Folding chairs still wait to be moved under the eaves.",
    },
    partnerTitle: "Ask a teammate to stay",
    partnerHint: "You watch one side; your teammate takes the other.",
    actionTitle: "Which side will you watch first?",
    actions: {
      path: "The way to the lamp",
      stage: "What is left on stage",
    },
    endingTitle: "The lamp is still on. Everyone is back.",
    yourPart: "Your side",
    partnerPart: "Your teammate's side",
    outcomes: {
      path: "You keep an eye on the way to the square. By the time the last neighbor crosses the cleared steps, the stage has been put away too.",
      stage: "You keep an eye on what is left on stage. Your teammate watches the steps, and the last neighbor looks up to find the lamp.",
    },
    ending: "The lamp in the square stays on until everyone has found the road home. This small thing took both of you.",
    mapAlt: "Nightglow on a snowy night, with the square's lamp lighting stone paths to all four districts",
    followupIntro: "The square's lamp lights the way. Three more teams are finishing their small parts of the night.",
    routeLabel: "Four teams together",
    teamPickerLabel: "Choose a team to meet",
    next: "Go to the next stop",
    reveal: "Return to the square",
    finaleKicker: "All four teams are back",
    finaleTitle: "Tonight, everyone is here",
    finaleBody: "The stage is clear, the route is known, and the window lights are mended. At last, everyone pauses beneath the square's lamp. Lenz takes a picture of the four teams together.",
    finaleAlt: "The four Nightglow teams gathering on a snowy night: the Daughter of the Galaxy and Holly in the center, Lenz aiming his camera toward them from the left foreground beside the winged white horse, and MG at their feet",
    downloadPostcard: "Download the four-team postcard",
  },
};

// The three additional teams arrive in story order after the stage chapter.
// Each small choice changes the response, never the player's role or a score.
export const NIGHT_FOLLOWUPS = [
  {
    id: "clocktower", sceneId: "clocktower",
    zh: {
      team: "星圖隊 · 鐘樓", title: "先讓回家的路看得清楚",
      intro: "鐘樓下，莉婭的地圖被風吹得直翻。Holly 提著燈，阿修等著把消息送出去，苔苔壓住了地圖的一角。",
      question: "你先替大家確認哪一件事？",
      choices: ["哪段台階已經清好", "暖窗小屋該從哪條路走"],
      replies: [
        "莉婭把清好的台階記在圖上；阿修跑去告訴還在舞台的人。",
        "莉婭畫出通往暖窗小屋的路；阿修帶著還在外面的人往那邊走。",
      ],
      bridge: "路有了方向，接下來去看看那扇暖窗。",
    },
    en: {
      team: "Star-Map Team · Clock tower", title: "Make the way home clear",
      intro: "Below the clock tower, the wind keeps lifting Leia's map. Holly holds a lantern, Shiu waits to carry word, and Moss pins down one corner.",
      question: "What will you check first?",
      choices: ["Which steps have been cleared", "Which way leads to the warm-window cottage"],
      replies: [
        "Leia marks the cleared steps on the map. Shiu runs to tell the people still at the stage.",
        "Leia draws the route to the warm-window cottage. Shiu shows the people still outside which way to go.",
      ],
      bridge: "There is a way through now. Next, see what is happening at the warm window.",
    },
  },
  {
    id: "warmwindow", sceneId: "warmwindow",
    zh: {
      team: "燈下隊 · 暖窗小屋", title: "把窗邊那串小燈接回來",
      intro: "戴安娜還在梯子上修燈，阿閃扶著梯子，樂樂留在桌邊，塞安把最後一顆燈泡遞過去。",
      question: "你想先搭哪一把手？",
      choices: ["陪阿閃扶穩梯子", "把燈泡遞到戴安娜手邊"],
      replies: [
        "梯子穩住了。戴安娜接過燈泡，窗邊那串小燈終於亮齊。",
        "燈泡遞到了，阿閃也一直扶著梯子。窗邊那串小燈終於亮齊。",
      ],
      bridge: "小屋的窗亮了；廣場那盞大燈，還在等最後一隊。",
    },
    en: {
      team: "Lantern Team · Warm window", title: "Mend the little lights by the window",
      intro: "Diana is still on the ladder fixing the lights. Flick steadies it, Remi stays close to the table, and Zion passes up the last bulb.",
      question: "Where will you lend a hand first?",
      choices: ["Help Flick steady the ladder", "Pass the bulb to Diana"],
      replies: [
        "The ladder stays steady. Diana takes the bulb, and the little lights by the window glow together.",
        "The bulb reaches Diana while Flick keeps the ladder steady. The little lights by the window glow together.",
      ],
      bridge: "The cottage window is warm again. One team is still by the square's lamp.",
    },
  },
  {
    id: "galaxy-lamp", sceneId: "galaxy-lamp",
    zh: {
      team: "銀河隊 · 廣場燈下", title: "替最後到的人留一個位置",
      intro: "銀河之女和白馬停在大燈旁，靚仔舉起相機，MG 在熱可可杯邊坐好。還有人正從小屋方向走回來。",
      question: "拍照前，你想先做什麼？",
      choices: ["再等等最後走來的人", "替大家在燈下留出空位"],
      replies: [
        "銀河之女點點頭，靚仔先放下相機。等最後的人走近，大家才靠攏。",
        "白馬往旁邊讓了一步，燈下空出一塊地方。最後的人走近時，剛好站得下。",
      ],
      bridge: "這一回，沒有人被留在照片外。",
    },
    en: {
      team: "Galaxy Team · Under the square lamp", title: "Leave room for the last person",
      intro: "The Daughter of the Galaxy and the white horse pause by the lamp. Lenz lifts his camera; MG sits beside a cup of cocoa. Someone is still walking back from the cottage.",
      question: "Before the picture, what will you do?",
      choices: ["Wait for the last person", "Make room beneath the lamp"],
      replies: [
        "The Daughter of the Galaxy nods, and Lenz lowers his camera. Everyone gathers only when the last person arrives.",
        "The horse steps aside and leaves a little space beneath the lamp. The last person has a place when they arrive.",
      ],
      bridge: "This time, nobody is left out of the picture.",
    },
  },
];

export const NIGHT_ROLE_LINES = {
  umbrella: { zh: "你留意隊伍最後方的人，沒有人得獨自走進雪裡。", en: "You watch the back of the group, so nobody walks into the snow alone." },
  cocoa: { zh: "你留在暖處陪最後一位鄰居，讓他知道大家還在等。", en: "You stay beside the last neighbor in the warm spot, where they can see that nobody has left them behind." },
  finisher: { zh: "你守住收尾的時刻，確認最後一件事真的做完。", en: "You stay for the final moment and make sure the last thing is done." },
  spark: { zh: "你想到一個更簡單的分工方式，讓兩邊都有人顧。", en: "You find a simpler way to split the work, so both sides have someone there." },
  mapkeeper: { zh: "你先看清從舞台到廣場哪一段路最滑。", en: "You spot the slipperiest stretch between the stage and the square." },
  soundtrack: { zh: "你輕哼剛才的曲子，散場的人知道這裡還有人。", en: "You hum the last tune, and people leaving know someone is still here." },
  strategist: { zh: "你把先後順序說清楚，大家不必站在雪裡等。", en: "You make the order of work clear, so nobody waits in the snow." },
  messenger: { zh: "你跑了一趟，讓舞台和廣場的人知道彼此還在等。", en: "You carry word between the stage and the square, so each knows the other is still there." },
  galaxy: { zh: "你站在燈照得到的地方，讓大家看見要往哪裡走。", en: "You stand where the lamp reaches, giving everyone a point to walk toward." },
  andromeda: { zh: "你一開口，各忙各的人就知道還有誰沒回來。", en: "When you speak, everyone knows who has yet to come back." },
  alliance: { zh: "牠在廣場入口停下，等最後一個人走近。", en: "They wait at the square's entrance until the last person comes close." },
  missionary: { zh: "你把散場後還要做的事講清楚，沒人白跑一趟。", en: "You put the remaining work into words, so nobody makes a wasted trip." },
  apostle: { zh: "你把說好的事一路做完，沒有先離開。", en: "You carry through what you promised, all the way to the end." },
  designer: { zh: "你讓留下的燈光照在該走的路上，大家看得清。", en: "You keep the light on the path people need to see." },
  craftsman: { zh: "你把鬆動的擺設固定好，再陪大家收場。", en: "You secure the loose decorations, then stay to help finish up." },
  recorder: { zh: "你拍下大家留到最後的樣子，讓這一晚有人記得。", en: "You photograph the people who stayed, so this night will be remembered." },
};

// Each teammate handles the side the visitor did not choose to watch.
export const NIGHT_PARTNER_LINES = {
  umbrella: {
    path: { zh: "阿白把傘移到音響上方，等大家把設備搬進屋簷。", en: "Abai holds the umbrella over the speakers until everyone moves them under the eaves." },
    stage: { zh: "阿白撐傘陪最後一位鄰居走過台階，提醒他慢一點。", en: "Abai walks the last neighbor down the steps under an umbrella, reminding them to take it slowly." },
  },
  apostle: {
    path: { zh: "保羅帶著人把折椅和音響搬到乾燥處。", en: "Paul helps move the folding chairs and speakers somewhere dry." },
    stage: { zh: "保羅和言歌先把台階上的雪掃開，留出一條路。", en: "Paul and Echo sweep snow from the steps, leaving a way through." },
  },
  strategist: {
    path: { zh: "墨衡安排收椅子和照看音響的人，舞台慢慢空出來。", en: "Rook assigns the chairs and speakers, and the stage slowly clears." },
    stage: { zh: "墨衡排好清雪的順序，讓最後離開的人不用等太久。", en: "Rook sets the order for clearing snow, so the last neighbor need not wait long." },
  },
  missionary: {
    path: { zh: "言歌提醒台上的人還有音響沒收，大家把它搬進屋簷。", en: "Echo reminds the crew about the speakers, and they move them under the eaves." },
    stage: { zh: "言歌留在路口，提醒最後離開的人哪幾級台階已清好。", en: "Echo stays at the path and shows the last neighbor which steps have been cleared." },
  },
};
