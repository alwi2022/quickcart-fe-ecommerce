"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { assets } from "@/assets/assets";
import { useAppContext } from "@/context/AppContext";
import { useRouter, useSearchParams } from "next/navigation";

/* ---------- Small helpers ---------- */
function Stat({ label, value }) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-4">
      <div className="text-xs text-zinc-500">{label}</div>
      <div className="mt-1 text-xl font-semibold text-zinc-900">{value}</div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-zinc-800">{label}</span>
      <div className="mt-1">{children}</div>
    </label>
  );
}

function Section({ title, children, right = null }) {
  return (
    <section className="rounded-2xl border border-zinc-200 bg-white p-5 md:p-6">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-base md:text-lg font-semibold text-zinc-900">{title}</h3>
        {right}
      </div>
      {children}
    </section>
  );
}

function Pill({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`whitespace-nowrap rounded-full px-4 py-2 text-sm transition
      ${active ? "bg-orange-600 text-white" : "bg-white border border-zinc-200 hover:bg-zinc-50"}`}
      aria-pressed={active}
    >
      {children}
    </button>
  );
}

/* ---------- Tabs config ---------- */
const TABS = [
  { key: "overview",  label: "Overview" },
  { key: "orders",    label: "Orders" },
  { key: "wishlist",  label: "Wishlist" },
  { key: "addresses", label: "Addresses" },
  { key: "account",   label: "Account" },
  { key: "security",  label: "Security" },
];

