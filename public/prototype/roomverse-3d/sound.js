// Room 01's music (Paul, 2026-11-16: the living room has speakers but plays nothing; light music is welcome, it need not be jazz, and it must be original. 2026-11-17: make it richer, bright and
// major, livelier with a vibraphone layer, a cinematic piece for series night with more bass, and a real piano instead of the MIDI-like keyboard; two pieces are enough).
// 2026-11-17 (later): the day piece is now Room 04's first record, 慢板, played faster by Room 04's own engine (see createRoomMusic at the end); this file's own engine plays the series-night piece. (Earlier: two pieces made with the browser's own audio synthesis plus a real sampled piano (piano.js: Salamander Grand Piano, CC BY 3.0, credited on the page). No song, melody or arrangement is borrowed:
// everything is written here note by note.
//   Day (the "day" group): Track 1 "窗邊的午後": C major, 96 beats a minute, a light bounce. A sixteen-bar form, all major chords. First half: Cmaj9, Fmaj9, Cadd9, G6/9, Fmaj9, Cadd9, D9, G7.
//   Second half, a lift: Fmaj9, G6/9, Cmaj9, Cadd9, Fmaj9, Bbmaj9, D9, G7. Syncopated piano chord hits, a bouncing walking bass, a bright vibraphone layer that sparkles on the off-beats and doubles the
//   melody an octave up in the second half, a whisper of ride and brushes.
//   Series night (the "night" group): Track 2 "追劇夜" (rewritten 2026-11-22, see TRACKS): an epic D-minor piece at 84 beats a minute, sixteen bars: a hush of low piano and tremolo strings, a build with timpani and horns,
//   a full-orchestra climax (pounding piano octaves, horns and trombones, double timpani, a cymbal crash), then a fall back to the opening. Original melody; no vibraphone.
// Chords are rolled low to high; there are small random differences in timing and loudness; the band goes through a soft compressor and a synthetic room reverb, with a very faint vinyl hiss.
// Nothing plays until the visitor taps (browsers allow sound only after a tap); a second tap, hiding the page or leaving stops it. start() must be called from inside that tap. In playlist
// mode a piece goes round again, with no gap, until the visitor stops it or leaves.
import { createPiano } from "./piano.js?v=auto";
import { createRoomSound } from "./cafe/sound.js?v=auto"; // Room 04's music engine plays the day piece
import { createNightMusic } from "./night-score.js?v=auto"; // the series-night engine is shared with Rooms 02, 03 and 04

// Room 01's music: two pieces. The day piece (every mood except series night) is Room 04's first record, 慢板, played by Room 04's own music engine on the real piano, without the vinyl crackle, and
// at 100 beats a minute instead of 58 (Paul, 2026-11-17: the café is Shanghai, slowly, but the living room at golden hour wants a brisker, brighter tempo; the Room 04 records themselves are unchanged).
// In this room it keeps the name 窗邊的午後. The visitor may have heard it in the Shanghai café: a small echo between the rooms. Series night plays the cinematic piece above.
export function createRoomMusic() {
  const night = createNightMusic(), day = createRoomSound(), piano = createPiano();
  let active = "day";
  return {
    // Call from inside a tap. Paul 2026-11-23: track 0 is 窗邊的午後 again (Room 04's 慢板 at a brisk 100 bpm, as it was), 1 is series night (追劇夜), 2 is Room 04's Bund swing (十里洋場), 3 is 午後上行 (the ambient lo-fi groove,
    // a practice piece, from night-score.js). Returns true if it started.
    start(track = 0, options = {}) {
      night.stop(); day.stop();
      if (track === 0) { active = "day"; return day.start(0, false, { vinyl: false, bpm: 100, fade: options.fade }); } // Room 04's first record (慢板) at a brisk 100 beats a minute; it goes round until stopped
      if (track === 3) { active = "groove"; return night.start(1, { playlist: true, fade: options.fade }); } // 午後上行, the ambient lo-fi groove
      if (track === 2) { active = "swing"; return day.start(3, false, { vinyl: false, fade: options.fade }); } // Paul 2026-11-18: Room 01's third piece is Room 04's joyful Bund swing, shared from cafe/sound.js; it goes round until stopped
      active = "night"; return night.start(0, options);
    },
    stop() { day.stop(); night.stop(); },
    next() { if (active === "night" || active === "groove") night.next(); }, // QA: the cinematic piece goes round again; the day piece simply keeps going
    tracks: () => ["窗邊的午後", "追劇夜", "十里洋場", "午後上行"],
    state() {
      if (active === "night" || active === "groove") return { ...night.state(), ...(active === "groove" ? { track: 3, group: "day" } : { group: "night" }), piano: piano.ready() };
      const d = day.state(), swing = active === "swing"; return { playing: d.playing, context: d.context, bars: d.bars, notes: d.notes, track: swing ? 2 : 0, title: swing ? "十里洋場" : "窗邊的午後", group: "day", playlist: false, piano: piano.ready() };
    },
  };
}
