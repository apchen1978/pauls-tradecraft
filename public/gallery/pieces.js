// Paul approved this selection and the harbour pairing on 2026-10-20; the after-show scene was added on 2026-10-21.
// Provenance and source-art records belong in docs/gallery/; visitor copy stays here.
export const COLLECTION = {
  zh: {
    title: "人機協作畫廊", subtitle: "從一個 idea，到一幅能停下來看的畫。",
    skip: "跳至畫作", hint: "挑一幅，停下來看看。", home: "回到 Paul’s Tradecraft",
    pairTitle: "同一束晨光，兩種港口",
    pairNote: "帆船與貨櫃船，在想像中共享晨光。這是創作想像的對照，不是航運史考據。",
    doorsTitle: "從房間到遠方",
    doorsNote: "先看一個重新想像的房間，再把視線帶到海灣與城市。兩幅都是概念插畫，不是真實場景或商品展示。",
    moreTitle: "日光與燈火之間", moreNote: "港邊的一天，和冬夜裡相聚的時刻。",
    back: "回到 AI Lab", open: "放大欣賞：", close: "關閉大圖 ×", previous: "← 上一幅", next: "下一幅 →", made: "怎麼做出來的",
  },
  en: {
    title: "The Human–AI Gallery", subtitle: "From a first idea, to a picture worth pausing for.",
    skip: "Skip to the paintings", hint: "Choose a picture. Stay a while.", home: "Back to Paul’s Tradecraft",
    pairTitle: "One Morning Light, Two Harbours",
    pairNote: "Sailing ships and container ships share an imagined morning. A creative pairing, rather than a study of shipping history.",
    doorsTitle: "From Room to Horizon",
    doorsNote: "First, a room reimagined. Then, a view stretching toward the bay and city. Both are concept illustrations, not real locations or product demonstrations.",
    moreTitle: "Between Daylight and Lamplight", moreNote: "A day by the harbour, and moments together on a winter night.",
    back: "Back to AI Lab", open: "View painting: ", close: "Close painting ×", previous: "← Previous", next: "Next →", made: "How it was made",
  },
};

