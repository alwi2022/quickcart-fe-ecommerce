'use client';

import { productsDummyData, userDummyData } from "@/assets/assets";
import { useRouter } from "next/navigation";
import { createContext, useContext, useEffect, useState, type Dispatch, type ReactNode, type SetStateAction } from "react";

type Product = (typeof productsDummyData)[number] & {
    id?: string;
    [key: string]: any;
};
type UserData = typeof userDummyData & {
    phone?: string;
    gender?: string;
    birthday?: string;
    [key: string]: any;
};
type CartItems = Record<string, number>;

type AppContextValue = {
    currency: string;
    router: ReturnType<typeof useRouter>;
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
    addToCart: (itemId: string) => Promise<void>;
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

export const AppContextProvider = ({ children }: AppContextProviderProps) => {
    const currency = process.env.NEXT_PUBLIC_CURRENCY || "Rp";
    const router = useRouter();

    const [products, setProducts] = useState<Product[]>([]);
    const [userData, setUserData] = useState<UserData | null>(null);
    const [isSeller, setIsSeller] = useState(true);
    const [wishlist] = useState<any[]>([]);
    const [favorites] = useState<any[]>([]);
    const [saved] = useState<any[]>([]);
    const [orders] = useState<any[]>([]);
    const [cart] = useState<any[]>([]);
    const [basket] = useState<any[]>([]);
    const [cartItems, setCartItems] = useState<CartItems>({});

    const fetchProductData = async () => {
        setProducts(productsDummyData);
    };

    const fetchUserData = async () => {
        setUserData(userDummyData);
    };

    const updateUser = (next: Partial<UserData>) => {
        setUserData((prev) => (prev ? { ...prev, ...next } : prev));
    };

    const removeFromWishlist = (_id: string) => {};
    const toggleWishlist = (_item: any) => {};
    const clearWishlist = () => {};

    const addToCart = async (itemId: string) => {
        const cartData = structuredClone(cartItems);
        if (cartData[itemId]) {
            cartData[itemId] += 1;
        } else {
            cartData[itemId] = 1;
        }
        setCartItems(cartData);
    };

    const updateCartQuantity = async (itemId: string, quantity: number) => {
        const cartData = structuredClone(cartItems);
        if (quantity === 0) {
            delete cartData[itemId];
        } else {
            cartData[itemId] = quantity;
        }
        setCartItems(cartData);
    };

    const getCartCount = () => {
        let totalCount = 0;
        for (const itemId in cartItems) {
            if (cartItems[itemId] > 0) {
                totalCount += cartItems[itemId];
            }
        }
        return totalCount;
    };

    const getCartAmount = () => {
        let totalAmount = 0;
        for (const itemId in cartItems) {
            const itemInfo = products.find((product) => product._id === itemId);
            if (itemInfo && cartItems[itemId] > 0) {
                totalAmount += itemInfo.offerPrice * cartItems[itemId];
            }
        }
        return Math.floor(totalAmount * 100) / 100;
    };

    useEffect(() => {
        void fetchProductData();
    }, []);

    useEffect(() => {
        void fetchUserData();
    }, []);

    const value: AppContextValue = {
        currency,
        router,
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
