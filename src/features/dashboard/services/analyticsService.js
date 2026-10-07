import apiClient from "../../../services/apiClient";

const analyticsApiBaseUrl =
  import.meta.env.VITE_ANALYTICS_API_BASE_URL ?? "http://localhost:8085/api/v1";

// Today's date from the user's LOCAL calendar. toISOString() converts to UTC
// first, so in IST between 00:00 and 05:30 it gave yesterday's date and the
// dashboard stats showed yesterday's numbers.
function localIsoDate(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

// The backend counts only records created between fromDate and toDate, so
// every stat card (including "Today's Transactions") is for today.
export function getAnalyticsSummary() {
  const today = localIsoDate();

  return apiClient.get(`${analyticsApiBaseUrl}/analytics/summary`, {
    params: {
      fromDate: today,
      toDate: today,
    },
    skipAuthRedirect: true,
  });
}

// Powers the "Transaction Monitoring" graph's date filter on the Dashboard.
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
