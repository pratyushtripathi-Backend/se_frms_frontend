import apiClient from "../../../services/apiClient";

export function getLoginSessions({ page = 0, size = 10, email = "" } = {}) {
  return apiClient.get("/auth/sessions", {
    params: {
      page,
      size,
      email,
    },
    skipAuthRedirect: true,
  });
}
