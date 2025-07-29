// components/providers/route-transition-provider.tsx
"use client";

import { useEffect, useState, useTransition } from "react";
import { usePathname } from "next/navigation";
import Loading from "@/app/loading";

export function RouteTransitionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [loading, setLoading] = useState(false);
  const [isPending] = useTransition();

  useEffect(() => {
    setLoading(true);
    const timeout = setTimeout(() => {
      setLoading(false);
    }, 300); // Delay to allow new page render

    return () => clearTimeout(timeout);
  }, [pathname]);

  return (
    <>
      {(loading || isPending) && (
        <div className="fixed inset-0 z-[9999] bg-white flex items-center justify-center">
          <Loading />
        </div>
      )}
      {children}
    </>
  );
}
