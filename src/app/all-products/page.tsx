import React from "react";
import CollectionFilterAll from "@/components/allproduct/CollectionFilterAll";
import { Product } from "@/components/utilities/types";

type ColorVariant = {
  value: string; // e.g., "#0787a6"
};
interface Props{
  searchParams:Promise<{search?:string}>;
}
import { Metadata } from "next";

export const metadata:Metadata={
  title:"Search Products"
}
export default async function Collection({searchParams}:Props) {
  // Fetch products
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/products`,
    {
      // revalidate every 5 minutes
      next: { revalidate: 100 },
    }
  );
  const data = await res.json();
    const {search = ""} = await searchParams

  let filteredProducts:Product[] = data.products
  
  if(search){
    filteredProducts = filteredProducts.filter((product:Product)=>product.name.toLowerCase().includes(search.toLowerCase()))
  }
  
  const colorSet = new Set<string>()
  for(const product of filteredProducts){
    for(const combination of product.variantCombinations || []){
      for(const variantWrapper of combination.variants || []){
        const variant = variantWrapper.variant;
        if(variant?.key?.toLowerCase()==="color"){
          colorSet.add(variant.value)
        }
      }
    }
  }
  const uniqueColors:ColorVariant[] = Array.from(colorSet).map((value)=>({value}))
  return (
    <div className=" flex flex-col min-h-screen">
      <div className="flex-1 overflow-y-auto">
      <CollectionFilterAll search={search} items={filteredProducts} colors={uniqueColors}/>
      </div>
    </div>
  );
}
