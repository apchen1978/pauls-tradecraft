// Trade Street: two stops that are common in practice but are not on the published 12-steps page.
// They are kept apart from steps-text.js on purpose: steps-text.js is checked word for word against that page, this file is not.
// Public wording: shown as "a common extra stop". No days, money, real ports or companies.
import { STEP_TEXT } from "./steps-text.js";

export const EXTRA_STEPS = {
  vgm: {
    after: 5, // goes after original step 5 (loading) and before original step 6 (into the port)
    zh: {
      t: "補料（SI）與 VGM",
      p: "裝櫃之後，把提單要印的資料交給貨代（補料），並申報貨櫃裝好後的確認總重量（VGM）；兩樣都要在截港前交。",
      who: "你與工廠提供資料，貨代代為送交船公司。",
      prep: "照船公司通知的各個截止時間，交出提單要用的資料（收貨人、通知方、品名、件數、櫃號、封條號）和貨櫃的確認重量；交出去前再核對一次，並把每個截止時間都寫進日曆。",
      risk: "資料交晚或漏交，貨櫃可能上不了這班船；開船後才改資料，常要另外付費。",
      lesson: "開船日不是唯一的日期。截單、截 VGM、截港、截關各是不同的時間，截港前就要交；新人最常只看開船日，結果錯過其中一個。",
    },
    en: {
      t: "Supplementary shipping details (SI) and VGM",
      p: "After loading, give the forwarder what the bill of lading should print (the SI), and report the container's confirmed total weight once it is packed (the VGM). Both are due before the port cut-off.",
      who: "You and the factory supply the data; the forwarder sends it on to the shipping line.",
      prep: "Hand in what the bill of lading needs (consignee, notify party, product name, pieces, container number, seal number) and the container's confirmed weight, by each cut-off time the shipping line gives. Check once more before sending, and put every cut-off in your calendar.",
      risk: "If this is late or missed, the container may not make this sailing; changing the details after the ship has sailed often costs extra.",
      lesson: "The sailing day is not the only date. The document cut-off, the VGM cut-off, the port cut-off and the customs cut-off are different times, and this one is due before the port cut-off. Newcomers most often watch only the sailing day and miss one of the others.",
    },
  },
  pay: {
    after: 11, // goes after original step 11 (bill of lading) and before original step 12 (send documents)
    zh: {
      t: "收款後才放單",
      p: "貨已經上船了，錢還沒到之前，先不把單據交給買家。",
      who: "你、貨代與買家。",
      prep: "確認買家的款項已經到了，或雙方已把付款保障寫成文字；再決定放正本還是電放。款項還沒著落，單據先留在手上。",
      risk: "款還沒到就放單，貨可能已被買家提走，你手上就沒有可以談的籌碼。",
      lesson: "貨上船了、錢還沒到，單據是你手上最後的保障。付款還沒有保障，就先不往前走。",
    },
    en: {
      t: "Release the documents only after payment",
      p: "The goods are on the ship, but until the money has arrived, do not hand the documents to the buyer.",
      who: "You, the forwarder and the buyer.",
      prep: "Confirm the buyer's payment has already arrived, or that both sides have put the payment protection in writing; only then decide between the original bill and a telex release. If payment is still open, keep the documents.",
      risk: "If you release before payment, the buyer may already be able to take the goods, and you have nothing left to bargain with.",
      lesson: "The goods are aboard and the money has not come. The documents are your last protection. Until payment is secure, do not go forward.",
    },
  },
};

// The fourteen stops, in order. Each keeps the 12-steps text untouched; `extra` marks the two added stops.
export const ALL_STEPS = (() => {
  const out = [];
  STEP_TEXT.forEach((step) => {
    out.push({ ...step, extra: false });
    for (const extra of Object.values(EXTRA_STEPS)) if (extra.after === step.n) out.push({ zh: extra.zh, en: extra.en, extra: true });
  });
  return out.map((step, index) => ({ ...step, n: index + 1 }));
})();

export const EXTRA_INDEX = ALL_STEPS.flatMap((step, index) => (step.extra ? [index] : []));
export const isExtra = (index) => EXTRA_INDEX.includes(index);
// Position of an original 12-steps stop in the fourteen (original n is 1-based).
export const indexOfOriginal = (n) => ALL_STEPS.findIndex((step) => !step.extra && step.zh.t === STEP_TEXT[n - 1].zh.t);
