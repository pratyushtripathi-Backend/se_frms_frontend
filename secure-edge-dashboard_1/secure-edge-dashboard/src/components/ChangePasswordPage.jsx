import { useState } from "react";

export default function ChangePasswordPage({ setCurrentPage }) {
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [reEnterPassword, setReEnterPassword] = useState("");

  const handleChangePassword = () => {
    setShowSuccessModal(true);
  };

  const handleContinueToLogin = () => {
    setShowSuccessModal(false);
    setCurrentPage("login");
  };

  return (
    <>
      <div className="flex min-h-full flex-col bg-[#F4F5F9] pl-6 pr-20 pt-6">

        {/* Parent Card */}
        <div className="min-h-[620px] rounded-[20px] bg-white p-6 shadow-sm">

          {/* Change Password Card (nested inside parent) */}
          <div className="overflow-hidden rounded-[14px] border border-[#ECECEC]">

            {/* Header */}

            <div className="border-b border-[#ECECEC] bg-[#F4F7FC] px-8 py-6">

              <h2 className="text-[16px] font-semibold tracking-[0.2px] text-[#202224]">
                Change Password
              </h2>

            </div>

            {/* Body */}

            <div className="px-8 pt-9 pb-10">

              <div className="grid max-w-[940px] grid-cols-3 gap-x-7 gap-y-8">
                {/* Current Password */}
                <div className="flex flex-col">
                  <label className="mb-2 text-[14px] font-medium text-[#202224]">
                    Current Password
                  </label>

                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter Your Current Password"
                    className="
                      h-[50px]
                      w-full
                      rounded-[10px]
                      border
                      border-[#E5E7EB]
                      bg-white
                      px-4
                      text-[14px]
                      text-[#202224]
                      outline-none
                      transition-colors
                      placeholder:text-[#A3A3A3]
                      focus:border-[#BFC7D5]
                    "
                  />
                </div>

                {/* New Password */}
                <div className="flex flex-col">
                  <label className="mb-2 text-[14px] font-medium text-[#202224]">
                    New Password
                  </label>

                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter New Password"
                    className="
                      h-[50px]
                      w-full
                      rounded-[10px]
                      border
                      border-[#E5E7EB]
                      bg-white
                      px-4
                      text-[14px]
                      text-[#202224]
                      outline-none
                      transition-colors
                      placeholder:text-[#A3A3A3]
                      focus:border-[#BFC7D5]
                    "
                  />
                </div>

                {/* Re-enter Password */}
                <div className="flex flex-col">
                  <label className="mb-2 text-[14px] font-medium text-[#202224]">
                    Re-enter Password
                  </label>

                  <input
                    type="password"
                    value={reEnterPassword}
                    onChange={(e) => setReEnterPassword(e.target.value)}
                    placeholder="Re-enter Password"
                    className="
                      h-[50px]
                      w-full
                      rounded-[10px]
                      border
                      border-[#E5E7EB]
                      bg-white
                      px-4
                      text-[14px]
                      text-[#202224]
                      outline-none
                      transition-colors
                      placeholder:text-[#A3A3A3]
                      focus:border-[#BFC7D5]
                    "
                  />
                </div>

              </div>

              {/* Change Password Button */}
              <div className="mt-10 flex items-center">
                <button
                  type="button"
                  onClick={handleChangePassword}
                  className="
                    flex
                    h-[48px]
                    items-center
                    justify-center
                    rounded-[10px]
                    bg-[#111827]
                    px-8
                    text-[14px]
                    font-semibold
                    text-white
                    transition-colors
                    hover:bg-[#1F2937]
                  "
                >
                  Change Password
                </button>
              </div>

              {/* Password Hint */}
              <p className="mt-6 max-w-[760px] text-[13px] leading-[22px] text-[#EB5757]">
                Include: Uppercase letters (A–Z), Lowercase letters (a–z), Numbers (0–9),
                Special characters (!, @, #, $, %, &, *, etc.)
              </p>

            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-6 pb-5 text-center">
          <p className="text-[12px] font-medium text-[#8C8C8C]">
            Copyright@2026 design by secureedge
          </p>
        </footer>

      </div>
      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">

          <div className="w-[90%] max-w-[900px] rounded-[20px] bg-white px-10 py-10 text-center shadow-2xl">

            {/* Lock Image */}
            <img
              src="/Lock.png"
              alt="Password Updated"
              className="mx-auto mb-6 h-[160px] w-[160px] object-contain"
            />

            {/* Title */}
            <h3 className="text-[26px] font-semibold text-[#202224]">
              Password Updated
            </h3>

            {/* Description */}
            <p className="mx-auto mt-3 max-w-[420px] text-[13px] leading-[22px] text-[#7A7A7A]">
              Your password has been changed successfully. For security
              reasons, you may need to sign in again on your devices.
            </p>

            {/* Continue Button */}
            <button
              type="button"
              onClick={handleContinueToLogin}
              className="
                mt-8
                h-[48px]
                rounded-[10px]
                bg-[#111827]
                px-8
                text-[14px]
                font-semibold
                text-white
                transition-colors
                hover:bg-[#1F2937]
              "
            >
              Continue to Login
            </button>

          </div>
        </div>
      )}
    </>
  );
}