# Room 03 water pitcher: from a ghost to glass

Paul: the pitcher's shape was right but it looked fake on the table, like a ghost, because the chairs and cabinets showed straight through it. Real glass has bright reflections, a denser body and a heavy base, and it sits on the table.

- **Reflections:** the pitcher/tumbler glass now takes the room's reflection map (`waterSetGlass` registered in `reflectiveBase`, like the steel and the glazed mugs), roughness 0.06 and opacity 0.40, so it picks up a real highlight instead of only being see-through.
- **Denser water:** opacity 0.46 and a slightly deeper aqua tint than the sideboard bottles (so a whole pitcher reads as clear water, not milk), a thin lighter water surface, and a solid glass base puck for the heavy 12 mm bottom.
- **Grounded:** one plane with three soft contact-shadow blobs (pitcher, two tumblers) under the set, offset away from the window side.
- Ledger: 108,905 vertices, 133 meshes, 83 desktop / 80 phone opening draw calls, with a history line. Dinner and Thanksgiving hide the set, so they are unchanged.

`before-*` is main after #764; `after-*` is this branch. The close-ups use a diagnostic camera (not a user-reachable view).

Checked: kitchen, daylight, p0-lighting, center-view, dinner-sunday, thanksgiving, movie and ledger specs, 37 passed. Not checked on a real phone.
