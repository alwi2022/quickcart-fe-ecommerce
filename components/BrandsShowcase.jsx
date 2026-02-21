
import Image from "next/image";
import Link from "next/link";
import { Truck, RotateCcw, Headphones, ShieldCheck } from "lucide-react";
import { assets } from "@/assets/assets";

const BRANDS = [
  { name: "HiTech", value: "HiTech", logo: assets.hitech_logo },
  { name: "Apple", value: "Apple", logo: assets.apple_logo },
  { name: "A4Tech", value: "A4Tech", logo: assets.a4tech_logo },
  { name: "Hitachi", value: "Hitachi", logo: assets.hitachi_logo },
  { name: "Huawei", value: "Huawei", logo: assets.huawei_logo },
  { name: "Sony", value: "Sony", logo: assets.sony_logo },
  { name: "IKEA", value: "IKEA", logo: assets.ikea_logo },
  { name: "HP", value: "HP", logo: assets.hp_logo },
];

function BrandCard({ name, logo, value }) {
  const initials = name.split(" ").map(w => w[0]).join("").slice(0, 3).toUpperCase();
  return (
    <Link
      href={`/all-products?brand=${encodeURIComponent(value ?? name)}`}
      className="group h-27 w-full rounded-xl bg-white ring-zinc-200 grid place-items-center transition
                 hover:ring-zinc-300 hover:shadow-sm"
      aria-label={name}
    >
      <div className="relative h-16 w-24">
        {logo ? (
          <Image
            src={logo}
            alt={name}
            loading="lazy"
            fill
            className="object-contain"
            sizes="112px"
          />
        ) : (
          <div className="h-full w-full grid place-items-center rounded-lg bg-zinc-100 text-zinc-600 font-semibold">
            {initials}
          </div>
        )}
      </div>
    </Link>
  );
}

function Perk({ icon: Icon, title, desc }) {
  return (
    <div className="flex items-center gap-3 p-4">
      <Icon className="h-8 w-8 text-zinc-700" />
      <div>
        <p className="font-semibold text-zinc-800">{title}</p>
        <p className="text-sm text-zinc-600">{desc}</p>
      </div>
    </div>
  );
}

export default function BrandsShowcase() {
  return (
    <section className="mt-10 rounded-2xl bg-zinc-50 ring-1 ring-zinc-200 p-5 md:p-6">
      <div className="mb-4 flex items-center ">
        <h2 className="text-2xl font-semibold tracking-tight text-zinc-900">
          Belanja berdasarkan Merek
        </h2>

      </div>

      {/* Brands row (wrap di desktop, scroll di mobile) */}
      <div className="overflow-x-auto">
        <div className="flex gap-4 min-w-max md:min-w-0 md:grid md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8">
          {BRANDS.map((b) => (
            <BrandCard key={b.name} name={b.name} logo={b.logo} />
          ))}
        </div>
      </div>

      {/* Perks bar */}
      <div className="mt-6 rounded-xl shadow-sm  ">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4  divide-zinc-200">
          <Perk icon={Truck} title="Gratis Ongkir" desc="Gratis ongkir di atas 1 juta" />
          <Perk icon={RotateCcw} title="Retur Mudah" desc="Garansi 30 hari" />
          <Perk icon={Headphones} title="Dukungan 24/7" desc="Tim support ramah" />
          <Perk icon={ShieldCheck} title="Uang Kembali Terjamin" desc="Kualitas terverifikasi tim kami" />
        </div>
      </div>
    </section>
  );
}
