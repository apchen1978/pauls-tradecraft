# Room 03: note 3/3 of the three-room note set

Paul picked "one note, found once in each room, its words changing with the room" and set A (everyday): Room 01 "出門前，記得澆花。" (1/3), Room 02 "今晚早點睡，明天的光更好。" (2/3), Room 03 "桌上有檸檬水，慢慢來。" (3/3). The kitchen's note lines up with the lemon-water pitcher now on the table.

- A yellow sticky note with an ink lemon and two pencil scribbles, pinned (green pin) in the free lower-right corner of the entry cork board. Abstract marks only, like the other papers there: it is drawn into the existing cork atlas and merged into the existing entry-wall mesh, so there is no new mesh and no new draw call (+206 vertices).
- Tapping it in the nook view ("走近小角落") shows "便條 3/3：「桌上有檸檬水，慢慢來。」" (English: Note 3/3: "There's lemon water on the table. Take your time."). It uses the nook's own tap-a-thing-to-read mechanism and is listed BEFORE the board so a tap on the note is not swallowed by the board's box. The nook's hint still names only totes, board and key shelf, so the note is something to find.
- Ledger: 109,111 vertices, 133 meshes, 83 desktop / 80 phone opening draw calls (unchanged), with a history line.

`nook-1280.png` is the nook view; `tap-*.png` are after tapping the note at 1280 and 390.

Checked: nook-view, card3-atmosphere, ledger, kitchen, daylight, p0-lighting, center-view, dinner-sunday, thanksgiving and movie specs, 46 passed (one robot-load timing flake in card3-atmosphere passed on a rerun). Not checked on a real phone: the note is about 6 cm, a few pixels at 390 px, and a tap within 9 cm of it still counts.
