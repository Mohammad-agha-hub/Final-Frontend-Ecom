import { getServerSession } from "next-auth";
import { authOptions } from "../../../auth.config";
import OrderConfirmation from "../../../components/dashboard/OrderConfirmation";
import { redirect } from "next/navigation";

import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Order Confirmation",
};

export default async function OrderConfirmationPage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const { orderId } = await params;
  const session = await getServerSession(authOptions);

  if (orderId && session?.user.backendToken) {
    return <OrderConfirmation />;
  } else {
    redirect("/");
  }
}
