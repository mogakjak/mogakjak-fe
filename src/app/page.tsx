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
    keywords: ["모각작", "몰입", "집중", "타이머", "공부", "스터디", "커뮤니티", "프로젝트", "개발", "학습"],
    authors: [{ name: "모각작" }],
    creator: "모각작",
    publisher: "모각작",
    metadataBase: new URL("https://mogakjak-fe.vercel.app"),
    alternates: {
      canonical: "/",
    },
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
    twitter: {
      card: "summary_large_image",
      title: DEFAULT_METADATA.title,
      description: DEFAULT_METADATA.description,
      images: [DEFAULT_METADATA.imageUrl],
    },
  };
}

export default function Home() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "모각작",
    description: "함께 몰입하며 꾸준함을 만드는 모각작 커뮤니티",
    url: "https://mogakjak-fe.vercel.app",
    applicationCategory: "ProductivityApplication",
    operatingSystem: "Web",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "KRW",
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.5",
      ratingCount: "100",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <main className="h-full">
        <WithMobileDetection>
          {({ isMobile }) => (isMobile ? <MobileHomePage /> : <HomePage />)}
        </WithMobileDetection>
      </main>
    </>
  );
}
