"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Image from "next/image";
import { assets } from "@/assets/assets";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { MapPin } from "lucide-react"; // di atas file


const LABELS = [
    { key: "home", text: "Rumah" },
    { key: "office", text: "Kantor" },
    { key: "other", text: "Lainnya" },
];

export default function AddAddress() {
    const router = useRouter();

    const [address, setAddress] = useState({
        labelKey: "home",
        labelName: "",
        fullName: "",
        phoneNumber: "",
        province: "",
        city: "",
        district: "",
        subdistrict: "",
        postalCode: "",
        addressLine: "",
        note: "",
        isDefault: true,
        lat: null,          // ← baru
        lng: null,          // ← baru
    });

    const [errors, setErrors] = useState({});

    const [locLoading, setLocLoading] = useState(false);

    const set = (k, v) => {
        if (typeof v === "function") {
            setAddress(prev => ({ ...prev, [k]: v(prev[k], prev) }));
        } else {
            setAddress(prev => ({ ...prev, [k]: v }));
        }
    };

    // Optional: tarik alamat dari koordinat (OpenStreetMap Nominatim).
    async function reverseGeocode(lat, lng) {
        try {
            const res = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`,
                { headers: { "Accept": "application/json" } }
            );
            if (!res.ok) return;
            const data = await res.json();
            const a = data?.address || {};
            setAddress(prev => ({
                ...prev,
                province: a.state || prev.province,
                city: a.city || a.town || a.village || prev.city,
                district: a.county || prev.district,
                subdistrict: a.suburb || a.neighbourhood || prev.subdistrict,
                postalCode: a.postcode || prev.postalCode,
                addressLine: data.display_name || prev.addressLine,
            }));
        } catch {/* no-op */ }
    }



    async function useCurrentLocation() {
        if (!("geolocation" in navigator)) return alert("Geolocation tidak tersedia");
        setLocLoading(true);
        navigator.geolocation.getCurrentPosition(async (pos) => {
            const { latitude, longitude } = pos.coords;
            setAddress(prev => ({
                ...prev,
                lat: latitude,
                lng: longitude,
                note: prev.note || `Koordinat: ${latitude.toFixed(5)}, ${longitude.toFixed(5)}`
            }));
            reverseGeocode(latitude, longitude);
            setLocLoading(false);
        }, (err) => {
            alert("Gagal mengambil lokasi: " + err.message);
            setLocLoading(false);
        }, { enableHighAccuracy: true, timeout: 10000 });
    }


    // tampilkan 3 alamat terbaru dari sessionStorage
    const [recent, setRecent] = useState([]);
    useEffect(() => {
        try {
            const book = JSON.parse(sessionStorage.getItem("addressBook") || "[]");
            setRecent(book.slice(0, 3));
        } catch { }
    }, []);

    function applySaved(a) {
        setAddress(s => ({
            ...s,
            ...a,
            labelKey: a.labelKey ?? s.labelKey,
            labelName: a.labelName ?? s.labelName,
        }));
    }


    const displayLabel = useMemo(() => {
        if (address.labelKey !== "other") {
            return LABELS.find(l => l.key === address.labelKey)?.text ?? "Rumah";
        }
        return address.labelName?.trim() || "Lainnya";
    }, [address.labelKey, address.labelName]);

    const validate = () => {
        const e = {};
        if (!address.fullName.trim()) e.fullName = "Nama penerima wajib diisi";
        if (!address.phoneNumber.trim()) e.phoneNumber = "Nomor telepon wajib diisi";
        if (!address.province.trim()) e.province = "Provinsi wajib diisi";
        if (!address.city.trim()) e.city = "Kota/Kabupaten wajib diisi";
        if (!address.district.trim()) e.district = "Kecamatan wajib diisi";
        if (!address.subdistrict.trim()) e.subdistrict = "Kelurahan/Desa wajib diisi";
        if (!address.postalCode.trim()) e.postalCode = "Kode pos wajib diisi";
        if (!address.addressLine.trim()) e.addressLine = "Detail alamat wajib diisi";
        if (address.labelKey === "other" && !address.labelName.trim())
            e.labelName = "Nama label diperlukan";
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const saveToSession = (mode = "use") => {
        const ok = validate();
        if (!ok) return;

        const entry = {
            id: `addr_${Date.now()}`,
            label: displayLabel,
            ...address,
        };

        // simpan ke buku alamat lokal
        try {
            const book = JSON.parse(sessionStorage.getItem("addressBook") || "[]");
            const nextBook = [entry, ...book];
            sessionStorage.setItem("addressBook", JSON.stringify(nextBook));
        } catch { }

        // inject ke draft checkout kalau ada
        try {
            const draft = JSON.parse(sessionStorage.getItem("checkoutDraft") || "{}");
            const next = { ...draft, address: entry };
            sessionStorage.setItem("checkoutDraft", JSON.stringify(next));
        } catch { }

        if (mode === "use") {
            router.push("/checkout?step=shipping");
        } else {
            router.back();
        }
    };

    return (
        <>
            <Navbar />

            <main className="px-6 md:px-16 lg:px-32 py-10">
                <h1 className="text-2xl md:text-3xl text-zinc-700">
                    Tambah <span className="font-semibold text-orange-600">Alamat Pengiriman</span>
                </h1>

                <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-10">
                    {/* Form */}
                    <section className="lg:col-span-8">
                        <div className="rounded-2xl border border-zinc-200 bg-white p-5 md:p-6 shadow-sm">
                            {/* Label Alamat */}
                            <div>
                                <label className="block text-sm font-medium text-zinc-800 mb-2">
                                    Label Alamat
                                </label>
                                <div className="flex flex-wrap gap-2">
                                    {LABELS.map((l) => (
                                        <button
                                            key={l.key}
                                            type="button"
                                            onClick={() => set("labelKey", l.key)}
                                            className={[
                                                "px-3 py-1.5 rounded-full border text-sm",
                                                address.labelKey === l.key
                                                    ? "border-orange-500 text-orange-600 bg-orange-50"
                                                    : "border-zinc-300 text-zinc-700 hover:border-zinc-400",
                                            ].join(" ")}
                                        >
                                            {l.text}
                                        </button>
                                    ))}
                                </div>
                                {address.labelKey === "other" && (
                                    <div className="mt-3">
                                        <input
                                            className={`w-full rounded-lg border px-3 py-2.5 text-sm placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-orange-500/30 ${errors.labelName ? "border-red-400" : "border-zinc-300"
                                                }`}
                                            placeholder="Contoh: Kos, Gudang, Apartemen A-12"
                                            value={address.labelName}
                                            onChange={(e) => set("labelName", e.target.value)}
                                        />
                                        {errors.labelName && (
                                            <p className="mt-1 text-xs text-red-500">{errors.labelName}</p>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Penerima */}
                            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div>
                                    <label htmlFor="fullName" className="block text-sm font-medium text-zinc-800 mb-1">
                                        Nama Penerima
                                    </label>
                                    <input
                                        id="fullName"
                                        autoComplete="name"
                                        className={`w-full rounded-lg border px-3 py-2.5 text-sm placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-orange-500/30 ${errors.fullName ? "border-red-400" : "border-zinc-300"
                                            }`}
                                        placeholder="Contoh: Imam Bagus"
                                        value={address.fullName}
                                        onChange={(e) => set("fullName", e.target.value)}
                                    />
                                    {errors.fullName && (
                                        <p className="mt-1 text-xs text-red-500">{errors.fullName}</p>
                                    )}
                                </div>
                                <div>
                                    <label htmlFor="phoneNumber" className="block text-sm font-medium text-zinc-800 mb-1">
                                        Nomor Telepon
                                    </label>
                                    <input
                                        id="phoneNumber"
                                        autoComplete="tel"
                                        inputMode="tel"
                                        className={`w-full rounded-lg border px-3 py-2.5 text-sm placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-orange-500/30 ${errors.phoneNumber ? "border-red-400" : "border-zinc-300"
                                            }`}
                                        placeholder="Contoh: 0812 3456 7890"
                                        value={address.phoneNumber}
                                        onChange={(e) => set("phoneNumber", e.target.value)}
                                    />
                                    {errors.phoneNumber && (
                                        <p className="mt-1 text-xs text-red-500">{errors.phoneNumber}</p>
                                    )}
                                </div>
                            </div>

                            {/* Wilayah */}
                            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div>
                                    <label htmlFor="province" className="block text-sm font-medium text-zinc-800 mb-1">
                                        Provinsi
                                    </label>
                                    <input
                                        id="province"
                                        autoComplete="address-level1"
                                        className={`w-full rounded-lg border px-3 py-2.5 text-sm placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-orange-500/30 ${errors.province ? "border-red-400" : "border-zinc-300"
                                            }`}
                                        placeholder="Pilih/isi Provinsi"
                                        value={address.province}
                                        onChange={(e) => set("province", e.target.value)}
                                    />
                                    {errors.province && (
                                        <p className="mt-1 text-xs text-red-500">{errors.province}</p>
                                    )}
                                </div>
                                <div>
                                    <label htmlFor="city" className="block text-sm font-medium text-zinc-800 mb-1">
                                        Kota/Kabupaten
                                    </label>
                                    <input
                                        id="city"
                                        autoComplete="address-level2"
                                        className={`w-full rounded-lg border px-3 py-2.5 text-sm placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-orange-500/30 ${errors.city ? "border-red-400" : "border-zinc-300"
                                            }`}
                                        placeholder="Pilih/isi Kota atau Kabupaten"
                                        value={address.city}
                                        onChange={(e) => set("city", e.target.value)}
                                    />
                                    {errors.city && (
                                        <p className="mt-1 text-xs text-red-500">{errors.city}</p>
                                    )}
                                </div>
                                <div>
                                    <label htmlFor="district" className="block text-sm font-medium text-zinc-800 mb-1">
                                        Kecamatan
                                    </label>
                                    <input
                                        id="district"
                                        autoComplete="address-level3"
                                        className={`w-full rounded-lg border px-3 py-2.5 text-sm placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-orange-500/30 ${errors.district ? "border-red-400" : "border-zinc-300"
                                            }`}
                                        placeholder="Isi Kecamatan"
                                        value={address.district}
                                        onChange={(e) => set("district", e.target.value)}
                                    />
                                    {errors.district && (
                                        <p className="mt-1 text-xs text-red-500">{errors.district}</p>
                                    )}
                                </div>
                                <div>
                                    <label htmlFor="subdistrict" className="block text-sm font-medium text-zinc-800 mb-1">
                                        Kelurahan/Desa
                                    </label>
                                    <input
                                        id="subdistrict"
                                        autoComplete="address-level4"
                                        className={`w-full rounded-lg border px-3 py-2.5 text-sm placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-orange-500/30 ${errors.subdistrict ? "border-red-400" : "border-zinc-300"
                                            }`}
                                        placeholder="Isi Kelurahan atau Desa"
                                        value={address.subdistrict}
                                        onChange={(e) => set("subdistrict", e.target.value)}
                                    />
                                    {errors.subdistrict && (
                                        <p className="mt-1 text-xs text-red-500">{errors.subdistrict}</p>
                                    )}
                                </div>
                                <div>
                                    <label htmlFor="postalCode" className="block text-sm font-medium text-zinc-800 mb-1">
                                        Kode Pos
                                    </label>
                                    <input
                                        id="postalCode"
                                        autoComplete="postal-code"
                                        inputMode="numeric"
                                        className={`w-full rounded-lg border px-3 py-2.5 text-sm placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-orange-500/30 ${errors.postalCode ? "border-red-400" : "border-zinc-300"
                                            }`}
                                        placeholder="Contoh: 12345"
                                        value={address.postalCode}
                                        onChange={(e) => set("postalCode", e.target.value)}
                                    />
                                    {errors.postalCode && (
                                        <p className="mt-1 text-xs text-red-500">{errors.postalCode}</p>
                                    )}
                                </div>
                            </div>

                            {/* Detail alamat & patokan */}
                            <div className="mt-6">
                                <label htmlFor="addressLine" className="block text-sm font-medium text-zinc-800 mb-1">
                                    Detail Alamat (Jalan, No, RT/RW)
                                </label>
                                <textarea
                                    id="addressLine"
                                    autoComplete="address-line1"
                                    rows={3}
                                    className={`w-full rounded-lg border px-3 py-2.5 text-sm placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-orange-500/30 ${errors.addressLine ? "border-red-400" : "border-zinc-300"
                                        }`}
                                    placeholder="Contoh: Jl. Melati No. 10, RT 01 / RW 02"
                                    value={address.addressLine}
                                    onChange={(e) => set("addressLine", e.target.value)}
                                />
                                {errors.addressLine && (
                                    <p className="mt-1 text-xs text-red-500">{errors.addressLine}</p>
                                )}
                            </div>

                            <div className="mt-4">
                                <label htmlFor="note" className="block text-sm font-medium text-zinc-800 mb-1">
                                    Patokan (opsional)
                                </label>
                                <input
                                    id="note"
                                    autoComplete="note"
                                    className="w-full rounded-lg border border-zinc-300 px-3 py-2.5 text-sm placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-orange-500/30"
                                    placeholder="Dekat masjid, gerbang hijau, dsb."
                                    value={address.note}
                                    onChange={(e) => set("note", e.target.value)}
                                />
                            </div>

                            {/* Default */}
                            <div className="mt-5">
                                <label htmlFor="isDefault" className="inline-flex items-center gap-2">
                                    <input
                                        id="isDefault"
                                        autoComplete="off"
                                        type="checkbox"
                                        checked={address.isDefault}
                                        onChange={(e) => set("isDefault", e.target.checked)}
                                        className="h-4 w-4 rounded border-2 border-zinc-400 text-orange-600 focus:ring-orange-500"
                                    />
                                    <span className="text-sm text-zinc-700">Jadikan sebagai alamat utama</span>
                                </label>
                            </div>

                            {/* Actions */}
                            <div className="mt-6 flex flex-wrap items-center gap-3">
                                <button
                                    type="button"
                                    onClick={() => saveToSession("use")}
                                    className="rounded-lg bg-orange-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-orange-700"
                                >
                                    Simpan & Pakai
                                </button>
                                <button
                                    type="button"
                                    onClick={() => saveToSession("save")}
                                    className="rounded-lg border px-5 py-2.5 text-sm"
                                >
                                    Simpan Saja
                                </button>
                                <button
                                    type="button"
                                    onClick={() => router.back()}
                                    className="text-sm text-zinc-600 hover:underline"
                                >
                                    Batal
                                </button>
                            </div>
                        </div>
                    </section>

                    <aside className="lg:col-span-4">
                        <div className="rounded-2xl border border-zinc-200 bg-white p-5 md:p-6 shadow-sm space-y-5">
                            {/* Aksi cepat */}
                            <div className="flex items-center justify-between">
                                <p className="text-sm font-semibold text-zinc-900">Bantuan Lokasi</p>
                                <button
                                    type="button"
                                    onClick={useCurrentLocation}
                                    disabled={locLoading}
                                    className="rounded-lg bg-orange-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-orange-700 disabled:opacity-60"
                                >
                                    {locLoading ? "Mengambil lokasi..." : "Gunakan lokasi saya"}
                                </button>

                            </div>

                            {/* Mini Map (pakai embed OSM, tidak perlu API key) */}
                            <div className={`relative overflow-hidden rounded-xl ${address.lat && address.lng ? "ring-1 ring-orange-100" : "border border-zinc-200"}`}>
                                <div className="aspect-[4/3] w-full">
                                    {address.lat && address.lng ? (
                                        <iframe
                                            title="Map preview"
                                            className="h-full w-full"
                                            src={`https://www.openstreetmap.org/export/embed.html?layer=mapnik&marker=${address.lat},${address.lng}&zoom=16`}
                                            loading="lazy"
                                            referrerPolicy="no-referrer-when-downgrade"
                                        />

                                    ) : (
                                        <div className="h-full w-full grid place-items-center p-6">
                                            <div className="text-center">
                                                <MapPin className="mx-auto mb-2 h-8 w-8 text-zinc-400" />
                                                <p className="text-sm text-zinc-700">Lokasi belum dipilih</p>
                                                <div className="mt-3 flex items-center justify-center gap-2">

                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Ringkasan singkat */}
                            <div className="rounded-xl border border-zinc-200 p-4">
                                <p className="text-sm font-semibold text-zinc-900">Ringkasan Alamat</p>
                                <div className="mt-2 text-xs text-zinc-700 space-y-1">
                                    <p><span className="text-zinc-500">Label:</span> {address.labelKey === "other" ? (address.labelName || "Lainnya") : (address.labelKey === "home" ? "Rumah" : "Kantor")}</p>
                                    <p><span className="text-zinc-500">Penerima:</span> {address.fullName || "—"}</p>
                                    <p><span className="text-zinc-500">Telp:</span> {address.phoneNumber || "—"}</p>
                                    <p className="line-clamp-3">
                                        <span className="text-zinc-500">Alamat:</span>{" "}
                                        {[
                                            address.addressLine,
                                            address.subdistrict,
                                            address.district,
                                            address.city,
                                            address.province,
                                            address.postalCode,
                                        ].filter(Boolean).join(", ") || "—"}
                                    </p>
                                    {address.lat && address.lng && (
                                        <p><span className="text-zinc-500">Koordinat:</span> {address.lat.toFixed(5)}, {address.lng.toFixed(5)}</p>
                                    )}
                                </div>
                            </div>

                            {/* Alamat tersimpan */}
                            <div className="rounded-xl border border-zinc-200 p-4">
                                <p className="text-sm font-semibold text-zinc-900">Alamat Tersimpan</p>
                                {recent.length === 0 ? (
                                    <p className="mt-2 text-xs text-zinc-600">Belum ada alamat tersimpan.</p>
                                ) : (
                                    <ul className="mt-2 space-y-3">
                                        {recent.map((a) => (
                                            <li key={a.id} className="flex items-start gap-2">
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-xs font-medium text-zinc-900 truncate">
                                                        {a.label || "Alamat"} — {a.fullName}
                                                    </p>
                                                    <p className="text-[11px] text-zinc-600 line-clamp-2">
                                                        {[
                                                            a.addressLine, a.subdistrict, a.district, a.city, a.province, a.postalCode
                                                        ].filter(Boolean).join(", ")}
                                                    </p>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => applySaved(a)}
                                                    className="shrink-0 rounded border px-2 py-1 text-[11px] hover:bg-zinc-50"
                                                >
                                                    Pakai
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>

                            <p className="text-[11px] text-zinc-500">
                                Tip: pakai “Gunakan lokasi saya” untuk mengurangi salah kirim & percepat input.
                            </p>
                        </div>
                    </aside>

                </div>
            </main>

            <Footer />
        </>
    );
}
