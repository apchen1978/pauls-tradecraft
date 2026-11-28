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
  // v36 (DSH 2026-11-24): only TRACKS[1] bars 6-15 right hand was rewritten; chords, bass, drums, tempo and form
  // are untouched, so an A/B against v35 isolates the melody.
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
  // Afternoon Ascending: a jazz head, bridge and reprise, in E-flat as played.
  { title: "午後上行", group: "day", style: "sunny", bpm: 100, transpose: -2, formBars: 42, send: 0.58,
    bars: [
      // 1–2: a soft bossa entrance over an open tonic and a minor ninth.
      { bass: 41, chord: [53, 57, 62, 67], tune: [[1.18, 72, 0.55, 0.83], [2.7, 76, 0.75, 0.93]] }, // F6/9
      { bass: 38, chord: [53, 60, 64, 69], tune: [[0.71, 74, 0.54, 0.83], [2.17, 72, 0.77, 0.75]] }, // Dm9
      // 3–14: turnarounds lead to the IV chord and its minor shadow.
      { bass: 43, chord: [53, 58, 62, 69], tune: [[1.54, 70, 0.24, 0.75], [1.9, 74, 0.78, 0.95]] }, // Gm9
      { bass: 48, chord: [52, 58, 62, 69], tune: [[1.15, 72, 0.68, 0.8], [3.22, 67, 0.48, 0.85]] }, // C13
      { bass: 41, chord: [57, 64, 67, 72], tune: [[1.0, 81, 0.5, 0.95], [2.33, 79, 0.33, 0.7], [3.5, 77, 0.5, 0.75]] }, // Fmaj9
      { bass: 45, chord: [55, 60, 64, 71], tune: [[0, 76, 1.0, 1.0], [1.5, 74, 0.5, 0.7], [2.66, 72, 1.0, 0.95]] }, // Am9
      { bass: 38, chord: [54, 60, 63, 69], tune: [[1.33, 69, 0.5, 0.7], [2.0, 72, 0.5, 0.85], [2.66, 75, 1.2, 1.0]] }, // D7♭9
      { bass: 43, chord: [53, 58, 62, 69], tune: [[0, 74, 1.5, 1.0], [2.33, 72, 0.33, 0.6], [3.0, 70, 0.8, 0.9]] }, // Gm9
      { bass: 48, chord: [52, 58, 61, 68], tune: [] }, // C7 altered
      { bass: 41, chord: [57, 64, 67, 72], tune: [[1.0, 76, 0.5, 0.95], [2.0, 79, 0.33, 0.7], [2.66, 81, 1.2, 1.05]] }, // Fmaj9
      { bass: 41, chord: [57, 63, 67, 72], tune: [[0.66, 84, 0.33, 0.6], [1.33, 81, 0.5, 0.9], [2.33, 79, 1.5, 1.0]] }, // F9
      { bass: 46, chord: [57, 60, 62, 65], tune: [[1.0, 77, 0.5, 0.85], [1.66, 76, 0.16, 0.55], [1.82, 77, 0.16, 0.7], [2.66, 74, 1.5, 1.0]] }, // B♭maj9
      { bass: 46, chord: [56, 60, 61, 65], tune: [[0.5, 72, 1.0, 0.9], [2.0, 73, 0.33, 0.7], [2.66, 74, 1.2, 0.95]] }, // B♭m9
      { bass: 45, chord: [53, 60, 64, 67], tune: [[1.66, 72, 2.0, 0.95]] }, // Fmaj9/A
      // 15–22: a bridge through E-flat and A-flat, then a way back to F.
      { bass: 41, chord: [56, 63, 67, 72], tune: [[1.57, 72, 0.34, 0.93], [2.23, 75, 0.21, 0.94], [2.73, 77, 0.38, 0.85]] }, // Fm9
      { bass: 46, chord: [56, 60, 62, 67], tune: [[0.9, 77, 0.17, 0.72], [1.15, 79, 0.43, 1.04], [3.54, 71, 0.14, 0.53], [3.77, 70, 0.17, 0.84]] }, // B♭13
      { bass: 39, chord: [55, 62, 65, 70], tune: [[0.13, 74, 0.86, 1.02], [2.58, 72, 0.2, 0.65], [2.89, 70, 0.37, 0.82]] }, // E♭maj9
      { bass: 44, chord: [55, 58, 60, 63], tune: [] }, // A♭maj9
      { bass: 37, chord: [53, 59, 67, 70], tune: [[1.22, 77, 0.4, 0.93], [2.9, 75, 0.17, 0.64], [3.23, 71, 0.37, 0.84]] }, // D♭13♯11
      { bass: 43, chord: [53, 58, 62, 69], tune: [[0.15, 70, 0.63, 0.98], [2.38, 69, 0.14, 0.62], [2.58, 70, 0.24, 0.89], [3.13, 74, 0.54, 0.91]] }, // Gm9
      { bass: 48, chord: [52, 58, 62, 69], tune: [] }, // C13
      { bass: 48, chord: [52, 58, 61, 68], tune: [] }, // C7 altered
      // 23–24: a two-bar breath and a pickup into the return.
      { bass: 43, chord: [53, 58, 62, 69], tune: [[2.79, 69, 0.18, 0.63], [3.19, 70, 0.36, 0.86]] }, // Gm9
      { bass: 48, chord: [52, 58, 62, 69], tune: [[1.96, 67, 0.34, 0.83], [3.42, 70, 0.24, 0.76], [3.75, 68, 0.21, 0.52]] }, // C13
      // 25–32: the hook returns, alternating with brass answers.
      { bass: 41, chord: [57, 64, 67, 72], tune: [[0.07, 69, 0.68, 1.1], [1.95, 72, 0.24, 0.85], [2.3, 74, 0.15, 0.55], [2.58, 77, 0.46, 1.12], [3.38, 76, 0.38, 0.83]] }, // Fmaj9
      { bass: 38, chord: [54, 60, 63, 69], tune: [] }, // D7♭9
      { bass: 43, chord: [53, 58, 62, 69], tune: [[1.39, 74, 0.19, 0.76], [1.74, 77, 0.52, 1.1], [2.68, 81, 0.15, 0.86], [2.93, 82, 0.65, 1.04]] }, // Gm9
      { bass: 48, chord: [52, 58, 62, 69], tune: [] }, // C13
      { bass: 45, chord: [55, 60, 64, 71], tune: [[0.56, 79, 0.38, 0.94], [1.43, 76, 0.19, 0.79], [1.72, 77, 0.13, 0.58], [1.95, 76, 0.46, 0.98], [3.29, 72, 0.39, 0.86]] }, // Am9
      { bass: 38, chord: [54, 60, 63, 69], tune: [] }, // D7♭9
      { bass: 43, chord: [53, 58, 62, 69], tune: [[0.84, 74, 0.24, 0.81], [1.38, 79, 0.53, 1.08], [2.88, 77, 0.14, 0.65], [3.12, 74, 0.59, 0.98]] }, // Gm9
      { bass: 48, chord: [52, 58, 61, 68], tune: [] }, // C7 altered
      // 33–42: the hook lets go by degrees; the final cadence lands on F6/9.
      { bass: 41, chord: [57, 64, 67, 72], tune: [[1.1, 69, 0.46, 0.87], [2.41, 72, 0.25, 0.74], [2.87, 74, 0.2, 0.68], [3.22, 72, 0.45, 0.91]] }, // Fmaj9
      { bass: 41, chord: [57, 63, 67, 72], tune: [] }, // F9
      { bass: 46, chord: [57, 60, 62, 65], tune: [[1.5, 69, 0.2, 0.66], [1.79, 70, 0.38, 0.9], [2.67, 74, 0.52, 0.84]] }, // B♭maj9
      { bass: 46, chord: [56, 60, 61, 65], tune: [] }, // B♭m9
      { bass: 45, chord: [53, 60, 64, 67], tune: [[0.82, 72, 0.56, 0.88], [2.86, 69, 0.3, 0.75]] }, // Fmaj9/A
      { bass: 43, chord: [53, 59, 64, 69], tune: [] }, // G13
      { bass: 43, chord: [53, 58, 62, 69], tune: [[1.91, 69, 0.16, 0.6], [2.18, 70, 0.45, 0.83], [3.13, 67, 0.52, 0.79]] }, // Gm9
      { bass: 48, chord: [52, 58, 62, 69], tune: [] }, // C13
      { bass: 48, chord: [52, 58, 61, 68], tune: [] }, // C7 altered
      { bass: 41, chord: [57, 62, 67, 72], tune: [[1.38, 67, 0.23, 0.66], [1.87, 65, 1.72, 0.85]] }, // F6/9
    ] },
];
for (const t of TRACKS) if (t.transpose) for (const b of t.bars) { // a track may be written in one key and played in another: shift every note by `transpose` semitones
  b.bass += t.transpose; b.chord = b.chord.map((m) => m + t.transpose);
  if (b.bass2 !== undefined) b.bass2 += t.transpose; if (b.chord2) b.chord2 = b.chord2.map((m) => m + t.transpose);
  b.tune = b.tune.map(([at, midi, ...phrasing]) => [at, midi + t.transpose, ...phrasing]);
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
const RHODES = { partials: [[1, 0.6, "sine", 1], [2, 0.26, "sine", 0.55], [3, 0.07, "sine", 0.2], [6, 0.035, "sine", 0.08]], attack: 0.012, lowpass: 3300, tremolo: 0.32, tremRate: 4.6 }; // a Rhodes-like electric piano: a round tone with a quickly fading bell partial and a slow tremolo
const CELLO = { partials: [[1, 0.6, "sawtooth", 1], [1.005, 0.4, "sawtooth", 1]], lowpass: 650, attack: 0.3, vibrato: 8 };
const STRING_LEAD = { partials: [[1, 0.6, "sawtooth", 1], [1.005, 0.4, "sawtooth", 1]], lowpass: 1300, attack: 0.25, vibrato: 9 };

function createNightMusic() { // the cinematic engine, for series night
  let ritNext = 1, ctx = null, bus = null, master = null, hiss = null, sendNode = null, timer = 0, playing = false, nextTime = 0, barIndex = 0, noteCount = 0, trackIndex = 0, seed = 5, noise = null, swellNoise = null, reverbBuffer = null, playlist = false, onTrack = null, runId = 0;
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
  // v23: a slow tape drift, ±4 cents at about 0.27 Hz, applied per note so the whole piano breathes with the surface
  const wobble = (time) => 5 * Math.sin(time * 1.7) + 2 * Math.sin(time * 0.61 + 1.3); // v27: a gentler drift
  const piano = (time, midi, gain, length, position = 0) => { if (realPiano.play(ctx, bus, time, midi, gain * PIANO_K, length, position, wobble(time))) { noteCount += 1; return; } note(time, midi, EPIANO, gain, length, position); }; // a real piano note, or the synth fallback
  const noiseBuffer = () => { // soft noise for the brushes and the ride
    if (!noise) { const length = Math.floor(ctx.sampleRate * 0.4); noise = ctx.createBuffer(1, length, ctx.sampleRate); const data = noise.getChannelData(0); let last = 0; for (let i = 0; i < length; i++) { last = last * 0.6 + (rnd() * 2 - 1) * 0.4; data[i] = last; } }
    return noise;
  };
  const tick = (time, gain, centre, decay) => {
    const src = ctx.createBufferSource(), filter = ctx.createBiquadFilter(), g = ctx.createGain();
    src.buffer = noiseBuffer(); filter.type = "bandpass"; filter.frequency.value = centre; filter.Q.value = 0.7;
    g.gain.setValueAtTime(0.0001, time); g.gain.exponentialRampToValueAtTime(gain, time + 0.008); g.gain.exponentialRampToValueAtTime(0.0001, time + decay);
    const warm = ctx.createBiquadFilter(); warm.type = "lowpass"; warm.frequency.value = 5600; warm.Q.value = 0.4; // Paul 2026-11-23: a low-pass on every percussion noise burst takes the sharp edge off (a warm, lo-fi top end)
    src.connect(filter); filter.connect(warm); warm.connect(g); g.connect(bus); src.start(time); src.stop(time + decay + 0.1);
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
  const snare = (time, gain) => { // a jazz-kit snare: a short skin tone (190 Hz) under a band-passed rattle of brushes
    const osc = ctx.createOscillator(), g = ctx.createGain(); osc.type = "triangle"; osc.frequency.setValueAtTime(220, time); osc.frequency.exponentialRampToValueAtTime(165, time + 0.08);
    g.gain.setValueAtTime(0.0001, time); g.gain.exponentialRampToValueAtTime(gain * 0.5, time + 0.004); g.gain.exponentialRampToValueAtTime(0.0001, time + 0.16);
    osc.connect(g); g.connect(bus); osc.start(time); osc.stop(time + 0.2); tick(time, gain * 0.8, 2400, 0.14); tick(time + 0.003, gain * 0.35, 5200, 0.1); noteCount += 1;
  };
  const eight08 = (time, gain, midi) => { // a long 808 sub: a pure low sine with a small pitch drop and a slow tail, a touch of soft-clip warmth from the second partial
    const f = hz(midi), osc = ctx.createOscillator(), o2 = ctx.createOscillator(), g = ctx.createGain();
    osc.type = "sine"; osc.frequency.setValueAtTime(f * 1.6, time); osc.frequency.exponentialRampToValueAtTime(f, time + 0.05); o2.type = "sine"; o2.frequency.value = f * 2; 
    g.gain.setValueAtTime(0.0001, time); g.gain.exponentialRampToValueAtTime(gain, time + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, time + 0.5);
    const g2 = ctx.createGain(); g2.gain.value = 0.05; o2.connect(g2); g2.connect(g); osc.connect(g); g.connect(bus); osc.start(time); o2.start(time); osc.stop(time + 0.5); o2.stop(time + 0.5); noteCount += 1;
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
    if (nextTime < ctx.currentTime) nextTime = ctx.currentTime + 0.05; // after a background pause (a throttled timer or a suspended context) pick up from now instead of piling the missed notes on top of one another
    if (playlist && barIndex >= (TRACKS[trackIndex].formBars ?? BARS_PER_TRACK)) { const before = trackIndex; trackIndex = nextInGroup(trackIndex); seed = 5 + trackIndex * 17; barIndex = 0; const changed = trackIndex; sendNode?.gain.setTargetAtTime(TRACKS[trackIndex].send, ctx.currentTime, 0.6); if (changed !== before) setTimeout(() => { if (playing) onTrack?.(changed); }, Math.max(0, (nextTime - ctx.currentTime) * 1000)); } // a piece goes round again; a different piece of the group would be announced when its first note sounds
    const track = TRACKS[trackIndex], beat = 60 / track.bpm, barLength = beat * 4, bar = track.bars[barIndex % track.bars.length], t0 = nextTime, second = barIndex >= track.bars.length || (track.style === "bright" && barIndex >= 8);

      if (track.style === "sunny") {
        const pos = barIndex % track.formBars;
        const intro = pos < 2, climb = pos >= 6 && pos < 14, build = pos >= 14 && pos < 22;
        const breath = pos >= 22 && pos < 24, peak = pos >= 24 && pos < 32, outro = pos >= 32;
        const ending = pos === track.formBars - 1;
        const level = outro ? 1 - (pos - 32) * .085 : peak ? 1.28 : build ? 1.12 : breath ? .72 : 1;
        // Start with a soft brush pulse and let the kit reach its usual level over four bars.
        const opening = pos < 4;
        const drumGain = opening ? [.62, .72, .82, .92][pos] : 1;
        const backbeatDelay = opening ? .026 : 0;
        const chordHit = (pitches, at, gain, length) => {
          pitches.forEach((midi, voice) => {
            piano(t0 + at * beat + voice * .011 + jitter(5), midi, vary(gain * level), beat * length, -.13 + voice * .08);
          });
        };
        chordHit(bar.chord, 0, opening ? .061 : .076, ending ? 5.2 : opening ? 2.3 : breath ? 1.1 : 1.75);
        // The right hand alternates short replies and rests. A pickup gets its own space.
        const reply = [1.5, 2.5, 1, 2.75][pos % 4];
        if (!breath && !ending && !bar.tune.length) chordHit(bar.chord.slice(1), reply, .047, .64);
        if ((build || peak) && !bar.tune.length && pos % 2 === 0) chordHit(bar.chord.slice(2), 3.5, .035, .4);
        // The score specifies each note's timing, length, and touch, including quiet approach notes.
        for (const [at, midi, length, touch] of bar.tune) {
          piano(t0 + at * beat + .012 + jitter(4), midi, vary(.099 * level * touch), beat * length, .13);
        }

        // Kick and brushes open the piece. The shaker and wood clicks enter on separate bars.
        if (!ending) kick(t0, (intro || breath ? .16 : .24) * level * drumGain);
        if (!breath && !ending) {
          if (!intro) kick(t0 + 2 * beat, .15 * level * drumGain);
          for (const at of [1, 3]) snare(t0 + at * beat + backbeatDelay + jitter(6), (intro ? .033 : .052) * level * drumGain);
          if (!intro) {
            const clicks = pos % 2 === 0 ? [1.5, 3] : [2.5];
            for (const at of clicks) tick(t0 + at * beat + jitter(5), .068 * level * drumGain, 2400, .05);
          }
        }
        if (pos > 0 && !ending) {
          const step = peak || build ? .25 : .5;
          for (let at = .5; at < (breath ? 2 : 4); at += step) {
            const accent = at === 1.5 || at === 3.5 ? 1.4 : .65;
            tick(t0 + at * beat + jitter(4), .022 * accent * level * drumGain, 6200, .065);
          }
        }
        if (pos > 0) note(t0, bar.bass, BASS, .18 * level, beat * (ending ? 3.5 : 1.4));
        if (!intro && !breath && !ending) note(t0 + 2.5 * beat, bar.bass + 12, BASS, .105 * level, beat * .9);
        if (peak || (build && pos % 2 === 1)) eight08(t0 + beat, .088 * level, bar.bass);

        // Strings enter at the climb. Brass answers the piano in the peak's open bars.
        if (climb || build || peak) {
          const stringGain = peak ? .024 : build ? .016 : .010;
          bar.chord.slice(1, 3).forEach((midi, voice) => {
            note(t0 + .04, midi, STRINGS, stringGain * level, barLength * .97, voice ? .38 : -.38);
          });
        }
        if (peak && !bar.tune.length) {
          const voices = bar.chord.slice(1);
          voices.forEach((midi, voice) => {
            note(t0 + (.7 + voice * .035) * beat, midi, HORN, .027 * level, beat * (2 - voice * .15), (voice - 1) * .32);
          });
        }
        if (pos === 24) tick(t0, .09 * level, 3200, 1.9);
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
        // v17: the last two bars slow down (a written ritardando) while the arc fades them, so the piece ends rather than stops
    ritNext = track.style === "sunny" ? (barIndex % (track.formBars ?? BARS_PER_TRACK) >= (track.formBars ?? BARS_PER_TRACK) - 2 ? 1 + ((barIndex % (track.formBars ?? BARS_PER_TRACK)) - ((track.formBars ?? BARS_PER_TRACK) - 2) + 1) * 0.09 : 1) : 1;
    nextTime += barLength * ritNext * (track.style === "sunny" ? 1 + 0.014 * Math.sin(barIndex * 1.3) : 1); barIndex += 1;
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
        bus = ctx.createGain();
        // v24: a gentle top-end roll-off on the whole record (about 9 kHz), the way an old master sounds. It is what
        // makes the surface and the piano sit together instead of the piano sounding modern on top of an old hiss.
        const tone = ctx.createBiquadFilter(); tone.type = "lowpass"; tone.frequency.value = 9200; tone.Q.value = 0.45;
        bus.connect(compressor); compressor.connect(tone); tone.connect(master);
        const room = ctx.createConvolver(), wet = ctx.createGain(); sendNode = ctx.createGain(); reverbBuffer ??= reverb(); room.buffer = reverbBuffer; sendNode.gain.value = TRACKS[trackIndex].send; wet.gain.value = 0.9;
        bus.connect(sendNode); sendNode.connect(room); room.connect(wet); wet.connect(master);
        hiss = ctx.createBufferSource(); const hissBuffer = ctx.createBuffer(1, ctx.sampleRate * 3, ctx.sampleRate), hissData = hissBuffer.getChannelData(0);
        for (let i = 0; i < hissData.length; i++) hissData[i] = (rnd() < 0.00045 ? (rnd() * 2 - 1) * 0.9 : 0) + (rnd() * 2 - 1) * 0.012; // v24: more pops, the record is played a lot
        hiss.buffer = hissBuffer; hiss.loop = true; const hissFilter = ctx.createBiquadFilter(), hissGain = ctx.createGain(); hissFilter.type = "highpass"; hissFilter.frequency.value = 1200; hissGain.gain.value = 0.09; // v27: Paul said the surface was too loud; back it off // v23: the record surface is part of the sound, not a rumour
        hiss.connect(hissFilter); hissFilter.connect(hissGain); hissGain.connect(master); hiss.start();
        playing = true; barIndex = 0; noteCount = 0; const run = ++runId;
        realPiano.load(ctx).then(() => { if (!playing || run !== runId) return; nextTime = ctx.currentTime + 0.25; scheduleBar(); }); // the piano samples load on the first tap (about 1 MB, once); the first bar waits for them
        return true;
      } catch { playing = false; return false; }
    },
    resume() { try { if (playing && ctx && ctx.state !== "running") ctx.resume(); } catch { /* ignore */ } }, // Paul 2026-11-23: the music keeps playing in the background; a phone that suspended the context gets it back
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
