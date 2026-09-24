import { Lightbulb } from "@phosphor-icons/react";
import { useLang } from "../i18n.jsx";

const entries = {
  zh: {
    eyebrow: "TRADE NOTES · PAUL 的國貿現場筆記",
    title: "做國際生意，先把下一個問題問對。",
    intro: "有些國貿概念，不必先背得滾瓜爛熟；但在找客戶、談交貨或確認收款時，知道該問什麼很重要。這裡分享我在商業現場累積的觀察，把陌生名詞整理成你可以帶去討論的問題。",
    items: [
      {
        tag: "市場開發",
        title: "有產品之後，先找「可能買的人」，不只是找同業。",
        body: "公司名稱看起來相關，不等於它會向外部供應商採購。先看它扮演什麼角色、是否有合理的採購路徑，再決定值得查什麼、下一步問什麼。",
        question: "下一步先問：這家公司可能怎麼買？目前有什麼公開證據，還缺什麼？",
        answer: {
          label: "看實務上怎麼確認",
          eyebrow: "實務核對方向",
          title: "先確認它的採購路徑，再決定投入多少時間。",
          steps: ["分清公司是品牌、製造商、經銷商，還是規格平台。", "找公開線索，確認它是否向外部供應商採購或代理產品。", "把沒有證據的部分留為待確認，下一步再找對的人或資料核實。"],
          caution: "公司做相近產品，只能說明它與市場相關；不能單獨證明它會採購。",
        },
        source: "看海外客戶開發案例",
        href: "#overseas-lead-discovery",
        internal: true,
      },
      {
        tag: "交貨條件",
        title: "FOB 與 CIF：運費由誰付，不等於風險在哪裡轉移。",
        body: "FOB 與 CIF 都是海運條件，但報價包含運費或保險，不代表賣方的風險就一路延伸到目的地。先確認實際交貨節點、指定港口，以及誰安排哪些運輸與保險。",
        question: "下一步先問：貨物在哪個明確地點交付？風險從哪個節點轉移？",
        answer: {
          label: "看實務上怎麼確認",
          eyebrow: "報價前核對",
          title: "把交貨地點、風險節點與費用分開確認。",
          steps: ["寫清楚約定的具體港口或地點，不只寫 FOB / CIF。", "確認貨物在哪個節點算完成交付、風險何時轉移。", "逐項確認誰安排與支付主運費、保險及目的地相關費用。"],
          caution: "FOB 與 CIF 是海運／內河運輸條件；實際條款與指定地點應依交易情況及合約確認。",
        },
        source: "ICC · Incoterms® 2020",
        href: "https://library.iccwbo.org/content/clp/Others/incoterms_2020_checklist_2024-update.pdf",
      },
      {
        tag: "付款與單據",
        title: "L/C 信用狀：銀行看單據，不是替你驗貨。",
        body: "信用狀把付款和約定的單據條件連在一起。文件看似小地方的差異，也可能變成需要處理的不符點；它不是對貨物品質或交易履約的全面保證。",
        question: "下一步先問：需要哪些文件、由誰出具、期限是什麼？出貨流程做得到嗎？",
        answer: {
          label: "看實務上怎麼確認",
          eyebrow: "出貨前核對",
          title: "先把信用狀要求逐項對到實際出貨文件。",
          steps: ["列出每份要求文件、出具方、內容與提交期限。", "拿條款逐項對照訂單、出貨、保險及收款流程，找出做不到或容易不一致的地方。", "出貨前請往來銀行或熟悉信用狀的專業人員確認疑點。"],
          caution: "信用狀下銀行審查的是提示的單據，不是貨物本身；這份核對不能代替銀行審單或個案判斷。",
        },
        source: "ICC · UCP 600",
        href: "https://2go.iccwbo.org/explore-our-products/ebooks/ucp-600-uniform-rules-for-documentary-credits-config-1.html",
      },
      {
        tag: "貨櫃交接",
        title: "貨櫃還沒上船就交出去了：先核對 FCA 與 FOB。",
        body: "熟悉 FOB 很正常，但貨櫃可能在裝船前，就已交到承運人或貨櫃場站。交接方式不同，適用的條件也值得重新核對；不要只因為以前都這樣寫就直接沿用。",
        question: "下一步先問：賣方實際在哪裡、以什麼方式把貨交給承運人？",
        answer: {
          label: "看實務上怎麼確認",
          eyebrow: "訂艙前核對",
          title: "先看貨物實際在哪裡交到承運人手上。",
          steps: ["確認交貨點是在工廠、貨櫃場站，還是已裝上船。", "請貨代說明實際收貨與裝船流程，核對誰負責各段安排。", "讓合約用語、交貨現場與信用狀所需單據彼此對得上。"],
          caution: "貨櫃貨物常在裝船前交給承運人；FCA 或 FOB 是否合適，仍要按實際交接方式與合約確認。",
        },
        source: "ICC · Choosing an Incoterm®",
        href: "https://library.iccwbo.org/content/clp/Others/incoterms_2020_checklist_2024-update.pdf",
      },
      {
        tag: "目的地責任",
        title: "DAP 與 DDP：送到目的地，不代表責任都一樣。",
        body: "兩者都談目的地交付，但進口清關、關稅與卸貨等責任安排並不相同。報價前要先確認目的地的實際要求，以及公司是否有能力承擔相應工作。",
        question: "下一步先問：誰負責進口清關與關稅？貨到後由誰卸貨？",
        answer: {
          label: "看實務上怎麼確認",
          eyebrow: "報價前核對",
          title: "先確認目的地的進口工作由誰承擔。",
          steps: ["確認誰辦理進口清關、支付關稅及其他進口費用。", "確認貨到後由誰負責卸貨，以及買方是否具備進口所需條件。", "把具體交貨地點和責任分工寫進報價或合約，並先核算相關成本。"],
          caution: "DAP 與 DDP 的責任分配不同；目的地法規、進口資格及費用需按個案向專業人士核實。",
        },
        source: "ICC · Incoterms® 2020",
        href: "https://library.iccwbo.org/content/clp/Others/incoterms_2020_checklist_2024-update.pdf",
      },
    ],
    note: "這些筆記協助理解問題、準備下一個問題；不取代合約審閱、銀行確認或個案專業意見。",
  },
  en: {
    eyebrow: "TRADE NOTES · PAUL'S FIELD NOTES ON TRADE",
    title: "In global trade, a better next question changes the conversation.",
    intro: "You do not need to memorize every trade term. But when finding buyers, agreeing delivery, or arranging payment, it helps to know what to ask. These are observations from my commercial experience, translated into questions you can take into a real discussion.",
    items: [
      {
        tag: "Market development",
        title: "After the product, look for a plausible buyer—not just a similar company.",
        body: "A company that looks relevant may not buy from external suppliers. First understand its role and whether a credible acquisition path exists; then decide what evidence to seek and what to ask next.",
        question: "Ask next: How might this company buy? What public evidence exists, and what is still missing?",
        answer: {
          label: "See a practical way to check",
          eyebrow: "PRACTICAL CHECK",
          title: "Confirm the acquisition path before investing more time.",
          steps: ["Identify whether the company is a brand, manufacturer, distributor, or specification platform.", "Look for public evidence that it sources from or distributes products for external suppliers.", "Keep unsupported assumptions as unknown, then verify with the right person or source."],
          caution: "Selling similar products shows market relevance; by itself, it does not show that the company will buy.",
        },
        source: "See the overseas customer development case",
        href: "#overseas-lead-discovery",
        internal: true,
      },
      {
        tag: "Delivery terms",
        title: "FOB and CIF: who pays freight is not where risk transfers.",
        body: "Both are sea-transport rules, but including freight or insurance in a quotation does not mean the seller's risk continues to destination. Confirm the delivery point, named port, and who arranges each transport and insurance task.",
        question: "Ask next: At what named place is delivery made, and where does risk transfer?",
        answer: {
          label: "See a practical way to check",
          eyebrow: "BEFORE QUOTING",
          title: "Confirm the delivery point, risk point, and costs separately.",
          steps: ["Name the specific port or place; do not stop at FOB / CIF alone.", "Confirm when delivery is complete and when risk transfers.", "Agree who arranges and pays main carriage, insurance, and destination-related costs."],
          caution: "FOB and CIF are sea and inland-waterway terms. Confirm the named place and contract wording for the actual shipment.",
        },
        source: "ICC · Incoterms® 2020",
        href: "https://library.iccwbo.org/content/clp/Others/incoterms_2020_checklist_2024-update.pdf",
      },
      {
        tag: "Payment & documents",
        title: "Letters of credit: banks examine documents, not the goods.",
        body: "A documentary credit links payment to the stipulated documents and conditions. Small discrepancies can require action; an L/C is not a complete guarantee of product quality or performance.",
        question: "Ask next: Which documents are required, who issues them, and can the shipment meet the deadlines?",
        answer: {
          label: "See a practical way to check",
          eyebrow: "BEFORE SHIPMENT",
          title: "Match each L/C requirement to the documents your shipment can produce.",
          steps: ["List each required document, its issuer, required details, and presentation deadline.", "Compare the terms with the order, shipping, insurance, and payment workflow; flag anything impractical or inconsistent.", "Ask the advising / handling bank or an L/C professional to review unresolved points before shipment."],
          caution: "Under a documentary credit, banks examine the presented documents, not the goods. This checklist does not replace bank examination or case-specific advice.",
        },
        source: "ICC · UCP 600",
        href: "https://2go.iccwbo.org/explore-our-products/ebooks/ucp-600-uniform-rules-for-documentary-credits-config-1.html",
      },
      {
        tag: "Container handover",
        title: "If the container is handed over before loading, check FCA vs FOB.",
        body: "FOB is familiar, but a container may be handed to a carrier or terminal before it is loaded on board. The actual handover matters; do not reuse a familiar term without checking whether it fits the shipment.",
        question: "Ask next: Where and how does the seller actually hand the goods to the carrier?",
        answer: {
          label: "See a practical way to check",
          eyebrow: "BEFORE BOOKING",
          title: "Start with where the carrier actually receives the goods.",
          steps: ["Confirm whether handover is at the seller's premises, a terminal, or on board the vessel.", "Ask the forwarder to explain the actual receipt and loading sequence, including who arranges each leg.", "Align the contract term with the physical handover and any documents required by the L/C."],
          caution: "Containerized goods may be handed to a carrier before loading. Whether FCA or FOB fits depends on the actual handover and contract.",
        },
        source: "ICC · Choosing an Incoterm®",
        href: "https://library.iccwbo.org/content/clp/Others/incoterms_2020_checklist_2024-update.pdf",
      },
      {
        tag: "Destination responsibilities",
        title: "DAP and DDP: delivery to destination does not mean the same responsibilities.",
        body: "Both address delivery at destination, but import clearance, duties, and unloading responsibilities differ. Confirm the destination requirements and whether the company can actually take on the work before quoting.",
        question: "Ask next: Who handles import clearance and duties? Who unloads the goods?",
        answer: {
          label: "See a practical way to check",
          eyebrow: "BEFORE QUOTING",
          title: "Confirm who can handle the import work at destination.",
          steps: ["Confirm who clears the goods for import and pays duties and other import charges.", "Check who unloads the goods and whether the buyer can meet the import requirements.", "Write the named place and responsibility split into the quotation or contract, then check the related costs."],
          caution: "DAP and DDP allocate responsibilities differently. Verify destination rules, importer eligibility, and costs for the specific transaction.",
        },
        source: "ICC · Incoterms® 2020",
        href: "https://library.iccwbo.org/content/clp/Others/incoterms_2020_checklist_2024-update.pdf",
      },
    ],
    note: "These notes help you understand the issue and prepare better questions. They do not replace contract review, bank confirmation, or professional advice on a specific transaction.",
  },
};

