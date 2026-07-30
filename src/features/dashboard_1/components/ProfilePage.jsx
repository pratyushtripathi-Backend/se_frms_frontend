import { useEffect, useMemo, useState } from "react";
import { Pencil } from "lucide-react";
import { getAuthErrorMessage } from "../../auth/services/authError";
import { getAuthUser, saveAuthUser } from "../../auth/services/authUserSession";
import { getUserProfile, updateUserProfile } from "../services/userProfileService";
import DashboardSuccessModal from "./DashboardSuccessModal";

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
            <img
              src="/admin.png"
              alt="Profile"
              className="h-[150px] w-[150px] rounded-full object-cover"
            />

            <button
              type="button"
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
              "
            >
              <Pencil size={13} />
              Change Photo
            </button>
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

            <button
              type="button"
              onClick={handleEditProfile}
              disabled={isSavingProfile}
              className="
                flex
                h-[34px]
                items-center
                gap-2
                rounded-[8px]
                bg-[#313646]
                px-5
                text-[12px]
                font-medium
                text-white
                hover:bg-[#262B38]
                disabled:cursor-not-allowed
                disabled:opacity-70
              "
            >
              <Pencil size={12} />
              Edit
            </button>
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
          className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/50 px-4"
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

      {successModalMessage && (
        <DashboardSuccessModal
          message={successModalMessage}
          onClose={() => setSuccessModalMessage("")}
          title="Edit Successful"
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
