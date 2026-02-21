"use client";

import React, { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import Loading from "@/components/Loading";
import { useAppContext } from "@/context/AppContext";
import { assets } from "@/assets/assets";

export default function Product() {
    const { id } = useParams();
    const { products, router, addToCart } = useAppContext();

    const [mainImage, setMainImage] = useState(null);
    const [productData, setProductData] = useState(null);
    const [qty, setQty] = useState(1);
    const [activeTab, setActiveTab] = useState("review"); // default buka Review biar sesuai screenshot


    const [selectedVariant, setSelectedVariant] = useState(null);

    const variantConfig = useMemo(() => {
        if (!productData) return { label: "Variant", options: [] };

        // gabungkan beberapa field untuk deteksi yang lebih akurat
        const src = [
            productData.category,
            productData.subcategory,
            productData.name,
        ]
            .filter(Boolean)
            .join(" ")
            .toLowerCase();

        // kalau produk sudah menyediakan variant sendiri, pakai ini dulu
        if (Array.isArray(productData.variantOptions) && productData.variantOptions.length) {
            return {
                label: productData.variantLabel || "Variant",
                options: productData.variantOptions,
            };
        }

        // regex: audio harus dicek dulu supaya "headphone" tidak kena 'phone'
        const isAudio = /\b(headphone|headset|earbuds?|earphone|tws|audio)\b/.test(src);
        const isConsole = /\b(console|controller|playstation|xbox|switch)\b/.test(src);
        const isCamera = /\b(camera|dslr|mirrorless|lens|lensa)\b/.test(src);
        const isWatch = /\b(smart ?watch|watch)\b/.test(src);
        const isLaptop = /\b(laptop|macbook)\b/.test(src);
        // phone diset belakangan dan dipastikan bukan audio
        const isPhone = /\b(smart ?phone|handphone|mobile|android|iphone)\b/.test(src) && !isAudio;

        if (isAudio) {
            return {
                label: "Connectivity",
                options: productData.typeOptions || ["Bluetooth", "Bluetooth + ANC"],
            };
        }
        if (isConsole) {
            return {
                label: "Bundle",
                options: productData.bundleOptions || ["Standard", "Digital Edition", "With 2nd Controller"],
            };
        }
        if (isCamera) {
            return {
                label: "Lens Kit",
                options: productData.kitOptions || ["Body Only", "18–55mm Kit", "18–135mm Kit"],
            };
        }
        if (isWatch) {
            return {
                label: "Size",
                options: productData.sizeOptions || ["41mm", "45mm"],
            };
        }
        if (isLaptop) {
            return {
                label: "Configuration",
                options: productData.configOptions || ["8GB / 256GB", "16GB / 512GB", "32GB / 1TB"],
            };
        }
        if (isPhone) {
            return {
                label: "Storage",
                options: productData.storageOptions || ["128GB", "256GB", "512GB"],
            };
        }

        // fallback umum
        return { label: "Variant", options: [] };
    }, [productData]);


    // auto-select opsi pertama
    useEffect(() => {
        setSelectedVariant(variantConfig.options?.[0] ?? null);
    }, [variantConfig]);

    useEffect(() => {
        const p = products.find((x) => x._id === id);
        setProductData(p || null);
    }, [id, products]);

    // fallback & computed fields
    const meta = useMemo(() => {
        if (!productData) return null;
        const brand = productData.brand || "Xiaomi";
        const sku = productData.sku || "FHTR546";
        const stock = Number.isFinite(productData.stock) ? productData.stock : 36; // fallback
        const category = productData.category || "Smartphones";
        const price = Number(productData.price) || 0;
        const offer = Number(productData.offerPrice) || price;
        const discount =
            price > 0 ? Math.max(0, Math.round((1 - offer / price) * 100)) : 0;

        const rating = Number(productData.rating ?? 4.5);
        const ratingCount = Number(productData.ratingCount ?? 1);

        return { brand, sku, stock, category, price, offer, discount, rating, ratingCount };
    }, [productData]);

    const inc = () => setQty((q) => Math.min(q + 1, meta?.stock ?? 1));
    const dec = () => setQty((q) => Math.max(1, q - 1));

    const handleAddToCart = () => {
        if (!productData) return;
        // kompatibel jika context belum support qty: ulangi pemanggilan sebanyak qty
        for (let i = 0; i < qty; i++) addToCart(productData._id);
    };

    const handleBuyNow = () => {
        handleAddToCart();
        router.push("/cart");
    };

    if (!productData || !meta) return <Loading />;

    const tabs = [
        { key: "description", label: "DESKRIPSI" },
        { key: "additional", label: "INFORMASI TAMBAHAN" },
        { key: "spec", label: "SPESIFIKASI" },
        { key: "review", label: "ULASAN" },
    ]

    return (
        <>
            <Navbar />
            <div className="px-6 md:px-16 lg:px-32 pt-14 space-y-10">
                {/* TOP */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
                    {/* gallery */}
                    <div className="px-5 lg:px-16 xl:px-20">
                        <div className="rounded-lg overflow-hidden bg-gray-500/10 mb-4">
                            <Image
                                src={mainImage || productData.image[0]}
                                alt="alt"
                                className="w-full h-auto object-cover mix-blend-multiply"
                                width={1280}
                                height={720}
                            />
                        </div>

                        <div className="grid grid-cols-4 gap-4">
                            {productData.image.map((image, index) => (
                                <div
                                    key={index}
                                    onClick={() => setMainImage(image)}
                                    className="cursor-pointer rounded-lg overflow-hidden bg-gray-500/10"
                                >
                                    <Image
                                        src={image}
                                        alt="alt"
                                        className="w-full h-auto object-cover mix-blend-multiply"
                                        width={1280}
                                        height={720}
                                    />
                                </div>

                            ))}
                        </div>
                    </div>

                    {/* details */}
                    <div className="flex flex-col">
                        {/* rating + title */}
                        <div className="flex items-center gap-2 text-sm text-gray-700">
                            <div className="flex items-center gap-0.5">
                                <Image src={assets.star_icon} alt="" className="h-4 w-4" />
                                <Image src={assets.star_icon} alt="" className="h-4 w-4" />
                                <Image src={assets.star_icon} alt="" className="h-4 w-4" />
                                <Image src={assets.star_icon} alt="" className="h-4 w-4" />
                                <Image src={assets.star_dull_icon} alt="" className="h-4 w-4" />
                            </div>
                            <span>
                                <strong>{meta.rating.toFixed(1)}</strong> Rating{" "}
                                <span className="text-gray-500">({meta.ratingCount} user feedback)</span>
                            </span>
                        </div>

                        <h1 className="mt-1 text-2xl md:text-3xl font-semibold text-gray-900">
                            {productData.name}

                        </h1>
                        {/* Meta rows */}
                        <div className="mt-4 grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
                            <div className="flex gap-2">
                                <span className="w-24 text-gray-500">SKU:</span>
                                <span className="font-medium text-gray-800">{meta.sku}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="w-24 text-gray-500">Stok:</span>
                                <span
                                    className={`inline-flex items-center rounded px-2 py-0.5 text-xs font-semibold ${meta.stock > 0 ? "bg-orange-600 text-white" : "bg-gray-300 text-gray-700"
                                        }`}
                                >
                                    {meta.stock > 0 ? "Tersedia" : "Habis"}
                                </span>
                            </div>
                            <div className="flex gap-2">
                                <span className="w-24 text-gray-500">Brand:</span>
                                <span className="font-medium text-gray-800">{meta.brand}</span>
                            </div>
                            <div className="flex gap-2">
                                <span className="w-24 text-gray-500">Kategori:</span>
                                <span className="font-medium text-gray-800">{meta.category}</span>
                            </div>
                        </div>

                        {/* price */}
                        <div className="mt-5 flex items-end gap-4">
                            <p className="text-3xl font-semibold text-gray-900">${meta.offer.toFixed(2)}</p>
                            {meta.price > meta.offer && (
                                <p className="text-lg text-gray-500 line-through">${meta.price.toFixed(2)}</p>
                            )}
                        </div>

                        {/* qty & actions */}
                        {variantConfig.options.length > 0 && (
                            <div className="mt-6">
                                <p className="text-sm text-gray-600 mb-2">{variantConfig.label}</p>
                                <div className="flex flex-wrap gap-2">
                                    {variantConfig.options.map((opt) => (
                                        <button
                                            key={opt}
                                            onClick={() => setSelectedVariant(opt)}
                                            className={[
                                                "px-3 py-1.5 rounded border text-sm transition",
                                                selectedVariant === opt
                                                    ? "border-orange-500 text-orange-600 bg-orange-50"
                                                    : "border-gray-300 text-gray-700 hover:border-gray-400"
                                            ].join(" ")}
                                            type="button"
                                        >
                                            {opt}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}


                        <div className="mt-4 flex flex-wrap items-center gap-4">
                            {/* stepper */}
                            <div className="flex items-center rounded border border-gray-300">
                                <button
                                    onClick={dec}
                                    className="h-12 w-12 text-xl hover:bg-gray-50 disabled:opacity-40"
                                    disabled={qty <= 1}
                                    aria-label="Kurangi jumlah"
                                    type="button"
                                >
                                    –
                                </button>
                                <div className="h-12 w-16 flex items-center justify-center border-x border-gray-300">
                                    {qty}
                                </div>
                                <button
                                    onClick={inc}
                                    className="h-12 w-12 text-xl hover:bg-gray-50 disabled:opacity-40"
                                    disabled={qty >= meta.stock}
                                    aria-label="Tambahkan jumlah"
                                    type="button"
                                >
                                    +
                                </button>
                            </div>

                            <button
                                onClick={handleAddToCart}
                                disabled={meta.stock <= 0}
                                className="w-full sm:w-auto px-8 h-12 bg-orange-500 text-white font-medium rounded hover:bg-orange-600 disabled:opacity-50"
                            >
                                TAMBAH KE KERANJANG
                            </button>

                            <button
                                onClick={handleBuyNow}
                                disabled={meta.stock <= 0}
                                className="w-full sm:w-auto px-8 h-12 border border-orange-500 text-orange-600 font-medium rounded hover:bg-orange-50 disabled:opacity-50"
                            >
                                BELI SEKARANG
                            </button>
                        </div>

                        <div className="mt-5 text-sm text-gray-600">
                            100% Garansi Aman
                        </div>
                    </div>
                </div>

                {/* TABS */}
                <div className="mt-10">
                    <div className="flex flex-wrap gap-6 border-b">
                        {tabs.map((t) => (
                            <button
                                key={t.key}
                                onClick={() => setActiveTab(t.key)}
                                className={`-mb-px pb-3 text-sm font-semibold tracking-wide ${activeTab === t.key
                                    ? "border-b-2 border-orange-500 text-orange-600"
                                    : "text-gray-500 hover:text-gray-700"
                                    }`}
                            >
                                {t.label}
                            </button>
                        ))}
                    </div>

                    {/* tab content */}
                    <div className="bg-white">
                        {activeTab === "description" && (
                            <div className="py-6 text-gray-700 leading-7">
                                {productData.longDescription ||
                                    productData.description ||
                                    "Deskripsi produk tidak tersedia."}
                            </div>
                        )}

                        {activeTab === "additional" && (
                            <div className="py-6">
                                <table className="table-auto text-sm">
                                    <tbody className="text-gray-700">
                                        <tr>
                                            <td className="py-2 pr-8 text-gray-500">Berat</td>
                                            <td>{productData.weight ?? "—"}</td>
                                        </tr>
                                        <tr>
                                            <td className="py-2 pr-8 text-gray-500">Dimensi</td>
                                            <td>{productData.dimensions ?? "—"}</td>
                                        </tr>
                                        <tr>
                                            <td className="py-2 pr-8 text-gray-500">Warna</td>
                                            <td>{productData.color ?? "Black"}</td>
                                        </tr>
                                        <tr>
                                            <td className="py-2 pr-8 text-gray-500">Garansi</td>
                                            <td>{productData.warranty ?? "Official warranty available"}</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {activeTab === "spec" && (
                            <div className="py-6">
                                <ul className="list-disc pl-6 text-gray-700 space-y-2">
                                    {(productData.specification || productData.specs || []).length > 0 ? (
                                        (productData.specification || productData.specs).map((s, i) => (
                                            <li key={i}>{s}</li>
                                        ))
                                    ) : (
                                        <>
                                            <li>Layar: 6.7&quot; FHD+ AMOLED 120Hz</li>
                                            <li>Memori: 8GB RAM / 256GB Penyimpanan</li>
                                            <li>Kamera: Triple 108MP</li>
                                            <li>Baterai: 5000mAh dengan Fast Charging</li>
                                            <li>Konektivitas: 5G, Bluetooth 5.3, NFC</li>
                                        </>
                                    )}
                                </ul>
                            </div>
                        )}

                        {activeTab === "review" && (
                            <div className="py-6">
                                {/* Add review box */}
                                <div className="border rounded p-4">
                                    <textarea
                                        placeholder="Tulis ulasan Anda di sini"
                                        className="w-full h-28 resize-none outline-none"
                                        disabled
                                    />
                                    <div className="flex items-center gap-2 mt-2">
                                        <div className="flex items-center gap-1">
                                            <Image src={assets.star_icon} alt="" className="h-5 w-5" />
                                            <Image src={assets.star_icon} alt="" className="h-5 w-5" />
                                            <Image src={assets.star_icon} alt="" className="h-5 w-5" />
                                            <Image src={assets.star_icon} alt="" className="h-5 w-5" />
                                            <Image src={assets.star_dull_icon} alt="" className="h-5 w-5" />
                                        </div>
                                        <button
                                            disabled
                                            className="ml-auto inline-flex items-center gap-2 rounded bg-amber-700 px-4 py-2 text-white opacity-70"
                                        >
                                            LOGIN UNTUK MEMBERI KOMENTAR
                                        </button>
                                    </div>
                                </div>

                                {/* Average */}
                                <div className="mt-6 text-sm text-gray-700">
                                    <div className="flex items-center gap-2">
                                        <div className="flex items-center gap-0.5">
                                            <Image src={assets.star_icon} alt="" className="h-4 w-4" />
                                            <Image src={assets.star_icon} alt="" className="h-4 w-4" />
                                            <Image src={assets.star_icon} alt="" className="h-4 w-4" />
                                            <Image src={assets.star_icon} alt="" className="h-4 w-4" />
                                            <Image src={assets.star_dull_icon} alt="" className="h-4 w-4" />
                                        </div>
                                        <span className="font-semibold">{meta.rating.toFixed(1)}</span>
                                        <span className="text-gray-500">({meta.ratingCount} ulasan)</span>
                                    </div>
                                </div>

                                {/* Reviews list (mock / from data if ada) */}
                                <div className="mt-4 space-y-4">
                                    {(productData.reviews || [
                                        {
                                            user: "sylvaincodes sylvain",
                                            rating: 5,
                                            text: "handphone bagus",
                                            by: "Orion",
                                            date: "Tue Dec 24 2024",
                                            avatar: assets.user_icon || assets.profile_icon || assets.logo,
                                        },
                                    ]).map((r, i) => (
                                        <div key={i} className="border-t pt-4">
                                            <div className="flex items-center gap-3">
                                                <Image
                                                    src={r.avatar}
                                                    alt={r.user}
                                                    width={36}
                                                    height={36}
                                                    className="h-9 w-9 rounded-full object-cover"
                                                />
                                                <div className="font-medium text-gray-800">{r.user}</div>
                                            </div>
                                            <div className="mt-2 flex items-center gap-2 text-sm text-gray-600">
                                                <div className="flex items-center gap-0.5">
                                                    {Array.from({ length: 5 }).map((_, idx) => (
                                                        <Image
                                                            key={idx}
                                                            src={idx < (r.rating ?? 5) ? assets.star_icon : assets.star_dull_icon}
                                                            alt=""
                                                            className="h-4 w-4"
                                                        />
                                                    ))}
                                                </div>
                                                <span>{r.text}</span>
                                            </div>
                                            <div className="mt-2 text-xs text-gray-500">
                                                Ulasan oleh <span className="font-medium">{r.by}</span> • Dikirim pada{" "}
                                                {r.date}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* FEATURED */}
                <div className="flex flex-col items-center">
                    <div className="flex flex-col items-center mb-4 mt-16">
                        <p className="text-3xl font-medium">
                            Produk <span className="text-orange-600">Terbaru</span>
                        </p>
                        <div className="w-28 h-0.5 bg-orange-600 mt-2" />
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 mt-6 pb-14 w-full">
                        {products.slice(0, 5).map((p, idx) => (
                            <ProductCard key={idx} product={p} />
                        ))}
                    </div>
                    <button
                        onClick={() => router.push("/all-products")}
                        className="px-8 py-2 mb-16 border rounded text-gray-600 hover:bg-slate-50"
                    >
                        Lihat lebih banyak
                    </button>
                </div>
            </div>
            <Footer />
        </>
    );
}



