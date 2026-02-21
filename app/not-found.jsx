// app/not-found.jsx
"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { assets } from "@/assets/assets";
import { useRouter } from "next/navigation";
import errorAnim from "@/assets/lottie/404 error.json";
import Lottie from "lottie-react";

export default function NotFoundPage() {
    const router = useRouter();
    const [q, setQ] = useState("");

    const submitSearch = (e) => {
        e.preventDefault();
        if (!q.trim()) return;
        router.push(`/all-products?q=${encodeURIComponent(q.trim())}`);
    };

    const quickCats = [
        { label: "Smartphone", query: "Smartphone" },
        { label: "Laptop", query: "Laptop" },
        { label: "Headphone", query: "Headphone" },

    ];

    function Illustration404() {
        return (
            <div className="relative mx-auto aspect-[4/3] w-full max-w-md overflow-hidden rounded-3xl ">
                <Lottie animationData={errorAnim} loop className="h-full w-full " />
            </div>
        );
    }

    return (
        <>
            <Navbar />

            <main className="px-6 md:px-16 lg:px-32 py-12">
                <div className="mx-auto max-w-5xl">
                    {/* Card */}
                    <div className="rounded-3xl border border-zinc-200 bg-white p-6 md:p-10 shadow-sm">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center">
                            {/* Left: Text */}
                            <div>
                              

                                <h1 className="mt-3 text-3xl md:text-4xl font-semibold text-zinc-900">
                                404 • Page Not Found
                                </h1>
                                <p className="mt-2 text-zinc-600">
                                    Link mungkin salah atau halaman sudah dipindahkan. Coba cari
                                    produk yang kamu butuhkan atau kembali ke beranda.
                                </p>

                                {/* Search */}
                                <form onSubmit={submitSearch} className="mt-5">
                                    <div className="flex items-center gap-2 rounded-xl border border-zinc-300 bg-white pl-3 pr-3.5 py-2 focus-within:ring-2 focus-within:ring-orange-500/30">
                                        <Image
                                            src={assets.search_icon}
                                            alt="search"
                                            width={16}
                                            height={16}
                                            className="opacity-70"
                                        />
                                        <input
                                            value={q}
                                            onChange={(e) => setQ(e.target.value)}
                                            placeholder="Cari produk, brand, atau kategori…"
                                            className="w-full bg-transparent outline-none text-sm"
                                            aria-label="Cari produk"
                                        />
                                        <button
                                            type="submit"
                                            className="rounded-full bg-orange-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-orange-700 transition"
                                        >
                                            Cari
                                        </button>
                                    </div>
                                </form>

                                {/* Quick categories */}
                                <div className="mt-4 flex flex-wrap gap-2">
                                    {quickCats.map((c) => (
                                        <Link
                                            key={c.label}
                                            href={`/all-products?category=${encodeURIComponent(c.query)}`}
                                            className="inline-flex items-center gap-2 rounded-full border border-zinc-300 px-3 py-1.5 text-sm text-zinc-700 hover:border-zinc-400 transition"
                                        >
                                            {c.label}
                                        </Link>
                                    ))}
                                </div>

                                {/* Actions */}
                                <div className="mt-6 flex flex-wrap gap-3">
                                    <Link
                                        href="/"
                                        className="inline-flex items-center justify-center rounded-lg bg-orange-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-orange-700 transition"
                                    >
                                        Kembali ke Beranda
                                    </Link>
                                    <Link
                                        href="/all-products"
                                        className="inline-flex items-center justify-center rounded-lg border border-orange-600 px-5 py-2.5 text-sm font-semibold text-orange-600 hover:bg-orange-50 transition"
                                    >
                                        Lihat Semua Produk
                                    </Link>
                                    <Link
                                        href="/help"
                                        className="inline-flex items-center justify-center rounded-lg border px-5 py-2.5 text-sm text-zinc-700 hover:bg-zinc-50 transition"
                                    >
                                        Pusat Bantuan
                                    </Link>
                                </div>
                            </div>

                            {/* Right: Illustration */}
                            <div className="relative">
                                <Illustration404 />
                            </div>
                        </div>
                    </div>

                    {/* Tips / Links bawah */}
                    <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Link
                            href="/about"
                            className="rounded-2xl border border-zinc-200 bg-white p-4 hover:bg-zinc-50 transition"
                        >
                            <p className="text-sm font-semibold text-zinc-900">Tentang QuickCart</p>
                            <p className="mt-1 text-sm text-zinc-600">
                                Kenal lebih dekat dengan platform kami.
                            </p>
                        </Link>
                        <Link
                            href="/contact"
                            className="rounded-2xl border border-zinc-200 bg-white p-4 hover:bg-zinc-50 transition"
                        >
                            <p className="text-sm font-semibold text-zinc-900">Kontak Kami</p>
                            <p className="mt-1 text-sm text-zinc-600">
                                Butuh bantuan? Tim kami siap membantu.
                            </p>
                        </Link>
                        <Link
                            href="/brands"
                            className="rounded-2xl border border-zinc-200 bg-white p-4 hover:bg-zinc-50 transition"
                        >
                            <p className="text-sm font-semibold text-zinc-900">Belanja Berdasarkan Brand</p>
                            <p className="mt-1 text-sm text-zinc-600">
                                Temukan brand favoritmu dengan cepat.
                            </p>
                        </Link>
                    </div>
                </div>
            </main>

            <Footer />
        </>
    );
}
