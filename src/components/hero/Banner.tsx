import FirstBanner from "./FirstBanner";
import FourthBanner from "./FourthBanner";
import SecondBanner from "./SecondBanner";
import ThirdBanner from "./ThirdBanner";

interface Banner {
  id: string;
  title: string;
  subheading?: string;
  paragraph?: string;
  imageUrl: string;
  linkUrl: string;
  position: number;
  active: boolean;
}

const getBanners = async (): Promise<Banner[]> => {
  // Fetch banners from the API
  const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/logos`, {
    cache: "no-store",
  });
  const data = await res.json();
  return (data as Banner[])
    .filter((b) => b.active)
    .sort((a, b) => a.position - b.position);
};

const Banner = async () => {
  // Fetch banners
  const banners = await getBanners();

  // Function to fetch the banner by position
  const getBanner = (pos: number) => banners.find((b) => b.position === pos);

  return (
    <>
      <FirstBanner banner={getBanner(1)} />
      <SecondBanner
        banners={[getBanner(2), getBanner(3)].filter((b): b is Banner =>
          Boolean(b)
        )}
      />
      <ThirdBanner
        banners={[getBanner(4), getBanner(5)].filter((b): b is Banner =>
          Boolean(b)
        )}
      />
      <FourthBanner
        banners={[getBanner(6), getBanner(7)].filter((b): b is Banner =>
          Boolean(b)
        )}
      />
    </>
  );
};

export default Banner;
