import { baseApi } from "./baseApi";

export interface RecipeIngredient {
  name: string;
  amount: string;
  estimatedPrice: number;
}

export interface RecipeDTO {
  id: string;
  name: string;
  image: string;
  calories: number;
  cookTime: number;
  servings: number;
  cost: number;
  category: string;
  tags: string[];
  ingredients: RecipeIngredient[];
  steps: string[];
  rating: number;
  reviews: number;
  // Partner borrowing integration
  partnerImage?: string | null;
  partnerListingId?: string | null;
  partnerListingTitle?: string | null;
  partnerStoreName?: string | null;
  partnerPrice?: number | null;
  partnerOriginalPrice?: number | null;
}

export interface MealPlanSlotDTO {
  id?: string;
  meal: string;
  image?: string | null;
  calories: number;
  cost: number;
  ingredients: string[];
}

export interface DayPlanDTO {
  breakfast?: MealPlanSlotDTO;
  lunch?: MealPlanSlotDTO;
  dinner?: MealPlanSlotDTO;
  snack?: MealPlanSlotDTO;
}

export interface MonthSummaryDTO {
  totalCost: number;
  totalCalories: number;
  plannedDays: number;
  ingredientCount: number;
  shoppingList: string[];
}

export interface CommunityPostDTO {
  id: string;
  userId?: string | null;
  authorName: string;
  authorAvatar: string;
  authorBadge?: string | null;
  authorRole?: string | null;
  title: string;
  content: string;
  category: string;
  likes: number;
  comments: number;
  views: number;
  tags: string[];
  mealPlan?: { days: number; avgCost: number } | null;
  createdAt: string;
}

export interface ServerChatSessionSummary {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  messageCount: number;
}

export interface ServerChatMessageDTO {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  richCards?: any;
  quickSuggestions?: string[];
}

export interface ServerChatSessionDetail {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  messages: ServerChatMessageDTO[];
}

