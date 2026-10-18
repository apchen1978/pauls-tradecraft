# ROOMVERSE Slow Sunday QA

- `slow-zh/en-390/1440.png`: the fifth mood in the real page at the requested viewport and language.
- `lighting-rain/family/slow-zh-1440.png`: same room viewed under three light settings.
- `old-rain-zh/en-390/1440-before-after.png`: comparison of the original postcard layout and the current output. The BEFORE panel is rendered from the original postcard drawing code on `origin/main`; AFTER calls the current postcard function.

At 1440 px, the old one-line card fits and its pixels are identical to the original layout. At 390 px, the original detail string is too wide and clips; the current card wraps only that line so every selected label remains visible. Text, room render and the old layout remain unchanged where the line fits.
