// Room 04's records. 2026-11-17: the keyboard is now a real piano (sampled) and the wind-like lead is gone; the second piece is in brighter major harmony; the crackle is 70 percent of what it was. (Paul, 2026-11-16: the record player turns but plays nothing; the room is called Shanghai, Slowly). Three short jazz loops made entirely with the browser's own audio
// synthesis: no sound files. Track 1 "慢板" is a slow ii-V-I in C (Dm9, G13, Cmaj9, Am9, about 58 beats a minute, a lazy swing); track 2 "午後弄堂" is a lighter bossa-style loop in F (Fmaj9, Dm9,
// Gm9, C13, about 74 beats a minute). Each has an electric-piano chord on the bar, a soft bass, a few sparse melody notes, brushed hi-hat, and the faint crackle and hiss of vinyl (turned
// down by 30% at Paul's ear). In the rain mood a soft rain sits under the music. Nothing plays until the visitor taps the record player (browsers allow sound only after a tap); a second tap,
// the 30 s limit or hiding the page stops it. start() must be called from inside that tap; each new start plays the next track. Track 3, 夜色外灘, is an old-Shanghai night piece (C minor, 66 beats a
// minute, a heavy swing, a muted-trumpet-like lead over the piano); the first start after closing or on series night plays it.
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
  const scheduleBar = () => { if (playlist && barIndex >= BARS_PER_TRACK) { trackIndex = (trackIndex + 1) % TRACKS.length; seed = 7 + trackIndex * 31; barIndex = 0; const changed = trackIndex; setTimeout(() => { if (playing) onTrack?.(changed); }, Math.max(0, (nextTime - ctx.currentTime) * 1000)); } // the next piece starts on the next bar; the page hears about it when its first note sounds
    const track = TRACKS[trackIndex], beat = 60 / (tempo || track.bpm), barLength = beat * 4, bar = track.bars[barIndex % track.bars.length], t0 = nextTime;
    for (const [at, level] of track.stabs) bar.chord.forEach((note, i) => piano(t0 + at * beat + i * 0.045, note, level, barLength * (at ? 0.4 : 0.95), track.filter)); // the strum, and a stab where the loop has one
    for (const [at, shift, length] of track.bass) bass(t0 + at * beat, bar.bass + shift, beat * length);
    for (const [at, level, swung] of track.brush) brush(t0 + at * beat + (swung ? track.swing * beat : 0), level);
    let at = 0.5 + rnd() * 0.5; // a few sparse melody notes, in the gaps
    while (at < 3.7) { const note = bar.melody[Math.floor(rnd() * bar.melody.length)]; piano(t0 + at * beat, note, 0.07, beat * (1.6 + rnd()), track.filter); at += 0.9 + rnd() * 1.6; }
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
    // Call from inside a tap. track: 0 or 1; rain: true in the rain mood. Returns true if it started.
    start(track = 0, rain = false, options = {}) {
      if (playing) return true;
      const AudioContextClass = window.AudioContext || window.webkitAudioContext; if (!AudioContextClass) return false;
      try {
        ctx ??= new AudioContextClass(); ctx.resume?.();
        master = ctx.createGain(); master.gain.setValueAtTime(0.0001, ctx.currentTime); master.gain.exponentialRampToValueAtTime(0.9, ctx.currentTime + (options.fade ?? 1.2)); master.connect(ctx.destination);
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
    next() { if (playing) { playlist = true; barIndex = BARS_PER_TRACK; } }, // QA: jump to the next piece at the next bar
    tracks: () => TRACKS.map((t) => t.title),
    state: () => ({ playing, context: ctx ? ctx.state : "none", bars: barIndex, notes: noteCount, track: trackIndex, title: TRACKS[trackIndex].title, rain: Boolean(rainNode), playlist }),
  };
}
