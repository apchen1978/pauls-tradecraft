// Fixed lines for 兩人小劇場. No network. The same two roles always get the same lines.

export const ROLE_ORDER = [
  "umbrella",
  "cocoa",
  "finisher",
  "spark",
  "mapkeeper",
  "soundtrack",
  "strategist",
  "messenger",
  "alliance",
  "missionary",
  "apostle",
  "designer",
  "galaxy",
  "andromeda",
  "craftsman",
  "recorder",
];

export const SAMPLE_CODES = {
  umbrella: "AAA",
  cocoa: "BBA",
  finisher: "BBC",
  spark: "CCC",
  mapkeeper: "DAA",
  soundtrack: "CCD",
  strategist: "EAE",
  messenger: "AEA",
  alliance: "EEA",
  missionary: "AFE",
  apostle: "ACF",
  designer: "AFC",
  galaxy: "FAE",
  andromeda: "FBD",
  craftsman: "GGG",
  recorder: "HHH",
};

// Which way the drawing already looks. "front" stays as drawn.
export const GAZE = {
  umbrella: "left",
  cocoa: "front",
  finisher: "right",
  spark: "front",
  mapkeeper: "left",
  soundtrack: "right",
  strategist: "front",
  messenger: "left",
  alliance: "left",
  missionary: "right",
  apostle: "left",
  designer: "left",
  galaxy: "front",
  andromeda: "right",
  craftsman: "left",
  recorder: "front",
};

const WRITTEN = {};

function add(a, b, lines) {
  WRITTEN[[a, b].sort().join("|")] = lines;
}

function line(speaker, zh, en) {
  return { speaker, zh, en };
}

add("alliance", "umbrella", [
  line("alliance", "我到了。前面那段你先撐著，我從旁邊繞進來。", "I'm here. You hold the front. I'll come in from the side."),
  line("umbrella", "傘還撐得住。你來了，我就不用一個人擋。", "The umbrella still holds. Now that you're here, I don't have to stand alone."),
  line("alliance", "那你繼續擋。我把後面的人帶上。", "Then keep it up. I'll bring the people behind us."),
  line("umbrella", "好。雨停之前，我們都不散。", "Okay. We stay until the rain lets up."),
]);

add("alliance", "cocoa", [
  line("alliance", "馬停好了。人呢，都還在嗎？", "The horse is settled. Is everyone still here?"),
  line("cocoa", "都在。熱的分完了，你的那杯還留著。", "Everyone's here. The warm cups are handed out. Yours is still waiting."),
  line("alliance", "先給還沒喝的人。我可以再等一下。", "Give it to whoever hasn't had one. I can wait."),
  line("cocoa", "那就坐。貓也讓出一點位子。", "Then sit. The cat will make a little room."),
]);

add("alliance", "finisher", [
  line("alliance", "我把路清開了。最後一下，還是你來。", "I cleared the way. The last beat is still yours."),
  line("finisher", "我看著。你一停，我就出手。", "I'm watching. The moment you stop, I move."),
  line("alliance", "不用喊太大聲。我看得到你。", "No need to shout. I can see you."),
  line("finisher", "那就這樣。收尾交給我。", "Then that's it. I'll finish it."),
]);

add("alliance", "spark", [
  line("spark", "等等，如果我們不從正門進呢？", "Wait. What if we don't come in through the front?"),
  line("alliance", "你說。我可以從你指的那邊來。", "Tell me. I can come from whichever side you point to."),
  line("spark", "左邊那條比較近，也比較好玩。", "The left one is closer, and more fun."),
  line("alliance", "好玩就好玩。我跟上。", "Fun is fine. I'll follow."),
]);

add("alliance", "mapkeeper", [
  line("mapkeeper", "這張還是空白的。你從哪邊進來，我先記上。", "This one is still blank. Tell me which side you came in, and I'll mark it."),
  line("alliance", "從西邊。人跟在我後面，別把他們漏了。", "From the west. People are behind me. Don't leave them off."),
  line("mapkeeper", "不會。空白的地方我留著，等你補。", "I won't. I'll leave the blank for you to fill in."),
  line("alliance", "補完我們再走。這次不趕。", "We leave after that. No rush this time."),
]);

