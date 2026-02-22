"use client";

import Image from "next/image";
import Link from "next/link";
import React from "react";
import { assets } from "@/assets/assets";

/* -------- inline icons (SVG) -------- */
const PinIcon = (p) => (
  <svg {...p} viewBox="0 0 24 24" fill="none" className={(p.className ?? "") + " shrink-0"}>
    <path d="M12 22s7-4.35 7-11a7 7 0 1 0-14 0c0 6.65 7 11 7 11Z" stroke="currentColor" strokeWidth="1.5" />
    <circle cx="12" cy="11" r="3" stroke="currentColor" strokeWidth="1.5" />
  </svg>
);
const PhoneIcon = (p) => (
  <svg {...p} viewBox="0 0 24 24" fill="none" className={(p.className ?? "") + " shrink-0"}>
    <path d="M6.5 3h2l1.5 4-2 1a12 12 0 0 0 7 7l1-2 4 1.5v2a2 2 0 0 1-2 2A15.5 15.5 0 0 1 3 6.5a2 2 0 0 1 2-2Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const ClockIcon = (p) => (
  <svg {...p} viewBox="0 0 24 24" fill="none" className={(p.className ?? "") + " shrink-0"}>
    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" />
    <path d="M12 7v5l3 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const MailIcon = (p) => (
  <svg {...p} viewBox="0 0 24 24" fill="none" className={(p.className ?? "") + " shrink-0"}>
    <path d="M4 6h16a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2Z" stroke="currentColor" strokeWidth="1.5" />
    <path d="m22 8-10 7L2 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

/* -------- small components -------- */
function InfoItem({ icon, title, desc }) {
  return (
    <div className="flex items-start gap-3">
      {icon}
      <div>
        <p className="text-sm font-semibold text-zinc-900">{title}</p>
        <p className="text-sm text-zinc-600">{desc}</p>
      </div>
    </div>
  );
}

const linkCls = "text-sm text-zinc-600 hover:text-zinc-900 transition-colors";

/* =================== FOOTER =================== */
export default function Footer() {
  return (
    <footer className="mt-14 border-t border-zinc-200 bg-white">
      {/* TOP INFO BAR */}
      <div className="px-6 md:px-16 lg:px-32">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 py-6">
          <InfoItem
            icon={<PinIcon className="h-6 w-6 text-zinc-700" />}
            title="Kunjungi Kami"
            desc="Serang, Banten – Indonesia"
          />
          <InfoItem
            icon={<PhoneIcon className="h-6 w-6 text-zinc-700" />}
            title="Telepon"
            desc="0895618216004"
          />
          <InfoItem
            icon={<ClockIcon className="h-6 w-6 text-zinc-700" />}
            title="Jam Operasional"
            desc="Sen–Sab: 08.00 – 17.00 WIB"
          />
          <InfoItem
            icon={<MailIcon className="h-6 w-6 text-zinc-700" />}
            title="Email"
            desc="imambahrialwi21@gmail.com"
          />
        </div>
      </div>

      <div className="border-t border-zinc-200" />

      {/* MAIN GRID */}
      <div className="px-6 md:px-16 lg:px-32 py-12">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
          {/* Brand column */}
          <div className="md:col-span-4">
            <Link href="/" aria-label="Homepage" className="inline-flex items-center gap-3">
              <Image src={assets.logo} alt="Logo" className="w-28 md:w-32" priority />
              <span className="sr-only">GalaTech</span>
            </Link>

            <p className="mt-4 max-w-md text-sm leading-6 text-zinc-600">
              Temukan koleksi elektronik pilihan di QuickCart—headphone, smartphone, laptop, konsol, dan aksesori.
              Produk bergaya, andal, dan ramah di kantong.
            </p>

            {/* socials */}
            <div className="mt-6 flex items-center gap-3">
              {[
                { alt: "YouTube", src: assets.instagram_icon },
                { alt: "Facebook", src: assets.facebook_icon },
                { alt: "LinkedIn", src: assets.twitter_icon },
              ].map((s, i) => (
                <Link
                  key={i}
                  href="#"
                  aria-label={s.alt}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-zinc-300 hover:border-zinc-400"
                >
                  <Image src={s.src} alt="" width={16} height={16} />
                </Link>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div className="md:col-span-3">
            <h4 className="text-base font-semibold text-zinc-900">Tautan Cepat</h4>
            <ul className="mt-4 space-y-3">
              <li><Link href="/" className={linkCls}>Tentang Kami</Link></li>
              <li><Link href="/contact" className={linkCls}>Hubungi Kami</Link></li>
              <li><Link href="/" className={linkCls}>Syarat & Ketentuan</Link></li>
              <li><Link href="/" className={linkCls}>Kebijakan Privasi</Link></li>
              <li><Link href="/help" className={linkCls}>Pusat Bantuan</Link></li>
            </ul>
          </div>

          {/* Categories */}
          <div className="md:col-span-3">
            <h4 className="text-base font-semibold text-zinc-900">Kategori Produk</h4>
            <ul className="mt-4 space-y-3">
              <li><Link href="/category/smartphone" className={linkCls}>Smartphones</Link></li>
              <li><Link href="/category/laptop" className={linkCls}>Laptops</Link></li>
              <li><Link href="/category/console" className={linkCls}>Game Console</Link></li>
              <li><Link href="/category/wearables" className={linkCls}>Smartwatch</Link></li>
              <li><Link href="/category/camera" className={linkCls}>Cameras</Link></li>
              <li><Link href="/category/accessories" className={linkCls}>Gadget Accessories</Link></li>
            </ul>
          </div>

          {/* Newsletter */}
          <div className="md:col-span-2">
            <h4 className="text-base font-semibold text-zinc-900">Newsletter</h4>
            <p className="mt-3 text-sm text-zinc-600">
            Berlangganan untuk mendapat update & penawaran eksklusif.
            </p>
            <form
              onSubmit={(e) => e.preventDefault()}
              className="mt-4 space-y-3"
            >
              <input
                type="email"
                placeholder="Enter your email"
                className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-2.5 text-sm outline-none placeholder:text-zinc-400 focus:border-zinc-400"
              />
              <button
                type="submit"
                className="w-full rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-black"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* COPYRIGHT */}
      <div className="border-t border-zinc-200">
        <div className="px-6 md:px-16 lg:px-32 py-4">
          <p className="text-center text-sm text-zinc-600">
            © {new Date().getFullYear()} <span className="font-semibold">GalaTech</span>. Hak cipta dilindungi.
          </p>
        </div>
      </div>
    </footer>
  );
}
