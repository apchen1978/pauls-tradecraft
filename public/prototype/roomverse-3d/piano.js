// A real piano for Room 01 and Room 04's music (Paul, 2026-11-17: the electric-piano synthesis sounded like MIDI; the rooms are about the real world, so use a real piano).
// The samples are the "Salamander Grand Piano" (a Yamaha C5) recorded by Alexander Holm, licensed CC BY 3.0 (credit on the Room 01 and Room 04 pages; see audio/piano/LICENSE.txt). Sixteen
// short MP3 notes, every third semitone from A2 to F#6 (about 1 MB in all), are fetched and decoded once, the first time a visitor starts the music, and each note the music asks for is
// played from the nearest sample with its speed changed by at most two semitones. A note ends the way a piano's does: the damper falls (a short fade) when the note's length is up.
// If the samples cannot be loaded, play() returns false and the caller falls back to its own synthesised piano, so the music never goes silent.
const SAMPLES = [["A2", 45], ["C3", 48], ["Ds3", 51], ["Fs3", 54], ["A3", 57], ["C4", 60], ["Ds4", 63], ["Fs4", 66], ["A4", 69], ["C5", 72], ["Ds5", 75], ["Fs5", 78], ["A5", 81], ["C6", 84], ["Ds6", 87], ["Fs6", 90]];

export function createPiano() {
  let buffers = null, loading = null;
  const decode = (ctx, data) => new Promise((resolve, reject) => { const result = ctx.decodeAudioData(data, resolve, reject); if (result && typeof result.then === "function") result.then(resolve, reject); }); // callback form for older Safari, promise form elsewhere
  return {
    // Fetch and decode the samples (once). Resolves true when they are ready, false if anything failed (the caller then uses its fallback).
    load(ctx) {
      loading ??= Promise.all(SAMPLES.map(async ([name, midi]) => {
        const response = await fetch(new URL(`./audio/piano/${name}.mp3`, import.meta.url));
        if (!response.ok) throw new Error(`piano sample ${name}: ${response.status}`);
        return [midi, await decode(ctx, await response.arrayBuffer())];
      })).then((list) => { buffers = list; return true; }, () => false);
      return loading;
    },
    ready: () => Boolean(buffers),
    // Play one note into `destination` at `time`; `gain` is the loudness, `length` how long the key is held (seconds), `position` the stereo placement (-1 left, 1 right). Returns false if the samples are not loaded.
    play(ctx, destination, time, midi, gain, length, position = 0) {
      if (!buffers) return false;
      let best = buffers[0]; for (const item of buffers) if (Math.abs(item[0] - midi) < Math.abs(best[0] - midi)) best = item;
      const source = ctx.createBufferSource(), tone = ctx.createBiquadFilter(), out = ctx.createGain();
      source.buffer = best[1]; source.playbackRate.value = Math.pow(2, (midi - best[0]) / 12);
      tone.type = "lowpass"; tone.frequency.value = 2600 + Math.min(gain, 0.3) * 30000; tone.Q.value = 0.4; // softer notes are a little darker, as on a real piano
      out.gain.setValueAtTime(gain, time); out.gain.setValueAtTime(gain, time + length); out.gain.exponentialRampToValueAtTime(0.0001, time + length + 0.4); // the damper falls
      source.connect(tone); tone.connect(out);
      if (position && ctx.createStereoPanner) { const panner = ctx.createStereoPanner(); panner.pan.value = position; out.connect(panner); panner.connect(destination); } else out.connect(destination);
      source.start(time); source.stop(time + length + 0.5);
      return true;
    },
  };
}
