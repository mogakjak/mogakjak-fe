import HomePage from "./_components/home/homePage";
import MobileHomePage from "./_components/home/mobileHomePage";
import WithMobileDetection from "./_utils/isMobileUserAgent";

export const dynamic = "force-dynamic";

export default function Home() {
  return (
    <main className="h-full">
      <WithMobileDetection>
        {({ isMobile }) => (isMobile ? <MobileHomePage /> : <HomePage />)}
      </WithMobileDetection>
    </main>
  );
}
