// Series night (追劇夜), the epic orchestral piece (Paul, 2026-11-22). It lives here so Rooms 01, 02, 03 and 04 can all play it in their series-night mood: one engine, written note by note, no samples but the
// shared piano. See TRACKS below for the score and sound.js (Room 01) for the history. Nothing plays until the visitor taps; start() must be called from inside the tap.
import { createPiano } from "./piano.js?v=auto";
const realPiano = createPiano(), PIANO_K = 2.4; // PIANO_K scales the old synth levels to the louder piano samples
const hz = (midi) => 440 * Math.pow(2, (midi - 69) / 12); const BARS_PER_TRACK = 16; // a piece is sixteen bars
const TRACKS = [
  // Series night: "bass" is a deep pedal and a low pulse under the bar; "chord" feeds the rising ostinato and the string pad.
  // Paul 2026-11-22: series night was too gentle and its bright piano ostinato with the vibraphone sounded like temple bells. It is now an EPIC piece in D minor, 84 beats a minute: a slow build from a lone low
  // piano and tremolo strings (minor-major 7th colour, the classic spy-thriller shade, but an original melody) to a full-orchestra climax of horns, strings, pounding octaves and timpani in bars 9 to 12,
  // then a fall back to the opening. No vibraphone, no bell tones. `level` is the loudness of each bar (the dynamics).
  { title: "追劇夜", group: "night", style: "epic", bpm: 84, swing: 0, send: 0.62,
    level: [0.4, 0.46, 0.52, 0.6, 0.6, 0.7, 0.8, 0.95, 1.4, 1.45, 1.5, 1.6, 1.25, 1.0, 0.75, 0.55],
    bars: [
      { bass: 38, chord: [50, 53, 57, 61], tune: [[0, 69, 2], [2, 74, 2]] },                          // Dm(maj7): the lone, rising A to D
      { bass: 34, chord: [53, 57, 62, 65], tune: [[0, 73, 1.5], [1.5, 74, 0.5], [2, 77, 2]] },        // Bbmaj7: C# leaning in, up to F
      { bass: 43, chord: [55, 58, 62, 65], tune: [[0, 76, 2], [2, 74, 1], [3, 72, 1]] },              // Gm9: E, D, C, falling
      { bass: 45, chord: [55, 57, 61, 65], tune: [[0, 73, 2.5], [2.5, 69, 1.5]] },                    // A7b9: the tension, A below
      { bass: 38, chord: [50, 53, 57, 61], tune: [[0, 74, 2], [2, 77, 2]] },                          // Dm(maj7): horns join, quietly
      { bass: 34, chord: [53, 57, 62, 65], tune: [[0, 81, 3], [3, 79, 1]] },                          // Bbmaj7
      { bass: 43, chord: [55, 58, 62, 66], tune: [[0, 79, 2], [2, 77, 1], [3, 74, 1]] },              // Gm(maj7): the shadow
      { bass: 45, chord: [57, 62, 64, 67], tune: [[0, 76, 2], [2, 73, 2]] },                          // A7sus4: the breath before the wave (timpani roll, noise swell)
      { bass: 34, chord: [53, 58, 62, 65], tune: [[0, 82, 3], [3, 81, 1]] },                          // Bb: the climax opens, full orchestra
      { bass: 41, chord: [57, 60, 65, 69], tune: [[0, 81, 2], [2, 77, 2]] },                          // F/A
      { bass: 43, chord: [55, 58, 62, 67], tune: [[0, 79, 1.5], [1.5, 81, 0.5], [2, 82, 2]] },        // Gm
      { bass: 45, chord: [57, 61, 64, 69], tune: [[0, 85, 3], [3, 81, 1]] },                          // A: the high C#, the peak
      { bass: 38, chord: [50, 57, 62, 65], tune: [[0, 86, 2], [2, 81, 2]] },                          // Dm: the high D, coming down
      { bass: 34, chord: [53, 57, 62, 65], tune: [[0, 82, 2], [2, 79, 2]] },                          // Bb
      { bass: 40, chord: [52, 55, 58, 62], tune: [[0, 76, 2], [2, 79, 2]] },                          // Em7b5: suspended, unresolved
      { bass: 45, chord: [55, 57, 61, 65], tune: [[0, 73, 3], [3, 69, 1]] },                          // A7: back to the opening
    ] },
  // Paul 2026-11-22: Room 01's day piece used to be Room 04's slow record played faster; then a first version of this piece was too angular (Paul 2026-11-23: the melody is replaced by a relaxed, singable "family coffee day" tune in the middle of the voice, mostly stepwise with repeated little turns, no high climbs; harmony and orchestration unchanged) (and the second too sombre: Paul asked for a long sustained piano layer and a bright, cheering melody, so the phrases now climb towards high notes and end open) and too "MIDI". This one is slower (88 beats a minute) and
  // sings: long, mostly stepwise phrases, a second voice a chord tone below the melody, thick rolled chords that are left to ring, a low piano bass, a very faint warm string bed, and as little
  // synthetic sound as possible (the real piano does nearly everything; the beat has a little rubato and every note its own small timing and loudness). F major as written, played in E-flat major (see `transpose`), sixteen bars.
  { title: "窗邊的午後", group: "day", style: "sunny", bpm: 100, swing: 0, send: 0.5, transpose: -2, // Paul 2026-11-23: E-flat major (written in F, a whole tone down): rounder and warmer, the 'at home in the living room' key; G major (+2) was brighter but felt too sharp. Earlier: 92, 104 then 116 bpm; // Paul 2026-11-22: faster still (116 beats a minute; it was 92, then 104) and in G major, a whole tone up from the F major it is written in, which is brighter; `transpose` shifts every note below

    bars: [
      { bass: 41, chord: [57, 60, 64, 67], tune: [[0, 72, 1.5], [1.5, 74, 0.5], [2, 72, 1], [3, 69, 1]] },                                          // Fmaj9: C D E
      { bass: 45, chord: [55, 60, 64, 67], bass2: 50, chord2: [57, 60, 65, 69], tune: [[0, 69, 2], [2, 72, 1], [3, 70, 1]] },      // Am7 | D7: F E D
      { bass: 43, chord: [58, 62, 65, 69], tune: [[0, 67, 1.5], [1.5, 70, 0.5], [2, 69, 1], [3, 67, 1]] },                                          // Gm9: C Bb C
      { bass: 36, chord: [58, 64, 67, 70], tune: [[0, 65, 2], [2, 67, 1], [3, 64, 1]] },                                                      // C7: A G
      { bass: 41, chord: [57, 60, 64, 67], tune: [[0, 72, 1.5], [1.5, 74, 0.5], [2, 76, 1], [3, 74, 1]] },                                                      // Fmaj9: C up to F
      { bass: 46, chord: [57, 62, 65, 69], tune: [[0, 74, 2], [2, 72, 1], [3, 70, 1]] },                                          // Bbmaj7: E D C
      { bass: 45, chord: [55, 60, 64, 67], bass2: 50, chord2: [57, 60, 65, 69], tune: [[0, 69, 2], [2, 72, 1], [3, 74, 1]] },                  // Am7 | Dm7
      { bass: 43, chord: [58, 62, 65, 69], bass2: 36, chord2: [58, 64, 67, 70], tune: [[0, 70, 1.5], [1.5, 67, 0.5], [2, 64, 2]] },     // Gm7 | C7
      { bass: 38, chord: [60, 65, 69, 72], tune: [[0, 69, 2], [2, 72, 1], [3, 74, 1]] },                                          // Dm9: a step up
      { bass: 43, chord: [59, 62, 65, 69], tune: [[0, 71, 2], [2, 69, 1], [3, 67, 1]] },                                          // G7
      { bass: 36, chord: [59, 64, 67, 71], tune: [[0, 72, 3], [3, 71, 1]] },                                                      // Cmaj9
      { bass: 45, chord: [55, 60, 64, 67], tune: [[0, 72, 1.5], [1.5, 69, 0.5], [2, 67, 2]] },                                                      // Am7
      { bass: 46, chord: [57, 62, 65, 69], tune: [[0, 74, 2], [2, 77, 1], [3, 74, 1]] },                                                      // Bbmaj7
      { bass: 43, chord: [58, 62, 65, 69], bass2: 36, chord2: [58, 64, 67, 70], tune: [[0, 72, 2], [2, 70, 1], [3, 69, 1]] },     // Gm7 | C7
      { bass: 45, chord: [55, 60, 64, 67], bass2: 50, chord2: [57, 60, 65, 69], tune: [[0, 69, 1.5], [1.5, 72, 0.5], [2, 74, 1], [3, 72, 1]] },                  // Am7 | D7
      { bass: 43, chord: [58, 62, 65, 69], bass2: 36, chord2: [58, 64, 67, 70], tune: [[0, 72, 3], [3, 69, 1]] },                              // Gm7 | C7: a long C, home
    ] },
];
for (const t of TRACKS) if (t.transpose) for (const b of t.bars) { // a track may be written in one key and played in another: shift every note by `transpose` semitones
  b.bass += t.transpose; b.chord = b.chord.map((m) => m + t.transpose);
  if (b.bass2 !== undefined) b.bass2 += t.transpose; if (b.chord2) b.chord2 = b.chord2.map((m) => m + t.transpose);
  b.tune = b.tune.map(([at, m, len]) => [at, m + t.transpose, len]);
}
const nextInGroup = (index) => { for (let k = 1; k <= TRACKS.length; k++) { const j = (index + k) % TRACKS.length; if (TRACKS[j].group === TRACKS[index].group) return j; } return index; };