export default function TradeNotes() {
  const { lang } = useLang();
  const content = entries[lang === "zh" ? "zh" : "en"];

  return (
    <section id="trade-notes" aria-labelledby="trade-notes-title" className="border-y border-line bg-paper/55">
      <div className="mx-auto max-w-7xl px-4 py-14 md:px-6 md:py-20">
        <div className="grid gap-5 md:grid-cols-[0.8fr_1.2fr] md:gap-12">
          <div>
            <p className="eyebrow">{content.eyebrow}</p>
            <h2 id="trade-notes-title" className="mt-3 max-w-xl text-3xl font-semibold leading-tight tracking-[-0.035em] text-forest md:text-4xl">
              {content.title}
            </h2>
            <p className="mt-4 max-w-lg text-sm leading-relaxed text-ink/70 md:text-base">{content.intro}</p>
          </div>

          <div className="divide-y divide-forest/15 border-y border-forest/20">
            {content.items.map((item, index) => (
              <details key={item.tag} className="group py-4 md:py-5">
                <summary className="flex cursor-pointer list-none items-start gap-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-amber [&::-webkit-details-marker]:hidden">
                  <span className="mt-0.5 font-mono text-xs text-amber">0{index + 1}</span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[10px] font-bold uppercase tracking-[0.16em] text-moss">{item.tag}</span>
                    <span className="mt-1.5 block text-base font-semibold leading-snug text-forest md:text-lg">{item.title}</span>
                  </span>
                  <span aria-hidden="true" className="ml-2 text-xl leading-none text-amber transition-transform motion-reduce:transition-none group-open:rotate-45">+</span>
                </summary>
                <div className="ml-8 mt-4 max-w-2xl border-l border-amber/45 pl-4 md:ml-10 md:pl-5">
                  <p className="text-sm leading-relaxed text-ink/75">{item.body}</p>
                  <p className="mt-3 text-sm font-medium leading-relaxed text-forest">{item.question}</p>
                  <details className="group/practical mt-4 border-y border-forest/15">
                    <summary className="flex cursor-pointer list-none items-center gap-3 py-3 text-sm font-semibold text-forest focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber [&::-webkit-details-marker]:hidden">
                      <span className="flex size-8 shrink-0 items-center justify-center rounded-full border border-amber/35 bg-amber/10 text-amber" aria-hidden="true">
                        <Lightbulb size={16} weight="regular" />
                      </span>
                      <span className="min-w-0 flex-1">{item.answer.label}</span>
                      <span aria-hidden="true" className="text-lg leading-none text-moss transition-transform motion-reduce:transition-none group-open/practical:rotate-45">+</span>
                    </summary>
                    <div className="mb-4 border-l-2 border-amber/45 py-1 pl-4 md:pl-5">
                      <p className="eyebrow text-[9px]">{item.answer.eyebrow}</p>
                      <h3 className="mt-2 text-base font-semibold leading-snug text-forest">{item.answer.title}</h3>
                      <ol className="mt-3 space-y-2 text-sm leading-relaxed text-ink/75">
                        {item.answer.steps.map((step, stepIndex) => (
                          <li key={step} className="flex gap-2.5">
                            <span className="mt-px font-mono text-[11px] text-amber">0{stepIndex + 1}</span>
                            <span>{step}</span>
                          </li>
                        ))}
                      </ol>
                      <p className="mt-3 text-xs leading-relaxed text-ink/60">{item.answer.caution}</p>
                    </div>
                  </details>
                  <a href={item.href} target={item.internal ? undefined : "_blank"} rel={item.internal ? undefined : "noreferrer"} className="mt-3 inline-flex text-xs font-semibold text-moss underline decoration-moss/40 underline-offset-4 hover:text-forest">
                    {item.source} ↗
                  </a>
                </div>
              </details>
            ))}
          </div>
        </div>
        <p className="mt-8 max-w-4xl text-xs leading-relaxed text-ink/55">{content.note}</p>
      </div>
    </section>
  );
}
