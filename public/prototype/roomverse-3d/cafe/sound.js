// Room 04's slow record (Paul, 2026-11-16: the record player turns but plays nothing; the room is called Shanghai, Slowly). A short slow jazz loop made entirely with the browser's own
// audio synthesis: no sound files. An electric-piano chord on each bar (Dm9 - G13 - Cmaj9 - Am9, about 58 beats a minute with a lazy swing), a soft bass note, a few sparse melody notes, brushed
// hi-hat on the second and fourth beat, and the faint crackle and hiss of vinyl. Nothing plays until the visitor taps the record player (the browser allows sound only after a tap), and a
// second tap, the 30 s limit or hiding the page stops it. start() must be called from inside that tap.
const BPM = 58, BEAT = 60 / BPM, BAR = BEAT * 4, SWING = 0.18;
const hz = (midi) => 440 * Math.pow(2, (midi - 69) / 12);
// each bar: the chord (MIDI notes, played as a soft strum), the bass note, and notes the melody may use (chord tones and 9ths)
const BARS = [
  { chord: [50, 57, 60, 64, 65], bass: 38, melody: [69, 72, 74, 76, 77] },   // Dm9
  { chord: [43, 53, 59, 64, 69], bass: 43, melody: [71, 74, 76, 79, 81] },   // G13
  { chord: [48, 55, 59, 62, 64], bass: 36, melody: [72, 74, 76, 79, 83] },   // Cmaj9
  { chord: [45, 55, 60, 64, 67], bass: 45, melody: [72, 76, 79, 81, 84] },   // Am9
];

export function createRoomSound() {
  let ctx = null, master = null, timer = 0, playing = false, nextTime = 0, barIndex = 0, noteCount = 0, crackle = null, seed = 7;
  const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647; // fixed seed: the same melody every time, like a record
  const noiseBuffer = (seconds, kind) => {
    const length = Math.floor(ctx.sampleRate * seconds), buffer = ctx.createBuffer(1, length, ctx.sampleRate), data = buffer.getChannelData(0);
    let last = 0;
    for (let i = 0; i < length; i++) {
      if (kind === "crackle") data[i] = (rnd() < 0.0007 ? (rnd() * 2 - 1) * 0.9 : 0) + (rnd() * 2 - 1) * 0.012; // sparse pops and a little hiss
      else { last = last * 0.6 + (rnd() * 2 - 1) * 0.4; data[i] = last; } // soft noise for the brush
    }
    return buffer;
  };
  const piano = (time, midi, gain, length) => { // a soft electric piano: a sine, a quiet octave above and a fast decay, through a low-pass filter
    const out = ctx.createGain(), filter = ctx.createBiquadFilter();
    filter.type = "lowpass"; filter.frequency.value = 2100; filter.Q.value = 0.5;
    out.gain.setValueAtTime(0.0001, time); out.gain.exponentialRampToValueAtTime(gain, time + 0.012); out.gain.exponentialRampToValueAtTime(0.0001, time + length);
    for (const [ratio, level, type] of [[1, 1, "sine"], [2, 0.26, "sine"], [4, 0.05, "triangle"]]) {
      const osc = ctx.createOscillator(), g = ctx.createGain();
      osc.type = type; osc.frequency.value = hz(midi) * ratio; osc.detune.value = (rnd() - 0.5) * 8; g.gain.value = level;
      osc.connect(g); g.connect(out); osc.start(time); osc.stop(time + length + 0.05);
    }
    out.connect(filter); filter.connect(master); noteCount += 1;
  };
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
  const scheduleBar = () => {
    const bar = BARS[barIndex % BARS.length], t0 = nextTime;
    bar.chord.forEach((note, i) => piano(t0 + i * 0.045, note, 0.085, BAR * 0.95)); // the strum
    bass(t0, bar.bass, BEAT * 1.8); bass(t0 + BEAT * 2.5, bar.bass + 7, BEAT * 1.2);
    for (const beat of [1, 3]) brush(t0 + beat * BEAT + (beat % 2 ? SWING * BEAT : 0), 0.05);
    brush(t0 + 1.66 * BEAT, 0.022); brush(t0 + 3.66 * BEAT, 0.022); // the swung off-beats
    let at = 0.5 + rnd() * 0.5; // a few sparse melody notes, in the gaps
    while (at < 3.7) { piano(t0 + at * BEAT, bar.melody[Math.floor(rnd() * bar.melody.length)], 0.07, BEAT * (1.6 + rnd())); at += 0.9 + rnd() * 1.6; }
    barIndex += 1; nextTime += BAR;
    timer = setTimeout(scheduleBar, Math.max(50, (nextTime - ctx.currentTime - 0.6) * 1000));
  };
  return {
    // Call from inside a tap. Returns true if it started.
    start() {
      if (playing) return true;
      const AudioContextClass = window.AudioContext || window.webkitAudioContext; if (!AudioContextClass) return false;
      try {
        ctx ??= new AudioContextClass(); ctx.resume?.();
        master = ctx.createGain(); master.gain.setValueAtTime(0.0001, ctx.currentTime); master.gain.exponentialRampToValueAtTime(0.9, ctx.currentTime + 1.2); master.connect(ctx.destination);
        crackle = ctx.createBufferSource(); crackle.buffer = noiseBuffer(3, "crackle"); crackle.loop = true;
        const crackleFilter = ctx.createBiquadFilter(), crackleGain = ctx.createGain(); crackleFilter.type = "highpass"; crackleFilter.frequency.value = 1400; crackleGain.gain.value = 0.55;
        crackle.connect(crackleFilter); crackleFilter.connect(crackleGain); crackleGain.connect(master); crackle.start();
        playing = true; barIndex = 0; noteCount = 0; nextTime = ctx.currentTime + 0.25; scheduleBar();
        return true;
      } catch { playing = false; return false; }
    },
    stop() {
      if (!playing) return;
      playing = false; clearTimeout(timer); timer = 0;
      const old = master, oldCrackle = crackle;
      try { old.gain.cancelScheduledValues(ctx.currentTime); old.gain.setValueAtTime(Math.max(0.0001, old.gain.value), ctx.currentTime); old.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.6); } catch { /* the graph may already be gone */ }
      setTimeout(() => { try { oldCrackle?.stop(); old?.disconnect(); } catch { /* already stopped */ } }, 800);
    },
    state: () => ({ playing, context: ctx ? ctx.state : "none", bars: barIndex, notes: noteCount }),
  };
}
