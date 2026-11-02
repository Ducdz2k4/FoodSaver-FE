"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function MealPlannerCommunityRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/community");
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#fcfaf8]">
      <div className="text-center space-y-2">
        <div className="size-8 rounded-full border-2 border-[#00615f] border-t-transparent animate-spin mx-auto" />
        <p className="text-xs text-stone-500 font-medium">Đang chuyển đến Cộng đồng chia sẻ FoodSaver...</p>
      </div>
    </div>
  );
}
