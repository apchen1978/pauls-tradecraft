// The element plays directly through the browser's media pipeline, including in the background.
export function createTrackPlayer({ tracks, album, onState, onTrack, onError }) {
  const audio = document.createElement("audio");
  audio.preload = "none";
  audio.setAttribute("playsinline", "");
  audio.hidden = true;
  document.body.append(audio);

  const session = navigator.mediaSession;
  let index = -1, attempt = 0, sourceIndex = 0, sources = [], pending = false, playing = false;
  let announced = -1;
  const state = () => ({ index, playing, pending, currentTime: audio.currentTime });
  function publish() {
    if (session) session.playbackState = playing ? "playing" : index >= 0 ? "paused" : "none";
    onState?.(state());
  }
  function refreshMetadata() {
    if (!session || typeof MediaMetadata !== "function" || index < 0) return;
    const track = tracks[index];
    session.metadata = new MediaMetadata({
      title: document.documentElement.lang === "en" ? track.titleEn : track.title,
      artist: "ROOMVERSE",
      album,
      artwork: track.artwork,
    });
  }
  function fail(token) {
    if (token !== attempt || index < 0 || (!pending && !playing)) return;
    if (++sourceIndex < sources.length) {
      loadSource();
      return;
    }
    const failed = index;
    stop();
    onError?.(failed);
  }
  function requestPlay() {
    if (index < 0) return;
    const token = ++attempt;
    pending = true;
    audio.play().catch(() => fail(token));
  }
  function loadSource() {
    pending = true;
    playing = false;
    audio.src = sources[sourceIndex];
    requestPlay();
    publish();
  }
  function play(track = index) {
    if (track < 0 || track >= tracks.length) return;
    if (track === index && audio.hasAttribute("src")) {
      if (!playing && !pending) requestPlay();
      return;
    }
    index = track;
    sourceIndex = 0;
    announced = -1;
    sources = tracks[index].sources.filter(({ type }) => audio.canPlayType(type)).map(({ src }) => src);
    if (!sources.length) {
      pending = true;
      fail(attempt);
      return;
    }
    refreshMetadata();
    loadSource();
  }
  function pause() {
    ++attempt;
    pending = false;
    playing = false;
    audio.pause();
    publish();
  }
  function stop() {
    index = -1;
    pause();
    audio.removeAttribute("src");
    audio.load();
    if (session) session.metadata = null;
  }
  const move = (delta) => {
    if (index >= 0) play((index + delta + tracks.length) % tracks.length);
  };
  const next = () => move(1);
  const previous = () => move(-1);
  audio.addEventListener("playing", () => {
    if (index < 0 || audio.paused) return;
    pending = false;
    playing = true;
    publish();
    if (announced !== index) {
      announced = index;
      onTrack?.(index);
    }
  });
  audio.addEventListener("pause", () => {
    // Changing source can queue a pause before playback of the replacement.
    if (!audio.paused || pending || !playing) return;
    playing = false;
    publish();
  });
  audio.addEventListener("ended", next);
  audio.addEventListener("error", () => { if (audio.error) fail(attempt); });
  const actions = { play: () => play(), pause, nexttrack: next, previoustrack: previous };
  function bindActions(clear = false) {
    if (!session) return;
    for (const [action, handler] of Object.entries(actions)) {
      try { session.setActionHandler(action, clear ? null : handler); } catch { /* Some browsers omit individual actions. */ }
    }
  }
  bindActions();
  return {
    play, pause, stop, next, previous, state, refreshMetadata,
    dispose() { stop(); bindActions(true); audio.remove(); },
  };
}
