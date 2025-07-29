import type { Metadata } from "next";
import { Suspense } from "react";
import "./globals.css";
import Loading from "./loading";
import Providers from "./providers";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import FooterWrapper from "@/components/footer/FooterWrapper";
import NavbarWrapper from "@/components/navbar/NavbarWrapper";
import Login from "@/components/navbar/Login";
import LocalFont from 'next/font/local'
import { RouteTransitionProvider } from "@/components/admin/RouteTransitionProvider";

const poppins = LocalFont({
  src: [
    {
      path: "./fonts/Poppins-Medium.ttf",
      weight: "500",
      style: "normal",
    },
  ],
  variable: "--font-poppins", // this enables use with Tailwind
  display: "swap",
});

export const metadata: Metadata = {
  title: "E-Commerce",
  description: "Ecommerce-Website",
};


export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  

  return (
    <html lang="en" className={`${poppins.variable}`}>
      <body className="font-sans antialiased">
        <Providers>
          <RouteTransitionProvider>
            <div className="min-h-screen flex flex-col">
              <NavbarWrapper />
              <Login />
              <Suspense fallback={<Loading />}>{children}</Suspense>
              <FooterWrapper />
            </div>
          </RouteTransitionProvider>
          <ToastContainer
            position="top-center"
            autoClose={1000}
            hideProgressBar={true}
            newestOnTop={true}
            closeOnClick
            rtl={false}
            theme="colored"
          />
        </Providers>
      </body>
    </html>
  );
}
