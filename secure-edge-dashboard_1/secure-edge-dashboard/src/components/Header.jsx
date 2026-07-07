import { Search, Bell, ChevronDown } from "lucide-react";

export default function Header({
  title = "Dashboard Overview",
  showDivider = false,
  setCurrentPage,
}) {
  return (
    <>
      <header className="w-full h-[92px] bg-white flex items-center justify-between px-8 border-b border-[#ECECEC]">

        {/* Left */}
        <div className="min-w-[260px]">
          <h1 className="text-[20px] font-semibold text-[#202224]">
            {title}
          </h1>
        </div>

        {/* Center Search */}
        <div className="flex flex-1 justify-center">
          <div className="relative w-[597px] h-[43px]">
            <Search
              size={16}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8F8F8F]"
            />

            <input
              type="text"
              placeholder="Search..."
              className="
                w-full
                h-full
                rounded-[10px]
                border
                border-[#E5E7EB]
                bg-white
                pl-11
                pr-4
                text-[14px]
                outline-none
                placeholder:text-[#A3A3A3]
              "
            />
          </div>
        </div>

        {/* Right */}
        <div className="flex items-center">

          {/* Notification */}

          <button className="relative flex items-center justify-center w-11 h-11 mr-8">

            <Bell
              size={21}
              strokeWidth={2}
              className="text-[#202224]"
            />

            <span className="absolute right-0 top-0 flex h-[18px] w-[18px] items-center justify-center rounded-full bg-[#FF3B30] text-[10px] font-semibold text-white">
              12
            </span>

          </button>

          {/* Divider */}

          <div className="h-[52px] w-px bg-[#E8E8E8] mr-8" />

          {/* Profile */}

          <button
            type="button"
            onClick={() => setCurrentPage("profile")}
            className="flex items-center cursor-pointer"
          >
            <img
              src="/admin.png"
              alt="Admin"
              className="w-[76px] h-[76px] rounded-full object-cover"
            />

            <div className="ml-3 w-[118px] text-left">

              <div className="flex items-center gap-1">

                <span className="text-[15px] font-semibold text-[#202224]">
                  Admin User
                </span>

                <ChevronDown
                  size={15}
                  className="text-[#666666]"
                />

              </div>

              <p className="text-[12px] text-[#8A8A8A] mt-1">
                Ankit Tripathi
              </p>

            </div>

          </button>

        </div>

      </header>

      {showDivider && (
        <div className="h-[1px] w-full bg-[#ECECEC]" />
      )}
    </>
  );
}