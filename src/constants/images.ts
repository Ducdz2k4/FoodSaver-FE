/**
 * FoodSaver Official Vietnamese Asset Image Mapping
 * Maps clean constants to the generated image assets in /public/images/img-foodsaver/
 */

const BASE = "/images/img-foodsaver";

export const IMAGES = {
  // Hero & Brand Identity
  heroSaigonGirl: `${BASE}/${encodeURIComponent("Cô gái Saigon và túi bánh mì.png")}`,
  visualBannerBanquet: `${BASE}/${encodeURIComponent("Tiệc Bánh Mì Và Trái Cây Nhiệt Đới.png")}`,

  // How It Works Steps
  howItWorksDiscoverApp: `${BASE}/${encodeURIComponent("Khám phá bánh ngon trên ứng dụng.png")}`,
  howItWorksBakerOffer: `${BASE}/${encodeURIComponent("Người thợ bánh trao hộp bánh thơm ngon.png")}`,

  // Partner Business Sections
  businessBakeryMain: `${BASE}/${encodeURIComponent("Khung Cảnh Tiệm Bánh Ấm Áp Buổi Sáng.png")}`,
  businessBakerySub: `${BASE}/${encodeURIComponent("Quầy bánh ấm áp cùng đơn hàng điện tử.png")}`,
  businessStoreMain: `${BASE}/${encodeURIComponent("Trao túi xanh tại cửa hàng tiện lợi.png")}`,
  businessStoreSub: `${BASE}/${encodeURIComponent("Kệ thực phẩm tươi ngon mỗi ngày.png")}`,
  businessKitchenMain: `${BASE}/${encodeURIComponent("Cơm sườn nướng trứng ốp la.png")}`,
  businessKitchenSub: `${BASE}/${encodeURIComponent("Quầy thịt cá tươi phong cách Việt Nam.png")}`,

  // Food Collections (Category Tiles)
  collectionAll: `${BASE}/${encodeURIComponent("Tiệc Bánh Mì Và Trái Cây Nhiệt Đới.png")}`,
  collectionDrinks: `${BASE}/${encodeURIComponent("Bộ Ba Nước Trái Cây Nhiệt Đới.png")}`,
  collectionBakery: `${BASE}/${encodeURIComponent("Khung Cảnh Tiệm Bánh Ấm Áp Buổi Sáng.png")}`,
  collectionCookedMeal: `${BASE}/${encodeURIComponent("Bữa cơm Việt nóng hổi dân dã.png")}`,
  collectionFruits: `${BASE}/${encodeURIComponent("Giỏ trái cây rau củ tươi rực rỡ.png")}`,
  collectionGroceries: `${BASE}/${encodeURIComponent("Bữa sáng lành mạnh phong cách Việt.png")}`,
  collectionFastFood: `${BASE}/${encodeURIComponent("Cơm sườn nướng trứng ốp la(1).png")}`,

  // E-Commerce Sale-Off / Promotional Banners
  bannerSale70: `${BASE}/${encodeURIComponent("Đại tiệc ẩm thực giảm 70%.png")}`,
  bannerSaleLateDay: `${BASE}/${encodeURIComponent("Đại Tiệc Cuối Ngày Giảm 70%.png")}`,
  bannerFreeshipEco: `${BASE}/${encodeURIComponent("FREESHIP 0đ_ Giao đồ ngon, sống xanh.png")}`,
  bannerRadarMap: `${BASE}/${encodeURIComponent("Bản đồ ẩm thực Sài Gòn rực sáng.png")}`,
} as const;
