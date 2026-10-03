import { baseApi } from "./baseApi";

export interface FavoritesResponse {
  success: boolean;
  data: string[];
}

export const favoriteApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getMyFavorites: builder.query<string[], void>({
      query: () => ({
        url: "/api/v1/favorites",
        method: "GET",
      }),
      transformResponse: (response: FavoritesResponse) => response.data || [],
      providesTags: ["Favorite"],
    }),
    addFavorite: builder.mutation<{ success: boolean; message: string }, string>({
      query: (listingId) => ({
        url: "/api/v1/favorites",
        method: "POST",
        body: { listingId },
      }),
      invalidatesTags: ["Favorite"],
    }),
    removeFavorite: builder.mutation<{ success: boolean; message: string }, string>({
      query: (listingId) => ({
        url: `/api/v1/favorites/${listingId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Favorite"],
    }),
  }),
});

export const {
  useGetMyFavoritesQuery,
  useAddFavoriteMutation,
  useRemoveFavoriteMutation,
} = favoriteApi;
