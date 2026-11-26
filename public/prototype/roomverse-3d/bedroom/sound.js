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
// The melody voice (Paul, 2026-11-26: the piano on top does not blend with the low, dark beat and comp; try other instruments). ?lead=rhodes (the default), organ, sax, guitar or piano on the page
// address picks it, so the voices can be compared on the same link. LEAD_K evens the levels out against the piano. On the synthesized voices the first note of a phrase slides up into pitch
// from a semitone below, the way a singer or a horn does (the old semitone grace note on the piano clashed with the chord and is gone).
let LEAD = (() => { const v = typeof location !== "undefined" ? new URLSearchParams(location.search).get("lead") : null; return ["orchestra", "rhodes", "sax", "guitar", "piano"].includes(v) ? v : "orchestra"; })(); // the organ voice below is kept in the code but not offered for now (Paul, 2026-11-27)
let SECTION_NOW = 0; // the bar of the form being scheduled, so the orchestral voice can bring in the horns at the answer
const LEAD_K = { orchestra: 0.7, orchestraHorn: 0.4, rhodes: 0.53, organ: 0.7, sax: 0.47, guitar: 1.3 };
const CLASSIC = typeof location !== "undefined" && new URLSearchParams(location.search).get("take") === "classic";
// The story of the 32 bars (Paul 2026-11-27: it needs a strong sense of narrative and feeling; the organ should come in after the middle; lay a light sustained layer under the melody to glue it to the chords).
// Bars 0 to 7: the room alone, just the groove and the chords, with one faint bell at bar 7 as a hint. 8 to 11: the organ comes in softly (the question). 12 to 15: the breath, the drums thin out, one long note.
// 16 to 23: the answer, fuller, climbing to the one high A at bar 20 and then falling. 24 to 29: the memory, the first motif (E G) comes back quietly. 30 and 31 land on D.
// [step, midi, length in steps], keyed by the bar's place in the 32. The kick sits on steps 0 and 10 and the snare on 4 and 12, so the licks come in after the snare (6), on the half bar (8) and as pickups (14).
// Every note is a chord tone or an extension of the chord of its bar (bars cycle Dm9, G13, Cmaj9, Am7, starting with Dm9 at bar 0).
const LICKS = {
  8: [[8, 69, 7]],                                 // Dm9: the organ enters on one long A, swelling in
  9: [[6, 71, 2], [9, 67, 6]],                     // G13: B, then G
  10: [[6, 64, 2], [8, 67, 5]],                    // Cmaj9: the motif, E G
  11: [[6, 69, 2], [8, 72, 4], [14, 76, 2]],       // Am7: A C, and a pickup E
  12: [],                                          // Dm9: the breath, nothing but the layer
  13: [[8, 67, 8]],                                // G13: one long G
  14: [],                                          // Cmaj9: silence again
  15: [[12, 72, 2], [14, 76, 2]],                  // Am7: C E, breathing in
  16: [[6, 77, 4], [12, 74, 3]],                   // Dm9: the answer begins, F then D
  17: [[6, 79, 6], [12, 76, 3]],                   // G13: G, then E
  18: [[8, 76, 6]],                                // Cmaj9: E held
  19: [[6, 73, 2], [8, 76, 4], [14, 79, 2]],       // A7(b9): C# E, and a pickup G (the 7th): the climb, pulled up to the peak
  20: [[8, 81, 8]],                                // Dm9: the one high A, the peak of the piece
  21: [[6, 79, 3], [9, 77, 3], [12, 74, 3]],       // Bbmaj7 (borrowed): G F D, the 6th, the 5th and the 3rd, falling away
  22: [[8, 74, 3], [11, 72, 5]],                   // Cmaj9: D C
  23: [[6, 72, 2], [8, 69, 6]],                    // Am7: C A, settling
  24: [[8, 65, 8]],                                // Dm9: the memory begins on a held F
  25: [[6, 67, 2], [9, 64, 6]],                    // G13: G then E
  26: [[6, 64, 2], [8, 67, 6]],                    // Cmaj9: the first motif comes back, E G
  27: [[8, 69, 8]],                                // Am7: A held
  28: [[8, 69, 4], [12, 65, 3]],                   // Dm9: A F
  29: [[6, 67, 2], [8, 64, 6]],                    // G13: G E, then the last two bars land on D
};
const STRENGTH = { 8: .7, 9: .75, 10: .8, 11: .85, 13: .75, 15: .8, 16: .9, 17: 1, 18: .95, 19: 1, 20: 1.3, 21: 1.1, 22: .95, 23: .85, 24: .75, 25: .7, 26: .8, 27: .7, 28: .65, 29: .6 }; // how hard each bar is played: a shape with one peak
// The harmony at the peak (Paul 2026-11-27: borrow a chord there, or add a turnaround). Bar 19 turns Am7 into A7(b9), the dominant that pulls the line up to the high A over Dm9 at bar 20 (the same chord Series Night uses before its wave);
// bar 21 turns G13 into Bbmaj7, a chord borrowed from the minor key, which falls to C on the next bar and gives the descent a bitter-sweet colour. The beat, the bass pattern and the comp rhythm stay as they were.
const CLIMAX_CHORDS = { 19: { bass: 45, comp: [55, 58, 61, 64] }, 21: { bass: 46, comp: [58, 62, 65, 69] } }; // A7(b9): G Bb C# E over A; Bbmaj7: Bb D F A
const SCALE = [0, 2, 4, 5, 7, 9, 11]; // C major, the key of all four chords
const thirdBelow = (midi) => { const pc = ((midi % 12) + 12) % 12, i = SCALE.indexOf(pc); if (i < 0) return midi - 4; const j = i - 2, octave = Math.floor(midi / 12) + (j < 0 ? -1 : 0); return octave * 12 + SCALE[(j + 7) % 7]; };

