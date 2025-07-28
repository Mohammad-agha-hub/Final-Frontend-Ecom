interface ProductTag {
  id: string;
  tag: TagType;
}

interface TagType {
  id: string;
  name: string;
  slug: string;
  parent?: {
    name: string;
  };
}
interface ProductImage {
  id: number;
  url: string;
  alt?: string;
}
export interface Product {
  id: string;
  name: string;
  slug: string;
  description?: string;
  price: number;
  image: string;
  stock: number;
  discount: number;
  createdAt: string;
  images:ProductImage[];
  color?: string;
  size: string;
  variantCombinations?: VariantCombination[];
  category?: {
    name: string;
  };
  productTags?: ProductTag[];
  
}

export interface ProductImages {
  id: number;
  url: string;
}

export interface Products {
  id: string;
  name: string;
  slug: string;
  images: ProductImage[];
  image: string;
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
