import { Search, Bell, ChevronDown } from "lucide-react";

export default function Header({
  title = "Dashboard Overview",
  showDivider = false,
}) {
  return (
    <>
      <header className="flex items-center justify-between bg-white px-6 py-3">
        {/* Left */}
        <h1 className="text-[18px] font-semibold text-[#202224]">
          {title}
        </h1>

        {/* Center Search */}
        <div className="flex flex-1 justify-center">
          <div className="relative w-full max-w-[760px]">
            <Search
              size={15}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9CA3AF]"
            />

            <input
              type="text"
              placeholder="Search..."
              className="
                h-[42px]
                w-full
                rounded-xl
                border
                border-[#E8E8E8]
                bg-white
                pl-10
                pr-4
                text-[13px]
                outline-none
                placeholder:text-[#A3A3A3]
              "
            />
          </div>
        </div>

        {/* Right */}
        <div className="flex items-center gap-6">
          {/* Notification */}
          <button className="relative flex h-10 w-10 items-center justify-center">
            <Bell size={19} strokeWidth={2} className="text-[#202224]" />

            <span className="absolute -right-[1px] -top-[1px] flex h-[16px] w-[16px] items-center justify-center rounded-full bg-[#FF3B30] text-[9px] font-semibold text-white">
              12
            </span>
          </button>

          {/* Divider */}
          <div className="h-12 w-px bg-[#E8E8E8]" />

          {/* Profile */}
          <button className="flex items-center gap-3">
            <img
              src="/admin.png"
              alt="Admin User"
              className="h-12 w-12 rounded-full object-cover"
            />

            <div className="text-left leading-tight">
              <div className="flex items-center gap-1">
                <span className="text-[14px] font-semibold text-[#202224]">
                  Admin User
                </span>
                <ChevronDown size={14} className="text-[#666]" />
              </div>

              <p className="mt-0.5 text-[12px] text-[#8A8A8A]">
                Ankit Tripathi
              </p>
            </div>
          </button>
        </div>
      </header>

      {showDivider && (
        <div className="h-[2px] w-full bg-white border-b border-[#ECECEC]" />
      )}
    </>
  );
}