// components/OrderSummary.jsx
import { addressDummyData } from "@/assets/assets";
import { useAppContext } from "@/context/AppContext";
import React, { useEffect, useState } from "react";

export default function OrderSummary() {
  const {
    currency,
    router,
    getCartCount,
    getCartAmount,
    products = [],
    cartItems = {},
  } = useAppContext();

  const [selectedAddress, setSelectedAddress] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [userAddresses, setUserAddresses] = useState([]);

  useEffect(() => {
    setUserAddresses(addressDummyData);
  }, []);

  const handleAddressSelect = (address) => {
    setSelectedAddress(address);
    setIsDropdownOpen(false);
  };

  const createOrder = () => {
    if (!selectedAddress) {
      alert("Pilih alamat terlebih dahulu.");
      return;
    }

    const items = Object.entries(cartItems)
      .map(([id, qty]) => {
        const p = products.find((x) => x._id === id);
        if (!p || qty <= 0) return null;
        const price = Number(p.offerPrice ?? p.price ?? 0);
        return {
          productId: id,
          name: p.name,
          image: p.image?.[0],
          brand: p.brand ?? "Generic",
          category: p.category ?? "Lainnya",
          price,
          qty,
          subtotal: price * qty,
        };
      })
      .filter(Boolean);

    if (items.length === 0) {
      router.push("/all-products");
      return;
    }

    const subtotal = items.reduce((a, b) => a + b.subtotal, 0);
    const shipping = 0;
    const tax = Math.floor(subtotal * 0.02);
    const total = subtotal + shipping + tax;

    const draft = {
      id: `tmp_${Date.now()}`,
      items,
      currency,
      subtotal,
      shipping,
      tax,
      total,
      address: selectedAddress,
      createdAt: new Date().toISOString(),
    };

    if (typeof window !== "undefined") {
      sessionStorage.setItem("checkoutDraft", JSON.stringify(draft));
    }
    router.push("/checkout");
  };

  return (
    <div className="w-full md:w-96 bg-gray-500/5 p-5">
      <h2 className="text-xl md:text-2xl font-medium text-gray-700">Ringkasan Pesanan</h2>
      <hr className="border-gray-500/30 my-5" />

      {/* Alamat */}
      <div className="space-y-6">
        <div>
          <label className="text-base font-medium uppercase text-gray-600 block mb-2">
            Pilih Alamat
          </label>

          <div className="relative inline-block w-full text-sm border">
            <button
              type="button"
              className="peer w-full text-left px-4 pr-2 py-2 bg-white text-gray-700 focus:outline-none"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              aria-haspopup="listbox"
              aria-expanded={isDropdownOpen}
            >
              <span>
                {selectedAddress
                  ? `${selectedAddress.fullName}, ${selectedAddress.area}, ${selectedAddress.city}, ${selectedAddress.state}`
                  : "Pilih Alamat"}
              </span>
              <svg
                className={`w-5 h-5 inline float-right transition-transform duration-200 ${
                  isDropdownOpen ? "rotate-0" : "-rotate-90"
                }`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="#6B7280"
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {isDropdownOpen && (
              <ul
                className="absolute z-10 mt-1 w-full bg-white border shadow-md py-1.5"
                role="listbox"
              >
                {userAddresses.map((address, index) => {
                  const isSelected =
                    selectedAddress &&
                    selectedAddress.fullName === address.fullName &&
                    selectedAddress.area === address.area;
                  return (
                    <li
                      key={index}
                      role="option"
                      aria-selected={isSelected}
                      className="px-4 py-2 hover:bg-gray-500/10 cursor-pointer"
                      onClick={() => handleAddressSelect(address)}
                    >
                      {address.fullName}, {address.area}, {address.city}, {address.state}
                    </li>
                  );
                })}
                <li
                  onClick={() => router.push("/add-address")}
                  className="px-4 py-2 hover:bg-gray-500/10 cursor-pointer text-center"
                >
                  + Tambah Alamat Baru
                </li>
              </ul>
            )}
          </div>
        </div>

        {/* Promo */}
        <div>
          <label className="text-base font-medium uppercase text-gray-600 block mb-2">
            Kode Promo
          </label>
          <div className="flex flex-col items-start gap-3">
            <input
              type="text"
              placeholder="Masukkan kode promo"
              className="flex-grow w-full outline-none p-2.5 text-gray-600 border"
            />
            <button
              type="button"
              className="bg-orange-600 text-white px-9 py-2 hover:bg-orange-700"
            >
              Terapkan
            </button>
          </div>
        </div>

        <hr className="border-gray-500/30 my-5" />

        {/* Total */}
        <div className="space-y-4">
          <div className="flex justify-between text-base font-medium">
            <p className="uppercase text-gray-600">Item {getCartCount()}</p>
            <p className="text-gray-800">
              {currency}
              {getCartAmount()}
            </p>
          </div>
          <div className="flex justify-between">
            <p className="text-gray-600">Ongkos Kirim</p>
            <p className="font-medium text-gray-800">Gratis</p>
          </div>
          <div className="flex justify-between">
            <p className="text-gray-600">Pajak (2%)</p>
            <p className="font-medium text-gray-800">
              {currency}
              {Math.floor(getCartAmount() * 0.02)}
            </p>
          </div>
          <div className="flex justify-between text-lg md:text-xl font-medium border-t pt-3">
            <p>Total</p>
            <p>
              {currency}
              {getCartAmount() + Math.floor(getCartAmount() * 0.02)}
            </p>
          </div>
        </div>
      </div>

      <button
        onClick={createOrder}
        type="button"
        className="w-full bg-orange-600 text-white py-3 mt-5 hover:bg-orange-700"
      >
        Buat Pesanan
      </button>
    </div>
  );
}
