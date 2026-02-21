"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Search, Mail, MessageCircle, Phone, ChevronDown } from "lucide-react";

// ====== Data FAQ (bisa kamu pindah ke file terpisah / fetch dari API) ======
const CATEGORIES = [
    "Akun",
    "Pembayaran",
    "Pesanan",
    "Pengiriman",
    "Pengembalian",
    "Produk",
];

const FAQS = [
    // Akun
    {
        id: "akun-1",
        category: "Akun",
        q: "Bagaimana cara membuat akun QuickCart?",
        a: "Klik tombol Daftar di pojok kanan atas, isi email/nomor HP, lalu ikuti instruksi verifikasi. Kamu juga bisa daftar cepat via Google.",
    },
    {
        id: "akun-2",
        category: "Akun",
        q: "Saya lupa kata sandi. Apa yang harus saya lakukan?",
        a: "Buka halaman Login lalu pilih 'Lupa kata sandi'. Kami akan kirim tautan reset ke email/nomor HP yang terdaftar.",
    },

    // Pembayaran
    {
        id: "pay-1",
        category: "Pembayaran",
        q: "Metode pembayaran apa saja yang didukung?",
        a: "Kami mendukung kartu kredit/debit, transfer bank, e-wallet populer, dan COD di lokasi tertentu.",
    },
    {
        id: "pay-2",
        category: "Pembayaran",
        q: "Kenapa pembayaran saya gagal?",
        a: "Pastikan saldo mencukupi, limit kartu masih tersedia, dan koneksi stabil. Jika tetap gagal, hubungi support agar kami bantu cek log transaksinya.",
    },

    // Pesanan
    {
        id: "order-1",
        category: "Pesanan",
        q: "Bagaimana cara melacak pesanan?",
        a: "Masuk ke Akun > Pesanan Saya, pilih pesanan, lalu klik 'Lacak'. Nomor resi akan otomatis ditautkan ke kurir.",
    },
    {
        id: "order-2",
        category: "Pesanan",
        q: "Saya ingin membatalkan pesanan. Bisa?",
        a: "Selama pesanan belum diproses penjual, kamu bisa batalkan dari detail pesanan. Jika sudah diproses, silakan ajukan pengembalian setelah barang diterima.",
    },

    // Pengiriman
    {
        id: "ship-1",
        category: "Pengiriman",
        q: "Berapa lama estimasi pengiriman?",
        a: "Rata-rata 1–3 hari kerja dalam kota dan 2–7 hari kerja antar pulau, tergantung kurir yang dipilih.",
    },
    {
        id: "ship-2",
        category: "Pengiriman",
        q: "Apakah ada gratis ongkir?",
        a: "Ada. Lihat banner promo atau aktifkan voucher Gratis Ongkir saat checkout jika syarat terpenuhi.",
    },

    // Pengembalian
    {
        id: "ret-1",
        category: "Pengembalian",
        q: "Bagaimana prosedur retur barang?",
        a: "Buka Pesanan Saya > pilih pesanan > Ajukan Pengembalian. Unggah bukti (foto/video) dan pilih alasan retur. Tim kami akan review maksimal 2x24 jam kerja.",
    },
    {
        id: "ret-2",
        category: "Pengembalian",
        q: "Kapan dana pengembalian saya diproses?",
        a: "Setelah retur disetujui dan barang diterima penjual, dana akan diproses 1–3 hari kerja sesuai metode pembayaran.",
    },

    // Produk
    {
        id: "prod-1",
        category: "Produk",
        q: "Produk ini original?",
        a: "Produk di QuickCart melewati kurasi seller. Untuk label 'Official' atau 'Mall', produk 100% original bergaransi resmi.",
    },
    {
        id: "prod-2",
        category: "Produk",
        q: "Bagaimana cara bertanya ke penjual?",
        a: "Di halaman produk, klik tombol 'Chat Penjual' untuk menanyakan stok, varian, atau detail lainnya.",
    },
];

