import { useAppContext } from "@/context/AppContext";
import React, { useEffect, useMemo, useState } from "react";

type AddressItem = {
  _id?: string;
  label?: string;
  receiver_name?: string;
  phone?: string;
  street?: string;
  subdistrict?: string;
  city?: string;
  province?: string;
  postal_code?: string;
  country?: string;
  is_default?: boolean;
};

export default function OrderSummary() {
  const {
    currency,
    router,
    getCartCount,
    getCartAmount,
    userData,
  } = useAppContext();

  const [selectedAddressId, setSelectedAddressId] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const addresses = useMemo(() => {
    const list = Array.isArray(userData?.addresses) ? (userData?.addresses as AddressItem[]) : [];
    return list;
  }, [userData?.addresses]);

  useEffect(() => {
    if (!addresses.length) {
      setSelectedAddressId("");
      return;
    }

    const defaultId = String(userData?.default_address_id || "");
    const fallbackId = String(addresses.find((a) => a.is_default)?._id || addresses[0]?._id || "");
    setSelectedAddressId(defaultId || fallbackId);
  }, [addresses, userData?.default_address_id]);

  const selectedAddress = useMemo(
    () => addresses.find((a) => String(a._id || "") === String(selectedAddressId || "")) || null,
    [addresses, selectedAddressId],
  );

  const createOrder = () => {
    if (getCartCount() <= 0) {
      router.push("/all-products");
      return;
    }

    if (!selectedAddress?._id) {
      alert("Tambahkan alamat pengiriman terlebih dahulu.");
      router.push("/add-address");
      return;
    }

    router.push(`/checkout?addressId=${encodeURIComponent(String(selectedAddress._id))}`);
  };

  const amount = getCartAmount();
  const tax = Math.floor(amount * 0.02);
  const total = amount + tax;

  return (
    <div className="w-full md:w-96 bg-gray-500/5 p-5">
      <h2 className="text-xl md:text-2xl font-medium text-gray-700">Ringkasan Pesanan</h2>
      <hr className="border-gray-500/30 my-5" />

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
                  ? `${selectedAddress.receiver_name}, ${selectedAddress.street}, ${selectedAddress.city}, ${selectedAddress.province}`
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
              <ul className="absolute z-10 mt-1 w-full bg-white border shadow-md py-1.5" role="listbox">
                {addresses.map((address) => {
                  const id = String(address._id || "");
                  const isSelected = id === String(selectedAddressId || "");
                  return (
                    <li
                      key={id}
                      role="option"
                      aria-selected={isSelected}
                      className="px-4 py-2 hover:bg-gray-500/10 cursor-pointer"
                      onClick={() => {
                        setSelectedAddressId(id);
                        setIsDropdownOpen(false);
                      }}
                    >
                      {address.receiver_name}, {address.street}, {address.city}, {address.province}
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

        <div>
          <label className="text-base font-medium uppercase text-gray-600 block mb-2">Kode Promo</label>
          <div className="flex flex-col items-start gap-3">
            <input
              type="text"
              placeholder="Masukkan kode promo"
              className="flex-grow w-full outline-none p-2.5 text-gray-600 border"
            />
            <button type="button" className="bg-orange-600 text-white px-9 py-2 hover:bg-orange-700">
              Terapkan
            </button>
          </div>
        </div>

        <hr className="border-gray-500/30 my-5" />

        <div className="space-y-4">
          <div className="flex justify-between text-base font-medium">
            <p className="uppercase text-gray-600">Item {getCartCount()}</p>
            <p className="text-gray-800">
              {currency}
              {amount}
            </p>
          </div>
          <div className="flex justify-between">
            <p className="text-gray-600">Ongkos Kirim</p>
            <p className="font-medium text-gray-800">{currency}0</p>
          </div>
          <div className="flex justify-between">
            <p className="text-gray-600">Pajak (2%)</p>
            <p className="font-medium text-gray-800">
              {currency}
              {tax}
            </p>
          </div>
          <div className="flex justify-between text-lg md:text-xl font-medium border-t pt-3">
            <p>Total</p>
            <p>
              {currency}
              {total}
            </p>
          </div>
        </div>
      </div>

      <button
        onClick={createOrder}
        type="button"
        className="w-full bg-orange-600 text-white py-3 mt-5 hover:bg-orange-700"
      >
        Lanjut ke Checkout
      </button>
    </div>
  );
}
