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
import { useState } from "react";

const NAV_ITEMS = [
  { label: "Dashboard", icon: LayoutGrid, page: "dashboard" },
  { label: "Fraud Details", icon: FileEdit, chevron: true },
  { label: "Fraud Alert", icon: AlertTriangle },
  { label: "Transaction Monitoring", icon: Monitor, chevron: true },
  { label: "Risk Analytics", icon: BarChart3 },
  { label: "Case Management", icon: FolderSearch },
  { label: "User Management", icon: User, chevron: true },
  { label: "Report", icon: FileText },
  { label: "Login Details", icon: Lock, chevron: true },
];

const LOGIN_DETAILS_ITEMS = [
  { label: "Login History", page: "login-history" },
  { label: "Login Attempts", page: "login-attempts" },
  { label: "Login Session", page: "login-session" },
];

const USER_MANAGEMENT_ITEMS = [
  { label: "All Employee", page: "all-employee" },
  { label: "All Users", page: "all-users" },
  { label: "Add User", page: "add-user" },
  { label: "Manage Role", page: "manage-role" },
  { label: "User Role", page: "user-role" },
  { label: "Access Master", page: "access-master" },
  { label: "Role Access", page: "role-access" },
  { label: "User Blacklist", page: "user-blacklist" },
];

const FRAUD_DETAILS_ITEMS = [
  { label: "Create Rule", page: "create-rule" },
  { label: "All Fraud Rules", page: "all-fraud-rules" },
  { label: "All Rule Score", page: "all-rule-score" },
  { label: "All Category", page: "all-category" },
];

const TRANSACTION_MONITORING_ITEMS = [
  { label: "Transaction Data", page: "transaction-data" },
  { label: "Scoring Table", page: "scoring-table" },
  { label: "Matched Rule", page: "matched-rule" },
  { label: "Decision Policy", page: "decision-policy" },
  { label: "Decision Table", page: "decision-table" },
];

