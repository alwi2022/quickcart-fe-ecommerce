"use client";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

function OrderSuccessContent() {
  const sp = useSearchParams();
  const oid = sp.get("oid");

  return (
    <>
      <Navbar />
      <main className="px-6 md:px-16 lg:px-32 py-16">
        <div className="max-w-xl mx-auto rounded-2xl border p-8 text-center bg-white">
          <h1 className="text-2xl font-semibold text-zinc-900">Order Placed!</h1>
          <p className="mt-2 text-zinc-600">
            Terima kasih. Pesananmu sudah kami terima.
            {oid && <> (ID: <span className="font-mono">{oid}</span>)</>}
          </p>
          <div className="mt-6 flex items-center justify-center gap-3">
            <Link href="/all-products" className="rounded-full border px-5 py-2 hover:bg-zinc-50">
              Belanja lagi
            </Link>
            <Link href="/my-orders" className="rounded-full bg-orange-600 text-white px-5 py-2 hover:bg-orange-700">
              Lihat pesanan
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

export default function OrderSuccess() {
  return (
    <Suspense fallback={null}>
      <OrderSuccessContent />
    </Suspense>
  );
}
