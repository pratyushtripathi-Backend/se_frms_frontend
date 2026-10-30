import apiClient from "../../../services/apiClient";

const transactionApiBaseUrl =
  import.meta.env.VITE_TRANSACTION_API_BASE_URL ?? "http://localhost:8085/api/v1";

// fromDate / toDate (YYYY-MM-DD) are optional and inclusive: the backend
// returns transactions created from the start of fromDate up to the end of
// toDate, and totalElements / totalPages are for that filtered set.
export function getTransactions({ page = 0, size = 10, fromDate, toDate } = {}) {
  return apiClient.get(`${transactionApiBaseUrl}/transactions`, {
    params: {
      page,
      size,
      ...(fromDate ? { fromDate } : {}),
      ...(toDate ? { toDate } : {}),
    },
    skipAuthRedirect: true,
  });
}
