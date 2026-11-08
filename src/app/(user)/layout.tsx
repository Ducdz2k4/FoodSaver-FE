import "@/styles/user-globals.css";
import Header from "@/components/user-component/layout/Header";
import Footer from "@/components/user-component/layout/Footer";
import { UserRouteGuard } from "@/components/auth/UserRouteGuard";
import { ChatProvider, ChatDock } from "@/features/chat";

export default function UserLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="user-root min-h-screen flex flex-col justify-between">
      <Header />
      <main className="flex-1">
        <ChatProvider>
          <UserRouteGuard>{children}</UserRouteGuard>
          <ChatDock />
        </ChatProvider>
      </main>
      <Footer />
    </div>
  );
}
