"use client";

import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { useFilterStore } from "@/utils/FilterStore";

type Props = {
  open: boolean;
  setOpen: (val: boolean) => void;
  colors: string[];
};

const CollectionSidebar = ({
  open,
  setOpen,
  colors
}:Props) => {
  const { filters, setFilter, removeFilter } = useFilterStore();
  const filtersData = [
    {
      key: "price",
      label: "By Price",
      options: ["3000-6000", "6001-9000", "9000+"],
    },
    {
      key: "color",
      label: "By Color",
      options: colors,
    },
    {
      key: "size",
      label: "By Size",
      options: ["S", "M", "L", "XS", "XL"],
    },
  ];
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
                  {key === "color" ? (
                    <div className="flex flex-wrap gap-2">
                      {options.map((colorObj:string | {value:string}) => {
                        const color =
                          typeof colorObj === "string"
                            ? colorObj
                            : typeof colorObj?.value === "string"
                            ? colorObj.value
                            : "";
  
                        if (!color) return null;
  
                        const isSelected = filters.color?.includes(color);
  
                        return (
                          <button
                            key={color}
                            onClick={() =>
                              isSelected
                                ? removeFilter("color", color)
                                : setFilter("color", color)
                            }
                            className={`w-6 h-6 rounded-full`}
                            style={{
                              backgroundColor: color.trim(),
                              border: isSelected
                                ? "1px solid black"
                                : "1px solid #a4a8a8",
                            }}
                          />
                        );
                      })}
                    </div>
                  ) : (
                    options.map((option) => (
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
                    ))
                  )}
                </div>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    );
  };

export default CollectionSidebar;