export function createRoomRecord() {
  let side = 0, ctx = null, bus = null, master = null, crackle = null, timer = 0, playing = false, nextTime = 0, barIndex = 0, noteCount = 0, seed = 11, noise = null, reverbBuffer = null, hallBuffer = null, hallSend = null, runId = 0;
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
  const hall = () => { // a longer, softer, darker tail only the melody sings into, so it floats above the groove
    const length = Math.floor(ctx.sampleRate * 2.8), buffer = ctx.createBuffer(2, length, ctx.sampleRate);
    for (let channel = 0; channel < 2; channel++) { const data = buffer.getChannelData(channel); let a = 0, b = 0; for (let i = 0; i < length; i++) { a = a * 0.86 + (rnd() * 2 - 1) * 0.14; b = b * 0.6 + a * 0.4; data[i] = b * 2.2 * Math.pow(1 - i / length, 2.2) * Math.min(1, i / (ctx.sampleRate * 0.05)); } }
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
  const leadOut = (node, pan) => { const place = ctx.createStereoPanner ? ctx.createStereoPanner() : null; if (place) { place.pan.value = pan; node.connect(place); place.connect(bus); } else node.connect(bus); if (hallSend && !CLASSIC) node.connect(hallSend); noteCount += 1; };
  const bend = (osc, time, midi, scoop, ratio = 1) => { if (scoop) { osc.frequency.setValueAtTime(hz(midi - 1) * ratio, time); osc.frequency.exponentialRampToValueAtTime(hz(midi) * ratio, time + 0.07); } else osc.frequency.setValueAtTime(hz(midi) * ratio, time); };
  const vib = (osc, time, length, cents, rate, delay) => { const lfo = ctx.createOscillator(), amount = ctx.createGain(); lfo.frequency.value = rate; amount.gain.setValueAtTime(0, time); amount.gain.linearRampToValueAtTime(cents, time + delay + 0.3); lfo.connect(amount); amount.connect(osc.detune); lfo.start(time); lfo.stop(time + length + 0.3); };
  const rhodes = (time, midi, g, length, pan, scoop) => { // a Rhodes-style electric piano: an FM tine that barks at the attack and then rounds off, with a light vibrato
    const out = ctx.createGain(), tone = ctx.createBiquadFilter(), end = time + Math.max(0.3, length); tone.type = "lowpass"; tone.frequency.value = 3000;
    out.gain.setValueAtTime(0.0001, time); out.gain.exponentialRampToValueAtTime(g, time + 0.006); out.gain.exponentialRampToValueAtTime(g * 0.55, time + 0.45); out.gain.setValueAtTime(g * 0.55, Math.max(time + 0.46, end - 0.1)); out.gain.exponentialRampToValueAtTime(0.0001, end + 0.25);
    const car = ctx.createOscillator(), mod = ctx.createOscillator(), index = ctx.createGain(); car.type = "sine"; mod.type = "sine"; bend(car, time, midi, scoop); mod.frequency.value = hz(midi);
    index.gain.setValueAtTime(hz(midi) * 1.6, time); index.gain.exponentialRampToValueAtTime(hz(midi) * 0.12, time + 0.55); mod.connect(index); index.connect(car.frequency); vib(car, time, length, 5, 5.2, 0.35);
    const tine = ctx.createOscillator(), tineGain = ctx.createGain(); tine.type = "sine"; tine.frequency.value = hz(midi) * 4; tineGain.gain.setValueAtTime(g * 0.22, time); tineGain.gain.exponentialRampToValueAtTime(0.0001, time + 0.16); tine.connect(tineGain); tineGain.connect(out);
    car.connect(out); out.connect(tone); for (const o of [car, mod, tine]) { o.start(time); o.stop(end + 0.35); } leadOut(tone, pan);
  };
  const organ = (time, midi, g, length, pan, scoop) => { // a drawbar organ: the 16', 5 1/3' and 8' bars full (the soul and gospel "888" setting), a third-harmonic percussion that dies away, a short key click,
    // a chorus-vibrato, a slow Leslie-like sway, and a long note swells a little after the attack
    const out = ctx.createGain(), sway = ctx.createGain(), tone = ctx.createBiquadFilter(), end = time + Math.max(0.3, length); tone.type = "lowpass"; tone.frequency.value = 5200;
    const peak = length > 0.7 ? g * 1.12 : g;
    out.gain.setValueAtTime(0.0001, time); out.gain.exponentialRampToValueAtTime(g * 0.9, time + 0.012); out.gain.exponentialRampToValueAtTime(peak, time + Math.min(0.5, length * 0.5)); out.gain.setValueAtTime(peak, end); out.gain.exponentialRampToValueAtTime(0.0001, end + 0.1);
    const lfo = ctx.createOscillator(), depth = ctx.createGain(); lfo.frequency.value = 6.1; depth.gain.value = 0.06; sway.gain.value = 0.94; lfo.connect(depth); depth.connect(sway.gain); lfo.start(time); lfo.stop(end + 0.3);
    const vibrato = ctx.createOscillator(), vibratoDepth = ctx.createGain(); vibrato.frequency.value = 6.8; vibratoDepth.gain.value = 5; vibrato.connect(vibratoDepth); vibrato.start(time); vibrato.stop(end + 0.3);
    for (const [ratio, level] of [[0.5, 0.9], [1.5, 0.75], [1, 1], [2, 0.18], [3, 0.12]]) for (const cents of [-4, 4]) { const osc = ctx.createOscillator(), pg = ctx.createGain(); osc.type = "sine"; bend(osc, time, midi, scoop, ratio); osc.detune.value = cents; vibratoDepth.connect(osc.detune); pg.gain.value = level / 5.5; osc.connect(pg); pg.connect(out); osc.start(time); osc.stop(end + 0.3); }
    const perc = ctx.createOscillator(), percGain = ctx.createGain(); perc.type = "sine"; perc.frequency.value = hz(midi) * 3; percGain.gain.setValueAtTime(g * 0.35, time); percGain.gain.exponentialRampToValueAtTime(0.0001, time + 0.2); perc.connect(percGain); percGain.connect(out); perc.start(time); perc.stop(time + 0.25);
    const click = ctx.createBufferSource(), clickBand = ctx.createBiquadFilter(), clickGain = ctx.createGain(); click.buffer = noiseBuffer(); clickBand.type = "bandpass"; clickBand.frequency.value = 2800; clickBand.Q.value = 0.9; clickGain.gain.setValueAtTime(g * 0.1, time); clickGain.gain.exponentialRampToValueAtTime(0.0001, time + 0.012); click.connect(clickBand); clickBand.connect(clickGain); clickGain.connect(out); click.start(time); click.stop(time + 0.03);
    out.connect(sway); sway.connect(tone); leadOut(tone, pan);
  };
  const sax = (time, midi, g, length, pan, scoop) => { // a breathy synthesized saxophone: saw and square through two vowel-like bands, a late vibrato, a puff of breath, a scoop up into the pitch
    const out = ctx.createGain(), mix = ctx.createGain(), low = ctx.createBiquadFilter(), band1 = ctx.createBiquadFilter(), band2 = ctx.createBiquadFilter(), gain1 = ctx.createGain(), gain2 = ctx.createGain(), end = time + Math.max(0.3, length);
    low.type = "lowpass"; low.frequency.value = 2400; band1.type = "bandpass"; band1.frequency.value = 700; band1.Q.value = 2; band2.type = "bandpass"; band2.frequency.value = 1150; band2.Q.value = 3; gain1.gain.value = 1; gain2.gain.value = 0.7;
    out.gain.setValueAtTime(0.0001, time); out.gain.exponentialRampToValueAtTime(g, time + 0.045); out.gain.setValueAtTime(g * 0.9, Math.max(time + 0.05, end - 0.08)); out.gain.exponentialRampToValueAtTime(0.0001, end + 0.08);
    for (const [type, level] of [["sawtooth", 1], ["square", 0.4]]) { const osc = ctx.createOscillator(), og = ctx.createGain(); osc.type = type; bend(osc, time, midi, scoop); vib(osc, time, length, 14, 5.3, 0.2); og.gain.value = level; osc.connect(og); og.connect(mix); osc.start(time); osc.stop(end + 0.3); }
    mix.connect(band1); mix.connect(band2); band1.connect(gain1); band2.connect(gain2); gain1.connect(low); gain2.connect(low); low.connect(out);
    const breath = ctx.createBufferSource(), air = ctx.createBiquadFilter(), airGain = ctx.createGain(); breath.buffer = noiseBuffer(); air.type = "bandpass"; air.frequency.value = 2600; air.Q.value = 0.8; airGain.gain.setValueAtTime(g * 0.12, time); airGain.gain.exponentialRampToValueAtTime(0.0001, time + 0.14); breath.connect(air); air.connect(airGain); airGain.connect(out); breath.start(time); breath.stop(time + 0.2);
    leadOut(out, pan);
  };
  const guitar = (time, midi, g, length, pan) => { // a clean plucked string (Karplus-Strong): a short burst of noise circling a delay line that loses a little energy each time round
    const rate = ctx.sampleRate, size = Math.max(2, Math.round(rate / hz(midi))), seconds = Math.min(2.4, length + 0.5), total = Math.floor(rate * seconds), buffer = ctx.createBuffer(1, total, rate), data = buffer.getChannelData(0), line = new Float32Array(size);
    let prev = 0; for (let i = 0; i < size; i++) { prev = prev * 0.5 + (rnd() * 2 - 1) * 0.5; line[i] = prev; }
    for (let i = 0, k = 0; i < total; i++) { const a = line[k], b = line[(k + 1) % size]; data[i] = a; line[k] = (a + b) * 0.5 * 0.998; k = (k + 1) % size; }
    const src = ctx.createBufferSource(), tone = ctx.createBiquadFilter(), out = ctx.createGain(); src.buffer = buffer; tone.type = "lowpass"; tone.frequency.value = 2400;
    out.gain.setValueAtTime(g, time); out.gain.setValueAtTime(g, time + Math.max(0.2, length)); out.gain.exponentialRampToValueAtTime(0.0001, time + Math.max(0.25, length) + 0.25);
    src.connect(tone); tone.connect(out); src.start(time); leadOut(out, pan);
  };
  const bowed = (recipe) => (time, midi, g, length, pan, scoop) => { // a bowed or blown sustain: detuned saws through a low-pass with a slow attack and a late vibrato
    const out = ctx.createGain(), low = ctx.createBiquadFilter(), end = time + Math.max(0.35, length); low.type = "lowpass"; low.frequency.value = recipe.lowpass;
    out.gain.setValueAtTime(0.0001, time); out.gain.exponentialRampToValueAtTime(g, time + recipe.attack); out.gain.setValueAtTime(g, Math.max(time + recipe.attack + 0.01, end - 0.12)); out.gain.exponentialRampToValueAtTime(0.0001, end + 0.25);
    for (const [ratio, level, type] of recipe.partials) { const osc = ctx.createOscillator(), og = ctx.createGain(); osc.type = type; bend(osc, time, midi, scoop, ratio); vib(osc, time, length, recipe.vibrato, 5.2, 0.3); og.gain.value = level; osc.connect(og); og.connect(out); osc.start(time); osc.stop(end + 0.4); }
    out.connect(low); leadOut(low, pan);
  };
  const strings = bowed({ partials: [[1, 0.6, "sawtooth"], [1.005, 0.4, "sawtooth"]], lowpass: 1300, attack: 0.25, vibrato: 9 }); // the string lead of Series Night
  const horn = bowed({ partials: [[1, 0.55, "sawtooth"], [1.004, 0.4, "sawtooth"], [0.5, 0.18, "square"]], lowpass: 1700, attack: 0.1, vibrato: 5 }); // its horn
  const leadVoices = { rhodes, organ, sax, guitar };
  const lead = (time, midi, gain, length, pan, scoop) => {
    if (LEAD === "orchestra") { // the way Series Night plays its melody: piano for the attack, strings for the sustain, and horns an octave below at the answer
      piano(time, midi, gain * 0.8, length, pan);
      strings(time, midi, gain * LEAD_K.orchestra, length + 0.3, pan * 0.6, scoop);
      if (SECTION_NOW >= 16 && SECTION_NOW <= 23) horn(time + 0.01, midi - 12, gain * LEAD_K.orchestraHorn, length, pan * 0.4, false);
      return;
    }
    const voice = leadVoices[LEAD]; if (!voice) { piano(time, midi, gain, length, pan); return; } voice(time, midi, gain * LEAD_K[LEAD], length, pan, scoop); };
  const sub808 = (time, midi, gain, length) => { // an 808-style kick: a sine that drops fast in pitch to the note and then rings on as a sub bass
    const out = ctx.createGain(), low = ctx.createBiquadFilter(); low.type = "lowpass"; low.frequency.value = 220;
    out.gain.setValueAtTime(0.0001, time); out.gain.exponentialRampToValueAtTime(gain, time + 0.006); out.gain.exponentialRampToValueAtTime(gain * 0.6, time + 0.12); out.gain.exponentialRampToValueAtTime(0.0001, time + length);
    const osc = ctx.createOscillator(); osc.type = "sine"; osc.frequency.setValueAtTime(hz(midi) * 3, time); osc.frequency.exponentialRampToValueAtTime(hz(midi), time + 0.05); osc.connect(out); osc.start(time); osc.stop(time + length + 0.05);
    out.connect(low); low.connect(bus); noteCount += 1;
  };
  const riser = (time, length, gain) => { // a rising wash of noise: the room breathing in before the drop
    const src = ctx.createBufferSource(), band = ctx.createBiquadFilter(), out = ctx.createGain(); src.buffer = noiseBuffer(); src.loop = true; band.type = "bandpass"; band.Q.value = 0.8;
    band.frequency.setValueAtTime(500, time); band.frequency.exponentialRampToValueAtTime(7000, time + length);
    out.gain.setValueAtTime(0.0001, time); out.gain.exponentialRampToValueAtTime(gain, time + length); out.gain.exponentialRampToValueAtTime(0.0001, time + length + 0.04);
    src.connect(band); band.connect(out); out.connect(bus); src.start(time); src.stop(time + length + 0.1); noteCount += 1;
  };
  const impact = (time, gain) => { // the light switching on: a soft burst of air and a deep sub that rings
    const src = ctx.createBufferSource(), high = ctx.createBiquadFilter(), out = ctx.createGain(); src.buffer = noiseBuffer(); src.loop = true; high.type = "highpass"; high.frequency.value = 3000;
    out.gain.setValueAtTime(gain, time); out.gain.exponentialRampToValueAtTime(0.0001, time + 1.6); src.connect(high); high.connect(out); out.connect(bus); src.start(time); src.stop(time + 1.7); noteCount += 1;
  };
  const scheduleBarA = () => {
    if (nextTime < ctx.currentTime) nextTime = ctx.currentTime + 0.05; // after a background pause (a throttled timer or a suspended context) pick up from now instead of piling the missed notes on top of one another
    const section = barIndex % FORM_BARS, local = section < 16 ? section : Math.min(section - 16, 15), ending = section >= FORM_BARS - 2, chord = (!CLASSIC && CLIMAX_CHORDS[section]) || CHORDS[barIndex % 4], t0 = nextTime, at = (i) => t0 + i * STEP + (i % 2 ? SWING * STEP : 0);
    // the beat: a dusty boom-bap, the kick drops out in the breakdown and on the final two bars
    const pull = !CLASSIC && section === 15; // the one bar before the answer: only the piano and the bass, then the drums and strings arrive together
    if (!ending && !pull && local !== 12 && local !== 13) for (const i of (barIndex % 4 === 3 ? [0, 7, 10, 14] : [0, 10])) kick(at(i) + jitter(6), i === 0 ? 0.85 : 0.55);
    if (!CLASSIC && !ending && section >= 16 && local !== 12 && local !== 13) for (const i of (barIndex % 4 === 3 ? [0, 7, 10, 14] : [0, 10])) sub808(at(i) + jitter(3), chord.bass, (i === 0 ? 0.3 : 0.2) * (section === 20 ? 1.35 : 1), STEP * (i === 0 ? 6 : 3)); // the second half hits harder: an 808-style sub rings under every kick
    if (!ending && !pull) { snare(at(4) + jitter(5), 0.5); snare(at(12) + jitter(5), 0.55); if (barIndex % 2) snare(at(15), 0.12); } // the backbeat, with a ghost note
    const lift = section >= 16 && section < FORM_BARS - 4; // the second pass is the fuller chorus: same hat level, sixteenths instead of eighths, then the cadence thins out
    const hatStep = !ending && (lift || (local >= 8 && local <= 11)) ? 1 : 2; for (let i = 0; i < BAR_STEPS; i += hatStep) if (!pull) hat(at(i) + jitter(4), i % 4 === 0 ? 0.13 : 0.075, false);
    if (!ending && !pull && barIndex % 4 === 3) hat(at(14), 0.12, true);
    // the sub bass
    bass(at(0), ending && section === FORM_BARS - 1 ? 38 : chord.bass, 0.34, STEP * (ending ? 12 : 6)); if (!ending && !pull) { bass(at(7), chord.bass + (barIndex % 2 ? 7 : 0), 0.24, STEP * 2); bass(at(10), chord.bass, 0.28, STEP * 4); }
    if (!CLASSIC && !ending && barIndex % 4 === 1) slide(at(13), chord.bass, CHORDS[(barIndex + 1) % 4].bass, 0.2, STEP * 3); // the end-of-phrase glide, an 808-style slide to the next root
    // the piano comp: a rolled chord on the one, then two short stabs
    const comp = ending && section === FORM_BARS - 1 ? [50, 53, 57, 62] : chord.comp; // the last bar is a plain D minor
    comp.forEach((midi, i) => piano(at(0) + i * 0.028 + jitter(5), midi, vary(0.075), STEP * (ending ? 14 : 9), -0.15 + i * 0.1));
    if (!ending && !pull) for (const [i, gain, length] of [[6, 0.04, 2], [10, 0.045, 3]]) chord.comp.slice(1).forEach((midi, k) => piano(at(i) + k * 0.02, midi, vary(gain), STEP * length, 0.1 - k * 0.08));
    if (!CLASSIC && !ending && local >= 2) chord.comp.forEach((midi, k) => keys(at(0) + k * 0.03 + jitter(5), midi, vary(0.03), STEP * 9, 0.25 - k * 0.1)); // a warm electric piano rolls the chord with the piano: the Rhodes colour of R&B
    // the melody, a little behind the beat: absent for the first two bars of each sixteen, then phrase A, phrase B, then A again; the last two bars cadence on D
    if (ending) { const line = section === FORM_BARS - 2 ? [[2, 69, 6], [10, 67, 4]] : [[0, 62, 14]]; for (const [i, midi, length] of line) { if (CLASSIC) piano(at(i) + 0.014 + jitter(8), midi, vary(0.09), STEP * (length + 1), 0.2); else lead(at(i) + 0.03 + jitter(6), midi, vary(0.09), STEP * (length + 1), 0.2, false); } } // the last two bars land on D, in the chosen voice
    else if (local >= 2 && CLASSIC) { const phrase = local >= 8 && local <= 11 ? MELODY_B : MELODY_A; for (const [i, midi, length] of phrase[local % 4]) piano(at(i) + 0.014 + jitter(8), midi, vary(0.09), STEP * (length + 1), 0.2); }
    else if (local >= 2) {
      // The organ (or the chosen voice) tells the story above; before bar 8 the room is alone with a faint hint, and a light sustained layer of the chord glues the melody to the harmony.
      SECTION_NOW = section;
      const second = section >= 16, strength = STRENGTH[section] ?? 0.8, lag = 0.032 + 0.012 * Math.sin(barIndex * 0.7);
      (LICKS[section] || []).forEach(([i, midi, length], n) => {
        const accent = n === 0 ? 1.1 : 1, time = at(i) + lag + jitter(3), gain = vary(0.09) * strength * accent;
        lead(time, midi, gain, STEP * (length + 1), 0.2, n === 0); // the melody voice; on a synth voice the first note of a phrase slides up into pitch
        if (section >= 16 && section <= 23 && length >= 6) lead(time + 0.012, thirdBelow(midi), gain * 0.55, STEP * (length + 1), -0.1, false); // on the long notes of the answer, a third below
        if (n === 0 && (section === 17 || section === 20 || section === 26)) bell(time + 0.02, midi + 12, 0.03 * strength, STEP * 10, 0.35); // a bell an octave up on the peak and its echoes
      });
      if (section === 7) bell(at(8) + 0.03, 76, 0.02, STEP * 8, 0.3); // the faint hint of what is coming
      if (!CLASSIC && (section === 12 || section === 14)) piano(at(8) + 0.02, chord.comp[3] + 12, 0.06, STEP * 10, 0.25); // the breath: only the piano, one long high note
      else if (!CLASSIC && section >= 8 && section <= 29 && section % 2 === 1 && !(LICKS[section] || []).some(([i]) => i >= 12)) { piano(at(13) + 0.02, chord.comp[2] + 12, 0.05, STEP * 2, 0.25); piano(at(15) + 0.02, chord.comp[3] + 12, 0.045, STEP * 3, 0.3); } // the piano as an ornament: two soft high notes at the end of every other bar
      if (second && section >= 18 && section <= 27) chord.comp.slice(1).forEach((midi, k) => { keys(at(6) + k * 0.018, midi, vary(0.026), STEP * 3, -0.25 + k * 0.12); keys(at(10) + k * 0.018, midi, vary(0.03), STEP * 4, -0.25 + k * 0.12); }); // a soft electric piano doubles the comp stabs
      if (section >= 19 && section <= 22) { ooh(at(0) + 0.02, chord.comp[2], 0.022, STEP * 15); ooh(at(0) + 0.03, chord.comp[3], 0.018, STEP * 15); } // a wordless "ooh" under the climb and the peak
      if (section >= 6 && section <= 29) pad(at(0), chord.comp, section < 8 ? 0.008 : section < 12 ? 0.013 : section < 16 ? 0.022 : section === 16 ? 0.03 : section < 20 ? 0.017 : section < 24 ? 0.024 : 0.014, STEP * 15); // the light sustained layer, swelling in each bar and fullest at the peak
    }
    if (!CLASSIC && section === 15) riser(at(4), STEP * 12, 0.05); // the breath in, rising through the bar
    if (!CLASSIC && section === 16) { // the light comes on: air, a deep sub, and the strings swell in on the chord
      impact(at(0) + 0.005, 0.07); sub808(at(0), chord.bass - 12, 0.4, STEP * 10);
      chord.comp.forEach((midi, k) => strings(at(0) + k * 0.02, midi + 12, 0.034, STEP * 30, -0.3 + k * 0.2, false));
    }
    if (!CLASSIC && section === FORM_BARS - 1) { // the fade out: one soft high D rings on in the hall, a bell far above it, and the groove has left
      lead(at(6), 74, 0.04, STEP * 40, 0.2, false); bell(at(8), 86, 0.016, STEP * 40, 0.3);
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
    setLead(v) { if (["orchestra", "rhodes", "sax", "guitar", "piano"].includes(v)) LEAD = v; }, // the melody voice can be changed while the piece plays; it takes effect from the next notes
    lead() { return LEAD; },
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
        if (!CLASSIC) { const hallRoom = ctx.createConvolver(), hallWet = ctx.createGain(); hallBuffer ??= hall(); hallRoom.buffer = hallBuffer; hallSend = ctx.createGain(); hallSend.gain.value = 0.34; hallWet.gain.value = 0.8; hallSend.connect(hallRoom); hallRoom.connect(hallWet); hallWet.connect(master); }
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
