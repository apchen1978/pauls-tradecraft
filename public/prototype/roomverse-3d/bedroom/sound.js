// Room 02's record (Paul, 2026-11-17: the bedroom is a New York room with a record player by the window; give it one piece with a Brooklyn feel, a simple rhythm, a real piano and no MIDI sound).
// "布魯克林窗台" / "Brooklyn Windowsill": a boom-bap beat at 84 beats a minute with swung sixteenths (a dusty kick and snare and a closed hat made from noise and sine sweeps, no samples), a round
// sub bass, a rolled jazz-chord comp and a laid-back pentatonic melody on a real piano (piano.js: Salamander Grand Piano, CC BY 3.0, credited on the page), over a faint record crackle. The four
// chords are Dm9, G13, Cmaj9 and Am7 (a ii-V-I-vi turn); the form is sixteen bars: two bars of beat and comp, then the melody comes in, a second melody a little higher, and a breakdown with no kick
// before it goes round again. Everything is written here note by note; nothing is borrowed. Nothing plays until the visitor taps the record corner (browsers allow sound only after a tap);
// start() must be called from inside that tap. It plays until stopped or the visitor leaves.
// Side B (Paul, 2026-11-17: a second piece for the same record): "防火梯的雨" / "Fire Escape Rain", a slow late-night turn at 68 beats a minute: a brushed backbeat, a
// soft round bass, a rolled Fmaj9 - Em7 - Dm9 - G13 comp and a sparse major-pentatonic melody on the same real piano, with a little rain on the window instead of record dust.
// Nothing is borrowed here either. next() walks the record: stopped -> side A -> flip to side B -> stopped.
import { createPiano } from "../piano.js?v=auto";
const realPiano = createPiano(), PIANO_K = 3.0; // PIANO_K scales the synth-era levels to the louder piano samples
const hz = (midi) => 440 * Math.pow(2, (midi - 69) / 12);
const BPM = 84, STEP = 60 / BPM / 4, SWING = 0.2, BAR_STEPS = 16, FORM_BARS = 32; // sixteen steps a bar; the form is the old sixteen bars, then that shape again, then a two-bar cadence
export const RECORD_A_BARS = FORM_BARS; // Room 03 plays side A once through and then moves on
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

// Side B. Same shape as side A: [step, midi, length in steps] per bar, four chords, sixteen bars.
const BPM_B = 68, SWING_B = 0.12;
const CHORDS_B = [
  { bass: 41, comp: [55, 57, 60, 64] },   // Fmaj9
  { bass: 40, comp: [55, 59, 62, 64] },   // Em7
  { bass: 38, comp: [53, 57, 60, 64] },   // Dm9
  { bass: 43, comp: [53, 59, 62, 64] },   // G13
];
const MELODY_B_A = [
  [[0, 76, 6], [8, 72, 4], [12, 69, 4]],    // Fmaj9: E C A
  [[2, 71, 4], [8, 67, 6]],                 // Em7: B G
  [[0, 69, 4], [6, 72, 2], [8, 76, 6]],     // Dm9: A C E
  [[2, 74, 4], [8, 71, 4], [12, 67, 4]],    // G13: D B G
];
const MELODY_B_B = [
  [[0, 79, 4], [6, 76, 2], [8, 72, 8]],     // Fmaj9: G E C
  [[0, 76, 6], [8, 74, 2], [10, 71, 6]],    // Em7: E D B
  [[2, 72, 4], [8, 69, 4], [12, 72, 4]],    // Dm9: C A C
  [[0, 71, 6], [8, 74, 4], [14, 76, 2]],    // G13: B D, then up to E
];
const TITLES = [{ zh: "布魯克林窗台", en: "Brooklyn Windowsill" }, { zh: "防火梯的雨", en: "Fire Escape Rain" }];

