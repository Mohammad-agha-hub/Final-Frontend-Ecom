"use client";

import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { useFilterStore } from "@/utils/FilterStore";

const filtersData = [
  {
    key: "price",
    label: "By Price",
    options: ["3000-6000", "6001-9000", "9000+"],
  },
  { key: "color", label: "By Color", options: ["Yellow", "Purple", "Silver","White"] },
  {
    key: "type",
    label: "By Type",
    options: ["Embroidered", "Printed", "Plain"],
  },
  { key: "pieces", label: "By Pieces", options: ["2 Piece", "3 Piece"] },
  { key: "size", label: "By Size", options: ["S", "M", "L"] },
];

const CollectionSidebar = ({
  open,
  setOpen,
}: {
  open: boolean;
  setOpen: (val: boolean) => void;
}) => {
  const { filters, setFilter, removeFilter } = useFilterStore();

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 bg-black/40 z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
          />
          <motion.div
            className="fixed top-0 left-0 h-full w-72 bg-white z-50 shadow-xl p-6 overflow-y-auto"
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "tween", duration: 0.3, ease: "easeInOut" }}
            style={{ willChange: "transform", backfaceVisibility: "hidden" }}
          >
            <button
              onClick={() => setOpen(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-black"
            >
              <X size={24} />
            </button>

            <h1 className="text-2xl font-semibold mb-6">Filter</h1>

            {filtersData.map(({ key, label, options }) => (
              <div key={key} className="mb-6">
                <h2 className="text-lg font-medium mb-2">{label}</h2>
                {options.map((option) => (
                  <label
                    key={option}
                    className="flex items-center gap-2 text-sm mb-1"
                  >
                    <input
                      type="checkbox"
                      checked={filters[key as keyof typeof filters]?.includes(
                        option
                      )}
                      onChange={(e) =>
                        e.target.checked
                          ? setFilter(key as keyof typeof filters, option)
                          : removeFilter(key as keyof typeof filters, option)
                      }
                      className="accent-black"
                    />
                    {option}
                  </label>
                ))}
              </div>
            ))}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CollectionSidebar;
