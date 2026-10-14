// Trade Street: what each of the twelve runners hands to the next one.
// Nothing here is a new fact. Every line is a re-cut of the 12-steps page text (steps-text.js), and `anchors` lists the
// Chinese phrases that must still be found in step n or step n+1 there; scripts/verify-trade-street.mjs checks them.
// "If it does not arrive" is not repeated here: the page shows that step's own `risk` line.

export const HANDOFF_LABEL = {
  zh: { head: "這一棒交出去的東西", gives: "交出什麼", to: "交給誰", miss: "沒交到會怎樣" },
  en: { head: "What this runner hands over", gives: "What is handed over", to: "Who receives it", miss: "If it does not arrive" },
};

export const HANDOFF = [
  {
    n: 1,
    zh: { gives: "買家要的到貨時間、你的貨什麼時候能備好、報價條件（運費誰付）", to: "下一站的貨代與船公司（訂艙用）" },
    en: { gives: "The buyer's required arrival time, when your goods will be ready, and the quote terms (who pays the freight)", to: "The forwarder and the shipping line at the next stop (for the booking)" },
    anchors: ["買家要的到貨時間", "你的貨什麼時候能備好", "報價條件（運費誰付）", "貨代", "船公司"],
  },
  {
    n: 2,
    zh: { gives: "貨物內容、數量、目的港、希望的出貨時間與櫃型", to: "貨代與船公司" },
    en: { gives: "What the goods are, the quantity, the destination port, the preferred shipping time and the container type", to: "The forwarder and the shipping line" },
    anchors: ["貨物內容、數量、目的港、希望的出貨時間與櫃型", "貨代", "船公司"],
  },
  {
    n: 3,
    zh: { gives: "SO（訂艙確認單）：船名航次、目的港、櫃型和各項截止時間", to: "你。核對之後，往下排拖車、裝櫃、進港" },
    en: { gives: "The SO (booking confirmation): vessel and voyage, destination port, container type and every cut-off time", to: "You. Once checked, you plan the trucking, loading and port delivery from it" },
    anchors: ["船名航次、目的港、櫃型和各項截止時間", "拖車、裝櫃、進港"],
  },
  {
    n: 4,
    zh: { gives: "空貨櫃，載到你的工廠", to: "工廠" },
    en: { gives: "The empty container, delivered to your factory", to: "The factory" },
    anchors: ["空貨櫃", "你的工廠", "工廠"],
  },
  {
    n: 5,
    zh: { gives: "裝好貨、上了封條的貨櫃，加上照片與封條號碼", to: "下一站的拖車，以及碼頭或貨櫃場" },
    en: { gives: "The loaded, sealed container, with the photos and the seal number", to: "The trucker and the terminal or container yard at the next stop" },
    anchors: ["上封條", "拍照留存，記下封條號碼", "拖車、碼頭或貨櫃場"],
  },
  {
    n: 6,
    zh: { gives: "裝好貨的重櫃", to: "碼頭或貨櫃場，排隊等著上船" },
    en: { gives: "The loaded container", to: "The terminal or container yard, to queue for the ship" },
    anchors: ["裝好貨的貨櫃", "碼頭或貨櫃場", "排隊等著上船"],
  },
  {
    n: 7,
    zh: { gives: "正確的品名、數量、價值與文件", to: "報關行，再由報關行向海關申報" },
    en: { gives: "The correct product name, quantity, value and documents", to: "The customs broker, who declares to customs" },
    anchors: ["正確的品名、數量、價值與文件", "報關行", "向海關申報"],
  },
  {
    n: 8,
    zh: { gives: "海關的決定：直接放行，或打開檢查；被通知時，要能快速補資料", to: "配合的報關行、拖車與碼頭" },
    en: { gives: "Customs' decision: release straight away, or open the container to inspect it; when you are told, you must be able to add papers quickly", to: "The broker, trucker and terminal who work with customs" },
    anchors: ["直接放行，或把貨櫃打開檢查", "快速補資料", "報關行、拖車與碼頭"],
  },
  {
    n: 9,
    zh: { gives: "「真的上船了」的確認，而不只是「進港了」", to: "你，由貨代向你確認" },
    en: { gives: "Confirmation that it is really on the ship, not only that it reached the port", to: "You, through the forwarder" },
    anchors: ["「真的上船了」", "「進港了」", "向貨代確認"],
  },
  {
    n: 10,
    zh: { gives: "實際開船日與預計到港日（預計和實際可能不同）", to: "買家，由你通知" },
    en: { gives: "The actual sailing day and the expected arrival day (the expected and the actual can differ)", to: "The buyer, told by you" },
    anchors: ["實際開船日與預計到港日", "預計和實際可能不同", "通知買家"],
  },
  {
    n: 11,
    zh: { gives: "提單（B/L）：收貨人、品名、數量、港口與文字", to: "你，逐項核對" },
    en: { gives: "The bill of lading (B/L): consignee, product name, quantity, ports and wording", to: "You, to check item by item" },
    anchors: ["提單（B/L）", "收貨人、品名、數量、港口與文字", "由你核對"],
  },
  {
    n: 12,
    zh: { gives: "正本提單，或電放通知", to: "買家" },
    en: { gives: "The original bill of lading, or a telex-release notice", to: "The buyer" },
    anchors: ["正本", "電放", "買家"],
  },
];
