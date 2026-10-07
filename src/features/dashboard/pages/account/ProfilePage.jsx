import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Pencil, X, ZoomIn } from "lucide-react";
import { getAuthErrorMessage } from "../../../auth/services/authError";
import { getAuthUser, saveAuthUser } from "../../../auth/services/authUserSession";
import {
  getUserProfile,
  updateUserProfile,
  uploadUserProfileImage,
} from "../../services/userProfileService";
import { notifyProfileImageChanged, useProfileImage } from "../../utils/useProfileImage";
import DashboardEditButton from "../../components/DashboardEditButton";
import DashboardSuccessModal from "../../components/DashboardSuccessModal";

// Same limits as the backend (PUT /users/{id}/profile-image), checked first
// so an unsupported file gets a clear message without a round trip.
const PROFILE_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
const PROFILE_IMAGE_MAX_BYTES = 2 * 1024 * 1024;

export default function ProfilePage() {
  const authUser = useMemo(() => getAuthUser(), []);
  const [profile, setProfile] = useState(null);
  const [profileForm, setProfileForm] = useState({
    name: "",
    email: "",
    phoneNumber: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileMessage, setProfileMessage] = useState("");
  const [successModalMessage, setSuccessModalMessage] = useState("");
  const [successModalTitle, setSuccessModalTitle] = useState("Edit Successful");
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [photoError, setPhotoError] = useState("");
  const photoInputRef = useRef(null);
  // Full-size photo viewer (opened by clicking the round profile photo).
  const [isPhotoViewerOpen, setIsPhotoViewerOpen] = useState(false);
  // The uploaded image (GET /users/{id}/profile-image), or null -> default.
  const profileImageUrl = useProfileImage(authUser.id);
  const fullName = [profile?.firstName, profile?.lastName].filter(Boolean).join(" ");
  const details = [
    {
      editable: true,
      key: "name",
      label: "Name",
      value: fullName || "-",
    },
    { label: "Date of Birth", value: "12-02-1989" },
    {
      editable: true,
      key: "phoneNumber",
      label: "Phone Number",
      value: profile?.phoneNumber || "-",
    },
    {
      editable: true,
      key: "email",
      label: "Email",
      value: profile?.email || "-",
    },
    { label: "Country", value: "India" },
    { label: "Department", value: "Finance" },
    { label: "Designation", value: profile?.role || "-" },
  ];

  useEffect(() => {
    let isActive = true;

    async function loadProfile() {
      if (!authUser.id) {
        setError("User id is missing. Please login again.");
        return;
      }

      setIsLoading(true);
      setError("");

      try {
        const response = await getUserProfile(authUser.id);
        const profileData = response.data?.responseData ?? response.data?.data ?? response.data;

        if (!isActive) return;

        setProfile(profileData);
        setProfileForm({
          name: [profileData?.firstName, profileData?.lastName].filter(Boolean).join(" "),
          email: profileData?.email ?? "",
          phoneNumber: profileData?.phoneNumber ?? "",
        });
        saveAuthUser(profileData);
      } catch (profileError) {
        if (!isActive) return;

        setError(
          getAuthErrorMessage(
            profileError,
            "Unable to load profile details. Please try again.",
          ),
        );
        setProfile(null);
      } finally {
        if (isActive) setIsLoading(false);
      }
    }

    loadProfile();

    return () => {
      isActive = false;
    };
  }, [authUser.id]);

  useEffect(() => {
    if (!profileMessage) {
      return undefined;
    }

    const messageTimer = window.setTimeout(() => {
      setProfileMessage("");
    }, 2500);

    return () => window.clearTimeout(messageTimer);
  }, [profileMessage]);

  // Esc closes the full-size photo viewer.
  useEffect(() => {
    if (!isPhotoViewerOpen) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") setIsPhotoViewerOpen(false);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isPhotoViewerOpen]);

  const handleChangePhotoClick = () => {
    setPhotoError("");
    photoInputRef.current?.click();
  };

  const handlePhotoSelected = async (event) => {
    const file = event.target.files?.[0];
    // Reset so picking the same file again still triggers onChange.
    event.target.value = "";

    if (!file) return;

    if (!authUser.id) {
      setPhotoError("User id is missing. Please login again.");
      return;
    }

    if (!PROFILE_IMAGE_TYPES.includes(file.type)) {
      setPhotoError("Please choose a JPG, PNG or WEBP image.");
      return;
    }

    if (file.size > PROFILE_IMAGE_MAX_BYTES) {
      setPhotoError("Image must be 2 MB or smaller.");
      return;
    }

    setPhotoError("");
    setIsUploadingPhoto(true);

    try {
      const response = await uploadUserProfileImage(authUser.id, file);
      const updatedProfile =
        response.data?.responseData ?? response.data?.data ?? null;

      if (updatedProfile) setProfile(updatedProfile);

      // Reload the avatar here and in the header.
      notifyProfileImageChanged();
      setSuccessModalTitle("Photo Updated");
      setSuccessModalMessage(
        response.data?.responseMessage ?? "Profile image uploaded successfully",
      );
    } catch (uploadError) {
      setPhotoError(
        getAuthErrorMessage(
          uploadError,
          "Unable to upload profile image. Please try again.",
        ),
      );
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  const handleProfileFormChange = (event) => {
    const { name, value } = event.target;

    setProfileForm((currentForm) => ({
      ...currentForm,
      [name]: value,
    }));
  };

  const handleEditProfile = () => {
    setProfileMessage("");
    setIsEditingProfile(true);
  };

  const handleCancelProfileEdit = () => {
    setProfileMessage("");
    setIsEditingProfile(false);
    setProfileForm({
      name: fullName,
      email: profile?.email ?? "",
      phoneNumber: profile?.phoneNumber ?? "",
    });
  };

  const handleSaveProfile = async () => {
    setError("");
    setProfileMessage("");

    if (!authUser.id) {
      setError("User id is missing. Please login again.");
      return;
    }

    const [firstName, ...lastNameParts] = profileForm.name.trim().split(/\s+/);

    if (!firstName || !profileForm.email.trim() || !profileForm.phoneNumber.trim()) {
      setError("Name, email, and phone number are required.");
      return;
    }

    setIsSavingProfile(true);

    try {
      const response = await updateUserProfile(authUser.id, {
        firstName,
        lastName: lastNameParts.join(" "),
        email: profileForm.email.trim(),
        phoneNumber: profileForm.phoneNumber.trim(),
      });

      if (document.getElementById("frms-logout-required-popup")) {
        setIsEditingProfile(false);
        return;
      }

      const updatedProfile =
        response.data?.responseData ?? response.data?.data ?? response.data;

      setProfile(updatedProfile);
      setProfileForm({
        name: [updatedProfile?.firstName, updatedProfile?.lastName]
          .filter(Boolean)
          .join(" "),
        email: updatedProfile?.email ?? "",
        phoneNumber: updatedProfile?.phoneNumber ?? "",
      });
      saveAuthUser(updatedProfile);
      const nextMessage =
        response.data?.responseMessage ?? "User updated successfully.";
      setProfileMessage(nextMessage);
      setSuccessModalTitle("Edit Successful");
      setSuccessModalMessage(nextMessage);
      setIsEditingProfile(false);
    } catch (profileError) {
      setError(
        getAuthErrorMessage(
          profileError,
          "Unable to update profile details. Please try again.",
        ),
      );
    } finally {
      setIsSavingProfile(false);
    }
  };

  return (
    <div
  className="
    mx-auto
    mt-5
    w-[calc(100%-48px)]
    max-w-[1515px]
    min-h-[392px]
    rounded-[12px]
    border
    border-[#E5E9F0]
    bg-white
    px-10
    pt-7
    pb-0
  "
>
      {/* ================= TOP SECTION ================= */}

      <div
        className="
          mx-auto
          flex
          w-full
          gap-7
        "
      >
        {/* ================= CHANGE PROFILE PHOTO ================= */}

        <div
          className="
            w-[420px]
            h-[430px]
            overflow-hidden
            rounded-[12px]
            border
            border-[#E5E9F0]
            bg-white
            shadow-sm
            flex-shrink-5
          "
        >
          <div className="border-b border-[#EDF1F5] bg-[#F6F8FB] px-6 py-5">
            <h2 className="text-[15px] font-semibold text-[#20242C]">
              Change Profile Photo
            </h2>
          </div>

          <div className="flex flex-col items-center pt-8">
            <button
              type="button"
              onClick={() => setIsPhotoViewerOpen(true)}
              disabled={isUploadingPhoto}
              title="View full photo"
              className="group relative h-[150px] w-[150px] cursor-zoom-in rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-[#3B9BF0] focus-visible:ring-offset-2 disabled:cursor-default"
            >
              <img
                src={profileImageUrl || "/admin.png"}
                alt="Profile"
                className={`h-[150px] w-[150px] rounded-full object-cover transition-opacity ${
                  isUploadingPhoto ? "opacity-50" : "opacity-100"
                }`}
              />

              {/* Hover hint: click to see the whole photo. */}
              {!isUploadingPhoto && (
                <span className="absolute inset-0 flex items-center justify-center rounded-full bg-black/0 text-white opacity-0 transition group-hover:bg-black/35 group-hover:opacity-100">
                  <ZoomIn size={26} />
                </span>
              )}

              {isUploadingPhoto && (
                <span className="absolute inset-0 flex items-center justify-center">
                  <span className="h-7 w-7 animate-spin rounded-full border-2 border-[#D1D5DB] border-t-[#333333]" />
                </span>
              )}
            </button>

            <input
              ref={photoInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={handlePhotoSelected}
            />

            <button
              type="button"
              onClick={handleChangePhotoClick}
              disabled={isUploadingPhoto}
              className="
                mt-7
                flex
                h-[42px]
                items-center
                justify-center
                gap-2
                rounded-[7px]
                bg-[#6F6F6F]
                px-7
                text-[13px]
                font-medium
                text-white
                transition
                hover:bg-[#5C5C5C]
                disabled:cursor-not-allowed
                disabled:opacity-70
              "
            >
              <Pencil size={13} />
              {isUploadingPhoto ? "Uploading..." : "Change Photo"}
            </button>

            <p className="mt-3 text-[11px] text-[#8C8C8C]">
              JPG, PNG or WEBP, up to 2 MB
            </p>

            {photoError && (
              <p className="mx-6 mt-2 text-center text-[12px] font-semibold text-[#E0453C]">
                {photoError}
              </p>
            )}
          </div>
        </div>

        {/* ================= PROFILE DETAILS ================= */}

        <div
          className="
            flex-1
            h-[430px]
            overflow-hidden
            rounded-[12px]
            border
            border-[#E5E9F0]
            bg-white
            shadow-sm
          "
        >
          <div className="flex items-center justify-between border-b border-[#EDF1F5] bg-[#F6F8FB] px-7 py-4">
            <h2 className="text-[15px] font-semibold text-[#20242C]">
              Profile details &amp; Settings
            </h2>

            <DashboardEditButton
              onClick={handleEditProfile}
              disabled={isSavingProfile}
              className="h-[34px] gap-2 rounded-[8px]"
            >
              <Pencil size={12} />
              Edit
            </DashboardEditButton>
          </div>

          <div className="px-7 py-7">
            {isLoading && (
              <p className="text-[14px] font-semibold text-[#4B4F58]">
                Loading profile details...
              </p>
            )}

            {error && (
              <p className="rounded-lg bg-red-50 px-4 py-3 text-[13px] font-semibold text-[#E0453C]">
                {error}
              </p>
            )}

            {profileMessage && (
              <p className="mb-4 rounded-lg bg-green-50 px-4 py-3 text-[13px] font-semibold text-green-700">
                {profileMessage}
              </p>
            )}

            {!isLoading && !error && (
              <dl className="space-y-5">
                            {details.map((item) => (
                <div
                  key={item.label}
                  className="
                    grid
                    grid-cols-[170px_1fr]
                    items-start
                    text-[14px]
                  "
                >
                  <dt className="font-semibold text-[#20242C]">
                    {item.label}
                  </dt>

                  <dd className="leading-6 text-[#4B4F58]">
                    {item.value}
                  </dd>
                </div>
              ))}
              </dl>
            )}
          </div>
        </div>
      </div>

      {isEditingProfile && (
        <div
          className="frms-modal-overlay fixed inset-0 z-[1000] flex items-center justify-center bg-black/50 px-4"
          onClick={handleCancelProfileEdit}
        >
          <div
            className="relative w-[620px] max-w-[92vw] rounded-[14px] bg-white px-9 py-8 shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-7 flex items-start justify-between">
              <div>
                <h3 className="text-[18px] font-bold text-[#202224]">
                  Edit Profile
                </h3>
                <p className="mt-1 text-[13px] text-[#7A7A7A]">
                  Update profile details and save changes.
                </p>
              </div>

              <button
                type="button"
                onClick={handleCancelProfileEdit}
                disabled={isSavingProfile}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-[#111827] text-[14px] font-semibold text-white disabled:cursor-not-allowed disabled:opacity-70"
              >
                x
              </button>
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <ProfileModalInput
                label="Name"
                name="name"
                onChange={handleProfileFormChange}
                value={profileForm.name}
              />

              <ProfileModalInput
                label="Email"
                name="email"
                onChange={handleProfileFormChange}
                type="email"
                value={profileForm.email}
              />

              <ProfileModalInput
                label="Phone Number"
                name="phoneNumber"
                onChange={handleProfileFormChange}
                value={profileForm.phoneNumber}
              />
            </div>

            <div className="mt-8 flex justify-end gap-3">
              <button
                type="button"
                onClick={handleCancelProfileEdit}
                disabled={isSavingProfile}
                className="h-[42px] rounded-[8px] border border-[#D1D5DB] bg-white px-5 text-[13px] font-semibold text-[#4B5563] disabled:cursor-not-allowed disabled:opacity-70"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleSaveProfile}
                disabled={isSavingProfile}
                className="h-[42px] rounded-[8px] bg-[#555555] px-6 text-[13px] font-semibold text-white transition hover:bg-[#444444] disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isSavingProfile ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Full-size photo viewer: the whole image, uncropped, scaled to fit
          the screen. Closes on the X, a click outside the image, or Esc. */}
      {isPhotoViewerOpen &&
        createPortal(
          <div
            className="frms-modal-overlay fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 p-6"
            onClick={() => setIsPhotoViewerOpen(false)}
          >
            <div
              className="relative"
              onClick={(event) => event.stopPropagation()}
            >
              <img
                src={profileImageUrl || "/admin.png"}
                alt={fullName || "Profile photo"}
                className="block max-h-[85vh] max-w-[90vw] rounded-[12px] object-contain shadow-2xl"
              />

              <button
                type="button"
                onClick={() => setIsPhotoViewerOpen(false)}
                aria-label="Close"
                className="absolute -right-3 -top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white text-[#202224] shadow-lg transition hover:bg-[#F3F4F6]"
              >
                <X size={18} />
              </button>
            </div>
          </div>,
          document.body,
        )}

      {successModalMessage && (
        <DashboardSuccessModal
          message={successModalMessage}
          onClose={() => setSuccessModalMessage("")}
          title={successModalTitle}
        />
      )}
    </div>
  );
}

function ProfileModalInput({ label, name, onChange, type = "text", value }) {
  return (
    <label className="flex flex-col gap-2">
      <span className="text-[13px] font-semibold text-[#333333]">{label}</span>
      <input
        className="h-[46px] rounded-[8px] border border-[#E5E7EB] bg-white px-3.5 text-[13px] text-[#202224] outline-none [color-scheme:light] placeholder:text-[#8B8B8B] focus:border-[#3B9BF0]"
        name={name}
        onChange={onChange}
        type={type}
        value={value}
      />
    </label>
  );
}