function FaqItem({ item, open, onToggle, highlight = "" }) {
    const isOpen = open === item.id;

    // optional highlight kata kunci pada pertanyaan
    const getHighlighted = (text) => {
        const q = highlight.trim();
        if (!q) return text;
        const re = new RegExp(`(${q.replace(/[.*+?^${}()|[\\]\\\\]/g, "\\$&")})`, "ig");
        return text.split(re).map((part, i) =>
            re.test(part) ? (
                <mark key={i} className="bg-orange-100 text-zinc-900 rounded px-0.5">
                    {part}
                </mark>
            ) : (
                <span key={i}>{part}</span>
            )
        );
    };

    return (
        <div className="rounded-xl border border-zinc-200 bg-white">
            <button
                className="w-full flex items-center justify-between gap-3 px-4 py-3 text-left"
                aria-expanded={isOpen}
                aria-controls={`panel-${item.id}`}
                onClick={() => onToggle(isOpen ? null : item.id)}
            >
                <span className="font-medium text-zinc-900">{getHighlighted(item.q)}</span>
                <ChevronDown
                    className={`h-5 w-5 shrink-0 text-zinc-500 transition-transform ${isOpen ? "rotate-180" : ""}`}
                />
            </button>
            <div
                id={`panel-${item.id}`}
                className={`px-4 pb-3 text-sm text-zinc-700 transition-all ${isOpen ? "block" : "hidden"
                    }`}
            >
                {item.a}
            </div>
        </div>
    );
}

