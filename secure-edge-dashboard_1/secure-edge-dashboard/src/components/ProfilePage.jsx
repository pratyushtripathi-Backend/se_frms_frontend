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
    mt-10
    w-[calc(100%-24px)]
    max-w-[2050px]
    min-h-[900px]
    rounded-[12px]
    border
    border-[#E5E9F0]
    bg-white
    px-20
    py-14
  "
>
      {/* ================= TOP SECTION ================= */}

      <div
        className="
          mx-auto
          w-full
          max-w-[1380px]
          flex
          gap-8
          bg-white
        "
      >
        {/* ================= CHANGE PROFILE PHOTO ================= */}

        <div
          className="
            w-[520px]
            h-[470px]
            overflow-hidden
            rounded-[12px]
            border
            border-[#E5E9F0]
            bg-white
            shadow-sm
          "
        >
          <div className="bg-[#F5F7FA] px-6 py-4">
            <h2 className="text-[15px] font-semibold text-[#20242C]">
              Change Profile Photo
            </h2>
          </div>

          <div className="flex flex-col items-center px-8 py-10">
            <img
              src="/admin.png"
              alt="Profile"
              className="h-[170px] w-[170px] rounded-full object-cover"
            />

            <button
              type="button"
              className="
                mt-7
                flex
                h-[40px]
                items-center
                justify-center
                gap-2
                rounded-[6px]
                bg-[#6B6B6B]
                px-7
                text-[13px]
                font-medium
                text-white
                transition
                hover:bg-[#5A5A5A]
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
            w-[852px]
            h-[470px]
            overflow-hidden
            rounded-[12px]
            border
            border-[#E5E9F0]
            bg-white
            shadow-sm
          "
        >
          <div className="flex items-center justify-between bg-[#F5F7FA] px-7 py-5">
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
                rounded-full
                bg-[#2D3142]
                px-5
                text-[12px]
                font-medium
                text-white
                transition
                hover:bg-[#20232F]
              "
            >
              <Pencil size={12} />
              Edit
            </button>

          </div>

          <div className="px-8 py-8">

            <dl className="space-y-5">
                              {details.map((item) => (
                <div
                  key={item.label}
                  className="grid grid-cols-[180px_1fr] items-start text-[14px]"
                >
                  <dt className="font-semibold text-[#20242C]">
                    {item.label}
                  </dt>

                  <dd className="text-[#4B4F58]">
                    {item.value}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>

      {/* ======================= CHANGE PASSWORD ======================= */}

      <div
        className="
          mx-auto
          mt-8
          w-full
          max-w-[1380px]
          overflow-hidden
          rounded-[12px]
          border
          border-[#E5E9F0]
          bg-white
          shadow-sm
        "
      >
        <div className="bg-[#F5F7FA] px-6 py-4">
          <h2 className="text-[15px] font-semibold text-[#20242C]">
            Change Password
          </h2>
        </div>

        <div className="px-8 py-8">
          <div className="grid grid-cols-3 gap-8">

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
              mt-8
              flex
              h-[46px]
              items-center
              justify-center
              rounded-[8px]
              bg-[#3A3F4B]
              px-8
              text-[14px]
              font-medium
              text-white
              transition
              hover:bg-[#2C303A]
            "
          >
            Change Password
          </button>

          <p className="mt-4 text-[12px] text-[#E0453C]">
            Include: Uppercase letters (A-Z), Lowercase letters (a-z),
            Numbers (0-9), Special characters (!, @, #, $, %, etc.)
          </p>
        </div>
      </div>
          </div>
  );
}