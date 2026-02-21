// app/order/[id]/page.jsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Loading from "@/components/Loading";
import { useAppContext } from "@/context/AppContext";
import { assets, orderDummyData } from "@/assets/assets";

function formatTanggal(iso) {
  try {
    return new Intl.DateTimeFormat("id-ID", {
      year: "numeric", month: "long", day: "numeric",
      hour: "2-digit", minute: "2-digit"
    }).format(new Date(iso));
  } catch { return "-"; }
}

export default function OrderDetailPage() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const { currency = "Rp" } = useAppContext();

  // Fetch (dummy untuk sekarang)
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const data = Array.isArray(orderDummyData) ? orderDummyData : [];
        const found =
          data.find((o) => String(o?.id) === String(id)) ??
          // fallback: jika sebelumnya pakai index sebagai idKey
          data[Number(id)];
        if (alive) setOrder(found || null);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [id]);

  const items = useMemo(() => order?.items ?? [], [order]);

  if (loading) return <Loading />;
  if (!order) {
    return (
      <>
        <Navbar />
        <main className="mx-auto max-w-[1200px] px-6 md:px-12 lg:px-16 py-10">
          <div className="rounded-xl border p-6 text-zinc-700">
            Pesanan tidak ditemukan.
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-[1200px] px-6 md:px-12 lg:px-16 py-8">
        {/* HEADER tanpa tombol-tombol */}
        <header className="mb-6">
          <h1 className="text-2xl md:text-3xl font-semibold text-zinc-900">
            Detail Pesanan #{order.id}
          </h1>
          <p className="mt-1 text-sm text-zinc-600">
            Status: <span className="font-medium text-zinc-900">{order.status ?? "Menunggu"}</span> •
            &nbsp;Tanggal: {formatTanggal(order.date)}
          </p>
        </header>

        {/* CONTENT */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Items */}
          <div className="lg:col-span-2 rounded-2xl border border-zinc-200 bg-white p-5 md:p-6">
            <h2 className="text-base font-semibold text-zinc-900">Ringkasan Barang</h2>
            <div className="mt-4 divide-y">
              {items.map((it, idx) => {
                const p = it.product || {};
                return (
                  <div key={idx} className="py-4 flex items-center gap-4">
                    <div className="h-16 w-16 rounded-lg bg-zinc-100 overflow-hidden shrink-0">
                      <Image
                        src={p.image?.[0] ?? assets.box_icon}
                        alt={p.name ?? "Produk"}
                        width={64} height={64}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-zinc-900">{p.name ?? "Produk"}</p>
                      <p className="text-sm text-zinc-600">
                        Qty: {it.quantity ?? 1} • Varian: {it.variant ?? "-"}
                      </p>
                    </div>
                    <div className="text-right font-medium">
                      {currency}{Number(it.price ?? 0).toLocaleString("id-ID")}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* total */}
            <div className="mt-4 border-t pt-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-zinc-600">Subtotal</span>
                <span className="font-medium">{currency}{Number(order.subtotal ?? order.amount ?? 0).toLocaleString("id-ID")}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-600">Ongkos Kirim</span>
                <span className="font-medium">{currency}{Number(order.shipping ?? 0).toLocaleString("id-ID")}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-600">Diskon</span>
                <span className="font-medium">-{currency}{Number(order.discount ?? 0).toLocaleString("id-ID")}</span>
              </div>
              <div className="flex justify-between text-base font-semibold pt-2 border-t">
                <span>Total</span>
                <span>{currency}{Number(order.amount ?? 0).toLocaleString("id-ID")}</span>
              </div>
            </div>
          </div>

          {/* Address & Payment */}
          <aside className="space-y-6">
            <div className="rounded-2xl border border-zinc-200 bg-white p-5 md:p-6">
              <h3 className="text-base font-semibold text-zinc-900">Alamat Pengiriman</h3>
              <div className="mt-3 text-sm text-zinc-700">
                <p className="font-medium">{order.address?.fullName ?? "-"}</p>
                <p>{order.address?.area ?? "-"}</p>
                <p>{[order.address?.city, order.address?.state].filter(Boolean).join(", ") || "-"}</p>
                <p>{order.address?.phoneNumber ?? "-"}</p>
              </div>
            </div>

            <div className="rounded-2xl border border-zinc-200 bg-white p-5 md:p-6">
              <h3 className="text-base font-semibold text-zinc-900">Pembayaran & Pengiriman</h3>
              <ul className="mt-3 space-y-2 text-sm text-zinc-700">
                <li>Metode Bayar: {order.paymentMethod ?? "COD"}</li>
                <li>Status Bayar: {order.paymentStatus ?? "Pending"}</li>
                <li>Kurir: {order.courier ?? "Standar"}</li>
                <li>No. Resi: {order.tracking ?? "-"}</li>
              </ul>
            </div>
          </aside>
        </section>
      </main>
      <Footer />
    </>
  );
}
