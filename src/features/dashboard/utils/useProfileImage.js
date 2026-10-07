import { useCallback, useEffect, useRef, useState } from "react";
import { getUserProfileImage } from "../services/userProfileService";

// Fired after a successful upload so every place showing the avatar (header,
// Profile page) reloads it.
export const PROFILE_IMAGE_CHANGED_EVENT = "frms-profile-image-changed";

export function notifyProfileImageChanged() {
  window.dispatchEvent(new Event(PROFILE_IMAGE_CHANGED_EVENT));
}

// Loads the signed-in user's profile image (GET /users/{id}/profile-image)
// and returns an object URL for <img src>, or `null` when the user has no
// image yet (404) or it can't be loaded - callers then show the default
// avatar. Reloads whenever notifyProfileImageChanged() is called.
export function useProfileImage(userId) {
  const [imageUrl, setImageUrl] = useState(null);
  const objectUrlRef = useRef(null);
  const requestIdRef = useRef(0);

  const loadImage = useCallback(async () => {
    const requestId = ++requestIdRef.current;

    if (!userId) {
      setImageUrl(null);
      return;
    }

    try {
      const response = await getUserProfileImage(userId);
      if (requestId !== requestIdRef.current) return;

      const nextUrl = URL.createObjectURL(response.data);
      if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = nextUrl;
      setImageUrl(nextUrl);
    } catch {
      if (requestId !== requestIdRef.current) return;
      // 404 = no image uploaded yet; anything else - keep it quiet and fall
      // back to the default avatar.
      if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
      setImageUrl(null);
    }
  }, [userId]);

  useEffect(() => {
    loadImage();

    window.addEventListener(PROFILE_IMAGE_CHANGED_EVENT, loadImage);

    return () => {
      window.removeEventListener(PROFILE_IMAGE_CHANGED_EVENT, loadImage);
    };
  }, [loadImage]);

  // Free the last object URL when the component goes away.
  useEffect(
    () => () => {
      if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    },
    [],
  );

  return imageUrl;
}
