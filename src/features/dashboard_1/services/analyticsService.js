import apiClient from "../../../services/apiClient";

const analyticsApiBaseUrl =
  import.meta.env.VITE_ANALYTICS_API_BASE_URL ?? "http://localhost:8085/api/v1";

export function getAnalyticsSummary() {
  return apiClient.get(`${analyticsApiBaseUrl}/analytics/summary`, {
    skipAuthRedirect: true,
  });
}

export function getDailyTransactionVolume({ fromDate, toDate } = {}) {
  return apiClient.get(`${analyticsApiBaseUrl}/analytics/transactions/daily`, {
    params: { fromDate, toDate },
    skipAuthRedirect: true,
  });
}

export function getTransactionsByChannel({ fromDate, toDate } = {}) {
  return apiClient.get(`${analyticsApiBaseUrl}/analytics/transactions/by-channel`, {
    params: { fromDate, toDate },
    skipAuthRedirect: true,
  });
}

export function getFraudTrend({ groupBy, fromDate, toDate } = {}) {
  return apiClient.get(`${analyticsApiBaseUrl}/analytics/fraud-trend`, {
    params: { groupBy, fromDate, toDate },
    skipAuthRedirect: true,
  });
}
