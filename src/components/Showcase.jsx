import { Fragment, useEffect, useRef, useState } from "react";
import { ArrowUpRight } from "@phosphor-icons/react";
import { useLang } from "../i18n.jsx";
import { withDemoLang } from "../demoLinks.js";

// Interactive works sit directly after the three questions, before the
// one-deal section. The Garage stays further down. Extra cards join this
// grid instead of stretching one work into a banner.
// Five works use a three-plus-two layout to keep the two lamp works together.
// With six or more, the regular three-column grid keeps every card equally legible.
const wideAt = (index, count, item) => {
  if (item?.rooms) return { li: "sm:col-span-2 xl:col-span-6", row: "" }; // ROOMVERSE is a series: one wide card holding every open room
  if (count !== 5 || index < 3) return { li: "xl:col-span-2", row: "" };
  if (index === 4) return { li: "sm:col-span-2 xl:col-span-3", row: "sm:flex-row" };
  return { li: "xl:col-span-3", row: "xl:flex-row" };
};
const wideImage = { "sm:flex-row": "sm:w-2/5 sm:shrink-0 sm:self-start", "xl:flex-row": "xl:w-2/5 xl:shrink-0 xl:self-start", "": "" };

function ShowcaseImage({ item, index }) {
  const imageRef = useRef(null);
  const [loadImage, setLoadImage] = useState(() => index === 0 || window.matchMedia("(min-width: 769px)").matches);

  useEffect(() => {
    if (loadImage) return undefined;
    const image = imageRef.current;
    if (!image || !("IntersectionObserver" in window)) {
      setLoadImage(true);
      return undefined;
    }
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setLoadImage(true);
        observer.disconnect();
      }
    }, { rootMargin: "300px 0px" });
    observer.observe(image);
    return () => observer.disconnect();
  }, [loadImage]);

  return (
    <img
      ref={imageRef}
      src={loadImage ? item.image : "data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs="}
      alt={item.imageAlt}
      width={item.imageWidth}
      height={item.imageHeight}
      loading={loadImage ? "eager" : "lazy"}
      decoding="async"
      className="h-full w-full object-cover"
      style={{ objectPosition: item.objectPosition }}
    />
  );
}

// Paintings and music that live inside the rooms (Paul 2026-11-26): the gallery and the Music Lounge sit directly under
// the four rooms, large and generous, so a visitor who never scrolls further still sees rooms, paintings and music together.
// Images load natively lazy: this block is far below the first screen. A third slot (text, fiction) can join the grid later.
const paintingCells = [
  "col-span-2 aspect-[4/3] md:col-span-1 md:row-span-2 md:aspect-auto", // tall interior
  "col-span-2 aspect-[16/9] md:col-span-2 md:aspect-auto",
  "aspect-square md:aspect-auto",
  "aspect-square md:aspect-auto",
  "col-span-2 aspect-[16/9] md:col-span-1 md:aspect-auto",
  "col-span-2 aspect-[16/9] md:col-span-1 md:aspect-auto",
];

