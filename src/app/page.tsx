// app/page.tsx or Home component
import Banner from "@/components/hero/Banner";
import Filtered from "@/components/hero/Filtered";
import { Suspense } from "react";
import Loading from "./loading";
import CategoryMenu from "@/components/hero/CategoryMenu";


export default function Home() {
  return (
    <Suspense fallback={<Loading />}>
      <div>
        <CategoryMenu />
        <Filtered />
        <Banner />
      </div>
    </Suspense>
  );
}
