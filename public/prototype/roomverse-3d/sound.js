// Room 01's music (Paul, 2026-11-16: the living room has speakers but plays nothing; light music is welcome, it need not be jazz, and it must be original. Same day: add a little jazz and
// low-mid body. 2026-11-17: it still sounded like MIDI and thin next to Room 04, so make it richer and less repetitive).
// Two calm pieces made entirely with the browser's own audio synthesis: no sound files, no samples, nothing borrowed. Everything is written here note by note.
//   Track 1 "窗邊的午後": C major, 72 beats a minute, a light swing. Eight bars: Cmaj9, Am9, Dm9, G13, then Em7, A7, Dm9, G7 back to the start.
//   Track 2 "週日慢慢過": F major, 62 beats a minute, slower and sparser. Eight bars: Fmaj9, Gm9, C13, Fmaj9, then Bbmaj9, Am7, Gm9, C13.
// What makes it less MIDI-like: a room reverb (a synthetic impulse response), a soft compressor that glues the band, an electric piano with a fast-fading tine over a warm body, a breathy
// muted-horn lead that scoops into its notes and adds vibrato after a moment, chords that are strummed rather than struck, a walking bass with a round tone, a whisper of ride and brushes,
// a very faint vinyl hiss and a few pops, small random timing and loudness differences, and stereo placement. The melody is a written eight-bar phrase, not random notes.
// Nothing plays until the visitor taps (browsers allow sound only after a tap); a second tap, hiding the page or the app's own time limit stops it. start() must be called from inside that tap;
// each new start plays the next track.
const hz = (midi) => 440 * Math.pow(2, (midi - 69) / 12); const BARS_PER_TRACK = 16; // playlist mode (Paul, 2026-11-17): each piece plays its eight bars twice (about a minute), then the other follows with no gap, until the visitor stops it or leaves
const TRACKS = [
  { title: "窗邊的午後", bpm: 72, swing: 0.22,
    bars: [
      { walk: [36, 40, 43, 45], chord: [52, 55, 59, 62], tune: [[0.5, 79, 1.0], [2, 76, 0.75], [3, 74, 0.5], [3.5, 72, 1.0]] },        // Cmaj9
      { walk: [33, 36, 40, 43], chord: [48, 52, 55, 59], tune: [[1, 76, 1.0], [2.5, 72, 0.5], [3, 71, 0.5], [3.5, 69, 0.5]] },          // Am9
      { walk: [38, 41, 45, 48], chord: [53, 57, 60, 64], tune: [[0.5, 77, 1.5], [2.5, 81, 0.75], [3.5, 79, 0.5]] },                     // Dm9
      { walk: [43, 47, 50, 53], chord: [53, 59, 62, 64], tune: [[0, 77, 1.0], [1.5, 74, 0.5], [2, 76, 1.5]] },                          // G13
      { walk: [40, 43, 47, 50], chord: [55, 59, 62, 64], tune: [[0.5, 79, 1.0], [2, 83, 0.5], [2.5, 81, 0.5], [3, 79, 1.0]] },          // Em7
      { walk: [33, 37, 40, 43], chord: [55, 61, 64, 66], tune: [[0, 76, 0.75], [1, 73, 0.75], [2, 76, 0.5], [3, 79, 1.0]] },            // A7
      { walk: [38, 41, 45, 48], chord: [53, 57, 60, 64], tune: [[0.5, 77, 1.0], [2, 76, 0.5], [2.5, 74, 1.5]] },                        // Dm9
      { walk: [43, 47, 50, 47], chord: [53, 59, 62, 67], tune: [[0, 71, 1.0], [1.5, 74, 0.5], [2.5, 77, 0.5], [3.5, 76, 1.0]] },        // G7
    ] },
  { title: "週日慢慢過", bpm: 62, swing: 0.24,
    bars: [
      { walk: [41, 45, 48, 52], chord: [57, 60, 64, 67], tune: [[0.5, 81, 2.0], [3, 79, 1.0]] },                                        // Fmaj9
      { walk: [43, 46, 50, 53], chord: [58, 62, 65, 69], tune: [[0, 77, 1.5], [2, 74, 2.0]] },                                          // Gm9
      { walk: [36, 40, 43, 46], chord: [58, 62, 64, 69], tune: [[0.5, 76, 1.5], [2.5, 81, 1.5]] },                                      // C13
      { walk: [41, 45, 48, 45], chord: [57, 60, 64, 67], tune: [[0, 79, 2.0], [2.5, 77, 1.5]] },                                        // Fmaj9
      { walk: [34, 38, 41, 45], chord: [62, 65, 69, 72], tune: [[0.5, 81, 1.0], [2, 77, 1.0], [3, 74, 1.0]] },                          // Bbmaj9
      { walk: [33, 36, 40, 43], chord: [55, 60, 64, 67], tune: [[0.5, 76, 1.5], [2.5, 72, 1.5]] },                                      // Am7
      { walk: [43, 46, 50, 46], chord: [58, 62, 65, 69], tune: [[0, 74, 1.0], [1.5, 77, 1.0], [3, 81, 1.0]] },                          // Gm9
      { walk: [36, 40, 43, 46], chord: [58, 62, 64, 69], tune: [[0.5, 79, 1.5], [2.5, 76, 1.5]] },                                      // C13
    ] },
];

