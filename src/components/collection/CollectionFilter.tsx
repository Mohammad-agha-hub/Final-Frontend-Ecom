'use client';

import { SlidersHorizontal, ChevronDown } from 'lucide-react';
import React, { useState } from 'react';
import FilteredCollection from './FilteredCollection';
const CollectionSidebar = dynamic(() => import("./CollectionSidebar"), {
  ssr: false,
});
import { useFilterStore } from '@/utils/FilterStore';
import dynamic from "next/dynamic";
const CollectionFiltered = ({collection}:{collection:string}) => {
  const [sortOpen, setSortOpen] = useState(false);
  const [columns, setColumns] = useState(2);
  const [openSidebar,setOpenSidebar] = useState(false)
  const sortOptions = ['Featured','Price: Low to High',"Price: High to Low","Newest"]
  const currentSort = useFilterStore((state)=>state.sortBy)
  const setSortBy = useFilterStore((state)=>state.setSortBy)
  const gridOptions = [
    { count: 1, classes: 'block sm:block md:hidden' },                  // sm and below
    { count: 2, classes: 'block' },                                     // all screens
    { count: 3, classes: 'sm:block md:block lg:block xl:block hidden' }, // md and up
    { count: 4, classes: 'md:block lg:block xl:block hidden' },         // lg and up
    { count: 5, classes: 'lg:block xl:block hidden' },                  // lg and up
    { count: 6, classes: 'xl:block hidden' },                           // xl only
  ];

  return (
    <>
      <CollectionSidebar open={openSidebar} setOpen={setOpenSidebar} />
      <div className="flex justify-between items-center border-b py-4 px-2 md:px-6">
        {/* LEFT: Filter */}
        <div
          className="flex items-center gap-2 cursor-pointer"
          onClick={() => setOpenSidebar(!openSidebar)}
        >
          <SlidersHorizontal size={20} />
          <span className="text-sm font-medium">Filter</span>
        </div>

        {/* MID: Grid Layout Buttons */}
        <div className="flex gap-2 items-center">
          {gridOptions.map(({ count, classes }) => {
            const candleWidth = 5; // px
            const candleGap = 6; // px
            const totalWidth =
              count * candleWidth + (count - 1) * candleGap + 12;

            return (
              <div
                key={count}
                className={`border ${classes} flex items-center justify-center cursor-pointer rounded-sm transition-all ${
                  columns === count ? "border-black" : "border-gray-300"
                }`}
                onClick={() => setColumns(count)}
                style={{
                  width: `${totalWidth}px`,
                  height: "36px",
                }}
              >
                <div className="flex items-center justify-center h-full">
                  <div className="flex items-center gap-[2px]">
                    {Array.from({ length: count }).map((_, i) => (
                      <div
                        key={i}
                        className="w-[4px] h-[14px] bg-black rounded-sm"
                      />
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* RIGHT: Sort Dropdown */}
        <div className="relative">
          <button
            onClick={() => setSortOpen(!sortOpen)}
            className="flex items-center gap-1 border px-5 cursor-pointer py-2 rounded text-sm hover:bg-gray-100 transition"
          >
            {currentSort}
            <ChevronDown size={16} />
          </button>
          {sortOpen && (
            <div className="absolute right-0 mt-2 bg-white border shadow-md rounded w-40 z-10">
              {sortOptions.map((item) => (
                <div
                  key={item}
                  onClick={()=>{
                    setSortBy(item)
                    setSortOpen(false)
                  }}
                  className={`px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm ${currentSort===item?'bg-gray-100 font-medium':""}`}
                >
                  {item}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <FilteredCollection columns={columns} collection={collection} />
    </>
  );
};

export default CollectionFiltered;
