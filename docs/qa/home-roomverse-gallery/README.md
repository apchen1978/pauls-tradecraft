# Homepage: the ROOMVERSE card becomes a gallery panel

The three rooms are Paul's finest work, and the pale card grid they sat in looked like every other work. This gives them their own place.

- A dark warm panel (`#1d1915`) instead of the pale card, with the three painted covers as the main thing and museum-label captions (room number, name, one light, how it was made).
- Title "三間房，三種光。" / "Three rooms, three lights." (white), a one-line lede in warm amber "光一轉，房間就換了心情！" / "Turn the light, and the room changes its mood!", an eyebrow "ROOMVERSE · 空間幻境　館藏" / "ROOMVERSE 3D · Gallery".
- One action per room, "走進去看" / "Step inside". Its accessible name keeps the room ("Step inside: Bay Area Kitchen") so three identical links are still told apart; the longer room description stays for screen readers (`sr-only`).
- A one-line bridge above the panel ties the work to the business side: look closely first, then build.
- Other Showcase cards are untouched. Three across from 768 px, one column below; no sideways scroll (home-roomverse-two-rooms spec, six widths, zh and en).

`before-zh-1440.png` is production before this change (a crop), `after-*` are the specs' own screenshots of the panel.

Checked: home-roomverse-two-rooms and the ROOMVERSE homepage specs (14 passed), check-document-parity (PASS), check-journey-language (PASS). The broader homepage specs show 21 failures that are identical on unmodified main (lantern, mobile-first-screen-lighter, showcase-entry, street-corner, teammate-toy); this change neither adds nor removes any.
