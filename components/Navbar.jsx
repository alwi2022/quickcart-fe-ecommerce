"use client";
import React, { useMemo, useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { assets } from "@/assets/assets";
import { useAppContext } from "@/context/AppContext";
import { useRouter, useSearchParams } from "next/navigation";
import LogoutButton from "./LogoutButton";

/** Ikon cart sederhana */
function CartSvg(props) {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" {...props}>
      <path d="M6 6h14l-1.5 9H7.5L6 6Zm0 0L5 3H2" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="9" cy="20" r="1.5" fill="currentColor" />
      <circle cx="17" cy="20" r="1.5" fill="currentColor" />
    </svg>
  );
}

/** Icon button + badge jumlah */
function IconWithBadge({ href, ariaLabel, count = 0, children }) {
  return (
    <Link href={href} aria-label={ariaLabel} className="relative inline-flex items-center justify-center rounded-full p-2 hover:bg-zinc-100 transition">
      {children}
      {count > 0 && (
        <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-[5px] rounded-full bg-orange-600 text-[11px] leading-[18px] text-white text-center">
          {count > 99 ? "99+" : count}
        </span>
      )}
    </Link>
  );
}

/** Search box (punyamu, tanpa perubahan besar) */
function SearchBox() {
  const { products = [] } = useAppContext();
  const router = useRouter();
  const params = useSearchParams();
  const initialQ = params.get("q") ?? "";
  const [q, setQ] = useState(initialQ);
  const [open, setOpen] = useState(false);
  const [hi, setHi] = useState(-1);
  const wrapRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    const onDoc = (e) => {
      if (!wrapRef.current) return;
      if (!wrapRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("click", onDoc);
    return () => document.removeEventListener("click", onDoc);
  }, []);

  const items = useMemo(() => {
    const qq = q.trim().toLowerCase();
    if (!qq) return [];
    const scored = products.map((p) => {
      const name = (p.name ?? "").toLowerCase();
      const brand = (p.brand ?? "").toLowerCase();
      const cat = (p.category ?? "").toLowerCase();
      let score = 0;
      if (name.includes(qq)) score += 3;
      if (brand.includes(qq)) score += 2;
      if (cat.includes(qq)) score += 1;
      return { p, score };
    }).filter(x => x.score > 0)
      .sort((a, b) => b.score - a.score || (a.p.name ?? "").localeCompare(b.p.name ?? ""));
    return scored.slice(0, 6).map(x => x.p);
  }, [q, products]);

  const goAll = (term) => {
    const query = term ?? q;
    if (!query?.trim()) return;
    router.push(`/all-products?q=${encodeURIComponent(query.trim())}`);
    setOpen(false);
    setHi(-1);
  };

  const onKeyDown = (e) => {
    if (!open && (e.key === "ArrowDown" || e.key === "ArrowUp")) {
      setOpen(true);
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHi((i) => Math.min(i + 1, items.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHi((i) => Math.max(i - 1, -1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (hi >= 0 && items[hi]) {
        // NOTE: idealnya pakai slug, tapi sementara p._id
        router.push(`/product/${items[hi]._id}`);
      } else {
        goAll(q);
      }
      setOpen(false);
    } else if (e.key === "Escape") {
      setOpen(false);
      setHi(-1);
      inputRef.current?.blur();
    }
  };

  return (
    <div ref={wrapRef} className="relative w-full max-w-[520px]">
      <div className="flex items-center gap-2 rounded-full border border-zinc-300 bg-white pl-3 pr-3.5 py-2 focus-within:ring-2 focus-within:ring-orange-500/30">
        <Image src={assets.search_icon} alt="search" width={16} height={16} className="opacity-70" />
        <input
          ref={inputRef}
          value={q}
          onChange={(e) => { setQ(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
          placeholder="Cari produk, brand, atau kategori…"
          className="w-full bg-transparent outline-none text-sm"
        />
        {q && (
          <button onClick={() => { setQ(""); setHi(-1); inputRef.current?.focus(); }} className="text-xs text-zinc-500 hover:text-zinc-700 px-1 rounded">
            clear
          </button>
        )}
        <button onClick={() => goAll(q)} className="ml-1 rounded-full bg-orange-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-orange-700">
          Cari
        </button>
      </div>

      {open && items.length > 0 && (
        <div className="absolute z-20 mt-2 w-full overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-lg">
          <ul className="max-h-80 overflow-auto py-1">
            {items.map((p, idx) => (
              <li key={p._id}>
                <button
                  className={`flex w-full items-center gap-3 px-3 py-2.5 text-left text-sm hover:bg-zinc-50 ${hi === idx ? "bg-zinc-50" : ""}`}
                  onMouseEnter={() => setHi(idx)}
                  onMouseLeave={() => setHi(-1)}
                  onClick={() => router.push(`/product/${p._id}`)}
                >
                  <div className="relative h-9 w-9 overflow-hidden rounded bg-zinc-50 ring-1 ring-zinc-200">
                    {p.image?.[0] && (
                      <Image src={p.image[0]} alt={p.name} fill className="object-contain p-1" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="truncate font-medium text-zinc-900">{p.name}</div>
                    <div className="text-xs text-zinc-500 truncate">
                      {(p.brand || "Generic")} • {(p.category || "Lainnya")}
                    </div>
                  </div>
                </button>
              </li>
            ))}
            <li className="border-t border-zinc-100">
              <button
                className="w-full px-3 py-2.5 text-left text-sm text-orange-600 hover:bg-orange-50"
                onClick={() => goAll(q)}
              >
                Lihat semua hasil untuk “{q}”
              </button>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
}

/** util kecil untuk avatar huruf */
function initials(name = "") {
  const parts = name.trim().split(/\s+/).slice(0, 2);
  return parts.map(p => p[0]?.toUpperCase() || "").join("");
}

const Navbar = () => {
  const ctx = useAppContext();
  const router = useRouter();

  // ====== AUTH STATE (cek via /api/me) ======
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        // cache: 'no-store' supaya tidak ketahan cache bawaan
        const res = await fetch("/api/me", { method: "GET", cache: "no-store", credentials: 'include', });
        if (res.ok) {
          const data = await res.json();
          if (mounted) setUser(data.user || null);
        } else {
          if (mounted) setUser(null);
        }
      } catch {
        if (mounted) setUser(null);
      } finally {
        if (mounted) setAuthLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);



  const isSeller = useMemo(() => {
    const roles = user?.roles || ctx?.roles || [];
    return roles.includes("seller")
  }, [user?.roles, ctx?.roles]);

  const isAdmin = useMemo(() => {
    const roles = user?.roles || ctx?.roles || [];
    return roles.includes("admin")
  }, [user?.roles, ctx?.roles]);

  const cartCount = useMemo(() => ctx?.cart?.length ?? ctx?.cartItems?.length ?? ctx?.basket?.length ?? 0, [ctx?.cart, ctx?.cartItems, ctx?.basket]);
  const wishCount = useMemo(() => ctx?.wishlist?.length ?? ctx?.favorites?.length ?? ctx?.saved?.length ?? 0, [ctx?.wishlist, ctx?.favorites, ctx?.saved]);

  // Mobile search toggle
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  // di atas return, tambahkan state & refs
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    function onDocClick(e) {
      if (!menuRef.current) return;
      if (!menuRef.current.contains(e.target)) setMenuOpen(false);
    }
    function onEsc(e) {
      if (e.key === 'Escape') setMenuOpen(false);
    }
    document.addEventListener('click', onDocClick);
    document.addEventListener('keydown', onEsc);
    return () => {
      document.removeEventListener('click', onDocClick);
      document.removeEventListener('keydown', onEsc);
    };
  }, []);


  return (
    <nav className="relative z-[60] flex items-center justify-between px-6 md:px-16 lg:px-32 py-3 border-b border-gray-300 text-gray-700 gap-3">

      <Image
        className="cursor-pointer w-28 md:w-32"
        onClick={() => router.push("/")}
        src={assets.logo}
        alt="logo"
        priority
      />

      {/* Search (desktop) */}
      <div className="hidden md:block flex-1 px-6">
        <SearchBox />
      </div>

      {/* Links kanan (desktop) */}
      <div className="hidden md:flex items-center gap-2 lg:gap-3">
        <IconWithBadge href="/wishlist" ariaLabel="Wishlist" count={wishCount}>
          <Image src={assets.heart_icon} alt="Wishlist" width={16} height={16} />
        </IconWithBadge>
        <IconWithBadge href="/cart" ariaLabel="Cart" count={cartCount}>
          <CartSvg className="text-zinc-800" />
        </IconWithBadge>

        {/* === KONDISI LOGIN === */}
        {authLoading ? (
          <div className="h-8 w-8 rounded-full bg-zinc-200 animate-pulse" aria-label="Memuat..." />
        ) : user ? (
          <div ref={menuRef} className="relative">
            <button
              type="button"
              onClick={() => setMenuOpen(v => !v)}
              aria-haspopup="menu"
              aria-expanded={menuOpen}
              className="inline-flex items-center gap-2 rounded-full border px-3 py-1.5 hover:bg-zinc-50"
            >
              <div className="h-7 w-7 rounded-full bg-orange-600 text-white flex items-center justify-center text-xs font-semibold">
                {initials(user.name || user.email)}
              </div>
              <span className="text-sm max-w-[140px] truncate">{user.name || user.email}</span>
            </button>

            {menuOpen && (
              <div
                role="menu"
                className="absolute right-0 top-full mt-2 w-44 rounded-xl border border-zinc-200 bg-white shadow-lg z-[100] pointer-events-auto"
              >
                <ul className="py-1 text-sm">
                  <li>
                    <Link href="/profile" className="block px-3 py-2 hover:bg-zinc-50" onClick={() => setMenuOpen(false)}>
                      Profil
                    </Link>
                  </li>
                  <li>
                    <Link href="/my-orders" className="block px-3 py-2 hover:bg-zinc-50" onClick={() => setMenuOpen(false)}>
                      Pesanan Saya
                    </Link>
                  </li>
                  {isSeller && (
                    <li>
                      <Link href="/seller" className="block px-3 py-2 hover:bg-zinc-50" onClick={() => setMenuOpen(false)}>
                        Seller Dashboard
                      </Link>
                    </li>
                  )}
                  {isAdmin && (
                    <li>
                      <Link href="/admin" className="block px-3 py-2 hover:bg-zinc-50" onClick={() => setMenuOpen(false)}>
                        Admin Dashboard
                      </Link>
                    </li>
                  )}
                  <li className="border-t border-zinc-100">
                   <LogoutButton className= 'w-full text-left px-3 py-2 hover:bg-zinc-50' />
                  </li>
                </ul>
              </div>
            )}
          </div>

        ) : (
          <>
            <Link href="/login" className="flex items-center gap-2 hover:text-gray-900 transition">
              <Image src={assets.user_icon} alt="user icon" />
              Masuk
            </Link>
            <Link href="/register" className="text-xs border px-4 py-1.5 rounded-full hover:bg-zinc-50 transition">
              Daftar
            </Link>
          </>
        )}

        {isSeller && !authLoading && !user && (
          <button onClick={() => router.push("/seller")} className="text-xs border px-4 py-1.5 rounded-full hover:bg-zinc-50 transition">
            Seller Dashboard
          </button>
        )}
      </div>

      {/* Mobile actions */}
      <div className="md:hidden flex items-center gap-1">
        <button
          className="rounded-full p-2 hover:bg-zinc-100 transition"
          aria-label="Search"
          onClick={() => setShowMobileSearch((s) => !s)}
        >
          <Image className="w-4 h-4" src={assets.search_icon} alt="search icon" />
        </button>
        <IconWithBadge href="/wishlist" ariaLabel="Wishlist" count={wishCount}>
          <Image src={assets.heart_icon} alt="Wishlist" width={20} height={20} />
        </IconWithBadge>
        <IconWithBadge href="/cart" ariaLabel="Cart" count={cartCount}>
          <CartSvg className="text-zinc-800" />
        </IconWithBadge>

        {/* === KONDISI LOGIN (mobile) === */}
        {authLoading ? (
          <div className="h-8 w-8 rounded-full bg-zinc-200 animate-pulse" />
        ) : user ? (
          <button
            onClick={() => router.push("/profile")}
            className="inline-flex items-center gap-2 rounded-full border px-3 py-1.5"
          >
            <div className="h-6 w-6 rounded-full bg-orange-600 text-white flex items-center justify-center text-[10px] font-semibold">
              {initials(user.name || user.email)}
            </div>
            <span className="text-xs">Akun</span>
          </button>
        ) : (
          <Link href="/login" className="flex items-center gap-2 hover:text-gray-900 transition">
            <Image src={assets.user_icon} alt="user icon" />
            Account
          </Link>
        )}
      </div>

      {/* Mobile search bar dropdown */}
      {showMobileSearch && (
        <div className="absolute left-0 right-0 top-full md:hidden border-t border-zinc-200 bg-white px-4 py-3">
          <SearchBox />
        </div>
      )}
    </nav>
  );
};

export default Navbar;
