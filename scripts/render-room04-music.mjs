// Build and start Vite preview first. Usage: node scripts/render-room04-music.mjs [preview URL]
// Set FFMPEG to the executable path if ffmpeg is not on PATH.
import { spawnSync } from "node:child_process";
import { mkdir, mkdtemp, rm, stat, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { chromium } from "playwright";

const origin = process.argv[2] ?? "http://127.0.0.1:4173";
const room = "/prototype/roomverse-3d/cafe/";
const destination = `public${room}audio`;
const workspace = await mkdtemp(join(tmpdir(), "room04-music-"));
const ffmpeg = process.env.FFMPEG ?? "ffmpeg";
const browser = await chromium.launch({ channel: "chrome" });

function encode(args) {
  const result = spawnSync(ffmpeg, ["-hide_banner", "-loglevel", "error", "-y", ...args], { stdio: "inherit" });
  if (result.error) throw result.error;
  if (result.status !== 0) throw new Error(`FFmpeg exited with ${result.status}`);
}

try {
  await mkdir(destination, { recursive: true });
  const page = await browser.newPage();
  const blank = new URL(`${room}offline-render`, origin).href;
  await page.route(blank, (route) => route.fulfill({ contentType: "text/html", body: "<!doctype html>" }));
  await page.goto(blank);
  // Tracks 0–2 grew from a 12-bar loop to an 18-bar form. One pass of that form is the side
  // (the cadence is the ending, then the player advances). 十里洋場 is unchanged and stays v1.
  // Two passes of the new form would put the cadence in the middle and push the eight files over 6 MB.
  const jobs = [
    { index: 0, version: "v2", passes: 1 },
    { index: 1, version: "v2", passes: 1 },
    { index: 2, version: "v2", passes: 1 },
  ];
  for (const { index, version, passes } of jobs) {
    const { encoded, seconds, peak } = await page.evaluate(async ({ track, passes }) => {
      const { createRoomSound } = await import("./sound.js");
      const buffer = await createRoomSound().renderTrack(track, 44100, passes);
      const frames = buffer.length, channels = buffer.numberOfChannels;
      const wav = new Uint8Array(44 + frames * channels * 2);
      const header = new DataView(wav.buffer);
      for (const [offset, tag] of [[0, "RIFF"], [8, "WAVE"], [12, "fmt "], [36, "data"]]) {
        wav.set(new TextEncoder().encode(tag), offset);
      }
      header.setUint32(4, wav.length - 8, true);
      header.setUint32(16, 16, true);
      header.setUint16(20, 1, true);
      header.setUint16(22, channels, true);
      header.setUint32(24, buffer.sampleRate, true);
      header.setUint32(28, buffer.sampleRate * channels * 2, true);
      header.setUint16(32, channels * 2, true);
      header.setUint16(34, 16, true);
      header.setUint32(40, wav.length - 44, true);
      const samples = Array.from({ length: channels }, (_, ch) => buffer.getChannelData(ch));
      let peak = 0;
      for (let i = 0; i < frames; i++) for (const channel of samples) peak = Math.max(peak, Math.abs(channel[i]));
      // Short tapers at the encoded boundaries prevent clicks. Leave headroom for lossy encoding.
      const taper = Math.round(buffer.sampleRate * 0.008), gain = Math.min(1, 0.85 / peak);
      for (let i = 0; i < frames; i++) {
        const edge = Math.min(1, i / taper, (frames - 1 - i) / taper);
        for (let ch = 0; ch < channels; ch++) {
          header.setInt16(44 + (i * channels + ch) * 2, Math.round(samples[ch][i] * gain * edge * 32767), true);
        }
      }
      let binary = "";
      for (let i = 0; i < wav.length; i += 32768) binary += String.fromCharCode(...wav.subarray(i, i + 32768));
      return { encoded: btoa(binary), seconds: frames / buffer.sampleRate, peak: peak * gain };
    }, { track: index, passes });
    const wav = join(workspace, "track.wav");
    await writeFile(wav, Buffer.from(encoded, "base64"));
    for (const [extension, options] of [
      ["m4a", ["-c:a", "aac", "-b:a", "56k", "-movflags", "+faststart"]],
      ["ogg", ["-c:a", "libopus", "-b:a", "48k", "-vbr", "constrained"]],
    ]) {
      const target = join(destination, `room04-track-${index}-${version}.${extension}`);
      encode(["-i", wav, ...options, target]);
      const { size } = await stat(target);
      if (size > 1_500_000) throw new Error(`${target} exceeds 1.5 MB`);
      console.log(`${target}: ${size} bytes, ${seconds.toFixed(2)} s, PCM peak ${peak.toFixed(3)}`);
    }
    const cover = join(destination, `room04-record-cover-${index}-512-v1.jpg`);
    if (!await stat(cover).then(() => true, () => false)) {
      encode(["-i", `public${room}art/room04-record-cover-${index}-v1.webp`,
        "-vf", "scale=512:512", "-frames:v", "1", cover]);
    }
  }
} finally {
  await browser.close();
  await rm(workspace, { recursive: true, force: true });
}
