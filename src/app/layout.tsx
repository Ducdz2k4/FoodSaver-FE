import type { Metadata } from "next";
import StoreProvider from "@/redux/StoreProvider";
import { AuthProvider } from "@/context/AuthContext";

export const metadata: Metadata = {
  title: "FoodSaver | Giải pháp quản lý & tiết kiệm thực phẩm",
  description: "Nền tảng công nghệ thông minh hỗ trợ tối ưu và giảm lãng phí thực phẩm.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body>
        <StoreProvider>
          <AuthProvider>{children}</AuthProvider>
        </StoreProvider>
      </body>
    </html>
  );
}
