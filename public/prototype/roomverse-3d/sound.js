// Room 01's music (Paul, 2026-11-16: the living room has speakers but plays nothing; light music is welcome, it need not be jazz, and it must be original).
// Two short, calm loops made entirely with the browser's own audio synthesis: no sound files, no samples, nothing borrowed. Both are written here note by note.
//   Track 1 "窗邊的午後": C major, 72 beats a minute. Cmaj7, Am7, Fmaj7, G6 under a soft piano arpeggio, a slow warm pad and a few bell-like melody notes.
//   Track 2 "週日慢慢過": F major, 62 beats a minute. Fmaj7, Em7, Dm7, Cadd9, a little slower and sparser.
// There are no drums and no crackle: it is the quiet kind of music. Nothing plays until the visitor taps a speaker (browsers allow sound only after a tap); a second tap, hiding
// the page or the app's own time limit stops it. start() must be called from inside that tap; each new start plays the next track.
const hz = (midi) => 440 * Math.pow(2, (midi - 69) / 12);
const TRACKS = [
  { title: "窗邊的午後", bpm: 72, pattern: [0, 1, 2, 3, 2, 1, 2, 3],
    bars: [
      { bass: 36, chord: [48, 55, 59, 64], pad: [60, 64, 67], tune: [[0, 76, 1.5], [1.5, 79, 1], [3, 74, 1]] },   // Cmaj7
      { bass: 33, chord: [45, 52, 55, 60], pad: [57, 60, 64], tune: [[0.5, 72, 1.5], [2, 76, 1.5], [3.5, 74, 0.5]] }, // Am7
      { bass: 41, chord: [41, 48, 52, 57], pad: [57, 60, 65], tune: [[0, 77, 1.5], [1.5, 81, 1], [3, 79, 1]] },   // Fmaj7
      { bass: 43, chord: [43, 50, 55, 59], pad: [59, 62, 67], tune: [[0, 79, 1], [1, 76, 1.5], [3, 74, 1]] },     // G6
    ] },
  { title: "週日慢慢過", bpm: 62, pattern: [0, 2, 1, 3, 1, 2, 3, 2],
    bars: [
      { bass: 41, chord: [41, 48, 52, 57], pad: [57, 60, 64], tune: [[0.5, 81, 2], [3, 79, 1]] },                   // Fmaj7
      { bass: 40, chord: [40, 47, 50, 55], pad: [55, 59, 62], tune: [[0, 79, 1.5], [2, 76, 2]] },                   // Em7
      { bass: 38, chord: [38, 45, 48, 53], pad: [53, 57, 60], tune: [[0.5, 77, 1.5], [2.5, 81, 1.5]] },             // Dm7
      { bass: 36, chord: [36, 43, 50, 55], pad: [55, 60, 64], tune: [[0, 76, 2], [2.5, 72, 1.5]] },                 // Cadd9
    ] },
];

export function createRoomMusic() {
  let ctx = null, master = null, timer = 0, playing = false, nextTime = 0, barIndex = 0, noteCount = 0, trackIndex = 0, seed = 5;
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
  const scheduleBar = () => {
    const track = TRACKS[trackIndex], beat = 60 / track.bpm, barLength = beat * 4, bar = track.bars[barIndex % track.bars.length], t0 = nextTime;
    track.pattern.forEach((pick, i) => piano(t0 + i * 0.5 * beat, bar.chord[pick], i % 4 === 0 ? 0.085 : 0.05 + rnd() * 0.012, beat * 2.2));
    piano(t0, bar.bass, 0.11, beat * 3);
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
        master = ctx.createGain(); master.gain.setValueAtTime(0.0001, ctx.currentTime); master.gain.exponentialRampToValueAtTime(1.4, ctx.currentTime + 1.5); master.connect(ctx.destination);
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