// Side A, richer (Paul, 2026-11-26: the beat and comp are good, the melody is thin and plain). The old A-B-A pentatonic loop stays below as the "classic" take
// (add ?take=classic to the page address to hear it). The new line is written bar by bar over the same four chords, all inside the C major scale:
// one motif, E-G-A (rising, then held), is asked, answered, moved up a step, and turned into a rhythm shift; the B phrase climbs to the one high G of the piece
// (bar 9) and falls back; the breakdown bars quote the old calm line; the second pass adds a third below, a soft electric piano, a bell on the peaks and a pad.
// [step, midi, length in steps] per bar; the key is the bar's place in the sixteen (bars 0 and 1 are the beat alone).
// R&B atmosphere (Paul, 2026-11-26: the first piece of Room 02 should feel like R&B). The beat and the sub bass keep their skeleton. What changes is the colour and the singing:
// a warm electric piano rolls every chord with the piano, the melody slides into its phrases and in the second pass some notes land a sixteenth early, a wordless "ooh" sits under the climb,
// and the bass glides to the next root at the end of every fourth bar.
const CLASSIC = typeof location !== "undefined" && new URLSearchParams(location.search).get("take") === "classic";
const MELODY_NEW = {
  2: [[2, 64, 3], [5, 67, 3], [8, 69, 6]],                    // Cmaj9: the motif, E G A
  3: [[2, 72, 4], [8, 71, 2], [10, 69, 6]],                   // Am7: the answer, C B A
  4: [[2, 65, 3], [5, 69, 3], [8, 72, 6]],                    // Dm9: the motif a step higher, F A C
  5: [[0, 71, 4], [6, 69, 2], [8, 67, 4], [12, 64, 4]],       // G13: it settles, B A G E
  6: [[0, 64, 2], [3, 67, 3], [6, 69, 2], [8, 72, 8]],        // Cmaj9: the motif again with a new rhythm, up to C
  7: [[2, 76, 6], [8, 74, 2], [10, 72, 6]],                   // Am7: the first peak, E D C
  8: [[0, 72, 2], [2, 74, 2], [4, 77, 4], [8, 76, 4], [12, 74, 4]],          // Dm9: B phrase, C D F E D
  9: [[0, 79, 6], [6, 77, 2], [8, 76, 4], [12, 74, 4]],       // G13: the high G, the peak of the piece
  10: [[0, 76, 4], [4, 72, 4], [8, 74, 2], [10, 72, 2], [12, 71, 4]],        // Cmaj9: falling, E C D C B
  11: [[0, 69, 8], [10, 72, 3], [13, 76, 3]],                 // Am7: A held, then a pickup up to E
  12: [[2, 69, 6], [10, 72, 2], [12, 69, 4]],                 // Dm9: the breakdown quotes the old calm line
  13: [[0, 67, 4], [6, 65, 2], [8, 64, 8]],                   // G13
  14: [[2, 64, 3], [5, 67, 3], [8, 69, 8]],                   // Cmaj9: the motif one last time
  15: [[0, 72, 6], [8, 69, 4], [12, 67, 4]],                  // Am7: C A G, into the second pass
};
const CONTOUR = { 2: .85, 3: .8, 4: .9, 5: .85, 6: .95, 7: 1, 8: 1, 9: 1.2, 10: 1.05, 11: .95, 12: .7, 13: .65, 14: .75, 15: .8 }; // how hard each bar is played: a shape, not a constant
const SCALE = [0, 2, 4, 5, 7, 9, 11]; // C major, the key of all four chords
const thirdBelow = (midi) => { const pc = ((midi % 12) + 12) % 12, i = SCALE.indexOf(pc); if (i < 0) return midi - 4; const j = i - 2, octave = Math.floor(midi / 12) + (j < 0 ? -1 : 0); return octave * 12 + SCALE[(j + 7) % 7]; };

