// app/products/page.jsx
"use client";

import {
  useMemo,
  useState,
  useEffect,
  useDeferredValue,
  useCallback,
  useRef,
  memo,
  type Dispatch,
  type SetStateAction,
} from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import Image from "next/image";
import { assets } from "@/assets/assets";
import { useAppContext } from "@/context/AppContext";
import { useSearchParams } from "next/navigation";

const PAGE_SIZE = 20; // batch 20 item

type FilterPanelProps = {
  categories: string[];
  categoryCounts: Map<string, number>;
  brands: string[];
  priceBounds: { min: number; max: number };
  minDraft: string;
  setMinDraft: Dispatch<SetStateAction<string>>;
  maxDraft: string;
  setMaxDraft: Dispatch<SetStateAction<string>>;
  setMinPrice: Dispatch<SetStateAction<number>>;
  setMaxPrice: Dispatch<SetStateAction<number>>;
  selectedCats: Set<string>;
  setSelectedCats: Dispatch<SetStateAction<Set<string>>>;
  selectedBrands: Set<string>;
  setSelectedBrands: Dispatch<SetStateAction<Set<string>>>;
  minRating: number;
  setMinRating: Dispatch<SetStateAction<number>>;
  resetAll: () => void;
  isMobile?: boolean;
  onClose?: () => void;
};

