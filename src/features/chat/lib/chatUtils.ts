/**
 * Common formatting and image helpers for FoodSaver Chat
 */

export function formatVND(n: number): string {
  return (n || 0).toLocaleString("vi-VN") + "đ";
}

export function getDishImage(dishName: string, slotImage?: string | null): string {
  if (slotImage && slotImage.trim() && slotImage !== "null") return slotImage;
  const lower = (dishName || "").toLowerCase();
  if (lower.includes("bánh mì")) return "https://images.unsplash.com/photo-1509722747041-616f39b57569?w=800";
  if (lower.includes("phở")) return "https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=800";
  if (lower.includes("bún")) return "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=800";
  if (lower.includes("cơm tấm") || lower.includes("cơm sườn"))
    return "/images/img-foodsaver/C%C6%A1m%20s%C6%B0%E1%BB%9Dn%20n%C6%B0%E1%BB%9Bng%20tr%E1%BB%A9ng%20%E1%BB%91p%20la.png";
  if (lower.includes("cơm") || lower.includes("chiên")) return "https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=800";
  if (lower.includes("đậu hũ") || lower.includes("đậu phụ")) return "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800";
  if (lower.includes("nấm") || lower.includes("canh")) return "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=800";
  if (lower.includes("rau") || lower.includes("kho quẹt")) return "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800";
  if (lower.includes("chè") || lower.includes("xôi")) return "https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=800";
  return "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800";
}

export function formatSessionTime(timestamp: number | string | Date): string {
  if (!timestamp) return "";
  const date = new Date(timestamp);
  if (isNaN(date.getTime())) return "";

  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (60 * 1000));
  const diffHours = Math.floor(diffMs / (60 * 60 * 1000));
  const diffDays = Math.floor(diffMs / (24 * 60 * 60 * 1000));

  if (diffMins < 1) return "Vừa xong";
  if (diffMins < 60) return `${diffMins}p trước`;
  if (diffHours < 24 && date.getDate() === now.getDate()) {
    return date.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
  }
  if (diffDays === 1) return "Hôm qua";
  return `${date.getDate()}/${date.getMonth() + 1}`;
}
