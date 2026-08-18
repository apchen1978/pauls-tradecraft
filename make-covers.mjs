// 用 Chrome headless 渲染作品集封面（CSS 設計 → PNG）
// 使用方式：node make-covers.mjs
import { spawn } from 'node:child_process';
import { pathToFileURL } from 'node:url';
import path from 'node:path';

const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const USER_DATA = 'C:\\Users\\grays\\Documents\\DeepSeek-Test\\.chrome-shot';
const RENDER = pathToFileURL(path.resolve('cover-render.html')).href;
const OUT_DIR = 'public/images';

const covers = [
  {
    file: 'cover-deck.webp',
    grad: 'linear-gradient(135deg,#1e3a5f,#0f2233)',
    accent: '#8ab4f8',
    badge: 'TOOLING',
    kicker: 'Deck Pipeline',
    title: 'DSH Guide Deck',
    sub: 'Spec JSON → PPTX → PDF. Three iterations of an editorial design system.',
    meta: 'PPT Toolkit',
    status: 'Verified',
  },
  {
    file: 'cover-lyrics.webp',
    grad: 'linear-gradient(135deg,#3d1f47,#170b1e)',
    accent: '#e8c48a',
    badge: 'DESKTOP APP',
    kicker: 'Local AI Writing',
    title: 'AI Lyrics Generator',
    sub: 'Generate, score, critique and rewrite lyrics locally with Ollama models or offline draft mode.',
    meta: 'Python · PySide6',
    status: 'Verified',
  },
  {
    file: 'cover-expense.webp',
    grad: 'linear-gradient(135deg,#2f3b4f,#141a24)',
    accent: '#7dd3a0',
    badge: 'EXPERIMENTS',
    kicker: 'Finance Tooling',
    title: 'Expense Tracker',
    sub: 'Three vanilla experiments, 16/16 checks pass. Private repository.',
    meta: 'Vanilla JS',
    status: 'Verified',
  },
  {
    file: 'cover-game.webp',
    grad: 'linear-gradient(135deg,#0e2a3d,#061218)',
    accent: '#7dd3a0',
    badge: 'PLAYABLE',
    kicker: 'Typing Challenge',
    title: "Lil Matt's Gaming World",
    sub: 'English typing challenge with sound, live metrics, TTS and an adaptive learning shadow mode.',
    meta: 'Vite · TypeScript',
    status: 'Live demo',
    gaming: '1',
    hud: 'SCORE 042880,COMBO ×12,WPM 86',
  },
];

const chrome = spawn(CHROME, [
  '--headless=new', '--disable-gpu', '--no-first-run', '--hide-scrollbars',
  '--window-size=800,450', '--remote-debugging-port=9239',
  `--user-data-dir=${USER_DATA}`, 'about:blank',
], { stdio: 'ignore' });

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function getTarget() {
  for (let i = 0; i < 40; i++) {
    await sleep(400);
    try {
      const l = await (await fetch('http://127.0.0.1:9239/json')).json();
      const t = l.find((x) => x.type === 'page');
      if (t) return t;
    } catch {}
  }
  throw new Error('Chrome target not found');
}

const target = await getTarget();
const ws = new WebSocket(target.webSocketDebuggerUrl);
await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej; });
let id = 0;
const pending = new Map();
ws.onmessage = (e) => {
  const m = JSON.parse(e.data);
  if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); }
};
const send = (method, params = {}) => new Promise((res) => {
  const mid = ++id; pending.set(mid, res);
  ws.send(JSON.stringify({ id: mid, method, params }));
});

await send('Page.enable');
await send('Emulation.setDeviceMetricsOverride', { width: 800, height: 450, deviceScaleFactor: 1, mobile: false });

for (const c of covers) {
  const params = {
    grad: c.grad, accent: c.accent, badge: c.badge, kicker: c.kicker,
    title: c.title, sub: c.sub, meta: c.meta, status: c.status,
  };
  if (c.gaming) { params.gaming = c.gaming; params.hud = c.hud; }
  const q = new URLSearchParams(params).toString();
  const url = `${RENDER}?${q}`;
  await send('Page.navigate', { url });
  // 等字型與畫面完整載入
  await sleep(1500);
  await send('Page.bringToFront');
  await sleep(500);
  const res = await send('Page.captureScreenshot', {
    format: 'webp',
    clip: { x: 0, y: 0, width: 800, height: 450, scale: 1 },
  });
  // 輸出 webp（比 PNG 省 ~70%）
  if (res.result?.data) {
    const fs = await import('node:fs');
    fs.writeFileSync(path.resolve(OUT_DIR, c.file), Buffer.from(res.result.data, 'base64'));
    console.log(`OK  ${c.file}  ${fs.statSync(path.resolve(OUT_DIR, c.file)).size} bytes`);
  } else {
    console.log(`FAIL ${c.file}`);
  }
}

ws.close();
chrome.kill();
