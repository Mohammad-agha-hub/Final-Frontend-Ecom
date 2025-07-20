"use client";

import { useState } from "react";
import { Minus, Plus, X } from "lucide-react";
import { useSidebarStore } from "@/utils/SidebarStore";

type SidebarItemProps = {
  label: string;
  content: string[];
};

const SidebarItem = ({ label, content }: SidebarItemProps) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="w-full">
      <div
        onClick={() => setOpen(!open)}
        className={`flex justify-between items-center border-b border-gray-300 cursor-pointer text-gray-800 font-medium py-3 px-4 transition-all ${
          open ? "bg-gray-100" : "hover:bg-gray-50"
        }`}
      >
        <span className="font-semibold">{label}</span>
        <span className="transition-transform duration-300">
          {open ? (
            <Minus size={18} className="text-gray-500" />
          ) : (
            <Plus size={18} className="text-gray-500" />
          )}
        </span>
      </div>

      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          open ? "max-h-40 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <ul className="bg-white px-2 py-2 flex flex-col gap-2">
          {content.map((sub, i) => (
            <li
              key={i}
              className="text-gray-800 text-sm py-2 px-2 rounded-md cursor-pointer hover:bg-gray-100 transition border-b border-gray-300"
            >
              {sub}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

const Sidebar = () => {
  const { openSidebar, closeSidebar } = useSidebarStore();
  const isOpen = openSidebar === "menu";

  const menuItems = [
    { label: "Just In", content: ["Pret", "Trending Now"] },
    { label: "Women", content: ["Sarees", "Kurtis", "Jewellery"] },
    { label: "Men", content: ["Shirts", "Trousers", "Ethnic Wear"] },
    { label: "Accessories", content: ["Bags", "Footwear", "Watches"] },
    { label: "Sale", content: ["Flat 50%", "Clearance Sale"] },
  ];

  return (
    <>
      {/* Sidebar Panel */}
      <div
        className={`fixed top-0 left-0 w-[80%] max-w-[320px] bg-white shadow-xl z-50 transform transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } overflow-y-auto touch-auto overscroll-contain`}
        style={{ height: "calc(var(--vh, 1vh) * 100)" }}
      >
        {/* Header */}
        <div className="flex justify-between items-center px-4 py-4 border-b border-gray-200">
          <h2 className="text-lg font-bold">Menu</h2>
          <X onClick={closeSidebar} size={22} className="cursor-pointer" />
        </div>

        {/* Menu Items */}
        <div className="py-2">
          {menuItems.map((item, idx) => (
            <SidebarItem key={idx} label={item.label} content={item.content} />
          ))}
        </div>
      </div>

      {/* Overlay */}
      <div
        className={`fixed inset-0 z-40 bg-black transition-opacity duration-300 ${
          isOpen
            ? "opacity-30 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
        onClick={closeSidebar}
      />
    </>
  );
};

export default Sidebar;
