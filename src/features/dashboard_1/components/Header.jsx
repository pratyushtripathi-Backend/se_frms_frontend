import { useEffect, useRef, useState } from "react";
import { Search, Bell, ChevronDown, User, Lock, Mail } from "lucide-react";
import { getAuthUser } from "../../auth/services/authUserSession";

export default function Header({
  onSearchChange,
  searchValue = "",
  setCurrentPage,
  showSearch = true,
  title = "Dashboard Overview",
  showDivider = false,
}) {
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef(null);
  const { name = "Admin User", role = "Admin" } = getAuthUser();
  const profileMenuItems = [
    { label: "My Profile", icon: User, page: "profile" },
    { label: "Change Password", icon: Lock, page: "change-password" },
    { label: "Email Format", icon: Mail, page: "email-format" },
  ];

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        profileMenuRef.current &&
        !profileMenuRef.current.contains(event.target)
      ) {
        setIsProfileMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <>
      <header className="flex items-center justify-between gap-6 px-7 py-5">
        <h1 className="whitespace-nowrap text-[22px] font-bold text-brand-ink">
          {title}
        </h1>

        <div className="flex flex-1 justify-center">
          {showSearch && (
            <div className="relative w-full max-w-[520px]">
              <Search
                size={16}
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-brand-dim"
              />

              <input
                type="text"
                placeholder="Search..."
                value={searchValue}
                onChange={(event) => onSearchChange?.(event.target.value)}
                className="w-full rounded-lg border border-brand-border bg-white py-2.5 pl-10 pr-4 text-[13.5px] text-brand-ink placeholder:text-brand-dim outline-none focus:border-brand-blue"
              />
            </div>
          )}
        </div>

        <div className="flex items-center gap-5">
          {/* Notification */}
          <button
            type="button"
            onClick={() => setCurrentPage?.("notifications")}
            className="relative grid h-9 w-9 place-items-center rounded-full text-brand-ink transition-colors hover:bg-brand-bg"
          >
            <Bell size={20} strokeWidth={1.8} />

            <span className="absolute -top-1 right-0 grid h-[18px] min-w-[18px] place-items-center rounded-full bg-brand-red px-1 text-[10px] font-bold text-white">
              12
            </span>
          </button>

          <div className="h-8 w-px bg-brand-border" />

          {/* Admin Profile */}
          <div className="relative" ref={profileMenuRef}>
            <button
              className="flex items-center gap-3 rounded-lg px-2 py-1 transition-colors hover:bg-brand-bg"
              onClick={() => setIsProfileMenuOpen((isOpen) => !isOpen)}
              type="button"
            >
              <img
                src="/admin.png"
                alt={name}
                className="h-12 w-12 rounded-full object-cover border border-brand-border"
              />

              <div className="text-left leading-tight">
                <div className="flex items-center gap-1 text-[13.5px] font-bold text-brand-ink">
                  {name}
                  <ChevronDown
                    size={14}
                    className={`text-brand-dim transition-transform ${
                      isProfileMenuOpen ? "rotate-180" : ""
                    }`}
                  />
                </div>

                <div className="text-[12px] text-brand-dim">
                  {role}
                </div>
              </div>
            </button>

            {isProfileMenuOpen && (
              <div className="absolute right-0 top-[calc(100%+10px)] z-50 w-[210px] overflow-hidden rounded-[10px] border border-[#D9D9D9] bg-white py-2 shadow-[0_8px_24px_rgba(0,0,0,0.12)]">
                {profileMenuItems.map(({ label, icon: Icon, page }, index) => (
                  <div key={page}>
                    <button
                      className="flex w-full items-center gap-3 px-4 py-[10px] text-left text-[14px] text-[#202224] transition-colors hover:bg-[#F7F7F7]"
                      onClick={() => {
                        setCurrentPage?.(page);
                        setIsProfileMenuOpen(false);
                      }}
                      type="button"
                    >
                      <Icon size={16} className="shrink-0 text-[#202224]" />
                      <span className="whitespace-nowrap">{label}</span>
                    </button>

                    {index < profileMenuItems.length - 1 && (
                      <div className="my-1 h-px w-full bg-[#ECECEC]" />
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </header>

      {showDivider && (
        <div className="h-[2px] w-full border-b border-[#ECECEC] bg-white" />
      )}
    </>
  );
}