export default function Sidebar({ currentPage, onLogout, setCurrentPage }) {
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isLoginDetailsOpen, setIsLoginDetailsOpen] = useState(false);
  const [isUserManagementOpen, setIsUserManagementOpen] = useState(false);
  const [isFraudDetailsOpen, setIsFraudDetailsOpen] = useState(false);
  const [isTransactionMonitoringOpen, setIsTransactionMonitoringOpen] =
    useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    await onLogout?.();
    setIsLoggingOut(false);
  };

  return (
    <aside className="relative flex h-screen w-[260px] shrink-0 flex-col overflow-hidden border-r border-brand-border bg-brand-panel">
      {/* Logo */}
      <div className="relative z-10 flex items-center px-7 pt-8 pb-5">
        <img
          src="/logo.png"
          alt="Secure Edge"
          className="w-[180px] h-auto object-contain"
        />
      </div>

      {/* Navigation */}
      <nav className="relative z-10 flex min-h-0 flex-1 flex-col overflow-y-auto overflow-x-hidden pb-3 [scrollbar-width:thin] [scrollbar-color:#d4d4d4_transparent]">
        {NAV_ITEMS.map(({ label, icon: Icon, page, chevron }) => {
          const isLoginDetails = label === "Login Details";
          const isUserManagement = label === "User Management";
          const isFraudDetails = label === "Fraud Details";
          const isTransactionMonitoring = label === "Transaction Monitoring";
          const active =
            currentPage === page ||
            (isFraudDetails &&
              FRAUD_DETAILS_ITEMS.some((item) => item.page === currentPage)) ||
            (isLoginDetails &&
              LOGIN_DETAILS_ITEMS.some((item) => item.page === currentPage)) ||
            (isUserManagement &&
              USER_MANAGEMENT_ITEMS.some((item) => item.page === currentPage)) ||
            (isTransactionMonitoring &&
              TRANSACTION_MONITORING_ITEMS.some(
                (item) => item.page === currentPage
              ));
          const ChevronIcon =
            (isFraudDetails && isFraudDetailsOpen) ||
            (isLoginDetails && isLoginDetailsOpen) ||
            (isUserManagement && isUserManagementOpen) ||
            (isTransactionMonitoring && isTransactionMonitoringOpen)
              ? ChevronDown
              : ChevronRight;

          return (
            <div key={label}>
              <button
                className={`relative flex w-full items-center gap-2.5 px-6 py-2 text-left text-[12px] whitespace-nowrap transition-colors ${
                  active
                    ? "font-bold text-[#111827]"
                    : "font-semibold text-[#111827] hover:text-[#111827]"
                }`}
                onClick={() => {
                  if (isFraudDetails) {
                    setIsFraudDetailsOpen((isOpen) => !isOpen);
                    return;
                  }

                  if (isLoginDetails) {
                    setIsLoginDetailsOpen((isOpen) => !isOpen);
                    return;
                  }

                  if (isUserManagement) {
                    setIsUserManagementOpen((isOpen) => !isOpen);
                    return;
                  }

                  if (isTransactionMonitoring) {
                    setIsTransactionMonitoringOpen((isOpen) => !isOpen);
                    return;
                  }

                  if (page) {
                    setCurrentPage?.(page);
                  }
                }}
                type="button"
              >
                {active && (
                  <img
                    src="/arc.png"
                    alt=""
                    className="pointer-events-none absolute right-[-16px] top-1/2 h-12 w-auto -translate-y-1/2"
                  />
                )}

                <Icon
                  size={17}
                  strokeWidth={2}
                  className={active ? "text-brand-red" : "text-[#111827]"}
                />

                <div className="flex items-center">
                  <span className="font-['Poppins'] font-semibold text-[#111827]">
                    {label}
                  </span>

                  {active && (
                    <span className="ml-4 h-6 w-[2px] rounded-full bg-brand-red" />
                  )}
                </div>

                {chevron && (
                  <ChevronIcon
                    size={14}
                    className="ml-auto text-brand-dim/70"
                  />
                )}
              </button>

              {isFraudDetails && isFraudDetailsOpen && (
                <div className="ml-11 mr-5 space-y-1 border-l border-brand-border py-1 pl-4">
                  {FRAUD_DETAILS_ITEMS.map((item) => (
                    <button
                      className={`block w-full rounded-md px-2 py-1.5 text-left text-[11px] font-semibold transition-colors hover:bg-brand-bg hover:text-[#111827] ${
                        currentPage === item.page
                          ? "text-brand-red"
                          : "text-brand-dim"
                      }`}
                      key={item.page}
                      onClick={() => setCurrentPage?.(item.page)}
                      type="button"
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              )}

              {isLoginDetails && isLoginDetailsOpen && (
                <div className="ml-11 mr-5 space-y-1 border-l border-brand-border py-1 pl-4">
                  {LOGIN_DETAILS_ITEMS.map((item) => (
                    <button
                      className={`block w-full rounded-md px-2 py-1.5 text-left text-[11px] font-semibold transition-colors hover:bg-brand-bg hover:text-[#111827] ${
                        currentPage === item.page
                          ? "text-brand-red"
                          : "text-brand-dim"
                      }`}
                      key={item.page}
                      onClick={() => setCurrentPage?.(item.page)}
                      type="button"
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              )}

              {isUserManagement && isUserManagementOpen && (
                <div className="ml-11 mr-5 space-y-1 border-l border-brand-border py-1 pl-4">
                  {USER_MANAGEMENT_ITEMS.map((item) => (
                    <button
                      className={`block w-full rounded-md px-2 py-1.5 text-left text-[11px] font-semibold transition-colors hover:bg-brand-bg hover:text-[#111827] ${
                        currentPage === item.page
                          ? "text-brand-red"
                          : "text-brand-dim"
                      }`}
                      key={item.page}
                      onClick={() => setCurrentPage?.(item.page)}
                      type="button"
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              )}

              {isTransactionMonitoring && isTransactionMonitoringOpen && (
                <div className="ml-11 mr-5 space-y-1 border-l border-brand-border py-1 pl-4">
                  {TRANSACTION_MONITORING_ITEMS.map((item) => (
                    <button
                      className={`block w-full rounded-md px-2 py-1.5 text-left text-[11px] font-semibold transition-colors hover:bg-brand-bg hover:text-[#111827] ${
                        currentPage === item.page
                          ? "text-brand-red"
                          : "text-brand-dim"
                      }`}
                      key={item.page}
                      onClick={() => setCurrentPage?.(item.page)}
                      type="button"
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="relative z-10 px-6 pb-6 pt-3">
        <button
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-brand-red py-2.5 text-[12px] font-bold text-white shadow-card transition-colors hover:bg-brand-redDark disabled:cursor-not-allowed disabled:opacity-70"
          disabled={isLoggingOut}
          onClick={handleLogout}
          type="button"
        >
          {isLoggingOut ? "Logging out..." : "Logout"}
          <LogOut size={15} strokeWidth={2.2} />
        </button>
      </div>
    </aside>
  );
}