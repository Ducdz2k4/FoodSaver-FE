export type Role = 'USER' | 'ADMIN' | 'SYS_ADMIN';
export type UserStatus = 'ACTIVE' | 'INACTIVE' | 'BANNED';
export type PartnerCapability = 'NONE' | 'PENDING' | 'VERIFIED' | 'REJECTED';
export type BusinessType = 'CONVENIENCE_STORE' | 'BAKERY' | 'RESTAURANT' | 'SUPERMARKET' | 'OTHER';
export type FoodCategory = 'BAKERY' | 'COOKED_MEAL' | 'GROCERIES' | 'FRUITS' | 'DRINKS' | 'OTHER';
export type ListingStatus = 'AVAILABLE' | 'EXPIRING_SOON' | 'SOLD_OUT' | 'EXPIRED' | 'UNAVAILABLE';
export type OrderStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'COMPLETED' | 'CANCELLED';
export type WasteRisk = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface UserProfileDTO {
  id: string;
  email: string;
  fullName: string;
  phone?: string;
  avatarUrl?: string;
  role: Role;
  status: UserStatus;
  partnerCapability: PartnerCapability;
  partnerProfileId?: string;
}

export interface PartnerProfileDTO {
  id: string;
  userId: string;
  businessName: string;
  businessLicenseNo: string;
  businessLicenseUrl: string;
  foodSafetyCertUrl: string;
  businessType: BusinessType;
  verificationStatus: PartnerCapability;
  rejectionReason?: string;
  address: string;
  lat: number;
  lng: number;
  geohash: string;
  phone: string;
}

export interface ListingDTO {
  id: string;
  partnerId: string;
  partnerName: string;
  partnerAddress: string;
  foodSafetyCertUrl: string;
  title: string;
  description: string;
  category: FoodCategory;
  originalPrice: number;
  discountPrice: number;
  quantity: number;
  unit: string;
  expiryAt: string; // ISO 8601 string
  pickupStartTime: string;
  pickupEndTime: string;
  pickupAddress: string;
  lat: number;
  lng: number;
  distanceKm?: number;
  imageUrls: string[];
  safetyNotes?: string;
  status: ListingStatus;
  urgencyScore?: number;
  wasteRisk?: WasteRisk;
  createdAt: string;
}

export interface OrderDTO {
  id: string;
  orderNumber: string;
  listingId: string;
  listingTitle: string;
  listingImage: string;
  partnerName: string;
  partnerAddress: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  status: OrderStatus;
  pickupTimeWindow: string;
  customerNotes?: string;
  createdAt: string;
}

export interface NotificationDTO {
  id: string;
  title: string;
  message: string;
  type: 'NEW_LISTING_NEARBY' | 'ORDER_STATUS_UPDATED' | 'EXPIRY_WARNING' | 'PARTNER_VERIFIED' | 'PARTNER_REJECTED';
  read: boolean;
  createdAt: string;
}
