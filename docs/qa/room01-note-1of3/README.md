# Note 1/3 (Room 01), and finger-sized taps for the notes in Rooms 01 and 02

Paul's set A: Room 01 "出門前，記得澆花。" (1/3), Room 02 "今晚早點睡，明天的光更好。" (2/3, #773), Room 03 "桌上有檸檬水，慢慢來。" (3/3, #767).

**Room 01 (new):** a yellow sticky note (9.5 cm, a water drop and two pencil lines, no readable text) stuck on the front of the plant's pot. Room 01 had no tap-a-prop mechanism, so this adds one: a tap within 34 px of the note on screen shows "便條 1/3：「出門前，記得澆花。」" / "Note 1/3: “Water the plants before you head out.”" in a caption at the bottom of the stage. `__room.plantNoteInfo()` reports where the note is on screen and what is showing. Ledger: 119,015 vertices, 330 meshes, 85 desktop / 66 phone opening draw calls (+1 mesh, +1 desktop draw call), with a history line.

**Room 02 (fix):** Paul found the desk note too small to tap. A ray through a box 4 cm bigger was a few pixels in the overview. Now (a) a tap within 34 px of the note or the bedside phone on screen counts, nearest wins; (b) the note is 9.5 cm (was 7.5); (c) like Room 03's close-up corner, the first time the "desk" look is chosen a one-line hint says where to tap ("點一下：螢幕邊的小便條。" / "Tap: the little note on the monitor."), and the "bed" look hints at the phone. Checked by tapping 0, 22, -22/10 and 30 px away from the note at 1280 and 390 px; 45 px away is a miss, as intended.

Not covered: on a phone in the default Room 01 view the plant note is outside the picture (it is visible on a desktop-width stage and when orbiting the right side of the sofa); a hint for it is not added.

Tests: the new plant-note spec, the desk-note spec (now with the look hint and an off-centre tap), Room 02 bedroom, series-phone and ledger specs, Room 01 ledger and roomverse-3d spec: 117 passed, 16 failed; the same 16 fail on unmodified main (compared by name), none are new. Not checked on a real phone.
