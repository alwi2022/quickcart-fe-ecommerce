// components/HeaderSlider.jsx
"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { assets } from "@/assets/assets";

/**
 * Best practices yang dipakai:
 * - Scroll-snap (minim JS, lebih hemat INP & CPU).
 * - Gambar dengan ukuran stabil (hindari CLS) + sizes + lazy.
 * - Autoplay hanya jika:
 *    - !prefers-reduced-motion
 *    - tab terlihat (visibilityState)
 *    - tidak sedang hover/focus
 * - Tombol indikator <button> dengan aria yang benar.
 * - Tidak memakai console.log di production.
 */

const SLIDES = [
  {
    id: 1,
    title: "Suara Jernih Sepanjang Hari",
    offer: "Diskon terbatas 30%",
    ctaPrimary: "Beli Sekarang",
    ctaSecondary: "Lihat Detail",
    img: assets.header_headphone_image,
    alt: "Headphone nirkabel warna hitam",
  },
  {
    id: 2,
    title: "Mulai Petualangan Gaming-mu",
    offer: "Stok terbatas – buruan!",
    ctaPrimary: "Belanja PS5",
    ctaSecondary: "Cek Promo",
    img: assets.header_playstation_image,
    alt: "Konsol PlayStation 5 dengan kontroler",
  },
  {
    id: 3,
    title: "Kuat dan Elegan untuk Produktivitas",
    offer: "Deal eksklusif 40%",
    ctaPrimary: "Pesan Sekarang",
    ctaSecondary: "Pelajari",
    img: assets.header_macbook_image,
    alt: "Laptop MacBook terbuka di meja",
  },
];

export default function HeaderSlider({
  intervalMs = 4000, // autoplay interval
  enableAutoplay = true,
}) {
  const trackRef = useRef(null);
  const [hovering, setHovering] = useState(false);
  const [focused, setFocused] = useState(false);
  const [index, setIndex] = useState(0);

  // Hanya autoplay jika user tidak memilih reduce motion
  const prefersNoMotion = useMemo(
    () => typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches,
    []
  );

  // Update index saat scroll (sinkron dengan posisi snap)
  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;

    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const slideWidth = el.clientWidth;
        const current = Math.round(el.scrollLeft / slideWidth);
        setIndex(current);
        ticking = false;
      });
    };

    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  // Autoplay ringan: hanya jalan saat tab terlihat & tidak hover/fokus & tidak reduce motion
  useEffect(() => {
    if (!enableAutoplay || prefersNoMotion) return;
    const el = trackRef.current;
    if (!el) return;

    let id;
    const play = () => {
      const visible = document.visibilityState === "visible";
      if (!visible || hovering || focused) return;
      const slideWidth = el.clientWidth;
      const next = (index + 1) % SLIDES.length;
      el.scrollTo({ left: next * slideWidth, behavior: "smooth" });
    };

    id = setInterval(play, intervalMs);
    const onVisibility = () => {
      // reset timer saat tab balik
      clearInterval(id);
      id = setInterval(play, intervalMs);
    };
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      clearInterval(id);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [index, hovering, focused, enableAutoplay, prefersNoMotion, intervalMs]);

  const goTo = (i) => {
    const el = trackRef.current;
    if (!el) return;
    const slideWidth = el.clientWidth;
    el.scrollTo({ left: i * slideWidth, behavior: "smooth" });
  };

  return (
    <section
      className="w-full"
      aria-roledescription="carousel"
      aria-label="Promo unggulan"
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
    >
      <div
        ref={trackRef}
        className="relative mt-6 overflow-x-auto scroll-smooth snap-x snap-mandatory no-scrollbar"
        role="group"
        aria-live="off"
      >
        <div className="flex w-full">
          {SLIDES.map((s, i) => (
            <article
              key={s.id}
              className="min-w-full snap-start"
              aria-roledescription="slide"
              aria-label={`${i + 1} dari ${SLIDES.length}`}
            >
              <div className="flex flex-col-reverse md:flex-row items-center justify-between bg-[#E6E9F2] rounded-xl px-5 md:px-14 py-8">
                <div className="md:pl-8 mt-10 md:mt-0 max-w-xl">
                  <p className="md:text-base text-orange-600 pb-1">{s.offer}</p>
                  <h2 className="max-w-lg md:text-[40px] md:leading-[48px] text-2xl font-semibold">
                    {s.title}
                  </h2>
                  <div className="flex items-center mt-4 md:mt-6 gap-3">
                    <button
                      type="button"
                      className="md:px-10 px-7 md:py-2.5 py-2 bg-orange-600 rounded-full text-white font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500/40"
                    >
                      {s.ctaPrimary}
                    </button>
                    <button
                      type="button"
                      className="group inline-flex items-center gap-2 px-6 py-2.5 font-medium text-zinc-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500/40"
                    >
                      {s.ctaSecondary}
                      <svg
                        viewBox="0 0 24 24"
                        width="18"
                        height="18"
                        className="transition-transform group-hover:translate-x-1"
                        aria-hidden="true"
                      >
                        <path d="M5 12h14M13 5l7 7-7 7" stroke="currentColor" strokeWidth="1.5" fill="none" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Gambar (stabil, anti-CLS) */}
                <div className="relative flex-1 flex justify-center items-center w-full max-w-[22rem] md:max-w-[28rem]">
                  {/* Gunakan container dengan ratio agar layout stabil */}
                  <div className="relative w-full aspect-[4/3]">
                    <Image
                      src={s.img}
                      alt={s.alt}
                      fill
                      sizes="(max-width: 768px) 80vw, (max-width: 1200px) 40vw, 560px"
                      priority={i === 0}
                      loading={i === 0 ? "eager" : "lazy"}
                      className="object-contain"
                    />
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>

      {/* Indikator */}
      <div className="flex items-center justify-center gap-2 mt-6" role="tablist" aria-label="Pilih slide">
        {SLIDES.map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => goTo(i)}
            role="tab"
            aria-selected={index === i}
            aria-label={`Ke slide ${i + 1}`}
            className={`h-2.5 w-2.5 rounded-full transition ${index === i ? "bg-orange-600" : "bg-black/20 hover:bg-black/30"
              }`}
          />
        ))}
      </div>
    </section>
  );
}
