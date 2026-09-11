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
  FileCheck2,
  ChevronRight,
  ChevronDown,
  LogOut,
  Bell,
} from "lucide-react";
import { useState } from "react";

const NAV_ITEMS = [
  { label: "Dashboard", icon: LayoutGrid, page: "dashboard" },
  { label: "Fraud Details", icon: FileEdit, chevron: true },
  { label: "Fraud Alert", icon: AlertTriangle, page: "fraud-alert" },
  { label: "Transaction Monitoring", icon: Monitor, chevron: true },
  { label: "Risk Analytics", icon: BarChart3 },
  { label: "Case Management", icon: FolderSearch, page: "case-management" },
  { label: "User Management", icon: User, chevron: true },
  { label: "Report", icon: FileText, page: "report" },
  { label: "Login Details", icon: Lock, chevron: true },
  { label: "Audit Trail", icon: FileCheck2, page: "audit-trail" },
  { label: "Notification Record", icon: Bell, page: "notification-record" },
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
  { label: "All Fraud Rules", page: "all-fraud-rules" },
  { label: "All Rule Score", page: "all-rule-score" },
  { label: "All Category", page: "all-category" },
  { label: "Black List Entry", page: "black-list-entry" },
];

const TRANSACTION_MONITORING_ITEMS = [
  { label: "Transaction Data", page: "transaction-data" },
  { label: "Scoring Table", page: "scoring-table" },
  { label: "Matched Rule", page: "matched-rule" },
  { label: "Decision Policy", page: "decision-policy" },
  { label: "Decision Table", page: "decision-table" },
];

function SubNavButton({ currentPage, item, setCurrentPage }) {
  const isActive = currentPage === item.page;

  return (
    <button
      className={`flex w-full items-center rounded-md px-2 py-1 text-left text-[10px] font-semibold transition-colors hover:bg-brand-bg hover:text-[#111827] ${
        isActive ? "text-brand-red" : "text-brand-dim"
      }`}
      onClick={() => setCurrentPage?.(item.page)}
      type="button"
    >
      <span>{item.label}</span>
      <span
        className={`ml-auto h-4 w-[2px] rounded-full ${
          isActive ? "bg-brand-red" : "bg-transparent"
        }`}
      />
    </button>
  );
}

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
    <aside className="relative flex h-screen w-[225px] shrink-0 flex-col overflow-hidden border-r border-brand-border bg-brand-panel">
      {/* Logo */}
      <div className="relative z-10 flex items-center px-6 pt-5 pb-3">
        <img
          src="/logo.png"
          alt="Secure Edge"
          className="w-[140px] h-auto object-contain"
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
            (isTransactionMonitoring &&
              TRANSACTION_MONITORING_ITEMS.some(
                (item) => item.page === currentPage,
              )) ||
            (isLoginDetails &&
              LOGIN_DETAILS_ITEMS.some((item) => item.page === currentPage)) ||
            (isUserManagement &&
              USER_MANAGEMENT_ITEMS.some((item) => item.page === currentPage));
          const ChevronIcon =
            (isFraudDetails && isFraudDetailsOpen) ||
            (isTransactionMonitoring && isTransactionMonitoringOpen) ||
            (isLoginDetails && isLoginDetailsOpen) ||
            (isUserManagement && isUserManagementOpen)
              ? ChevronDown
              : ChevronRight;

          return (
            <div key={label}>
              <button
                className={`relative flex w-full items-center gap-1.5 px-4 py-1.5 text-left text-[10.5px] whitespace-nowrap transition-colors ${
                  active
                    ? "font-bold text-[#111827]"
                    : "font-semibold text-[#111827] hover:text-[#111827]"
                }`}
                onClick={() => {
                  if (isFraudDetails) {
                    setIsFraudDetailsOpen((isOpen) => !isOpen);
                    return;
                  }

                  if (isTransactionMonitoring) {
                    setIsTransactionMonitoringOpen((isOpen) => !isOpen);
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
                    className="pointer-events-none absolute right-[-16px] top-1/2 h-9 w-auto -translate-y-1/2"
                  />
                )}

                <Icon
                  size={14}
                  strokeWidth={2}
                  className={active ? "text-brand-red" : "text-[#111827]"}
                />

                <div className="flex items-center">
                  <span className="font-['Poppins'] font-semibold text-[#111827]">
                    {label}
                  </span>

                  {currentPage === page && (
                    <span className="ml-3 h-5 w-[2px] rounded-full bg-brand-red" />
                  )}
                </div>

                {chevron && (
                  <ChevronIcon
                    size={12}
                    className="ml-auto text-brand-dim/70"
                  />
                )}
              </button>

              {isFraudDetails && isFraudDetailsOpen && (
                <div className="ml-9 mr-5 space-y-0.5 py-1 pl-3">
                  {FRAUD_DETAILS_ITEMS.map((item) => (
                    <SubNavButton
                      currentPage={currentPage}
                      item={item}
                      key={item.page}
                      setCurrentPage={setCurrentPage}
                    />
                  ))}
                </div>
              )}

              {isLoginDetails && isLoginDetailsOpen && (
                <div className="ml-9 mr-5 space-y-0.5 py-1 pl-3">
                  {LOGIN_DETAILS_ITEMS.map((item) => (
                    <SubNavButton
                      currentPage={currentPage}
                      item={item}
                      key={item.page}
                      setCurrentPage={setCurrentPage}
                    />
                  ))}
                </div>
              )}

              {isTransactionMonitoring && isTransactionMonitoringOpen && (
                <div className="ml-9 mr-5 space-y-0.5 py-1 pl-3">
                  {TRANSACTION_MONITORING_ITEMS.map((item) => (
                    <SubNavButton
                      currentPage={currentPage}
                      item={item}
                      key={item.page}
                      setCurrentPage={setCurrentPage}
                    />
                  ))}
                </div>
              )}

              {isUserManagement && isUserManagementOpen && (
                <div className="ml-9 mr-5 space-y-0.5 py-1 pl-3">
                  {USER_MANAGEMENT_ITEMS.map((item) => (
                    <SubNavButton
                      currentPage={currentPage}
                      item={item}
                      key={item.page}
                      setCurrentPage={setCurrentPage}
                    />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="relative z-10 px-5 pb-4 pt-2">
        <button
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-brand-red py-2 text-[11px] font-bold text-white shadow-card transition-colors hover:bg-brand-redDark disabled:cursor-not-allowed disabled:opacity-70"
          disabled={isLoggingOut}
          onClick={handleLogout}
          type="button"
        >
          {isLoggingOut ? "Logging out..." : "Logout"}
          <LogOut size={13} strokeWidth={2.2} />
        </button>
      </div>
    </aside>
  );
}
