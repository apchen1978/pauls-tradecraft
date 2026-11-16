// Room 01's music (Paul, 2026-11-16: the living room has speakers but plays nothing; light music is welcome, it need not be jazz, and it must be original. Second round, same day: pleasant,
// but "not as good as the jazz", so give it a little jazz and some low-mid body).
// Two short, calm loops made entirely with the browser's own audio synthesis: no sound files, no samples, nothing borrowed. Both are written here note by note.
//   Track 1 "窗邊的午後": C major, 72 beats a minute, a light swing. A I-vi-ii-V turnaround (Cmaj9, Am9, Dm9, G13) with a soft walking bass, a swung electric-piano figure, brushes on two and
//   four and a few bell-like melody notes on top.
//   Track 2 "週日慢慢過": F major, 62 beats a minute, slower and sparser. Fmaj9, Gm9, C13, Fmaj9 over the same kind of bass.
// No drum kit and no crackle: the brushes are a whisper. Nothing plays until the visitor taps (browsers allow sound only after a tap); a second tap, hiding the page or the app's own time limit
// stops it. start() must be called from inside that tap; each new start plays the next track.
const hz = (midi) => 440 * Math.pow(2, (midi - 69) / 12);
const TRACKS = [
  { title: "窗邊的午後", bpm: 72, swing: 0.2, pattern: [0, 1, 2, 3, 2, 1, 2, 3],
    bars: [
      { walk: [36, 40, 43, 47], chord: [52, 55, 59, 62], pad: [55, 59, 64], tune: [[0, 76, 1.5], [1.5, 79, 1], [3, 74, 1]] },     // Cmaj9
      { walk: [33, 36, 40, 43], chord: [48, 52, 55, 59], pad: [55, 59, 64], tune: [[0.5, 72, 1.5], [2, 76, 1.5], [3.5, 71, 0.5]] }, // Am9
      { walk: [38, 41, 45, 48], chord: [53, 57, 60, 64], pad: [57, 60, 64], tune: [[0, 77, 1.5], [1.5, 81, 1], [3, 76, 1]] },     // Dm9
      { walk: [31, 35, 38, 41], chord: [53, 59, 62, 64], pad: [59, 62, 64], tune: [[0, 79, 1], [1, 76, 1.5], [3, 74, 1]] },       // G13
    ] },
  { title: "週日慢慢過", bpm: 62, swing: 0.22, pattern: [0, 2, 1, 3, 1, 2, 3, 2],
    bars: [
      { walk: [41, 45, 48, 52], chord: [57, 60, 64, 67], pad: [57, 60, 64], tune: [[0.5, 81, 2], [3, 79, 1]] },                   // Fmaj9
      { walk: [43, 46, 50, 53], chord: [58, 62, 65, 69], pad: [55, 58, 62], tune: [[0, 77, 1.5], [2, 74, 2]] },                   // Gm9
      { walk: [36, 40, 43, 46], chord: [58, 62, 64, 69], pad: [52, 58, 64], tune: [[0.5, 76, 1.5], [2.5, 81, 1.5]] },             // C13
      { walk: [41, 45, 48, 45], chord: [57, 60, 64, 67], pad: [57, 60, 64], tune: [[0, 79, 2], [2.5, 77, 1.5]] },                 // Fmaj9
    ] },
];

