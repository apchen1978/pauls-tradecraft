# Commercial journey language continuity — Owner review

Scope: preserve language across existing handoffs; two Contact sentences only.
No redesign, new commercial claims, case-data changes, or Garage experiment.
Base: `bafa19c`.

## Validation

- `npm run build`: PASS. Existing large-chunk warning remains; no dependency or lockfile changes.
- `node scripts/check-journey-language.mjs`: PASS, 40 assertions including existing remote-demo behavior, local language parameters, query/hash preservation, unrelated links and inline-script syntax.
- `python scripts/check-onepager-sync.py`: PASS, 17 canonical Works reviewed.
- `git diff --check`: PASS.
- Chrome local preview: 24 prototype matrix cases (four pages × ZH/EN × 390/768/1440), checking initial language, switch, reload, query/hash preservation, outgoing language and horizontal overflow.
- Chrome local preview: 12 homepage/GBD matrix cases (two surfaces × ZH/EN × 390/768/1440), checking Contact copy, all 12 relevant homepage handoff links, GBD keyboard focus and navigation.
- No JavaScript page errors or horizontal overflow in these matrices. A cold preview session requested an absent favicon (404); this is not a new application error.
- GBD → Conversion → browser back and GBD → portfolio were clicked in both languages. Cross-repository target requests were routed to local previews so both unmerged changes could be tested together; this is NOT production verification.
- Existing CDD handoff is preserved. No claim of an integrated production system.

Not tested: Safari, Firefox, physical phones, screen readers. Screenshots stop CSS entrance animations only for capture; website animation settings are unchanged.

## Screenshots

| Surface | ZH 390 | ZH 1440 | EN 390 | EN 1440 |
| --- | --- | --- | --- | --- |
| Roadmap | [image](journey-roadmap-zh-390.png) | [image](journey-roadmap-zh-1440.png) | [image](journey-roadmap-en-390.png) | [image](journey-roadmap-en-1440.png) |
| Commercial Conversion | [image](journey-conversion-zh-390.png) | [image](journey-conversion-zh-1440.png) | [image](journey-conversion-en-390.png) | [image](journey-conversion-en-1440.png) |
| Commitment Gate | [image](journey-commitment-zh-390.png) | [image](journey-commitment-zh-1440.png) | [image](journey-commitment-en-390.png) | [image](journey-commitment-en-1440.png) |
| RFQ | [image](journey-rfq-zh-390.png) | [image](journey-rfq-zh-1440.png) | [image](journey-rfq-en-390.png) | [image](journey-rfq-en-1440.png) |
| Contact | [image](journey-contact-zh-390.png) | [image](journey-contact-zh-1440.png) | [image](journey-contact-en-390.png) | [image](journey-contact-en-1440.png) |
| Featured Garage entry | [image](journey-garage-zh-390.png) | [image](journey-garage-zh-1440.png) | [image](journey-garage-en-390.png) | [image](journey-garage-en-1440.png) |

Release boundary: PR only. No merge or deployment authorized. The separate GBD companion should be released after this language-support change, if Owner later approves both.