export function createRoomRecord() {
  let side = 0, ctx = null, bus = null, master = null, crackle = null, timer = 0, playing = false, nextTime = 0, barIndex = 0, noteCount = 0, seed = 11, noise = null, reverbBuffer = null, runId = 0;
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
  const keys = (time, midi, gain, length, pan = 0) => { // a soft electric piano: a round sine with a short bell-like overtone
    const out = ctx.createGain(); out.gain.setValueAtTime(0.0001, time); out.gain.exponentialRampToValueAtTime(gain, time + 0.01); out.gain.exponentialRampToValueAtTime(0.0001, time + length);
    for (const [ratio, level, type, share] of [[1, 1, "sine", 1], [2, 0.22, "triangle", 0.6], [4, 0.1, "sine", 0.2]]) { const osc = ctx.createOscillator(), g = ctx.createGain(); osc.type = type; osc.frequency.value = hz(midi) * ratio; g.gain.setValueAtTime(level, time); g.gain.exponentialRampToValueAtTime(0.0001, time + Math.max(0.12, length * share)); osc.connect(g); g.connect(out); osc.start(time); osc.stop(time + length + 0.05); }
    const place = ctx.createStereoPanner ? ctx.createStereoPanner() : null; if (place) { place.pan.value = pan; out.connect(place); place.connect(bus); } else out.connect(bus); noteCount += 1;
  };
  const bell = (time, midi, gain, length, pan = 0) => { // a small bell on the peaks: three sine partials that die away at different speeds
    const out = ctx.createGain(); out.gain.setValueAtTime(0.0001, time); out.gain.exponentialRampToValueAtTime(gain, time + 0.004); out.gain.exponentialRampToValueAtTime(0.0001, time + length);
    for (const [ratio, level, share] of [[1, 1, 1], [2.76, 0.3, 0.4], [5.4, 0.08, 0.18]]) { const osc = ctx.createOscillator(), g = ctx.createGain(); osc.type = "sine"; osc.frequency.value = hz(midi) * ratio; g.gain.setValueAtTime(level, time); g.gain.exponentialRampToValueAtTime(0.0001, time + Math.max(0.1, length * share)); osc.connect(g); g.connect(out); osc.start(time); osc.stop(time + length + 0.05); }
    const place = ctx.createStereoPanner ? ctx.createStereoPanner() : null; if (place) { place.pan.value = pan; out.connect(place); place.connect(bus); } else out.connect(bus); noteCount += 1;
  };
  const pad = (time, midis, gain, length) => { // a slow swell of the chord under the breakdown: two softly detuned triangles a note, a low-pass, a long attack and release
    const out = ctx.createGain(), low = ctx.createBiquadFilter(); low.type = "lowpass"; low.frequency.value = 900;
    out.gain.setValueAtTime(0.0001, time); out.gain.exponentialRampToValueAtTime(gain, time + length * 0.45); out.gain.exponentialRampToValueAtTime(0.0001, time + length);
    for (const midi of midis) for (const cents of [-5, 5]) { const osc = ctx.createOscillator(); osc.type = "triangle"; osc.frequency.value = hz(midi) * Math.pow(2, cents / 1200); osc.connect(out); osc.start(time); osc.stop(time + length + 0.05); }
    out.connect(low); low.connect(bus); noteCount += 1;
  };
  const ooh = (time, midi, gain, length) => { // a wordless backing vocal: two softly detuned triangles through a vowel-like band, a slow attack, a little vibrato
    const out = ctx.createGain(), vowel = ctx.createBiquadFilter(); vowel.type = "bandpass"; vowel.frequency.value = 650; vowel.Q.value = 1.1;
    out.gain.setValueAtTime(0.0001, time); out.gain.exponentialRampToValueAtTime(gain, time + 0.25); out.gain.exponentialRampToValueAtTime(0.0001, time + length);
    const lfo = ctx.createOscillator(), depth = ctx.createGain(); lfo.frequency.value = 5.2; depth.gain.value = 3; lfo.connect(depth); lfo.start(time); lfo.stop(time + length + 0.05);
    for (const cents of [-6, 6]) { const osc = ctx.createOscillator(); osc.type = "triangle"; osc.frequency.value = hz(midi) * Math.pow(2, cents / 1200); depth.connect(osc.detune); osc.connect(out); osc.start(time); osc.stop(time + length + 0.05); }
    out.connect(vowel); vowel.connect(bus); noteCount += 1;
  };
  const slide = (time, fromMidi, toMidi, gain, length) => { // the bass glides from one root to the next
    const out = ctx.createGain(), low = ctx.createBiquadFilter(); low.type = "lowpass"; low.frequency.value = 300;
    out.gain.setValueAtTime(0.0001, time); out.gain.exponentialRampToValueAtTime(gain, time + 0.02); out.gain.exponentialRampToValueAtTime(0.0001, time + length);
    const osc = ctx.createOscillator(); osc.type = "sine"; osc.frequency.setValueAtTime(hz(fromMidi), time); osc.frequency.exponentialRampToValueAtTime(hz(toMidi), time + length * 0.8); osc.connect(out); osc.start(time); osc.stop(time + length + 0.05);
    out.connect(low); low.connect(bus); noteCount += 1;
  };
  const scheduleBarA = () => {
    if (nextTime < ctx.currentTime) nextTime = ctx.currentTime + 0.05; // after a background pause (a throttled timer or a suspended context) pick up from now instead of piling the missed notes on top of one another
    const section = barIndex % FORM_BARS, local = section < 16 ? section : Math.min(section - 16, 15), ending = section >= FORM_BARS - 2, chord = CHORDS[barIndex % 4], t0 = nextTime, at = (i) => t0 + i * STEP + (i % 2 ? SWING * STEP : 0);
    // the beat: a dusty boom-bap, the kick drops out in the breakdown and on the final two bars
    if (!ending && local !== 12 && local !== 13) for (const i of (barIndex % 4 === 3 ? [0, 7, 10, 14] : [0, 10])) kick(at(i) + jitter(6), i === 0 ? 0.85 : 0.55);
    if (!ending) { snare(at(4) + jitter(5), 0.5); snare(at(12) + jitter(5), 0.55); if (barIndex % 2) snare(at(15), 0.12); } // the backbeat, with a ghost note
    const lift = section >= 16 && section < FORM_BARS - 4; // the second pass is the fuller chorus: same hat level, sixteenths instead of eighths, then the cadence thins out
    const hatStep = !ending && (lift || (local >= 8 && local <= 11)) ? 1 : 2; for (let i = 0; i < BAR_STEPS; i += hatStep) hat(at(i) + jitter(4), i % 4 === 0 ? 0.13 : 0.075, false);
    if (!ending && barIndex % 4 === 3) hat(at(14), 0.12, true);
    // the sub bass
    bass(at(0), ending && section === FORM_BARS - 1 ? 38 : chord.bass, 0.34, STEP * (ending ? 12 : 6)); if (!ending) { bass(at(7), chord.bass + (barIndex % 2 ? 7 : 0), 0.24, STEP * 2); bass(at(10), chord.bass, 0.28, STEP * 4); }
    if (!CLASSIC && !ending && barIndex % 4 === 1) slide(at(13), chord.bass, CHORDS[(barIndex + 1) % 4].bass, 0.2, STEP * 3); // the end-of-phrase glide, an 808-style slide to the next root
    // the piano comp: a rolled chord on the one, then two short stabs
    const comp = ending && section === FORM_BARS - 1 ? [50, 53, 57, 62] : chord.comp; // the last bar is a plain D minor
    comp.forEach((midi, i) => piano(at(0) + i * 0.028 + jitter(5), midi, vary(0.075), STEP * (ending ? 14 : 9), -0.15 + i * 0.1));
    if (!ending) for (const [i, gain, length] of [[6, 0.04, 2], [10, 0.045, 3]]) chord.comp.slice(1).forEach((midi, k) => piano(at(i) + k * 0.02, midi, vary(gain), STEP * length, 0.1 - k * 0.08));
    if (!CLASSIC && !ending && local >= 2) chord.comp.forEach((midi, k) => keys(at(0) + k * 0.03 + jitter(5), midi, vary(0.03), STEP * 9, 0.25 - k * 0.1)); // a warm electric piano rolls the chord with the piano: the Rhodes colour of R&B
    // the melody, a little behind the beat: absent for the first two bars of each sixteen, then phrase A, phrase B, then A again; the last two bars cadence on D
    if (ending) { const line = section === FORM_BARS - 2 ? [[2, 69, 6], [10, 67, 4]] : [[0, 62, 14]]; for (const [i, midi, length] of line) piano(at(i) + 0.014 + jitter(8), midi, vary(0.09), STEP * (length + 1), 0.2); }
    else if (local >= 2 && CLASSIC) { const phrase = local >= 8 && local <= 11 ? MELODY_B : MELODY_A; for (const [i, midi, length] of phrase[local % 4]) piano(at(i) + 0.014 + jitter(8), midi, vary(0.09), STEP * (length + 1), 0.2); }
    else if (local >= 2) {
      // the richer take: the written line, played with a shape. Each bar has its own strength; the timing sits a little behind the beat and drifts slowly (a wave across the bars, not a random shake per note).
      const second = section >= 16, strength = (CONTOUR[local] ?? 0.8) * (second ? 1.08 : 1), lag = 0.014 + 0.011 * Math.sin(barIndex * 0.7);
      MELODY_NEW[local].forEach(([i0, midi, length], n) => {
        const i = second && i0 === 8 && n > 0 ? 7 : i0; // in the second pass the half-bar note lands a sixteenth early: a push into the beat
        const accent = n === 0 ? 1.1 : 1, time = at(i) + lag + jitter(3), gain = vary(0.09) * strength * accent;
        if (n === 0) piano(time - 0.06, midi - 1, second ? 0.035 : 0.028, 0.12, 0.2); // a scoop: a quick note a semitone under, the way a singer slides into a phrase
        piano(time, midi, gain, STEP * (length + 1), 0.2);
        if (local >= 7 && local <= 11 && length >= 6) piano(time + 0.012, thirdBelow(midi), gain * 0.55, STEP * (length + 1), -0.1); // on the long notes of the climb, a third below
        if (second && n === 0 && (local === 6 || local === 9 || local === 14)) bell(time + 0.02, midi + 12, 0.028 * strength, STEP * 10, 0.35); // a bell an octave up on the peaks of the second pass
      });
      if (second && local >= 2 && local <= 11) chord.comp.slice(1).forEach((midi, k) => { keys(at(6) + k * 0.018, midi, vary(0.026), STEP * 3, -0.25 + k * 0.12); keys(at(10) + k * 0.018, midi, vary(0.03), STEP * 4, -0.25 + k * 0.12); }); // a soft electric piano doubles the comp stabs
      if (second && local >= 8 && local <= 11) { ooh(at(0) + 0.02, chord.comp[2], 0.022, STEP * 15); ooh(at(0) + 0.03, chord.comp[3], 0.018, STEP * 15); } // a wordless "ooh" under the climb, like a backing vocal
      if (local >= 12) pad(at(0), chord.comp, second ? 0.026 : 0.02, STEP * 15); // the breakdown breathes: a slow pad under the quote of the old line
    }
    barIndex += 1; nextTime += BAR_STEPS * STEP;
    timer = setTimeout(scheduleBar, Math.max(50, (nextTime - ctx.currentTime - 0.6) * 1000));
  };
  const scheduleBarB = () => { // side B: slower, softer, more space
    if (nextTime < ctx.currentTime) nextTime = ctx.currentTime + 0.05; // after a background pause (a throttled timer or a suspended context) pick up from now instead of piling the missed notes on top of one another
    const STEPB = 60 / BPM_B / 4, section = barIndex % FORM_BARS, local = section < 16 ? section : Math.min(section - 16, 15), ending = section >= FORM_BARS - 2, chord = CHORDS_B[barIndex % 4], t0 = nextTime, at = (i) => t0 + i * STEPB + (i % 2 ? SWING_B * STEPB : 0);
    // a brushed backbeat from bar 2: a soft kick on the one (and the "and" of three on odd bars), a light snare on two and four, quiet eighth-note hats; bars 12 and 13 of each half thin out to hats
    if (!ending && local >= 2 && local !== 12 && local !== 13) { kick(at(0) + jitter(6), 0.5); if (barIndex % 2) kick(at(10) + jitter(6), 0.3); snare(at(4) + jitter(6), 0.2); snare(at(12) + jitter(6), 0.22); }
    if (local >= 2 || ending) for (let i = 0; i < BAR_STEPS; i += 2) hat(at(i) + jitter(5), i % 4 === 0 ? 0.075 : 0.045, false);
    // the bass: the root on the one, the fifth on beat three; the last bar holds F
    bass(at(0), ending && section === FORM_BARS - 1 ? 41 : chord.bass, 0.3, STEPB * (ending ? 14 : 7)); if (!ending) bass(at(8), chord.bass + 7, 0.2, STEPB * 5);
    // the piano comp: one long rolled chord, a quieter answer on beat three
    const comp = ending && section === FORM_BARS - 1 ? [53, 57, 60, 65] : chord.comp; // Fmaj7, the home chord
    comp.forEach((midi, i) => piano(at(0) + i * 0.035 + jitter(6), midi, vary(0.062), STEPB * (ending ? 14 : 12), -0.15 + i * 0.1));
    if (!ending) chord.comp.slice(1).forEach((midi, k) => piano(at(8) + k * 0.024, midi, vary(0.032), STEPB * 7, 0.1 - k * 0.08));
    // the melody, high and slow: absent for the first two bars of each half, phrase A, then the higher phrase B, then A again; the last two bars cadence on F
    if (ending) { const line = section === FORM_BARS - 2 ? [[2, 72, 6], [10, 71, 4]] : [[0, 65, 14]]; for (const [i, midi, length] of line) piano(at(i) + 0.018 + jitter(9), midi, vary(0.085), STEPB * (length + 1), 0.2); }
    else if (local >= 2) { const phrase = local >= 8 && local <= 11 ? MELODY_B_B : MELODY_B_A; for (const [i, midi, length] of phrase[local % 4]) piano(at(i) + 0.018 + jitter(9), midi, vary(0.085), STEPB * (length + 1), 0.2); }
    barIndex += 1; nextTime += BAR_STEPS * STEPB;
    timer = setTimeout(scheduleBar, Math.max(50, (nextTime - ctx.currentTime - 0.6) * 1000));
  };
  const scheduleBar = () => (side === 1 ? scheduleBarB() : scheduleBarA());
  return {
    // Call from inside a tap. Returns true if it started.
    start(which = 0) {
      if (playing) return true;
      side = which === 1 ? 1 : 0;
      const AudioContextClass = window.AudioContext || window.webkitAudioContext; if (!AudioContextClass) return false;
      try {
        ctx ??= new AudioContextClass(); ctx.resume?.(); seed = 11;
        master = ctx.createGain(); master.gain.setValueAtTime(0.0001, ctx.currentTime); master.gain.exponentialRampToValueAtTime(side ? 0.8 : 0.56, ctx.currentTime + 0.6); master.connect(ctx.destination);
        const dusty = ctx.createBiquadFilter(); dusty.type = "lowpass"; dusty.frequency.value = 6500; // a little dust off the top
        const compressor = ctx.createDynamicsCompressor(); compressor.threshold.value = -18; compressor.knee.value = 8; compressor.ratio.value = 4; compressor.attack.value = 0.004; compressor.release.value = 0.14;
        bus = ctx.createGain(); bus.connect(dusty); dusty.connect(compressor); compressor.connect(master);
        const room = ctx.createConvolver(), send = ctx.createGain(), wet = ctx.createGain(); reverbBuffer ??= reverb(); room.buffer = reverbBuffer; send.gain.value = 0.16; wet.gain.value = 0.9; bus.connect(send); send.connect(room); room.connect(wet); wet.connect(master);
        crackle = ctx.createBufferSource(); const buffer = ctx.createBuffer(1, ctx.sampleRate * 3, ctx.sampleRate), data = buffer.getChannelData(0);
        for (let i = 0; i < data.length; i++) data[i] = (rnd() < (side ? 0.0002 : 0.0005) ? (rnd() * 2 - 1) * 0.9 : 0) + (rnd() * 2 - 1) * (side ? 0.02 : 0.004); // side A: a faint record crackle and a very little hiss; side B: fewer pops and a soft steady hush, like rain on the window
        crackle.buffer = buffer; crackle.loop = true; const high = ctx.createBiquadFilter(), crackleGain = ctx.createGain(); high.type = "highpass"; high.frequency.value = 1400; crackleGain.gain.value = 0.12; crackle.connect(high); high.connect(crackleGain); crackleGain.connect(master); crackle.start();
        playing = true; barIndex = 0; noteCount = 0; const run = ++runId;
        realPiano.load(ctx).then(() => { if (!playing || run !== runId) return; nextTime = ctx.currentTime + 0.25; scheduleBar(); }); // the piano samples load on the first tap (about 1 MB, once); the first bar waits for them
        return true;
      } catch { playing = false; return false; }
    },
    resume() { try { if (playing && ctx && ctx.state !== "running") ctx.resume(); } catch { /* ignore */ } },
    stop() {
      if (!playing) return;
      playing = false; clearTimeout(timer); timer = 0;
      const old = master, oldCrackle = crackle;
      try { old.gain.cancelScheduledValues(ctx.currentTime); old.gain.setValueAtTime(Math.max(0.0001, old.gain.value), ctx.currentTime); old.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.7); } catch { /* the graph may already be gone */ }
      setTimeout(() => { try { oldCrackle?.stop(); old?.disconnect(); } catch { /* already stopped */ } }, 1500);
    },
    // One tap walks the record: stopped -> side A -> flip to side B -> stopped. Call from inside a tap. Returns what is now playing: 0 = side A, 1 = side B, -1 = stopped (or could not start).
    next() {
      if (!playing) return this.start(0) ? 0 : -1;
      if (side === 0) { this.stop(); return this.start(1) ? 1 : -1; }
      this.stop(); return -1;
    },
    state: () => ({ playing, side, context: ctx ? ctx.state : "none", bars: barIndex, notes: noteCount, title: TITLES[side].zh, titleEn: TITLES[side].en, piano: realPiano.ready() }),
  };
}
