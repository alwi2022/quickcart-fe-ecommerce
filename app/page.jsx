'use client';
import React from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Category from "@/components/Category";
import BrandsShowcase from "@/components/BrandsShowcase";
import FeaturedProduct from "@/components/FeaturedProduct";
import HomeProducts from "@/components/HomeProducts";
import Banner from "@/components/Banner";
import HeaderSlider from "@/components/HeaderSlider";

export default function Home() {
  return (
    <>
      <Navbar />
      <main className="px-6 md:px-16 lg:px-32">
        <HeaderSlider />
        <Category />
        {/* <BrandsShowcase />  */}
        {/* <FeaturedProduct /> */}
        <HomeProducts />
        {/* <Banner /> */}
      </main>
      <Footer />
    </>
  );
}
