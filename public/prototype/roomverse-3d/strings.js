// Real strings for Room 02's orchestral lead (Paul 2026-11-28: the synthesised strings were the most synthetic part of Brooklyn Windowsill, so use real ones).
// The samples are the sustained-vibrato Violin Section of "VS Chamber Orchestra: Community Edition" (VSCO 2 CE), recorded by Sam Gossner and Simon Dalzell, released under CC0 1.0 (public domain;
// see audio/strings/LICENSE.txt). Eleven notes, G3 to D6, each cut to the steady part of the bow (3.4 s, the slow swell at the start of the recording is skipped), mixed to mono, levelled and
// encoded as MP3 (about 250 KB in all). They are fetched and decoded once, the first time the music starts, and each note the music asks for is played from the nearest sample with its speed
// changed by at most two or three semitones. The piano supplies the attack; these supply the bowed sustain. If the samples cannot be loaded, play() returns false and the caller keeps its synthesised strings.
const SAMPLES = [["G3", 55], ["A3", 57], ["B3", 59], ["D4", 62], ["Fs4", 66], ["A4", 69], ["C5", 72], ["E5", 76], ["G5", 79], ["B5", 83], ["D6", 86]];
const SAMPLE_SECONDS = 3.4; // the length of every sample

let shared = null;
export function createStrings() {
  if (shared) return shared;
  let buffers = null, loading = null;
  const decode = (ctx, data) => new Promise((resolve, reject) => { const result = ctx.decodeAudioData(data, resolve, reject); if (result && typeof result.then === "function") result.then(resolve, reject); });
  return (shared = {
    // Fetch and decode the samples (once). Resolves true when they are ready, false if anything failed.
    load(ctx) {
      loading ??= Promise.all(SAMPLES.map(async ([name, midi]) => {
        const response = await fetch(new URL(`./audio/strings/${name}.mp3`, import.meta.url));
        if (!response.ok) throw new Error(`strings sample ${name}: ${response.status}`);
        return [midi, await decode(ctx, await response.arrayBuffer())];
      })).then((list) => { buffers = list; return true; }, () => false);
      return loading;
    },
    ready: () => Boolean(buffers),
    // Play one note into `destination` at `time`: `gain` is the loudness, `length` how long the note is held (seconds). Returns false if the samples are not loaded.
    play(ctx, destination, time, midi, gain, length, detuneCents = 0) {
      if (!buffers) return false;
      let best = buffers[0]; for (const item of buffers) if (Math.abs(item[0] - midi) < Math.abs(best[0] - midi)) best = item;
      const rate = Math.pow(2, (midi - best[0]) / 12), held = Math.min(length, (SAMPLE_SECONDS - 0.5) / rate), source = ctx.createBufferSource(), out = ctx.createGain();
      source.buffer = best[1]; source.playbackRate.value = rate; if (detuneCents && source.detune) source.detune.value = detuneCents;
      out.gain.setValueAtTime(0.0001, time); out.gain.exponentialRampToValueAtTime(gain, time + 0.18); out.gain.setValueAtTime(gain, time + Math.max(0.2, held)); out.gain.exponentialRampToValueAtTime(0.0001, time + Math.max(0.2, held) + 0.3); // a bow draws in and lifts off
      source.connect(out); out.connect(destination); source.start(time); source.stop(time + Math.max(0.2, held) + 0.4);
      return true;
    },
  });
}
