"use client";

import { useState, useEffect, useRef } from "react";
import { X } from "lucide-react";
import Image from "next/image";
import { Product } from "../utilities/types";
import { useSidebarStore } from "@/utils/SidebarStore";
import { useSettingsStore } from "@/utils/shippingStore";


const SearchSidebar =({products}:{products:Product[]}) => {
  const { openSidebar, closeSidebar } = useSidebarStore();
  const isOpen = openSidebar === "search";
  const [search, setSearch] = useState("");
  const [filteredItems, setFilteredItems] = useState<Product[]>([]);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const {currency} = useSettingsStore()
  // Filter products on search change
  useEffect(() => {
    const filtered = products.filter((product) =>
      product.name.toLowerCase().includes(search.toLowerCase())
    );
    setFilteredItems(filtered);
  }, [search,products]);

  // Close sidebar on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        sidebarRef.current &&
        !sidebarRef.current.contains(e.target as Node)
      ) {
        closeSidebar();
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, closeSidebar]);

  return (
    <>
      {/* Sidebar Panel */}
      <div
        ref={sidebarRef}
        className={`fixed top-0 right-0 w-[85%] max-w-[380px] bg-white z-50 transform transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        } shadow-xl overflow-y-auto touch-auto overscroll-contain`}
        style={{ height: "calc(var(--vh, 1vh) * 100)" }}
      >
        {/* Header */}
        <div className="flex justify-between items-center px-4 py-4 border-b border-gray-200">
          <h2 className="text-lg font-bold">Search</h2>
          <X onClick={closeSidebar} size={22} className="cursor-pointer" />
        </div>

        {/* Body */}
        <div className="px-4 pt-4 space-y-5 h-[calc(100%-64px)] flex flex-col">
          {/* Search Input */}
          <input
            type="text"
            placeholder="Search items..."
            className="w-full border border-gray-300 px-4 py-2 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-gray-400"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                window.location.href = `/all-products?search=${encodeURIComponent(
                  search
                )}`;
              }
            }}
          />

          {/* Results */}
          <div
            className="flex flex-col overflow-y-auto space-y-4 scrollbar-thin"
            style={{ maxHeight: "calc(var(--vh, 1vh) * 100 - 220px)" }}
          >
            {filteredItems.length > 0 ? (
              filteredItems.map((item, i) => (
                <div key={i} className="flex items-center gap-3 border-b pb-3">
                  <Image
                    src={item.images?.[0]?.url || "/placeholder.jpg"}
                    alt={item.name}
                    width={57}
                    loading="lazy"
                    height={42}
                    className="object-cover rounded-md"
                  />
                  <div>
                    <p className="text-sm font-medium text-gray-800">
                      {item.name}
                    </p>
                    <div className="flex items-center  gap-2">
                      {item.discount > 0 && (
                        <span className="text-gray-500 font-medium text-[0.8rem]">
                          {currency}{" "}
                          {Math.round(
                            +item.price * (1 - (item.discount || 0) / 100)
                          ).toLocaleString("en-PK")}
                        </span>
                      )}
                      <p
                        className={
                          item.discount > 0
                            ? "line-through text-xs text-gray-500"
                            : `text-xs text-gray-500 `
                        }
                      >
                        {currency} {item.price.toLocaleString("en-PK")}
                      </p>
                      {item.discount > 0 && (
                        <span className="text-red-500 font-medium text-[0.8rem]">
                          {item.discount}%
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500">No items found.</p>
            )}
          </div>

          <h1
            onClick={() => {
              window.location.href = `/all-products?search=${encodeURIComponent(
                search
              )}`;
            }}
            className="font-semibold text-[#222] px-5 py-2 border-b border-gray-200 shadow-[0_3px_10px_#81818133]"
          >
            {search ? `Search For "${search}"` : "Start typing to search..."}
          </h1>
        </div>
      </div>

      {/* Overlay */}
      <div
        className={`fixed inset-0 bg-black z-40 transition-opacity duration-300 ${
          isOpen
            ? "opacity-30 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
        onClick={closeSidebar}
      />
    </>
  );
};

export default SearchSidebar;