// synthesised voices: [frequency ratio, level, wave, how much of the note's length the partial lasts (1 = all of it)]
const EPIANO = { partials: [[1, 0.6, "sine", 1], [1.003, 0.5, "sine", 1], [2, 0.22, "sine", 0.45], [3, 0.07, "triangle", 0.25], [7, 0.035, "sine", 0.12]], attack: 0.008, lowpass: 2800 }; // only the fallback if the piano samples cannot load
const VIBES = { partials: [[1, 0.7, "sine", 1], [4, 0.28, "sine", 0.3], [10, 0.05, "sine", 0.1]], attack: 0.004, lowpass: 5200, tremolo: 0.4 }; // a vibraphone bar: a fast-fading overtone and a gentle tremolo
const BASS = { partials: [[1, 1, "sine", 1], [2, 0.28, "triangle", 0.5], [3, 0.06, "sine", 0.3]], attack: 0.015, lowpass: 700 };
const SUB = { partials: [[1, 1, "sine", 1], [2, 0.12, "sine", 0.5]], attack: 0.25, lowpass: 400 };
const STRINGS = { partials: [[1, 0.5, "sawtooth", 1], [1.007, 0.5, "sawtooth", 1]], lowpass: 1100 };
const HORN = { partials: [[1, 0.55, "sawtooth", 1], [1.004, 0.4, "sawtooth", 1], [0.5, 0.18, "square", 1]], lowpass: 1700, attack: 0.1, vibrato: 5 }; // a brass section: stacked saws, a square an octave down, a slow swell
const STR_TREM = { partials: [[1, 0.5, "sawtooth", 1], [1.006, 0.5, "sawtooth", 1]], lowpass: 1500, attack: 0.18, tremolo: 0.85, tremRate: 11 }; // strings played with a fast bow tremolo
const BASS_DRIVE = { partials: [[1, 1, "sawtooth", 1], [2, 0.3, "triangle", 0.5]], lowpass: 520, attack: 0.01 };
const FLUTE = { partials: [[1, 0.7, "sine", 1], [2, 0.12, "triangle", 0.6], [3, 0.03, "sine", 0.3]], lowpass: 3400, attack: 0.07, vibrato: 6 }; // a breathy flute: a soft sine with a touch of air
const ORGAN = { partials: [[1, 0.6, "sine", 1], [2, 0.35, "sine", 1], [3, 0.18, "sine", 1], [4, 0.1, "sine", 1], [0.5, 0.3, "sine", 1]], lowpass: 2600, attack: 0.05, tremolo: 0.25, tremRate: 6.2 }; // a drawbar organ, the gospel bed
const CELLO = { partials: [[1, 0.6, "sawtooth", 1], [1.005, 0.4, "sawtooth", 1]], lowpass: 650, attack: 0.3, vibrato: 8 };
const STRING_LEAD = { partials: [[1, 0.6, "sawtooth", 1], [1.005, 0.4, "sawtooth", 1]], lowpass: 1300, attack: 0.25, vibrato: 9 };

