import Header from "@/components/Header";
import Login from "./_components/login/login";

export default function Home() {
  return (
    <main className="flex flex-col min-h-screen items-center">
      <Header></Header>
      <Login></Login>
    </main>
  );
}
