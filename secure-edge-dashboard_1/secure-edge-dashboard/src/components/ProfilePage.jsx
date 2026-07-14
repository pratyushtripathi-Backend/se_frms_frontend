import { useState } from "react";
import { Pencil, Lock, Check } from "lucide-react";

export default function ProfilePage() {
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  const details = [
    { label: "Full Name", value: "Ankit Tripathi" },
    { label: "Date of Birth", value: "12-02-1989" },
    { label: "Gender", value: "Female" },
    {
      label: "Address",
      value: "Cyber Height, Vibhuti Khand, 13th floor, Lucknow",
    },
    { label: "Country", value: "India" },
    { label: "Department", value: "Finance" },
    { label: "Designation", value: "Accountant" },
  ];

  const handleChangePassword = () => {
    // TODO: hook this up to your actual password-change API call.
    // Only open the success modal once that call resolves successfully.
    setShowPasswordModal(true);
  };

  const handleContinueToLogin = () => {
    setShowPasswordModal(false);
    // TODO: redirect to your login route, e.g. navigate("/login")
  };

  return (
    <div
      className="
        relative
        mx-auto
        mt-5
        w-[calc(100%-56px)]
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
              "
            >
              <Pencil size={12} />
              Edit
            </button>
          </div>

          <div className="px-7 py-7">
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
          </div>
        </div>
      </div>

      {/* ================= CHANGE PASSWORD ================= */}

      <div
        className="
          mt-5
          w-full
          overflow-hidden
          rounded-[12px]
          border
          border-[#E5E9F0]
          bg-white
          shadow-sm
        "
      >
        <div className="border-b border-[#EDF1F5] bg-[#F6F8FB] px-6 py-5">
          <h2 className="text-[15px] font-semibold text-[#20242C]">
            Change Password
          </h2>
        </div>

        <div className="px-6 py-7">
          <div className="grid grid-cols-3 gap-6">
            <div>
              <label className="mb-2 block text-[13px] font-medium text-[#20242C]">
                Current Password
              </label>

              <input
                type="password"
                placeholder="Enter Your Current Password"
                className="
                  h-[44px]
                  w-full
                  rounded-lg
                  border
                  border-[#E0E3E9]
                  bg-white
                  px-4
                  text-[13px]
                  outline-none
                  placeholder:text-[#A6ABB4]
                  focus:border-[#3B9BF0]
                "
              />
            </div>

            <div>
              <label className="mb-2 block text-[13px] font-medium text-[#20242C]">
                New Password
              </label>

              <input
                type="password"
                placeholder="Enter New Password"
                className="
                  h-[44px]
                  w-full
                  rounded-lg
                  border
                  border-[#E0E3E9]
                  bg-white
                  px-4
                  text-[13px]
                  outline-none
                  placeholder:text-[#A6ABB4]
                  focus:border-[#3B9BF0]
                "
              />
            </div>

            <div>
              <label className="mb-2 block text-[13px] font-medium text-[#20242C]">
                Re-enter Password
              </label>

              <input
                type="password"
                placeholder="Type Re-enter Password"
                className="
                  h-[44px]
                  w-full
                  rounded-lg
                  border
                  border-[#E0E3E9]
                  bg-white
                  px-4
                  text-[13px]
                  outline-none
                  placeholder:text-[#A6ABB4]
                  focus:border-[#3B9BF0]
                "
              />
            </div>
          </div>

          <button
            type="button"
            onClick={handleChangePassword}
            className="
              mt-7
              flex
              h-[46px]
              items-center
              justify-center
              rounded-[8px]
              bg-[#313646]
              px-8
              text-[14px]
              font-medium
              text-white
              transition
              hover:bg-[#262B38]
            "
          >
            Change Password
          </button>

          <p className="mt-4 text-[12px] text-[#E0453C] leading-5">
            Include: Uppercase letters (A-Z), Lowercase letters (a-z),
            Numbers (0-9), Special characters (!, @, #, $, %, etc.)
          </p>
        </div>
      </div>

      {/* Footer */}
      <footer className="mt- pb-5 text-center">
        <p className="text-[12px] font-medium text-[#8C8C8C]">
          Copyright@2026 design by secureedge
        </p>
      </footer>

      {/* ================= PASSWORD UPDATED MODAL ================= */}
      {showPasswordModal && (
        <div
          className="
            fixed
            inset-0
            z-50
            flex
            items-center
            justify-center
            bg-black/50
            px-4
          "
          role="dialog"
          aria-modal="true"
          aria-labelledby="password-updated-title"
        >
          <div
            className="
              w-full
              max-w-[440px]
              rounded-[16px]
              bg-white
              px-8
              py-10
              text-center
              shadow-xl
            "
          >
            {/* Icon */}
            <div className="relative mx-auto mb-6 flex h-[110px] w-[110px] items-center justify-center">
              {/* decorative dashed/burst ring */}
              <svg
                viewBox="0 0 110 110"
                className="absolute inset-0 h-full w-full"
                fill="none"
              >
                <circle
                  cx="55"
                  cy="55"
                  r="48"
                  stroke="#F3D3D1"
                  strokeWidth="1.5"
                  strokeDasharray="3 6"
                />
                <path
                  d="M85 20l3 3M90 30l4 1M18 85l3-3M14 74l4-1"
                  stroke="#E0453C"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>

              {/* lock badge */}
              <div className="flex h-[74px] w-[74px] items-center justify-center rounded-2xl bg-[#F3F4F6] shadow-sm">
                <Lock size={30} className="text-[#20242C]" strokeWidth={2} />
              </div>

              {/* check badge */}
              <div className="absolute bottom-0 right-1 flex h-[26px] w-[26px] items-center justify-center rounded-full bg-[#E0453C] ring-4 ring-white">
                <Check size={15} className="text-white" strokeWidth={3} />
              </div>
            </div>

            <h2
              id="password-updated-title"
              className="text-[20px] font-bold text-[#20242C]"
            >
              Password Updated
            </h2>

            <p className="mx-auto mt-3 max-w-[320px] text-[13px] leading-5 text-[#6B7280]">
              Your password has been changed successfully. For security
              reasons, you may need to sign in again on your devices
            </p>

            <button
              type="button"
              onClick={handleContinueToLogin}
              className="
                mt-7
                inline-flex
                h-[46px]
                w-full
                max-w-[260px]
                items-center
                justify-center
                rounded-[8px]
                bg-[#313646]
                text-[14px]
                font-medium
                text-white
                transition
                hover:bg-[#262B38]
              "
            >
              Continue to Login
            </button>
          </div>
        </div>
      )}
    </div>
  );
}