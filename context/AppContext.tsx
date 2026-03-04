'use client';

import { useRouter } from "next/navigation";
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from "react";

type Product = {
  _id: string;
  id?: string;
  name: string;
  title?: string;
  description?: string;
  price?: number;
  offerPrice?: number;
  image: string[];
  brand?: string;
  category?: string;
  rating?: number;
  ratingCount?: number;
  [key: string]: any;
};

type ProductApiItem = {
  _id?: string;
  id?: string;
  slug?: string;
  name?: string;
  title?: string;
  description?: string;
  subtitle?: string;
  price?: number | string;
  offerPrice?: number | string;
  image?: string[];
  media?: Array<{ url?: string }>;
  brand?: string;
  brandName?: string;
  category?: string;
  categoryNames?: string[];
  rating?: number | { avg?: number; count?: number };
  ratingCount?: number | string;
};

type UserAddress = {
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
  geo?: { lat?: number; lng?: number };
};

type UserData = {
  _id?: string;
  name?: string;
  email?: string;
  phone?: string;
  gender?: string;
  birthday?: string;
  roles?: string[];
  status?: string;
  addresses?: UserAddress[];
  default_address_id?: string | null;
  [key: string]: any;
};

type CartItems = Record<string, number>;

type AppContextValue = {
  currency: string;
  router: ReturnType<typeof useRouter>;
  authReady: boolean;
  isAuthenticated: boolean;
  isSeller: boolean;
  setIsSeller: Dispatch<SetStateAction<boolean>>;
  roles: string[];
  user: UserData | null;
  userData: UserData | null;
  wishlist: any[];
  favorites: any[];
  saved: any[];
  orders: any[];
  updateUser: (next: Partial<UserData>) => void;
  removeFromWishlist: (id: string) => void;
  toggleWishlist: (item: any) => void;
  clearWishlist: () => void;
  fetchUserData: () => Promise<void>;
  products: Product[];
  fetchProductData: () => Promise<void>;
  cart: any[];
  basket: any[];
  cartItems: CartItems;
  setCartItems: Dispatch<SetStateAction<CartItems>>;
  addToCart: (itemId: string, qty?: number) => Promise<void>;
  updateCartQuantity: (itemId: string, quantity: number) => Promise<void>;
  getCartCount: () => number;
  getCartAmount: () => number;
};

const AppContext = createContext<AppContextValue | null>(null);

export const useAppContext = (): AppContextValue => {
  const ctx = useContext(AppContext);
  if (!ctx) {
    throw new Error("useAppContext must be used within AppContextProvider");
  }
  return ctx;
};

type AppContextProviderProps = {
  children: ReactNode;
};

type CartApiItem = {
  productId?: string;
  qty?: number;
};

type ProductsApiResponse = {
  items?: ProductApiItem[];
  pages?: number;
};

const FALLBACK_PRODUCT_IMAGE =
  "https://raw.githubusercontent.com/avinashdm/gs-images/main/quickcart/m16coelz8ivkk9f0nwrz.webp";

