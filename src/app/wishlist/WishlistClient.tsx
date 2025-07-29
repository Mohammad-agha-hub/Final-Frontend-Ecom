"use client";

import React, { useState } from "react";
import { Heart, Trash2 } from "lucide-react";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Product } from "@/components/utilities/types";
import { useSession } from "next-auth/react";

type WishlistItem = Pick<
  Product,
  "id" | "name" | "slug" | "price" | "discount" | "image"
>;

const WishlistClient = ({
  initialWishlist,
}: {
  initialWishlist:WishlistItem[];
}) => {
  const {data:session} = useSession()
  const router = useRouter();
  const [wishlist, setWishlist] = useState<WishlistItem[]>(initialWishlist);

  const handleRemove = async (productId: string) => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/wishlist`,
        {
          method: "DELETE",
          headers:{
            "Content-Type":"application/json",
            Authorization:`Bearer ${session?.user.backendToken}`},
            body:JSON.stringify({productId})
        }
        
      );
      console.log("removed with this",session?.user.backendToken)
      if (!res.ok) {
        throw new Error("Failed to remove from wishlist");
      }

      setWishlist((prev:WishlistItem[]) => prev.filter((item:WishlistItem) => item.id !== productId));
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="min-h-screen bg-muted px-4 sm:px-6 py-12">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 flex items-center gap-2 mb-10">
          <Heart className="text-red-500 w-8 h-8" />
          Your Wishlist
        </h1>

        {wishlist.length === 0 ? (
          <p className="text-muted-foreground text-lg">
            Your wishlist is empty.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {wishlist.map((item) => (
              <Card key={item.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="p-3">
                  <div className="relative w-full aspect-4/5 rounded-xl overflow-hidden">
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      className="object-cover object-top"
                      loading="lazy"
                    />
                  </div>
                </CardHeader>
                <CardContent className="text-center">
                  <CardTitle className="text-base font-semibold text-gray-900">
                    {item.name}
                  </CardTitle>
                  <div className="flex items-center gap-2 justify-center">
                    {item.discount > 0 && (
                      <p className="text-gray-900 font-bold text-lg">
                        Rs{" "}
                        {Math.round(
                          item.price - (item.price * item.discount) / 100
                        )}
                      </p>
                    )}
                    <p
                      className={`text-gray-400 font-bold text-base ${
                        item.discount > 0 ? "line-through" : ""
                      }`}
                    >
                      Rs {item.price}
                    </p>
                  </div>
                  <div className="flex justify-center gap-2 mt-4">
                    <Button
                      onClick={() => router.push(`/products/${item.slug}`)}
                      variant="default"
                      size="sm"
                    >
                      View Product
                    </Button>
                    <Button
                      onClick={() => handleRemove(item.id)}
                      variant="outline"
                      size="sm"
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      Remove
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default WishlistClient;
