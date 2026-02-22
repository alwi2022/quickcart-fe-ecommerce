// app/my-orders/page.jsx
"use client";

import React, { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Loading from "@/components/Loading";
import { useRouter } from "next/navigation";
import { useAppContext } from "@/context/AppContext";
import { assets, orderDummyData } from "@/assets/assets";

/* ========= Util ========= */
function formatTanggal(iso) {
  try {
    return new Intl.DateTimeFormat("id-ID", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(new Date(iso));
  } catch {
    return "-";
  }
}
function formatRupiah(n, currency = "Rp") {
  const num = Number(n || 0);
  return `${currency}${num.toLocaleString("id-ID")}`;
}
const STATUS_MAP = {
  processed: { label: "Diproses", cls: "bg-amber-100 text-amber-800 ring-amber-200" },
  shipped: { label: "Dikirim", cls: "bg-sky-100 text-sky-800 ring-sky-200" },
  delivered: { label: "Selesai", cls: "bg-emerald-100 text-emerald-800 ring-emerald-200" },
  cancelled: { label: "Dibatalkan", cls: "bg-rose-100 text-rose-800 ring-rose-200" },
  pending: { label: "Menunggu", cls: "bg-zinc-100 text-zinc-700 ring-zinc-200" },
};
function StatusBadge({ value }) {
  const key = String(value || "processed").toLowerCase();
  const m = STATUS_MAP[key] || STATUS_MAP.processed;
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ring-1 ${m.cls}`}>
      {m.label}
    </span>
  );
}

/* ========= Page ========= */
export default function MyOrders() {
  const { currency = "Rp", router } = useAppContext();
  

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter & search
  const [statusFilter, setStatusFilter] = useState("semua");
  const [q, setQ] = useState("");



  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        // Real world: const data = await fetch("/api/orders").then(r => r.json())
        const data = Array.isArray(orderDummyData) ? orderDummyData : [];
        if (alive) setOrders(data);
      } catch {
        if (alive) setOrders([]);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const filtered = useMemo(() => {
    const list = Array.isArray(orders) ? orders : [];
    const term = q.trim().toLowerCase();
    return list.filter((o) => {
      const sOK = statusFilter === "semua" || String(o?.status).toLowerCase() === statusFilter;
      if (!term) return sOK;
      const hay =
        `${o?.id ?? ""} ${o?.address?.fullName ?? ""} ${o?.address?.city ?? ""} ${(o?.items ?? [])
          .map((it) => it?.product?.name ?? "")
          .join(" ")}`.toLowerCase();
      return sOK && hay.includes(term);
    });
  }, [orders, statusFilter, q]);

  const statuses = ["semua", "processed", "shipped", "delivered", "cancelled"];

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-[1200px] px-6 md:px-10 lg:px-12 py-8">
        {/* Header */}
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-zinc-900">Pesanan Saya</h1>
            <p className="text-sm text-zinc-600">Lihat riwayat & status pesanan kamu.</p>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            {/* Filter status */}
            <div className="flex items-center gap-1 rounded-lg border border-zinc-300 bg-white px-2 py-1">
              {statuses.map((s) => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={`rounded-md px-2.5 py-1 text-sm ${
                    statusFilter === s ? "bg-orange-600 text-white" : "text-zinc-700 hover:bg-zinc-100"
                  }`}
                >
                  {s === "semua"
                    ? "Semua"
                    : STATUS_MAP[s]?.label ?? s}
                </button>
              ))}
            </div>

            {/* Search */}
            <div className="flex items-center gap-2 rounded-lg border border-zinc-300 bg-white px-3 py-2">
              <Image src={assets.search_icon} alt="" width={14} height={14} />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                className="w-56 bg-transparent text-sm outline-none"
                placeholder="Cari ID / nama produk…"
              />
              {q && (
                <button onClick={() => setQ("")} className="text-xs text-zinc-500 hover:text-zinc-700">
                  bersihkan
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Daftar Pesanan */}
        <section className="mt-6">
          {loading ? (
            <Loading />
          ) : filtered.length === 0 ? (
            <div className="rounded-xl border border-zinc-200 bg-white p-8 text-center">
              <div className="mx-auto mb-3 h-12 w-12 rounded-full bg-orange-50 ring-1 ring-orange-100 grid place-items-center">
                <Image src={assets.box_icon} alt="" width={24} height={24} />
              </div>
              <p className="font-medium text-zinc-900">Belum ada pesanan</p>
              <p className="mt-1 text-sm text-zinc-600">Ayo mulai berbelanja dan temukan produk favoritmu.</p>
              <button
                onClick={() => router?.push?.("/all-products")}
                className="mt-4 rounded-lg bg-orange-600 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-700"
              >
                Belanja Sekarang
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {filtered.map((order, idx) => {
                const idKey = order?.id ?? idx;
                const items = Array.isArray(order?.items) ? order.items : [];
                const alamat = order?.address ?? {};
                const jumlahItem = items.length;
                const ringkasNama =
                  items
                    .slice(0, 2)
                    .map((it) => {
                      const nama = it?.product?.name ?? "Produk";
                      const qty = Number(it?.quantity ?? 0);
                      return `${nama} × ${qty}`;
                    })
                    .join(", ") + (jumlahItem > 2 ? `, +${jumlahItem - 2} lainnya` : "");

                const amount = Number(order?.amount ?? 0);
                const tanggal = order?.date ? formatTanggal(order.date) : "-";
                const status = order?.status ?? "processed";
                const payStatus = String(order?.paymentStatus ?? "pending").toLowerCase();
                const payLabel = payStatus === "paid" ? "Lunas" : payStatus === "failed" ? "Gagal" : "Menunggu";
                const tracking = order?.trackingNumber;

                return (
                  <div
                    key={idKey}
                    className="rounded-2xl border border-zinc-200 bg-white p-4 md:p-5 shadow-sm"
                  >
                    {/* Baris atas: ID, tanggal, status, total */}
                    <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                      <div className="flex flex-wrap items-center gap-3">
                        <span className="text-sm text-zinc-600">Order</span>
                        <span className="font-semibold text-zinc-900">#{idKey}</span>
                        <span className="hidden h-4 w-px bg-zinc-200 md:block" />
                        <span className="text-sm text-zinc-600">{tanggal}</span>
                        <StatusBadge value={status} />
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-zinc-500">Total</div>
                        <div className="text-lg font-semibold text-zinc-900">
                          {formatRupiah(amount, currency)}
                        </div>
                      </div>
                    </div>

                    {/* Isi: item + alamat + info bayar */}
                    <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-12 md:items-start">
                      {/* Item preview */}
                      <div className="md:col-span-5 flex gap-3">
                        <Image
                          className="h-14 w-14 rounded-md object-cover ring-1 ring-zinc-200"
                          src={items?.[0]?.product?.image?.[0] || assets.box_icon}
                          alt="Produk"
                          width={56}
                          height={56}
                          loading="lazy"
                        />
                        <div className="text-sm">
                          <p className="font-medium text-zinc-900 line-clamp-2">{ringkasNama || "—"}</p>
                          <p className="mt-0.5 text-zinc-600">Jumlah item: {jumlahItem}</p>
                        </div>
                      </div>

                      {/* Alamat */}
                      <div className="md:col-span-4 text-sm text-zinc-700">
                        <p className="font-medium text-zinc-900">Kirim ke</p>
                        <p className="mt-0.5">
                          {alamat.fullName ?? "-"}
                          <br />
                          {(alamat.area ?? "-")}
                          <br />
                          {(alamat.city ?? "-") + (alamat.state ? `, ${alamat.state}` : "")}
                          <br />
                          {alamat.phoneNumber ?? "-"}
                        </p>
                      </div>

                      {/* Pembayaran + Aksi */}
                      <div className="md:col-span-3 flex flex-col gap-2">
                        <div className="rounded-lg bg-zinc-50 ring-1 ring-zinc-200 px-3 py-2 text-sm">
                          <div className="flex items-center justify-between">
                            <span className="text-zinc-600">Metode</span>
                            <span className="font-medium text-zinc-900">
                              {order?.paymentMethod ?? "COD"}
                            </span>
                          </div>
                          <div className="mt-1 flex items-center justify-between">
                            <span className="text-zinc-600">Pembayaran</span>
                            <span
                              className={`font-medium ${
                                payLabel === "Lunas"
                                  ? "text-emerald-700"
                                  : payLabel === "Gagal"
                                  ? "text-rose-700"
                                  : "text-amber-700"
                              }`}
                            >
                              {payLabel}
                            </span>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <button
                            className="flex-1 rounded-lg border px-3 py-2 text-sm hover:bg-zinc-50"
                                    onClick={() => {
                                    router.push(`/order/${idKey}`);
                                    }}
                          >
                            Detail
                          </button>
                          <button
                            disabled={!tracking}
                            className="flex-1 rounded-lg bg-orange-600 px-3 py-2 text-sm font-semibold text-white hover:bg-orange-700 disabled:opacity-50"
                            onClick={() => {
                              if (!tracking) return;
                              // arahkan ke halaman pelacakan kurir / internal
                              window.open(`https://cekresi.com/?noresi=${encodeURIComponent(tracking)}`, "_blank");
                            }}
                          >
                            {tracking ? "Lacak" : "—"}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </main>
      <Footer />
    </>
  );
}
