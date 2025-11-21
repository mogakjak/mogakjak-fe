import HomePage from "./_components/home/homePage";
import MobileHomePage from "./_components/home/mobileHomePage";
import WithMobileDetection from "./_utils/isMobileUserAgent";
import { Metadata } from "next";

export const dynamic = "force-dynamic";

const DEFAULT_METADATA = {
  title: "모각작",
  description: "함께 몰입하며 꾸준함을 만드는 모각작 커뮤니티",
  imageUrl: "https://mogakjak-fe.vercel.app/thumbnail.png?v=2",
};

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: DEFAULT_METADATA.title,
    description: DEFAULT_METADATA.description,
    openGraph: {
      title: DEFAULT_METADATA.title,
      description: DEFAULT_METADATA.description,
      url: "https://mogakjak-fe.vercel.app",
      siteName: "모각작",
      images: [
        {
          url: DEFAULT_METADATA.imageUrl,
          width: 1200,
          height: 630,
          alt: "모각작",
        },
      ],
      locale: "ko_KR",
      type: "website",
    },
  };
}

export default function Home() {
  return (
    <main className="h-full">
      <WithMobileDetection>
        {({ isMobile }) => (isMobile ? <MobileHomePage /> : <HomePage />)}
      </WithMobileDetection>
    </main>
  );
}
