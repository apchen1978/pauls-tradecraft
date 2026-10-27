// Shared room directory. Keep this file data-only so both room pages can use it.
export const ROOMS = Object.freeze([
  Object.freeze({
    id: "room01",
    name: Object.freeze({ zh: "Room 01｜客廳", en: "Room 01 · Living Room" }),
    city: Object.freeze({ zh: "家的第一個房間", en: "The first room of home" }),
    cover: Object.freeze({
      thumb: "/gallery/assets/roomverse-room01-concept-thumb.webp",
      mobile: "/gallery/assets/roomverse-room01-concept-mobile.webp",
    }),
    url: "/prototype/roomverse-3d/",
    transitionColor: "#6b5bd8",
    listed: true,
  }),
  Object.freeze({
    id: "room02",
    name: Object.freeze({ zh: "Room 02｜Brooklyn Studio", en: "Room 02 · Brooklyn Studio" }),
    city: Object.freeze({ zh: "紐約 · 布魯克林", en: "Brooklyn, New York" }),
    cover: Object.freeze({
      thumb: "/gallery/assets/roomverse-room02-brooklyn-concept-thumb.webp",
      mobile: "/gallery/assets/roomverse-room02-brooklyn-concept-mobile.webp",
    }),
    url: "/prototype/roomverse-3d/bedroom/",
    transitionColor: "#6b5bd8",
    listed: true,
  }),
  Object.freeze({
    id: "room03",
    name: Object.freeze({ zh: "Room 03｜Bay Area Kitchen", en: "Room 03 · Bay Area Kitchen" }),
    city: Object.freeze({ zh: "舊金山灣區", en: "San Francisco Bay Area" }),
    cover: Object.freeze({
      thumb: "/gallery/assets/roomverse-room03-bay-area-kitchen-concept-thumb.webp",
      mobile: "/gallery/assets/roomverse-room03-bay-area-kitchen-concept-mobile.webp",
    }),
    url: "/prototype/roomverse-3d/kitchen/",
    transitionColor: "#6b5bd8",
    listed: true,
  }),
]);
