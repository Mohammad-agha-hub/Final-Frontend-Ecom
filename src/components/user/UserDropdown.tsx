// components/UserDropdown.tsx
"use client";

import { signOut } from "next-auth/react";
import { useSession } from "next-auth/react";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";

export const UserDropdown = () => {
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!session?.user) return null;

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Avatar Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="rounded-full bg-gray-200 flex items-center justify-center w-8 h-8 hover:bg-gray-300 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-opacity-50"
        aria-label="User menu"
        aria-expanded={isOpen}
      >
        <span className="text-sm font-medium text-gray-700 uppercase">
          {session.user.name?.[0] || "U"}
        </span>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-100">
          <div className="px-4 py-2 border-b border-gray-100">
            <p className="text-sm font-medium text-gray-900 truncate">
              {session.user.name}
            </p>
            <p className="text-xs text-gray-500 truncate">
              {session.user.email}
            </p>
          </div>
          {session.user.isAdmin === true && (
            <Link
              href="/dashboard"
              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-150"
              onClick={() => setIsOpen(false)}
            >
              Dashboard
            </Link>
          )}
          <Link
            href="/profile"
            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-150"
            onClick={() => setIsOpen(false)}
          >
            Update Profile
          </Link>

          <Link
            href="/orders"
            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-150"
            onClick={() => setIsOpen(false)}
          >
            Track Orders
          </Link>

          <Link
            href="/cart"
            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-150"
            onClick={() => setIsOpen(false)}
          >
            My Cart
          </Link>

          <button
            onClick={() => {
              setIsOpen(false);
              signOut({ callbackUrl: "/" });
            }}
            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-150 border-t border-gray-100"
          >
            Logout
          </button>
        </div>
      )}
    </div>
  );
};
