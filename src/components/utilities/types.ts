export interface Product {
  id: string;
  name: string;
  slug: string;
  category: string;
  description?: string;
  price: number;
  image: string[];
  stock: number;
  discount: number;
  createdAt: string;
  images?: { url: string; id: string }[];
  color?: string;
  size: string;
  variantCombinations: VariantCombination[]; // changed from string[] to proper type
}


export interface Variant {
  variant: {
    key: string;
    value: string;
  };
}

export interface VariantCombination {
  id: string;
  productId: string;
  variants: Variant[];
  size: string;
  color: string;
  stock: number;
  price: number;
  sku?: string;
  image?: string;
}
