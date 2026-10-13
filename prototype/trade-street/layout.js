// Art for Trade Street: which picture each person uses, and where the twelve stops sit on each map.
// Files are named by role id, not by the working names, so a name change never means renaming a file.
// Positions are percentages of the picture (x from the left, y from the top). The two maps are separate
// drawings, so each has its own list; index 0 is stop 1.

export const MOBILE_QUERY = "(max-width: 639px)";

export const ART = {
  map: { desktop: "assets/trade-street-map.webp", mobile: "assets/trade-street-map-mobile.webp" },
  // Layers for the gentle map motion: a plate with the clouds, the far ship and the crane's container taken out, plus those pieces as
  // separate pictures laid back exactly where they were (x, y, w, h in pixels of that map). A cloud drifts, the far ship sails off,
  // the container sways on its cable. If any picture fails to load, the approved whole map above stays as it is.
  layers: {
    desktop: {
      canvas: [1600, 900], plate: "assets/layers/desktop-plate.webp",
      sprites: [
        { id: "cloud-a", file: "assets/layers/desktop-cloud-a.webp", x: 674, y: 0, w: 214, h: 95 },
        { id: "cloud-b", file: "assets/layers/desktop-cloud-b.webp", x: 1275, y: 0, w: 175, h: 102 },
        { id: "cloud-c", file: "assets/layers/desktop-cloud-c.webp", x: 1450, y: 0, w: 150, h: 104 },
        { id: "far-ship", file: "assets/layers/desktop-far-ship.webp", x: 1427, y: 120, w: 125, h: 83 },
        { id: "crane-container", file: "assets/layers/desktop-crane-container.webp", x: 1271, y: 156, w: 98, h: 125, pivot: [47, 1] },
      ],
    },
    mobile: {
      canvas: [800, 1422], plate: "assets/layers/mobile-plate.webp",
      sprites: [
        { id: "cloud-a", file: "assets/layers/mobile-cloud-a.webp", x: 0, y: 0, w: 266, h: 100 },
        { id: "cloud-b", file: "assets/layers/mobile-cloud-b.webp", x: 263, y: 78, w: 283, h: 59 },
        { id: "cloud-c", file: "assets/layers/mobile-cloud-c.webp", x: 600, y: 30, w: 200, h: 115 },
        { id: "far-ship", file: "assets/layers/mobile-far-ship.webp", x: 619, y: 183, w: 148, h: 99 },
        { id: "crane-container", file: "assets/layers/mobile-crane-container.webp", x: 615, y: 476, w: 85, h: 103, pivot: [44, 1] },
      ],
    },
  },
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
