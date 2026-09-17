# Portfolio Drill-down Opportunity Audit v0.1

**Mode:** Read-only investigation
**Scope:** Current Paul's Tradecraft portfolio, source implementation and live DOM
**Date:** 2026-09-18

## Executive conclusion

Do not make every work card clickable. The portfolio already has substantial depth; the highest-value opportunity is to make a small number of existing evidence paths easier to enter and understand.

Recommended small set:

1. **Commercial Decision Desk (CDD)** — primary decision-product drill-down; already has a live synthetic sample and blank assessment.
2. **Global Business Development + AI-Native Market Entry** — one connected judgment story: relevant market participant → buyer/acquisition-path challenge → UNKNOWN → where effort belongs. Reuse the existing inline case material and the local/live-approved assets only where their publication status permits.
3. **Business Spending Insight** — secondary domain proof: business spending → owner understanding → evidence preparation → CPA question. Reuse the existing public demo and existing case disclosure.

TPN remains a useful fourth candidate because it already has a public interactive demo, but it does not need a new case layer before the three above are clarified.

The minimum viable implementation does not require a CMS or new routing system. Existing external demo links, hash anchors, expandable case studies and related-work links can provide the second layer. A detail layer should add context and judgment, not repeat the card.

## Interaction model found in the current implementation

- Regular cards with `w.link` render an external or hash-link CTA inside the card. The card shell itself is not an anchor; the visible link/CTA is the actionable destination.
- Regular cards without `w.link` render as a `div` with `cursor-pointer` and an article `onClick` handler that toggles the card's native `<details>` case study. The case-study summary also remains an explicit keyboard-accessible control.
- GBD has an additional explicit **查看商業開發判斷** button that toggles the same inline detail; its button stops the card click from firing twice.
- CDD is a separate featured system: the featured visual and primary CTA are external anchors, with additional sample/blank-assessment and portfolio-path links.

This means the apparent affordance is not a dead click, but it is not uniform: some cards mean “open a demo,” some mean “open an inline case,” and some expose both. The distinction is currently discoverable only after reading the small bottom action or trying the card.

## All-work inventory

