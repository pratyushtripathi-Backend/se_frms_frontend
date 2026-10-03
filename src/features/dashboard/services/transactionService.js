import apiClient from "../../../services/apiClient";

const transactionApiBaseUrl =
  import.meta.env.VITE_TRANSACTION_API_BASE_URL ?? "http://localhost:8085/api/v1";

export function getTransactions({ page = 0, size = 10 } = {}) {
  return apiClient.get(`${transactionApiBaseUrl}/transactions`, {
    params: {
      page,
      size,
    },
    skipAuthRedirect: true,
  });
}
