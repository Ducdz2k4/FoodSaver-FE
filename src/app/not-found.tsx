import Link from "next/link";
import "@/styles/user-globals.css";

export default function NotFound() {
  return (
    <main className="user-root min-h-screen flex flex-col items-center justify-center p-6 text-center">
      <h1 className="text-4xl font-bold mb-3 text-stone-900">404 - Không Tìm Thấy Trang</h1>
      <p className="text-stone-600 mb-6 text-sm">Trang bạn đang tìm kiếm không tồn tại hoặc đã bị di chuyển.</p>
      <Link
        href="/"
        className="px-5 py-2.5 bg-[#211914] text-white rounded-xl hover:opacity-90 transition font-medium text-sm shadow-md"
      >
        Về Trang Chủ
      </Link>
    </main>
  );
}
