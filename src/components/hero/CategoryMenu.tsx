import Category from "./Category";

interface Tag {
  id: string;
  name: string;
  categoryId: string;
  parentId?: string;
  slug: string;
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
    "just-in": 0,
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

  // Find the "Just In" category
  const justInCategory = sortedCategories.find((cat) => cat.name === "just-in");
  const saleCategory = sortedCategories.find((cat)=>cat.name === "Sale")
  // Create special grouping for "Just In" category
    if(saleCategory){
      const saleTags = sortedCategories
        .filter((cat) => cat.name !== "Sale" && cat.name !== "just-in")
        .map((cat) => ({
          id: cat.id,
          name: cat.name,
          slug: cat.name.toLowerCase().replace(/\s+/g, "-"),
          categoryId: saleCategory.id,
          children:
          groupedTags[cat.id]?.map((tag)=>({
            id:tag.id,
            name:tag.name,
            slug:tag.slug
          })) || []
        }));
        groupedTags[saleCategory.id] = saleTags
    }
  if (justInCategory) {
    // Transform other categories (Women, Men, Kids, Accessories, Sale) into tags for "Just In"
    const justInTags = sortedCategories
      .filter((cat) => cat.name !== "just-in" && cat.name !== "Sale") // Exclude "Just In" itself
      .map((cat) => ({
        id: cat.id,
        name: cat.name,
        slug: cat.name.toLowerCase().replace(/\s+/g, "-"),
        categoryId: justInCategory.id,
        children:
          groupedTags[cat.id]?.map((tag) => ({
            id: tag.id,
            name: tag.name,
            slug: tag.slug,
          })) || [],
      }));

    groupedTags[justInCategory.id] = justInTags;
  }

  return (
    <Category categories={sortedCategories} tagsByCategoryId={groupedTags} />
  );
}
