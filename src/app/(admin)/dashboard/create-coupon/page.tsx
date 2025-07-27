// app/(dashboard)/admin/coupons/page.tsx or wherever your route is
import CouponManagement from "./CouponManagement"; // Path as needed
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth.config";
import { redirect } from "next/navigation";

export default async function ManageCouponsPage() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.isAdmin !== true) {
    return redirect("/");
  }
  
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/coupons`,
    {
      headers: {
        Authorization: `Bearer ${session?.user.backendToken}`, 
      },
      cache: "no-store",
    }
  );

  const data = await res.json();

  const coupons = data.success ? data.coupons : [];

  return <CouponManagement Coupon={coupons} />;
}
