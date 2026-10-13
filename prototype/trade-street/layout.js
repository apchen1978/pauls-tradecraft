// Art for Trade Street: which picture each person uses, and where the twelve stops sit on each map.
// Files are named by role id, not by the working names, so a name change never means renaming a file.
// Positions are percentages of the picture (x from the left, y from the top). The two maps are separate
// drawings, so each has its own list; index 0 is stop 1.

export const MOBILE_QUERY = "(max-width: 639px)";

export const ART = {
  map: { desktop: "assets/trade-street-map.webp", mobile: "assets/trade-street-map-mobile.webp" },
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
