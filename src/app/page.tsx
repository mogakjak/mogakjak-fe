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
      {/* SEO를 위한 숨겨진 텍스트 콘텐츠 - 검색 엔진이 인덱싱할 수 있도록 */}
      <div style={{ position: "absolute", width: "1px", height: "1px", padding: 0, margin: "-1px", overflow: "hidden", clip: "rect(0, 0, 0, 0)", whiteSpace: "nowrap", borderWidth: 0 }}>
        <h1>모각작 - 함께 몰입하며 꾸준함을 만드는 커뮤니티</h1>
        <p>
          모각작은 함께 몰입하며 꾸준함을 만드는 생산성 향상 플랫폼입니다. 
          그룹 타이머를 통해 친구들과 함께 집중하고, 할 일을 체계적으로 관리하며, 
          상세한 통계로 성장 과정을 돌아볼 수 있습니다. 
          공부, 스터디, 프로젝트, 개발 등 다양한 목적으로 사용할 수 있는 
          몰입 중심의 커뮤니티 서비스입니다.
        </p>
        <h2>모각작의 주요 기능</h2>
        <ul>
          <li>그룹 타이머: 친구들과 함께 실시간으로 몰입 시간을 공유</li>
          <li>할 일 관리: 오늘의 할 일을 체계적으로 관리하고 추적</li>
          <li>통계 분석: 상세한 통계로 성장 과정을 시각화</li>
          <li>커뮤니티: 메이트들과 함께 동기부여를 얻으며 꾸준함 유지</li>
        </ul>
        <p>
          모각작을 검색하시면 함께 몰입하며 꾸준함을 만드는 커뮤니티를 만나실 수 있습니다. 
          타이머, 공부, 스터디, 프로젝트, 개발, 학습 등 다양한 키워드로 검색해보세요.
        </p>
      </div>
      <main className="h-full">
        <WithMobileDetection>
          {({ isMobile }) => (isMobile ? <MobileHomePage /> : <HomePage />)}
        </WithMobileDetection>
      </main>
    </>
  );
}
