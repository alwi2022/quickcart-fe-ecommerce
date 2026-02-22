"use client";

import { useMemo, useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAppContext } from "@/context/AppContext";
import { assets } from "@/assets/assets";

/** Kartu item di wishlist */
function WishCard({ product, currency, onMoveToCart, onRemove }) {
  if (!product) return null;
  return (
    <div className="group rounded-2xl border border-zinc-200 bg-white p-3 md:p-4 shadow-sm hover:shadow transition">
      {/* Gambar */}
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl bg-zinc-50">
        <Image
          src={product.image?.[0]}
          alt={product.name}
          fill
          className="object-contain p-4 group-hover:scale-105 transition"
          sizes="(max-width:768px) 50vw, (max-width:1200px) 25vw, 240px"
          priority={false}
        />
        {/* Tombol hapus di pojok */}
        <button
          onClick={() => onRemove(product._id)}
          className="absolute top-2 right-2 rounded-full bg-white/90 px-2.5 py-1 text-xs shadow hover:bg-white"
          aria-label="Hapus dari wishlist"
        >
          Hapus
        </button>
      </div>

      {/* Info */}
      <div className="mt-3 space-y-1.5">
        <h3 className="line-clamp-2 text-sm font-semibold text-zinc-900">
          {product.name}
        </h3>
        {product.description && (
          <p className="text-xs text-zinc-500 line-clamp-2">{product.description}</p>
        )}

        {/* Harga + rating ringkas */}
        <div className="flex items-center justify-between pt-1">
          <div className="text-base font-semibold text-zinc-900">
            {currency}
            {product.offerPrice ?? product.price}
          </div>
          <div className="flex items-center gap-1 text-xs text-zinc-600">
            <Image src={assets.star_icon} alt="" width={14} height={14} />
            <span>{product.rating ?? 4.5}</span>
          </div>
        </div>

        {/* Aksi */}
        <div className="mt-3 flex gap-2">
          <Link
            href={`/product/${product._id}`}
            className="inline-flex flex-1 items-center justify-center rounded-lg border px-3 py-2 text-sm hover:bg-zinc-50"
          >
            Lihat
          </Link>
          <button
            onClick={() => onMoveToCart(product)}
            className="inline-flex flex-1 items-center justify-center rounded-lg bg-orange-600 px-3 py-2 text-sm font-medium text-white hover:bg-orange-700"
          >
            Pindahkan ke Cart
          </button>
        </div>
      </div>
    </div>
  );
}

export default function WishlistPage() {
  const ctx = useAppContext();
  const {
    products = [],
    currency = "$",
    addToCart,
    router,
    // opsional dari AppContext (kalau ada):
    wishlist,
    favorites,
    saved,
    removeFromWishlist,
    toggleWishlist,
    clearWishlist,
  } = ctx || {};

  /**
   * Ambil sumber data wishlist dari context (dukungan beberapa nama properti).
   * Kalau tidak ada di context, fallback ke localStorage (muat setelah mount agar aman dari hydration).
   */
  const [localWish, setLocalWish] = useState([]);
  useEffect(() => {
    // hanya jalankan jika context tidak punya wishlist
    if ((wishlist ?? favorites ?? saved) == null) {
      try {
        const raw = localStorage.getItem("wishlist");
        const arr = raw ? JSON.parse(raw) : [];
        setLocalWish(Array.isArray(arr) ? arr : []);
      } catch {
        setLocalWish([]);
      }
    }
  }, [wishlist, favorites, saved]);

  const wishIds = useMemo(() => {
    // wishlist bisa array of id (string) atau array of object product
    const source = wishlist ?? favorites ?? saved ?? localWish;
    if (!Array.isArray(source)) return [];
    return source.map((it) => (typeof it === "string" ? it : it?._id)).filter(Boolean);
  }, [wishlist, favorites, saved, localWish]);

  const wishItems = useMemo(() => {
    if (!products?.length || !wishIds.length) return [];
    const map = new Map(products.map((p) => [p._id, p]));
    return wishIds
      .map((id) => map.get(id))
      .filter(Boolean);
  }, [products, wishIds]);

  // Handler hapus item wishlist
  const handleRemove = (id) => {
    if (typeof removeFromWishlist === "function") {
      removeFromWishlist(id);
      return;
    }
    if (typeof toggleWishlist === "function") {
      toggleWishlist(id);
      return;
    }
    // fallback: localStorage
    setLocalWish((prev) => {
      const next = prev
        .map((it) => (typeof it === "string" ? it : it?._id))
        .filter((wid) => wid && wid !== id);
      try {
        localStorage.setItem("wishlist", JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  // Handler pindahkan ke cart
  const handleMoveToCart = (product) => {
    if (typeof addToCart === "function") {
      addToCart(product._id);
    }
    handleRemove(product._id);
  };

  // Hapus semua
  const handleClearAll = () => {
    if (typeof clearWishlist === "function") {
      clearWishlist();
      return;
    }
    // fallback local
    setLocalWish([]);
    try {
      localStorage.removeItem("wishlist");
    } catch {}
  };

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-[1320px] px-4 md:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="mb-6 flex items-end justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold">Wishlist</h1>
            <div className="w-16 h-0.5 bg-orange-600 rounded-full mt-1" />
            <p className="mt-1 text-sm text-zinc-600">
              Kamu punya{" "}
              <span className="font-medium text-zinc-900">{wishItems.length}</span>{" "}
              item di wishlist.
            </p>
          </div>

          {wishItems.length > 0 && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => router.push("/all-products")}
                className="rounded-lg border px-4 py-2 text-sm hover:bg-zinc-50"
              >
                Belanja Lagi
              </button>
              <button
                onClick={handleClearAll}
                className="rounded-lg bg-zinc-100 px-4 py-2 text-sm hover:bg-zinc-200"
              >
                Hapus Semua
              </button>
            </div>
          )}
        </div>

        {/* Konten */}
        {wishItems.length === 0 ? (
          <div className="rounded-2xl border border-zinc-200 bg-white p-10 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-orange-50">
              <Image src={assets.heart_icon} alt="" width={22} height={22} />
            </div>
            <h2 className="mt-4 text-lg font-semibold text-zinc-900">Wishlist-mu masih kosong</h2>
            <p className="mt-1 text-sm text-zinc-600">
              Simpan produk favorit agar mudah ditemukan lagi.
            </p>
            <div className="mt-5">
              <Link
                href="/all-products"
                className="inline-flex items-center justify-center rounded-lg bg-orange-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-orange-700"
              >
                Mulai Belanja
              </Link>
            </div>
          </div>
        ) : (
          <div
            className="
              grid
              grid-cols-2
              sm:grid-cols-2
              md:grid-cols-3
              lg:grid-cols-4
              xl:grid-cols-5
              gap-5 md:gap-6 lg:gap-7 xl:gap-8
            "
          >
            {wishItems.map((p) => (
              <WishCard
                key={p._id}
                product={p}
                currency={currency}
                onMoveToCart={handleMoveToCart}
                onRemove={handleRemove}
              />
            ))}
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
