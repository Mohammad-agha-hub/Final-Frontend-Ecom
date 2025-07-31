import Link from 'next/link';
import React from 'react'

const Footer = () => {
  return (
    <footer className="text-gray-300 w-full max-w-screen px-5 md:px-6 lg:px-8 py-12 bg-gray-800 overflow-hidden">
      <div className="grid grid-cols-1 sm:grid-cols-2 sm:gap-x-20 lg:grid-cols-5 gap-5">
        {/* Column 1 */}
        <div className="flex flex-col w gap-2 text-sm">
          <h2 className="text-lg font-semibold text-white">Qubit Kurv</h2>
          <span className="text-white">Hotline Free 24/3</span>
          <span className="text-orange-600 text-lg font-semibold">
            +92 9102012
          </span>
          <p className="w-full max-w-[10rem]">
            124 S GEMSTONE SUITE A RIDGECREST
          </p>
          <span>CA 93555</span>
          <span>Email: info@gmail.com</span>
        </div>

        {/* Column 2 */}
        <div className="flex flex-col gap-2 text-sm">
          <h2 className="text-lg font-semibold text-white">My Account</h2>
          <Link href={"/login"}>
            <span className="cursor-pointer">Login</span>
          </Link>
          <Link href={"/login"}>
            <span className="cursor-pointer">Register</span>
          </Link>
          <Link href={"/profile"}>
            <span className="cursor-pointer">Update Profile</span>
          </Link>
        </div>

        {/* Column 3 */}
        <div className="flex flex-col gap-2 text-sm">
          <h2 className="text-lg font-semibold text-white">Pages</h2>
          <Link href={"/"}>
            <span className="cursor-pointer">Home</span>
          </Link>
          <Link href={"/all-products"}>
            <span className="cursor-pointer">All Products</span>
          </Link>
          <Link href={"/wishlist"}>
            <span className="cursor-pointer">Wishlist</span>
          </Link>
          <Link href={"/checkout"}>
            <span className="cursor-pointer">Checkout</span>
          </Link>
        </div>

        {/* Column 4 */}
        <div className="flex flex-col gap-2 text-sm">
          <h2 className="text-lg font-semibold text-white">Our Policies</h2>
          <span className="cursor-pointer">Terms & Conditions</span>
          <span className="cursor-pointer">Privacy Policy</span>
          <span className="cursor-pointer">Shipping Policy</span>
          <span className="cursor-pointer">Cookies Policy</span>
          <span className="cursor-pointer">Return and Refund Policy</span>
        </div>

        {/* Column 5 */}

        {/* <div className="flex flex-col gap-4 text-sm">
          <h2 className="text-lg font-semibold text-white">
            Sign Up To Newsletter
          </h2>
          <p>
            Join 60,000+ subscribers and get a new discount coupon every
            Saturday.
          </p>
          <div className="relative w-full">
            <input
              type="text"
              placeholder="Email address..."
              className="w-full border border-gray-300  py-2 px-3 pr-[6rem] focus:outline-none focus:ring-1 focus:ring-gray lg:text-[10px] md:text-[10px]sm:w-[10rem]"
            />
            <button className="absolute right-1 cursor-pointer top-1 bottom-1 bg-orange-400 text-white px-3 text-sm hover:bg-orange-600 lg:px-0.5 lg:text-[10px] transition">
              SUBSCRIBE
            </button>
          </div>

          <p className="text-xs mt-2">
            By providing your email address, you agree to our Privacy Policy and
            Terms of Service.
          </p>
        </div>
        */}
      </div>
    </footer>
  );
}

export default Footer
