"use client";

import { useEffect, useRef } from "react";
import { ShoppingBag, X } from "lucide-react";
import Image from "next/image";
import { useCartStore } from "@/utils/CartStore";
import { useRouter } from "next/navigation";
import { useSidebarStore } from "@/utils/SidebarStore";
import { useSession } from "next-auth/react";

export default function CartSidebar() {
  const sidebarRef = useRef<HTMLDivElement>(null);
  const { openSidebar, closeSidebar } = useSidebarStore();
  const isOpen = openSidebar === "cart";

  const { data: session } = useSession();
  const token = session?.user?.backendToken;
  const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

  const { items, fetchCart, updateItem, removeItem, syncCart } = useCartStore();

  const totalPrice = items.reduce((total, item) => {
    const discountedPrice = Math.round(
      item.product.price - item.product.price * (item.product.discount / 100)
    );
    return total + discountedPrice * item.quantity;
  }, 0);

  // Fetch cart on open
  useEffect(() => {
    if (isOpen && token) {
      fetchCart(token);
    }
  }, [isOpen, token, fetchCart]);

  // Close on outside click
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
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }
  }, [isOpen, closeSidebar]);

  const router = useRouter();

  const handleCheckoutClick = async () => {
    if (token) await syncCart(token); // optional sync
    closeSidebar();
    router.push("/checkout");
  };
  
  return (
    <div className="fixed inset-0 z-50 pointer-events-none">
      {/* Backdrop */}
      <div
        className={`absolute inset-0 bg-black transition-opacity duration-300 ${
          isOpen ? "opacity-40 pointer-events-auto" : "opacity-0"
        }`}
        onClick={closeSidebar}
      />

      {/* Sidebar */}
      <div
        ref={sidebarRef}
        className={`absolute top-0 right-0 sm:w-[500px] bg-white shadow-lg transform transition-transform duration-300 ${
          isOpen ? "translate-x-0 pointer-events-auto" : "translate-x-full"
        } flex flex-col overflow-y-auto`}
        style={{ height: "calc(var(--vh, 1vh) * 100)" }}
      >
        {/* Header */}
        <div className="flex justify-between items-center px-4 py-3 border-b">
          <div className="flex gap-2 pl-2 items-center">
            <ShoppingBag />
            <span className="text-lg font-medium">{items.length} Items</span>
          </div>
          <X className="cursor-pointer" onClick={closeSidebar} />
        </div>

        {/* Cart Items */}
        <div className="p-4 flex-1 overflow-y-auto scrollbar-thin-gray">
          {items.length === 0 ? (
            <p className="text-center text-gray-500">Your cart is empty.</p>
          ) : (
            items.map((item) => (
              <div
                key={item.id}
                className="flex gap-3 border-b py-4 last:border-none"
              >
                <div className="w-20 h-24 relative flex-shrink-0">
                  <Image
                    src={`${baseUrl}${item.product.image}`}
                    alt={item.product.name}
                    fill
                    className="object-cover object-top rounded-md"
                  />
                </div>

                <div className="flex flex-col flex-1">
                  <div className="flex justify-between">
                    <span className="font-medium">{item.product.name}</span>
                    <span className="font-semibold">
                      Rs{" "}
                      {Math.round(
                        item.product.price -
                          item.product.price * (item.product.discount / 100)
                      ).toLocaleString()}
                    </span>
                  </div>

                  {/* Display selected size and color */}
                  <div className="text-sm text-gray-600 mt-1">
                    Size:{" "}
                    <span className="font-medium text-black">{item.size}</span>
                  </div>
                  <div className="text-sm text-gray-600">
                    Color:{" "}
                    <span className="font-medium text-black">{item.color}</span>
                  </div>

                  <div className="flex items-center mt-2 gap-3">
                    <div className="flex items-center border rounded overflow-hidden">
                      <button
                        onClick={() =>
                          token && updateItem(item.id, item.quantity - 1, token)
                        }
                        className="px-2 py-1 text-lg font-medium hover:bg-gray-100"
                        disabled={item.quantity <= 1}
                      >
                        −
                      </button>
                      <span className="px-3">{item.quantity}</span>
                      <button
                        onClick={() =>
                          token && updateItem(item.id, item.quantity + 1, token)
                        }
                        className="px-2 py-1 text-lg font-medium hover:bg-gray-100 disabled:opacity-40"
                        disabled={item.quantity >= (item.variant?.stock ?? 0)}
                      >
                        +
                      </button>
                    </div>
                    <button
                      onClick={() => token && removeItem(item.id, token)}
                      className="text-red-600 text-sm ml-auto hover:underline"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {items.length > 0 && (
          <div onClick={handleCheckoutClick} className="border-t px-4 py-4">
            <button className="w-full flex justify-center items-center gap-2 bg-black text-white py-3 rounded-md hover:bg-gray-800 transition cursor-pointer">
              <span className="text-base font-medium">Checkout</span>
              <span className="text-xl leading-none">•</span>
              <span className="text-base font-medium">
                Rs {totalPrice.toLocaleString()}
              </span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
