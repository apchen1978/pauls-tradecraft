// Intrinsic sizes so older iOS can reserve a box before the file arrives.
// A lazy image with a used height of 0 never intersects the viewport, so the
// request never starts. CSS aspect-ratio covers current Safari; the attributes
// cover the versions that ignore it on unloaded images.
const COVER_DIMS = {
  "/images/cover-business-spending-insight.webp": [1600, 900],
  "/images/cover-commercial-decision-desk.webp": [1600, 1200],
  "/images/cover-commercial-decision-desk-en.webp": [1600, 1200],
  "/images/cover-deck-v2.webp": [1672, 941],
  "/images/cover-game-v3.webp": [1672, 941],
  "/images/cover-global-business-development.webp": [1600, 900],
  "/images/cover-global-business-development-zh.webp": [1600, 900],
  "/images/cover-lead-discovery.webp": [1440, 810],
  "/images/cover-lead-discovery-zh.webp": [1440, 810],
  "/images/cover-mg-desktop-pet.webp": [1440, 810],
  "/images/cover-mori-soft-furnishing.webp": [1200, 675],
  "/images/cover-payment-concentration.png": [1440, 810],
  "/images/cover-sales-pilot-casebrief-v3.webp": [1600, 900],
  "/images/cover-simulations-v2.webp": [1536, 1024],
  "/images/cover-spend-two-clocks.webp": [1600, 900],
  "/images/cover-tracker-v2.webp": [1600, 900],
  "/images/cover-trade-deal-desk.webp": [1440, 810],
  "/images/cover-trade-profit-navigator.webp": [1672, 941],
  "/images/paul-art.webp": [1229, 1536],
  "/images/cdd-executive-snapshot-zh-v02.png": [1052, 1146],
  "/images/cdd-executive-snapshot-en-v02.png": [1052, 1166],
  "/images/mg-poses.webp": [1600, 1000],
};

// The img src is the phone file. A min-width source upgrades desktop.
// Doing it this way (instead of a max-width source) means a browser that
// ignores <picture> still downloads the small file, which is the one a phone
// can paint on a slow link. srcset is not used: a 3x phone would otherwise
// pick the 1600px candidate.
function mobileSrc(src) {
  return src.replace(/\.(png|webp)$/i, "-800.webp");
}

function fullType(src) {
  return src.endsWith(".png") ? "image/png" : "image/webp";
}

export default function CoverImage({ src, alt, className, eager = false, fetchPriority }) {
  const size = COVER_DIMS[src];
  return (
    <picture>
      <source media="(min-width: 769px)" srcSet={src} type={fullType(src)} />
      <img
        src={mobileSrc(src)}
        alt={alt}
        width={size?.[0]}
        height={size?.[1]}
        className={className}
        loading={eager ? "eager" : "lazy"}
        fetchPriority={eager ? fetchPriority : undefined}
      />
    </picture>
  );
}
