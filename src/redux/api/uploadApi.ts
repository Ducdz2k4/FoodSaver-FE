import { baseApi } from "./baseApi";

export interface UploadResponse {
  success: boolean;
  message: string;
  data: {
    url: string;
    publicId: string;
  };
}

export const uploadApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    uploadImage: builder.mutation<{ url: string; publicId: string }, FormData>({
      query: (formData) => ({
        url: "/api/v1/upload/single",
        method: "POST",
        body: formData,
      }),
      transformResponse: (response: UploadResponse) => response.data,
    }),
  }),
});

export const { useUploadImageMutation } = uploadApi;
