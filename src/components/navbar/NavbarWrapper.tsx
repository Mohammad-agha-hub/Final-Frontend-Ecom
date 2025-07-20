"use client";

import { usePathname } from "next/navigation";
import Navbar from "../../components/navbar/Navbar";

const NavbarWrapper = () => {
  const pathname = usePathname();

  // Hide navbar on all pages that start with /dashboard
  const shouldHideNavbar = pathname.startsWith("/dashboard");

  if (shouldHideNavbar) return null;

  return <Navbar />;
};

export default NavbarWrapper;
