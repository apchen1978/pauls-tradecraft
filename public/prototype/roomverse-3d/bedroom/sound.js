// Room 02's record (Paul, 2026-11-17: the bedroom is a New York room with a record player by the window; give it one piece with a Brooklyn feel, a simple rhythm, a real piano and no MIDI sound).
// "布魯克林窗台" / "Brooklyn Windowsill": a boom-bap beat at 84 beats a minute with swung sixteenths (a dusty kick and snare and a closed hat made from noise and sine sweeps, no samples), a round
// sub bass, a rolled jazz-chord comp and a laid-back pentatonic melody on a real piano (piano.js: Salamander Grand Piano, CC BY 3.0, credited on the page), over a faint record crackle. The four
// chords are Dm9, G13, Cmaj9 and Am7 (a ii-V-I-vi turn); the form is sixteen bars: two bars of beat and comp, then the melody comes in, a second melody a little higher, and a breakdown with no kick
// before it goes round again. Everything is written here note by note; nothing is borrowed. Nothing plays until the visitor taps the record corner (browsers allow sound only after a tap);
// start() must be called from inside that tap. It plays until stopped or the visitor leaves.
import { createPiano } from "../piano.js?v=auto";
const realPiano = createPiano(), PIANO_K = 3.0; // PIANO_K scales the synth-era levels to the louder piano samples
const hz = (midi) => 440 * Math.pow(2, (midi - 69) / 12);
const BPM = 84, STEP = 60 / BPM / 4, SWING = 0.2, BAR_STEPS = 16, FORM_BARS = 16; // a bar is sixteen steps; the odd steps lean late by 20 percent of a step
const CHORDS = [
  { bass: 38, comp: [53, 57, 60, 64] },   // Dm9
  { bass: 43, comp: [53, 59, 62, 64] },   // G13
  { bass: 36, comp: [52, 55, 59, 62] },   // Cmaj9
  { bass: 45, comp: [55, 60, 64, 67] },   // Am7
];
// melodies: [step, midi, length in steps] per bar (a pentatonic line over the chords)
const MELODY_A = [
  [[2, 69, 6], [10, 72, 2], [12, 69, 4]],   // Dm9: A C A
  [[0, 67, 4], [6, 65, 2], [8, 64, 8]],     // G13: G F E
  [[2, 64, 4], [8, 67, 6], [14, 69, 2]],    // Cmaj9: E G A
  [[0, 72, 6], [8, 69, 4], [12, 67, 4]],    // Am7: C A G
];
const MELODY_B = [
  [[0, 72, 4], [4, 74, 2], [8, 72, 4], [12, 69, 4]],   // Dm9: C D C A
  [[2, 71, 4], [8, 67, 4], [12, 65, 2], [14, 67, 2]],  // G13: B G F G
  [[0, 76, 4], [6, 74, 2], [8, 72, 4], [14, 71, 2]],   // Cmaj9: E D C B
  [[0, 69, 8], [10, 72, 4], [14, 76, 2]],              // Am7: A, C, then up to E
];