export const mealPlannerApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // 1. Recipes
    getRecipes: builder.query<{ data: RecipeDTO[]; meta?: any }, { category?: string; search?: string } | void>({
      query: (params) => {
        const q = new URLSearchParams();
        if (params && params.category && params.category !== "all") q.append("category", params.category);
        if (params && params.search && params.search.trim()) q.append("search", params.search.trim());
        return `/api/v1/recipes?${q.toString()}`;
      },
      providesTags: ["Recipe"],
    }),

    getRecipeById: builder.query<{ data: RecipeDTO }, string>({
      query: (id) => `/api/v1/recipes/${id}`,
      providesTags: (_res, _err, id) => [{ type: "Recipe", id }],
    }),

    // 2. Meal Plans
    getMonthMealPlans: builder.query<{ data: Record<string, DayPlanDTO> }, { year: number; month: number }>({
      query: ({ year, month }) => `/api/v1/meal-plans?year=${year}&month=${month}`,
      providesTags: ["MealPlan"],
    }),

    getMonthSummary: builder.query<{ data: MonthSummaryDTO }, { year: number; month: number }>({
      query: ({ year, month }) => `/api/v1/meal-plans/summary?year=${year}&month=${month}`,
      providesTags: ["MealPlan"],
    }),

    saveMealPlanSlot: builder.mutation<
      { data: any },
      { date: string; slot: string; meal: string; image?: string | null; calories?: number; cost?: number; ingredients?: string[] }
    >({
      query: (body) => ({
        url: "/api/v1/meal-plans",
        method: "POST",
        body,
      }),
      invalidatesTags: ["MealPlan"],
    }),

    deleteMealPlanSlot: builder.mutation<{ success: boolean }, string>({
      query: (id) => ({
        url: `/api/v1/meal-plans/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["MealPlan"],
    }),

    // 3. Community Posts
    getCommunityPosts: builder.query<{ data: CommunityPostDTO[]; meta?: any }, { category?: string; sortBy?: string } | void>({
      query: (params) => {
        const q = new URLSearchParams();
        if (params && params.category && params.category !== "all") q.append("category", params.category);
        if (params && params.sortBy) q.append("sortBy", params.sortBy);
        return `/api/v1/community/posts?${q.toString()}`;
      },
      providesTags: ["CommunityPost"],
    }),

    createCommunityPost: builder.mutation<
      { data: CommunityPostDTO },
      {
        title: string;
        content: string;
        category?: string;
        tags?: string[];
        authorName?: string;
        authorAvatar?: string;
        authorRole?: string;
        authorBadge?: string;
        mealPlan?: { days: number; avgCost: number };
      }
    >({
      query: (body) => ({
        url: "/api/v1/community/posts",
        method: "POST",
        body,
      }),
      invalidatesTags: ["CommunityPost"],
    }),

    toggleLikePost: builder.mutation<{ data: { liked: boolean; likes: number } }, string>({
      query: (postId) => ({
        url: `/api/v1/community/posts/${postId}/like`,
        method: "POST",
      }),
      invalidatesTags: ["CommunityPost"],
    }),

    // 4. AI Chatbot Agent
    sendChatMessage: builder.mutation<
      {
        success: boolean;
        data: {
          reply: string;
          intent: string;
          richCards?: any;
          quickSuggestions: string[];
          profileContext: any;
        };
      },
      { message: string; sessionId?: string }
    >({
      query: (body) => ({
        url: "/api/v1/chat/message",
        method: "POST",
        body,
      }),
      invalidatesTags: ["ChatSession"],
    }),

    getChatMemory: builder.query<{ success: boolean; data: any[] }, { sessionId?: string }>({
      query: (params) => {
        const q = params?.sessionId ? `?sessionId=${params.sessionId}` : "";
        return `/api/v1/chat/memory${q}`;
      },
      providesTags: ["User"],
    }),

    clearChatSession: builder.mutation<{ success: boolean }, { sessionId?: string }>({
      query: (body) => ({
        url: "/api/v1/chat/session",
        method: "DELETE",
        body,
      }),
      invalidatesTags: ["ChatSession"],
    }),

    // 5. Persistent Chat Sessions Management
    getChatSessions: builder.query<{ success: boolean; data: ServerChatSessionSummary[] }, void>({
      query: () => "/api/v1/chat/sessions",
      providesTags: ["ChatSession"],
    }),

    getChatSessionById: builder.query<{ success: boolean; data: ServerChatSessionDetail }, string>({
      query: (id) => `/api/v1/chat/sessions/${id}`,
      providesTags: (_res, _err, id) => [{ type: "ChatSession", id }],
    }),

    createChatSession: builder.mutation<{ success: boolean; data: ServerChatSessionDetail }, { title?: string } | void>({
      query: (body) => ({
        url: "/api/v1/chat/sessions",
        method: "POST",
        body: body || {},
      }),
      invalidatesTags: ["ChatSession"],
    }),

    updateChatSessionTitle: builder.mutation<
      { success: boolean; data: { id: string; title: string; updatedAt: number } },
      { id: string; title: string }
    >({
      query: ({ id, title }) => ({
        url: `/api/v1/chat/sessions/${id}`,
        method: "PATCH",
        body: { title },
      }),
      invalidatesTags: ["ChatSession"],
    }),

    deleteChatSession: builder.mutation<{ success: boolean; message: string }, string>({
      query: (id) => ({
        url: `/api/v1/chat/sessions/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["ChatSession"],
    }),
  }),
});

export const {
  useGetRecipesQuery,
  useGetRecipeByIdQuery,
  useGetMonthMealPlansQuery,
  useGetMonthSummaryQuery,
  useSaveMealPlanSlotMutation,
  useDeleteMealPlanSlotMutation,
  useGetCommunityPostsQuery,
  useCreateCommunityPostMutation,
  useToggleLikePostMutation,
  useSendChatMessageMutation,
  useGetChatMemoryQuery,
  useClearChatSessionMutation,
  useGetChatSessionsQuery,
  useGetChatSessionByIdQuery,
  useLazyGetChatSessionByIdQuery,
  useCreateChatSessionMutation,
  useUpdateChatSessionTitleMutation,
  useDeleteChatSessionMutation,
} = mealPlannerApi;