add("alliance", "soundtrack", [
  line("soundtrack", "你一出現，我就把音樂換了一段。", "The moment you showed up, I changed the music."),
  line("alliance", "換輕一點的。大家已經夠緊了。", "Make it softer. Everyone is tense enough."),
  line("soundtrack", "好，鼓收小。你走到中間再進旋律。", "Okay, drums down. The melody comes in when you reach the middle."),
  line("alliance", "那我走慢一點，讓你對上拍。", "Then I'll walk slower, so you can meet the beat."),
]);

add("alliance", "strategist", [
  line("strategist", "先別衝。三條路，我看中靠右那條。", "Don't rush. Three paths. I like the one on the right."),
  line("alliance", "右路給我。左邊的人你留著看。", "I'll take the right. You keep an eye on the people to the left."),
  line("strategist", "看完我就說。你不用猜。", "I'll tell you when I've seen it. You don't have to guess."),
  line("alliance", "我不猜。你說了，我再動。", "I won't guess. I move when you say."),
]);

add("alliance", "messenger", [
  line("messenger", "我跟每個人說了：援軍到了，先別散。", "I told everyone: reinforcements are here, don't scatter yet."),
  line("alliance", "他們點頭了嗎？", "Did they nod?"),
  line("messenger", "最後一個也點了。我可以再跑一圈。", "The last one nodded too. I can lap the room again."),
  line("alliance", "不用再跑。你站我旁邊，讓他們看得到你。", "No more laps. Stand beside me, so they can see you."),
]);

add("alliance", "missionary", [
  line("missionary", "我想把這句說清楚：你來了，大家就願意再留一下。", "I want this said plainly: once you arrived, people were willing to stay a little longer."),
  line("alliance", "那就說。我在這裡，你不用替我加話。", "Then say it. I'm here. You don't have to add words for me."),
  line("missionary", "我不加。就是你到了，我們一起把這段做完。", "I won't add any. Just that you got here, and we finish this part together."),
  line("alliance", "好。說完就動手。", "Good. Once it's said, we start."),
]);

add("alliance", "apostle", [
  line("apostle", "你開的那條路，我接著走。不用再交代第二次。", "I'll keep walking the path you opened. You don't have to explain it twice."),
  line("alliance", "那就交給你。我在後面，不搶你的步子。", "Then it's yours. I'll stay behind and won't step on your pace."),
  line("apostle", "我把帶來的東西放好，人跟上去。", "I'll set down what I brought, then follow."),
  line("alliance", "放好就行。我們同一方向。", "Setting it down is enough. We're headed the same way."),
]);

add("alliance", "designer", [
  line("designer", "你站那邊，畫面就齊了。別再往左半步。", "Stand right there and the picture lines up. Not half a step left."),
  line("alliance", "這裡？翅膀會不會擋到人。", "Here? Will the wings block anyone?"),
  line("designer", "不會。白的剛好托住後面那一塊。", "No. The white sits just right behind them."),
  line("alliance", "那我不動。你說齊了，就齊了。", "Then I stay. If you say it lines up, it lines up."),
]);

add("alliance", "galaxy", [
  line("galaxy", "你來了。這一圈就不用我一個人站著。", "You're here. I don't have to hold this circle alone."),
  line("alliance", "你站中間。我在外圈，把人帶進來。", "You take the middle. I'll stay on the outside and bring people in."),
  line("galaxy", "帶進來就好。不用大聲。", "Bringing them in is enough. No need to be loud."),
  line("alliance", "我輕一點。你點頭，我就停。", "I'll keep it soft. When you nod, I stop."),
]);

