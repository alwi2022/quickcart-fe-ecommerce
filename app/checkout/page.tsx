"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Image from "next/image";
import { useAppContext } from "@/context/AppContext";

type AddressItem = {
  _id?: string;
  label?: string;
  receiver_name?: string;
  phone?: string;
  street?: string;
  subdistrict?: string;
  city?: string;
  province?: string;
  postal_code?: string;
  country?: string;
  is_default?: boolean;
};

type CartItem = {
  productId?: string;
  title?: string;
  productImage?: string;
  brand?: string;
  category?: string;
  qty?: number;
  priceSnapshot?: {
    unit?: number;
    currency?: string;
  };
};

type MeResponse = {
  user?: {
    addresses?: AddressItem[];
    default_address_id?: string;
  };
};

type CartResponse = {
  items?: CartItem[];
};

export default function CheckoutPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { currency = "Rp", setCartItems } = useAppContext();

  const [loading, setLoading] = useState(true);
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState("");

  const [addresses, setAddresses] = useState<AddressItem[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState("");
  const [cartItems, setCheckoutItems] = useState<CartItem[]>([]);
  const [pay, setPay] = useState("cod");

  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        setError("");

        const [meRes, cartRes] = await Promise.all([
          fetch("/api/me", { method: "GET", cache: "no-store", credentials: "include" }),
          fetch("/api/cart", { method: "GET", cache: "no-store", credentials: "include" }),
        ]);

        if (!meRes.ok) {
          throw new Error("Gagal memuat profil");
        }
        if (!cartRes.ok) {
          throw new Error("Gagal memuat keranjang");
        }

        const meData = (await meRes.json()) as MeResponse;
        const cartData = (await cartRes.json()) as CartResponse;

        const addr = Array.isArray(meData.user?.addresses) ? meData.user?.addresses : [];
        const items = Array.isArray(cartData.items) ? cartData.items : [];

        if (!items.length) {
          router.replace("/cart");
          return;
        }

        if (alive) {
          setAddresses(addr);
          setCheckoutItems(items);

          const queryId = String(searchParams.get("addressId") || "");
          const defaultId = String(meData.user?.default_address_id || "");
          const fallbackId = String(addr.find((a) => a.is_default)?._id || addr[0]?._id || "");
          setSelectedAddressId(queryId || defaultId || fallbackId);
        }
      } catch (err: unknown) {
        if (alive) {
          setError(err instanceof Error ? err.message : "Gagal memuat checkout");
        }
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [router, searchParams]);

  const selectedAddress = useMemo(
    () => addresses.find((a) => String(a._id || "") === String(selectedAddressId || "")) || null,
    [addresses, selectedAddressId],
  );

  const subtotal = useMemo(
    () => cartItems.reduce((sum, item) => sum + Number(item?.priceSnapshot?.unit || 0) * Number(item?.qty || 0), 0),
    [cartItems],
  );
  const tax = useMemo(() => Math.floor(subtotal * 0.02), [subtotal]);
  const total = subtotal + tax;

  const placePayment = async () => {
    if (!selectedAddress) {
      alert("Pilih alamat pengiriman terlebih dahulu.");
      return;
    }

    setPlacing(true);
    setError("");

    try {
      const payload = {
        paymentMethod: pay,
        shippingCost: 0,
        tax,
        shippingAddress: {
          receiverName: selectedAddress.receiver_name,
          phone: selectedAddress.phone,
          street: selectedAddress.street,
          subdistrict: selectedAddress.subdistrict,
          city: selectedAddress.city,
          province: selectedAddress.province,
          postalCode: selectedAddress.postal_code,
          country: selectedAddress.country || "ID",
        },
      };

      const res = await fetch("/api/checkout", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || data?.message || "Checkout gagal");

      setCartItems({});
      const oid = String(data?.item?.orderNo || data?.item?._id || "");
      router.push(`/order/success?oid=${encodeURIComponent(oid)}`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Checkout gagal");
    } finally {
      setPlacing(false);
    }
  };

  if (loading) return null;

  return (
    <>
      <Navbar />

      <main className="px-6 md:px-16 lg:px-32 py-10">
        <h1 className="text-2xl font-semibold">Checkout</h1>

        {error && (
          <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            {error}
          </div>
        )}

        <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-8">
          <section className="lg:col-span-8 space-y-6">
            <div className="rounded-xl border p-5 bg-white">
              <div className="flex items-center justify-between gap-3">
                <h2 className="font-semibold text-zinc-900">Alamat Pengiriman</h2>
                <button
                  type="button"
                  onClick={() => router.push("/add-address")}
                  className="rounded border px-3 py-1.5 text-xs hover:bg-zinc-50"
                >
                  + Tambah alamat
                </button>
              </div>

              {addresses.length > 0 ? (
                <div className="mt-3 space-y-2">
                  <select
                    value={selectedAddressId}
                    onChange={(e) => setSelectedAddressId(e.target.value)}
                    className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
                  >
                    {addresses.map((address) => (
                      <option key={String(address._id || "")} value={String(address._id || "")}>{`${address.receiver_name} - ${address.street}, ${address.city}`}</option>
                    ))}
                  </select>
                  {selectedAddress && (
                    <p className="text-sm text-zinc-700">
                      {selectedAddress.receiver_name}, {selectedAddress.street}, {selectedAddress.subdistrict}, {selectedAddress.city}, {selectedAddress.province} {selectedAddress.postal_code}
                    </p>
                  )}
                </div>
              ) : (
                <p className="mt-2 text-sm text-zinc-700">Alamat belum tersedia.</p>
              )}
            </div>

            <div className="rounded-xl border p-5 bg-white">
              <h2 className="font-semibold text-zinc-900">Item Pesanan</h2>
              <ul className="mt-3 divide-y">
                {cartItems.map((it, idx) => (
                  <li key={`${it.productId}-${idx}`} className="py-3 flex items-center gap-3">
                    <div className="relative h-14 w-14 rounded bg-zinc-50 ring-1 ring-zinc-200 overflow-hidden">
                      {it.productImage && (
                        <Image
                          src={it.productImage}
                          alt={it.title || "Produk"}
                          fill
                          className="object-contain p-1"
                          loading="lazy"
                          sizes="56px"
                        />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="font-medium text-zinc-900 truncate">{it.title || "Produk"}</div>
                      <div className="text-xs text-zinc-500">{it.brand || "-"} | {it.category || "-"}</div>
                    </div>
                    <div className="text-sm text-zinc-700">x{Number(it.qty || 0)}</div>
                    <div className="text-sm font-medium">
                      {currency}
                      {Number(it.priceSnapshot?.unit || 0) * Number(it.qty || 0)}
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-xl border p-5 bg-white">
              <h2 className="font-semibold text-zinc-900">Metode Pembayaran</h2>

              <fieldset className="mt-3 space-y-2">
                <legend className="sr-only">Pilih metode pembayaran</legend>

                <label className="flex items-center gap-2">
                  <input type="radio" name="pay" value="cod" checked={pay === "cod"} onChange={() => setPay("cod")} />
                  <span>Bayar di Tempat (COD)</span>
                </label>

                <label className="flex items-center gap-2">
                  <input type="radio" name="pay" value="bank_transfer" checked={pay === "bank_transfer"} onChange={() => setPay("bank_transfer")} />
                  <span>Transfer Bank / VA</span>
                </label>

                <label className="flex items-center gap-2">
                  <input type="radio" name="pay" value="card" checked={pay === "card"} onChange={() => setPay("card")} />
                  <span>Kartu Kredit/Debit</span>
                </label>
              </fieldset>
            </div>
          </section>

          <aside className="lg:col-span-4 h-fit rounded-xl border p-5 bg-white">
            <h3 className="font-semibold">Ringkasan</h3>

            <div className="mt-3 space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>
                  {currency}
                  {subtotal}
                </span>
              </div>

              <div className="flex justify-between">
                <span>Ongkir</span>
                <span>
                  {currency}
                  0
                </span>
              </div>

              <div className="flex justify-between">
                <span>Pajak</span>
                <span>
                  {currency}
                  {tax}
                </span>
              </div>

              <div className="flex justify-between border-t pt-3 font-semibold">
                <span>Total</span>
                <span>
                  {currency}
                  {total}
                </span>
              </div>
            </div>

            <button
              onClick={placePayment}
              disabled={placing}
              type="button"
              className="mt-5 w-full h-12 rounded bg-orange-600 text-white font-medium hover:bg-orange-700 disabled:opacity-60"
            >
              {placing ? "Memproses..." : "Bayar Sekarang"}
            </button>
          </aside>
        </div>
      </main>

      <Footer />
    </>
  );
}
