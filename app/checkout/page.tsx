// app/checkout/page.jsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Image from "next/image";

export default function CheckoutPage() {
  const router = useRouter();
  const [draft, setDraft] = useState(null);
  const [pay, setPay] = useState("cod"); // cod | bank | card

  // Ambil draft checkout dari sessionStorage
  useEffect(() => {
    const raw =
      typeof window !== "undefined"
        ? sessionStorage.getItem("checkoutDraft")
        : null;

    if (!raw) {
      router.replace("/cart");
      return;
    }
    try {
      const data = JSON.parse(raw);
      // validasi minimal agar tidak crash
      if (!data || !Array.isArray(data.items) || data.items.length === 0) {
        router.replace("/cart");
        return;
      }
      setDraft(data);
    } catch {
      router.replace("/cart");
    }
  }, [router]);

  if (!draft) return null;

  const placePayment = () => {
    // Catatan: di aplikasi nyata, panggil backend (Midtrans/Xendit/Stripe) untuk membuat order & pembayaran
    router.push(`/order/success?oid=${encodeURIComponent(draft.id)}`);
  };

  const addr = draft.address || {};
  const currency = draft.currency ?? "Rp";

  return (
    <>
      <Navbar />

      <main className="px-6 md:px-16 lg:px-32 py-10">
        <h1 className="text-2xl font-semibold">Checkout</h1>

        <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Kiri: detail */}
          <section className="lg:col-span-8 space-y-6">
            {/* Alamat */}
            <div className="rounded-xl border p-5 bg-white">
              <h2 className="font-semibold text-zinc-900">Alamat Pengiriman</h2>
              <p className="mt-2 text-sm text-zinc-700">
                {addr.fullName
                  ? `${addr.fullName}, ${addr.area}, ${addr.city}, ${addr.state}`
                  : "Alamat belum tersedia"}
              </p>
            </div>

            {/* Item pesanan */}
            <div className="rounded-xl border p-5 bg-white">
              <h2 className="font-semibold text-zinc-900">Item Pesanan</h2>
              <ul className="mt-3 divide-y">
                {draft.items.map((it) => (
                  <li
                    key={it.productId}
                    className="py-3 flex items-center gap-3"
                  >
                    <div className="relative h-14 w-14 rounded bg-zinc-50 ring-1 ring-zinc-200 overflow-hidden">
                      {it.image && (
                        <Image
                          src={it.image}
                          alt={it.name}
                          fill
                          className="object-contain p-1"
                          loading="lazy"
                          sizes="56px"
                        />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="font-medium text-zinc-900 truncate">
                        {it.name}
                      </div>
                      <div className="text-xs text-zinc-500">
                        {it.brand} • {it.category}
                      </div>
                    </div>
                    <div className="text-sm text-zinc-700">x{it.qty}</div>
                    <div className="text-sm font-medium">
                      {currency}
                      {Number(it.subtotal ?? 0).toFixed(2)}
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            {/* Metode pembayaran */}
            <div className="rounded-xl border p-5 bg-white">
              <h2 className="font-semibold text-zinc-900">Metode Pembayaran</h2>

              <fieldset className="mt-3 space-y-2">
                <legend className="sr-only">Pilih metode pembayaran</legend>

                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="pay"
                    value="cod"
                    checked={pay === "cod"}
                    onChange={() => setPay("cod")}
                  />
                  <span>Bayar di Tempat (COD)</span>
                </label>

                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="pay"
                    value="bank"
                    checked={pay === "bank"}
                    onChange={() => setPay("bank")}
                  />
                  <span>Transfer Bank / VA</span>
                </label>

                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="pay"
                    value="card"
                    checked={pay === "card"}
                    onChange={() => setPay("card")}
                  />
                  <span>Kartu Kredit/Debit</span>
                </label>
              </fieldset>
            </div>
          </section>

          {/* Kanan: ringkasan */}
          <aside className="lg:col-span-4 h-fit rounded-xl border p-5 bg-white">
            <h3 className="font-semibold">Ringkasan</h3>

            <div className="mt-3 space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>
                  {currency}
                  {Number(draft.subtotal ?? 0).toFixed(2)}
                </span>
              </div>

              <div className="flex justify-between">
                <span>Ongkir</span>
                <span>Gratis</span>
              </div>

              <div className="flex justify-between">
                <span>Pajak</span>
                <span>
                  {currency}
                  {Number(draft.tax ?? 0).toFixed(2)}
                </span>
              </div>

              <div className="flex justify-between border-t pt-3 font-semibold">
                <span>Total</span>
                <span>
                  {currency}
                  {Number(draft.total ?? 0).toFixed(2)}
                </span>
              </div>
            </div>

            <button
              onClick={placePayment}
              type="button"
              className="mt-5 w-full h-12 rounded bg-orange-600 text-white font-medium hover:bg-orange-700"
            >
              Bayar Sekarang
            </button>
          </aside>
        </div>
      </main>

      <Footer />
    </>
  );
}
