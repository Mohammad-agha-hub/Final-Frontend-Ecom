"use client";

import { useEffect, useState } from "react";
import { Minus, Plus, X } from "lucide-react";
import { useSidebarStore } from "@/utils/SidebarStore";
import Link from "next/link";

interface Subtag {
  id: string;
  name: string;
  slug: string;
}

interface Tag {
  id: string;
  name: string;
  slug: string;
  categoryId: string;
  children?: Subtag[];
}

interface Category {
  id: string;
  name: string;
}

const SubtagList = ({
  subtags,
  categoryName,
  parentSlug,
}: {
  subtags: Subtag[];
  categoryName: string;
  parentSlug: string;
}) => {
  return (
    <ul className="ml-4 mt-1 space-y-1">
      {subtags.map((sub) => (
        <li
          key={sub.id}
          className="text-sm text-gray-700 pl-4 py-1 rounded hover:bg-gray-100 cursor-pointer border-l border-gray-300"
        >
          <Link
            href={`/collections/${encodeURIComponent(
              categoryName
            )}/${encodeURIComponent(parentSlug)}/${encodeURIComponent(
              sub.slug
            )}`}
          >
            {sub.name}
          </Link>
        </li>
      ))}
    </ul>
  );
};

const TagItem = ({ tag, categoryName }: { tag: Tag; categoryName: string }) => {
  const [open, setOpen] = useState(false);

  const hasChildren = tag.children && tag.children.length > 0;

  return (
    <div className="w-full">
      <div
        onClick={() => {
          if (hasChildren) setOpen((prev) => !prev);
        }}
        className="flex justify-between items-center cursor-pointer text-gray-800 font-medium py-2 px-4 hover:bg-gray-50 transition"
      >
        <span className="text-sm">{tag.name}</span>
        {hasChildren ? (
          open ? (
            <Minus size={16} className="text-gray-500" />
          ) : (
            <Plus size={16} className="text-gray-500" />
          )
        ) : null}
      </div>
      {open && hasChildren ? (
        <SubtagList
          subtags={tag.children!}
          categoryName={categoryName}
          parentSlug={tag.slug}
        />
      ) : null}
    </div>
  );
};

const CategoryItem = ({
  category,
  tags,
}: {
  category: Category;
  tags: Tag[];
}) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="w-full border-b border-gray-200">
      <div
        onClick={() => setOpen((prev) => !prev)}
        className="flex justify-between items-center cursor-pointer px-4 py-3 font-semibold text-gray-900 hover:bg-gray-100"
      >
        <span>{category.name}</span>
        {open ? (
          <Minus size={18} className="text-gray-500" />
        ) : (
          <Plus size={18} className="text-gray-500" />
        )}
      </div>

      {open && (
        <div className="pb-2">
          {tags.map((tag) => (
            <TagItem key={tag.id} tag={tag} categoryName={category.name} />
          ))}
        </div>
      )}
    </div>
  );
};

const Sidebar = () => {
  const { openSidebar, closeSidebar } = useSidebarStore();
  const isOpen = openSidebar === "menu";

  const [categories, setCategories] = useState<Category[]>([]);
  const [tagsByCategoryId, setTagsByCategoryId] = useState<
    Record<string, Tag[]>
  >({});

  useEffect(() => {
    const fetchSidebarData = async () => {
      try {
        const [catRes, tagRes] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/categories`),
          fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/tags`),
        ]);

        const catJson = await catRes.json();
        const tagJson = await tagRes.json();

        const categoriesData: Category[] = catJson.categories || [];
        const tagsData: Tag[] = tagJson.tags || [];

        const groupedTags: Record<string, Tag[]> = {};
        tagsData.forEach((tag) => {
          if (!groupedTags[tag.categoryId]) groupedTags[tag.categoryId] = [];
          groupedTags[tag.categoryId].push(tag);
        });

        setCategories(categoriesData);
        setTagsByCategoryId(groupedTags);
      } catch (err) {
        console.error("Failed to load sidebar data:", err);
      }
    };

    fetchSidebarData();
  }, []);

  return (
    <>
      {/* Sidebar panel */}
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

        {/* Dynamic Content */}
        <div className="py-2">
          {categories.map((category) => (
            <CategoryItem
              key={category.id}
              category={category}
              tags={tagsByCategoryId[category.id] || []}
            />
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
