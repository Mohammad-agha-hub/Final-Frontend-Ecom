// app/(admin)/dashboard/edit-product/[id]/page.tsx
import { getServerSession } from "next-auth";
import { authOptions} from '../../../../../auth.config'
import EditProductForm from "@/components/admin/EditProductForm";

export default async function EditProductPage({
  params
}: {
  params:Promise< { id: string }>
}) {
  const {id} = await params
  const session = await getServerSession(authOptions);
  if (!session) {
    return (
      <div className="p-6 text-red-500">
        You must be logged in to view this page.
      </div>
    );
  }

  const backendToken = session.user.backendToken;

  try {
    const [productRes, categoriesRes, tagsRes] = await Promise.all([
      fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/products/${id}`,
        {
          headers: { Authorization: `Bearer ${backendToken}` },
          cache: "no-store",
        }
      ),
      fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/categories`, {
        headers: { Authorization: `Bearer ${backendToken}` },
        cache: "no-store",
      }),
      fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/tags/flat`, {
        headers: { Authorization: `Bearer ${backendToken}` },
        cache: "no-store",
      }),
      
    ]);

    if (!productRes.ok || !categoriesRes.ok || !tagsRes.ok) {
      throw new Error("Failed to fetch required data.");
    }

    const productData = await productRes.json();
    const categoriesData = await categoriesRes.json();
    const tagsData = await tagsRes.json();
    const variantOptions = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/variants`
    )
      .then((res) => res.json())
      .then((data) => data.variants);

    return (
      <EditProductForm
        product={productData.product}
        categories={categoriesData.categories}
        tags={tagsData.tags}
        token={backendToken}
        variantOptions = {variantOptions}
      />
    );
  } catch (err) {
    return (
      <div className="text-red-500 p-6">
        Error loading data. {(err as Error).message}
      </div>
    );
  }
}