/* ====================== PAGE ====================== */
export default function ProfilePage() {
  const router = useRouter();
  const params = useSearchParams();
  const initialTab = params.get("tab") || "overview";

  const { user, wishlist = [], orders = [], updateUser } = useAppContext() || {};
  const [tab, setTab] = useState(initialTab);

  // Account form state (fallback kalau belum ada backend)
  const [form, setForm] = useState({
    fullName: user?.name || "User QuickCart",
    email: user?.email || "user@quickcart.com",
    phone: user?.phone || "",
    gender: user?.gender || "",
    birthday: user?.birthday || "",
  });

  useEffect(() => setTab(initialTab), [initialTab]);

  const changeTab = (k) => {
    setTab(k);
    const usp = new URLSearchParams(params.toString());
    usp.set("tab", k);
    router.replace(`/profile?${usp.toString()}`);
  };

  const onSaveAccount = () => {
    if (typeof updateUser === "function") {
      updateUser(form);
    } else {
      console.log("Saved (mock):", form);
    }
  };

  /* --------- Derived stats --------- */
  const stats = useMemo(() => {
    const orderCount = Array.isArray(orders) ? orders.length : 0;
    const wishCount = Array.isArray(wishlist) ? wishlist.length : 0;
    return [
      { label: "Orders", value: orderCount },
      { label: "Wishlist", value: wishCount },
      { label: "Vouchers", value: 0 },
      { label: "Points", value: 0 },
    ];
  }, [orders, wishlist]);

  /* --------- Renderers --------- */

  const renderOverview = () => (
    <div className="space-y-6">
      <Section
        title="Hi, welcome back!"
        right={<Link href="/all-products" className="text-sm text-orange-600 hover:underline">Belanja sekarang →</Link>}
      >
        <div className="flex items-center gap-4">
          <Image
            src={user?.avatar || assets.user_icon || assets.profile_icon || assets.logo}
            alt="Avatar"
            width={56}
            height={56}
            className="h-14 w-14 rounded-full object-cover ring-1 ring-zinc-200"
          />
          <div>
            <div className="text-lg font-semibold text-zinc-900">{form.fullName}</div>
            <div className="text-sm text-zinc-600">{form.email}</div>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          {stats.map((s) => (
            <Stat key={s.label} label={s.label} value={s.value} />
          ))}
        </div>
      </Section>

      <Section title="Recent Orders" right={<Link href="/orders" className="text-sm text-orange-600 hover:underline">Lihat semua</Link>}>
        {Array.isArray(orders) && orders.length > 0 ? (
          <ul className="divide-y divide-zinc-100">
            {orders.slice(0, 5).map((o) => (
              <li key={o.id || o._id} className="py-4 flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <div className="text-sm font-medium text-zinc-900 truncate">
                    Order #{o.code || o.id || o._id}
                  </div>
                  <div className="text-xs text-zinc-500">
                    {o.items?.length || 0} item • {o.status || "Processing"}
                  </div>
                </div>
                <Link href={`/orders/${o.id || o._id}`} className="text-sm text-orange-600 hover:underline">
                  Detail
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState
            title="Belum ada pesanan"
            desc="Mulai belanja dan nikmati promo menarik."
            cta={{ href: "/all-products", label: "Jelajahi produk" }}
          />
        )}
      </Section>
    </div>
  );

  const renderOrders = () => (
    <Section title="Orders">
      {Array.isArray(orders) && orders.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-[640px] w-full text-sm">
            <thead>
              <tr className="text-left text-zinc-500">
                <th className="py-3 pr-4">Order</th>
                <th className="py-3 pr-4">Tanggal</th>
                <th className="py-3 pr-4">Item</th>
                <th className="py-3 pr-4">Total</th>
                <th className="py-3 pr-4">Status</th>
                <th className="py-3"></th>
              </tr>
            </thead>
            <tbody className="align-top">
              {orders.map((o) => (
                <tr key={o.id || o._id} className="border-t">
                  <td className="py-3 pr-4 font-medium text-zinc-900">#{o.code || o.id || o._id}</td>
                  <td className="py-3 pr-4 text-zinc-700">{o.date || "-"}</td>
                  <td className="py-3 pr-4 text-zinc-700">{o.items?.length || 0}</td>
                  <td className="py-3 pr-4 text-zinc-900">{o.total ? `$${o.total}` : "-"}</td>
                  <td className="py-3 pr-4">
                    <span className="rounded-full bg-orange-50 text-orange-700 px-2 py-0.5 text-xs font-medium">
                      {o.status || "Processing"}
                    </span>
                  </td>
                  <td className="py-3">
                    <Link href={`/orders/${o.id || o._id}`} className="text-orange-600 hover:underline">
                      Lihat
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <EmptyState
          title="Belum ada pesanan"
          desc="Pesanan kamu akan tampil di sini."
          cta={{ href: "/all-products", label: "Belanja sekarang" }}
        />
      )}
    </Section>
  );

  const renderWishlist = () => (
    <Section title="Wishlist">
      {Array.isArray(wishlist) && wishlist.length > 0 ? (
        <ul className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {wishlist.map((p) => (
            <li key={p._id} className="rounded-xl ring-1 ring-zinc-200 bg-white overflow-hidden">
              <Link href={`/product/${p._id}`} className="block group">
                <div className="relative h-40 bg-zinc-50">
                  <Image src={p.image?.[0]} alt={p.name} fill className="object-contain p-3" />
                </div>
                <div className="p-3">
                  <div className="text-sm font-medium text-zinc-900 truncate group-hover:underline">{p.name}</div>
                  <div className="mt-1 text-sm text-zinc-700">${p.offerPrice ?? p.price}</div>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState
          title="Wishlist kosong"
          desc="Simpan produk favoritmu agar mudah ditemukan."
          cta={{ href: "/all-products", label: "Cari produk" }}
        />
      )}
    </Section>
  );

  const renderAddresses = () => (
    <Section
      title="Addresses"
      right={<button className="rounded-lg border px-3 py-1.5 text-sm hover:bg-zinc-50">+ Tambah alamat</button>}
    >
      <EmptyState
        title="Belum ada alamat"
        desc="Tambah alamat pengiriman untuk pengalaman checkout lebih cepat."
      />
    </Section>
  );

  const renderAccount = () => (
    <Section
      title="Account Information"
      right={<button onClick={onSaveAccount} className="rounded-lg bg-orange-600 text-white px-4 py-2 text-sm hover:bg-orange-700">Simpan</button>}
    >
      <div className="flex items-center gap-4">
        <Image
          src={user?.avatar || assets.user_icon || assets.profile_icon || assets.logo}
          alt="Avatar"
          width={64}
          height={64}
          className="h-16 w-16 rounded-full object-cover ring-1 ring-zinc-200"
        />
        <button className="rounded-lg border px-3 py-1.5 text-sm hover:bg-zinc-50">Ubah foto</button>
      </div>

      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field label="Nama lengkap">
          <input
            className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
            value={form.fullName}
            onChange={(e) => setForm((s) => ({ ...s, fullName: e.target.value }))}
          />
        </Field>
        <Field label="Email">
          <input
            type="email"
            className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
            value={form.email}
            onChange={(e) => setForm((s) => ({ ...s, email: e.target.value }))}
          />
        </Field>
        <Field label="Nomor HP">
          <input
            className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
            value={form.phone}
            onChange={(e) => setForm((s) => ({ ...s, phone: e.target.value }))}
          />
        </Field>
        <Field label="Gender">
          <select
            className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
            value={form.gender}
            onChange={(e) => setForm((s) => ({ ...s, gender: e.target.value }))}
          >
            <option value="">Pilih</option>
            <option>Laki-laki</option>
            <option>Perempuan</option>
            <option>Lainnya</option>
          </select>
        </Field>
        <Field label="Tanggal lahir">
          <input
            type="date"
            className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
            value={form.birthday}
            onChange={(e) => setForm((s) => ({ ...s, birthday: e.target.value }))}
          />
        </Field>
      </div>
    </Section>
  );

  const renderSecurity = () => (
    <Section title="Security">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field label="Password saat ini">
          <input type="password" className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm" />
        </Field>
        <div />
        <Field label="Password baru">
          <input type="password" className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm" />
        </Field>
        <Field label="Konfirmasi password baru">
          <input type="password" className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm" />
        </Field>
      </div>
      <div className="mt-4">
        <button className="rounded-lg bg-orange-600 text-white px-4 py-2 text-sm hover:bg-orange-700">
          Ubah password
        </button>
      </div>

      <div className="mt-6 border-t pt-6">
        <h4 className="text-sm font-semibold text-zinc-900">Keamanan tambahan</h4>
        <p className="mt-1 text-sm text-zinc-600">Aktifkan 2FA untuk keamanan ekstra (coming soon).</p>
        <button className="mt-3 rounded-lg border px-3 py-1.5 text-sm hover:bg-zinc-50" disabled>
          Aktifkan 2FA
        </button>
      </div>
    </Section>
  );

  return (
    <>
      <Navbar />

      <main className="mx-auto max-w-[1200px] px-4 md:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Image
            src={user?.avatar || assets.user_icon || assets.profile_icon || assets.logo}
            alt="Avatar"
            width={40}
            height={40}
            className="h-10 w-10 rounded-full object-cover ring-1 ring-zinc-200"
          />
          <div>
            <h1 className="text-xl md:text-2xl font-semibold text-zinc-900">My Profile</h1>
            <p className="text-sm text-zinc-600">Kelola akun dan aktivitas belanjamu</p>
          </div>
        </div>

        {/* Tabs (mobile pills) */}
        <div className="mt-5 md:hidden overflow-x-auto">
          <div className="flex gap-2 min-w-max">
            {TABS.map((t) => (
              <Pill key={t.key} active={tab === t.key} onClick={() => changeTab(t.key)}>
                {t.label}
              </Pill>
            ))}
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-[220px_minmax(0,1fr)] gap-6">
          {/* Sidebar (desktop) */}
          <aside className="hidden md:block  h-fit">
            <nav className="rounded-2xl border border-zinc-200 bg-white p-2">
              <ul>
                {TABS.map((t) => (
                  <li key={t.key}>
                    <button
                      type="button"
                      onClick={() => changeTab(t.key)}
                      className={`w-full text-left px-3 py-2.5 rounded-lg text-sm transition
                      ${tab === t.key ? "bg-orange-50 text-orange-700 font-medium" : "hover:bg-zinc-50"}`}
                    >
                      {t.label}
                    </button>
                  </li>
                ))}
              </ul>
            </nav>
          </aside>

          {/* Content */}
          <div className="space-y-6">
            {tab === "overview"  && renderOverview()}
            {tab === "orders"    && renderOrders()}
            {tab === "wishlist"  && renderWishlist()}
            {tab === "addresses" && renderAddresses()}
            {tab === "account"   && renderAccount()}
            {tab === "security"  && renderSecurity()}
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}

/* ---------- Empty state ---------- */
type EmptyStateProps = {
  title: string;
  desc?: string;
  cta?: {
    href: string;
    label: string;
  };
};

function EmptyState({ title, desc, cta }: EmptyStateProps) {
  return (
    <div className="grid place-items-center rounded-xl border border-dashed border-zinc-300 bg-white p-8 text-center">
      <Image src={assets.box_icon || assets.logo} alt="empty" width={56} height={56} className="opacity-70" />
      <h4 className="mt-3 text-zinc-900 font-semibold">{title}</h4>
      {desc && <p className="mt-1 text-sm text-zinc-600">{desc}</p>}
      {cta && (
        <Link href={cta.href} className="mt-3 inline-flex rounded-lg bg-orange-600 px-4 py-2 text-sm font-medium text-white hover:bg-orange-700">
          {cta.label}
        </Link>
      )}
    </div>
  );
}
