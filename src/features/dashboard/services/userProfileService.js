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

// PUT /api/v1/users/{id}/profile-image  (multipart/form-data, part "file")
// JPG, PNG or WEBP, up to 2 MB. Returns the updated user (hasProfileImage,
// profileImageUrl, ...) in responseData.
//
// The explicit multipart Content-Type matters: apiClient defaults to JSON,
// and axios would otherwise serialise the FormData as JSON. With it set,
// axios sends the FormData as-is and the browser adds the boundary.
export function uploadUserProfileImage(userId, file) {
  const formData = new FormData();
  formData.append("file", file);

  return apiClient.put(`/users/${userId}/profile-image`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
    skipAuthRedirect: true,
  });
}

// GET /api/v1/users/{id}/profile-image -> the raw image (404 = no image).
// The endpoint needs the login token, which a plain <img src> can't send, so
// the image is downloaded through apiClient and shown via an object URL.
export function getUserProfileImage(userId) {
  return apiClient.get(`/users/${userId}/profile-image`, {
    responseType: "blob",
    // Cache-buster, so a just-uploaded image is never served stale.
    params: { v: Date.now() },
    skipAuthRedirect: true,
  });
}
