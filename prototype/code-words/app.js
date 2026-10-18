// Can an AI agent read your code words? An illustrative toy.
// Every reading is pre-written. Nothing is sent anywhere, nothing is stored, and the same
// phrase always gives the same result.
(function () {
  "use strict";

  var INK = "#193A35";
  var POP = "#F08A6E";
  var BONE = "#F6F3ED";
  var MOSS = "#62716A";
  var BRASS = "#8A6A2B";
  var FONT = '"PingFang TC", "Microsoft JhengHei", "Noto Sans CJK TC", "WenQuanYi Micro Hei", "Droid Sans Fallback", ui-sans-serif, system-ui, sans-serif';

  // Phrases: [id, zh phrase, en phrase, zh scene, en scene, literal zh/en, tone zh/en, ask zh/en]
  var PHRASES = [
    {
      zh: "隨便", en: "Whatever",
      ctx: { zh: "朋友問：「今晚吃什麼？」你回：", en: "A friend asks, \"What's for dinner?\" You say:" },
      literal: { zh: "沒有指定，我先挑第一個選項。", en: "Nothing is specified, so I'll take the first option." },
      tone: { zh: "可能真的都行，也可能是累了、不想選。", en: "Maybe it really is fine, or maybe you're too tired to choose." },
      ask: { zh: "有沒有絕對不想吃的？", en: "Is there anything you definitely don't want?" }
    },
    {
      zh: "都可以", en: "Anything works",
      ctx: { zh: "朋友問：「週末看哪部電影？」你回：", en: "A friend asks, \"Which film this weekend?\" You say:" },
      literal: { zh: "所有選項都算通過，我隨機挑一部。", en: "Every option passes, so I'll pick one at random." },
      tone: { zh: "可能是不想讓對方失望，但心裡其實有偏好。", en: "Maybe you don't want to let them down, but you do have a leaning." },
      ask: { zh: "如果只能選一部，你會偏向哪種類型？", en: "If it had to be one, which kind would you lean toward?" }
    },
    {
      zh: "再說吧", en: "Let's see later",
      ctx: { zh: "朋友約下週聚餐，你回：", en: "A friend invites you to dinner next week. You say:" },
      literal: { zh: "事情延後，沒有日期，先放進待定。", en: "Postponed with no date, so it goes on a maybe list." },
      tone: { zh: "可能是現在不想答應，也不想直接拒絕。", en: "Maybe you don't want to say yes yet, or say no outright." },
      ask: { zh: "那我週三再問你一次，可以嗎？", en: "Shall I check in with you again on Wednesday?" }
    },
    {
      zh: "你決定", en: "You decide",
      ctx: { zh: "朋友問：「旅行去哪裡？」你回：", en: "A friend asks, \"Where should we travel?\" You say:" },
      literal: { zh: "決定權交給我，現在由我負責選。", en: "The decision is handed to me, so I'm the one choosing." },
      tone: { zh: "可能是信任，也可能是不想承擔選錯的壓力。", en: "Maybe trust, or maybe you'd rather not carry the pressure of a wrong pick." },
      ask: { zh: "我選好之前，有沒有想避開的地方？", en: "Before I choose, is there a place you'd like to avoid?" }
    },
    {
      zh: "看你方便", en: "Whenever suits you",
      ctx: { zh: "朋友問：「什麼時候見面？」你回：", en: "A friend asks, \"When shall we meet?\" You say:" },
      literal: { zh: "時間由對方決定，我提出一個。", en: "The time is up to the other side, so I'll propose one." },
      tone: { zh: "可能是客氣地讓步，但自己的空檔其實有限。", en: "Maybe a polite step back, while your own free time is limited." },
      ask: { zh: "你這週哪一天比較不趕？", en: "Which day this week is least rushed for you?" }
    },
    {
      zh: "沒事", en: "It's nothing",
      ctx: { zh: "你問：「怎麼了？」對方回：", en: "You ask, \"What's wrong?\" They say:" },
      literal: { zh: "回答是沒事，對話可以結束。", en: "The answer is nothing, so the conversation can end." },
      tone: { zh: "語氣很短，可能有事，但還沒準備好說。", en: "The tone is short. Maybe there is something, and it isn't ready to be said." },
      ask: { zh: "我先在旁邊，你想說的時候再說，好嗎？", en: "I'll stay nearby. Tell me whenever you want to. Okay?" }
    },
    {
      zh: "嗯", en: "Mm.",
      ctx: { zh: "你傳了一長串訊息，對方只回：", en: "You send a long message. They reply with just:" },
      literal: { zh: "收到，已讀，這件事可以結束。", en: "Received and read, so this can be closed." },
      tone: { zh: "可能在忙，可能不知道怎麼回，也可能只是同意。", en: "Maybe busy, maybe unsure how to reply, maybe just agreeing." },
      ask: { zh: "這幾點裡，哪一點你想先聊？", en: "Of these points, which one would you like to talk about first?" }
    },
    {
      zh: "隨緣", en: "We'll see how it goes",
      ctx: { zh: "你問：「那我們還會再見嗎？」對方回：", en: "You ask, \"Will we see each other again?\" They say:" },
      literal: { zh: "沒有時間也沒有條件，沒有可執行的下一步。", en: "No time and no condition, so there is no next step to run." },
      tone: { zh: "可能是放鬆的態度，有時也是把答案留給別人。", en: "Maybe a relaxed attitude, sometimes leaving the answer to someone else." },
      ask: { zh: "如果碰巧有空，我可以先約個大概時間嗎？", en: "If it happens to work out, may I pencil in a rough time?" }
    }
  ];

  // Fallback readings for a phrase the visitor types. Chosen by a fixed hash of the text, so the
  // same words always give the same card.
  var FALLBACK = {
    ctx: { zh: "你說：", en: "You say:" },
    literal: { zh: "這句話沒有指定選項，我先照字面當作都行。", en: "No option is named, so I'll take it at face value: anything goes." },
    tone: [
      { zh: "可能是真的無所謂。", en: "Maybe it really doesn't matter to you." },
      { zh: "可能是還沒想好。", en: "Maybe you haven't made up your mind yet." },
      { zh: "可能是想把決定留給對方。", en: "Maybe you'd like to leave the decision to them." }
    ],
    ask: [
      { zh: "如果只能選一個，你會偏向哪邊？", en: "If it had to be one, which way would you lean?" },
      { zh: "有沒有絕對不要的？", en: "Is there anything you definitely don't want?" },
      { zh: "我先提一個，你點頭或搖頭就好？", en: "I'll suggest one. A nod or a shake of the head is enough?" }
    ]
  };

  var AGENTS = [
    { key: "literal", face: { color: "#9FD3B8", eyes: "round", mouth: "flat" }, name: { zh: "字面君", en: "Literal" }, role: { zh: "照字面讀", en: "reads it literally" } },
    { key: "tone", face: { color: "#F6B8A0", eyes: "happy", mouth: "smile" }, name: { zh: "語氣君", en: "Tone" }, role: { zh: "讀語氣", en: "reads the tone" } },
    { key: "ask", face: { color: "#F2D98A", eyes: "wide", mouth: "o" }, name: { zh: "追問君", en: "Asker" }, role: { zh: "先問清楚", en: "asks first" } }
  ];

  var UI = {
    zh: {
      docTitle: "AI agent 聽得懂你的暗號嗎？ — Paul's Tradecraft",
      skip: "跳至內容", langLabel: "語言", eyebrow: "Digital Garage · 輕科技玩具",
      boundary: "示意玩具，不是心理測驗。解讀是事先寫好的，沒有真的呼叫 AI agent，也不存任何內容。",
      title: "AI agent 聽得懂你的暗號嗎？",
      lede: "「隨便」「都可以」「再說吧」，人一聽就懂的話，AI agent 會怎麼讀？選一句，看三位 agent 各自的解讀。",
      hint: "同一句話，永遠是同一個結果。",
      step1: "第 1 步，共 3 步", pickTitle: "選一句含糊的話", ownLabel: "或自己打一句（最多 12 個字）",
      readBtn: "看 AI agent 怎麼讀",
      selectionHint: function (phrase) { return "已選「" + phrase + "」，按下方按鈕，看三位 agent 怎麼讀。"; },
      step2: "第 2 步，共 3 步", readingTitle: "三位 agent 的解讀",
      makeBtn: "做成暗號卡", backPick: "換一句",
      cardKicker: "暗號卡 · 示意玩具", lines: ["字面君怎麼讀", "語氣君怎麼讀", "能解開它的一句話"],
      cardBoundary: "示意玩具，不是心理測驗。解讀是事先寫好的。",
      download: "下載暗號卡", again: "再試一句",
      downloaded: "已下載。", downloadFail: "這次沒畫成圖片，卡片仍然在這一頁上。",
      back: "回到 Digital Garage"
    },
    en: {
      docTitle: "Can an AI agent read your code words? — Paul's Tradecraft",
      skip: "Skip to content", langLabel: "Language", eyebrow: "Digital Garage · light-tech toy",
      boundary: "A toy, not a personality test. The readings are written in advance. No AI agent is actually called, and nothing is stored.",
      title: "Can an AI agent read your code words?",
      lede: "\"Whatever\", \"Anything works\", \"Let's see later\": things a person hears and just gets. How would an AI agent read them? Pick one and see three agents each take a turn.",
      hint: "The same phrase always gives the same result.",
      step1: "Step 1 of 3", pickTitle: "Pick a vague phrase", ownLabel: "Or type your own (up to 12 characters)",
      readBtn: "See how the AI agents read it",
      selectionHint: function (phrase) { return "Selected “" + phrase + "”. Use the button below to see how three agents read it."; },
      step2: "Step 2 of 3", readingTitle: "Three agents, three readings",
      makeBtn: "Make my code-word card", backPick: "Pick another",
      cardKicker: "Code-word card · illustrative toy", lines: ["How Literal reads it", "How Tone reads it", "The one line that clears it up"],
      cardBoundary: "A toy, not a personality test. The readings are written in advance.",
      download: "Download card", again: "Try another",
      downloaded: "Downloaded.", downloadFail: "The picture didn't save this time. The card is still on this page.",
      back: "Back to Digital Garage"
    }
  };

  var params = new URLSearchParams(location.search);
  var lang = params.get("lang") === "en" ? "en" : "zh";
  var state = { phrase: null, typed: "" };

  function $(id) { return document.getElementById(id); }

  function hash(text) {
    var h = 0;
    for (var i = 0; i < text.length; i++) h = (h * 31 + text.charCodeAt(i)) >>> 0;
    return h;
  }

  // Build the three readings for the current phrase.
  function readingFor(p) {
    if (p.preset) {
      var pr = p.preset;
      return {
        said: pr[lang], ctx: pr.ctx[lang],
        literal: pr.literal[lang], tone: pr.tone[lang], ask: pr.ask[lang]
      };
    }
    var h = hash(p.text);
    return {
      said: p.text, ctx: FALLBACK.ctx[lang],
      literal: FALLBACK.literal[lang],
      tone: FALLBACK.tone[h % FALLBACK.tone.length][lang],
      ask: FALLBACK.ask[Math.floor(h / 7) % FALLBACK.ask.length][lang]
    };
  }

  function faceSvg(spec) {
    var eyes = "";
    if (spec.eyes === "round") {
      eyes = '<circle cx="36" cy="54" r="7.5" fill="' + INK + '"/><circle cx="64" cy="54" r="7.5" fill="' + INK + '"/>' +
        '<circle cx="38.6" cy="51" r="2.6" fill="#fff"/><circle cx="66.6" cy="51" r="2.6" fill="#fff"/>';
    } else if (spec.eyes === "happy") {
      eyes = '<path d="M28 56 Q36 46 44 56" fill="none" stroke="' + INK + '" stroke-width="3.6" stroke-linecap="round"/>' +
        '<path d="M56 56 Q64 46 72 56" fill="none" stroke="' + INK + '" stroke-width="3.6" stroke-linecap="round"/>';
    } else {
      eyes = '<circle cx="35" cy="54" r="6" fill="' + INK + '"/><circle cx="37" cy="51.5" r="2" fill="#fff"/>' +
        '<circle cx="64" cy="52" r="10" fill="' + INK + '"/><circle cx="67.4" cy="48" r="3.4" fill="#fff"/>';
    }
    var mouth = "";
    if (spec.mouth === "flat") mouth = '<line x1="42" y1="74" x2="58" y2="74" stroke="' + INK + '" stroke-width="3.4" stroke-linecap="round"/>';
    else if (spec.mouth === "smile") mouth = '<path d="M40 71 Q50 81 60 71" fill="none" stroke="' + INK + '" stroke-width="3.4" stroke-linecap="round"/>';
    else mouth = '<ellipse cx="50" cy="75" rx="4.2" ry="5.2" fill="' + INK + '"/>';
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">' +
      '<line x1="50" y1="14" x2="50" y2="24" stroke="' + INK + '" stroke-width="3.4" stroke-linecap="round"/>' +
      '<circle cx="50" cy="9" r="5.5" fill="' + POP + '" stroke="' + INK + '" stroke-width="2.4"/>' +
      '<circle cx="50" cy="58" r="37" fill="' + spec.color + '" stroke="' + INK + '" stroke-width="3.4"/>' +
      '<ellipse cx="27" cy="68" rx="6" ry="3.6" fill="' + POP + '" opacity="0.4"/>' +
      '<ellipse cx="73" cy="68" rx="6" ry="3.6" fill="' + POP + '" opacity="0.4"/>' +
      eyes + mouth + '</svg>';
  }

  function setFace(el, spec) {
    el.innerHTML = faceSvg(spec);
  }

  function renderStatic() {
    var ui = UI[lang];
    document.documentElement.lang = lang === "en" ? "en" : "zh-Hant";
    document.title = ui.docTitle;
    $("skip").textContent = ui.skip;
    $("lang-group").setAttribute("aria-label", ui.langLabel);
    $("eyebrow").textContent = ui.eyebrow;
    $("boundary").textContent = ui.boundary;
    $("title").textContent = ui.title;
    $("lede").textContent = ui.lede;
    $("hint").textContent = ui.hint;
    $("progress-pick").textContent = ui.step1;
    $("pick-title").textContent = ui.pickTitle;
    $("own-text").textContent = ui.ownLabel;
    $("read").textContent = ui.readBtn;
    $("progress-reading").textContent = ui.step2;
    $("reading-title").textContent = ui.readingTitle;
    $("make").textContent = ui.makeBtn;
    $("back-pick").textContent = ui.backPick;
    $("card-kicker").textContent = ui.cardKicker;
    $("card-boundary").textContent = ui.cardBoundary;
    $("download").textContent = ui.download;
    $("again").textContent = ui.again;
    $("back").textContent = ui.back;
    $("back").href = "/?lang=" + lang + "#garage";
    document.querySelectorAll("[data-set-lang]").forEach(function (b) {
      b.setAttribute("aria-pressed", String(b.dataset.setLang === lang));
    });
    renderChips();
  }

  function renderChips() {
    var box = $("chips");
    box.textContent = "";
    PHRASES.forEach(function (p, i) {
      var b = document.createElement("button");
      b.type = "button";
      b.className = "chip";
      b.textContent = p[lang];
      var selected = Boolean(state.phrase && state.phrase.preset === p);
      b.setAttribute("aria-pressed", String(selected));
      if (selected) {
        var check = document.createElement("span");
        check.className = "selection-check";
        check.setAttribute("aria-hidden", "true");
        check.textContent = "✓";
        b.appendChild(check);
      }
      b.addEventListener("click", function () {
        $("own").value = "";
        state.phrase = { preset: p };
        renderChips();
      });
      box.appendChild(b);
    });
    updateSelectionFeedback();
  }

  function show(id) {
    ["pick", "reading", "result"].forEach(function (s) { $(s).hidden = s !== id; });
    var heading = id === "pick" ? $("pick-title") : id === "reading" ? $("reading-title") : $("card-phrase");
    heading.focus({ preventScroll: false });
  }

  function renderReading() {
    var ui = UI[lang];
    var r = readingFor(state.phrase);
    $("said-ctx").textContent = r.ctx;
    $("said-phrase").textContent = "「" + r.said + "」";
    if (lang === "en") $("said-phrase").textContent = "\"" + r.said + "\"";
    var box = $("agents");
    box.textContent = "";
    AGENTS.forEach(function (a) {
      var row = document.createElement("div");
      row.className = "agent";
      var face = document.createElement("div");
      face.className = "face";
      face.setAttribute("aria-hidden", "true");
      setFace(face, a.face);
      var body = document.createElement("div");
      var who = document.createElement("p");
      who.className = "who";
      who.textContent = a.name[lang] + " · " + a.role[lang];
      var reads = document.createElement("p");
      reads.className = "reads";
      var text = r[a.key];
      reads.textContent = a.key === "ask" ? (lang === "en" ? "\"" + text + "\"" : "「" + text + "」") : text;
      body.appendChild(who);
      body.appendChild(reads);
      row.appendChild(face);
      row.appendChild(body);
      box.appendChild(row);
    });
    void ui;
  }

  function renderCard() {
    var ui = UI[lang];
    var r = readingFor(state.phrase);
    var faces = $("faces");
    faces.textContent = "";
    AGENTS.forEach(function (a) {
      var f = document.createElement("div");
      f.className = "face";
      setFace(f, a.face);
      faces.appendChild(f);
    });
    $("card-phrase").textContent = lang === "en" ? "\"" + r.said + "\"" : "「" + r.said + "」";
    $("card-ctx").textContent = r.ctx;
    var lines = $("lines");
    lines.textContent = "";
    [["literal", false], ["tone", false], ["ask", true]].forEach(function (pair, i) {
      var wrap = document.createElement("div");
      wrap.className = "line" + (pair[1] ? " line-key" : "");
      var label = document.createElement("p");
      label.className = "line-label";
      label.textContent = ui.lines[i];
      var body = document.createElement("p");
      body.className = "line-body";
      if (pair[1]) {
        var mark = document.createElement("span");
        mark.className = "mark";
        mark.textContent = r[pair[0]];
        body.appendChild(mark);
      } else {
        body.textContent = r[pair[0]];
      }
      wrap.appendChild(label);
      wrap.appendChild(body);
      lines.appendChild(wrap);
    });
    $("status").textContent = "";
  }

  // ---- download: draw the card onto a canvas ----
  function wrap(ctx, text, maxW) {
    var out = [];
    var line = "";
    var tokens = text.indexOf(" ") >= 0 ? text.split(/(\s+)/) : text.split("");
    tokens.forEach(function (tk) {
      var test = line + tk;
      if (ctx.measureText(test).width <= maxW || !line) {
        line = test;
      } else {
        out.push(line.replace(/\s+$/, ""));
        line = tk.replace(/^\s+/, "");
      }
    });
    if (line) out.push(line);
    return out;
  }

  function loadFace(spec) {
    return new Promise(function (resolve, reject) {
      var img = new Image();
      img.onload = function () { resolve(img); };
      img.onerror = reject;
      img.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(faceSvg(spec));
    });
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

  function downloadCard() {
    var ui = UI[lang];
    var r = readingFor(state.phrase);
    Promise.all(AGENTS.map(function (a) { return loadFace(a.face); })).then(function (imgs) {
      var W = 1080;
      var left = 130;
      var maxW = 780;
      var cx = W / 2 - 16;
      var scratch = document.createElement("canvas").getContext("2d");
      var ops = [];
      var y = 470;

      // Layout pass: collect draw operations and find where the content ends.
      var phrase = lang === "en" ? "\"" + r.said + "\"" : "「" + r.said + "」";
      scratch.font = "700 88px " + FONT;
      wrap(scratch, phrase, 820).forEach(function (ln) {
        var at = y;
        ops.push(function (c) { c.textAlign = "center"; c.fillStyle = INK; c.font = "700 88px " + FONT; c.fillText(ln, cx, at); });
        y += 100;
      });
      scratch.font = "400 34px " + FONT;
      wrap(scratch, r.ctx, 820).forEach(function (ln) {
        var at = y;
        ops.push(function (c) { c.textAlign = "center"; c.fillStyle = MOSS; c.font = "400 34px " + FONT; c.fillText(ln, cx, at); });
        y += 46;
      });
      y += 36;
      [["literal", 0], ["tone", 1], ["ask", 2]].forEach(function (pair) {
        var labelY = y;
        ops.push(function (c) { c.textAlign = "left"; c.fillStyle = BRASS; c.font = "700 30px " + FONT; c.fillText(ui.lines[pair[1]], left, labelY); });
        y += 48;
        var isKey = pair[0] === "ask";
        var font = (isKey ? "700 " : "400 ") + "38px " + FONT;
        scratch.font = font;
        wrap(scratch, r[pair[0]], maxW).forEach(function (ln) {
          var at = y;
          var lw = scratch.measureText(ln).width;
          ops.push(function (c) {
            c.textAlign = "left";
            c.font = font;
            if (isKey) { c.fillStyle = POP; c.fillRect(left - 4, at - 14, Math.min(lw + 8, maxW + 8), 18); }
            c.fillStyle = INK;
            c.fillText(ln, left, at);
          });
          y += 52;
        });
        y += 34;
      });

      var footY = y + 10;
      var cardBottom = footY + 130;
      var H = cardBottom + 76;
      var canvas = document.createElement("canvas");
      canvas.width = W;
      canvas.height = H;
      var ctx = canvas.getContext("2d");
      ctx.fillStyle = BONE;
      ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = INK;
      roundRect(ctx, 76, 76, 940, cardBottom - 60, 44);
      ctx.fill();
      ctx.fillStyle = "#ffffff";
      roundRect(ctx, 60, 60, 940, cardBottom - 60, 44);
      ctx.fill();
      ctx.lineWidth = 8;
      ctx.strokeStyle = INK;
      ctx.stroke();

      ctx.textAlign = "center";
      ctx.fillStyle = INK;
      ctx.font = "700 32px " + FONT;
      ctx.fillText(ui.cardKicker, cx, 134);
      var faceSize = 200;
      var gap = 24;
      var x0 = (W - 16 - (faceSize * 3 + gap * 2)) / 2;
      imgs.forEach(function (img, i) { ctx.drawImage(img, x0 + i * (faceSize + gap), 170, faceSize, faceSize); });
      ops.forEach(function (op) { op(ctx); });

      ctx.strokeStyle = "rgba(25, 58, 53, 0.35)";
      ctx.lineWidth = 3;
      ctx.setLineDash([12, 10]);
      ctx.beginPath();
      ctx.moveTo(left, footY);
      ctx.lineTo(W - 146, footY);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.textAlign = "left";
      ctx.fillStyle = MOSS;
      ctx.font = "700 28px " + FONT;
      wrap(ctx, ui.cardBoundary, maxW).forEach(function (ln, i) { ctx.fillText(ln, left, footY + 44 + i * 38); });
      ctx.textAlign = "right";
      ctx.fillText("paulstradecraft.com", W - 146, footY + 100);

      var link = document.createElement("a");
      link.href = canvas.toDataURL("image/png");
      link.download = "code-word-card.png";
      document.body.appendChild(link);
      link.click();
      link.remove();
      $("status").textContent = ui.downloaded;
    }).catch(function () {
      $("status").textContent = ui.downloadFail;
    });
  }

  function setLang(next) {
    lang = next;
    var u = new URL(location.href);
    u.searchParams.set("lang", lang);
    history.replaceState(null, "", u);
    renderStatic();
    if (!$("reading").hidden) renderReading();
    if (!$("result").hidden) renderCard();
  }

  function updateSelectionFeedback() {
    var phrase = state.phrase && (state.phrase.preset ? state.phrase.preset[lang] : state.phrase.text);
    $("read").disabled = !phrase;
    $("selection-hint").hidden = !phrase;
    $("selection-hint").textContent = phrase ? UI[lang].selectionHint(phrase) : "";
  }

  document.querySelectorAll("[data-set-lang]").forEach(function (b) {
    b.addEventListener("click", function () { setLang(b.dataset.setLang); });
  });
  $("own").addEventListener("input", function () {
    var text = $("own").value.trim().slice(0, 12);
    state.phrase = text ? { text: text } : null;
    renderChips();
  });
  $("read").addEventListener("click", function () {
    renderReading();
    show("reading");
  });
  $("make").addEventListener("click", function () {
    renderCard();
    show("result");
  });
  $("back-pick").addEventListener("click", function () { show("pick"); });
  $("again").addEventListener("click", function () {
    state.phrase = null;
    $("own").value = "";
    renderChips();
    show("pick");
  });
  $("download").addEventListener("click", downloadCard);

  renderStatic();
})();
