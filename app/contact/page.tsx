"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { MapPin, Phone, Clock, Mail, HelpCircle, MessageSquare, ShieldCheck } from "lucide-react";
import { assets } from "@/assets/assets";

const COMPANY = {
    address:
        "Galaxy.com, Jl. Ki Ajurum No.1, RW.2, Cipare, Kec. Serang, Kota Serang, Banten 42117",
    phone: "0895618216004",
    email: "imambahrialwi21@gmail.com",
    hours: "Sen–Sab: 08.00 – 17.00 WIB",
};

function InfoCard({ icon: Icon, title, children }) {
    return (
        <div className="flex items-start gap-3 rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
            <div className="rounded-lg bg-orange-50 p-2 ring-1 ring-orange-100">
                <Icon className="h-5 w-5 text-orange-600" />
            </div>
            <div>
                <p className="font-semibold text-zinc-900">{title}</p>
                <div className="text-sm text-zinc-600">{children}</div>
            </div>
        </div>
    );
}

export default function ContactPage() {
    const [loading, setLoading] = useState(false);
    const [ok, setOk] = useState(false);
    const [err, setErr] = useState("");
    const [form, setForm] = useState({ name: "", email: "", phone: "", subject: "", message: "" });
    const onChange = (e) => setForm((s) => ({ ...s, [e.target.name]: e.target.value }));

    const onSubmit = async (e) => {
        e.preventDefault();
        setErr(""); setOk(false);

        if (!form.name || !form.email || !form.message) {
            setErr("Nama, email, dan pesan wajib diisi.");
            return;
        }
        const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email);
        if (!emailOk) { setErr("Format email tidak valid."); return; }

        setLoading(true);
        try {
            const res = await fetch("/api/contact", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form),
            });
            if (!res.ok) throw new Error();
            setOk(true);
            setForm({ name: "", email: "", phone: "", subject: "", message: "" });
        } catch {
            // fallback: open mail client
            const subject = encodeURIComponent(form.subject || `Pesan dari ${form.name}`);
            const body = encodeURIComponent(
                `Nama: ${form.name}\nEmail: ${form.email}\nTelepon: ${form.phone}\n\nPesan:\n${form.message}`
            );
            window.location.href = `mailto:${COMPANY.email}?subject=${subject}&body=${body}`;
            setOk(true);
        } finally {
            setLoading(false);
        }
    };

    const gmSrc = `https://www.google.com/maps?q=${encodeURIComponent(COMPANY.address)}&output=embed`;

    return (
        <>
            <main className="mx-auto max-w-[1200px] px-6 md:px-12 lg:px-16 py-8">
                {/* Header */}
                <header className="flex items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-semibold text-zinc-900">Hubungi Kami</h1>
                        <p className="mt-1 text-zinc-600">
                            Kami biasanya membalas dalam <span className="font-medium">1–2 jam</span>. Butuh jawaban cepat?
                            Lihat <Link href="/help" className="text-orange-600 underline">FAQ / Pusat Bantuan</Link>.
                        </p>
                    </div>
                    <Link href={'/'}>
                    <Image src={assets.logo} alt="QuickCart" width={120} height={36} className="hidden md:block opacity-80" />
                    </Link>
                </header>

                {/* Info ringkas */}
                <section className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <InfoCard icon={MapPin} title="Alamat">
                        {COMPANY.address}
                    </InfoCard>
                    <InfoCard icon={Phone} title="Telepon">
                        <a href={`tel:${COMPANY.phone}`} className="text-zinc-700">{COMPANY.phone}</a>
                    </InfoCard>
                    <InfoCard icon={Clock} title="Jam Operasional">{COMPANY.hours}</InfoCard>
                    <InfoCard icon={Mail} title="Email">
                        <a href={`mailto:${COMPANY.email}`} className="text-zinc-700">{COMPANY.email}</a>
                    </InfoCard>
                </section>

                {/* Konten utama */}
                <section className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Form */}
                    <div className="lg:col-span-2 rounded-2xl border border-zinc-200 bg-white p-5 md:p-6 shadow-sm">
                        <h2 className="text-lg font-semibold text-zinc-900">Kirim Pesan</h2>
                        <p className="text-sm text-zinc-600">Ada pertanyaan soal pesanan, produk, atau kerja sama?</p>

                        <form onSubmit={onSubmit} className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                            <label className="text-sm">
                                <span className="font-medium text-zinc-800">Nama Lengkap</span>
                                <input name="name" value={form.name} onChange={onChange} required
                                    className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-orange-500/30"
                                    placeholder="Nama kamu" />
                            </label>
                            <label className="text-sm">
                                <span className="font-medium text-zinc-800">Email</span>
                                <input type="email" name="email" value={form.email} onChange={onChange} required
                                    className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-orange-500/30"
                                    placeholder='contoh@gmail.com' />
                            </label>
                            <label className="text-sm">
                                <span className="font-medium text-zinc-800">No. Telepon</span>
                                <input name="phone" value={form.phone} onChange={onChange}
                                    className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-orange-500/30"
                                    placeholder={COMPANY.phone} />
                            </label>
                            <label className="text-sm">
                                <span className="font-medium text-zinc-800">Subjek</span>
                                <input name="subject" value={form.subject} onChange={onChange}
                                    className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-orange-500/30"
                                    placeholder="Tentang apa?" />
                            </label>
                            <label className="md:col-span-2 text-sm">
                                <span className="font-medium text-zinc-800">Pesan</span>
                                <textarea name="message" value={form.message} onChange={onChange} required rows={6}
                                    className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-orange-500/30"
                                    placeholder="Tuliskan pertanyaanmu di sini…" />
                            </label>

                            {err && <div className="md:col-span-2 rounded-lg bg-red-50 p-3 text-sm text-red-700 ring-1 ring-red-100">{err}</div>}
                            {ok && <div className="md:col-span-2 rounded-lg bg-emerald-50 p-3 text-sm text-emerald-700 ring-1 ring-emerald-100">Terima kasih! Pesanmu sudah terkirim.</div>}

                            <div className="md:col-span-2 flex items-center justify-end gap-3">
                                <button type="reset" onClick={() => { setForm({ name: "", email: "", phone: "", subject: "", message: "" }); setErr(""); setOk(false); }}
                                    className="rounded-lg border px-4 py-2 text-sm">
                                    Reset
                                </button>
                                <button type="submit" disabled={loading}
                                    className="rounded-lg bg-orange-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-orange-700 disabled:opacity-60">
                                    {loading ? "Mengirim…" : "Kirim Pesan"}
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Sidebar + Map */}
                    <aside className="space-y-4">
                        <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
                            <h3 className="mb-2 text-sm font-semibold text-zinc-900">Bantuan & Dukungan</h3>
                            <ul className="space-y-2 text-sm">
                                <li className="flex items-center gap-2">
                                    <HelpCircle className="h-4 w-4 text-orange-600" />
                                    <Link href="/help" className="hover:underline">FAQ / Help Center</Link>
                                </li>
                                <li className="flex items-center gap-2">
                                    <MessageSquare className="h-4 w-4 text-orange-600" />
                                    <Link href="/support" className="hover:underline">Ajukan Tiket Dukungan</Link>
                                </li>
                                <li className="flex items-center gap-2">
                                    <ShieldCheck className="h-4 w-4 text-orange-600" />
                                    <Link href="/policies/returns" className="hover:underline">Kebijakan Pengembalian</Link>
                                </li>
                            </ul>
                        </div>

                        <div className="rounded-2xl overflow-hidden border border-zinc-200 bg-white shadow-sm">
                            <div className="p-4">
                                <h3 className="text-sm font-semibold text-zinc-900">Lokasi</h3>
                                <p className="text-sm text-zinc-600">{COMPANY.address}</p>
                            </div>
                            <div className="aspect-[4/3] w-full">
                                <iframe title="Lokasi QuickCart" className="h-full w-full" loading="lazy"
                                    referrerPolicy="no-referrer-when-downgrade" src={gmSrc} />
                            </div>
                        </div>
                    </aside>
                </section>
            </main>

        </>
    );
}