export const PIECES = [
  {
    id: "imagined-harbor", date: "2026-10-20", frame: "gilt", width: 1024, height: 683,
    image: "assets/imagined-harbor.webp", imageSmall: "assets/imagined-harbor-mobile.webp", thumbnail: "assets/imagined-harbor-thumb.webp",
    title: { zh: "想像的港口", en: "An Imagined Harbor" },
    alt: { zh: "古典帆船停在晨光中的港口，人與機器人一起整理岸邊貨物，高空有一輛小型飛行車。", en: "Classical sailing ships in a dawn harbour, with people and robots sorting cargo and a small flying vehicle high above." },
    caption: { zh: "這是一座想像的港口。古典帆船、晨光與未來的同伴，出現在同一幅畫裡。", en: "An imagined harbour where classical sailing ships, morning light and companions from the future meet in one painting." },
    made: { zh: "Paul 定主題與方向，Codex 用 ImageGen 生成港口構圖，將人物與機器人一起畫進油畫質感的場景。", en: "Paul chose the theme and direction. Codex used ImageGen to create the harbour composition, painting people and robots together in an oil-painting setting." },
  },
  {
    id: "modern-harbor", date: "2026-10-20", frame: "gilt", width: 1024, height: 683,
    image: "assets/modern-harbor.webp", imageSmall: "assets/modern-harbor-mobile.webp", thumbnail: "assets/modern-harbor-thumb.webp",
    title: { zh: "晨光裡的港口", en: "A Harbour in Morning Light" },
    alt: { zh: "金色晨光照著現代貨櫃船與岸橋，岸邊的人和機器人協作搬貨，遠處有通用造型的飛行車。", en: "Golden dawn over modern container ships and a gantry crane, with people and robots handling cargo and a generic flying vehicle in the distance." },
    caption: { zh: "把帆船換成現代貨櫃船，保留同一份晨光與協作的想像。這幅畫也掛在 ROOMVERSE 的房間裡。", en: "Modern container ships take the place of sails, keeping the same imagined morning light and collaboration. This painting also hangs in the ROOMVERSE room." },
    made: { zh: "Paul 指定改用現代貨船與岸橋；Codex 用 ImageGen 修整構圖與細節，沿用已完成的 ROOMVERSE 掛畫。", en: "Paul asked for modern cargo ships and a gantry crane. Codex refined the composition and details with ImageGen; the gallery reuses the completed ROOMVERSE painting." },
  },
  {
    id: "harbor-dusk", date: "2026-10-20", frame: "gilt", width: 1024, height: 576,
    image: "assets/harbor-dusk.webp", imageSmall: "assets/harbor-dusk-mobile.webp", thumbnail: "assets/harbor-dusk-thumb.webp",
    title: { zh: "黃昏的港口", en: "Harbour at Dusk" },
    alt: { zh: "黃昏的港口，一艘貨櫃船正駛離，岸邊燈籠亮著，遠處有一座燈塔。", en: "A dusk harbour, with a container ship departing, dock lanterns lit, and a distant lighthouse." },
    caption: { zh: "和〈晨光裡的港口〉成一對。一天的開始，一天的收尾。", en: "Paired with A Harbour in Morning Light. The start of a day, and its close." },
    made: { zh: "Paul 提議讓這幅與〈黎明的港口〉配成一對。Grok Bot 以〈黎明的港口〉為風格參考，用文字生成這幅畫，再以影像工具修整細節。", en: "Paul proposed pairing this painting with Harbour at Dawn. Grok Bot generated it from a text prompt, using Harbour at Dawn as the style reference, then refined the details with image tools." },
  },
  {
    id: "ai-lab-digital-room", date: "2026-10-21", frame: "plain", width: 1024, height: 576,
    image: "assets/ai-lab-digital-room.webp", imageSmall: "assets/ai-lab-digital-room-mobile.webp", thumbnail: "assets/ai-lab-digital-room-thumb.webp",
    title: { zh: "當牆也有了風景", en: "When Walls Hold a View" },
    alt: { zh: "霧藍色客廳裡，四格窗各有不同風景；兩側牆面像數位壁紙，玻璃門通向花園，機器人站在沙發旁。", en: "In a mist-blue room, each windowpane opens onto a different view; the side walls resemble digital wallpaper, a glass door leads to a garden, and a small robot stands beside the sofa." },
    caption: { zh: "窗外四景保留著，牆面也加入新的想像。房間沒有離開日常，只是多了一點可變換的可能。", en: "Four views remain beyond the window while the walls offer another imagined layer. It is still an everyday room, with room for change." },
    made: { zh: "Paul 保留四格窗的構想，逐步指定家具、畫家筆觸、數位牆、霧藍色與科技燈，再將門窗調整為細金屬框。Codex 用 ImageGen 逐版修整；整幅畫是概念插畫。", en: "Paul kept the four-window idea and directed the furnishings, painterly texture, digital walls, mist-blue colour and lighting, then refined the metal-framed door and window. Codex iterated with ImageGen; this is a concept illustration." },
  },
  {
    id: "ai-lab-open-horizon", date: "2026-10-21", frame: "plain", width: 1024, height: 576,
    image: "assets/ai-lab-open-horizon.webp", imageSmall: "assets/ai-lab-open-horizon-mobile.webp", thumbnail: "assets/ai-lab-open-horizon-thumb.webp",
    title: { zh: "門外，是更大的世界", en: "A Wider World Beyond the Door" },
    alt: { zh: "明亮工作空間的落地門向海灣與城市敞開。桌上有筆電與書，小機器人站在門邊。", en: "Large glass doors open from a bright workspace toward a bay and city. A laptop and books sit on the table, with a small robot by the doorway." },
    caption: { zh: "一扇門打開，視線從工作桌延伸到海灣與城市。下一步要去哪裡，還可以慢慢想。", en: "An open door carries the view from a worktable toward the bay and city. There is room to imagine where to go next." },
    made: { zh: "Paul 希望 AI Lab 的畫面更遼闊、帶一點可親近的未來感；Codex 用 ImageGen 畫出開放的工作空間、海灣與小機器人。", en: "Paul asked for a wider, gently forward-looking AI Lab scene. Codex used ImageGen to create the open workspace, bay and small robot." },
  },
  {
    id: "trade-street", date: "2026-10-20", frame: "gilt", width: 1024, height: 683,
    image: "assets/trade-street.webp", imageSmall: "assets/trade-street-mobile.webp", thumbnail: "assets/trade-street-thumb.webp",
    title: { zh: "貿易街・向海的一天", en: "Trade Street: A Day Toward the Sea" },
    alt: { zh: "日光中的港口全景：左側工廠與貨車經道路接到右側裝船碼頭，遠處小船駛離，右下岸邊有文件小屋。", en: "A sunlit harbour panorama: a factory and trucks on the left connect by road to the loading quay on the right, a small ship departs in the distance, and a documents office sits on shore at the lower right." },
    caption: { zh: "工廠、貨車、碼頭，各忙著自己的一段。把視線放遠，才看見一趟出發是如何接起來的。", en: "Factory, trucks and quay each carry their part of the day. Step back, and a departure becomes a shared journey." },
    made: { zh: "沿用貿易街的港口設定，由 Codex 用 ImageGen 畫成全景；Paul 保留構圖，再指定增加油彩筆觸與色層。", en: "Codex used ImageGen to paint a panorama of Trade Street’s existing harbour setting. Paul kept the composition and asked for more oil-paint brushwork and layered colour." },
  },
  {
    id: "nightglow-together", date: "2026-10-17", frame: "plain", width: 1024, height: 683,
    image: "assets/nightglow-together.webp", imageSmall: "assets/nightglow-together-mobile.webp", thumbnail: "assets/nightglow-together-thumb.webp",
    title: { zh: "照夜鎮・大家都在", en: "Together in Nightglow" },
    alt: { zh: "雪夜廣場上，兩位女王站在中央街燈下，白馬和隊友圍在身邊，MG 坐在腳前，攝影師從前景拍下相聚的一刻。", en: "Two queens stand beneath the central lamp in a snowy square, surrounded by a white horse and teammates, with MG at their feet and a photographer capturing the gathering from the foreground." },
    caption: { zh: "街燈亮著，大家終於聚在一起。有人站到鏡頭前，也有人替大家留下這一刻。", en: "With the street lamp glowing, everyone comes together. Some step into the picture; someone else keeps the moment for them." },
    made: { zh: "Codex 用 ImageGen 參照既有角色畫成完整群像；Paul 調整攝影師的站位、隊友間距與中央細節。", en: "Codex used ImageGen and the existing character designs to create a complete group scene. Paul refined the photographer’s position, the spacing and the central details." },
  },
  {
    id: "winter-lamplight", date: "2026-10-15", frame: "plain", width: 1122, height: 1402,
    image: "assets/winter-lamplight.webp", imageSmall: "assets/winter-lamplight-mobile.webp", thumbnail: "assets/winter-lamplight-thumb.webp",
    title: { zh: "街燈下的相遇", en: "A Meeting by Lamplight" },
    alt: { zh: "雪夜的街燈下，一位女子輕撫白馬，攝影者拍下這一刻，橘貓坐在冒熱氣的杯子旁。", en: "Under a street lamp on a snowy night, a woman greets a white horse as a photographer captures the moment and an orange cat sits beside a steaming cup." },
    caption: { zh: "一盞街燈下，腳步慢下來，大家留住這個相遇。", en: "Under one street lamp, the night slows as everyone pauses for a shared moment." },
    made: { zh: "Paul 選定並核可這幅冬夜場景；Codex 使用 ImageGen，參照既有角色造型繪成完整畫面。", en: "Paul selected and approved this winter scene. Codex used ImageGen and the established character designs to paint it as one complete image." },
  },
  {
    id: "clocktower-map", date: "2026-10-15", frame: "plain", width: 816, height: 1020,
    image: "assets/clocktower-map.webp", imageSmall: "assets/clocktower-map-mobile.webp", thumbnail: "assets/clocktower-map-thumb.webp",
    title: { zh: "鐘樓下的地圖", en: "A Map Beneath the Clock Tower" },
    alt: { zh: "雪夜鐘樓下，隊友圍著長椅上的地圖，提燈照亮紙面，一條圍巾壓住被風吹動的圖角。", en: "Below a snowy clock tower, teammates gather around a map on a bench, a lantern lighting the paper and a scarf holding its corner against the breeze." },
    caption: { zh: "一張地圖，一盞小燈。明天要走哪條路，今晚先一起想想。", en: "A map and a small lantern. Tonight, they wonder together which way to go tomorrow." },
    made: { zh: "Paul 定下鐘樓看地圖的日常一幕；Codex 用 ImageGen 參照角色造型，將動作與暖燈光線一起畫成完整場景。", en: "Paul set the everyday scene of studying a map by the clock tower. Codex used ImageGen and the character designs to paint the gestures and warm lamplight as one scene." },
  },
  {
    id: "warm-window", date: "2026-10-15", frame: "plain", width: 816, height: 1020,
    image: "assets/warm-window.webp", imageSmall: "assets/warm-window-mobile.webp", thumbnail: "assets/warm-window-thumb.webp",
    title: { zh: "暖窗小屋的修補夜", en: "Mending by the Warm Window" },
    alt: { zh: "暖窗小屋裡，戴安娜修一串小燈，隊友扶梯、陪伴並遞來燈泡，窗外是安靜的雪夜。", en: "Inside a warm-windowed cottage, Diana repairs a string of lights while teammates steady the ladder, keep her company and hand her a bulb, with a quiet snowy night outside." },
    caption: { zh: "窗外落著雪，屋裡還有人忙著。等最後一盞小燈亮起，再一起回家。", en: "Snow falls outside while the cottage stays busy. They will head home together when the last little light comes on." },
    made: { zh: "Paul 指定修燈、扶梯與遞燈泡的互動；Codex 用 ImageGen 沿用既有角色，整幅繪製共同的透視與光線。", en: "Paul chose the actions of fixing lights, steadying a ladder and passing a bulb. Codex used ImageGen with the existing characters to paint the scene with shared perspective and lighting." },
  },
  {
    id: "stage-after-show", date: "2026-10-15", frame: "plain", width: 1122, height: 1402,
    image: "assets/stage-after-show.webp", imageSmall: "assets/stage-after-show-mobile.webp", thumbnail: "assets/stage-after-show-thumb.webp",
    title: { zh: "散場以後", en: "After the Show" },
    alt: { zh: "露天舞台散場後，幾個人收拾折椅、掃去台階上的雪，舞台邊留著一杯冒熱氣的飲料。", en: "After an open-air show, a few people fold chairs and clear snow from the steps, with a steaming drink left at the edge of the stage." },
    caption: { zh: "散場以後，舞台慢慢安靜下來，雪地上還留著收尾的腳步。", en: "After the show, the stage grows quiet; a few footprints remain in the snow." },
    made: { zh: "Paul 選定散場後的日常一幕；Codex 使用 ImageGen，將收拾舞台的動作畫成同一個冬夜場景。", en: "Paul chose an everyday moment after a show. Codex used ImageGen to paint the crew tidying the stage as one winter scene." },
  },
];

export function validatePieces(pieces) {
  if (!Array.isArray(pieces) || !pieces.length) throw new Error("An exhibition needs paintings.");
  const seen = new Set();
  for (const piece of pieces) {
    if (!piece.id || seen.has(piece.id)) throw new Error("Painting IDs must be unique.");
    seen.add(piece.id);
    for (const field of ["title", "alt", "caption", "made"]) {
      for (const lang of ["zh", "en"]) {
        if (typeof piece[field]?.[lang] !== "string" || !piece[field][lang].trim()) throw new Error(`${piece.id}: missing ${field}.${lang}`);
      }
    }
    for (const field of ["image", "imageSmall", "thumbnail"]) {
      if (!/^assets\/[a-z0-9-]+\.webp$/.test(piece[field])) throw new Error(`${piece.id}: invalid ${field}`);
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(piece.date) || !["gilt", "plain"].includes(piece.frame) || !(piece.width > 0 && piece.height > 0)) throw new Error(`${piece.id}: invalid painting metadata`);
  }
}
