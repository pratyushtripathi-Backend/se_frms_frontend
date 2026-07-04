import { useState } from "react";
import {
  LayoutGrid,
  FileEdit,
  AlertTriangle,
  Monitor,
  BarChart3,
  FolderSearch,
  User,
  FileText,
  Lock,
  ChevronRight,
  ChevronDown,
  LogOut,
} from "lucide-react";

const NAV_ITEMS = [
  {
    label: "Dashboard",
    icon: LayoutGrid,
    page: "dashboard",
  },
  {
    label: "Fraud Rules",
    icon: FileEdit,
    page: "fraud-rules",
  },
  {
    label: "Fraud Alert",
    icon: AlertTriangle,
    page: "fraud-alert",
  },
  {
    label: "Transaction Monitoring",
    icon: Monitor,
    page: "transaction-monitoring",
  },
  {
    label: "Risk Analytics",
    icon: BarChart3,
    page: "risk-analytics",
  },
  {
    label: "Case Management",
    icon: FolderSearch,
    page: "case-management",
  },
  {
    label: "User Management",
    icon: User,
    children: [
      {
        label: "User List",
        page: "user-list",
      },
    ],
  },
  {
    label: "Report",
    icon: FileText,
    page: "report",
  },
  {
    label: "Login Details",
    icon: Lock,
    children: [
      {
        label: "Login History",
        page: "login-history",
      },
      {
        label: "Login Attempt",
        page: "login-attempt",
      },
      {
        label: "Login Session",
        page: "login-session",
      },
    ],
  },
];

export default function Sidebar({
  currentPage,
  setCurrentPage,
}) {
  const [openMenu, setOpenMenu] = useState("Login Details");

  const loginPages = [
    "login-history",
    "login-attempt",
    "login-session",
  ];

  return (
    <aside className="relative flex h-screen w-[260px] shrink-0 flex-col overflow-hidden border-r border-brand-border bg-brand-panel">

      {/* Logo */}
      <div className="flex items-center px-7 pt-1 pb-3">
        <img
          src="/logo.png"
          alt="Secure Edge"
          className="h-auto w-[180px] object-contain"
        />
      </div>

      {/* Navigation */}
      <nav
        className="hide-scrollbar flex-1 overflow-y-auto overflow-x-hidden pb-40"
        style={{
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        }}
      >
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const hasChildren = !!item.children;

          const isOpen =
            item.label === "Login Details"
              ? openMenu === item.label ||
                loginPages.includes(currentPage)
              : openMenu === item.label;

          const parentActive =
            item.page === currentPage ||
            (hasChildren &&
              item.children.some(
                (child) => child.page === currentPage
              ));

          return (
            <div key={item.label}>

              {/* Parent */}
              <button
                onClick={() => {
                  if (hasChildren) {
                    setOpenMenu(
                      isOpen ? "" : item.label
                    );
                  } else {
                    setCurrentPage(item.page);
                  }
                }}
                className={`relative flex w-full items-center gap-2.5 px-6 py-2 text-left text-[12px] transition-all ${
                  parentActive
                    ? "font-bold text-[#111827]"
                    : "font-semibold text-[#111827]"
                }`}
              >
                {parentActive && (
                  <img
                    src="/arc.png"
                    alt=""
                    className="pointer-events-none absolute right-[-16px] top-1/2 h-12 -translate-y-1/2"
                  />
                )}

                <Icon
                  size={17}
                  strokeWidth={2}
                  className={
                    parentActive
                      ? "text-brand-red"
                      : "text-[#111827]"
                  }
                />

                <div className="flex items-center">
                  <span>{item.label}</span>

                  {parentActive && (
                    <span className="ml-4 h-6 w-[2px] rounded-full bg-brand-red" />
                  )}
                </div>

                {hasChildren &&
                  (isOpen ? (
                    <ChevronDown
                      size={14}
                      className="ml-auto text-gray-500"
                    />
                  ) : (
                    <ChevronRight
                      size={14}
                      className="ml-auto text-gray-500"
                    />
                  ))}
              </button>

              {/* Dropdown */}
              {hasChildren && (
                <div
                  className={`overflow-hidden transition-all duration-300 ease-in-out ${
                    isOpen
                      ? "max-h-40 opacity-100"
                      : "max-h-0 opacity-0"
                  }`}
                >
                  {item.children.map((child) => (
                    <button
                      key={child.page}
                      onClick={() => {
                        setCurrentPage(child.page);
                        setOpenMenu("Login Details");
                      }}
                      className={`relative flex w-full items-center py-2 pl-[52px] pr-6 text-[12px] transition-colors ${
                        currentPage === child.page
                          ? "font-semibold text-brand-red"
                          : "text-[#111827]"
                      }`}
                    >
                      <span>{child.label}</span>

                      {currentPage === child.page && (
                        <span className="absolute right-3 h-5 w-[2px] rounded-full bg-brand-red" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </nav>
            {/* Logout */}
      <div className="absolute bottom-[72px] left-0 w-full px-6">
        <button
          type="button"
          className="
            flex
            h-[42px]
            w-[132px]
            items-center
            justify-center
            gap-2
            rounded-[8px]
            bg-[#FF0D0D]
            text-[14px]
            font-semibold
            text-white
            transition-colors
            hover:bg-[#E60000]
          "
        >
          <span>Logout</span>

          <LogOut
            size={16}
            strokeWidth={2.5}
            className="text-white"
          />
        </button>
      </div>
    </aside>
  );
}