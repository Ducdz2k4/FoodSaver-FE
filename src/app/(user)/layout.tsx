import "@/styles/user-globals.css";
import Header from "@/components/user-component/layout/Header";
import Footer from "@/components/user-component/layout/Footer";
import { UserToaster } from "@/components/user-component/toast";
import { UserRouteGuard } from "@/components/auth/UserRouteGuard";

export default function UserLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="user-root min-h-screen flex flex-col justify-between">
      <UserToaster />
      <Header />
      <main className="flex-1">
        <UserRouteGuard>{children}</UserRouteGuard>
      </main>
      <Footer />
    </div>
  );
}