// instrument recipes: [frequency ratio, level, wave, how much of the note's length the partial lasts (1 = all of it)]
const EPIANO = { partials: [[1, 0.6, "sine", 1], [1.003, 0.5, "sine", 1], [2, 0.22, "sine", 0.45], [3, 0.07, "triangle", 0.25], [7, 0.035, "sine", 0.12]], attack: 0.008, lowpass: 2800 };
const LEAD = { partials: [[1, 0.8, "triangle", 1], [1, 0.3, "sawtooth", 1], [2, 0.12, "sine", 1]], attack: 0.05, lowpass: 1700, vibrato: 16, scoop: 0.018 };
const BASS = { partials: [[1, 1, "sine", 1], [2, 0.28, "triangle", 0.5], [3, 0.06, "sine", 0.3]], attack: 0.015, lowpass: 700 };
const PAD = { partials: [[1, 0.7, "triangle", 1], [1.004, 0.6, "triangle", 1]], lowpass: 900 };

export function createRoomMusic() {
  let ctx = null, bus = null, master = null, hiss = null, timer = 0, playing = false, nextTime = 0, barIndex = 0, noteCount = 0, trackIndex = 0, seed = 5, noise = null, reverbBuffer = null, playlist = false, onTrack = null;
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
      osc.type = wave; osc.detune.value = (rnd() - 0.5) * 8;
      if (recipe.scoop) { osc.frequency.setValueAtTime(f * (1 - recipe.scoop), time); osc.frequency.exponentialRampToValueAtTime(f, time + 0.06); } else osc.frequency.value = f;
      g.gain.setValueAtTime(level, time); if (lasts < 1) g.gain.exponentialRampToValueAtTime(level * 0.002, time + length * lasts);
      if (recipe.vibrato) { const lfo = ctx.createOscillator(), depth = ctx.createGain(); lfo.frequency.value = 5.2 + rnd() * 0.6; depth.gain.setValueAtTime(0, time); depth.gain.linearRampToValueAtTime(recipe.vibrato, time + 0.3); lfo.connect(depth); depth.connect(osc.detune); lfo.start(time); lfo.stop(time + length + 0.05); }
      osc.connect(g); g.connect(out); osc.start(time); osc.stop(time + length + 0.05);
    }
    out.connect(filter); panned(filter, position).connect(bus); noteCount += 1;
  };
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
  const reverb = () => { // a synthetic room: two seconds of dark, decaying noise
    const length = Math.floor(ctx.sampleRate * 2.2), buffer = ctx.createBuffer(2, length, ctx.sampleRate);
    for (let channel = 0; channel < 2; channel++) { const data = buffer.getChannelData(channel); let last = 0; for (let i = 0; i < length; i++) { last = last * 0.55 + (rnd() * 2 - 1) * 0.45; data[i] = last * Math.pow(1 - i / length, 2.4) * (i < 0.012 * ctx.sampleRate ? i / (0.012 * ctx.sampleRate) : 1); } }
    return buffer;
  };
  const scheduleBar = () => { if (playlist && barIndex >= BARS_PER_TRACK) { trackIndex = (trackIndex + 1) % TRACKS.length; seed = 5 + trackIndex * 17; barIndex = 0; const changed = trackIndex; setTimeout(() => { if (playing) onTrack?.(changed); }, Math.max(0, (nextTime - ctx.currentTime) * 1000)); } // the other piece starts on the next bar; the page hears about it when its first note sounds
    const track = TRACKS[trackIndex], beat = 60 / track.bpm, barLength = beat * 4, bar = track.bars[barIndex % track.bars.length], t0 = nextTime;
    const swung = (at) => (Math.abs(at % 1 - 0.5) < 0.01 ? at + track.swing : at); // eighth notes on the off-beat lean late
    const strum = (at, gain, length) => bar.chord.forEach((midi, i) => note(t0 + swung(at) * beat + i * 0.035 + jitter(6), midi, EPIANO, vary(gain), length, -0.18 + i * 0.1)); // chords are rolled, low to high
    strum(0, 0.075, beat * 3.4); if (barIndex % 2 === 0) strum(2.5, 0.042, beat * 1.2); else strum(1.5, 0.034, beat * 1.2);
    bar.walk.forEach((midi, i) => note(Math.max(t0 + 0.01, t0 + i * beat + jitter(8)), midi, BASS, vary(i === 0 ? 0.2 : 0.155), beat * 0.92)); // a walking bass, one note on every beat
    for (const midi of bar.chord.slice(0, 3)) note(t0, midi, PAD, 0.016, barLength * 1.1, barIndex % 2 ? 0.45 : -0.45); // a slow pad under it all, swapping sides each bar
    tick(t0 + beat, 0.022, 5200, 0.17); tick(t0 + 3 * beat, 0.022, 5200, 0.17); // brushes on two and four
    for (const at of [0, 1, 1.66, 2, 3, 3.66]) tick(t0 + at * beat + jitter(5), vary(0.011), 7600, 0.09); // a whisper of ride: the classic skip pattern
    for (const [at, midi, length] of bar.tune) note(t0 + swung(at) * beat + jitter(10), midi, LEAD, vary(0.075), beat * (length + 0.5), 0.22); // the melody, a little to the right
    barIndex += 1; nextTime += barLength;
    timer = setTimeout(scheduleBar, Math.max(50, (nextTime - ctx.currentTime - 0.6) * 1000));
  };
  return {
    // Call from inside a tap. track: 0 or 1. Returns true if it started.
    start(track = 0, options = {}) {
      if (playing) return true;
      const AudioContextClass = window.AudioContext || window.webkitAudioContext; if (!AudioContextClass) return false;
      try {
        ctx ??= new AudioContextClass(); ctx.resume?.();
        trackIndex = ((track % TRACKS.length) + TRACKS.length) % TRACKS.length; seed = 5 + trackIndex * 17; playlist = Boolean(options.playlist); onTrack = options.onTrack ?? null;
        master = ctx.createGain(); master.gain.setValueAtTime(0.0001, ctx.currentTime); master.gain.exponentialRampToValueAtTime(0.8, ctx.currentTime + 1.5); master.connect(ctx.destination);
        const compressor = ctx.createDynamicsCompressor(); compressor.threshold.value = -20; compressor.knee.value = 12; compressor.ratio.value = 3; compressor.attack.value = 0.012; compressor.release.value = 0.28;
        bus = ctx.createGain(); bus.connect(compressor); compressor.connect(master);
        const room = ctx.createConvolver(), send = ctx.createGain(), wet = ctx.createGain(); reverbBuffer ??= reverb(); room.buffer = reverbBuffer; send.gain.value = 0.3; wet.gain.value = 0.9;
        bus.connect(send); send.connect(room); room.connect(wet); wet.connect(master);
        hiss = ctx.createBufferSource(); const hissBuffer = ctx.createBuffer(1, ctx.sampleRate * 3, ctx.sampleRate), hissData = hissBuffer.getChannelData(0);
        for (let i = 0; i < hissData.length; i++) hissData[i] = (rnd() < 0.0004 ? (rnd() * 2 - 1) * 0.9 : 0) + (rnd() * 2 - 1) * 0.012; // a faint hiss and a few pops, like a record
        hiss.buffer = hissBuffer; hiss.loop = true; const hissFilter = ctx.createBiquadFilter(), hissGain = ctx.createGain(); hissFilter.type = "highpass"; hissFilter.frequency.value = 1400; hissGain.gain.value = 0.16;
        hiss.connect(hissFilter); hissFilter.connect(hissGain); hissGain.connect(master); hiss.start();
        playing = true; barIndex = 0; noteCount = 0; nextTime = ctx.currentTime + 0.25; scheduleBar();
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
    next() { if (playing) { playlist = true; barIndex = BARS_PER_TRACK; } }, // QA: jump to the other piece at the next bar
    tracks: () => TRACKS.map((t) => t.title),
    state: () => ({ playing, context: ctx ? ctx.state : "none", bars: barIndex, notes: noteCount, track: trackIndex, title: TRACKS[trackIndex].title, playlist }),
  };
}
