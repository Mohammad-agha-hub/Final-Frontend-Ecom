"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import { ShoppingBag, X } from "lucide-react";
import Image from "next/image";
import { useCartStore } from "@/utils/CartStore";
import { useRouter } from "next/navigation";
import { useSidebarStore } from "@/utils/SidebarStore";
import { useSession } from "next-auth/react";
import { toast } from "sonner";

export default function CartSidebar() {
  const sidebarRef = useRef<HTMLDivElement>(null);
  const { openSidebar, closeSidebar } = useSidebarStore();
  const isOpen = openSidebar === "cart";
  const router = useRouter();
  const { data: session } = useSession();
  const token = session?.user?.backendToken;

  
  const {
    items,
    fetchCart,
    updateItem,
    removeItem,
    syncCart,
    loading,
  } = useCartStore();

  const [isSyncing, setIsSyncing] = useState(false);

  const { totalPrice, itemCount } = useMemo(() => {
    return items.reduce(
      (acc, item) => {
        const basePrice = item.variant?.price ?? item.product.price;
        const discount = item.product.discount || 0;
        const displayPrice = Math.round(basePrice * (1 - discount / 100));
        return {
          totalPrice: acc.totalPrice + displayPrice * item.quantity,
          itemCount: acc.itemCount + item.quantity,
        };
      },
      { totalPrice: 0, itemCount: 0 }
    );
  }, [items]);

  useEffect(() => {
    if (token) fetchCart(token);
    
  }, [token, fetchCart]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target as Node)
      ) {
        closeSidebar();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen, closeSidebar]);

  const handleQuantityChange = async (itemId: string, newQuantity: number) => {
    if (!token || newQuantity < 1) return;
    try {
      await updateItem(itemId, newQuantity, token);
      toast.success("Quantity updated");
    } catch {
      toast.error("Failed to update quantity");
    }
  };

  const handleRemoveItem = async (itemId: string) => {
    if (!token) return;
    try {
      await removeItem(itemId, token);
      toast.success("Item removed from cart");
    } catch {
      toast.error("Failed to remove item");
    }
  };

  const handleCheckout = async () => {
    if (items.length === 0) return;
    setIsSyncing(true);
    try {
      if (token) await syncCart(token);
      closeSidebar();
      router.push("/checkout");
    } catch {
      toast.error("Failed to proceed to checkout");
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 pointer-events-none">
      <div
        className={`absolute inset-0 bg-black transition-opacity duration-300 ${
          isOpen ? "opacity-40 pointer-events-auto" : "opacity-0"
        }`}
        onClick={closeSidebar}
      />
      <div
        ref={sidebarRef}
        className={`absolute top-0 right-0 w-full sm:w-[500px] bg-white shadow-lg transform transition-transform duration-300 ${
          isOpen ? "translate-x-0 pointer-events-auto" : "translate-x-full"
        } flex flex-col`}
        style={{ height: "100dvh" }}
      >
        <div className="flex justify-between items-center px-4 py-3 border-b sticky top-0 bg-white z-10">
          <div className="flex gap-2 items-center">
            <ShoppingBag className="w-5 h-5" />
            <span className="text-lg font-medium">
              {itemCount} {itemCount === 1 ? "Item" : "Items"}
            </span>
          </div>
          <button onClick={closeSidebar} aria-label="Close cart">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 flex-1 overflow-y-auto">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center p-8">
              <ShoppingBag className="w-12 h-12 text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900">
                Your cart is empty
              </h3>
              <p className="text-gray-500 mt-1">
                Start shopping to add items to your cart
              </p>
              <button
                onClick={closeSidebar}
                className="mt-6 bg-black text-white px-4 py-2 rounded-md hover:bg-gray-800 transition"
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            <ul className="divide-y">
              {items.map((item) => {
                {console.log(item)}
                let color = item.color || null;
                let size = item.size || null;
                let price = item.product.price;
                const image = item.product.image;
               

                const stock = item.variant?.stock??0;

                if (item.variant) {
                  const foundColor = item.variant.variants.find(
                    (v) => v.key === "Color"
                  );
                  const foundSize = item.variant.variants.find(
                    (v) => v.key === "Size"
                  );
                  if (!color && foundColor) color = foundColor.value;
                  if (!size && foundSize) size = foundSize.value;
                  if (item.variant.price) price = item.variant.price;
                }

                const displayPrice = Math.round(
                  price * (1 - (item.product.discount || 0) / 100)
                );

                return (
                  <li key={item.id} className="py-4">
                    <div className="flex gap-4">
                      <div className="relative w-20 h-27 flex-shrink-0">
                        <Image
                          src={`${process.env.NEXT_PUBLIC_BACKEND_URL}${image}`}
                          alt={item.product.name}
                          fill
                          className="object-cover rounded-md"
                          sizes="80px"
                        />
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between">
                          <h3 className="font-medium line-clamp-2">
                            {item.product.name}
                          </h3>
                          <p className="font-semibold whitespace-nowrap ml-2">
                            Rs {displayPrice.toLocaleString()}
                          </p>
                        </div>
                        {(color || size) && (
                          <div className="mt-1 space-y-1">
                            {color && (
                              <p className="text-sm text-gray-600">
                                <span className="font-medium">Color:</span>{" "}
                                {color}
                              </p>
                            )}
                            {size && (
                              <p className="text-sm text-gray-600">
                                <span className="font-medium">Size:</span>{" "}
                                {size}
                              </p>
                            )}
                          </div>
                        )}
                        <div className="flex items-center justify-between mt-3">
                          <div className="flex items-center border rounded-md overflow-hidden">
                            <button
                              onClick={() =>
                                handleQuantityChange(item.id, item.quantity - 1)
                              }
                              disabled={item.quantity <= 1 || loading}
                              className="px-3 py-1 hover:bg-gray-100 disabled:opacity-50"
                              aria-label="Decrease quantity"
                            >
                              −
                            </button>
                            <span className="px-3 text-center min-w-[2rem]">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() =>
                                handleQuantityChange(item.id, item.quantity + 1)
                              }
                              disabled={item.quantity >= stock || loading}
                              className="px-3 py-1 hover:bg-gray-100 disabled:opacity-50"
                              aria-label="Increase quantity"
                            >
                              +
                            </button>
                          </div>
                          <button
                            onClick={() => handleRemoveItem(item.id)}
                            disabled={loading}
                            className="text-sm text-red-600 hover:underline disabled:opacity-50"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {items.length > 0 && (
          <div className="border-t px-4 py-4 sticky bottom-0 bg-white">
            <div className="flex justify-between items-center mb-4">
              <span className="font-medium">Subtotal</span>
              <span className="font-semibold">
                Rs {totalPrice.toLocaleString()}
              </span>
            </div>
            <button
              onClick={handleCheckout}
              disabled={loading || isSyncing}
              className="w-full flex justify-center items-center gap-2 bg-black text-white py-3 rounded-md hover:bg-gray-800 transition disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isSyncing ? (
                <>
                  <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  Processing...
                </>
              ) : (
                <>
                  <span>Checkout</span>
                  <span>•</span>
                  <span>Rs {totalPrice.toLocaleString()}</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
