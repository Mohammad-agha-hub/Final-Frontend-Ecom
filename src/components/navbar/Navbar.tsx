"use client";

import { useAuthStore } from "@/utils/UserStore";
import {
  Search,
  Heart,
  User,
  ShoppingBag,
  Menu,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Product } from "@/components/utilities/types";
import { useSidebarStore } from "@/utils/SidebarStore";
import dynamic from "next/dynamic";
import { useSession } from "next-auth/react";
import { UserDropdown } from "../user/UserDropdown";
import { useCartStore } from "@/utils/CartStore";

const Sidebar = dynamic(() => import("./Sidebar"), {
  ssr: false,
  loading: () => null,
});
const SearchSidebar = dynamic(() => import("./SearchSidebar"), {
  ssr: false,
  loading: () => null,
});
const CartSidebar = dynamic(() => import("./CartSidebar"), {
  ssr: false,
  loading: () => null,
});

export default function Navbar({products}:{products:Product[]}) {
  const { showLoginModal, setShowLoginModal } = useAuthStore();
  const {items} = useCartStore()
  const [search, setSearch] = useState("");
  const [searchFilter, setSearchFilter] = useState<Product[]>([]);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const { openSidebar, setOpenSidebar, closeSidebar } = useSidebarStore();
  const searchRef = useRef<HTMLDivElement>(null);
  const {status } = useSession();
  
  useEffect(() => {
    const filtered = products.filter((product) =>
      product.name.toLowerCase().includes(search.toLowerCase())
    );
    setSearchFilter(filtered);
  }, [search,products]);
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setIsSearchOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  
  useEffect(() => {
    const isAnySidebarOpen = openSidebar !== "none";
    document.body.style.overflow = isAnySidebarOpen ? "hidden" : "";
    document.body.style.touchAction = isAnySidebarOpen ? "none" : "";
    document.body.classList.toggle("scroll-lock", isAnySidebarOpen);

    return () => {
      document.body.style.overflow = "";
      document.body.style.touchAction = "";
      document.body.classList.remove("scroll-lock");
    };
  }, [openSidebar]);

  useEffect(() => {
    const setVh = () => {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty("--vh", `${vh}px`);
    };
    setVh();
    window.addEventListener("resize", setVh);
    window.addEventListener("orientationchange", setVh);
    return () => {
      window.removeEventListener("resize", setVh);
      window.removeEventListener("orientationchange", setVh);
    };
  }, []);

  return (
    <>
      {/* Sidebars */}
      <Sidebar />
      <SearchSidebar products={products} />
      <CartSidebar />

      {/* Navbar */}
      <nav className="navbar px-[0.3rem] sm:px-[1rem] w-full h-15 lg:h-17 border-b border-gray-200 bg-white z-30 relative">
        <div className="mx-auto px-4 py-3 flex justify-between items-center">
          {/* Mobile Left Icons */}
          <div className="flex md:hidden items-center gap-3">
            <Menu
              onClick={() => setOpenSidebar("menu")}
              className="cursor-pointer"
              size={22}
            />
            <Search
              onClick={() => setOpenSidebar("search")}
              className="cursor-pointer"
              size={22}
            />
          </div>

          {/* Logo */}
          <Link href="/" className="text-center flex-1 md:flex-none">
            <h1 className="logo text-2xl font-bold tracking-widest text-center">
              OGAAN
            </h1>
          </Link>

          {/* Mobile Right Icons */}
          <div className="flex md:hidden items-center gap-3">
            <Link href={"/wishlist"}>
              <Heart size={22} className="cursor-pointer" />
            </Link>
            {status === "authenticated" ? (
              <>
                <UserDropdown />
              </>
            ) : (
              <User
                width={25}
                height={25}
                className="cursor-pointer"
                onClick={() => setShowLoginModal(!showLoginModal)}
              />
            )}
            <div className="relative">
              <ShoppingBag
                onClick={() => setOpenSidebar("cart")}
                size={22}
                className="cursor-pointer"
              />
              <div className="bg-black h-3 w-3 absolute -top-1 flex items-center pt-[1px] justify-center text-xs font-semibold -right-1 rounded-full text-white">
                {items.reduce((count, item) => count + item.quantity, 0)}
              </div>
            </div>
          </div>

          {/* Desktop Nav Items */}
          <div className="hidden md:flex items-center md:gap-x-15 lg:gap-x-21 xl:gap-x-42 ml-auto">
            {/* Search Box */}
            <div ref={searchRef} className="relative hidden md:flex z-999">
              <input
                type="text"
                placeholder="Search"
                className="search-input xl:w-115 py-[0.6rem] focus:outline-none border-gray-300 focus:ring-1 focus:ring-gray-300 border px-3 pl-9 text-sm ml-28 md:w-80 lg:w-100"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onFocus={() => setIsSearchOpen(true)}
                onKeyDown={(e)=>{
                  if(e.key === 'Enter'){
                    window.location.href = `/all-products?search=${encodeURIComponent(search)}`
                  }
                }}
              />
              <Search
                onClick={()=> window.location.href = `/all-products?search=${encodeURIComponent(search)}`}
                width={25}
                height={25}
                className="absolute top-1.5 cursor-pointer right-3 text-gray-300"
              />

              {isSearchOpen && search && searchFilter.length > 0 && (
                <div className="absolute top-full right-0 mt-2 xl:w-115 md:w-100 max-h-105 overflow-y-auto bg-white border border-gray-300 rounded-lg shadow-xl scrollbar-thin-gray z-999">
                  {searchFilter.map((product, index) => (
                    <Link
                      href={`/products/${product.slug}`}
                      key={index}
                      className="flex items-center gap-4 px-4 py-3 hover:bg-gray-100/60 cursor-pointer transition-colors"
                    >
                      <Image
                        src={`${product.image}` || "/placeholder.png"}
                        alt={product.name}
                        width={75}
                        loading="lazy"
                        height={68}
                        className="w-15 h-22 object-contain z-99 rounded-sm shadow-sm"
                      />
                      <div>
                        <span className="text-gray-800 font-medium text-[0.9rem]">
                          {product.name}
                        </span>
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-gray-500 font-medium text-[0.8rem] ${
                              product.discount > 0 ? "line-through" : ""
                            }`}
                          >
                            RS {product.price}
                          </span>
                          {product.discount > 0 && (
                            <span className="text-red-500 font-medium text-[0.8rem]">
                              RS{" "}
                              {Math.round(
                                +product.price *
                                  (1 - (product.discount || 0) / 100)
                              )}
                            </span>
                          )}
                        </div>
                      </div>
                    </Link>
                  ))}
                  <div className="flex items-center justify-between px-4 py-3 mt-1 border-t shadow-sm hover:bg-gray-50 cursor-pointer transition">
                    <p className="text-gray-700 text-sm font-medium">{`Search for "${search}"`}</p>
                    <ArrowRight className="text-gray-500" />
                  </div>
                </div>
              )}
            </div>

            {/* Right Icons */}
            <div className="hidden md:flex items-center gap-5 md:mr-[1rem]">
              <Link href={"/wishlist"}>
                <Heart size={25} className="cursor-pointer" />
              </Link>
              {status === "authenticated" ? (
                <>
                  <UserDropdown />
                </>
              ) : (
                <User
                  width={25}
                  height={25}
                  className="cursor-pointer"
                  onClick={() => setShowLoginModal(!showLoginModal)}
                />
              )}

              <div className="relative">
                <ShoppingBag
                  onClick={() => setOpenSidebar("cart")}
                  width={25}
                  height={25}
                  className="cursor-pointer"
                />
                <div className="bg-black h-4 w-4 absolute -top-1 flex items-center pt-[1px] justify-center text-sm font-semibold -right-1 rounded-full text-white">
                  {items.reduce((count, item) => count + item.quantity, 0)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Sidebar Overlay */}
      <div
        className={`fixed inset-0 bg-black z-40 transition-opacity duration-300 ${
          openSidebar !== "none"
            ? "opacity-30 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
        onClick={closeSidebar}
      />

      <style jsx>{`
        @media (max-width: 400px) {
          .logo {
            font-size: 1.2rem;
          }
          .navbar {
            padding-left: 0.4rem;
            padding-right: 0.4rem;
          }
          .search-input {
            font-size: 0.75rem;
            padding: 0.4rem;
          }
        }
      `}</style>
    </>
  );
}
