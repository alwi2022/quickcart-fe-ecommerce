// components/ProductCard.jsx
"use client";

import React from "react";
import { assets } from "@/assets/assets";
import Image from "next/image";
import { useAppContext } from "@/context/AppContext";

const ProductCard = ({ product }) => {
  const { currency, router } = useAppContext();

  return (
    <div
      onClick={() => {
        router.push("/product/" + product._id);
        scrollTo(0, 0);
      }}
      className="flex flex-col items-start gap-0.5 max-w-[200px] w-full cursor-pointer"
    >
      <div className="cursor-pointer group relative bg-gray-500/10 rounded-lg w-full h-52 flex items-center justify-center">
        <Image
          src={product.image[0]}
          alt={product.name}
          className="group-hover:scale-105 transition object-cover w-4/5 h-4/5 md:w-full md:h-full"
          width={800}
          height={800}
          loading="lazy"
          sizes="(max-width: 768px) 45vw, (max-width: 1024px) 25vw, 200px"
        />
        <button
          className="absolute top-2 right-2 bg-white p-2 rounded-full shadow-md"
          aria-label="Tambah ke favorit"
          type="button"
          onClick={(e) => e.stopPropagation()}
        >
          <Image
            className="h-3 w-3"
            src={assets.heart_icon}
            alt="ikon favorit"
            width={12}
            height={12}
            loading="lazy"
          />
        </button>
      </div>

      <p className="md:text-base font-medium pt-2 w-full truncate">{product.name}</p>
      <p className="w-full text-xs text-gray-500/70 max-sm:hidden truncate">
        {product.description}
      </p>

      <div className="flex items-center gap-2">
        <p className="text-xs">{4.5}</p>
        <div className="flex items-center gap-0.5">
          {Array.from({ length: 5 }).map((_, index) => (
            <Image
              key={index}
              className="h-3 w-3"
              src={index < Math.floor(4) ? assets.star_icon : assets.star_dull_icon}
              alt="ikon bintang"
              width={12}
              height={12}
              loading="lazy"
            />
          ))}
        </div>
      </div>

      <div className="flex items-end justify-between w-full mt-1">
        <p className="text-base font-medium">
          {currency}
          {product.offerPrice}
        </p>
        <button
          className="max-sm:hidden px-4 py-1.5 text-gray-500 border border-gray-500/20 rounded-full text-xs hover:bg-slate-50 transition"
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            router.push("/product/" + product._id);
          }}
        >
          Beli sekarang
        </button>
      </div>
    </div>
  );
};

export default ProductCard;
