import apiClient from "../../../services/apiClient";

export function getUserProfile(userId) {
  return apiClient.get(`/users/${userId}`, {
    skipAuthRedirect: true,
  });
}

export async function updateUserProfile(userId, payload) {
  try {
    return await apiClient.put(`/users/${userId}`, payload);
  } catch (error) {
    const isMethodNotSupported =
      error.response?.status === 405 ||
      error.response?.data?.responseMessage
        ?.toLowerCase()
        .includes("method not supported");

    if (!isMethodNotSupported) {
      throw error;
    }

    return apiClient.post(`/users/${userId}`, payload);
  }
}
