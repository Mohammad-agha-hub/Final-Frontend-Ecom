"use client";

import { usePathname } from "next/navigation";
import Navbar from "../../components/navbar/Navbar";
import { useEffect, useState } from "react";

const NavbarWrapper = () => {
  const [products,setProducts]  = useState([])
  const pathname = usePathname();
  
  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/products`)
      .then(res => res.json())
      .then(data => setProducts(data.products || []));
  }, []);
  // Hide navbar on all pages that start with /dashboard
  const shouldHideNavbar = pathname.startsWith("/dashboard");

  if (shouldHideNavbar) return null;

  return <Navbar products={products} />;
};

export default NavbarWrapper;
