import "@/styles/user-globals.css";
import { Toaster } from "sonner";

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="user-root min-h-screen bg-[#f9f3f0] text-[#252d2d] flex items-center justify-center p-4 relative">
      <Toaster richColors position="top-center" />
      {/* Subtle ambient blur circles */}
      <div className="absolute top-10 left-10 size-72 bg-[#00615f]/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 size-80 bg-[#79e4a7]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="relative z-10 w-full flex items-center justify-center">
        {children}
      </div>
    </div>
  );
}
