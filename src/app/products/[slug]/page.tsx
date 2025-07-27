import ProductImages from "@/components/product/ProductImages";
import CustomizeProucts from "@/components/product/CustomizeProucts";
import Add from "@/components/product/Add";
import { Product } from "@/components/utilities/types";

export async function generateStaticParams(){
  const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/products`,{
    next:{revalidate:60}
  })
  if(!res.ok){
    console.error('Failed to fetch products for static params')
    return[]
  }
  const data = await res.json()
  return data.products.map((product:{slug:string})=>({
    slug:product.slug
  }))
}

// Fetch product(s) by slug
async function fetchProducts(slug: string): Promise<Product|null> {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/products/product/${slug}`,
      { next:{revalidate:60} }
    );

    if (!res.ok) throw new Error("Failed to fetch product");

    const data = await res.json();
    
    return data?.product??null
  } catch (error) {
    console.error("Error fetching product:", error);
    return null;
  }
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const singleProduct = await fetchProducts(slug);
  
  if (!singleProduct) return <div className="h-screen flex justify-center items-center text-4xl font-bold">Product not found</div>;
 
 
  return (
    <div className="px-1 md:px-[10%] lg:px-10 xl:px-25 2xl:px-40 relative flex flex-col lg:flex-row gap-16">
      {/* Product Images */}
      <div className="w-full lg:w-1/2 lg:sticky top-18 h-max">
        {singleProduct.images && (
          <ProductImages images={singleProduct.images} />
        )}
      </div>

      {/* Product Info */}
      <div className="w-full sm:px-8 px-6 lg:w-1/2 flex flex-col gap-6 py-4">
        <h1 className="text-4xl font-medium">{singleProduct.name}</h1>
        <p className="text-gray-500">{singleProduct.description}</p>
        <div className="h-[2px] bg-gray-100" />

        {/* Pricing */}
        <div className="flex items-center gap-4">
          {singleProduct.discount > 0 ? (
            <>
              <h3 className="text-xl text-gray-500 line-through">
                Rs {(+singleProduct.price).toLocaleString("en-PK")}
              </h3>
              <h2 className="font-medium text-2xl">
                Rs{" "}
                {Math.round(
                  +singleProduct.price * (1 - singleProduct.discount / 100)
                ).toLocaleString("en-PK")}
              </h2>
            </>
          ) : (
            <h2 className="font-medium text-2xl">
              Rs {(+singleProduct.price).toLocaleString("en-PK")}
            </h2>
          )}
        </div>

        <div className="h-[2px] bg-gray-100" />

        <CustomizeProucts product={singleProduct} />
        <Add product={singleProduct} />

        <div className="h-[2px] bg-gray-100" />

        {/* Extra Info */}
        <div className="text-sm space-y-6">
          <div>
            <h4 className="font-medium mb-4">Fabric & Care</h4>
            <p>Lorem ipsum dolor sit amet consectetur adipisicing elit.</p>
          </div>
          <div>
            <h4 className="font-medium mb-4">Delivery & Returns</h4>
            <p>
              Free delivery over Rs 5,000. Returns within 7 days if product is
              unused.
            </p>
          </div>
          <div>
            <h4 className="font-medium mb-4">Size & Fit</h4>
            <p>True to size. Model is wearing Medium size.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
