// app/(admin)/dashboard/edit-product/[id]/page.tsx
import { getServerSession } from "next-auth";
import { authOptions} from '../../../../../auth.config'
import VariantFormClient from "@/components/admin/VariantFormClient";
import { redirect } from "next/navigation";

import { Metadata } from "next";

export const metadata:Metadata={
  title:"Edit Variant"
}

export default async function EditVariant({
  params
}: {
  params:Promise< { id: string }>
}) {
  const {id} = await params
  const session = await getServerSession(authOptions);
    if (!session || session.user.isAdmin !== true) {
      return redirect("/");
    }

  const backendToken = session.user.backendToken;

  try {
    const [productRes] = await Promise.all([
      fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/products/${id}`,
        {
          headers: { Authorization: `Bearer ${backendToken}` },
          cache: "no-store",
        }
      ),
    ])

    if (!productRes.ok) {
      throw new Error("Failed to fetch required data.");
    }

    const productData = await productRes.json();
    
    const variantOptions = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/variants`
    )
      .then((res) => res.json())
      .then((data) => data.variants);

    return (
      <VariantFormClient
        product={productData.product}
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