| Work | Current click behavior | Existing deeper asset | Client value of drill-down | Complexity | Recommended treatment |
|---|---|---|---|---|---|
| MORI 軟裝品牌網站與工作流程 | Explicit external demo CTA; separate Brief CTA; card shell is not the destination | Public interactive MORI demo and `/brief/`; inline case study | Shows client-facing experience, workflow thinking and delivery handoff | LOW | Keep CTA-led. Let the two existing destinations do the deeper work; no new case page now. |
| 企業支出決策啟發 | Explicit public-demo CTA; inline case disclosure | Public SME spending demo; related link back to CDD | Helps an owner understand spending, evidence gaps and CPA questions without confusing it with bookkeeping | LOW/MEDIUM | Candidate #3: a short owner-question → evidence → professional-question layer, reusing current case copy and demo. |
| 貿易交易工作台 | Explicit public-demo CTA; inline case disclosure | Public Trade Deal Desk demo; related bridge to Payment Concentration | Makes the commercial decision package and the decision-to-payment bridge easier to inspect | MEDIUM | Keep as supporting commercial system; reuse existing demo and related bridge rather than add routing. |
| 窗簾軟裝 Pilot 追蹤器 | Explicit same-site hash CTA; inline case disclosure | Pilot evidence page at `#tracker`; 23/23 verification label | Useful when a client wants to inspect operating workflow and evidence, but it is a supporting capability | LOW | CTA-only; no new second-level experience unless a real pilot conversation creates demand. |
| 銷售 Pilot 案例簡報 | Explicit public-demo CTA; inline case disclosure | Public sales-pilot demo | Shows how a sales/pilot story is presented and communicated | LOW | Keep CTA-led; the existing demo is already the second layer. |
| Pilot 模擬套件 | Explicit same-site hash CTA; inline case disclosure | Pilot evidence page at `#rounds` | Supports understanding of simulation discipline, but is not a primary commercial judgment story | LOW | Keep non-flagship and CTA-only. |
| Lil Matt's Gaming World | Explicit public demo CTA; inline case disclosure | Public creative typing/game experience | Proves creative build and interaction range, not the main commercial method | LOW | Preserve its distinct identity; no business case drill-down. |
| 浪費時間 (Waste Time) | Explicit public demo CTA; inline case disclosure | Public interactive demo | Demonstrates product craft and interaction, with limited relevance to a prospective commercial client | LOW | Keep as a creative build; no additional layer. |
| AI Lyrics Generator | Explicit public demo CTA; inline case disclosure | Public production demo; existing technical case details | Demonstrates AI productization and shipping, but not the core commercial judgment path | LOW | Keep CTA-only and separate in identity; no portfolio case page now. |
| 執行能力簡報 | Explicit same-site viewer CTA; inline case disclosure | Public deck viewer / capability PDF path | Useful as a downloadable conversation asset, not as a repeated case-study page | LOW | Keep CTA-led; preserve as collateral. |
| Expense Tracker 收支實驗 | Explicit public demo CTA; inline case disclosure | Public experiment demo | Shows implementation ability but is weaker evidence of Paul's flagship commercial method | LOW | Keep in exploration; no drill-down. |
| 付款集中度分析 | Explicit public-demo CTA; inline case disclosure; related bridge to Trade Deal Desk | Public payment-concentration demo and related commercial bridge | Gives a client a deeper look at cash-commitment exposure after a deal decision | LOW/MEDIUM | Reuse as a linked extension of CDD, not a separate long case page. |
| MG Desktop Pet | Explicit public demo CTA; inline case disclosure | Public creative desktop experience | Shows range and craft, not a commercial decision story | LOW | Preserve creative identity; no drill-down. |
| AI 輔助海外客戶開發 | Explicit public-demo CTA; inline case disclosure; related link to GBD | Public lead-discovery demo; 44 → 20 evidence-labelled shortlist | Shows evidence-qualified discovery and the transition from broad signals to a reviewable shortlist | LOW/MEDIUM | Candidate as the first half of the GBD drill-down; connect to GBD via the existing related path. |
| 海外商業開發 | No external link; whole card toggles inline `<details>`; explicit judgment button also toggles it | Inline synthetic interactive-method case; related AI-Native Market Entry path; local prototype exists outside production | High value: makes supplier reality, Owner objective, UNKNOWN and commercial-resource allocation visible | MEDIUM | Candidate #2: make the existing inline case the entry layer, then reveal evidence/judgment progressively. Do not expose a local prototype without a separate publication decision. |
| AI 原生市場開發 | No external link; whole card toggles inline `<details>` | Inline public-evidence case: 6 relevant accounts → 0 promoted without sufficient evidence → 4 paths needing human verification | High value: demonstrates relevant market participant ≠ plausible buyer and disciplined false-positive reduction | MEDIUM | Candidate #2 as the evidence half of the GBD story; do not duplicate it as an unrelated product page. |
| 貿易利潤導航 | Explicit public-demo CTA with synthetic Gulf case; inline case disclosure | Public interactive TPN demo; 9/9 + 6/6 technical validation labels | Lets a client test economic levers and see what remains evidence-dependent | LOW/MEDIUM | Candidate #4 / existing demo is sufficient first layer; add only a concise interpretive case layer later. |
| 商務決策工作台 (CDD) | Featured visual and primary CTA are external anchors; sample, blank assessment and outcomes links are explicit; inline case disclosure | Public CDD synthetic sample and blank assessment; featured case, evidence and Deal Readiness material | Highest immediate client value: one transaction moves from facts and UNKNOWNs to a human decision and next move | LOW/MEDIUM | Candidate #1: treat the existing sample as the second layer; improve entry framing only if needed, without a duplicate route. |

## Strongest drill-down candidates

### 1. CDD — “Should we commit?”

The existing depth is already real and interactive. The smallest useful second layer is a clear transition from the portfolio card to the synthetic sample, with the visitor seeing:

`Situation → evidence and UNKNOWN → commitment boundary → next question`

The blank assessment can remain a secondary route for a visitor who wants to try their own opportunity. A new CMS, account system or case page is unnecessary.

