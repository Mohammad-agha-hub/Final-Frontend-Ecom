
import FirstBanner from "./FirstBanner";
import SecondBanner from "./SecondBanner";
import ThirdBanner from "./ThirdBanner";
import FourthBanner from "./FourthBanner";

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
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/logos`,
    {
      next: { revalidate: 3600 },
    }
  );
  const data = await res.json();
  return (data as Banner[]).filter((b: Banner) => b.active).sort((a, b) => a.position - b.position);
};

const Banner = async () => {
  const banners = await getBanners();

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
