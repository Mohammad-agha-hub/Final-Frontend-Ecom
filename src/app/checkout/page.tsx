import CheckoutClient from "./CheckoutClient";
import { Metadata } from "next";

export const metadata:Metadata={
  title:"Checkout"
}

export default async function SettingsPage() {
  return <CheckoutClient />;
}