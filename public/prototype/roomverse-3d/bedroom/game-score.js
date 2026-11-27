// "Late-Night Game" (夜戰), Room 02's game-night piece and track 11 of the Music Lounge (Paul 2026-11-28: a new, intense, EDM-flavoured loop for gaming, with a pulse, maybe a saxophone;
// about a minute, so it can repeat). Written note by note in Web Audio: nothing borrowed, no samples, no licence to manage.
//   140 BPM, E minor, 32 bars (about 55 s), loops: bars 0-3 the groove comes in, 4-7 a build, 8-15 the first drop, 16-19 a breakdown with a gated pad and the saxophone, 20-23 a second build
//   with an accelerating snare roll, 24-31 the second drop; the last bar sweeps down into the first.
//   The pulse is a side-chain: every kick ducks the bass, the chords and the arpeggio and they swell back, the way an EDM mix breathes. No sound here needs a tap to be loaded; start() must still be called inside one.
// Nothing here claims how it sounds to anyone: the notes, the levels and the saxophone are for Paul's ear.

const BPM = 140, STEP = 60 / BPM / 4, BAR_STEPS = 16, FORM = 32;
const hz = (midi) => 440 * 2 ** ((midi - 69) / 12);
const LEAD_MODE = (() => { try { const v = new URLSearchParams(location.search).get("lead"); return ["sax", "synth", "both"].includes(v) ? v : "both"; } catch { return "both"; } })(); // QA: ?lead=sax|synth|both

// One chord a bar. Bars 0-3 of each eight: Em C G D; bars 4-7: Em C D B (the B major leans back into Em).
const CHORDS = [
  { bass: 40, tones: [64, 67, 71] }, { bass: 36, tones: [60, 64, 67] }, { bass: 43, tones: [62, 67, 71] }, { bass: 38, tones: [62, 66, 69] },
  { bass: 40, tones: [64, 67, 71] }, { bass: 36, tones: [60, 64, 67] }, { bass: 38, tones: [62, 66, 69] }, { bass: 35, tones: [63, 66, 71] },
];
// The hook, [step, midi, length in steps] per bar of the eight. Every note is a chord tone or a step away from one; the first four bars state the hook, the second four answer it higher and come down onto the B.
const HOOK = [
  [[0, 83, 3], [3, 81, 1], [4, 79, 4], [10, 76, 3], [13, 79, 3]],        // Em: B A G . E G
  [[0, 76, 3], [3, 79, 1], [4, 84, 4], [10, 83, 3], [13, 79, 3]],        // C: E G C B G
  [[0, 74, 3], [3, 79, 1], [4, 83, 4], [10, 81, 3], [13, 79, 3]],        // G: D G B A G
  [[0, 78, 3], [3, 81, 1], [4, 86, 4], [10, 81, 3], [13, 78, 3]],        // D: F# A D A F#
  [[0, 88, 4], [4, 86, 2], [6, 83, 2], [8, 79, 4], [12, 83, 4]],         // Em: E6 held, then D B G B (the D is the seventh, the rest chord tones)
  [[0, 84, 4], [4, 83, 2], [6, 79, 2], [8, 76, 4], [12, 79, 4]],         // C
  [[0, 86, 4], [4, 83, 2], [6, 81, 2], [8, 78, 4], [12, 81, 4]],         // D: D B A F# A (the B is the sixth)
  [[0, 83, 3], [3, 81, 1], [4, 78, 4], [8, 75, 4], [12, 71, 4]],         // B: B A F# D# B, back down to the start
];

