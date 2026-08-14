import apiClient from "../../../services/apiClient";

export function getLoginHistory({
  page = 0,
  size = 10,
  search = "",
} = {}) {
  return apiClient.get("/auth/login-history", {
    params: {
      page,
      size,
      search,
    },
    skipAuthRedirect: true,
  });
}
