import Category from "./Category";

interface Tag {
  id: string;
  name: string;
  categoryId: string;
  parentId?: string;
  slug:string
}
export default async function CategoryMenu() {
  
    const [categoryRes, tagRes] = await Promise.all([
      fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/categories`, {
        next: { revalidate: 120 },
      }),
      fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/tags`, {
        next: { revalidate: 120 },
      }),
    ]);

  const categoryData = await categoryRes.json();
  const tagData = await tagRes.json();

  // Sort categories here on server
  const order: Record<string, number> = {
    "Just In": 0,
    Women: 1,
    Men: 2,
    Kids: 3,
    Accessories: 4,
    Sale: 5,
  };
  const sortedCategories = [...categoryData.categories].sort((a, b) => {
    const aOrder = order[a.name] ?? 50;
    const bOrder = order[b.name] ?? 50;
    return aOrder - bOrder;
  });

  // Group tags by categoryId here
  const groupedTags: Record<string, Tag[]> = {};
  for (const tag of tagData.tags) {
    if (!groupedTags[tag.categoryId]) groupedTags[tag.categoryId] = [];
    groupedTags[tag.categoryId].push(tag);
  }

  return (
    <Category categories={sortedCategories} tagsByCategoryId={groupedTags} />
  );
}