function createGameMusic() {
  let ctx = null, master = null, mix = null, toneBus = null, duck = null, leadBus = null, drumBus = null, sendNode = null, timer = 0, playing = false, nextTime = 0, barIndex = 0, noteCount = 0, seed = 11, noise = null, reverbBuffer = null, runId = 0, level = 1;
  const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  const noiseBuffer = () => noise ??= (() => { const b = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate), d = b.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = rnd() * 2 - 1; return b; })();
  const reverb = () => { const length = Math.floor(ctx.sampleRate * 1.6), b = ctx.createBuffer(2, length, ctx.sampleRate); for (let c = 0; c < 2; c++) { const d = b.getChannelData(c); let last = 0; for (let i = 0; i < length; i++) { last = last * 0.6 + (rnd() * 2 - 1) * 0.4; d[i] = last * Math.pow(1 - i / length, 2.4); } } return b; };
  const panned = (node, pan, bus) => { if (pan && ctx.createStereoPanner) { const p = ctx.createStereoPanner(); p.pan.value = pan; node.connect(p); p.connect(bus); } else node.connect(bus); noteCount += 1; };

  // ---- drums (straight to the drum bus, so they are never ducked) ----
  const kick = (t, g) => {
    const o = ctx.createOscillator(), e = ctx.createGain(); o.type = "sine"; o.frequency.setValueAtTime(170, t); o.frequency.exponentialRampToValueAtTime(46, t + 0.11);
    e.gain.setValueAtTime(0.0001, t); e.gain.exponentialRampToValueAtTime(g, t + 0.003); e.gain.exponentialRampToValueAtTime(0.0001, t + 0.27); o.connect(e); e.connect(drumBus); o.start(t); o.stop(t + 0.32);
    const n = ctx.createBufferSource(), hp = ctx.createBiquadFilter(), ne = ctx.createGain(); n.buffer = noiseBuffer(); hp.type = "highpass"; hp.frequency.value = 2200; ne.gain.setValueAtTime(g * 0.28, t); ne.gain.exponentialRampToValueAtTime(0.0001, t + 0.018); n.connect(hp); hp.connect(ne); ne.connect(drumBus); n.start(t); n.stop(t + 0.03); noteCount += 1;
  };
  const clap = (t, g) => {
    for (const [d, k] of [[0, 1], [0.011, 0.8], [0.023, 0.9]]) { const n = ctx.createBufferSource(), bp = ctx.createBiquadFilter(), e = ctx.createGain(); n.buffer = noiseBuffer(); bp.type = "bandpass"; bp.frequency.value = 1500; bp.Q.value = 0.9; e.gain.setValueAtTime(g * k, t + d); e.gain.exponentialRampToValueAtTime(0.0001, t + d + (d > 0.02 ? 0.16 : 0.03)); n.connect(bp); bp.connect(e); e.connect(drumBus); n.start(t + d); n.stop(t + d + 0.2); }
    noteCount += 1;
  };
  const hat = (t, g, open) => { const n = ctx.createBufferSource(), hp = ctx.createBiquadFilter(), e = ctx.createGain(); n.buffer = noiseBuffer(); hp.type = "highpass"; hp.frequency.value = 7200; e.gain.setValueAtTime(g, t); e.gain.exponentialRampToValueAtTime(0.0001, t + (open ? 0.2 : 0.04)); n.connect(hp); hp.connect(e); e.connect(drumBus); n.start(t); n.stop(t + 0.25); noteCount += 1; };
  const snare = (t, g) => {
    const n = ctx.createBufferSource(), bp = ctx.createBiquadFilter(), e = ctx.createGain(); n.buffer = noiseBuffer(); bp.type = "bandpass"; bp.frequency.value = 2000; bp.Q.value = 0.7; e.gain.setValueAtTime(g, t); e.gain.exponentialRampToValueAtTime(0.0001, t + 0.13); n.connect(bp); bp.connect(e); e.connect(drumBus); n.start(t); n.stop(t + 0.16);
    const o = ctx.createOscillator(), oe = ctx.createGain(); o.type = "triangle"; o.frequency.setValueAtTime(220, t); o.frequency.exponentialRampToValueAtTime(150, t + 0.08); oe.gain.setValueAtTime(g * 0.5, t); oe.gain.exponentialRampToValueAtTime(0.0001, t + 0.1); o.connect(oe); oe.connect(drumBus); o.start(t); o.stop(t + 0.12); noteCount += 1;
  };
  const riser = (t, len, g) => { // a rising wash of noise with a sine climbing an octave and a half
    const n = ctx.createBufferSource(), bp = ctx.createBiquadFilter(), e = ctx.createGain(); n.buffer = noiseBuffer(); n.loop = true; bp.type = "bandpass"; bp.Q.value = 1.1; bp.frequency.setValueAtTime(450, t); bp.frequency.exponentialRampToValueAtTime(9000, t + len);
    e.gain.setValueAtTime(0.0001, t); e.gain.exponentialRampToValueAtTime(g, t + len); e.gain.exponentialRampToValueAtTime(0.0001, t + len + 0.05); n.connect(bp); bp.connect(e); e.connect(drumBus); n.start(t); n.stop(t + len + 0.1);
    const o = ctx.createOscillator(), oe = ctx.createGain(); o.type = "sawtooth"; o.frequency.setValueAtTime(220, t); o.frequency.exponentialRampToValueAtTime(880, t + len); oe.gain.setValueAtTime(0.0001, t); oe.gain.exponentialRampToValueAtTime(g * 0.25, t + len); oe.gain.exponentialRampToValueAtTime(0.0001, t + len + 0.05);
    const lp = ctx.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = 2600; o.connect(lp); lp.connect(oe); oe.connect(drumBus); o.start(t); o.stop(t + len + 0.1); noteCount += 1;
  };
  const downlifter = (t, len, g) => { const n = ctx.createBufferSource(), bp = ctx.createBiquadFilter(), e = ctx.createGain(); n.buffer = noiseBuffer(); n.loop = true; bp.type = "bandpass"; bp.Q.value = 1.1; bp.frequency.setValueAtTime(8000, t); bp.frequency.exponentialRampToValueAtTime(300, t + len); e.gain.setValueAtTime(g, t); e.gain.exponentialRampToValueAtTime(0.0001, t + len); n.connect(bp); bp.connect(e); e.connect(drumBus); n.start(t); n.stop(t + len + 0.05); noteCount += 1; };
  const impact = (t, g) => { // the light switching on at a drop: a burst of air and a deep sub that falls
    const n = ctx.createBufferSource(), hp = ctx.createBiquadFilter(), e = ctx.createGain(); n.buffer = noiseBuffer(); hp.type = "highpass"; hp.frequency.value = 2600; e.gain.setValueAtTime(g, t); e.gain.exponentialRampToValueAtTime(0.0001, t + 1.5); n.connect(hp); hp.connect(e); e.connect(drumBus); n.start(t); n.stop(t + 1.55);
    const o = ctx.createOscillator(), oe = ctx.createGain(); o.type = "sine"; o.frequency.setValueAtTime(95, t); o.frequency.exponentialRampToValueAtTime(32, t + 0.9); oe.gain.setValueAtTime(g * 2.2, t); oe.gain.exponentialRampToValueAtTime(0.0001, t + 1.0); o.connect(oe); oe.connect(drumBus); o.start(t); o.stop(t + 1.05); noteCount += 1;
  };

  // ---- the side-chain: the tone bus dips on every kick and swells back ----
  const pump = (t, depth, release = 0.24) => { const p = duck.gain; p.setValueAtTime(1, Math.max(0, t - 0.002)); p.linearRampToValueAtTime(depth, t + 0.006); p.linearRampToValueAtTime(1, t + release); };

  // ---- tonal voices (through the ducked tone bus unless said otherwise) ----
  const bass = (t, midi, g, len, open = 700) => { // a saw and a sine an octave under, through a low-pass that opens on the attack
    const lp = ctx.createBiquadFilter(), e = ctx.createGain(), end = t + len; lp.type = "lowpass"; lp.Q.value = 3; lp.frequency.setValueAtTime(open, t); lp.frequency.exponentialRampToValueAtTime(180, t + Math.min(len, 0.16));
    e.gain.setValueAtTime(0.0001, t); e.gain.exponentialRampToValueAtTime(g, t + 0.008); e.gain.setValueAtTime(g, Math.max(t + 0.01, end - 0.03)); e.gain.exponentialRampToValueAtTime(0.0001, end + 0.02);
    for (const [type, f, k] of [["sawtooth", hz(midi), 0.85], ["sine", hz(midi), 0.55], ["square", hz(midi) / 2, 0.18]]) { const o = ctx.createOscillator(), og = ctx.createGain(); o.type = type; o.frequency.value = f; og.gain.value = k; o.connect(og); og.connect(lp); o.start(t); o.stop(end + 0.05); }
    lp.connect(e); e.connect(toneBus); noteCount += 1;
  };
  const supersaw = (t, midis, g, len, cutoff, rise = 0) => { // five detuned saws a note: the wide EDM chord; the filter can open across the bar
    const lp = ctx.createBiquadFilter(), e = ctx.createGain(), end = t + len; lp.type = "lowpass"; lp.Q.value = 0.8; lp.frequency.setValueAtTime(cutoff, t); if (rise) lp.frequency.exponentialRampToValueAtTime(cutoff * rise, end);
    e.gain.setValueAtTime(0.0001, t); e.gain.exponentialRampToValueAtTime(g, t + 0.02); e.gain.setValueAtTime(g, Math.max(t + 0.03, end - 0.06)); e.gain.exponentialRampToValueAtTime(0.0001, end + 0.04);
    for (const m of midis) for (const cents of [-15, -7, 0, 7, 15]) { const o = ctx.createOscillator(), og = ctx.createGain(); o.type = "sawtooth"; o.frequency.value = hz(m); o.detune.value = cents; og.gain.value = 0.2 / Math.sqrt(midis.length); o.connect(og); og.connect(lp); o.start(t); o.stop(end + 0.08); }
    lp.connect(e); e.connect(toneBus); noteCount += 1;
  };
  const pluck = (t, midi, g, pan) => { // an arpeggio pluck: a saw and a square, a short filter sweep
    const lp = ctx.createBiquadFilter(), e = ctx.createGain(); lp.type = "lowpass"; lp.Q.value = 2; lp.frequency.setValueAtTime(5200, t); lp.frequency.exponentialRampToValueAtTime(900, t + 0.14);
    e.gain.setValueAtTime(0.0001, t); e.gain.exponentialRampToValueAtTime(g, t + 0.004); e.gain.exponentialRampToValueAtTime(0.0001, t + 0.16);
    for (const [type, cents] of [["sawtooth", -6], ["square", 6]]) { const o = ctx.createOscillator(), og = ctx.createGain(); o.type = type; o.frequency.value = hz(midi); o.detune.value = cents; og.gain.value = 0.5; o.connect(og); og.connect(lp); o.start(t); o.stop(t + 0.2); }
    lp.connect(e); panned(e, pan, toneBus);
  };
  const synthLead = (t, midi, g, len) => { // a bright saw lead: two detuned saws and an octave of square under a low-pass that opens a little on the attack
    const lp = ctx.createBiquadFilter(), e = ctx.createGain(), end = t + len; lp.type = "lowpass"; lp.Q.value = 1.2; lp.frequency.setValueAtTime(5200, t); lp.frequency.exponentialRampToValueAtTime(3000, t + 0.2);
    e.gain.setValueAtTime(0.0001, t); e.gain.exponentialRampToValueAtTime(g, t + 0.012); e.gain.setValueAtTime(g * 0.85, Math.max(t + 0.02, end - 0.05)); e.gain.exponentialRampToValueAtTime(0.0001, end + 0.05);
    for (const [type, f, cents, k] of [["sawtooth", 1, -9, 0.5], ["sawtooth", 1, 9, 0.5], ["square", 0.5, 0, 0.2]]) { const o = ctx.createOscillator(), og = ctx.createGain(); o.type = type; o.frequency.value = hz(midi) * f; o.detune.value = cents; og.gain.value = k; o.connect(og); og.connect(lp); o.start(t); o.stop(end + 0.08); }
    lp.connect(e); e.connect(leadBus); noteCount += 1;
  };
  const sax = (t, midi, g, len, scoop = true) => { // a saxophone-like voice: a saw and a square through two formant peaks, a little breath, a slow vibrato that arrives after the attack, and a small scoop up into the pitch
    const body = ctx.createGain(), f1 = ctx.createBiquadFilter(), f2 = ctx.createBiquadFilter(), lp = ctx.createBiquadFilter(), e = ctx.createGain(), end = t + Math.max(0.12, len);
    f1.type = "peaking"; f1.frequency.value = 850; f1.Q.value = 2.2; f1.gain.value = 7; f2.type = "peaking"; f2.frequency.value = 1650; f2.Q.value = 2.5; f2.gain.value = 6; lp.type = "lowpass"; lp.frequency.value = 3600; lp.Q.value = 0.7;
    e.gain.setValueAtTime(0.0001, t); e.gain.exponentialRampToValueAtTime(g, t + 0.03); e.gain.setValueAtTime(g * 0.9, Math.max(t + 0.05, end - 0.06)); e.gain.exponentialRampToValueAtTime(0.0001, end + 0.07);
    const lfo = ctx.createOscillator(), depth = ctx.createGain(); lfo.frequency.value = 5.6; depth.gain.setValueAtTime(0, t); depth.gain.linearRampToValueAtTime(14, t + 0.3); lfo.connect(depth); lfo.start(t); lfo.stop(end + 0.1);
    for (const [type, k] of [["sawtooth", 0.62], ["square", 0.3]]) { const o = ctx.createOscillator(), og = ctx.createGain(); o.type = type; o.frequency.value = hz(midi); if (scoop) { o.detune.setValueAtTime(-55, t); o.detune.linearRampToValueAtTime(0, t + 0.07); } depth.connect(o.detune); og.gain.value = k; o.connect(og); og.connect(body); o.start(t); o.stop(end + 0.1); }
    const br = ctx.createBufferSource(), brf = ctx.createBiquadFilter(), brg = ctx.createGain(); br.buffer = noiseBuffer(); brf.type = "bandpass"; brf.frequency.value = 3000; brf.Q.value = 0.8; brg.gain.setValueAtTime(g * 0.16, t); brg.gain.exponentialRampToValueAtTime(g * 0.04, t + 0.2); br.connect(brf); brf.connect(brg); brg.connect(body); br.start(t); br.stop(end + 0.1);
    body.connect(f1); f1.connect(f2); f2.connect(lp); lp.connect(e); panned(e, 0.12, leadBus);
  };
  const lead = (t, midi, g, len, which) => { // which: "synth", "sax" or "both"; ?lead= overrides everything for QA
    const mode = LEAD_MODE === "both" ? which : LEAD_MODE;
    if (mode === "synth" || mode === "both") synthLead(t, midi, g * (mode === "both" ? 0.55 : 1), len);
    if (mode === "sax" || mode === "both") sax(t, midi, g * 1.25, len);
  };

  const scheduleBar = () => {
    if (!playing) return;
    if (nextTime < ctx.currentTime) nextTime = ctx.currentTime + 0.05; // after a background pause pick up from now instead of piling the missed notes on top of one another
    const s = barIndex % FORM, t0 = nextTime, at = (i) => t0 + i * STEP, cb = s % 8, chord = CHORDS[cb];
    const intro = s < 4, build1 = s >= 4 && s < 8, dropA = s >= 8 && s < 16, brk = s >= 16 && s < 20, build2 = s >= 20 && s < 24, dropB = s >= 24;
    const drop = dropA || dropB, kicks = !brk, rollBar = s === 7 || (s >= 21 && s <= 23);
    // the beat: four on the floor, each kick ducking the tone bus; the second build starts it again lighter
    if (kicks) for (const i of [0, 4, 8, 12]) {
      if (s === 7 && i >= 12) continue; if (s === 23 && i >= 12) continue; if (s === 31 && i === 12) continue;
      kick(at(i), (drop ? 1.0 : intro ? 0.6 : 0.85) * (s === 20 ? 0.8 : 1)); pump(at(i), drop ? 0.1 : intro ? 0.45 : 0.25, drop ? 0.25 : 0.22);
    }
    if (s === 7 || s === 23) { /* the bar before a drop: the last beat falls silent, the riser and the roll carry it */ }
    if (!intro && !brk && !(s === 4)) for (const i of [4, 12]) { if ((s === 7 || s === 23) && i === 12) continue; clap(at(i), drop ? 0.55 : 0.4); }
    // hats: open offbeats from the start, sixteenths come in with the second half of the build and stay in the drops
    for (let i = 0; i < BAR_STEPS; i++) {
      if (brk) { if (i % 4 === 2) hat(at(i), 0.035, false); continue; }
      if (i % 4 === 2) hat(at(i), drop ? 0.11 : 0.08, true); else if ((drop || s >= 6 || build2) && i % 2 === 1) hat(at(i), drop ? 0.07 : 0.05, false);
    }
    // snare roll: bar 7 and bars 21-23, getting faster each bar
    if (rollBar) {
      const stepsPer = s === 21 ? 4 : s === 22 ? 2 : 1, start = s === 7 ? 8 : 0;
      for (let i = start; i < BAR_STEPS; i += stepsPer) { if ((s === 23) && i >= 12) break; snare(at(i), 0.12 + 0.18 * ((s === 7 ? (i - 8) / 8 : i / 16))); }
    }
    if (s === 6) riser(t0, BAR_STEPS * STEP * 2, 0.07); if (s === 22) riser(t0, BAR_STEPS * STEP * 2, 0.07); // two bars of wash into each drop
    if (s === 8 || s === 24) impact(t0, 0.09);
    if (s === 31) downlifter(at(8), STEP * 8, 0.06); // the last half bar sweeps down so the loop comes back in softly
    // the bass: a low root on the one under the groove, then offbeat pulses that the kicks duck (the "impulse")
    if (!brk) {
      const pattern = drop ? [2, 6, 7, 10, 14, 15] : [2, 6, 10, 14];
      for (const i of pattern) { if ((s === 7 || s === 23) && i >= 12) continue; bass(at(i), chord.bass, drop ? 0.5 : intro ? 0.2 : 0.36, STEP * (i % 4 === 3 ? 1 : 3), drop ? 900 : 600); }
    }
    // the chords: none in the first four bars; they rise in the build, fill the drops, gate in the breakdown
    const sawTones = chord.tones;
    if (build1 && s >= 5) supersaw(t0, sawTones, 0.22, STEP * 15.5, 800 + (s - 5) * 700, 1.7);
    if (drop) { supersaw(t0, sawTones, dropB ? 0.34 : 0.3, STEP * 15.5, 5000); supersaw(t0, sawTones.map((m) => m - 12), 0.12, STEP * 15.5, 1800); }
    if (brk) { // the gated pad: eight eighth-note pulses, the "pulse" without any kick
      for (let k = 0; k < 8; k++) supersaw(at(k * 2), sawTones, 0.16, STEP * 1.7, 3000);
    }
    if (build2) supersaw(t0, sawTones, 0.22, STEP * 15.5, 900 + (s - 20) * 800, 1.6);
    // the arpeggio: sixteenths through the chord tones, panned left and right, closed at first and open in the drops
    if (!brk || s % 2 === 0) {
      const arpTones = [...sawTones, sawTones[0] + 12], order = [0, 1, 2, 3, 2, 1, 2, 3];
      const stepSkip = brk ? 2 : 1;
      for (let i = 0; i < BAR_STEPS; i += stepSkip) { if (intro && s < 2) continue; if ((s === 7 || s === 23) && i >= 12) continue; pluck(at(i), arpTones[order[i % 8]] + 12, drop ? 0.2 : intro ? 0.08 : 0.15, i % 2 ? 0.45 : -0.45); }
    }
    // the hook: a synth lead in the first drop's first half, the saxophone answering in its second half; the saxophone solos over the breakdown; both together in the second drop
    const hookBar = HOOK[cb];
    if (s >= 8 && s < 12) hookBar.forEach(([i, m, l]) => lead(at(i), m, 0.22, STEP * (l + 0.5), "synth"));
    if (s >= 12 && s < 16) hookBar.forEach(([i, m, l]) => lead(at(i), m, 0.22, STEP * (l + 0.5), "sax"));
    if (brk) hookBar.forEach(([i, m, l]) => lead(at(i), m, 0.2, STEP * (l + 0.8), "sax"));
    if (dropB) hookBar.forEach(([i, m, l]) => lead(at(i), m, 0.25, STEP * (l + 0.5), "both"));
    barIndex += 1; nextTime += BAR_STEPS * STEP;
    timer = setTimeout(scheduleBar, Math.max(50, (nextTime - ctx.currentTime - 0.6) * 1000));
  };

  return {
    start(track = 0, options = {}) {
      if (playing) return true;
      const AudioContextClass = window.AudioContext || window.webkitAudioContext; if (!AudioContextClass) return false;
      try {
        ctx ??= new AudioContextClass(); ctx.resume?.(); seed = 11; level = options.level ?? 1;
        master = ctx.createGain(); master.gain.setValueAtTime(0.0001, ctx.currentTime); master.gain.exponentialRampToValueAtTime(0.24 * level, ctx.currentTime + (options.fade ?? 0.6)); master.connect(ctx.destination);
        const compressor = ctx.createDynamicsCompressor(); compressor.threshold.value = -14; compressor.knee.value = 10; compressor.ratio.value = 4; compressor.attack.value = 0.004; compressor.release.value = 0.12;
        mix = ctx.createGain(); mix.connect(compressor); compressor.connect(master);
        duck = ctx.createGain(); toneBus = ctx.createGain(); toneBus.connect(duck); duck.connect(mix);
        drumBus = ctx.createGain(); drumBus.connect(mix);
        leadBus = ctx.createGain(); leadBus.gain.value = 1; leadBus.connect(mix);
        const room = ctx.createConvolver(), wet = ctx.createGain(); sendNode = ctx.createGain(); reverbBuffer ??= reverb(); room.buffer = reverbBuffer; sendNode.gain.value = 0.18; wet.gain.value = 0.8;
        leadBus.connect(sendNode); sendNode.connect(room); room.connect(wet); wet.connect(master);
        playing = true; barIndex = 0; noteCount = 0; const run = ++runId; nextTime = ctx.currentTime + 0.12; scheduleBar();
        void run; return true;
      } catch { playing = false; return false; }
    },
    resume() { try { if (playing && ctx && ctx.state !== "running") ctx.resume(); } catch { /* ignore */ } },
    stop() {
      if (!playing) return;
      playing = false; clearTimeout(timer); timer = 0;
      const old = master;
      try { old.gain.cancelScheduledValues(ctx.currentTime); old.gain.setValueAtTime(Math.max(0.0001, old.gain.value), ctx.currentTime); old.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.4); } catch { /* the graph may already be gone */ }
      setTimeout(() => { try { old?.disconnect(); } catch { /* already stopped */ } }, 1500);
    },
    tracks: () => [{ zh: "夜戰", en: "Late-Night Game" }],
    state: () => ({ playing, context: ctx ? ctx.state : "none", bars: barIndex, notes: noteCount, track: 0, title: "夜戰", titleEn: "Late-Night Game", piano: false }),
  };
}
export { createGameMusic };
