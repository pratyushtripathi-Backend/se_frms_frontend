import { Pencil } from "lucide-react";

export default function ProfilePage() {
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

  return (
    <div
  className="
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
    </div>
  );
}