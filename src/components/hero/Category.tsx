"use client";

import React, { useState, useRef } from 'react';
import Image from 'next/image';
import { AnimatePresence, motion } from 'framer-motion';
import { categoryData } from '@/components/utilities/categoryData';
import Link from 'next/link';

// Mapping for images per main category (you can customize these)
const categoryImages: Record<string, string> = {
  Women: '/cloth2a.png',
  Men: '/cloth3a.png',
  Kids: '/cloth4a.png',
  Accessories: '/cloth5a.png',
  Sale: '/cloth6a.png',
  'Just In': '/cloth7a.png',
};

const MegaMenu = ({
  category,
  onMouseEnter,
  onMouseLeave,
}: {
  category: typeof categoryData[number];
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      transition={{ duration: 0.25 }}
      className="fixed left-0 top-[130px] w-screen bg-white border-t shadow-lg z-30"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div className="w-screen overflow-hidden flex justify-center">
        <div className="px-12 py-8 flex justify-center">
          <div className="grid grid-cols-[280px_1fr] gap-30 items-start max-w-[1600px] w-full">
            <div className="relative rounded overflow-hidden ">
              <Image
                src={categoryImages[category.name] || '/placeholder.jpg'}
                alt={category.name}
                width={200}
                height={300}
                className="object-contain"
              />
            </div>
            <div className="grid grid-cols-5 gap-20 place-items-start w-full">
              {category.children.map((sub, index) => (
                <div key={index} className="text-center">
                  <h4 className="text-base font-semibold mb-2 text-gray-800">{sub.name}</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    {sub.children.map((item, i) => (
                      <Link key={i} href={`/collections/${item.name}`}>
                      <li key={i} className="cursor-pointer hover:text-black">
                        {item.name}
                      </li>
                      </Link>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const Category = () => {
  const [hovered, setHovered] = useState<string | null>(null);
  const hoverTimeout = useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnter = (categoryName: string) => {
    hoverTimeout.current = setTimeout(() => {
      setHovered(categoryName);
    }, 250);
  };

  const handleMouseLeave = () => {
    if (hoverTimeout.current) clearTimeout(hoverTimeout.current);
    setHovered(null);
  };

  return (
    <div className="hidden md:flex justify-center relative mt-3 mb-3">
      <div className="border border-gray-200 w-[80vw] max-w-none flex justify-center items-center px-4 gap-10 h-14 relative">
        {categoryData.map((cat) => (
          <div
            key={cat.name}
            className="relative h-full flex pt-4"
            onMouseEnter={() => handleMouseEnter(cat.name)}
            onMouseLeave={handleMouseLeave}
          >
            <span
              className={`cursor-pointer pb-4 text-base font-medium ${
                cat.name === 'Sale' ? 'text-[#8d1c1c]' : ''
              } hover:text-gray-500`}
            >
              {cat.name}
            </span>
            <AnimatePresence>
              {hovered === cat.name && (
                <MegaMenu
                  category={cat}
                  onMouseEnter={() => setHovered(cat.name)}
                  onMouseLeave={handleMouseLeave}
                />
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Category;