export function createRoomMusic() {
  let ctx = null, master = null, timer = 0, playing = false, nextTime = 0, barIndex = 0, noteCount = 0, trackIndex = 0, seed = 5, noise = null;
  const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647; // fixed seed: the same small variations every time
  const voice = (time, midi, gain, length, shape, attack, filterHz) => {
    const out = ctx.createGain(), filter = ctx.createBiquadFilter();
    filter.type = "lowpass"; filter.frequency.value = filterHz; filter.Q.value = 0.4;
    out.gain.setValueAtTime(0.0001, time); out.gain.exponentialRampToValueAtTime(gain, time + attack); out.gain.exponentialRampToValueAtTime(0.0001, time + length);
    for (const [ratio, level, type] of shape) {
      const osc = ctx.createOscillator(), g = ctx.createGain();
      osc.type = type; osc.frequency.value = hz(midi) * ratio; osc.detune.value = (rnd() - 0.5) * 7; g.gain.value = level;
      osc.connect(g); g.connect(out); osc.start(time); osc.stop(time + length + 0.05);
    }
    out.connect(filter); filter.connect(master); noteCount += 1;
  };
  const piano = (time, midi, gain, length) => voice(time, midi, gain, length, [[1, 1, "sine"], [2, 0.22, "sine"], [3, 0.05, "triangle"]], 0.012, 2300);
  const bell = (time, midi, gain, length) => voice(time, midi, gain, length, [[1, 1, "sine"], [2.01, 0.3, "sine"], [4.02, 0.07, "sine"]], 0.02, 3200);
  const pad = (time, midi, gain, length) => voice(time, midi, gain, length, [[1, 1, "triangle"], [1.003, 0.7, "triangle"]], length * 0.35, 900);
  const bass = (time, midi, gain, length) => voice(time, midi, gain, length, [[1, 1, "sine"], [2, 0.32, "triangle"], [3, 0.08, "sine"]], 0.018, 520); // a warm, round upright-bass-like tone
  const brush = (time, gain) => {
    const src = ctx.createBufferSource(), filter = ctx.createBiquadFilter(), g = ctx.createGain();
    if (!noise) { const length = Math.floor(ctx.sampleRate * 0.4); noise = ctx.createBuffer(1, length, ctx.sampleRate); const data = noise.getChannelData(0); let last = 0; for (let i = 0; i < length; i++) { last = last * 0.6 + (rnd() * 2 - 1) * 0.4; data[i] = last; } }
    src.buffer = noise; filter.type = "bandpass"; filter.frequency.value = 5200; filter.Q.value = 0.7;
    g.gain.setValueAtTime(0.0001, time); g.gain.exponentialRampToValueAtTime(gain, time + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, time + 0.17);
    src.connect(filter); filter.connect(g); g.connect(master); src.start(time); src.stop(time + 0.3);
  };
  const scheduleBar = () => {
    const track = TRACKS[trackIndex], beat = 60 / track.bpm, barLength = beat * 4, bar = track.bars[barIndex % track.bars.length], t0 = nextTime, swing = track.swing * beat;
    track.pattern.forEach((pick, i) => piano(t0 + i * 0.5 * beat + (i % 2 ? swing : 0), bar.chord[pick], i % 4 === 0 ? 0.085 : 0.05 + rnd() * 0.012, beat * 2.2)); // swung eighths: the off-beats lean late
    bar.walk.forEach((note, i) => bass(t0 + i * beat, note, i === 0 ? 0.2 : 0.15, beat * 0.92)); // a soft walking bass, one note on every beat
    brush(t0 + beat, 0.022); brush(t0 + 3 * beat, 0.022); brush(t0 + 1.66 * beat, 0.01); brush(t0 + 3.66 * beat, 0.01); // brushes on two and four, with the swung skip
    for (const note of bar.pad) pad(t0, note, 0.026, barLength * 1.08);
    for (const [at, note, length] of bar.tune) bell(t0 + at * beat, note, 0.06, beat * (length + 1.4));
    barIndex += 1; nextTime += barLength;
    timer = setTimeout(scheduleBar, Math.max(50, (nextTime - ctx.currentTime - 0.6) * 1000));
  };
  return {
    // Call from inside a tap. track: 0 or 1. Returns true if it started.
    start(track = 0) {
      if (playing) return true;
      const AudioContextClass = window.AudioContext || window.webkitAudioContext; if (!AudioContextClass) return false;
      try {
        ctx ??= new AudioContextClass(); ctx.resume?.();
        master = ctx.createGain(); master.gain.setValueAtTime(0.0001, ctx.currentTime); master.gain.exponentialRampToValueAtTime(1.15, ctx.currentTime + 1.5); master.connect(ctx.destination);
        trackIndex = ((track % TRACKS.length) + TRACKS.length) % TRACKS.length; seed = 5 + trackIndex * 17;
        playing = true; barIndex = 0; noteCount = 0; nextTime = ctx.currentTime + 0.25; scheduleBar();
        return true;
      } catch { playing = false; return false; }
    },
    stop() {
      if (!playing) return;
      playing = false; clearTimeout(timer); timer = 0;
      const old = master;
      try { old.gain.cancelScheduledValues(ctx.currentTime); old.gain.setValueAtTime(Math.max(0.0001, old.gain.value), ctx.currentTime); old.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.8); } catch { /* the graph may already be gone */ }
      setTimeout(() => { try { old?.disconnect(); } catch { /* already stopped */ } }, 1600);
    },
    tracks: () => TRACKS.map((t) => t.title),
    state: () => ({ playing, context: ctx ? ctx.state : "none", bars: barIndex, notes: noteCount, track: trackIndex, title: TRACKS[trackIndex].title }),
  };
}