function createNightMusic() { // the cinematic engine, for series night
  let ctx = null, bus = null, master = null, hiss = null, sendNode = null, timer = 0, playing = false, nextTime = 0, barIndex = 0, noteCount = 0, trackIndex = 0, seed = 5, noise = null, swellNoise = null, reverbBuffer = null, playlist = false, onTrack = null, runId = 0;
  const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647; // fixed seed: the same small variations every time
  const jitter = (ms) => (rnd() - 0.5) * 2 * ms / 1000; // a human's small timing differences
  const vary = (gain) => gain * (0.88 + rnd() * 0.24); // and small loudness differences
  const panned = (node, position) => { if (!position || !ctx.createStereoPanner) return node; const panner = ctx.createStereoPanner(); panner.pan.value = position; node.connect(panner); return panner; };
  const note = (time, midi, recipe, gain, length, position = 0) => {
    const out = ctx.createGain(), filter = ctx.createBiquadFilter(), attack = recipe.attack ?? length * 0.35;
    filter.type = "lowpass"; filter.frequency.value = recipe.lowpass; filter.Q.value = 0.5;
    out.gain.setValueAtTime(0.0001, time); out.gain.exponentialRampToValueAtTime(gain, time + attack); out.gain.exponentialRampToValueAtTime(0.0001, time + length);
    for (const [ratio, level, wave, lasts] of recipe.partials) {
      const osc = ctx.createOscillator(), g = ctx.createGain(), f = hz(midi) * ratio;
      osc.type = wave; osc.detune.value = (rnd() - 0.5) * 8; osc.frequency.value = f;
      g.gain.setValueAtTime(level, time); if (lasts < 1) g.gain.exponentialRampToValueAtTime(level * 0.002, time + length * lasts);
      if (recipe.vibrato) { const lfo = ctx.createOscillator(), depth = ctx.createGain(); lfo.frequency.value = 5.2 + rnd() * 0.6; depth.gain.setValueAtTime(0, time); depth.gain.linearRampToValueAtTime(recipe.vibrato, time + 0.3); lfo.connect(depth); depth.connect(osc.detune); lfo.start(time); lfo.stop(time + length + 0.05); }
      osc.connect(g); g.connect(out); osc.start(time); osc.stop(time + length + 0.05);
    }
    let last = out;
    if (recipe.tremolo) { const trem = ctx.createGain(), lfo = ctx.createOscillator(), depth = ctx.createGain(); trem.gain.value = 1 - recipe.tremolo / 2; lfo.frequency.value = recipe.tremRate ?? 5.2; depth.gain.value = recipe.tremolo / 2; lfo.connect(depth); depth.connect(trem.gain); lfo.start(time); lfo.stop(time + length + 0.05); out.connect(trem); last = trem; }
    last.connect(filter); panned(filter, position).connect(bus); noteCount += 1;
  };
  const piano = (time, midi, gain, length, position = 0) => { if (realPiano.play(ctx, bus, time, midi, gain * PIANO_K, length, position)) { noteCount += 1; return; } note(time, midi, EPIANO, gain, length, position); }; // a real piano note, or the synth fallback
  const noiseBuffer = () => { // soft noise for the brushes and the ride
    if (!noise) { const length = Math.floor(ctx.sampleRate * 0.4); noise = ctx.createBuffer(1, length, ctx.sampleRate); const data = noise.getChannelData(0); let last = 0; for (let i = 0; i < length; i++) { last = last * 0.6 + (rnd() * 2 - 1) * 0.4; data[i] = last; } }
    return noise;
  };
  const tick = (time, gain, centre, decay) => {
    const src = ctx.createBufferSource(), filter = ctx.createBiquadFilter(), g = ctx.createGain();
    src.buffer = noiseBuffer(); filter.type = "bandpass"; filter.frequency.value = centre; filter.Q.value = 0.7;
    g.gain.setValueAtTime(0.0001, time); g.gain.exponentialRampToValueAtTime(gain, time + 0.008); g.gain.exponentialRampToValueAtTime(0.0001, time + decay);
    src.connect(filter); filter.connect(g); g.connect(bus); src.start(time); src.stop(time + decay + 0.1);
  };
  const swell = (time, length) => { // a filtered-noise rise, the film-score breath before a turn
    if (!swellNoise) { const n = Math.floor(ctx.sampleRate * 4); swellNoise = ctx.createBuffer(1, n, ctx.sampleRate); const data = swellNoise.getChannelData(0); let last = 0; for (let i = 0; i < n; i++) { last = last * 0.7 + (rnd() * 2 - 1) * 0.3; data[i] = last; } }
    const src = ctx.createBufferSource(), band = ctx.createBiquadFilter(), g = ctx.createGain(); src.buffer = swellNoise; src.loop = true;
    band.type = "bandpass"; band.Q.value = 0.8; band.frequency.setValueAtTime(300, time); band.frequency.exponentialRampToValueAtTime(2600, time + length);
    g.gain.setValueAtTime(0.0001, time); g.gain.exponentialRampToValueAtTime(0.03, time + length * 0.85); g.gain.exponentialRampToValueAtTime(0.0001, time + length + 0.4);
    src.connect(band); band.connect(g); g.connect(bus); src.start(time); src.stop(time + length + 0.6);
  };
  const kick = (time, gain) => { // a soft jazz kick (feathered bass drum): a round low thump that drops fast, with a faint beater click
    const osc = ctx.createOscillator(), g = ctx.createGain(); osc.type = "sine"; osc.frequency.setValueAtTime(110, time); osc.frequency.exponentialRampToValueAtTime(46, time + 0.09);
    g.gain.setValueAtTime(0.0001, time); g.gain.exponentialRampToValueAtTime(gain, time + 0.006); g.gain.exponentialRampToValueAtTime(0.0001, time + 0.34);
    osc.connect(g); g.connect(bus); osc.start(time); osc.stop(time + 0.4); tick(time, gain * 0.12, 3200, 0.03); noteCount += 1;
  };
  const clap = (time, gain) => { // a soft pop clap: two quick noise bursts through a band-pass, with a short tail
    for (const [d, g] of [[0, 1], [0.012, 0.7]]) tick(time + d, gain * g, 1500, 0.11);
    tick(time + 0.02, gain * 0.5, 2600, 0.2);
  };
  const drum = (time, gain) => { // a soft timpani-like hit: a low sine that drops in pitch, with a little skin noise
    const osc = ctx.createOscillator(), g = ctx.createGain(); osc.type = "sine"; osc.frequency.setValueAtTime(118, time); osc.frequency.exponentialRampToValueAtTime(52, time + 0.35);
    g.gain.setValueAtTime(0.0001, time); g.gain.exponentialRampToValueAtTime(gain, time + 0.012); g.gain.exponentialRampToValueAtTime(0.0001, time + 1.6);
    osc.connect(g); g.connect(bus); osc.start(time); osc.stop(time + 1.7); tick(time, gain * 0.25, 900, 0.12); noteCount += 1;
  };
  const reverb = () => { // a synthetic room: two seconds of dark, decaying noise
    const length = Math.floor(ctx.sampleRate * 2.2), buffer = ctx.createBuffer(2, length, ctx.sampleRate);
    for (let channel = 0; channel < 2; channel++) { const data = buffer.getChannelData(channel); let last = 0; for (let i = 0; i < length; i++) { last = last * 0.55 + (rnd() * 2 - 1) * 0.45; data[i] = last * Math.pow(1 - i / length, 2.4) * (i < 0.012 * ctx.sampleRate ? i / (0.012 * ctx.sampleRate) : 1); } }
    return buffer;
  };
  const scheduleBar = () => {
    if (playlist && barIndex >= BARS_PER_TRACK) { const before = trackIndex; trackIndex = nextInGroup(trackIndex); seed = 5 + trackIndex * 17; barIndex = 0; const changed = trackIndex; sendNode?.gain.setTargetAtTime(TRACKS[trackIndex].send, ctx.currentTime, 0.6); if (changed !== before) setTimeout(() => { if (playing) onTrack?.(changed); }, Math.max(0, (nextTime - ctx.currentTime) * 1000)); } // a piece goes round again; a different piece of the group would be announced when its first note sounds
    const track = TRACKS[trackIndex], beat = 60 / track.bpm, barLength = beat * 4, bar = track.bars[barIndex % track.bars.length], t0 = nextTime, second = barIndex >= track.bars.length || (track.style === "bright" && barIndex >= 8);

      if (track.style === "sunny") {
        const second = barIndex % 16 >= 8, loud = barIndex % 16 >= 12 ? 1.1 : 1; // the second half lifts a little, the last four bars a little more
        const halves = bar.chord2 ? [[0, bar.chord, bar.bass], [2, bar.chord2, bar.bass2 ?? bar.bass]] : [[0, bar.chord, bar.bass]];
        for (const [from, chord, root] of halves) {
          const span = bar.chord2 ? 2 : 4, start = t0 + from * beat;
          // the left hand: a low piano bass, held, and its fifth a beat and a half later on the longer chords
          piano(start + jitter(10), root, vary(0.1 * loud), beat * span * 0.98, -0.12);
          if (span === 4) piano(start + 2 * beat + jitter(12), root + 7, vary(0.06 * loud), beat * 1.9, -0.1);
          // thick rolled chords, left to ring: low octave notes under the voicing, rolled slowly from the bottom, each with its own small delay
          const voicing = [chord[0] - 12, chord[2] - 12, ...chord];
          voicing.forEach((midi, k) => piano(start + k * (0.022 + rnd() * 0.03) + jitter(8), midi, vary(0.05 * loud * (k < 2 ? 1.1 : 0.9)), beat * span * 0.96, -0.25 + k * 0.08));
          // a softer second roll, upward and slow, half-way through the longer chords
          if (span === 4) chord.forEach((midi, k) => piano(start + 2 * beat + 0.04 + k * (0.07 + rnd() * 0.05), midi + (k % 2 ? 12 : 0), vary(0.03 * loud), beat * 1.8, 0.15 - k * 0.07));
          // a bed of strings so faint it is felt rather than heard, and a cello on the root
          chord.forEach((midi, k) => note(start, midi, STRINGS, 0.008, beat * span * 1.1, (k % 2 ? 1 : -1) * 0.4));
          note(start, root + 12, CELLO, 0.02, beat * span * 1.05, -0.3);
        }
        // the long sustained layer (Paul 2026-11-22): open chord tones held on the real piano across the whole bar and into the next, very soft, so there is always a warm, ringing floor under the melody
        [[bar.bass, -0.3, 0.04], [bar.bass + 7, -0.15, 0.034], [bar.chord[1] + 12, 0.15, 0.03], [bar.chord[3] + 12, 0.3, 0.024]].forEach(([midi, pan, g], k) => piano(t0 + 0.03 * k + jitter(10), midi, vary(g * loud), barLength * 2.1, pan));
        // the rhythm section (Paul 2026-11-23: "a little monotonous: add chords and a jazz bass drum, more arrangement"): a feathered kick on one and three with a soft ghost note before the next bar,
        // a walking upright bass on every beat under the held piano bass, off-beat piano chord stabs (the "and" of two, and four) in the middle register, and a brushed ride with a skip beat
        // Paul 2026-11-23 ("fast in energy but not noisy or messy, smooth, like a Jay Chou ballad-pop piano track"): the syncopation is gone. What drives the piece now is a steady, flowing eighth-note piano
        // arpeggio (broken chords up and down, each note ringing into the next like a pedalled piano), a clean pulse (kick on one and three, a soft clap on two and four only after the middle, a closed
        // hat on the beat), a smooth walking bass and a drawbar organ bed. Everything lands on the beat or the straight eighth; nothing is stabbed off the beat.
        const dance = barIndex % 16 >= 8, full = barIndex % 16 >= 10;
        [0, 2].forEach((b2) => kick(t0 + b2 * beat + jitter(4), (b2 === 0 ? 0.22 : 0.17) * loud));
        if (dance) [1, 3].forEach((b2) => clap(t0 + b2 * beat + jitter(5), (full ? 0.16 : 0.12) * loud));
        for (let i = 0; i < 4; i++) tick(t0 + i * beat + jitter(4), 0.012 * loud, 8500, 0.05); // a closed hat on the beat
        // the flowing piano arpeggio: eight notes a bar through the chord, up and back, quiet under the melody and a little fuller in the second half
        const arp = [0, 1, 2, 3, 2, 1, 2, 1].map((i) => bar.chord[i]);
        arp.forEach((midi, i) => piano(t0 + i * 0.5 * beat + jitter(5), midi + (i % 4 === 3 ? 12 : 0), vary((full ? 0.042 : 0.034) * loud), beat * 1.3, -0.15 + (i % 4) * 0.1));
        // the organ bed from the middle, holding the chord
        if (dance) bar.chord.forEach((midi, k) => note(t0 + k * 0.01, midi, ORGAN, 0.011 * loud * (full ? 1.25 : 1), barLength * 1.05, (k % 2 ? 1 : -1) * 0.25));
        const walkRoot = bar.bass, walkFifth = bar.bass + 7, walkThird = bar.bass + ((bar.chord[1] - bar.chord[0]) >= 4 ? 4 : 3);
        [[0, walkRoot, 0.15], [1, walkThird, 0.11], [2, walkFifth, 0.12], [3, walkRoot + 2 - (barIndex % 3 === 0 ? 3 : 0), 0.1]].forEach(([at, midi, g]) => note(t0 + at * beat + jitter(7), midi, BASS, g * loud, beat * 0.92));
        // the melody: long, singing notes on the piano with a second voice a chord tone below it; strings sing along from the second half
        const chordNow = (at) => (bar.chord2 && at >= 2 ? bar.chord2 : bar.chord);
        for (const [at, midi, length] of bar.tune) {
          const when = t0 + at * beat + jitter(14);
          piano(when, midi, vary(0.13 * loud), beat * (length + 0.9), 0.1);
          const pool = []; for (const c of chordNow(at)) for (const octave of [-24, -12, 0]) pool.push(c + octave);
          const below = pool.filter((m) => m <= midi - 3 && m >= midi - 9).sort((x, y) => y - x)[0];
          if (below !== undefined) piano(when + 0.012 + rnd() * 0.012, below, vary(0.055 * loud), beat * (length + 0.7), -0.05);
          if (second) note(when + 0.03, midi, STRING_LEAD, 0.012, beat * (length + 0.6), 0.2);
        }
      } else {
      const lv = (track.level || [])[barIndex % track.bars.length] ?? 1, section = barIndex % 16 < 4 ? 0 : barIndex % 16 < 8 ? 1 : barIndex % 16 < 12 ? 2 : 3; // 0 hush, 1 build, 2 climax, 3 fall
      // the lone piano, deep: a low octave on the first beat, then single low notes (the thriller shade), thickening to pounding octaves in the climax
      piano(t0 + jitter(4), bar.bass + 12, vary(0.1 * lv), beat * 3.5, -0.1); piano(t0 + jitter(4), bar.bass, vary(0.09 * lv), beat * 3.5, -0.1);
      if (section >= 1) for (const at of [1.5, 2.5, 3.5]) piano(t0 + at * beat + jitter(5), bar.bass + 12, vary(0.05 * lv), beat * 0.9, -0.1);
      if (section === 2) for (let i = 0; i < 8; i++) { piano(t0 + i * 0.5 * beat + jitter(4), bar.chord[i % 4], vary(0.04 * lv), beat * 0.9, 0.1); piano(t0 + i * 0.5 * beat + jitter(4), bar.chord[i % 4] + 12, vary(0.03 * lv), beat * 0.9, 0.18); }
      // the weight: a sub pedal, and a driving bass pattern (the figure leans on the second half of the bar) from the build onwards
      note(t0, bar.bass, SUB, 0.24 * lv, barLength * 1.05);
      if (section >= 1) for (const [at, g] of [[0, 0.15], [1.5, 0.1], [2, 0.12], [3.5, 0.09]]) note(t0 + at * beat + jitter(4), bar.bass, BASS_DRIVE, g * lv * 0.6, beat * 0.9);
      // strings: a tremolo pad, wide, always; the cellos double the bass line an octave up; violins an octave higher from the build
      bar.chord.forEach((midi, i) => note(t0, midi, STR_TREM, 0.016 * lv, barLength * 1.15, (i % 2 ? 1 : -1) * (0.35 + 0.1 * i)));
      note(t0, bar.bass + 12, CELLO, 0.03 * lv, barLength * 1.1, -0.35);
      if (section >= 1) bar.chord.forEach((midi, i) => note(t0, midi + 12, STR_TREM, 0.007 * lv, barLength * 1.15, (i % 2 ? -1 : 1) * 0.5));
      // timpani: a hit every fourth bar in the quiet opening, on every bar from the build, two per bar in the climax; the bar before the climax is a crescendo roll
      if (section === 0 && barIndex % 4 === 0) drum(t0, 0.11 * lv);
      if (section >= 1) drum(t0, 0.2 * lv);
      if (section === 2) drum(t0 + 2 * beat, 0.17 * lv);
      if (barIndex % 16 === 7) { for (let i = 0; i < 16; i++) drum(t0 + i * 0.25 * beat, (0.03 + 0.1 * (i / 15)) * lv); swell(t0, barLength); }
      if (barIndex % 16 === 8) tick(t0, 0.09, 6500, 1.4); // the cymbal crash on the downbeat of the climax
      // the melody: piano plus strings throughout, the horn section from bar 5 (soft) and in full from the climax, with trombones an octave below in the climax
      for (const [at, midi, length] of bar.tune) {
        const when = t0 + at * beat + jitter(6);
        piano(when, midi, vary(0.07 * lv), beat * (length + 0.6), 0.15);
        note(when, midi, STRING_LEAD, 0.018 * lv, beat * (length + 0.7), 0.25);
        if (barIndex % 16 >= 4) note(when, midi, HORN, vary((section === 2 ? 0.05 : 0.02) * lv), beat * (length + 0.5), -0.15);
        if (section === 2) note(when, midi - 12, HORN, vary(0.038 * lv), beat * (length + 0.5), 0.2);
      }
      }
    nextTime += barLength * (track.style === "sunny" ? 1 + 0.014 * Math.sin(barIndex * 1.3) : 1); barIndex += 1; // the day piece breathes a little
    timer = setTimeout(scheduleBar, Math.max(50, (nextTime - ctx.currentTime - 0.6) * 1000));
  };
  return {
    // (this engine's only piece is series night, track 0 here). Returns true if it started.
    start(track = 0, options = {}) {
      if (playing) return true;
      const AudioContextClass = window.AudioContext || window.webkitAudioContext; if (!AudioContextClass) return false;
      try {
        ctx ??= new AudioContextClass(); ctx.resume?.();
        trackIndex = ((track % TRACKS.length) + TRACKS.length) % TRACKS.length; seed = 5 + trackIndex * 17; playlist = Boolean(options.playlist); onTrack = options.onTrack ?? null;
        master = ctx.createGain(); master.gain.setValueAtTime(0.0001, ctx.currentTime); master.gain.exponentialRampToValueAtTime(0.8, ctx.currentTime + (options.fade ?? 1.5)); master.connect(ctx.destination);
        const compressor = ctx.createDynamicsCompressor(); compressor.threshold.value = -20; compressor.knee.value = 12; compressor.ratio.value = 3; compressor.attack.value = 0.012; compressor.release.value = 0.28;
        bus = ctx.createGain(); bus.connect(compressor); compressor.connect(master);
        const room = ctx.createConvolver(), wet = ctx.createGain(); sendNode = ctx.createGain(); reverbBuffer ??= reverb(); room.buffer = reverbBuffer; sendNode.gain.value = TRACKS[trackIndex].send; wet.gain.value = 0.9;
        bus.connect(sendNode); sendNode.connect(room); room.connect(wet); wet.connect(master);
        hiss = ctx.createBufferSource(); const hissBuffer = ctx.createBuffer(1, ctx.sampleRate * 3, ctx.sampleRate), hissData = hissBuffer.getChannelData(0);
        for (let i = 0; i < hissData.length; i++) hissData[i] = (rnd() < 0.0004 ? (rnd() * 2 - 1) * 0.9 : 0) + (rnd() * 2 - 1) * 0.012; // a faint hiss and a few pops, like a record
        hiss.buffer = hissBuffer; hiss.loop = true; const hissFilter = ctx.createBiquadFilter(), hissGain = ctx.createGain(); hissFilter.type = "highpass"; hissFilter.frequency.value = 1400; hissGain.gain.value = 0.1;
        hiss.connect(hissFilter); hissFilter.connect(hissGain); hissGain.connect(master); hiss.start();
        playing = true; barIndex = 0; noteCount = 0; const run = ++runId;
        realPiano.load(ctx).then(() => { if (!playing || run !== runId) return; nextTime = ctx.currentTime + 0.25; scheduleBar(); }); // the piano samples load on the first tap (about 1 MB, once); the first bar waits for them
        return true;
      } catch { playing = false; return false; }
    },
    stop() {
      if (!playing) return;
      playing = false; clearTimeout(timer); timer = 0;
      const old = master, oldHiss = hiss;
      try { old.gain.cancelScheduledValues(ctx.currentTime); old.gain.setValueAtTime(Math.max(0.0001, old.gain.value), ctx.currentTime); old.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.5); } catch { /* the graph may already be gone */ }
      setTimeout(() => { try { oldHiss?.stop(); old?.disconnect(); } catch { /* already stopped */ } }, 1800);
    },
    next() { if (playing) { playlist = true; barIndex = BARS_PER_TRACK; } }, // QA: jump to the end of the piece (it goes round again)
    tracks: () => TRACKS.map((t) => t.title),
    state: () => ({ playing, context: ctx ? ctx.state : "none", bars: barIndex, notes: noteCount, track: trackIndex, title: TRACKS[trackIndex].title, group: TRACKS[trackIndex].group, playlist, piano: realPiano.ready() }),
  };
}
export { createNightMusic };