function toNumber(value: unknown, fallback = 0): number {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function normalizeProduct(raw: ProductApiItem): Product {
  const images = (Array.isArray(raw?.image) ? raw.image : Array.isArray(raw?.media) ? raw.media.map((m) => m?.url || "") : [])
    .map((url) => String(url || "").trim())
    .filter(Boolean);

  const ratingValue =
    typeof raw?.rating === "number" ? toNumber(raw.rating, 0) : toNumber(raw?.rating?.avg, 0);
  const ratingCount =
    typeof raw?.rating === "number" ? toNumber(raw?.ratingCount, 0) : toNumber(raw?.rating?.count ?? raw?.ratingCount, 0);

  const listPrice = toNumber(raw?.price, 0);
  const salePrice = toNumber(raw?.offerPrice, listPrice);
  const brand = String(raw?.brand || raw?.brandName || "").trim();
  const category =
    String(raw?.category || "").trim() ||
    (Array.isArray(raw?.categoryNames) && raw.categoryNames.length ? String(raw.categoryNames[0]) : "");

  return {
    ...raw,
    _id: String(raw?._id || raw?.id || ""),
    name: String(raw?.name || raw?.title || "Produk"),
    title: String(raw?.title || raw?.name || "Produk"),
    description: String(raw?.description || raw?.subtitle || "").trim(),
    price: listPrice,
    offerPrice: salePrice > 0 ? salePrice : listPrice,
    image: images.length ? images : [FALLBACK_PRODUCT_IMAGE],
    brand: brand || "Generic",
    category: category || "Lainnya",
    rating: ratingValue > 0 ? ratingValue : 4.5,
    ratingCount: ratingCount > 0 ? ratingCount : 1,
  };
}

function safeParseJson<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export const AppContextProvider = ({ children }: AppContextProviderProps) => {
  const WISHLIST_KEY = "wishlist";
  const CART_KEY = "cartItems";
  const currency = "Rp";
  const router = useRouter();

  const [products, setProducts] = useState<Product[]>([]);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [isSeller, setIsSeller] = useState(false);

  const [wishlist, setWishlist] = useState<any[]>([]);
  const favorites = wishlist;
  const saved = wishlist;

  const [orders] = useState<any[]>([]);
  const [cart] = useState<any[]>([]);
  const [basket] = useState<any[]>([]);
  const [cartItems, setCartItems] = useState<CartItems>({});

  const isAuthenticated = Boolean(userData?._id);

  const productMap = useMemo(
    () => new Map((Array.isArray(products) ? products : []).map((p) => [String(p?._id), p])),
    [products],
  );

  const getWishId = (item: any): string => {
    if (!item) return "";
    if (typeof item === "string") return item;
    return String(item._id ?? item.id ?? "");
  };

  const readLocalCart = (): CartItems => {
    const raw = safeParseJson<Record<string, unknown>>(localStorage.getItem(CART_KEY), {});
    const next: CartItems = {};
    Object.entries(raw).forEach(([key, value]) => {
      const qty = Number(value || 0);
      if (qty > 0) next[key] = qty;
    });
    return next;
  };

  const readLocalWishlist = (): string[] => {
    const raw = safeParseJson<any[]>(localStorage.getItem(WISHLIST_KEY), []);
    if (!Array.isArray(raw)) return [];
    return raw.map((entry) => getWishId(entry)).filter(Boolean);
  };

  const fetchProductData = async () => {
    try {
      const allRows: ProductApiItem[] = [];
      let page = 1;
      let pages = 1;

      do {
        const res = await fetch(`/api/products?page=${page}&limit=100`, {
          method: "GET",
          cache: "no-store",
          credentials: "include",
        });

        if (!res.ok) throw new Error("Gagal memuat katalog");
        const data = (await res.json()) as ProductsApiResponse;

        const rows = Array.isArray(data?.items) ? data.items : [];
        allRows.push(...rows);
        pages = Math.max(1, Number(data?.pages || 1));
        page += 1;
      } while (page <= pages && page <= 20);

      const dedup = new Map<string, Product>();
      allRows.forEach((row) => {
        const next = normalizeProduct(row);
        const key = String(next?._id || "");
        if (key) dedup.set(key, next);
      });

      setProducts(Array.from(dedup.values()));
    } catch {
      setProducts([]);
    }
  };

  const fetchUserData = async () => {
    try {
      const res = await fetch("/api/me", {
        method: "GET",
        cache: "no-store",
        credentials: "include",
      });

      if (!res.ok) {
        setUserData(null);
        return;
      }

      const data = (await res.json()) as { user?: UserData };
      setUserData(data?.user || null);
    } catch {
      setUserData(null);
    }
  };

  const fetchServerCart = async () => {
    if (!isAuthenticated) return;
    try {
      const res = await fetch("/api/cart", {
        method: "GET",
        cache: "no-store",
        credentials: "include",
      });
      if (!res.ok) return;
      const data = (await res.json()) as { items?: CartApiItem[] };
      const next: CartItems = {};
      (Array.isArray(data.items) ? data.items : []).forEach((item) => {
        const id = String(item.productId || "");
        const qty = Number(item.qty || 0);
        if (id && qty > 0) next[id] = qty;
      });
      setCartItems(next);
    } catch {
      // keep current state
    }
  };

  const fetchServerWishlist = async () => {
    if (!isAuthenticated) return;
    try {
      const res = await fetch("/api/wishlist", {
        method: "GET",
        cache: "no-store",
        credentials: "include",
      });
      if (!res.ok) return;
      const data = (await res.json()) as { items?: Array<{ productId?: string }> };
      const ids = (Array.isArray(data.items) ? data.items : [])
        .map((item) => String(item?.productId || ""))
        .filter(Boolean);
      setWishlist([...new Set(ids)]);
    } catch {
      // keep current state
    }
  };

  const syncLocalToServerIfNeeded = async () => {
    if (!isAuthenticated) return;

    const localCart = readLocalCart();
    const localWishlist = readLocalWishlist();

    if (Object.keys(localCart).length > 0) {
      const items = Object.entries(localCart)
        .map(([id, qty]) => {
          const p = productMap.get(String(id));
          return {
            productId: id,
            qty: Number(qty || 0),
            title: p?.name || p?.title || "Produk",
            productImage: p?.image?.[0] || "",
            brand: p?.brand || "",
            category: p?.category || "",
            price: Number(p?.offerPrice ?? p?.price ?? 0),
            currency: "IDR",
          };
        })
        .filter((item) => item.productId && item.qty > 0);

      if (items.length > 0) {
        await fetch("/api/cart", {
          method: "PUT",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ op: "replace", items }),
        }).catch(() => null);
      }
    }

    if (localWishlist.length > 0) {
      await fetch("/api/wishlist", {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ op: "replace", productIds: localWishlist }),
      }).catch(() => null);
    }
  };

  const updateUser = (next: Partial<UserData>) => {
    setUserData((prev) => (prev ? { ...prev, ...next } : prev));
  };

  const removeFromWishlist = (id: string) => {
    const target = String(id || "");
    if (!target) return;

    setWishlist((prev) => prev.filter((entry) => getWishId(entry) !== target));

    if (isAuthenticated) {
      fetch("/api/wishlist", {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ op: "remove", productId: target }),
      }).catch(() => null);
    }
  };

  const toggleWishlist = (item: any) => {
    const itemId = getWishId(item);
    if (!itemId) return;

    setWishlist((prev) => {
      const exists = prev.some((entry) => getWishId(entry) === itemId);

      if (isAuthenticated) {
        fetch("/api/wishlist", {
          method: "PUT",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ op: exists ? "remove" : "add", productId: itemId }),
        }).catch(() => null);
      }

      if (exists) return prev.filter((entry) => getWishId(entry) !== itemId);
      return [...prev, itemId];
    });
  };

  const clearWishlist = () => {
    setWishlist([]);
    if (isAuthenticated) {
      fetch("/api/wishlist", {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ op: "clear" }),
      }).catch(() => null);
    }
  };

  const addToCart = async (itemId: string, qty: number = 1) => {
    const targetId = String(itemId || "");
    const inc = Math.max(1, Math.floor(Number(qty || 1)));
    if (!targetId) return;

    const product = productMap.get(targetId);

    setCartItems((prev) => ({
      ...prev,
      [targetId]: Number(prev[targetId] || 0) + inc,
    }));

    if (isAuthenticated) {
      await fetch("/api/cart", {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          op: "add",
          productId: targetId,
          qty: inc,
          title: product?.name || product?.title || "Produk",
          productImage: product?.image?.[0] || "",
          brand: product?.brand || "",
          category: product?.category || "",
          price: Number(product?.offerPrice ?? product?.price ?? 0),
          currency: "IDR",
        }),
      }).catch(() => null);
    }
  };

  const updateCartQuantity = async (itemId: string, quantity: number) => {
    const targetId = String(itemId || "");
    if (!targetId) return;

    const nextQty = Math.max(0, Math.floor(Number(quantity || 0)));
    const product = productMap.get(targetId);

    setCartItems((prev) => {
      const next = { ...prev };
      if (nextQty <= 0) delete next[targetId];
      else next[targetId] = nextQty;
      return next;
    });

    if (isAuthenticated) {
      await fetch("/api/cart", {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          nextQty <= 0
            ? { op: "remove", productId: targetId }
            : {
                op: "set",
                productId: targetId,
                qty: nextQty,
                title: product?.name || product?.title || "Produk",
                productImage: product?.image?.[0] || "",
                brand: product?.brand || "",
                category: product?.category || "",
                price: Number(product?.offerPrice ?? product?.price ?? 0),
                currency: "IDR",
              },
        ),
      }).catch(() => null);
    }
  };

  const getCartCount = () => {
    let totalCount = 0;
    for (const itemId in cartItems) {
      if (cartItems[itemId] > 0) totalCount += cartItems[itemId];
    }
    return totalCount;
  };

  const getCartAmount = () => {
    let totalAmount = 0;
    for (const itemId in cartItems) {
      const itemInfo = productMap.get(itemId);
      if (itemInfo && cartItems[itemId] > 0) {
        totalAmount += Number(itemInfo.offerPrice ?? itemInfo.price ?? 0) * cartItems[itemId];
      }
    }
    return Math.floor(totalAmount * 100) / 100;
  };

  useEffect(() => {
    void fetchProductData();
  }, []);

  useEffect(() => {
    const localWishlist = readLocalWishlist();
    const localCart = readLocalCart();
    setWishlist(localWishlist);
    setCartItems(localCart);

    (async () => {
      await fetchUserData();
      setAuthReady(true);
    })();
  }, []);

  useEffect(() => {
    const onAuthChanged = () => {
      void fetchUserData();
    };
    window.addEventListener("quickcart-auth-changed", onAuthChanged);
    return () => window.removeEventListener("quickcart-auth-changed", onAuthChanged);
  }, []);

  useEffect(() => {
    if (!authReady || !isAuthenticated) return;

    (async () => {
      await syncLocalToServerIfNeeded();
      await Promise.all([fetchServerCart(), fetchServerWishlist()]);
    })();
  }, [authReady, isAuthenticated]);

  useEffect(() => {
    try {
      localStorage.setItem(WISHLIST_KEY, JSON.stringify(wishlist));
    } catch {
      // ignore storage failures
    }
  }, [wishlist]);

  useEffect(() => {
    try {
      localStorage.setItem(CART_KEY, JSON.stringify(cartItems));
    } catch {
      // ignore storage failures
    }
  }, [cartItems]);

  useEffect(() => {
    const roles = Array.isArray(userData?.roles) ? userData.roles : [];
    setIsSeller(roles.includes('seller'));
  }, [userData?.roles]);

  const value: AppContextValue = {
    currency,
    router,
    authReady,
    isAuthenticated,
    isSeller,
    setIsSeller,
    roles: Array.isArray(userData?.roles) ? userData.roles : [],
    user: userData,
    userData,
    wishlist,
    favorites,
    saved,
    orders,
    updateUser,
    removeFromWishlist,
    toggleWishlist,
    clearWishlist,
    fetchUserData,
    products,
    fetchProductData,
    cart,
    basket,
    cartItems,
    setCartItems,
    addToCart,
    updateCartQuantity,
    getCartCount,
    getCartAmount,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
