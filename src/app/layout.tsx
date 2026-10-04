import type { Metadata } from "next";
import localFont from "next/font/local";
import StoreProvider from "@/redux/StoreProvider";
import { AuthProvider } from "@/context/AuthContext";
import { SocketProvider } from "@/context/SocketContext";
import { GlobalClientProviders } from "@/components/common/GlobalClientProviders";
import { GoogleAuthProvider } from "@/components/common/GoogleAuthProvider";

const poppins = localFont({
  src: [
    {
      path: "./fonts/poppins/Poppins-Light.ttf",
      weight: "300",
      style: "normal",
    },
    {
      path: "./fonts/poppins/Poppins-Regular.ttf",
      weight: "400",
      style: "normal",
    },
    {
      path: "./fonts/poppins/Poppins-Medium.ttf",
      weight: "500",
      style: "normal",
    },
    {
      path: "./fonts/poppins/Poppins-SemiBold.ttf",
      weight: "600",
      style: "normal",
    },
    {
      path: "./fonts/poppins/Poppins-Bold.ttf",
      weight: "700",
      style: "normal",
    },
    {
      path: "./fonts/poppins/Poppins-ExtraBold.ttf",
      weight: "800",
      style: "normal",
    },
    {
      path: "./fonts/poppins/Poppins-Black.ttf",
      weight: "900",
      style: "normal",
    },
  ],
  variable: "--font-poppins",
  display: "swap",
});

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
    <html lang="vi" className={poppins.variable} suppressHydrationWarning>
      <body className={poppins.className} suppressHydrationWarning>
        <GoogleAuthProvider>
          <StoreProvider>
            <AuthProvider>
              <SocketProvider>
              <GlobalClientProviders>
                {children}
              </GlobalClientProviders>
              </SocketProvider>
            </AuthProvider>
          </StoreProvider>
        </GoogleAuthProvider>
      </body>
    </html>
  );
}
