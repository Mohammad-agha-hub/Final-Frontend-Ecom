"use client";

import React from "react";
import { Heart } from "lucide-react";
import Image from "next/image";
import { useWishlistStore } from "@/utils/WishlistStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

const WishlistPage = () => {
  const wishedProducts = useWishlistStore((state) => state.wishlist);
  const router = useRouter()
  
  return (
    <div className="min-h-screen bg-muted px-4 sm:px-6 py-12">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 flex items-center gap-2 mb-10">
          <Heart className="text-red-500 w-8 h-8" />
          Your Wishlist
        </h1>

        {wishedProducts.length === 0 ? (
          <p className="text-muted-foreground text-lg">
            Your wishlist is empty.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {wishedProducts.map((item) => (
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
                <CardContent className="text-center ">
                  <CardTitle className="text-base font-semibold text-gray-900">
                    {item.name}
                  </CardTitle>
                  <div className="flex items-center gap-2 justify-center">
                    {item.discount > 0 && (
                      <p className={`text-gray-900 font-bold text-lg}`}>
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
                      className="cursor-pointer"
                      onClick={() => router.push(`/products/${item.slug}`)}
                      variant="default"
                      size="sm"
                    >
                      View Product
                    </Button>
                    <Button
                      className="cursor-pointer"
                      variant="outline"
                      size="sm"
                    >
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

export default WishlistPage;
