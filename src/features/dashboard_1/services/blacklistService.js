import apiClient from "../../../services/apiClient";

// This one already matches apiClient's default baseURL
// (VITE_API_BASE_URL ?? "http://localhost:8080/api/v1"), so no separate
// *_BASE_URL override is needed here like the other feature services use.
const BLACKLIST_ENTRIES_PATH = "/admin/blacklist-entries";

export function getBlacklistEntries({ page = 0, size = 10 } = {}) {
  return apiClient.get(BLACKLIST_ENTRIES_PATH, {
    params: {
      page,
      size,
    },
    skipAuthRedirect: true,
  });
}

export function createBlacklistEntry(payload) {
  return apiClient.post(BLACKLIST_ENTRIES_PATH, payload, {
    skipAuthRedirect: true,
  });
}

export function removeBlacklistEntry(id) {
  return apiClient.patch(`${BLACKLIST_ENTRIES_PATH}/${id}/remove`, null, {
    skipAuthRedirect: true,
  });
}
