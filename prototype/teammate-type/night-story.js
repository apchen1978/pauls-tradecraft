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
  },
};

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