export default function AllProducts() {
  const { products = [] } = useAppContext();
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get("category");
  const brandParam = searchParams.get("brand");

  const items = useMemo(
    () =>
      (Array.isArray(products) ? products : []).map((p) => ({
        ...p,
        _id: p._id ?? p.id ?? String(Math.random()),
        _price: Number(p.offerPrice ?? p.price ?? 0),
        _brand: p.brand ?? "Generic",
        _cat: p.category ?? "Lainnya",
        _rating: Number(p.rating ?? 4.5),
      })),
    [products]
  );

  const categories = useMemo(
    () => Array.from(new Set(items.map((p) => p._cat))).sort(),
    [items]
  );
  const categoryCounts = useMemo(() => {
    const m = new Map();
    for (const p of items) m.set(p._cat, (m.get(p._cat) ?? 0) + 1);
    return m;
  }, [items]);
  const brands = useMemo(
    () => Array.from(new Set(items.map((p) => p._brand))).sort(),
    [items]
  );
  const priceBounds = useMemo(() => {
    const nums = items.map((p) => p._price).filter((n) => Number.isFinite(n));
    const min = nums.length ? Math.min(...nums) : 0;
    const max = nums.length ? Math.max(...nums) : 0;
    return { min, max };
  }, [items]);

  /* ---------- State Filter ---------- */
  const [panelMobileOpen, setPanelMobileOpen] = useState(false);
  const [selectedCats, setSelectedCats] = useState<Set<string>>(new Set());
  const [selectedBrands, setSelectedBrands] = useState<Set<string>>(new Set());
  const [minPrice, setMinPrice] = useState(priceBounds.min);
  const [maxPrice, setMaxPrice] = useState(priceBounds.max);
  const [minRating, setMinRating] = useState(0);

  // Draft harga simpan sebagai STRING supaya input boleh kosong
  const [minDraft, setMinDraft] = useState(String(priceBounds.min));
  const [maxDraft, setMaxDraft] = useState(String(priceBounds.max));

  useEffect(() => {
    setMinPrice(priceBounds.min);
    setMaxPrice(priceBounds.max);
    setMinDraft(String(priceBounds.min));
    setMaxDraft(String(priceBounds.max));
  }, [priceBounds.min, priceBounds.max]);

  /* ---------- Inisialisasi dari Query ---------- */
  useEffect(() => {
    if (!categoryParam || categories.length === 0) return;
    const match =
      categories.find((c) => c.toLowerCase() === categoryParam.toLowerCase()) ??
      categoryParam;
    setSelectedCats(new Set([match]));
  }, [categoryParam, categories]);

  useEffect(() => {
    if (!brandParam) return;
    const list = brandParam
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    setSelectedBrands((prev) => {
      const same = prev.size === list.length && list.every((v) => prev.has(v));
      return same ? prev : new Set(list);
    });
  }, [brandParam]);

  /* ---------- Filtering (didefer untuk kurangi TBT) ---------- */
  const dCats = useDeferredValue(Array.from(selectedCats));
  const dBrands = useDeferredValue(Array.from(selectedBrands));
  const dMinPrice = useDeferredValue(minPrice);
  const dMaxPrice = useDeferredValue(maxPrice);
  const dMinRating = useDeferredValue(minRating);

  const filtered = useMemo(() => {
    return items.filter((p) => {
      if (dCats.length && !dCats.includes(p._cat)) return false;
      if (dBrands.length && !dBrands.includes(p._brand)) return false;
      if (Number.isFinite(dMinPrice) && p._price < dMinPrice) return false;
      if (Number.isFinite(dMaxPrice) && p._price > dMaxPrice) return false;
      if (dMinRating && p._rating < dMinRating) return false;
      return true;
    });
  }, [items, dCats, dBrands, dMinPrice, dMaxPrice, dMinRating]);

  /* ---------- Pagination / Infinite Scroll ---------- */
  const [visible, setVisible] = useState(PAGE_SIZE);
  const sentinelRef = useRef(null);

  // Reset ke halaman pertama saat filter berubah
  useEffect(() => {
    setVisible(PAGE_SIZE);
  }, [dCats, dBrands, dMinPrice, dMaxPrice, dMinRating]);

  // Jaga agar tidak melebihi jumlah hasil
  useEffect(() => {
    if (visible > filtered.length) setVisible(filtered.length || PAGE_SIZE);
  }, [filtered.length, visible]);

  // IntersectionObserver untuk load batch berikutnya
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    if (!("IntersectionObserver" in window)) return; // fallback: tombol manual

    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setVisible((v) => Math.min(v + PAGE_SIZE, filtered.length));
        }
      },
      { rootMargin: "400px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [filtered.length]);

  const visibleItems = filtered.slice(0, visible);

  /* ---------- Reset ---------- */
  const resetAll = useCallback(() => {
    setSelectedCats(new Set());
    setSelectedBrands(new Set());
    setMinPrice(priceBounds.min);
    setMaxPrice(priceBounds.max);
    setMinRating(0);
    setMinDraft(String(priceBounds.min));
    setMaxDraft(String(priceBounds.max));
  }, [priceBounds.min, priceBounds.max]);

  return (
    <>
      <Navbar />

      <main className="mx-auto max-w-[1320px] px-4 py-6 md:px-6 lg:px-8">
        {/* Header + tombol filter mobile */}
        <div className="flex items-end justify-between gap-3">
          <div className="ml-2">
            <h1 className="text-2xl font-semibold">Semua Produk</h1>
            <div className="h-0.5 w-16 rounded-full bg-orange-600" />
          </div>

          <button
            onClick={() => setPanelMobileOpen((s) => !s)}
            aria-expanded={panelMobileOpen}
            className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm md:hidden"
            type="button"
          >
            <Image
              src={assets.filter_icon || assets.menu_icon || assets.logo}
              alt=""
              width={16}
              height={16}
            />
            Filter
          </button>
        </div>

        {/* Grid 2 kolom: sidebar + konten */}
        <div className="mt-6 grid grid-cols-1 gap-8 md:grid-cols-[260px_minmax(0,1fr)] lg:grid-cols-[280px_minmax(0,1fr)]">
          {/* Sidebar (desktop) */}
          <aside className="hidden h-fit md:block">
            <MemoFilterPanel
              categories={categories}
              categoryCounts={categoryCounts}
              brands={brands}
              priceBounds={priceBounds}
              minDraft={minDraft}
              setMinDraft={setMinDraft}
              maxDraft={maxDraft}
              setMaxDraft={setMaxDraft}
              setMinPrice={setMinPrice}
              setMaxPrice={setMaxPrice}
              selectedCats={selectedCats}
              setSelectedCats={setSelectedCats}
              selectedBrands={selectedBrands}
              setSelectedBrands={setSelectedBrands}
              minRating={minRating}
              setMinRating={setMinRating}
              resetAll={resetAll}
            />
          </aside>

          {/* Panel filter (mobile) */}
          {panelMobileOpen && (
            <div className="rounded-xl border p-4 md:hidden">
              <MemoFilterPanel
                categories={categories}
                categoryCounts={categoryCounts}
                brands={brands}
                priceBounds={priceBounds}
                minDraft={minDraft}
                setMinDraft={setMinDraft}
                maxDraft={maxDraft}
                setMaxDraft={setMaxDraft}
                setMinPrice={setMinPrice}
                setMaxPrice={setMaxPrice}
                selectedCats={selectedCats}
                setSelectedCats={setSelectedCats}
                selectedBrands={selectedBrands}
                setSelectedBrands={setSelectedBrands}
                minRating={minRating}
                setMinRating={setMinRating}
                resetAll={resetAll}
                isMobile
                onClose={() => setPanelMobileOpen(false)}
              />
            </div>
          )}

          {/* Daftar produk */}
          <section>
            <div className="mb-3 text-sm text-zinc-600">
              Menampilkan{" "}
              <span className="font-medium text-zinc-900">{filtered.length}</span>{" "}
              dari {items.length} produk
            </div>

            {filtered.length === 0 ? (
              <div className="rounded-lg border p-8 text-center text-zinc-600">
                Tidak ada produk yang cocok.
                <button
                  onClick={resetAll}
                  className="ml-2 text-orange-600 underline underline-offset-2"
                  type="button"
                >
                  Atur ulang
                </button>
              </div>
            ) : (
              <>
                <div
                  id="products-grid"
                  className="
                    grid grid-cols-2 gap-5
                    sm:grid-cols-2
                    md:grid-cols-3 md:gap-6
                    lg:grid-cols-4 lg:gap-7
                    xl:grid-cols-4 xl:gap-8
                    2xl:grid-cols-5
                  "
                >
                  {visibleItems.map((p, i) => (
                    <ProductCard
                      key={p._id}
                      product={p}
                      // Opsional: bantu LCP dengan memprioritaskan gambar item pertama
                      isLcp={i === 0}
                    />
                  ))}
                </div>

                {/* sentinel untuk infinite scroll */}
                <div ref={sentinelRef} className="h-10 w-full" />

                {/* Tombol fallback (mis. browser lama / IO gagal) */}
                {visible < filtered.length && (
                  <div className="mt-6 flex justify-center">
                    <button
                      onClick={() =>
                        setVisible((v) => Math.min(v + PAGE_SIZE, filtered.length))
                      }
                      className="rounded-lg border px-4 py-2 text-sm"
                      type="button"
                    >
                      Muat lebih banyak
                    </button>
                  </div>
                )}
              </>
            )}
          </section>
        </div>
      </main>

      <Footer />
    </>
  );
}

