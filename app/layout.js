import { Outfit } from "next/font/google";
import "./globals.css";
import { AppContextProvider } from "@/context/AppContext";
import { Toaster } from "react-hot-toast";

const outfit = Outfit({ subsets: ['latin'], weight: ["300", "400", "500"] })

export const metadata = {
  title: "GalaTech",
  description: "E-Commerce with Next.js ",
  icons: {
    icon: "/favicon.svg",       // fallback
    shortcut: "/favicon.svg",   // untuk Safari lama
    apple: "/apple-touch-icon.svg", // untuk iOS
  },
  
};

export const dynamic = "force-dynamic";

export default function RootLayout({ children }) {
  return (
      <html lang="en">
        <body className={`${outfit.className} antialiased text-gray-700`} >
          <Toaster />
          <AppContextProvider>
            {children}
          </AppContextProvider>
        </body>
      </html>
  );
}
