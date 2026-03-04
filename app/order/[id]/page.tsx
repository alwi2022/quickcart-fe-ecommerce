"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Loading from "@/components/Loading";
import { useAppContext } from "@/context/AppContext";
import { assets } from "@/assets/assets";

type OrderItem = {
  _id?: string;
  title?: string;
  sku?: string;
  variantLabel?: string;
  qty?: number;
  price?: {
    unit?: number;
    subtotal?: number;
  };
};

type OrderDetail = {
  _id?: string;
  orderNo?: string;
  status?: string;
  placedAt?: string;
  items?: OrderItem[];
  pricing?: {
    subtotal?: number;
    shippingCost?: number;
    tax?: number;
    discounts?: Array<{ amount?: number }>;
    grandTotal?: number;
  };
  shippingAddress?: {
    receiverName?: string;
    phone?: string;
    street?: string;
    subdistrict?: string;
    city?: string;
    province?: string;
    postalCode?: string;
    country?: string;
  };
  payment?: {
    method?: string;
    status?: string;
  };
  shipment?: {
    courier?: string;
    service?: string;
    trackingNo?: string;
  };
};

type OrderDetailResponse = {
  item?: OrderDetail;
};

function formatTanggal(iso?: string) {
  try {
    return new Intl.DateTimeFormat("id-ID", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(iso || ""));
  } catch {
    return "-";
  }
}

function formatMoney(value: number | undefined, currency = "Rp") {
  return `${currency}${Number(value || 0).toLocaleString("id-ID")}`;
}

export default function OrderDetailPage() {
  const params = useParams();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;

  const { currency = "Rp" } = useAppContext();

  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    if (!id) {
      setOrder(null);
      setLoading(false);
      return;
    }

    let alive = true;

    (async () => {
      try {
        setLoadError("");

        const res = await fetch(`/api/orders/${encodeURIComponent(String(id))}`, {
          method: "GET",
          cache: "no-store",
          credentials: "include",
        });

        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body?.error || "Pesanan tidak ditemukan");
        }

        const data = (await res.json()) as OrderDetailResponse;
        if (alive) setOrder(data?.item || null);
      } catch (err: unknown) {
        if (alive) {
          setOrder(null);
          setLoadError(err instanceof Error ? err.message : "Gagal memuat detail pesanan");
        }
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [id]);

  const items = useMemo(() => order?.items ?? [], [order]);
  const discountTotal = useMemo(() => {
    const discounts = order?.pricing?.discounts || [];
    return discounts.reduce((sum, item) => sum + Number(item?.amount || 0), 0);
  }, [order?.pricing?.discounts]);

  if (loading) return <Loading />;

  if (!order) {
    return (
      <>
        <Navbar />
        <main className="mx-auto max-w-[1200px] px-6 py-10 md:px-12 lg:px-16">
          <div className="rounded-xl border p-6 text-zinc-700">
            {loadError || "Pesanan tidak ditemukan."}
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-[1200px] px-6 py-8 md:px-12 lg:px-16">
        <header className="mb-6">
          <h1 className="text-2xl font-semibold text-zinc-900 md:text-3xl">Detail Pesanan #{order.orderNo || order._id}</h1>
          <p className="mt-1 text-sm text-zinc-600">
            Status: <span className="font-medium text-zinc-900">{order.status || "awaiting_payment"}</span> | Tanggal: {formatTanggal(order.placedAt)}
          </p>
        </header>

        {loadError && (
          <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            {loadError}
          </div>
        )}

        <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="rounded-2xl border border-zinc-200 bg-white p-5 md:p-6 lg:col-span-2">
            <h2 className="text-base font-semibold text-zinc-900">Ringkasan Barang</h2>
            <div className="mt-4 divide-y">
              {items.map((item) => (
                <div key={item._id || `${item.sku}-${item.title}`} className="flex items-center gap-4 py-4">
                  <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-zinc-100">
                    <Image
                      src={assets.box_icon}
                      alt={item.title || "Produk"}
                      width={64}
                      height={64}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-zinc-900">{item.title || "Produk"}</p>
                    <p className="text-sm text-zinc-600">
                      Qty: {item.qty || 0} | Varian: {item.variantLabel || "-"}
                    </p>
                    <p className="text-xs text-zinc-500">SKU: {item.sku || "-"}</p>
                  </div>
                  <div className="text-right font-medium">
                    {formatMoney(item.price?.subtotal, currency)}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 space-y-2 border-t pt-4 text-sm">
              <div className="flex justify-between">
                <span className="text-zinc-600">Subtotal</span>
                <span className="font-medium">{formatMoney(order.pricing?.subtotal, currency)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-600">Ongkos Kirim</span>
                <span className="font-medium">{formatMoney(order.pricing?.shippingCost, currency)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-600">Pajak</span>
                <span className="font-medium">{formatMoney(order.pricing?.tax, currency)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-600">Diskon</span>
                <span className="font-medium">-{formatMoney(discountTotal, currency)}</span>
              </div>
              <div className="flex justify-between border-t pt-2 text-base font-semibold">
                <span>Total</span>
                <span>{formatMoney(order.pricing?.grandTotal, currency)}</span>
              </div>
            </div>
          </div>

          <aside className="space-y-6">
            <div className="rounded-2xl border border-zinc-200 bg-white p-5 md:p-6">
              <h3 className="text-base font-semibold text-zinc-900">Alamat Pengiriman</h3>
              <div className="mt-3 space-y-1 text-sm text-zinc-700">
                <p className="font-medium">{order.shippingAddress?.receiverName || "-"}</p>
                <p>{order.shippingAddress?.street || "-"}</p>
                <p>
                  {[
                    order.shippingAddress?.subdistrict,
                    order.shippingAddress?.city,
                    order.shippingAddress?.province,
                    order.shippingAddress?.postalCode,
                  ]
                    .filter(Boolean)
                    .join(", ") || "-"}
                </p>
                <p>{order.shippingAddress?.phone || "-"}</p>
                <p>{order.shippingAddress?.country || "ID"}</p>
              </div>
            </div>

            <div className="rounded-2xl border border-zinc-200 bg-white p-5 md:p-6">
              <h3 className="text-base font-semibold text-zinc-900">Pembayaran dan Pengiriman</h3>
              <ul className="mt-3 space-y-2 text-sm text-zinc-700">
                <li>Metode Bayar: {order.payment?.method || "manual"}</li>
                <li>Status Bayar: {order.payment?.status || "pending"}</li>
                <li>Kurir: {order.shipment?.courier || "-"}</li>
                <li>Layanan: {order.shipment?.service || "-"}</li>
                <li>No. Resi: {order.shipment?.trackingNo || "-"}</li>
              </ul>
            </div>
          </aside>
        </section>
      </main>
      <Footer />
    </>
  );
}
