// Art for Trade Street: which picture each person uses, and where the twelve stops sit on each map.
// Files are named by role id, not by the working names, so a name change never means renaming a file.
// Positions are percentages of the picture (x from the left, y from the top). The two maps are separate
// drawings, so each has its own list; index 0 is stop 1.

export const MOBILE_QUERY = "(max-width: 639px)";

export const ART = {
  map: { desktop: "assets/trade-street-map.webp", mobile: "assets/trade-street-map-mobile.webp" },
  // where the water is, as a soft mask (the glints on the sea are drawn only inside it)
  mask: { desktop: "assets/sea-mask-desktop.webp", mobile: "assets/sea-mask-mobile.webp" },
  portrait: {
    guide: "assets/relay-guide.webp",
    forwarder: "assets/forwarder.webp",
    shipper: "assets/shipper.webp",
    factory: "assets/factory.webp",
    trucker: "assets/trucker.webp",
    broker: "assets/broker.webp",
    dispatcher: "assets/dispatcher.webp",
    buyer: "assets/buyer.webp",
  },
};

export const POS = {
  desktop: [[16, 24], [27.5, 33], [31.5, 37], [21.9, 40.5], [11, 29.5], [43.4, 40.5], [52.5, 41], [61.9, 36.7], [85, 23], [91.4, 17.2], [86.6, 69.4], [91.5, 79]],
  mobile: [[12.5, 19], [25.6, 32], [36, 36.5], [19, 35.5], [16, 25.5], [24.5, 47], [38, 51], [44, 45], [78, 40], [85, 17], [84, 77], [93, 79]],
};

// Each colour keeps white lettering readable (contrast at least 4.5, checked by scripts/verify-trade-street.mjs).
export const AVATAR_COLOR = {
  guide: "#1E7F86", forwarder: "#31497A", shipper: "#2F6EA6", factory: "#A4521E",
  trucker: "#5A6C2E", broker: "#86650F", dispatcher: "#7F6000", buyer: "#587087",
};

// Short names for the twelve stops on the route (the long names come from the 12-steps page).
export const SHORT = {
  zh: ["詢價", "訂艙", "SO", "提空櫃", "裝櫃", "進港", "報關", "查驗", "裝船", "船開", "提單", "寄單"],
  en: ["Quote", "Booking", "SO", "Empty box", "Loading", "To port", "Customs", "Gate", "On board", "Sails", "B/L", "Send docs"],
};
