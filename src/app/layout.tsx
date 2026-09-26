import type { Metadata } from "next";
import StoreProvider from "@/redux/StoreProvider";
import { AuthProvider } from "@/context/AuthContext";
import { GlobalClientProviders } from "@/components/common/GlobalClientProviders";

export const metadata: Metadata = {
  title: "FoodSaver | Good food, in its last golden hours",
  description:
    "FoodSaver connects bakeries, convenience stores and neighbours with people nearby who want great food at a fair price, before it expires.",
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
          <AuthProvider>
            {children}
            <GlobalClientProviders />
          </AuthProvider>
        </StoreProvider>
      </body>
    </html>
  );
}
