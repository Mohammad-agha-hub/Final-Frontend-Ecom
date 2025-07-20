// app/page.tsx or Home component
import Banner from "@/components/hero/Banner";
import Category from "@/components/hero/Category";

import Filtered from "@/components/hero/Filtered";
import { Suspense } from "react";
import Loading from "./loading";


export default function Home() {
  return (
    <Suspense fallback={<Loading />}>
      <div>
        <Category />
        <Filtered />
        <Banner />
      </div>
    </Suspense>
  );
}
