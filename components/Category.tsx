// components/Category.jsx
"use client";

import { useRef, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { assets } from "@/assets/assets";

type CategoryItem = {
  id: string;
  name: string;
  icon: any;
  value?: string;
};

/** Data default (boleh di-override via props) */
const ELECTRO_CATEGORIES: CategoryItem[] = [
  { id: "headphone",  name: "Headphone",     icon: assets.bose_headphone_image },
  { id: "earbuds",    name: "Earbuds",       icon: assets.sony_airbuds_image },
  { id: "earphone",   name: "Earphone",      icon: assets.apple_earphone_image },
  { id: "smartphone", name: "Smartphone",    icon: assets.samsung_s23phone_image },
  { id: "laptop",     name: "Laptop",        icon: assets.asus_laptop_image },
  { id: "macbook",    name: "MacBook",       icon: assets.macbook_image },
  { id: "console",    name: "Game Console",  icon: assets.playstation_image },
  { id: "controller", name: "Controller",    icon: assets.md_controller_image },
  { id: "camera",     name: "Kamera",        icon: assets.cannon_camera_image },
  { id: "smartwatch", name: "Smartwatch",    icon: assets.venu_watch_image },
  { id: "speaker",    name: "Speaker",       icon: assets.jbl_soundbox_image },
  { id: "projector",  name: "Projector",     icon: assets.projector_image },
];

/** Item kategori: gunakan <Link> (aksesibilitas + SEO), img berukuran tetap (anti-CLS) */
type CatItemProps = {
  href: string;
  name: string;
  icon: any;
};

function CatItem({ href, name, icon }: CatItemProps) {
  return (
    <Link
      href={href}
      prefetch={false}
      className="group relative flex w-full h-full flex-col items-center justify-center gap-3 px-4 py-6 bg-white transition-colors hover:bg-zinc-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500/50"
      aria-label={`Buka kategori ${name}`}
    >
      <span className="relative inline-flex items-center justify-center">
        <span className="absolute inset-0 rounded-full bg-zinc-100 w-16 h-16" aria-hidden="true" />
        {/* width/height fixed => layout stabil, tidak perlu wrapper relative/fill */}
        <Image
          src={icon}
          alt={name}
          width={64}
          height={64}
          loading="lazy"
          className="relative object-contain p-2"
        />
      </span>
      <span className="text-sm text-zinc-800 text-center leading-snug group-hover:text-zinc-900">
        {name}
      </span>
    </Link>
  );
}

export default function Category({
  title = "Kategori",
  categories = ELECTRO_CATEGORIES,
}: {
  title?: string;
  categories?: CategoryItem[];
}) {
  const scrollRef = useRef<HTMLDivElement | null>(null);

  /** scrollBy di-memo agar tak bikin re-render */
  const doScroll = useCallback((delta: number) => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: delta, behavior: "smooth" });
  }, []);

  return (
    <section className="mt-10" aria-labelledby="category-heading">
      <div className="mb-4 flex items-center justify-between">
        <p id="category-heading" className="text-2xl font-medium text-left w-full">
          {title}
        </p>

        {/* Tombol panah hanya di mobile (desktop pakai grid statis) */}
        <div className="md:hidden flex gap-2">
          <button
            onClick={() => doScroll(-280)}
            className="h-9 w-9 rounded-full border border-zinc-300 text-zinc-700"
            aria-label="Gulir ke kiri"
          >
            ‹
          </button>
          <button
            onClick={() => doScroll(280)}
            className="h-9 w-9 rounded-full border border-zinc-300 text-zinc-700"
            aria-label="Gulir ke kanan"
          >
            ›
          </button>
        </div>
      </div>

      {/* Wrapper */}
      <div className="overflow-visible">
        {/* MOBILE: horizontal scroll-snap (ringan, aksesibel) */}
        <div
          ref={scrollRef}
          className="md:hidden flex gap-3 snap-x snap-mandatory overflow-x-auto no-scrollbar"
          role="list"
          aria-label="Daftar kategori (geser ke samping untuk melihat lebih banyak)"
        >
          {categories.map((c) => {
            const value = c.value ?? c.name;
            const href = `/all-products?category=${encodeURIComponent(value)}`;
            return (
              <div
                key={c.id}
                role="listitem"
                className="min-w-[140px] snap-start rounded-xl ring-1 ring-zinc-200 bg-white"
              >
                <CatItem href={href} name={c.name} icon={c.icon} />
              </div>
            );
          })}
        </div>

        {/* DESKTOP: grid (tanpa JS, anti-CLS) */}
        <div className="hidden md:block rounded-2xl border border-zinc-200 bg-white shadow-sm">
          <ul
            className="grid grid-cols-3 lg:grid-cols-6 auto-rows-[148px] overflow-hidden rounded-2xl"
            role="list"
            aria-label="Daftar kategori"
          >
            {categories.map((c, i) => {
              const value = c.value ?? c.name;
              const href = `/all-products?category=${encodeURIComponent(value)}`;
              return (
                <li
                  role="listitem"
                  key={c.id}
                  className={[
                    "border-zinc-200 border-t lg:border-t-0 border-l",
                    i === 0 ? "lg:border-l-0" : "",
                  ].join(" ").trim()}
                >
                  <CatItem href={href} name={c.name} icon={c.icon} />
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </section>
  );
}