### 2. GBD + AI-Native Market Entry — “Where should effort go?”

These two works are strongest when treated as one connected exploration rather than two unrelated clickable products:

`candidate discovery → role reclassification → acquisition-path challenge → UNKNOWN → resource priority`

The existing AI-Native Market Entry case supplies the evidence/judgment lesson. The GBD case supplies the Owner-objective and supplier-reality perspective. The existing `related` relationship is the right connective primitive. The local GBD Judgment Reveal prototype is useful design evidence, but its local/private status means it should not silently become a public destination.

### 3. Business Spending Insight — “What does this spending mean before I meet my CPA?”

This is a credible second domain showcase, but its deeper layer should remain owner-facing and evidence-bound. The useful experience is not a tax calculator; it is a plain-language explanation of what happened, what may matter, what is missing and what to ask a CPA.

## Affordance inconsistencies

1. **Mixed action grammar:** external-demo cards use a small bottom CTA, while no-link case cards make the entire card toggle details and also expose a summary/button. A visitor cannot predict the result from the visual treatment alone.
2. **No-link pointer affordance:** GBD and AI-Native Market Entry carry `cursor-pointer` on the card, but the meaningful destination is an inline disclosure, not a separate page. This is functional, but the cursor implies a general “open” action rather than “reveal case study.”
3. **Different depth labels:** “案例研究,” external demo labels, and GBD’s “查看商業開發判斷” coexist. They are all valid, but the portfolio would be clearer if the eventual drill-down set used a deliberately small vocabulary such as `Try the demo` versus `Read the judgment`.
4. **Featured CDD is much more navigable than regular cards:** this is intentional hierarchy, but it means the regular flagship group needs explicit entry cues rather than relying on card-level pointer behavior.

No dead click was found in the current source: the no-link card click opens its inline details, and linked cards expose an actual destination. The issue is predictability and semantic consistency, not a broken handler.

## Reusable assets

- CDD public sample, blank assessment, existing featured case and Deal Readiness content.
- AI-Native Market Entry evidence case and its existing related link from GBD.
- GBD inline synthetic judgment content and the separate local Judgment Reveal prototype, subject to publication scope.
- Business Spending Insight public demo and existing related CDD bridge.
- TPN public demo and synthetic Gulf case.
- Existing `CaseStudy`, `related`, hash anchors and external `link` fields in `works.js`.

## Minimum viable implementation approach

1. Keep the homepage cards as overview and curiosity triggers.
2. Select only CDD and the connected GBD/AI-Native Market Entry path as the first deeper experiences; add Business Spending Insight after that if the owner-facing value remains clear.
3. Reuse existing demo links and expandable case studies before adding any new route.
4. Make each selected entry answer one additional question: “What did Paul notice, and what changed because of that judgment?”
5. Preserve explicit evidence states: synthetic, technical validation, UNKNOWN and human decision must not be compressed into a success claim.

This can be implemented without routing or CMS complexity. A same-page progressive disclosure or a small set of existing external demos is enough. A dedicated static case page would be a later option only if the inline layer becomes too long.

## What should remain non-clickable / CTA-only

The creative and supporting works should not be forced into a uniform second-level product narrative: Lil Matt's Gaming World, Waste Time, AI Lyrics Generator, MG Desktop Pet, Expense Tracker, Pilot Simulations, the deck, the tracker and the sales-pilot presentation already have appropriate artifact links. Their value comes from distinct execution evidence, not from pretending every item is a commercial case study.

“Non-clickable” here means the card shell should not imply an additional destination beyond its explicit artifact CTA. Existing inline case disclosure may remain where it adds evidence; no new drill-down should be required for every work.

## Final recommendation

Use a small, evidence-led drill-down set, not a portfolio-wide click model. Start with CDD, then the connected GBD / AI-Native Market Entry judgment path, and only then Business Spending Insight. Reuse the current demos and expandable case studies; do not add a CMS, database, authentication or new routing layer.

**Audit status:** READ-ONLY COMPLETE
**Production files modified:** NONE
**Commit / push / deploy:** NONE
