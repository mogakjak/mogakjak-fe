import Header from "@/components/Header";
import AuthGate from "@/app/_components/login/authGate";

export default function Home() {
  return (
    <AuthGate>
      <main className="flex flex-col min-h-screen items-center">
        <Header />
      </main>
    </AuthGate>
  );
}
