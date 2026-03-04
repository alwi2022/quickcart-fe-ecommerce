"use client";

import React, { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Loading from "@/components/Loading";
import { useAppContext } from "@/context/AppContext";
import { assets } from "@/assets/assets";

type OrderItem = {
  _id?: string;
  title?: string;
  qty?: number;
};

type ShippingAddress = {
  receiverName?: string;
  street?: string;
  subdistrict?: string;
  city?: string;
  province?: string;
  postalCode?: string;
  phone?: string;
};

type OrderRow = {
  _id?: string;
  orderNo?: string;
  status?: string;
  placedAt?: string;
  items?: OrderItem[];
  pricing?: { grandTotal?: number };
  payment?: { method?: string; status?: string };
  shipment?: { trackingNo?: string };
  shippingAddress?: ShippingAddress;
};

type OrdersResponse = {
  items?: OrderRow[];
};

function formatTanggal(iso: string | undefined) {
  try {
    return new Intl.DateTimeFormat("id-ID", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(new Date(iso || ""));
  } catch {
    return "-";
  }
}

function formatRupiah(n: number | undefined, currency = "Rp") {
  const num = Number(n || 0);
  return `${currency}${num.toLocaleString("id-ID")}`;
}

const STATUS_MAP: Record<string, { label: string; cls: string }> = {
  awaiting_payment: { label: "Menunggu Bayar", cls: "bg-amber-100 text-amber-800 ring-amber-200" },
  paid: { label: "Sudah Dibayar", cls: "bg-emerald-100 text-emerald-800 ring-emerald-200" },
  processing: { label: "Diproses", cls: "bg-sky-100 text-sky-800 ring-sky-200" },
  shipped: { label: "Dikirim", cls: "bg-indigo-100 text-indigo-800 ring-indigo-200" },
  completed: { label: "Selesai", cls: "bg-green-100 text-green-800 ring-green-200" },
  cancelled: { label: "Dibatalkan", cls: "bg-rose-100 text-rose-800 ring-rose-200" },
  refunded: { label: "Refund", cls: "bg-purple-100 text-purple-800 ring-purple-200" },
};

function StatusBadge({ value }: { value?: string }) {
  const key = String(value || "awaiting_payment").toLowerCase();
  const m = STATUS_MAP[key] || STATUS_MAP.awaiting_payment;
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ring-1 ${m.cls}`}>
      {m.label}
    </span>
  );
}

function paymentLabel(status?: string) {
  const s = String(status || "pending").toLowerCase();
  if (s === "paid") return { text: "Lunas", cls: "text-emerald-700" };
  if (s === "failed") return { text: "Gagal", cls: "text-rose-700" };
  if (s === "expired") return { text: "Expired", cls: "text-zinc-700" };
  return { text: "Menunggu", cls: "text-amber-700" };
}

export default function MyOrders() {
  const { currency = "Rp" } = useAppContext();
  const router = useRouter();

  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const [statusFilter, setStatusFilter] = useState("semua");
  const [q, setQ] = useState("");

  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        setLoadError("");
        const res = await fetch("/api/orders?limit=50", {
          method: "GET",
          cache: "no-store",
          credentials: "include",
        });

        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body?.error || "Gagal memuat pesanan");
        }

        const data = (await res.json()) as OrdersResponse;
        if (alive) setOrders(Array.isArray(data.items) ? data.items : []);
      } catch (err: unknown) {
        if (alive) {
          setOrders([]);
          setLoadError(err instanceof Error ? err.message : "Gagal memuat pesanan");
        }
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

    return list.filter((order) => {
      const status = String(order?.status || "").toLowerCase();
      const statusOk = statusFilter === "semua" || status === statusFilter;
      if (!statusOk) return false;
      if (!term) return true;

      const itemTitles = (order?.items || []).map((it) => it?.title || "").join(" ");
      const haystack = `${order?._id || ""} ${order?.orderNo || ""} ${itemTitles} ${
        order?.shippingAddress?.receiverName || ""
      } ${order?.shippingAddress?.city || ""}`.toLowerCase();

      return haystack.includes(term);
    });
  }, [orders, q, statusFilter]);

  const statuses = [
    "semua",
    "awaiting_payment",
    "paid",
    "processing",
    "shipped",
    "completed",
    "cancelled",
    "refunded",
  ];

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-[1200px] px-6 md:px-10 lg:px-12 py-8">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-zinc-900">Pesanan Saya</h1>
            <p className="text-sm text-zinc-600">Lihat riwayat dan status pesanan kamu.</p>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <div className="flex items-center gap-1 rounded-lg border border-zinc-300 bg-white px-2 py-1">
              {statuses.map((s) => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={`rounded-md px-2.5 py-1 text-sm ${
                    statusFilter === s ? "bg-orange-600 text-white" : "text-zinc-700 hover:bg-zinc-100"
                  }`}
                >
                  {s === "semua" ? "Semua" : STATUS_MAP[s]?.label || s}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 rounded-lg border border-zinc-300 bg-white px-3 py-2">
              <Image src={assets.search_icon} alt="" width={14} height={14} />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                className="w-56 bg-transparent text-sm outline-none"
                placeholder="Cari order atau produk..."
              />
              {q && (
                <button onClick={() => setQ("")} className="text-xs text-zinc-500 hover:text-zinc-700">
                  bersihkan
                </button>
              )}
            </div>
          </div>
        </div>

        {loadError && (
          <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            {loadError}
          </div>
        )}

        <section className="mt-6">
          {loading ? (
            <Loading />
          ) : filtered.length === 0 ? (
            <div className="rounded-xl border border-zinc-200 bg-white p-8 text-center">
              <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-full bg-orange-50 ring-1 ring-orange-100">
                <Image src={assets.box_icon} alt="" width={24} height={24} />
              </div>
              <p className="font-medium text-zinc-900">Belum ada pesanan</p>
              <p className="mt-1 text-sm text-zinc-600">Mulai belanja agar pesananmu muncul di halaman ini.</p>
              <button
                onClick={() => router.push("/all-products")}
                className="mt-4 rounded-lg bg-orange-600 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-700"
              >
                Belanja Sekarang
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {filtered.map((order) => {
                const idKey = String(order?._id || "");
                const orderNo = order?.orderNo || idKey;
                const items = Array.isArray(order?.items) ? order.items : [];
                const alamat = order?.shippingAddress || {};
                const jumlahItem = items.length;
                const ringkasNama =
                  items
                    .slice(0, 2)
                    .map((it) => `${it?.title || "Produk"} x ${Number(it?.qty || 0)}`)
                    .join(", ") + (jumlahItem > 2 ? `, +${jumlahItem - 2} lainnya` : "");

                const amount = Number(order?.pricing?.grandTotal || 0);
                const tanggal = formatTanggal(order?.placedAt);
                const status = order?.status || "awaiting_payment";
                const payment = paymentLabel(order?.payment?.status);
                const tracking = order?.shipment?.trackingNo;

                return (
                  <div key={idKey} className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm md:p-5">
                    <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                      <div className="flex flex-wrap items-center gap-3">
                        <span className="text-sm text-zinc-600">Order</span>
                        <span className="font-semibold text-zinc-900">#{orderNo}</span>
                        <span className="hidden h-4 w-px bg-zinc-200 md:block" />
                        <span className="text-sm text-zinc-600">{tanggal}</span>
                        <StatusBadge value={status} />
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-zinc-500">Total</div>
                        <div className="text-lg font-semibold text-zinc-900">{formatRupiah(amount, currency)}</div>
                      </div>
                    </div>

                    <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-12 md:items-start">
                      <div className="flex gap-3 md:col-span-5">
                        <Image
                          className="h-14 w-14 rounded-md object-cover ring-1 ring-zinc-200"
                          src={assets.box_icon}
                          alt="Produk"
                          width={56}
                          height={56}
                        />
                        <div className="text-sm">
                          <p className="line-clamp-2 font-medium text-zinc-900">{ringkasNama || "-"}</p>
                          <p className="mt-0.5 text-zinc-600">Jumlah item: {jumlahItem}</p>
                        </div>
                      </div>

                      <div className="text-sm text-zinc-700 md:col-span-4">
                        <p className="font-medium text-zinc-900">Kirim ke</p>
                        <p className="mt-0.5">
                          {alamat.receiverName || "-"}
                          <br />
                          {alamat.street || "-"}
                          <br />
                          {[alamat.subdistrict, alamat.city, alamat.province].filter(Boolean).join(", ") || "-"}
                          <br />
                          {alamat.phone || "-"}
                        </p>
                      </div>

                      <div className="flex flex-col gap-2 md:col-span-3">
                        <div className="rounded-lg bg-zinc-50 px-3 py-2 text-sm ring-1 ring-zinc-200">
                          <div className="flex items-center justify-between">
                            <span className="text-zinc-600">Metode</span>
                            <span className="font-medium text-zinc-900">{order?.payment?.method || "manual"}</span>
                          </div>
                          <div className="mt-1 flex items-center justify-between">
                            <span className="text-zinc-600">Pembayaran</span>
                            <span className={`font-medium ${payment.cls}`}>{payment.text}</span>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <button
                            className="flex-1 rounded-lg border px-3 py-2 text-sm hover:bg-zinc-50"
                            onClick={() => router.push(`/order/${idKey}`)}
                          >
                            Detail
                          </button>
                          <button
                            disabled={!tracking}
                            className="flex-1 rounded-lg bg-orange-600 px-3 py-2 text-sm font-semibold text-white hover:bg-orange-700 disabled:opacity-50"
                            onClick={() => {
                              if (!tracking) return;
                              window.open(`https://cekresi.com/?noresi=${encodeURIComponent(tracking)}`, "_blank");
                            }}
                          >
                            {tracking ? "Lacak" : "-"}
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
