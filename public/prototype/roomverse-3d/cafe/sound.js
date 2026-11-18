// Room 04's records. 2026-11-17: the keyboard is now a real piano (sampled) and the wind-like lead is gone; the second piece is in brighter major harmony; the crackle is 70 percent of what it was. (Paul, 2026-11-16: the record player turns but plays nothing; the room is called Shanghai, Slowly). Three short jazz loops made entirely with the browser's own audio
// synthesis: no sound files. Track 1 "慢板" is a slow ii-V-I in C (Dm9, G13, Cmaj9, Am9, about 58 beats a minute, a lazy swing); track 2 "午後弄堂" is a lighter bossa-style loop in F (Fmaj9, Dm9,
// Gm9, C13, about 74 beats a minute). Each has an electric-piano chord on the bar, a soft bass, a few sparse melody notes, brushed hi-hat, and the faint crackle and hiss of vinyl (turned
// down by 30% at Paul's ear). In the rain mood a soft rain sits under the music. Nothing plays until the visitor taps the record player (browsers allow sound only after a tap); a second tap,
// the 30 s limit or hiding the page stops it. start() must be called from inside that tap; each new start plays the next track. Track 3, 夜色外灘, is an old-Shanghai night piece (C minor, 66 beats a
// minute, a heavy swing, a muted-trumpet-like lead over the piano); the first start after closing or on series night plays it.
// Track 4, 十里洋場 (Bund Swing; Paul 2026-11-18: an old-Shanghai 1930s dance-hall swing, much more joyful): F major, 152 beats a minute, a bouncy swing. A written 8-bar tune
// (F6 D7 Gm7 C7 F6 F7 Bb6 C7) on a clarinet-like reed, then a muted-trumpet-like chorus, a piano chorus, and a last chorus with reed and trumpet together; a walking bass on every
// beat, a soft kick, swing brushes, and short Charleston piano stabs.
import { createPiano } from "../piano.js?v=auto"; // a real piano (Salamander Grand Piano, CC BY 3.0, credited on the page): the synthesised keyboard sounded like MIDI
const realPiano = createPiano(), PIANO_K = 3.2; // PIANO_K scales the old synth levels to the louder samples
const hz = (midi) => 440 * Math.pow(2, (midi - 69) / 12); const BARS_PER_TRACK = 12; // playlist mode (Paul, 2026-11-17): each piece plays three times through its four chords (about 40 to 50 s), then the next one follows with no gap, until the visitor stops it or leaves
const TRACKS = [
  { title: "慢板", bpm: 58, swing: 0.18, filter: 2100, bass: [[0, 0, 1.8], [2.5, 7, 1.2]], brush: [[1, 0.05, true], [3, 0.05, true], [1.66, 0.022], [3.66, 0.022]], stabs: [[0, 0.085]],
    bars: [
      { chord: [50, 57, 60, 64, 65], bass: 38, melody: [69, 72, 74, 76, 77] },   // Dm9
      { chord: [43, 53, 59, 64, 69], bass: 43, melody: [71, 74, 76, 79, 81] },   // G13
      { chord: [48, 55, 59, 62, 64], bass: 36, melody: [72, 74, 76, 79, 83] },   // Cmaj9
      { chord: [45, 55, 60, 64, 67], bass: 45, melody: [72, 76, 79, 81, 84] },   // Am9
    ] },
  { title: "午後弄堂", bpm: 74, swing: 0.08, filter: 2600, bass: [[0, 0, 1.0], [1.5, 7, 0.8], [2.5, 0, 1.0], [3.5, 7, 0.6]], brush: [[0.5, 0.03], [1, 0.045, true], [1.5, 0.03], [2.5, 0.03], [3, 0.045, true], [3.5, 0.03]], stabs: [[0, 0.08], [2.5, 0.05]],
    bars: [
      { chord: [53, 57, 60, 64, 67], bass: 41, melody: [69, 72, 74, 77, 79] },   // Fmaj9
      { chord: [58, 62, 65, 69, 72], bass: 46, melody: [70, 72, 74, 77, 81] },   // Bbmaj9
      { chord: [53, 57, 60, 64, 67], bass: 45, melody: [69, 72, 74, 76, 79] },   // Fmaj9/A
      { chord: [52, 58, 62, 64, 69], bass: 36, melody: [69, 72, 74, 76, 77] },   // C13
    ] },
  { title: "夜色外灘", bpm: 66, swing: 0.22, filter: 2000, bass: [[0, 0, 1.4], [1.5, 7, 0.8], [2.5, 0, 1.0], [3.5, -2, 0.5]], brush: [[1, 0.05, true], [3, 0.05, true], [1.66, 0.025], [3.66, 0.025]], stabs: [[0, 0.08], [2.5, 0.045]],
    bars: [
      { chord: [48, 55, 60, 63, 69], bass: 36, melody: [72, 75, 77, 79, 81] },   // Cm6
      { chord: [53, 56, 60, 62, 65], bass: 41, melody: [68, 72, 75, 77, 80] },   // Fm6
      { chord: [48, 55, 59, 63, 67], bass: 36, melody: [72, 74, 75, 79, 83] },   // Cm(maj7)
      { chord: [43, 53, 59, 62, 68], bass: 43, melody: [71, 74, 77, 79, 80] },   // G7b9
    ] },
  { title: "十里洋場", bpm: 152, swing: 0.16, filter: 3200, length: 32, strum: 0.012, short: 0.16, kick: 0.16, lead: true, sparse: false,
    bass: [], brush: [[0, 0.03], [1, 0.055], [1.5, 0.028, true], [2, 0.03], [3, 0.055], [3.5, 0.028, true]], stabs: [[0, 0.075], [1.5, 0.06]],
    bars: [ // walk: the bass's four quarter notes; tune: [beat, note, beats] (off-beat eighths are swung)
      { chord: [57, 60, 62, 65], bass: 41, walk: [41, 45, 48, 50], melody: [72, 74, 77, 81], tune: [[0, 72, .5], [.5, 74, .5], [1, 77, 1], [2, 81, .5], [2.5, 79, .5], [3, 77, 1]] },   // F6
      { chord: [54, 57, 60, 62], bass: 38, walk: [38, 42, 45, 48], melody: [74, 78, 81, 84], tune: [[0, 78, 1.5], [1.5, 81, .5], [2, 84, .5], [2.5, 81, .5], [3, 78, 1]] },             // D7
      { chord: [55, 58, 62, 65], bass: 43, walk: [43, 46, 50, 47], melody: [74, 77, 79, 82], tune: [[0, 79, .5], [.5, 82, .5], [1, 86, 1], [2, 84, .5], [2.5, 82, .5], [3, 79, 1]] },   // Gm7
      { chord: [52, 55, 58, 60], bass: 36, walk: [36, 40, 43, 40], melody: [72, 76, 79, 82], tune: [[0, 76, .5], [.5, 79, .5], [1, 82, .5], [1.5, 81, .5], [2, 79, 1.5], [3.5, 76, .5]] }, // C7
      { chord: [57, 60, 62, 65], bass: 41, walk: [41, 45, 48, 50], melody: [77, 81, 84, 86], tune: [[0, 77, .5], [.5, 81, .5], [1, 84, 1], [2, 86, .5], [2.5, 84, .5], [3, 81, 1]] },   // F6
      { chord: [53, 57, 60, 63], bass: 41, walk: [41, 45, 48, 51], melody: [75, 77, 81, 84], tune: [[0, 75, .5], [.5, 77, .5], [1, 81, .5], [1.5, 84, .5], [2, 87, 1], [3, 84, 1]] },  // F7
      { chord: [58, 62, 65, 67], bass: 46, walk: [46, 50, 53, 47], melody: [77, 79, 82, 86], tune: [[0, 77, .5], [.5, 79, .5], [1, 82, 1], [2, 86, .5], [2.5, 82, .5], [3, 79, 1]] },   // Bb6
      { chord: [52, 55, 58, 64], bass: 36, walk: [48, 46, 43, 40], melody: [72, 76, 79, 82], tune: [[0, 79, .5], [.5, 76, .5], [1, 72, 1], [2, 70, .5], [2.5, 76, .5], [3, 77, 1]] },   // C7
    ] },
];

