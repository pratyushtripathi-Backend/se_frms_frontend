import apiClient from "../../../services/apiClient";

export function getLoginAttempts({ page = 0, size = 10, search = "" } = {}) {
  return apiClient.get("/auth/login-attempt", {
    params: {
      page,
      size,
      ...(search.trim() ? { search: search.trim() } : {}),
    },
    skipAuthRedirect: true,
  });
}