/* ===================== Filter Panel ===================== */

function FilterPanel({
  categories,
  categoryCounts,
  brands,
  priceBounds,
  minDraft,
  setMinDraft,
  maxDraft,
  setMaxDraft,
  setMinPrice,
  setMaxPrice,
  selectedCats,
  setSelectedCats,
  selectedBrands,
  setSelectedBrands,
  minRating,
  setMinRating,
  resetAll,
  isMobile = false,
  onClose,
}: FilterPanelProps) {
  // toggle Set util
  const toggleSet = useCallback((setVal: Set<string>, v: string) => {
    const s = new Set(setVal);
    s.has(v) ? s.delete(v) : s.add(v);
    return s;
  }, []);

  // apply harga dengan validasi dan swap min/max
  const onApplyPrice = useCallback(() => {
    let min = Number(minDraft);
    let max = Number(maxDraft);
    if (!Number.isFinite(min)) min = priceBounds.min;
    if (!Number.isFinite(max)) max = priceBounds.max;
    if (min > max) [min, max] = [max, min];

    setMinPrice(min);
    setMaxPrice(max);
    if (isMobile && onClose) onClose();
  }, [minDraft, maxDraft, priceBounds.min, priceBounds.max, setMinPrice, setMaxPrice, isMobile, onClose]);

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm md:p-5">
      {/* Header + Reset */}
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold">Filter</h2>
        <button onClick={resetAll} className="text-sm text-orange-600 hover:underline" type="button">
          Atur ulang
        </button>
      </div>

      {/* Batas Harga */}
      <div className="mt-5">
        <h3 className="text-sm font-semibold text-zinc-900">Batas Harga</h3>
        <div className="mt-2 grid grid-cols-2 items-center gap-3">
          <input
            type="number"
            inputMode="numeric"
            className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm placeholder:text-zinc-400"
            placeholder="Rp MIN"
            value={""}
            onChange={(e) => setMinDraft(e.target.value)}
          />
          <input
            type="number"
            inputMode="numeric"
            className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm placeholder:text-zinc-400"
            placeholder="Rp MAKS"
            value={""}
            onChange={(e) => setMaxDraft(e.target.value)}
          />
        </div>
        <button
          onClick={onApplyPrice}
          className="mt-3 w-full rounded-lg bg-orange-600 py-2.5 text-sm font-medium text-white"
          type="button"
        >
          TERAPKAN
        </button>
      </div>

      <div className="my-5 h-px bg-zinc-200" />

      {/* Rating: SATU baris bintang (klik untuk set ≥ rating itu, klik lagi untuk reset) */}
      <div>
        <h3 className="text-sm font-semibold text-zinc-900">Rating</h3>
        <div className="mt-3 flex items-center gap-2">
          <RatingPicker
            value={minRating}
            onChange={(val) => setMinRating((prev) => (prev === val ? 0 : val))}
          />
          <span className="text-sm text-zinc-700">
            {minRating ? `≥ ${minRating} bintang` : "Semua rating"}
          </span>
        </div>
      </div>

      <div className="my-5 h-px bg-zinc-200" />

      {/* Berdasarkan Kategori */}
      <div>
        <h3 className="text-sm font-semibold text-zinc-900">Berdasarkan Kategori</h3>
        <ul className="mt-3 max-h-60 space-y-2 overflow-auto pr-1 text-sm">
          {categories.map((c) => (
            <li key={c} className="flex items-start gap-2">
              <input
                id={`cat-${c}`}
                type="checkbox"
                className="mt-1 h-4 w-4 rounded border-2 border-zinc-400 text-orange-600 focus:ring-orange-500"
                checked={selectedCats.has(c)}
                onChange={() => setSelectedCats((s) => toggleSet(s, c))}
              />
              <label htmlFor={`cat-${c}`} className="cursor-pointer text-zinc-800">
                {c} <span className="text-zinc-500">({categoryCounts.get(c) ?? 0})</span>
              </label>
            </li>
          ))}
        </ul>
      </div>

      <div className="my-5 h-px bg-zinc-200" />

      {/* Merek */}
      <div>
        <h3 className="text-sm font-semibold text-zinc-900">Merek</h3>
        <ul className="mt-3 max-h-60 space-y-2 overflow-auto pr-1 text-sm">
          {brands.map((b) => (
            <li key={b} className="flex items-start gap-2">
              <input
                id={`brand-${b}`}
                type="checkbox"
                className="mt-1 h-4 w-4 rounded border-2 border-zinc-400 text-orange-600 focus:ring-orange-500"
                checked={selectedBrands.has(b)}
                onChange={() => setSelectedBrands((s) => toggleSet(s, b))}
              />
              <label htmlFor={`brand-${b}`} className="cursor-pointer text-zinc-800">
                {b}
              </label>
            </li>
          ))}
        </ul>
      </div>

      {/* Tombol bawah khusus panel mobile */}
      {isMobile && (
        <div className="mt-3 flex justify-end gap-2">
          <button onClick={onClose} className="rounded-lg border px-4 py-2 text-sm" type="button">
            Tutup
          </button>
          <button
            onClick={onApplyPrice}
            className="rounded-lg bg-orange-600 px-4 py-2 text-sm text-white"
            type="button"
          >
            Terapkan
          </button>
        </div>
      )}
    </div>
  );
}

const MemoFilterPanel = memo(FilterPanel);

/* ======= Komponen RatingPicker (1 baris bintang interaktif) ======= */
function RatingPicker({ value = 0, onChange }) {
  return (
    <div className="inline-flex items-center" role="radiogroup" aria-label="Filter rating minimal">
      {Array.from({ length: 5 }).map((_, i) => {
        const starVal = i + 1;
        const active = starVal <= value;
        return (
          <button
            key={starVal}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange?.(starVal)}
            className="mr-1"
            aria-label={`${starVal} bintang atau lebih`}
            title={`${starVal} bintang atau lebih`}
          >
            <Image
              src={active ? assets.star_icon : assets.star_dull_icon}
              alt=""
              width={16}
              height={16}
              loading="lazy"
              sizes="16px"
            />
          </button>
        );
      })}
    </div>
  );
}
