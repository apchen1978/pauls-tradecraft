// Room 03's own record (Paul, 2026-11-18: Room 03 is a Bay Area flat; its record player only played pieces borrowed from Room 02 and Room 04, so give it one new piece of its own, played first).
// "灣區午後" / "Bay Area Afternoon": a light, sunny West Coast loop at 92 beats a minute, nearly straight eighths with a little lift, in G major: Gmaj9, Em9, Cmaj9 and D6/9 (I-vi-IV-V with
// open voicings, no minor turn at the end, so it keeps rising). A soft bossa-style bass (root, fifth on the "and" of two, root, fifth), a rim click and a shaker made from noise, a rolled comp
// and a bright, bouncy hook (see the melodies below) on the same real piano as the other rooms (piano.js: Salamander Grand Piano, CC BY 3.0, credited on the page), over a very faint record crackle and an airy room.
// The form is sixteen bars: two bars of comp, the hook and its answer, the same shape lifted an octave in bars 8 to 11, then the hook again and a cadence home to G. Everything is written here note by note; nothing is borrowed and no sound file is
// added. Nothing plays until the visitor taps the record player (browsers allow sound only after a tap); start() must be called from inside that tap.
import { createPiano } from "../piano.js?v=auto";
const realPiano = createPiano(), PIANO_K = 3.0;
const hz = (midi) => 440 * Math.pow(2, (midi - 69) / 12);
const BPM = 92, STEP = 60 / BPM / 4, SWING = 0.07, BAR_STEPS = 16, FORM_BARS = 16;
const CHORDS = [
  { bass: 43, comp: [59, 62, 66, 69] },   // Gmaj9: B D F# A
  { bass: 40, comp: [55, 59, 62, 66] },   // Em9: G B D F#
  { bass: 36, comp: [55, 59, 62, 64] },   // Cmaj9: G B D E
  { bass: 38, comp: [54, 57, 59, 64] },   // D6/9: F# A B E
];
// melodies: [step, midi, length in steps] per bar (Paul, 2026-11-18: brighter, sunnier, a warm holiday-greeting feel). The hook is a bouncy, syncopated climb (root or fifth, third, fifth,
// then the sixth or ninth on the off-beat) that comes back over the IV chord; the second bar of each pair answers it. Strong beats sit on chord tones; the colour notes (the sixth, the ninth)
// fall on the off-beats. Bars 8 to 11 lift the same shape about an octave higher, up to C6, and the last bar walks up to the leading tone and lands on G on the next downbeat.
const HOOK = [[0, 67, 2], [2, 71, 2], [4, 74, 2], [7, 76, 2], [10, 74, 2], [12, 71, 3]];   // G B D E D B: over Gmaj9 and again over Cmaj9 (the fifth, seventh, ninth and third)
const MELODY_A = [
  HOOK,                                                            // Gmaj9: the call
  [[0, 71, 2], [3, 69, 2], [6, 67, 2], [8, 66, 3], [12, 67, 1], [14, 71, 2]],   // Em9: the answer, B A G, the ninth F#, a pickup back up
  HOOK,                                                            // Cmaj9: the call again
  [[0, 74, 2], [2, 76, 2], [4, 78, 2], [7, 76, 2], [10, 74, 2], [12, 69, 3]],   // D6/9: D E F# E D A, the answer climbs
];
const MELODY_B = [ // the lift
  [[0, 79, 2], [2, 81, 2], [4, 83, 2], [7, 81, 2], [10, 79, 2], [12, 76, 3]],   // Gmaj9: G A B A G E (the ninth and the sixth)
  [[0, 79, 2], [3, 78, 2], [6, 76, 2], [8, 74, 3], [12, 78, 1], [14, 79, 2]],   // Em9: G F# E D, F# G
  [[0, 79, 2], [2, 81, 2], [4, 83, 2], [7, 84, 2], [10, 83, 2], [12, 79, 3]],   // Cmaj9: up to C6, the peak
  [[0, 81, 2], [3, 78, 2], [6, 76, 2], [8, 78, 2], [10, 81, 2], [12, 83, 3]],   // D6/9: A F# E F# A, the sixth B leads back into the hook
];
const CADENCE = [[0, 74, 2], [2, 76, 2], [4, 78, 2], [7, 81, 2], [10, 78, 2], [12, 76, 1], [14, 78, 2], [16, 79, 8]]; // the last bar (D6/9): up to A, down, F# and home to G on the next downbeat
export const BAY_TITLE = { zh: "灣區午後", en: "Bay Area Afternoon" };
export const BAY_BARS = FORM_BARS; // one time through the form, about 42 s

