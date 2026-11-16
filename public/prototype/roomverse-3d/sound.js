// Room 01's music (Paul, 2026-11-16: the living room has speakers but plays nothing; light music is welcome, it need not be jazz, and it must be original. 2026-11-17: make it richer, bright and
// major, livelier with a vibraphone layer, a cinematic piece for series night with more bass, and a real piano instead of the MIDI-like keyboard; two pieces are enough).
// 2026-11-17 (later): the day piece is now Room 04's first record, 慢板, played faster by Room 04's own engine (see createRoomMusic at the end); this file's own engine plays the series-night piece. (Earlier: two pieces made with the browser's own audio synthesis plus a real sampled piano (piano.js: Salamander Grand Piano, CC BY 3.0, credited on the page). No song, melody or arrangement is borrowed:
// everything is written here note by note.
//   Day (the "day" group): Track 1 "窗邊的午後": C major, 96 beats a minute, a light bounce. A sixteen-bar form, all major chords. First half: Cmaj9, Fmaj9, Cadd9, G6/9, Fmaj9, Cadd9, D9, G7.
//   Second half, a lift: Fmaj9, G6/9, Cmaj9, Cadd9, Fmaj9, Bbmaj9, D9, G7. Syncopated piano chord hits, a bouncing walking bass, a bright vibraphone layer that sparkles on the off-beats and doubles the
//   melody an octave up in the second half, a whisper of ride and brushes.
//   Series night (the "night" group): Track 2 "追劇夜": D major, 70 beats a minute, a film-score feel after the usual toolkit of screen music: a simple piano motif and a rising ostinato in straight
//   eighths, a slow string pad and a cello line, a deep sub pedal and a low pulsing bass for weight, soft timpani-like hits, a filtered-noise swell before each turn, a wide reverb, and a long lyrical
//   melody (the second time round doubled by the vibraphone an octave up). Eight bars: Dmaj9, Gmaj9, Bm9, Aadd9, then D/F#, Gmaj7#11, A7sus4, A, back to the start.
// Chords are rolled low to high; there are small random differences in timing and loudness; the band goes through a soft compressor and a synthetic room reverb, with a very faint vinyl hiss.
// Nothing plays until the visitor taps (browsers allow sound only after a tap); a second tap, hiding the page or leaving stops it. start() must be called from inside that tap. In playlist
// mode a piece goes round again, with no gap, until the visitor stops it or leaves.
import { createPiano } from "./piano.js?v=auto";
import { createRoomSound } from "./cafe/sound.js?v=auto"; // Room 04's music engine plays the day piece
const realPiano = createPiano(), PIANO_K = 2.4; // PIANO_K scales the old synth levels to the louder piano samples
const hz = (midi) => 440 * Math.pow(2, (midi - 69) / 12); const BARS_PER_TRACK = 16; // a piece is sixteen bars (the day piece's whole form, or the night piece's eight bars twice)
const TRACKS = [
  // Series night: "bass" is a deep pedal and a low pulse under the bar; "chord" feeds the rising ostinato and the string pad.
  { title: "追劇夜", group: "night", style: "cinema", bpm: 70, swing: 0, send: 0.5,
    bars: [
      { bass: 38, chord: [54, 57, 61, 64], tune: [[0, 78, 3], [3, 81, 1]] },                      // Dmaj9: F# held, an A pickup
      { bass: 43, chord: [59, 62, 66, 69], tune: [[0, 83, 2], [2, 81, 1], [3, 78, 1]] },          // Gmaj9: B A F#
      { bass: 47, chord: [57, 61, 62, 66], tune: [[0, 81, 2], [2, 78, 2]] },                      // Bm9: A F#, the one soft shadow
      { bass: 45, chord: [57, 61, 64, 71], tune: [[0, 76, 2], [2, 81, 1.5], [3.5, 83, 0.5]] },    // Aadd9: E A, a step up to the B
      { bass: 42, chord: [57, 62, 66, 69], tune: [[0, 86, 3], [3, 85, 1]] },                      // D/F#: the high D, the C# leaning in
      { bass: 43, chord: [59, 62, 66, 73], tune: [[0, 83, 2], [2, 81, 1], [3, 78, 1]] },          // Gmaj7#11: a wide, floating colour
      { bass: 45, chord: [55, 62, 64, 69], tune: [[0, 81, 2], [2, 79, 1], [3, 78, 1]] },          // A7sus4: waiting
      { bass: 45, chord: [57, 61, 64, 69], tune: [[0, 76, 3], [3, 78, 1]] },                      // A: resolves, the F# leads back to the start
    ] },
];
const nextInGroup = (index) => { for (let k = 1; k <= TRACKS.length; k++) { const j = (index + k) % TRACKS.length; if (TRACKS[j].group === TRACKS[index].group) return j; } return index; };

