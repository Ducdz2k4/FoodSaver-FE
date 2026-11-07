import { baseApi } from "../baseApi";

export interface XGateTransaction {
  id: string;
  amount: number;
  currency: string;
  type: "in" | "out";
  content: string;
  sender_account?: string;
  sender_bank_name?: string;
  receiver_account: string;
  receiver_bank_name: string;
  transaction_date: string;
  created_at: string;
}

export interface XGatePagination {
  limit: number;
  page: number;
  total: number;
  total_pages: number;
}

export interface XGateTransactionsResponse {
  pagination: XGatePagination;
  transactions: XGateTransaction[];
}

export interface XGateFilterParams {
  limit?: number;
  page?: number;
  type?: "in" | "out" | "";
  bank?: string;
  account?: string;
  content?: string;
  amount_min?: number;
  amount_max?: number;
  date_from?: string;
  date_to?: string;
  sort?: string;
}

export interface BankConfigData {
  bankName: string;
  bankCode: string;
  accountNumber: string;
  accountName: string;
  qrTemplate: string;
}

export const adminTransactionApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // 1. Lấy danh sách giao dịch ngân hàng từ xGate
    getXGateTransactions: builder.query<XGateTransactionsResponse, XGateFilterParams | void>({
      query: (params) => ({
        url: "/api/v1/payments/xgate/transactions",
        method: "GET",
        params: params || {},
      }),
      transformResponse: (res: any) => res.data || { pagination: { limit: 50, page: 1, total: 0, total_pages: 0 }, transactions: [] },
      providesTags: ["Admin", "Order"],
    }),

    // 2. Kích hoạt đối soát tự động tức thì
    syncXGateTransactions: builder.mutation<{ matched: number; checked: number; message: string; matchedOrders?: any[] }, void>({
      query: () => ({
        url: "/api/v1/payments/xgate/sync",
        method: "POST",
      }),
      transformResponse: (res: any) => res.data,
      invalidatesTags: ["Admin", "Order", "PartnerOrder"],
    }),

    // 3. Lấy thông tin cấu hình tài khoản ngân hàng
    getBankConfig: builder.query<BankConfigData, void>({
      query: () => ({
        url: "/api/v1/payments/bank-config",
        method: "GET",
      }),
      transformResponse: (res: any) => res.data,
    }),
  }),
});

export const {
  useGetXGateTransactionsQuery,
  useSyncXGateTransactionsMutation,
  useGetBankConfigQuery,
} = adminTransactionApi;
