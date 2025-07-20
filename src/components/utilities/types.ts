export interface Product {
  id: string;
  name: string;
  slug: string;
  category: string;
  description?: string;
  price: number;
  image: string[]; // <-- FIXED
  stock: number;
  discount: number;
  createdAt: string; // <-- ensure it's string if coming from JSON
  images?: { url: string; id: string }[]; // optional
  color?: string;
  size: string;
  type: string;
  brand: string;
  subcategory: string;
  childCategory: string;
  pieces: number;
}
