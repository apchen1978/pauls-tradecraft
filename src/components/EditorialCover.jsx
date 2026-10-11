import "./EditorialCover.css";

export const editorialCoverIds = new Set([
  "commercial-decision-desk", "trade-profit-navigator", "mg-desktop-pet",
]);

const copy = {
  zh: {
    decision: "這筆訂單，現在能不能承諾？",
    payment: "先確認付款條件", revenue: "訂單收入",
    contribution: "資金成本前預期淨貢獻",
    disclosure: "示範／成效未驗證",
    margin: "毛利，還撐得住嗎？", concept: "概念示意 · 非案例比例",
    costs: ["收入", "商品成本", "出口前費用與關稅", "資金成本", "剩餘貢獻"],
    pet: "桌上的小夥伴",
  },
  en: {
    decision: "Can this order move forward?",
    payment: "Confirm payment terms first", revenue: "Order revenue",
    contribution: "Expected contribution before funding",
    disclosure: "Demo · Outcomes unverified",
    margin: "Does the margin still hold?", concept: "Concept · Not case proportions",
    costs: ["Revenue", "Product cost", "Pre-export costs & duty", "Funding cost", "Contribution"],
    pet: "A little companion on your desktop",
  },
};

// The two figures are the existing public synthetic example in works.js / the
// executive snapshot. The cost bridge is deliberately conceptual, not that case.
export default function EditorialCover({ work, lang }) {
  const c = copy[lang];
  const kind = work.id === "commercial-decision-desk" ? "decision"
    : work.id === "trade-profit-navigator" ? "margin" : "pet";
  return (
    <div className={`editorial-cover editorial-cover--${kind}`} lang={lang}>
      <div className="editorial-cover__brand" aria-hidden="true">Paul’s Tradecraft<span /></div>
      {kind === "decision" && (
        <div className="editorial-cover__decision">
          <div>
            <p className="editorial-cover__headline">{c.decision}</p>
            <p className="editorial-cover__name">{work[lang].title}</p>
          </div>
          <div className="editorial-cover__slip">
            <p className="editorial-cover__payment">{c.payment}</p>
            <dl className="editorial-cover__figures">
              <div><dt>{c.revenue}</dt><dd>144,000 <span>USD</span></dd></div>
              <div><dt>{c.contribution}</dt><dd>36,000 <span>USD</span></dd></div>
            </dl>
            <p className="editorial-cover__disclosure">{c.disclosure}</p>
          </div>
        </div>
      )}
      {kind === "margin" && (
        <div className="editorial-cover__margin">
          <div>
            <p className="editorial-cover__headline">{c.margin}</p>
            <p className="editorial-cover__name">{work[lang].title}</p>
          </div>
          <div className="editorial-cover__bridge">
            <p className="editorial-cover__disclosure">{c.concept}</p>
            {c.costs.map((label, index) => (
              <div className="editorial-cover__cost" key={label}>
                <span>{label}</span>
                <div className={`editorial-cover__bar editorial-cover__bar--${index}`} aria-hidden="true" />
              </div>
            ))}
            <p className="editorial-cover__disclosure">{c.disclosure}</p>
          </div>
        </div>
      )}
      {kind === "pet" && (
        <div className="editorial-cover__pet">
          <div>
            <p className="editorial-cover__mg">MG<span>.</span></p>
            <p className="editorial-cover__pet-name">Desktop Pet</p>
            <p className="editorial-cover__pet-note">{c.pet}</p>
          </div>
          <picture>
            <source media="(min-width: 769px)" srcSet="/images/mg-editorial-character.webp" type="image/webp" />
            <img src="/images/mg-editorial-character-800.webp" width="800" height="800" alt={lang === "zh" ? "MG 橘色桌寵角色" : "MG orange desktop companion"} loading="lazy" />
          </picture>
        </div>
      )}
    </div>
  );
}