// synthesised voices: [frequency ratio, level, wave, how much of the note's length the partial lasts (1 = all of it)]
const EPIANO = { partials: [[1, 0.6, "sine", 1], [1.003, 0.5, "sine", 1], [2, 0.22, "sine", 0.45], [3, 0.07, "triangle", 0.25], [7, 0.035, "sine", 0.12]], attack: 0.008, lowpass: 2800 }; // only the fallback if the piano samples cannot load
const VIBES = { partials: [[1, 0.7, "sine", 1], [4, 0.28, "sine", 0.3], [10, 0.05, "sine", 0.1]], attack: 0.004, lowpass: 5200, tremolo: 0.4 }; // a vibraphone bar: a fast-fading overtone and a gentle tremolo
const BASS = { partials: [[1, 1, "sine", 1], [2, 0.28, "triangle", 0.5], [3, 0.06, "sine", 0.3]], attack: 0.015, lowpass: 700 };
const SUB = { partials: [[1, 1, "sine", 1], [2, 0.12, "sine", 0.5]], attack: 0.25, lowpass: 400 };
const STRINGS = { partials: [[1, 0.5, "sawtooth", 1], [1.007, 0.5, "sawtooth", 1]], lowpass: 1100 };
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
    if (recipe.tremolo) { const trem = ctx.createGain(), lfo = ctx.createOscillator(), depth = ctx.createGain(); trem.gain.value = 1 - recipe.tremolo / 2; lfo.frequency.value = 5.2; depth.gain.value = recipe.tremolo / 2; lfo.connect(depth); depth.connect(trem.gain); lfo.start(time); lfo.stop(time + length + 0.05); out.connect(trem); last = trem; }
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

      const ext = [...bar.chord, bar.chord[0] + 12, bar.chord[1] + 12];
      [0, 1, 2, 3, 4, 5, 4, 3].forEach((pick, i) => piano(t0 + i * 0.5 * beat + jitter(5), ext[pick], vary(i % 4 === 0 ? 0.05 : 0.032), beat * 1.6, -0.2 + pick * 0.07)); // the rising ostinato, straight eighths
      note(t0, bar.bass, SUB, 0.22, barLength * 1.05); // a deep pedal under the bar
      for (let i = 0; i < 4; i++) note(t0 + i * beat + jitter(4), bar.bass, BASS, i === 0 ? 0.14 : 0.09, beat * 0.95); // a low pulse on every beat: the weight and drive
      note(t0, bar.bass + 12, CELLO, 0.03, barLength * 1.1, -0.35); // a cello line on the root
      bar.chord.forEach((midi, i) => note(t0, midi, STRINGS, 0.013, barLength * 1.2, (i % 2 ? 1 : -1) * (0.35 + 0.1 * i))); // a slow string pad, wide
      if (barIndex % 8 === 0 || barIndex % 8 === 4) drum(t0, 0.14); // soft timpani-like hits
      for (const [at, midi, length] of bar.tune) {
        const when = t0 + at * beat + jitter(6);
        piano(when, midi, vary(0.075), beat * (length + 0.6), 0.15); // a long, lyrical melody on the piano
        note(when, midi, STRING_LEAD, 0.016, beat * (length + 0.6), 0.25); // softly doubled by strings
        if (second) note(when, midi + 12, VIBES, vary(0.022), beat * (length + 1), -0.25); // the second time round, the vibraphone doubles it an octave up
      }
      if (barIndex % 8 === 6) swell(t0, barLength * 2); // a breath before the turn
    nextTime += barLength; barIndex += 1;
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
        master = ctx.createGain(); master.gain.setValueAtTime(0.0001, ctx.currentTime); master.gain.exponentialRampToValueAtTime(0.8, ctx.currentTime + 1.5); master.connect(ctx.destination);
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
      try { old.gain.cancelScheduledValues(ctx.currentTime); old.gain.setValueAtTime(Math.max(0.0001, old.gain.value), ctx.currentTime); old.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.9); } catch { /* the graph may already be gone */ }
      setTimeout(() => { try { oldHiss?.stop(); old?.disconnect(); } catch { /* already stopped */ } }, 1800);
    },
    next() { if (playing) { playlist = true; barIndex = BARS_PER_TRACK; } }, // QA: jump to the end of the piece (it goes round again)
    tracks: () => TRACKS.map((t) => t.title),
    state: () => ({ playing, context: ctx ? ctx.state : "none", bars: barIndex, notes: noteCount, track: trackIndex, title: TRACKS[trackIndex].title, group: TRACKS[trackIndex].group, playlist, piano: realPiano.ready() }),
  };
}

// Room 01's music: two pieces. The day piece (every mood except series night) is Room 04's first record, 慢板, played by Room 04's own music engine on the real piano, without the vinyl crackle, and
// at 100 beats a minute instead of 58 (Paul, 2026-11-17: the café is Shanghai, slowly, but the living room at golden hour wants a brisker, brighter tempo; the Room 04 records themselves are unchanged).
// In this room it keeps the name 窗邊的午後. The visitor may have heard it in the Shanghai café: a small echo between the rooms. Series night plays the cinematic piece above.
export function createRoomMusic() {
  const night = createNightMusic(), day = createRoomSound(), piano = createPiano();
  let active = "day";
  return {
    // Call from inside a tap. track: 0 is the day piece, 1 is series night. Returns true if it started.
    start(track = 0, options = {}) {
      night.stop(); day.stop();
      if (track === 0) { active = "day"; return day.start(0, false, { vinyl: false, bpm: 100 }); } // Room 04's first record (慢板) at a brisk 100 beats a minute instead of 58; it goes round until stopped
      active = "night"; return night.start(0, options);
    },
    stop() { day.stop(); night.stop(); },
    next() { if (active === "night") night.next(); }, // QA: the cinematic piece goes round again; the day piece simply keeps going
    tracks: () => ["窗邊的午後", "追劇夜"],
    state() {
      if (active === "night") return { ...night.state(), group: "night", piano: piano.ready() };
      const d = day.state(); return { playing: d.playing, context: d.context, bars: d.bars, notes: d.notes, track: 0, title: "窗邊的午後", group: "day", playlist: false, piano: piano.ready() };
    },
  };
}
