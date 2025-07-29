import WishlistClient from "./WishlistClient";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth.config";

export const dynamic = "force-dynamic";

interface WishlistItem {
  product: {
    id: string;
    name: string;
    slug: string;
    price: number;
    discount: number;
    images: { url: string }[];
  };
}


const WishlistPage = async () => {
  const session = await getServerSession(authOptions);
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/wishlist`,
    {
      headers: {
        Authorization: `Bearer ${session?.user.backendToken}`,
      },
      cache: "no-store",
    }
  );

  if (!res.ok) {
    console.error("Failed to fetch wishlist:", res.statusText);
    return <WishlistClient initialWishlist={[]} />;
  }

  const data = await res.json();

  const wishlist = data.wishlist.map((item: WishlistItem) => ({
    id: item.product.id,
    name: item.product.name,
    slug: item.product.slug,
    price: item.product.price,
    discount: item.product.discount,
    image: item.product.images[0]?.url || "/placeholder.jpg",
  }));

  return <WishlistClient initialWishlist={wishlist} />;
};

export default WishlistPage;
