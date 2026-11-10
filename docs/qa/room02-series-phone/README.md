# Room 02: the series-night phone

Paul's idea: in series night (追劇夜) the phone's screen lights a notification, quietly. The bedside phone was lying face down, so the screen was never visible.

- **Series night:** the phone flips face up and its screen lights a lock-screen notification (an abstract banner, app dot and two text bars; no readable text) about every 16 s, in a 3.4 s pulse (rise 0.5 s, hold, fade 1 s). A soft cool-white glow on the wood around it pulses with it: the bedside table is small in every look and the lamp hides the phone, so the pool of light is what a visitor actually sees. With reduced motion the screen stays lit and the pulse is off.
- **Other moods:** the phone stays face down, and the screen and glow planes are hidden, so there is no cost anywhere else.
- **Tap it:** in series night "手機亮了一下：「到家了嗎？窗邊的燈幫你開著。」" / "The phone lights up: “Home yet? I left the window lamp on for you.”" Otherwise "手機面朝下放著，今晚不想被打擾。" / "The phone lies face down; not to be disturbed tonight." This reuses the room's tap-a-prop mechanism; the phone is 7 x 15 cm, so a ray through its box enlarged by 4 cm also counts.
- `info().bedsidePhone` reports `{ faceUp, screenEmissive, glowOpacity, meshes }` for tests.
- Ledger: settled 64,291 vertices / 304 meshes unchanged; series night draws 160 desktop / 158 phone (+2); other moods unchanged. Phone draw calls re-measured at 156 on current main (the ledger said 157).

Things learned while verifying (worth keeping): a glow plane 2 mm above the table top drew nothing (it needs about 12 mm); and forcing material values from a test is overwritten every frame by a running pulse, so visual checks of the lit state use reduced motion, which leaves it steady.

`series-lit-closeup.png` is a diagnostic zoom (3x pixel ratio) at the "bed" look with reduced motion (steady lit); `focus-face-down-closeup.png` is the same spot in focus mood.

Checked: bedroom spec, ledger spec and a new series-phone spec (face up and pulse, tap message in both languages, reduced motion), 63 passed. The geometry-invariant test now allows series night alone to add the two planes (+8 vertices, +2 meshes). Not checked on a real phone.
