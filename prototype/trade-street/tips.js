// Trade Street: "what newcomers often miss" and "what to watch every day".
// These are common industry practice, not text from the 12-steps page, and they are labelled that way on the page.
// Index = position in the fourteen stops (0-based). No days, money, real ports or companies.

export const TIP_LABEL = { zh: "新人常漏的（業界常見）", en: "What newcomers often miss (common practice)" };
export const EXTRA_TAG = { zh: "業界常見的補充站", en: "A common extra stop" };
export const COMMON = { zh: "業界常見", en: "common practice" };
export const LESSON_LABEL = { zh: "這一站的重點", en: "The point of this stop" };

export const TIPS = {
  1: {
    zh: "只口頭確認；托書只寫「越快越好」，沒寫最晚裝櫃日。",
    en: "Confirming only out loud; writing \"as soon as possible\" on the booking note without the latest loading day.",
  },
  2: {
    zh: "各個截止時間沒有寫進日曆。",
    en: "Not putting every cut-off time in the calendar.",
  },
  4: {
    zh: "沒拍空櫃、半裝、封門和封條特寫；封條號碼和貨代系統上的不一致。",
    en: "No photos of the empty container, the half-loaded one, the closed doors and a close-up of the seal; a seal number that differs from the forwarder's system.",
  },
  5: {
    zh: "重量申報漏了或超過時間，貨櫃就上不了船。",
    en: "A missed or late weight declaration means the container cannot board.",
  },
  6: {
    zh: "進港前，補料和重量申報要先交完。",
    en: "Before the container goes in, the supplementary details and the weight declaration must already be handed in.",
  },
  7: {
    zh: "發票、裝箱單、報關單、提單上的品名、件數、重量、體積、嘜頭不一致；商品分類碼或申報單位填錯。",
    en: "Product name, pieces, weight, volume or shipping marks that differ between the invoice, packing list, customs declaration and bill of lading; a wrong product classification code or declaration unit.",
  },
  11: {
    zh: "提單草稿沒有逐字看，收貨人、通知方、品名拼錯；開船後再改要付費。",
    en: "Not reading the draft bill line by line, so the consignee, notify party or product name is misspelled; changing it after sailing costs extra.",
  },
  12: {
    zh: "款還沒收到就先放單。",
    en: "Releasing the documents before the payment has arrived.",
  },
  13: {
    zh: "款還沒收到就電放。",
    en: "Sending a telex release before the payment has arrived.",
  },
};

export const DAILY = {
  zh: {
    title: "負責人每天要盯的 5 件事（業界常見）",
    items: [
      "時間節點：不只看開船日，還要盯截單、截 VGM、截港、截關。只看開船日、錯過截關，就只好改搭下一班船。",
      "SO 到手先核：船名航次、起運港、目的港、櫃型和各個截止時間；SO 沒追到，拖車就排不了。",
      "實際數字要一致：裝完櫃記下櫃號、封條號和實際件數、重量、體積；和訂艙或報關差太多，要在截關前通知貨代修改。",
      "報關資料：品名、商品分類碼、數量單位和金額前後一致，至少核兩遍；晚交或漏交就趕不上。",
      "提單草稿：從頭到尾逐字看（收貨人、通知方、品名、嘜頭、件數、櫃號、封條號）。",
    ],
  },
  en: {
    title: "5 things the person in charge watches every day (common practice)",
    items: [
      "The time points: not only the sailing day, but the document cut-off, the VGM cut-off, the port cut-off and the customs cut-off. Watching only the sailing day and missing the customs cut-off means the next sailing.",
      "Check the SO as soon as it arrives: vessel and voyage, loading port, destination port, container type and every cut-off time. Without the SO, the trucking cannot be planned.",
      "Real figures must match: after loading, note the container number, seal number and actual pieces, weight and volume. If they differ much from the booking or the declaration, tell the forwarder before the customs cut-off so it can be changed.",
      "The customs data: product name, classification code, quantity unit and value must agree throughout. Check at least twice; late or missing data means missing the ship.",
      "The draft bill of lading: read it line by line from start to end (consignee, notify party, product name, shipping marks, pieces, container number, seal number).",
    ],
  },
};