export function createBayRecord() {
  let ctx = null, bus = null, master = null, crackle = null, timer = 0, playing = false, nextTime = 0, barIndex = 0, noteCount = 0, seed = 23, noise = null, reverbBuffer = null, runId = 0;
  const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647; // fixed seed: the same small variations every time, like a record
  const jitter = (ms) => (rnd() - 0.5) * 2 * ms / 1000;
  const vary = (gain) => gain * (0.9 + rnd() * 0.2);
  const noiseBuffer = () => {
    if (!noise) { const length = Math.floor(ctx.sampleRate * 0.4); noise = ctx.createBuffer(1, length, ctx.sampleRate); const data = noise.getChannelData(0); for (let i = 0; i < length; i++) data[i] = rnd() * 2 - 1; }
    return noise;
  };
  const shaker = (time, gain) => { // high band-passed noise, very short
    const src = ctx.createBufferSource(), band = ctx.createBiquadFilter(), g = ctx.createGain(); src.buffer = noiseBuffer(); band.type = "bandpass"; band.frequency.value = 6800; band.Q.value = 0.9;
    g.gain.setValueAtTime(0.0001, time); g.gain.exponentialRampToValueAtTime(gain, time + 0.012); g.gain.exponentialRampToValueAtTime(0.0001, time + 0.07); src.connect(band); band.connect(g); g.connect(bus); src.start(time); src.stop(time + 0.1);
  };
  const rim = (time, gain) => { // a soft wooden click: a short triangle blip with a touch of noise
    const osc = ctx.createOscillator(), g = ctx.createGain(); osc.type = "triangle"; osc.frequency.value = 1750;
    g.gain.setValueAtTime(0.0001, time); g.gain.exponentialRampToValueAtTime(gain, time + 0.002); g.gain.exponentialRampToValueAtTime(0.0001, time + 0.04); osc.connect(g); g.connect(bus); osc.start(time); osc.stop(time + 0.06); noteCount += 1;
  };
  const kick = (time, gain) => { // a soft, round thump
    const osc = ctx.createOscillator(), g = ctx.createGain(); osc.type = "sine"; osc.frequency.setValueAtTime(110, time); osc.frequency.exponentialRampToValueAtTime(48, time + 0.12);
    g.gain.setValueAtTime(0.0001, time); g.gain.exponentialRampToValueAtTime(gain, time + 0.006); g.gain.exponentialRampToValueAtTime(0.0001, time + 0.3); osc.connect(g); g.connect(bus); osc.start(time); osc.stop(time + 0.32);
  };
  const bass = (time, midi, gain, length) => { // a warm upright-like bass: a sine with a quiet octave, plucked
    const out = ctx.createGain(), low = ctx.createBiquadFilter(); low.type = "lowpass"; low.frequency.value = 420;
    out.gain.setValueAtTime(0.0001, time); out.gain.exponentialRampToValueAtTime(gain, time + 0.015); out.gain.exponentialRampToValueAtTime(gain * 0.45, time + 0.18); out.gain.exponentialRampToValueAtTime(0.0001, time + length);
    for (const [ratio, level, type] of [[1, 1, "sine"], [2, 0.22, "triangle"]]) { const osc = ctx.createOscillator(), g = ctx.createGain(); osc.type = type; osc.frequency.value = hz(midi) * ratio; g.gain.value = level; osc.connect(g); g.connect(out); osc.start(time); osc.stop(time + length + 0.05); }
    out.connect(low); low.connect(bus); noteCount += 1;
  };
  const piano = (time, midi, gain, length, pan = 0) => { // a real piano note, or a simple synth if the samples could not load
    if (realPiano.play(ctx, bus, time, midi, gain * PIANO_K, length, pan)) { noteCount += 1; return; }
    const out = ctx.createGain(), osc = ctx.createOscillator(), osc2 = ctx.createOscillator(); osc.type = "triangle"; osc2.type = "sine"; osc.frequency.value = hz(midi); osc2.frequency.value = hz(midi) * 2;
    out.gain.setValueAtTime(0.0001, time); out.gain.exponentialRampToValueAtTime(gain, time + 0.01); out.gain.exponentialRampToValueAtTime(0.0001, time + length); osc.connect(out); osc2.connect(out); out.connect(bus); osc.start(time); osc2.start(time); osc.stop(time + length + 0.05); osc2.stop(time + length + 0.05); noteCount += 1;
  };
  const bell = (time, midi, gain) => { // a small bell: a sine with two quieter inharmonic partials and a quick ring-out
    const out = ctx.createGain(); out.gain.setValueAtTime(0.0001, time); out.gain.exponentialRampToValueAtTime(gain, time + 0.004); out.gain.exponentialRampToValueAtTime(0.0001, time + 0.9);
    for (const [ratio, level] of [[1, 1], [2.76, 0.28], [5.4, 0.08]]) { const osc = ctx.createOscillator(), g = ctx.createGain(); osc.type = "sine"; osc.frequency.value = hz(midi) * ratio; g.gain.value = level; osc.connect(g); g.connect(out); osc.start(time); osc.stop(time + 0.95); }
    out.connect(bus); noteCount += 1;
  };
  const reverb = () => { // an airy, bright room (longer and lighter than Room 02's)
    const length = Math.floor(ctx.sampleRate * 1.8), buffer = ctx.createBuffer(2, length, ctx.sampleRate);
    for (let channel = 0; channel < 2; channel++) { const data = buffer.getChannelData(channel); let last = 0; for (let i = 0; i < length; i++) { last = last * 0.35 + (rnd() * 2 - 1) * 0.65; data[i] = last * Math.pow(1 - i / length, 2.2); } }
    return buffer;
  };
  const scheduleBar = () => {
    const section = barIndex % FORM_BARS, chord = CHORDS[barIndex % 4], t0 = nextTime, at = (i) => t0 + i * STEP + (i % 2 ? SWING * STEP : 0);
    // percussion from bar 2: a soft kick on one and three, a bossa-style rim figure, sixteenth shakers (the accent on the beat)
    if (section >= 2) {
      kick(at(0) + jitter(5), 0.32); kick(at(8) + jitter(5), 0.22);
      for (const i of (barIndex % 2 ? [2, 6, 12] : [0, 6, 10])) rim(at(i) + jitter(4), 0.05);
      for (let i = 0; i < BAR_STEPS; i += 1) shaker(at(i) + jitter(3), i % 4 === 0 ? 0.05 : i % 2 ? 0.022 : 0.032);
    }
    // the bass: root, fifth on the "and" of two, root on three, fifth to lead on
    bass(at(0), chord.bass, 0.3, STEP * 5); bass(at(6), chord.bass + 7, 0.2, STEP * 2); bass(at(8), chord.bass, 0.26, STEP * 5); bass(at(14), chord.bass + 7, 0.18, STEP * 2);
    // the comp: a gently rolled chord on the one, a light push on the "and" of two, an answer on four
    chord.comp.forEach((midi, i) => piano(at(0) + i * 0.03 + jitter(5), midi, vary(0.062), STEP * 7, -0.2 + i * 0.12));
    chord.comp.slice(1).forEach((midi, k) => piano(at(6) + k * 0.018, midi, vary(0.034), STEP * 3, 0.12 - k * 0.08));
    chord.comp.slice(2).forEach((midi, k) => piano(at(12) + k * 0.018, midi, vary(0.03), STEP * 3, 0.1));
    // the melody: absent for the first two bars, then phrase A, the higher phrase B, then A again ending on the cadence. Short notes and a slightly stronger touch keep it bouncy;
    // a soft bell an octave up doubles the head of the hook for a little holiday sparkle.
    if (section >= 2) {
      const row = section === FORM_BARS - 1 ? CADENCE : (section >= 8 && section <= 11 ? MELODY_B : MELODY_A)[barIndex % 4], hook = barIndex % 2 === 0;
      for (const [i, midi, length] of row) { const t = at(i) + 0.008 + jitter(5); piano(t, midi, vary(0.095), STEP * (length + 0.6), 0.22); if (hook && i < 8) bell(t, midi + 12, section >= 8 && section <= 11 ? 0.012 : 0.016); }
    }
    barIndex += 1; nextTime += BAR_STEPS * STEP;
    timer = setTimeout(scheduleBar, Math.max(50, (nextTime - ctx.currentTime - 0.6) * 1000));
  };
  return {
    // Call from inside a tap. Returns true if it started.
    start() {
      if (playing) return true;
      const AudioContextClass = window.AudioContext || window.webkitAudioContext; if (!AudioContextClass) return false;
      try {
        ctx ??= new AudioContextClass(); ctx.resume?.(); seed = 23;
        master = ctx.createGain(); master.gain.setValueAtTime(0.0001, ctx.currentTime); master.gain.exponentialRampToValueAtTime(0.62, ctx.currentTime + 0.6); master.connect(ctx.destination);
        const air = ctx.createBiquadFilter(); air.type = "lowpass"; air.frequency.value = 8200;
        const compressor = ctx.createDynamicsCompressor(); compressor.threshold.value = -18; compressor.knee.value = 8; compressor.ratio.value = 3.5; compressor.attack.value = 0.005; compressor.release.value = 0.16;
        bus = ctx.createGain(); bus.connect(air); air.connect(compressor); compressor.connect(master);
        const room = ctx.createConvolver(), send = ctx.createGain(), wet = ctx.createGain(); reverbBuffer ??= reverb(); room.buffer = reverbBuffer; send.gain.value = 0.2; wet.gain.value = 0.85; bus.connect(send); send.connect(room); room.connect(wet); wet.connect(master);
        crackle = ctx.createBufferSource(); const buffer = ctx.createBuffer(1, ctx.sampleRate * 3, ctx.sampleRate), data = buffer.getChannelData(0);
        for (let i = 0; i < data.length; i++) data[i] = (rnd() < 0.0003 ? (rnd() * 2 - 1) * 0.9 : 0) + (rnd() * 2 - 1) * 0.003; // a very faint record crackle
        crackle.buffer = buffer; crackle.loop = true; const high = ctx.createBiquadFilter(), crackleGain = ctx.createGain(); high.type = "highpass"; high.frequency.value = 1400; crackleGain.gain.value = 0.1; crackle.connect(high); high.connect(crackleGain); crackleGain.connect(master); crackle.start();
        playing = true; barIndex = 0; noteCount = 0; const run = ++runId;
        realPiano.load(ctx).then(() => { if (!playing || run !== runId) return; nextTime = ctx.currentTime + 0.25; scheduleBar(); }); // the piano samples load on the first tap (about 1 MB, once); the first bar waits for them
        return true;
      } catch { playing = false; return false; }
    },
    stop() {
      if (!playing) return;
      playing = false; clearTimeout(timer); timer = 0;
      const old = master, oldCrackle = crackle;
      try { old.gain.cancelScheduledValues(ctx.currentTime); old.gain.setValueAtTime(Math.max(0.0001, old.gain.value), ctx.currentTime); old.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.7); } catch { /* the graph may already be gone */ }
      setTimeout(() => { try { oldCrackle?.stop(); old?.disconnect(); } catch { /* already stopped */ } }, 1500);
    },
    state: () => ({ playing, context: ctx ? ctx.state : "none", bars: barIndex, notes: noteCount, title: BAY_TITLE.zh, titleEn: BAY_TITLE.en, piano: realPiano.ready() }),
  };
}
