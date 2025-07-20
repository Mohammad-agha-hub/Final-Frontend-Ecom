import type { Metadata } from "next";
import { Suspense } from "react";
import "./globals.css";
import { Poppins } from "next/font/google";
import Loading from "./loading";
import Providers from "./providers";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import FooterWrapper from "@/components/footer/FooterWrapper";
import NavbarWrapper from "@/components/navbar/NavbarWrapper";
import Login from "@/components/navbar/Login";

const poppins = Poppins({
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700"],
  variable: "--font-poppins",
});

export const metadata: Metadata = {
  title: "E-Commerce",
  description: "Ecommerce-Website",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${poppins.variable}`}>
      <body className="font-sans antialiased">
        <Providers>
          <div className="min-h-screen flex flex-col">
            <NavbarWrapper />
            <Login/>
            <Suspense fallback={<Loading />}>{children}</Suspense>
            <FooterWrapper />
          </div>
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