function Collection({ data, lang }) {
  const galleryHref = `${data.galleryHref}?lang=${lang}`;
  const musicHref = `${data.musicHref}?lang=${lang}`;
  const serif = { fontFamily: '"Noto Serif TC","Songti TC",serif' };
  return (
    <div id="showcase-collection" className="w-full scroll-mt-24 rounded-[1.25rem] bg-[#1d1915] px-5 py-12 text-[#f1e9da] md:px-12 md:py-20">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#d3ad62] md:text-sm">{data.tag}</p>
      <h3 className="mt-3 max-w-[18em] text-[2.25rem] font-normal leading-[1.15] tracking-[0.04em] md:text-[3.4rem]" style={serif}>{data.title}</h3>
      <p className="mt-4 max-w-[36em] text-[1.15rem] leading-[1.6] tracking-[0.03em] text-[#f2c48a] md:text-[1.5rem]">{data.lead}</p>

      <section id="showcase-gallery" aria-labelledby="showcase-gallery-title" className="mt-12 scroll-mt-28 md:mt-16">
        <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-3">
          <div>
            <p className="text-xs font-semibold tracking-[0.16em] text-[#d3ad62]">{data.galleryCount}</p>
            <h4 id="showcase-gallery-title" className="mt-1 text-[1.75rem] font-normal leading-[1.25] md:text-[2.25rem]" style={serif}>{data.galleryLabel}</h4>
            <p className="mt-1 text-sm text-[#b9ae9a] md:text-base">{data.galleryNote}</p>
          </div>
          <a
            href={galleryHref}
            className="group inline-flex min-h-11 items-center gap-2 border-b border-[#d3ad62] pb-1 text-base text-[#f1e9da] transition-colors hover:text-[#d3ad62] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#d3ad62]"
          >
            <span>{data.galleryCta}</span>
            <ArrowUpRight size={16} weight="bold" aria-hidden="true" className="shrink-0 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </a>
        </div>
        <ul className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4 md:grid-rows-[repeat(2,minmax(0,17rem))] md:gap-4">
          {data.paintings.map((p, i) => (
            <li key={p.id} className={`group/tile relative min-h-0 overflow-hidden rounded bg-black shadow-[0_18px_40px_rgba(0,0,0,0.45)] ${paintingCells[i]}`}>
              <a href={galleryHref} tabIndex="-1" aria-hidden="true" className="block h-full w-full">
                <img src={p.src} width={p.w} height={p.h} alt="" loading="lazy" decoding="async" className="h-full w-full object-cover transition-transform duration-500 group-hover/tile:scale-[1.03]" />
              </a>
              <span className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/45 to-transparent px-3 pb-2.5 pt-10 text-xs text-[#f1e9da] md:text-sm" style={serif}>{p.name}</span>
              <span className="sr-only">{p.alt}</span>
            </li>
          ))}
        </ul>
      </section>

      <section id="showcase-music" aria-labelledby="showcase-music-title" className="mt-14 scroll-mt-28 md:mt-20">
        <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-3">
          <div>
            <p className="text-xs font-semibold tracking-[0.16em] text-[#d3ad62]">{data.musicCount}</p>
            <h4 id="showcase-music-title" className="mt-1 text-[1.75rem] font-normal leading-[1.25] md:text-[2.25rem]" style={serif}>{data.musicLabel}</h4>
            <p className="mt-1 text-sm text-[#b9ae9a] md:text-base">{data.musicNote}</p>
          </div>
          <a
            href={musicHref}
            className="group inline-flex min-h-11 items-center gap-2 border-b border-[#d3ad62] pb-1 text-base text-[#f1e9da] transition-colors hover:text-[#d3ad62] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#d3ad62]"
          >
            <span>{data.musicCta}</span>
            <ArrowUpRight size={16} weight="bold" aria-hidden="true" className="shrink-0 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </a>
        </div>
        <ul className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
          {data.covers.map((c) => (
            <li key={c.id} className="group/tile relative aspect-square overflow-hidden rounded bg-black shadow-[0_18px_40px_rgba(0,0,0,0.45)]">
              <a href={musicHref} tabIndex="-1" aria-hidden="true" className="block h-full w-full">
                <img src={c.src} width="512" height="512" alt="" loading="lazy" decoding="async" className="h-full w-full object-cover transition-transform duration-500 group-hover/tile:scale-[1.03]" />
              </a>
              <span className="pointer-events-none absolute inset-x-0 bottom-0 flex flex-col items-start gap-0.5 bg-gradient-to-t from-black/85 via-black/50 to-transparent px-3 pb-2.5 pt-12 text-xs text-[#f1e9da] md:flex-row md:items-end md:justify-between md:gap-2 md:text-sm">
                <span style={serif}>{c.name}</span>
                <span className="shrink-0 text-[0.7rem] tracking-[0.12em] text-[#d3ad62]">{c.note}</span>
              </span>
            </li>
          ))}
        </ul>
      </section>

      <p className="mt-10 text-sm font-semibold text-[#f2c48a]">{data.how}</p>
      <p className="mt-2 text-xs leading-relaxed text-[#8f8574]">{data.boundary}</p>
    </div>
  );
}

export default function Showcase() {
  const { lang, t } = useLang();
  const s = t.showcase;
  const items = s.items.map((item) => ({ ...item, href: withDemoLang(item.href, lang) }));

  return (
    <section id="showcase" aria-labelledby="showcase-heading" className="scroll-mt-24 border-b border-line bg-white">
      <div className="mx-auto max-w-7xl px-5 py-16 md:px-6 md:py-28 max-[768px]:py-1">
        <p className="text-xs font-semibold tracking-[0.08em] text-amber md:text-sm max-[768px]:leading-[1.3]">{s.eyebrow}</p>
        <h2 id="showcase-heading" className="mt-4 max-w-[10em] text-[2.25rem] font-semibold leading-[1.1] tracking-[-0.03em] text-amber md:text-[3.5rem] max-[768px]:mt-1 max-[768px]:text-[1.875rem] max-[768px]:leading-[1.05]">
          {s.headline}
        </h2>
        <p className="mt-5 max-w-[42ch] text-base leading-relaxed text-moss md:text-lg max-[768px]:mt-1 max-[768px]:max-w-none max-[768px]:text-[0.9375rem] max-[768px]:leading-[1.35]">{s.intro}</p>
        <p className="mt-4 max-w-[42ch] text-sm leading-relaxed text-moss md:text-base max-[768px]:mt-0.5 max-[768px]:max-w-none max-[768px]:leading-[1.35]">
          {s.startLabel}{" "}
          <a
            href={withDemoLang(s.startHref, lang)}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-sm font-semibold text-ink underline decoration-ink/40 underline-offset-4 hover:decoration-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ink max-[768px]:-my-3 max-[768px]:inline-flex max-[768px]:min-h-11 max-[768px]:items-center"
          >
            {s.startCta}
          </a>
        </p>
        <ol className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 md:mt-14 lg:gap-8 xl:grid-cols-6 max-[768px]:mt-3">
          {items.map((item, index) => {
            const wide = wideAt(index, items.length, item);
            if (item.rooms) return (
            <Fragment key={item.href}>
            <li className={`flex flex-col ${wide.li}`}>
              <p className="mx-auto mb-6 max-w-[34em] text-center text-base leading-relaxed text-moss md:mb-8 md:text-lg">{item.bridge}</p>
              {/* Gallery panel (Paul 2026-11-11): a dark warm band that breaks from the pale cards around it, covers as the main thing, museum-label captions. */}
              <article className="w-full rounded-[1.25rem] bg-[#1d1915] px-5 py-12 text-[#f1e9da] md:px-12 md:py-20">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#d3ad62] md:text-sm">{item.tag}</p>
                <h3 className="mt-3 text-[2.25rem] font-normal leading-[1.15] tracking-[0.04em] md:text-[3.4rem]" style={{ fontFamily: '"Noto Serif TC","Songti TC",serif' }}>{item.title}</h3>
                <p className="mt-4 max-w-[34em] text-[1.35rem] leading-[1.5] tracking-[0.06em] text-[#f2c48a] md:text-[1.9rem]">{item.hook}</p>
                <ul className="mx-auto mt-10 grid w-full max-w-[28rem] grid-cols-1 gap-12 md:mx-0 md:mt-14 md:max-w-none md:grid-cols-2 md:gap-9 lg:grid-cols-4">
                  {item.rooms.map((room, roomIndex) => {
                    const href = withDemoLang(room.href, lang);
                    return (
                      <li key={room.href} className="flex">
                        <div className="flex w-full flex-col">
                          <div className="relative">
                            <a
                              href={href}
                              target="_blank"
                              rel="noopener noreferrer"
                              aria-label={`${room.no} ${room.name} — ${room.cta}`}
                              tabIndex="-1"
                              aria-hidden="true"
                              className="block aspect-[4/5] overflow-hidden rounded bg-black shadow-[0_18px_40px_rgba(0,0,0,0.45)] focus-visible:outline focus-visible:outline-4 focus-visible:-outline-offset-4 focus-visible:outline-[#d3ad62] md:aspect-[3/4]"
                            >
                              <ShowcaseImage item={room} index={index + roomIndex} />
                            </a>
                            {room.wip && (
                              <span className="pointer-events-none absolute left-3 top-3 rounded-full border border-bone/70 bg-ink px-3 py-1.5 text-xs font-semibold leading-none text-bone">
                                {room.wip}
                              </span>
                            )}
                          </div>
                          {/* Museum-wall label: number, name, one light, how it was made. The longer description stays for screen readers and search. */}
                          <div className="mt-5 border-t border-[#3a342c] pt-4">
                            <p className="text-xs font-semibold tracking-[0.16em] text-[#d3ad62]">{room.no}</p>
                            <h4 className="mt-1 text-[1.35rem] font-normal leading-[1.3]" style={{ fontFamily: '"Noto Serif TC","Songti TC",serif' }}>{room.name}</h4>
                            <p className="mt-1 text-sm text-[#b9ae9a]">{room.light}</p>
                            <p className="mt-2 text-xs text-[#9a8f7d]">{item.how}</p>
                            <p className="sr-only">{room.desc}</p>
                          </div>
                          <a
                            href={href}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label={`${room.cta}: ${room.name}`}
                            className="group mt-3 inline-flex min-h-11 items-center gap-2 self-start border-b border-[#d3ad62] pb-1 text-base text-[#f1e9da] transition-colors hover:text-[#d3ad62] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#d3ad62]"
                          >
                            <span aria-hidden="true">{room.cta}</span>
                            <ArrowUpRight size={16} weight="bold" aria-hidden="true" className="shrink-0 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                          </a>
                        </div>
                      </li>
                    );
                  })}
                </ul>
                <p className="mt-12 text-sm font-semibold text-[#f2c48a]">{item.roomsNote}</p>
                <p className="mt-2 text-xs leading-relaxed text-[#8f8574]">{item.boundary}</p>
              </article>
            </li>
            {/* Its own list item, so the ROOMVERSE card keeps exactly the covers, headings and articles it had. */}
            {item.collection && (
              <li className={`flex ${wide.li}`}>
                <Collection data={item.collection} lang={lang} />
              </li>
            )}
            </Fragment>
            );
            return (
            <li key={item.href} className={`flex ${wide.li}`}>
              <article className={`flex w-full flex-col overflow-hidden rounded-[1.25rem] border-[2.5px] border-ink bg-bone ${wide.row}`}>
                <a
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`${item.title} — ${item.cta}`}
                  tabIndex="-1"
                  aria-hidden="true"
                  className={`block overflow-hidden bg-paper focus-visible:outline focus-visible:outline-4 focus-visible:-outline-offset-4 focus-visible:outline-ink ${wideImage[wide.row]}`}
                  style={{ aspectRatio: item.imageRatio }}
                >
                  <ShowcaseImage item={item} index={index} />
                </a>
                <div className="flex flex-1 flex-col p-5 md:p-6">
                  <p className="text-xs font-semibold text-moss">{item.tag}</p>
                  <h3 className="mt-3 text-[1.375rem] font-semibold leading-[1.2] tracking-[-0.02em] text-ink md:text-[1.5rem]">{item.title}</h3>
                  <p className="mt-3 text-base leading-relaxed text-ink">{item.hook}</p>
                  <p className="mt-3 text-base leading-relaxed text-ink">{item.teaches}</p>
                  <div className="mt-auto pt-6">
                    <a
                      href={item.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group inline-flex items-center gap-2 rounded-full bg-ink px-5 py-3 text-sm font-semibold text-bone transition-[filter] hover:brightness-125 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ink"
                    >
                      <span>{item.cta}</span>
                      <ArrowUpRight size={16} weight="bold" aria-hidden="true" className="shrink-0 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                    </a>
                    <p className="mt-4 border-t-2 border-dashed border-ink/25 pt-3 text-xs leading-relaxed text-moss">{item.boundary}</p>
                  </div>
                </div>
              </article>
            </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