add("alliance", "andromeda", [
  line("andromeda", "從這邊看，你比我先被大家看見。", "From here, people see you before they see me."),
  line("alliance", "那就讓他們先看我。你走到你想站的地方。", "Then let them look at me first. Walk to wherever you want to stand."),
  line("andromeda", "我站你側邊。金的和白的，放在一起剛好。", "I'll stand at your side. Gold and white sit well together."),
  line("alliance", "剛好就留著。今晚我們都別挪。", "Then we leave it like that. Neither of us moves tonight."),
]);

add("galaxy", "andromeda", [
  line("galaxy", "你站右邊。我站這裡。兩個人就夠把這一圈穩住。", "You take the right. I'll stand here. The two of us are enough to steady this circle."),
  line("andromeda", "我不搶你的位子。我把自己的顏色放輕一點。", "I won't take your place. I'll keep my own colors soft."),
  line("galaxy", "輕一點也好看。大家知道往哪裡看就行。", "Soft still looks right. People only need to know where to look."),
  line("andromeda", "那我們都不把話說太滿。笑一下，就開始。", "Then neither of us says too much. A smile, and we begin."),
]);

add("cocoa", "galaxy", [
  line("cocoa", "冠有點涼。杯子放你手邊，不急著喝。", "The crown looks a little cold. The cup is by your hand. No need to drink yet."),
  line("galaxy", "謝謝。人到齊了嗎？", "Thank you. Is everyone here?"),
  line("cocoa", "差一個。貓先看著門口，你不用下來找。", "One person short. The cat is watching the door. You don't have to come down and look."),
  line("galaxy", "那我留在這裡。你去把那杯送完。", "Then I'll stay. You go finish handing that cup out."),
]);

add("cocoa", "andromeda", [
  line("cocoa", "你的披肩我折好了。先喝一口，再去跟大家站。", "I folded your wrap. Have a sip, then go stand with everyone."),
  line("andromeda", "你總是先顧人。自己的那杯呢？", "You always look after people first. Where is your own cup?"),
  line("cocoa", "在貓旁邊。它不搶。", "Next to the cat. It doesn't take it."),
  line("andromeda", "那我們一起喝完再走。今晚不趕。", "Then we finish them together before we go. No rush tonight."),
]);

function pairKey(a, b) {
  return [a, b].sort().join("|");
}

function fallbackLines(a, b) {
  const [first, second] = [a, b].sort();
  return [
    line(first, "你也在。有你在，這一段就沒那麼吵。", "You're here too. This part is quieter with you."),
    line(second, "我沒走遠。你要是停下來，我就在旁邊。", "I didn't go far. If you stop, I'm right here."),
    line(first, "那就不用講太滿。做完手邊的，再看下一件。", "Then we don't have to say it all. Finish what's in our hands, then the next thing."),
    line(second, "好。走的時候叫我一聲就行。", "Okay. Just call me when it's time to go."),
  ];
}

export function dialogueFor(a, b) {
  const key = pairKey(a, b);
  const written = WRITTEN[key];
  if (written) return { kind: "written", key, lines: written };
  return { kind: "fallback", key, lines: fallbackLines(a, b) };
}

export function pairStats(ids) {
  let written = 0;
  let fallback = 0;
  for (let i = 0; i < ids.length; i += 1) {
    for (let j = i + 1; j < ids.length; j += 1) {
      if (dialogueFor(ids[i], ids[j]).kind === "written") written += 1;
      else fallback += 1;
    }
  }
  return { written, fallback, total: written + fallback };
}

export function extractCode(input) {
  const text = String(input ?? "").trim();
  if (!text) return null;
  const fromLink = text.match(/[?&#\s]c=([A-Ha-h]{3})\b/i) || text.match(/^c=([A-Ha-h]{3})$/i);
  if (fromLink) return fromLink[1].toUpperCase();
  if (/^[A-Ha-h]{3}$/.test(text)) return text.toUpperCase();
  return null;
}

export function shouldFaceIn(gaze, slot) {
  return gaze === "left" || gaze === "right" ? gaze === slot : false;
}