export function createRoomRecord() {
  let ctx = null, bus = null, master = null, crackle = null, timer = 0, playing = false, nextTime = 0, barIndex = 0, noteCount = 0, seed = 11, noise = null, reverbBuffer = null, runId = 0;
  const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647; // fixed seed: the same small variations every time, like a record
  const jitter = (ms) => (rnd() - 0.5) * 2 * ms / 1000;
  const vary = (gain) => gain * (0.9 + rnd() * 0.2);
  const noiseBuffer = () => { // soft noise for the drums
    if (!noise) { const length = Math.floor(ctx.sampleRate * 0.5); noise = ctx.createBuffer(1, length, ctx.sampleRate); const data = noise.getChannelData(0); for (let i = 0; i < length; i++) data[i] = rnd() * 2 - 1; }
    return noise;
  };
  const kick = (time, gain) => { // a sine that drops fast in pitch, with a short click
    const osc = ctx.createOscillator(), g = ctx.createGain(); osc.type = "sine"; osc.frequency.setValueAtTime(150, time); osc.frequency.exponentialRampToValueAtTime(46, time + 0.13);
    g.gain.setValueAtTime(0.0001, time); g.gain.exponentialRampToValueAtTime(gain, time + 0.004); g.gain.exponentialRampToValueAtTime(0.0001, time + 0.42); osc.connect(g); g.connect(bus); osc.start(time); osc.stop(time + 0.45); noteCount += 1;
  };
  const snare = (time, gain) => { // band-passed noise with a little tone underneath
    const src = ctx.createBufferSource(), band = ctx.createBiquadFilter(), g = ctx.createGain(); src.buffer = noiseBuffer(); band.type = "bandpass"; band.frequency.value = 2100; band.Q.value = 0.7;
    g.gain.setValueAtTime(0.0001, time); g.gain.exponentialRampToValueAtTime(gain, time + 0.004); g.gain.exponentialRampToValueAtTime(0.0001, time + 0.2); src.connect(band); band.connect(g); g.connect(bus); src.start(time); src.stop(time + 0.25);
    const osc = ctx.createOscillator(), og = ctx.createGain(); osc.type = "triangle"; osc.frequency.value = 188; og.gain.setValueAtTime(gain * 0.5, time); og.gain.exponentialRampToValueAtTime(0.0001, time + 0.11); osc.connect(og); og.connect(bus); osc.start(time); osc.stop(time + 0.14); noteCount += 1;
  };
  const hat = (time, gain, open) => {
    const src = ctx.createBufferSource(), high = ctx.createBiquadFilter(), g = ctx.createGain(); src.buffer = noiseBuffer(); high.type = "highpass"; high.frequency.value = 7200;
    g.gain.setValueAtTime(0.0001, time); g.gain.exponentialRampToValueAtTime(gain, time + 0.003); g.gain.exponentialRampToValueAtTime(0.0001, time + (open ? 0.24 : 0.05)); src.connect(high); high.connect(g); g.connect(bus); src.start(time); src.stop(time + 0.3);
  };
  const bass = (time, midi, gain, length) => { // a round sub bass: a sine with a quiet octave
    const out = ctx.createGain(), low = ctx.createBiquadFilter(); low.type = "lowpass"; low.frequency.value = 320;
    out.gain.setValueAtTime(0.0001, time); out.gain.exponentialRampToValueAtTime(gain, time + 0.02); out.gain.exponentialRampToValueAtTime(0.0001, time + length);
    for (const [ratio, level, type] of [[1, 1, "sine"], [2, 0.2, "triangle"]]) { const osc = ctx.createOscillator(), g = ctx.createGain(); osc.type = type; osc.frequency.value = hz(midi) * ratio; g.gain.value = level; osc.connect(g); g.connect(out); osc.start(time); osc.stop(time + length + 0.05); }
    out.connect(low); low.connect(bus); noteCount += 1;
  };
  const piano = (time, midi, gain, length, pan = 0) => { // a real piano note, or a simple synth if the samples could not load
    if (realPiano.play(ctx, bus, time, midi, gain * PIANO_K, length, pan)) { noteCount += 1; return; }
    const out = ctx.createGain(), osc = ctx.createOscillator(), osc2 = ctx.createOscillator(); osc.type = "triangle"; osc2.type = "sine"; osc.frequency.value = hz(midi); osc2.frequency.value = hz(midi) * 2;
    out.gain.setValueAtTime(0.0001, time); out.gain.exponentialRampToValueAtTime(gain, time + 0.01); out.gain.exponentialRampToValueAtTime(0.0001, time + length); osc.connect(out); osc2.connect(out); out.connect(bus); osc.start(time); osc2.start(time); osc.stop(time + length + 0.05); osc2.stop(time + length + 0.05); noteCount += 1;
  };
  const reverb = () => { // a small, dark room
    const length = Math.floor(ctx.sampleRate * 1.4), buffer = ctx.createBuffer(2, length, ctx.sampleRate);
    for (let channel = 0; channel < 2; channel++) { const data = buffer.getChannelData(channel); let last = 0; for (let i = 0; i < length; i++) { last = last * 0.55 + (rnd() * 2 - 1) * 0.45; data[i] = last * Math.pow(1 - i / length, 2.6); } }
    return buffer;
  };
  const scheduleBar = () => {
    const section = barIndex % FORM_BARS, chord = CHORDS[barIndex % 4], t0 = nextTime, at = (i) => t0 + i * STEP + (i % 2 ? SWING * STEP : 0);
    // the beat: a dusty boom-bap, the kick drops out in the breakdown
    if (section !== 12 && section !== 13) for (const i of (barIndex % 4 === 3 ? [0, 7, 10, 14] : [0, 10])) kick(at(i) + jitter(6), i === 0 ? 0.85 : 0.55);
    snare(at(4) + jitter(5), 0.5); snare(at(12) + jitter(5), 0.55); if (barIndex % 2) snare(at(15), 0.12); // the backbeat, with a ghost note
    const hatStep = section >= 8 && section <= 11 ? 1 : 2; for (let i = 0; i < BAR_STEPS; i += hatStep) hat(at(i) + jitter(4), i % 4 === 0 ? 0.13 : 0.075, false); // eighths, sixteenths in the third four bars
    if (barIndex % 4 === 3) hat(at(14), 0.12, true);
    // the sub bass
    bass(at(0), chord.bass, 0.34, STEP * 6); bass(at(7), chord.bass + (barIndex % 2 ? 7 : 0), 0.24, STEP * 2); bass(at(10), chord.bass, 0.28, STEP * 4);
    // the piano comp: a rolled chord on the one, then two short stabs
    chord.comp.forEach((midi, i) => piano(at(0) + i * 0.028 + jitter(5), midi, vary(0.075), STEP * 9, -0.15 + i * 0.1));
    for (const [i, gain, length] of [[6, 0.04, 2], [10, 0.045, 3]]) chord.comp.slice(1).forEach((midi, k) => piano(at(i) + k * 0.02, midi, vary(gain), STEP * length, 0.1 - k * 0.08));
    // the melody, a little behind the beat: absent for the first two bars, then phrase A, phrase B, then A again
    if (section >= 2) { const phrase = section >= 8 && section <= 11 ? MELODY_B : MELODY_A; for (const [i, midi, length] of phrase[barIndex % 4]) piano(at(i) + 0.014 + jitter(8), midi, vary(0.09), STEP * (length + 1), 0.2); }
    barIndex += 1; nextTime += BAR_STEPS * STEP;
    timer = setTimeout(scheduleBar, Math.max(50, (nextTime - ctx.currentTime - 0.6) * 1000));
  };
  return {
    // Call from inside a tap. Returns true if it started.
    start() {
      if (playing) return true;
      const AudioContextClass = window.AudioContext || window.webkitAudioContext; if (!AudioContextClass) return false;
      try {
        ctx ??= new AudioContextClass(); ctx.resume?.(); seed = 11;
        master = ctx.createGain(); master.gain.setValueAtTime(0.0001, ctx.currentTime); master.gain.exponentialRampToValueAtTime(0.56, ctx.currentTime + 0.6); master.connect(ctx.destination);
        const dusty = ctx.createBiquadFilter(); dusty.type = "lowpass"; dusty.frequency.value = 6500; // a little dust off the top
        const compressor = ctx.createDynamicsCompressor(); compressor.threshold.value = -18; compressor.knee.value = 8; compressor.ratio.value = 4; compressor.attack.value = 0.004; compressor.release.value = 0.14;
        bus = ctx.createGain(); bus.connect(dusty); dusty.connect(compressor); compressor.connect(master);
        const room = ctx.createConvolver(), send = ctx.createGain(), wet = ctx.createGain(); reverbBuffer ??= reverb(); room.buffer = reverbBuffer; send.gain.value = 0.16; wet.gain.value = 0.9; bus.connect(send); send.connect(room); room.connect(wet); wet.connect(master);
        crackle = ctx.createBufferSource(); const buffer = ctx.createBuffer(1, ctx.sampleRate * 3, ctx.sampleRate), data = buffer.getChannelData(0);
        for (let i = 0; i < data.length; i++) data[i] = (rnd() < 0.0005 ? (rnd() * 2 - 1) * 0.9 : 0) + (rnd() * 2 - 1) * 0.004; // a faint record crackle and a very little hiss
        crackle.buffer = buffer; crackle.loop = true; const high = ctx.createBiquadFilter(), crackleGain = ctx.createGain(); high.type = "highpass"; high.frequency.value = 1400; crackleGain.gain.value = 0.12; crackle.connect(high); high.connect(crackleGain); crackleGain.connect(master); crackle.start();
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
    state: () => ({ playing, context: ctx ? ctx.state : "none", bars: barIndex, notes: noteCount, title: "布魯克林窗台", piano: realPiano.ready() }),
  };
}
