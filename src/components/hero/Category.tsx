"use client";

import React, { useState, useRef } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";

interface SubTag {
  id: string;
  name: string;
  slug: string;
}

interface Tag {
  id: string;
  name: string;
  slug: string;
  categoryId: string;
  children?: SubTag[];
}

interface CategoryType {
  id: string;
  name: string;
  image:string
}

const MegaMenu = ({
  category,
  tags,
  onMouseEnter,
  onMouseLeave,
}: {
  category: CategoryType;
  tags: Tag[];
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
            <div className="relative rounded overflow-hidden">
              <Image
                src={category.image || "/placeholder.jpg"}
                alt={category.name}
                width={200}
                height={300}
                className="object-contain"
              />
            </div>
            <div className="grid grid-cols-5 gap-20 place-items-start w-full">
              {tags.map((tag, index) => (
                <div key={tag.id || index} className="text-left">
                  <h4 className="text-base font-semibold mb-2 text-gray-800">
                    {tag.name}
                  </h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    {tag.children?.map((sub: SubTag) => (
                      <li key={sub.id}>
                        <Link href={`/collections/${encodeURIComponent(category.name)}/${encodeURIComponent(tag.slug)}/${encodeURIComponent(sub.slug)}`}>
                          <span className="cursor-pointer hover:text-black">
                            {sub.name}
                          </span>
                        </Link>
                      </li>
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

const Category = ({
  categories,
  tagsByCategoryId,
}: {
  categories: CategoryType[];
  tagsByCategoryId: Record<string, Tag[]>;
}) => {
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
        {categories.map((cat) => (
          <div
            key={cat.id || cat.name}
            className="relative h-full flex pt-4"
            onMouseEnter={() => handleMouseEnter(cat.name)}
            onMouseLeave={handleMouseLeave}
          >
            <span
              className={`cursor-pointer pb-4 text-base font-medium ${
                cat.name === "Sale" ? "text-[#8d1c1c]" : ""
              } hover:text-gray-500`}
            >
              {cat.name === "just-in" ? "Just In" : cat.name }
            </span>
            <AnimatePresence>
              {hovered === cat.name && (
                <MegaMenu
                  category={cat}
                  tags={tagsByCategoryId[cat.id] || []}
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
