import { useState, useRef, useEffect } from "react";
import { Search, Bell, ChevronDown, User, Lock, Mail } from "lucide-react";

export default function Header({
  title = "Dashboard Overview",
  showDivider = false,
  setCurrentPage,
}) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const menuItems = [
    { label: "Profile", icon: User, page: "profile" },
    { label: "Change Password", icon: Lock, page: "change-password" },
    { label: "Email Format", icon: Mail, page: "email-format" },
  ];

  return (
    <>
      <header className="w-full h-[100px] bg-white flex items-center justify-between pl-8 pr-14 border-b border-[#ECECEC]">

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

          <button className="relative flex items-center justify-center w-11 h-11 mr-10">

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

          <div className="h-[52px] w-px bg-[#E8E8E8] mr-10" />

          {/* Profile */}

          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setDropdownOpen((prev) => !prev)}
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
                    className={`text-[#666666] transition-transform duration-150 ${
                      dropdownOpen ? "rotate-180" : ""
                    }`}
                  />

                </div>

                <p className="text-[12px] text-[#8A8A8A] mt-1">
                  Ankit Tripathi
                </p>

              </div>

            </button>

            {/* Dropdown */}
            {dropdownOpen && (
              <div
                className="
                  absolute
                  right-0
                  top-[calc(100%+10px)]
                  w-[210px]
                  bg-white
                  rounded-[10px]
                  border
                  border-[#ECECEC]
                  shadow-[0_8px_24px_rgba(0,0,0,0.12)]
                  py-2
                  z-50
                "
              >
                {menuItems.map(({ label, icon: Icon, page }) => (
                  <button
                    key={label}
                    type="button"
                    onClick={() => {
                      setCurrentPage(page);
                      setDropdownOpen(false);
                    }}
                    className="
                      w-full
                      flex
                      items-center
                      gap-3
                      px-4
                      py-[10px]
                      text-left
                      hover:bg-[#F7F7F7]
                      transition-colors
                    "
                  >
                    <Icon size={16} className="text-[#202224] shrink-0" />
                    <span className="text-[14px] text-[#202224] whitespace-nowrap">
                      {label}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

        </div>

      </header>

      {showDivider && (
        <div className="h-[1px] w-full bg-[#ECECEC]" />
      )}
    </>
  );
}