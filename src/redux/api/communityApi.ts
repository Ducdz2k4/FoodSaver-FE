import { baseApi } from "./baseApi";

export interface CommunityCommentDTO {
  id: string;
  postId: string;
  userId?: string | null;
  authorName: string;
  authorAvatar?: string | null;
  content: string;
  createdAt: string;
  updatedAt?: string;
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
  imageUrl?: string | null;
  category: string;
  likes: number;
  comments: number;
  bookmarks: number;
  views: number;
  tags: string[];
  isLiked?: boolean;
  isBookmarked?: boolean;
  recipeData?: {
    cookTime: number;
    servings: number;
    calories: number;
    cost: number;
    ingredients: { name: string; amount: string; unit: string }[];
    steps: string[];
  } | null;
  mealPlan?: {
    title?: string;
    days?: {
      day: number;
      meals: {
        dayOffset?: number;
        slot: string;
        meal: string;
        calories?: number;
        cost?: number;
        ingredients?: string[];
      }[];
    }[];
    meals?: {
      dayOffset?: number;
      slot: string;
      meal: string;
      calories?: number;
      cost?: number;
      ingredients?: string[];
    }[];
  } | null;
  createdAt: string;
  updatedAt: string;
  postComments?: CommunityCommentDTO[];
}

export interface TrendingTagDTO {
  tag: string;
  count: number;
}

export interface TopContributorDTO {
  userId?: string | null;
  name: string;
  avatar: string;
  badge: string;
  postCount: number;
  totalLikes: number;
}

export const communityApi = baseApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    getCommunityPosts: builder.query<
      { data: CommunityPostDTO[]; meta?: { total: number; page: number; limit: number; totalPages: number } },
      {
        category?: string;
        tag?: string;
        search?: string;
        sortBy?: string;
        bookmarkedOnly?: boolean;
        page?: number;
        limit?: number;
      } | void
    >({
      query: (params) => {
        const q = new URLSearchParams();
        if (params?.category && params.category !== "all" && params.category !== "ALL") {
          q.append("category", params.category);
        }
        if (params?.tag) q.append("tag", params.tag);
        if (params?.search && params.search.trim()) q.append("search", params.search.trim());
        if (params?.sortBy) q.append("sortBy", params.sortBy);
        if (params?.bookmarkedOnly) q.append("bookmarkedOnly", "true");
        if (params?.page) q.append("page", String(params.page));
        if (params?.limit) q.append("limit", String(params.limit));
        return `/api/v1/community/posts?${q.toString()}`;
      },
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ id }) => ({ type: "CommunityPost" as const, id })),
              { type: "CommunityPost", id: "LIST" },
            ]
          : [{ type: "CommunityPost", id: "LIST" }],
    }),

    getCommunityPostById: builder.query<{ data: CommunityPostDTO }, string>({
      query: (id) => `/api/v1/community/posts/${id}`,
      providesTags: (_result, _err, id) => [{ type: "CommunityPost", id }],
    }),

    createCommunityPost: builder.mutation<
      { data: CommunityPostDTO; message: string },
      {
        title: string;
        content: string;
        imageUrl?: string | null;
        category?: string;
        tags?: string[];
        authorName?: string;
        authorAvatar?: string;
        recipeData?: any;
        mealPlan?: any;
      }
    >({
      query: (body) => ({
        url: "/api/v1/community/posts",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "CommunityPost", id: "LIST" }],
    }),

    deleteCommunityPost: builder.mutation<{ success: boolean; message: string }, string>({
      query: (id) => ({
        url: `/api/v1/community/posts/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "CommunityPost", id: "LIST" }],
    }),

    toggleLikePost: builder.mutation<{ data: { liked: boolean; likes: number } }, string>({
      query: (postId) => ({
        url: `/api/v1/community/posts/${postId}/like`,
        method: "POST",
      }),
      invalidatesTags: (_res, _err, postId) => [
        { type: "CommunityPost", id: postId },
        { type: "CommunityPost", id: "LIST" },
      ],
    }),

    toggleBookmarkPost: builder.mutation<{ data: { bookmarked: boolean; bookmarks: number } }, string>({
      query: (postId) => ({
        url: `/api/v1/community/posts/${postId}/bookmark`,
        method: "POST",
      }),
      invalidatesTags: (_res, _err, postId) => [
        { type: "CommunityPost", id: postId },
        { type: "CommunityPost", id: "LIST" },
      ],
    }),

    getPostComments: builder.query<{ data: CommunityCommentDTO[] }, string>({
      query: (postId) => `/api/v1/community/posts/${postId}/comments`,
      providesTags: (_res, _err, postId) => [{ type: "CommunityComment", id: postId }],
    }),

    addPostComment: builder.mutation<
      { data: CommunityCommentDTO; message: string },
      { postId: string; content: string; authorName?: string; authorAvatar?: string }
    >({
      query: ({ postId, ...body }) => ({
        url: `/api/v1/community/posts/${postId}/comments`,
        method: "POST",
        body,
      }),
      invalidatesTags: (_res, _err, { postId }) => [
        { type: "CommunityComment", id: postId },
        { type: "CommunityPost", id: postId },
        { type: "CommunityPost", id: "LIST" },
      ],
    }),

    deletePostComment: builder.mutation<
      { success: boolean; message: string },
      { postId: string; commentId: string }
    >({
      query: ({ postId, commentId }) => ({
        url: `/api/v1/community/posts/${postId}/comments/${commentId}`,
        method: "DELETE",
      }),
      invalidatesTags: (_res, _err, { postId }) => [
        { type: "CommunityComment", id: postId },
        { type: "CommunityPost", id: postId },
        { type: "CommunityPost", id: "LIST" },
      ],
    }),

    getTrendingTags: builder.query<{ data: TrendingTagDTO[] }, void>({
      query: () => "/api/v1/community/trending-tags",
      providesTags: [{ type: "CommunityPost", id: "TAGS" }],
    }),

    getTopContributors: builder.query<{ data: TopContributorDTO[] }, void>({
      query: () => "/api/v1/community/top-contributors",
      providesTags: [{ type: "CommunityPost", id: "CONTRIBUTORS" }],
    }),

    importMealPlan: builder.mutation<
      { success: boolean; importedCount: number; message: string },
      { postId: string; startDate?: string }
    >({
      query: ({ postId, startDate }) => ({
        url: `/api/v1/community/posts/${postId}/import-plan`,
        method: "POST",
        body: { startDate },
      }),
      invalidatesTags: ["MealPlan"],
    }),
  }),
});

export const {
  useGetCommunityPostsQuery,
  useGetCommunityPostByIdQuery,
  useCreateCommunityPostMutation,
  useDeleteCommunityPostMutation,
  useToggleLikePostMutation,
  useToggleBookmarkPostMutation,
  useGetPostCommentsQuery,
  useAddPostCommentMutation,
  useDeletePostCommentMutation,
  useGetTrendingTagsQuery,
  useGetTopContributorsQuery,
  useImportMealPlanMutation,
} = communityApi;