export function createRoomSound() {
  let ctx = null, master = null, timer = 0, playing = false, nextTime = 0, barIndex = 0, noteCount = 0, crackle = null, seed = 7, nseed = 11, trackIndex = 0, rainNode = null, rainBuffer = null, playlist = false, onTrack = null, runId = 0, tempo = 0;
  const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647; // fixed seed: the same melody every time, like a record
  const nrnd = () => (nseed = (nseed * 16807) % 2147483647) / 2147483647; // the noise has its own seed so it never shifts the melody
  const noiseBuffer = (seconds, kind) => {
    const length = Math.floor(ctx.sampleRate * seconds), buffer = ctx.createBuffer(1, length, ctx.sampleRate), data = buffer.getChannelData(0);
    let last = 0;
    for (let i = 0; i < length; i++) {
      if (kind === "crackle") data[i] = (nrnd() < 0.0007 ? (nrnd() * 2 - 1) * 0.9 : 0) + (nrnd() * 2 - 1) * 0.006; // sparse pops and a little hiss
      else { last = last * 0.6 + (nrnd() * 2 - 1) * 0.4; data[i] = last; } // soft noise for the brush and the rain
    }
    return buffer;
  };
  const epiano = (time, midi, gain, length, filterHz) => { // the fallback if the piano samples cannot load: a soft electric piano: a sine, a quiet octave above and a fast decay, through a low-pass filter
    const out = ctx.createGain(), filter = ctx.createBiquadFilter();
    filter.type = "lowpass"; filter.frequency.value = filterHz; filter.Q.value = 0.5;
    out.gain.setValueAtTime(0.0001, time); out.gain.exponentialRampToValueAtTime(gain, time + 0.012); out.gain.exponentialRampToValueAtTime(0.0001, time + length);
    for (const [ratio, level, type] of [[1, 1, "sine"], [2, 0.26, "sine"], [4, 0.05, "triangle"]]) {
      const osc = ctx.createOscillator(), g = ctx.createGain();
      osc.type = type; osc.frequency.value = hz(midi) * ratio; osc.detune.value = (rnd() - 0.5) * 8; g.gain.value = level;
      osc.connect(g); g.connect(out); osc.start(time); osc.stop(time + length + 0.05);
    }
    out.connect(filter); filter.connect(master); noteCount += 1;
  };
  const piano = (time, midi, gain, length, filterHz) => { if (realPiano.play(ctx, master, time, midi, gain * PIANO_K, length)) { noteCount += 1; return; } epiano(time, midi, gain, length, filterHz); }; // a real piano note, or the synth fallback
  const bass = (time, midi, length) => {
    const osc = ctx.createOscillator(), g = ctx.createGain();
    osc.type = "sine"; osc.frequency.value = hz(midi);
    g.gain.setValueAtTime(0.0001, time); g.gain.exponentialRampToValueAtTime(0.34, time + 0.03); g.gain.exponentialRampToValueAtTime(0.0001, time + length);
    osc.connect(g); g.connect(master); osc.start(time); osc.stop(time + length + 0.05); noteCount += 1;
  };
  const brush = (time, gain) => {
    const src = ctx.createBufferSource(), filter = ctx.createBiquadFilter(), g = ctx.createGain();
    src.buffer = brush.buffer ??= noiseBuffer(0.4, "noise"); filter.type = "bandpass"; filter.frequency.value = 5200; filter.Q.value = 0.7;
    g.gain.setValueAtTime(0.0001, time); g.gain.exponentialRampToValueAtTime(gain, time + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, time + 0.18);
    src.connect(filter); filter.connect(g); g.connect(master); src.start(time); src.stop(time + 0.3);
  };
  const lead = (time, midi, gain, length, kind) => { // a clarinet-like reed (square and a little triangle, a soft low-pass, a late vibrato) or a muted-trumpet-like horn (a sawtooth whose filter opens on each note)
    const osc = ctx.createOscillator(), osc2 = ctx.createOscillator(), filter = ctx.createBiquadFilter(), g = ctx.createGain(), vib = ctx.createOscillator(), vibDepth = ctx.createGain();
    const trumpet = kind === "trumpet";
    osc.type = trumpet ? "sawtooth" : "square"; osc2.type = "triangle"; osc.frequency.value = hz(midi); osc2.frequency.value = hz(midi) * 2;
    vib.frequency.value = 5.6; vibDepth.gain.setValueAtTime(0, time); vibDepth.gain.linearRampToValueAtTime(hz(midi) * 0.004, time + Math.min(length, 0.25)); vib.connect(vibDepth); vibDepth.connect(osc.frequency);
    filter.type = "lowpass"; filter.Q.value = trumpet ? 2.2 : 0.7;
    if (trumpet) { filter.frequency.setValueAtTime(700, time); filter.frequency.exponentialRampToValueAtTime(2600, time + 0.05); filter.frequency.exponentialRampToValueAtTime(1500, time + length); } else filter.frequency.value = 2300;
    const peak = gain * (trumpet ? 0.8 : 1);
    g.gain.setValueAtTime(0.0001, time); g.gain.exponentialRampToValueAtTime(peak, time + (trumpet ? 0.018 : 0.03)); g.gain.setValueAtTime(peak * 0.82, time + Math.max(0.04, length - 0.06)); g.gain.exponentialRampToValueAtTime(0.0001, time + length + 0.05);
    const g2 = ctx.createGain(); g2.gain.value = 0.12; osc2.connect(g2); g2.connect(filter); osc.connect(filter); filter.connect(g); g.connect(master);
    for (const o of [osc, osc2, vib]) { o.start(time); o.stop(time + length + 0.1); } noteCount += 1;
  };
  const kick = (time, gain) => { // a soft feathered bass drum on every beat
    const osc = ctx.createOscillator(), g = ctx.createGain();
    osc.type = "sine"; osc.frequency.setValueAtTime(110, time); osc.frequency.exponentialRampToValueAtTime(48, time + 0.12);
    g.gain.setValueAtTime(0.0001, time); g.gain.exponentialRampToValueAtTime(gain, time + 0.006); g.gain.exponentialRampToValueAtTime(0.0001, time + 0.16);
    osc.connect(g); g.connect(master); osc.start(time); osc.stop(time + 0.2);
  };
  const scheduleBar = () => { if (playlist && barIndex >= (TRACKS[trackIndex].length || BARS_PER_TRACK)) { trackIndex = (trackIndex + 1) % TRACKS.length; seed = 7 + trackIndex * 31; barIndex = 0; const changed = trackIndex; setTimeout(() => { if (playing) onTrack?.(changed); }, Math.max(0, (nextTime - ctx.currentTime) * 1000)); } // the next piece starts on the next bar; the page hears about it when its first note sounds
    const track = TRACKS[trackIndex], beat = 60 / (tempo || track.bpm), barLength = beat * 4, bar = track.bars[barIndex % track.bars.length], t0 = nextTime;
    for (const [at, level] of track.stabs) bar.chord.forEach((note, i) => piano(t0 + at * beat + (track.lead && at % 1 ? track.swing * beat : 0) + i * (track.strum ?? 0.045), note, level, barLength * (track.short ?? (at ? 0.4 : 0.95)), track.filter)); // the strum, and a stab where the loop has one
    for (const [at, shift, length] of track.bass) bass(t0 + at * beat, bar.bass + shift, beat * length);
    if (bar.walk) bar.walk.forEach((note, i) => bass(t0 + i * beat, note, beat * 0.92)); // a walking bass: one note on every beat
    if (track.kick) for (let i = 0; i < 4; i++) kick(t0 + i * beat, track.kick * (i % 2 ? 0.7 : 1));
    for (const [at, level, swung] of track.brush) brush(t0 + at * beat + (swung ? track.swing * beat : 0), level);
    const chorus = Math.floor(barIndex / track.bars.length) % 4; // the written tune: reed, then horn, then a piano chorus, then reed and horn together
    if (track.lead && bar.tune && chorus !== 2) for (const [at, note, beats] of bar.tune) {
      const t = t0 + at * beat + (at % 1 ? track.swing * beat : 0), len = beats * beat * 0.9;
      if (chorus !== 1) lead(t, note, 0.06, len, "reed");
      if (chorus !== 0) lead(t, chorus === 3 ? note - 12 : note, chorus === 3 ? 0.04 : 0.055, len, "trumpet");
    }
    let at = 0.5 + rnd() * 0.5; // a few sparse melody notes, in the gaps
    while ((track.sparse !== false || chorus === 2) && at < 3.7) { const note = bar.melody[Math.floor(rnd() * bar.melody.length)]; piano(t0 + at * beat, note, 0.07, beat * (1.6 + rnd()), track.filter); at += 0.9 + rnd() * 1.6; }
    barIndex += 1; nextTime += barLength;
    timer = setTimeout(scheduleBar, Math.max(50, (nextTime - ctx.currentTime - 0.6) * 1000));
  };
  const startRain = () => { // a soft, steady rain under the music (band-passed noise); only while a record plays
    if (!ctx || !playing || rainNode) return;
    const src = ctx.createBufferSource(), band = ctx.createBiquadFilter(), high = ctx.createBiquadFilter(), g = ctx.createGain();
    rainBuffer ??= noiseBuffer(4, "noise"); src.buffer = rainBuffer; src.loop = true;
    band.type = "bandpass"; band.frequency.value = 1500; band.Q.value = 0.35; high.type = "highpass"; high.frequency.value = 500;
    g.gain.setValueAtTime(0.0001, ctx.currentTime); g.gain.exponentialRampToValueAtTime(0.11, ctx.currentTime + 1.5);
    src.connect(band); band.connect(high); high.connect(g); g.connect(master); src.start(); rainNode = { src, g };
  };
  const stopRain = () => {
    if (!rainNode) return;
    const { src, g } = rainNode; rainNode = null;
    try { g.gain.cancelScheduledValues(ctx.currentTime); g.gain.setValueAtTime(Math.max(0.0001, g.gain.value), ctx.currentTime); g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 1); } catch { /* gone */ }
    setTimeout(() => { try { src.stop(); } catch { /* already stopped */ } }, 1200);
  };
  return {
    // Call from inside a tap. track: 0 or 1; rain: true in the rain mood. Returns true if it started. options.level scales the volume (default 1; Room 03 asks for more so this softer piece sits beside Room 02's).
    start(track = 0, rain = false, options = {}) {
      if (playing) return true;
      const AudioContextClass = window.AudioContext || window.webkitAudioContext; if (!AudioContextClass) return false;
      try {
        ctx ??= new AudioContextClass(); ctx.resume?.();
        master = ctx.createGain(); master.gain.setValueAtTime(0.0001, ctx.currentTime); master.gain.exponentialRampToValueAtTime(0.9 * (options.level ?? 1), ctx.currentTime + (options.fade ?? 1.2)); master.connect(ctx.destination);
        crackle = options.vinyl === false ? null : ctx.createBufferSource(); if (crackle) { crackle.buffer = noiseBuffer(3, "crackle"); crackle.loop = true; } // vinyl: false (Room 01 borrows this piece) leaves the record crackle out
        if (crackle) { const crackleFilter = ctx.createBiquadFilter(), crackleGain = ctx.createGain(); crackleFilter.type = "highpass"; crackleFilter.frequency.value = 1400; crackleGain.gain.value = 0.126; // 0.55 x 0.7
        crackle.connect(crackleFilter); crackleFilter.connect(crackleGain); crackleGain.connect(master); crackle.start(); }
        trackIndex = ((track % TRACKS.length) + TRACKS.length) % TRACKS.length; seed = 7 + trackIndex * 31; playlist = Boolean(options.playlist); onTrack = options.onTrack ?? null; tempo = options.bpm ?? 0;
        playing = true; barIndex = 0; noteCount = 0; const run = ++runId; realPiano.load(ctx).then(() => { if (!playing || run !== runId) return; nextTime = ctx.currentTime + 0.25; scheduleBar(); }); // the piano samples load on the first tap (about 1 MB, once); the first bar waits for them
        if (rain) startRain();
        return true;
      } catch { playing = false; return false; }
    },
    stop() {
      if (!playing) return;
      playing = false; clearTimeout(timer); timer = 0; stopRain();
      const old = master, oldCrackle = crackle;
      try { old.gain.cancelScheduledValues(ctx.currentTime); old.gain.setValueAtTime(Math.max(0.0001, old.gain.value), ctx.currentTime); old.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.6); } catch { /* the graph may already be gone */ }
      setTimeout(() => { try { oldCrackle?.stop(); old?.disconnect(); } catch { /* already stopped */ } }, 1400);
    },
    setRain(on) { if (on) startRain(); else stopRain(); },
    next() { if (playing) { playlist = true; barIndex = 9999; } }, // QA: jump to the next piece at the next bar
    tracks: () => TRACKS.map((t) => t.title),
    state: () => ({ playing, context: ctx ? ctx.state : "none", bars: barIndex, notes: noteCount, track: trackIndex, title: TRACKS[trackIndex].title, rain: Boolean(rainNode), playlist }),
  };
}
