export type MessageRole = "user" | "assistant";

export interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: Date;
  richCards?: any;
  quickSuggestions?: string[];
}

export interface ChatSessionItem {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  messageCount?: number;
}

export interface AuthRequiredCardData {
  message?: string;
  returnUrl?: string;
}

export interface CalendarConflictSlot {
  meal?: string;
  cost?: number;
  calories?: number;
}

export interface CalendarConflictCardData {
  date: string;
  formattedDate?: string;
  existing?: {
    breakfast?: CalendarConflictSlot;
    lunch?: CalendarConflictSlot;
    dinner?: CalendarConflictSlot;
    snack?: CalendarConflictSlot;
  };
}

export interface CalendarAppliedSlot {
  slot: "breakfast" | "lunch" | "dinner" | "snack" | string;
  meal: string;
  cost: number;
  calories?: number;
  image?: string;
}

export interface CalendarAppliedCardData {
  date: string;
  formattedDate?: string;
  slots?: CalendarAppliedSlot[];
}

export interface FeasibilityNegotiationCardData {
  score?: number;
  realisticDays?: number;
  requestedBudget?: number;
  recommendedMinTotal?: number;
}

export interface DealItem {
  id: string;
  name: string;
  originalPrice: number;
  discountedPrice: number;
  discountPercent?: number;
  storeName?: string;
  imageUrl?: string;
}

export interface SchedulePreviewCardData {
  days: number;
  dailyBudget: number;
  meals?: any[];
}

export type RichCardType =
  | "auth_required"
  | "calendar_conflict"
  | "calendar_applied"
  | "feasibility_negotiation"
  | "deals_list"
  | "schedule_preview";

export interface RichCardPayload {
  type: RichCardType | string;
  data?: any;
}