export default function HelpPage() {
    const [query, setQuery] = useState("");
    const [activeCat, setActiveCat] = useState("Semua");
    const [openId, setOpenId] = useState(null);

    // buka item dari hash (mis. /help#akun-1)
    useEffect(() => {
        if (typeof window === "undefined") return;
        const h = window.location.hash?.replace("#", "");
        if (h) setOpenId(h);
    }, []);

    const filteredFaqs = useMemo(() => {
        const q = query.trim().toLowerCase();
        return FAQS.filter((f) => {
            const byCat = activeCat === "Semua" || f.category === activeCat;
            if (!q) return byCat;
            const hay = `${f.q} ${f.a} ${f.category}`.toLowerCase();
            return byCat && hay.includes(q);
        });
    }, [query, activeCat]);

    // kumpulkan summary jumlah per kategori (opsional untuk badge)
    const counts = useMemo(() => {
        const m = new Map();
        FAQS.forEach((f) => m.set(f.category, (m.get(f.category) ?? 0) + 1));
        return m;
    }, []);

    return (
        <>
            <Navbar />

            <main className="px-6 md:px-16 lg:px-32 py-8">
                {/* Header */}
                <header className="mb-6">
                    <h1 className="text-2xl md:text-3xl font-semibold text-zinc-900">
                        Pusat Bantuan
                    </h1>
                    <p className="mt-1 text-zinc-600">
                        Temukan jawaban cepat atau hubungi kami jika kamu butuh bantuan.
                    </p>
                </header>

                {/* Search */}
                <div className="rounded-2xl bg-white ring-1 ring-zinc-200 p-4 md:p-5">
                    <div className="flex items-center gap-2 rounded-xl border border-zinc-300 bg-white pl-3 pr-3.5 py-2 focus-within:ring-2 focus-within:ring-orange-500/30">
                        <Search className="h-4 w-4 text-zinc-500" />
                        <input
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Cari: akun, pembayaran, pengiriman, retur, dst…"
                            className="w-full bg-transparent outline-none text-sm"
                            aria-label="Cari pertanyaan"
                        />
                        {query && (
                            <button
                                className="text-xs text-zinc-500 hover:text-zinc-700 px-1 rounded"
                                onClick={() => setQuery("")}
                            >
                                clear
                            </button>
                        )}
                    </div>

                    {/* Kategori (chips) */}
                    <div className="mt-4 overflow-x-auto">
                        <div className="flex gap-2 min-w-max md:min-w-0">
                            {["Semua", ...CATEGORIES].map((c) => {
                                const active = activeCat === c;
                                const badge =
                                    c === "Semua"
                                        ? FAQS.length
                                        : (counts.get(c) ?? 0);
                                return (
                                    <button
                                        key={c}
                                        onClick={() => {
                                            setActiveCat(c);
                                            setOpenId(null);
                                        }}
                                        className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm transition ${active
                                            ? "border-orange-500 bg-orange-50 text-orange-600"
                                            : "border-zinc-300 text-zinc-700 hover:border-zinc-400"
                                            }`}
                                    >
                                        <span>{c}</span>
                                        <span className={`rounded-full text-[11px] leading-none px-1.5 py-1 ${active ? "bg-orange-500 text-white" : "bg-zinc-200 text-zinc-700"
                                            }`}>
                                            {badge}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Hasil */}
                <section className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* List FAQ */}
                    <div className="lg:col-span-2 space-y-3">
                        <div className="text-sm text-zinc-600">
                            Menampilkan{" "}
                            <span className="font-medium text-zinc-900">
                                {filteredFaqs.length}
                            </span>{" "}
                            dari {FAQS.length} pertanyaan
                        </div>

                        {filteredFaqs.length === 0 ? (
                            <div className="rounded-xl border border-zinc-200 p-8 text-center text-zinc-600">
                                Tidak ada hasil yang cocok. Coba kata kunci lain atau pilih kategori berbeda.
                            </div>
                        ) : (
                            filteredFaqs.map((item) => (
                                <FaqItem
                                    key={item.id}
                                    item={item}
                                    open={openId}
                                    onToggle={setOpenId}
                                    highlight={query}
                                />
                            ))
                        )}
                    </div>

                    {/* Sidebar bantuan cepat */}
                    <aside className="lg:col-span-1 space-y-4">
                        <div className="rounded-2xl border border-zinc-200 bg-white p-5">
                            <h3 className="text-base font-semibold text-zinc-900">
                                Masih butuh bantuan?
                            </h3>
                            <p className="mt-1 text-sm text-zinc-600">
                                Tim kami siap membantu 08.00–17.00 WIB.
                            </p>

                            <div className="mt-4 grid grid-cols-1 gap-3">
                                <Link
                                    href="/contact"
                                    className="inline-flex items-center gap-3 rounded-xl border px-3.5 py-2.5 hover:bg-zinc-50"
                                >
                                    <MessageCircle className="h-5 w-5 text-zinc-700" />
                                    <div>
                                        <div className="text-sm font-medium text-zinc-900">Live Chat</div>
                                        <div className="text-xs text-zinc-600">Respon cepat dalam aplikasi</div>
                                    </div>
                                </Link>

                                <a
                                    href="mailto:imambahrialwi21@gmail.com"   // ← ganti email
                                    className="inline-flex items-center gap-3 rounded-xl border px-3.5 py-2.5 hover:bg-zinc-50"
                                >
                                    <Mail className="h-5 w-5 text-zinc-700" />
                                    <div>
                                        <div className="text-sm font-medium text-zinc-900">Email Support</div>
                                        <div className="text-xs text-zinc-600">imambahrialwi21@gmail.com</div>
                                    </div>
                                </a>

                                <a
                                    href="tel:0895618216004"                  // ← ganti telp
                                    className="inline-flex items-center gap-3 rounded-xl border px-3.5 py-2.5 hover:bg-zinc-50"
                                >
                                    <Phone className="h-5 w-5 text-zinc-700" />
                                    <div>
                                        <div className="text-sm font-medium text-zinc-900">Telepon</div>
                                        <div className="text-xs text-zinc-600">0895618216004</div>
                                    </div>
                                </a>

                            </div>
                        </div>

                        <div className="rounded-2xl border border-zinc-200 bg-white p-5">
                            <h3 className="text-base font-semibold text-zinc-900">Panduan cepat</h3>
                            <ul className="mt-3 space-y-2 text-sm text-orange-600">
                                <li>
                                    <Link href="/help#order-1" className="hover:underline">
                                        Cara melacak pesanan
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/help#ret-1" className="hover:underline">
                                        Ajukan pengembalian barang
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/help#akun-2" className="hover:underline">
                                        Reset kata sandi
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/help#pay-1" className="hover:underline">
                                        Metode pembayaran didukung
                                    </Link>
                                </li>
                            </ul>
                        </div>
                    </aside>
                </section>
            </main>

            <Footer />
        </>
    );
}
