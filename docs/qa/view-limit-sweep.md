# Proving an orbit camera cannot turn into a blank wall

`scripts/sweep-view-limits.mjs` — added 2026-11-23 after a real bug (Room 03 record view, PR #1112).

## The bug it exists for

Room 03's record view allowed ±0.52 rad of swing around the deck. Past about **+0.12 rad the camera sat against the wall
behind the counter**, and the frame became one flat grey field with the record-player highlight ring floating in it. It is
easy to miss: you only see it if you happen to drag that far while looking at that view.

## What it measures

Contrast, not brightness. For each sampled angle it captures a frame and computes the luminance **standard deviation** of
the room area:

| state | std |
|---|---|
| a normal interior frame here | 43–73 |
| a wall filling the frame | ≈ 20 |

So `std < 15` is a reliable "this is a wall, not a room" signal. Measured on this project:

| view | before | after |
|---|---|---|
| Room 03 record view | 20 (flat past +0.12 rad) | 47–59 clean |
| Room 03 nook view | — | 43–46 clean |
| Room 03 free orbit, whole 360° | — | 45–54 clean |
| Room 04 free orbit | — | 60–73 clean (1440 and 390 px) |

## Use

Serve the built site first (the script does not start a server; ports differ per machine):

```powershell
node node_modules/vite/bin/vite.js build
node C:\Users\grays\.dsh\skills\roomverse-3d-audit\scripts\serve-static.mjs dist 8796
```

Then sweep. `--room` is `kitchen` or `cafe`; `--view` is `record`, `nook` (kitchen only) or `free` (the controls' own
limits, or a whole turn when unlimited):

```powershell
npm run sweep:views -- --base http://127.0.0.1:8796 --room kitchen --view record --widths 1440,390 --assert
npm run sweep:views -- --base http://127.0.0.1:8796 --room cafe    --view free   --widths 1440,390 --assert
```

- `--assert` exits non-zero when any frame is flat, so CI or a reviewer can gate on it.
- `--flat-below N` moves the threshold (default 15). Raising it is how you test the detector itself: with `--flat-below 70`
  on a healthy room the script names the frames and exits 1, which is the negative control for the check.
- Output: one PNG per angle plus `sweep.json` in `--out` (default `.qa/view-sweep`, git-ignored).

## When to run it

- After adding or moving a station view, or changing `RECORD_VIEW` / `NOOK_VIEW` / the global `minAzimuthAngle` /
  `maxAzimuthAngle`.
- Before merging anything that changes a camera, because the failure mode is invisible in a still you happened to pick.

## What it does not cover

- Only the "flat wall" failure. Clipping, objects cut at the frame edge, and over-bright frames need the eye or the
  quality scan (`Desktop\AI交接文件\...\Room04品質掃描.md`).
- It sweeps the room area of the page (a fixed crop), so a wall that fills only a corner of the frame can pass. Set
  `--flat-below` higher if you want to catch partial walls.
