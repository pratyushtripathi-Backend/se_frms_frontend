import { useEffect, useRef, useState } from "react";
import { NotificationProvider } from "../../context/NotificationContext.jsx";
import Sidebar from "./layout/Sidebar.jsx";
import Header from "./layout/Header.jsx";
import StatCards from "./widgets/StatCards.jsx";
import TransactionMonitoring from "./widgets/TransactionMonitoring.jsx";
import FraudDetectType from "./widgets/FraudDetectType.jsx";
import FraudDetectionTrend from "./widgets/FraudDetectionTrend.jsx";
import AlertFeed from "./widgets/AlertFeed.jsx";
import RecentTransactions from "./widgets/RecentTransactions.jsx";
import LoginHistoryPage from "./pages/login-details/LoginHistoryPage.jsx";
import LoginAttemptPage from "./pages/login-details/LoginAttemptPage.jsx";
import LoginSessionPage from "./pages/login-details/LoginSessionPage.jsx";
import ProfilePage from "./pages/account/ProfilePage.jsx";
import ChangePasswordPage from "./pages/account/ChangePasswordPage.jsx";
import EmailFormatPage from "./pages/account/EmailFormatPage.jsx";
import AllEmployeePage from "./pages/user-management/AllEmployeePage.jsx";
import AllUsersPage from "./pages/user-management/AllUsersPage.jsx";
import AddUserPage from "./pages/user-management/AddUserPage.jsx";
import ManageRolePage from "./pages/user-management/ManageRolePage.jsx";
import UserRolePage from "./pages/user-management/UserRolePage.jsx";
import AccessMasterPage from "./pages/user-management/AccessMasterPage.jsx";
import RoleAccessPage from "./pages/user-management/RoleAccessPage.jsx";
import UserBlacklistPage from "./pages/user-management/UserBlacklistPage.jsx";
import AllFraudRulesPage from "./pages/fraud-details/AllFraudRulesPage.jsx";
import AllRuleScorePage from "./pages/fraud-details/AllRuleScorePage.jsx";
import AllCategoryPage from "./pages/fraud-details/AllCategoryPage.jsx";
import BlackListEntryPage from "./pages/fraud-details/BlackListEntryPage.jsx";
import TransactionDataPage from "./pages/transaction-monitoring/TransactionDataPage.jsx";
import ScoringTablePage from "./pages/transaction-monitoring/ScoringTablePage.jsx";
import MatchedRulePage from "./pages/transaction-monitoring/MatchedRulePage.jsx";
import DecisionPolicyPage from "./pages/transaction-monitoring/DecisionPolicyPage.jsx";
import DecisionTablePage from "./pages/transaction-monitoring/DecisionTablePage.jsx";
import FraudAlertPage from "./pages/fraud-alert/FraudAlertPage.jsx";
import CaseManagementPage from "./pages/case-management/CaseManagementPage.jsx";
import AuditTrailPage from "./pages/audit-trail/AuditTrailPage.jsx";
import ReportPage from "./pages/report/ReportPage.jsx";
import NotificationsPage from "./pages/notifications/NotificationsPage.jsx";
import NotificationRecordPage from "./pages/notifications/NotificationRecordPage.jsx";

const USER_MANAGEMENT_PAGES = [
  "all-employee",
  "all-users",
  "add-user",
  "manage-role",
  "user-role",
  "access-master",
  "role-access",
  "user-blacklist",
];

const FRAUD_DETAILS_PAGES = [
  "all-fraud-rules",
  "all-rule-score",
  "all-category",
  "black-list-entry",
];

const TRANSACTION_MONITORING_PAGES = [
  "transaction-data",
  "scoring-table",
  "matched-rule",
  "decision-policy",
  "decision-table",
];

const PAGE_TITLES = {
  "login-history": "Login History",
  "login-attempts": "Login Attempts",
  "login-session": "Login Session",
  profile: "Profile",
  "change-password": "Change Password",
  "email-format": "Email Format",
 
  "all-users": "All Users",
  "add-user": "Add User",
  "manage-role": "Manage Role",
  "user-role": "User Role",
  "access-master": "Access Master",
  "role-access": "Role Access",
  "user-blacklist": "User Blacklist",
  "all-fraud-rules": "All Fraud Rules",
  "all-rule-score": "All Rule Score",
  "all-category": "All Category",
  "black-list-entry": "Black List Entry",
  "transaction-data": "Transaction Data",
  "scoring-table": "Scoring Table",
  "matched-rule": "Matched Rule",
  "decision-policy": "Decision Policy",
  "decision-table": "Decision Table",
  "fraud-alert": "Fraud Alert",
  "case-management": "Case Management",
  "audit-trail": "Audit Trail",
  report: "Report",
  notifications: "Notifications",
  "notification-record": "Notification Record",
};

const PAGE_ROUTES = {
  dashboard: "/dashboard",
  "login-history": "/dashboard/login-history",
  "login-attempts": "/dashboard/login-attempts",
  "login-session": "/dashboard/login-session",
  profile: "/dashboard/profile",
  "change-password": "/dashboard/change-password",
  "email-format": "/dashboard/email-format",
  "all-employee": "/dashboard/all-employee",
  "all-users": "/dashboard/all-users",
  "add-user": "/dashboard/add-user",
  "manage-role": "/dashboard/manage-role",
  "user-role": "/dashboard/user-role",
  "access-master": "/dashboard/access-master",
  "role-access": "/dashboard/role-access",
  "user-blacklist": "/dashboard/user-blacklist",
  "all-fraud-rules": "/dashboard/all-fraud-rules",
  "all-rule-score": "/dashboard/all-rule-score",
  "all-category": "/dashboard/all-category",
  "black-list-entry": "/dashboard/black-list-entry",
  "transaction-data": "/dashboard/transaction-data",
  "scoring-table": "/dashboard/scoring-table",
  "matched-rule": "/dashboard/matched-rule",
  "decision-policy": "/dashboard/decision-policy",
  "decision-table": "/dashboard/decision-table",
  "fraud-alert": "/dashboard/fraud-alert",
  "case-management": "/dashboard/case-management",
  "audit-trail": "/dashboard/audit-trail",
  report: "/dashboard/report",
  notifications: "/dashboard/notifications",
  "notification-record": "/dashboard/notification-record",
};

const ROUTE_PAGES = Object.entries(PAGE_ROUTES).reduce(
  (lookup, [page, route]) => ({
    ...lookup,
    [route]: page,
  }),
  {},
);

function getPageFromPathname(pathname = window.location.pathname) {
  return ROUTE_PAGES[pathname] ?? "dashboard";
}

export default function App({ onLogout }) {
  const [currentPage, setCurrentPageState] = useState(getPageFromPathname);
  const [headerSearch, setHeaderSearch] = useState("");
  const [debouncedHeaderSearch, setDebouncedHeaderSearch] = useState("");

  const setCurrentPage = (nextPage) => {
    const page = PAGE_ROUTES[nextPage] ? nextPage : "dashboard";
    const nextPath = PAGE_ROUTES[page];

    if (window.location.pathname !== nextPath) {
      window.history.pushState({}, "", nextPath);
    }

    setCurrentPageState(page);
  };

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPageState(getPageFromPathname());
    };

    window.addEventListener("popstate", handlePopState);

    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  useEffect(() => {
    setHeaderSearch("");
    setDebouncedHeaderSearch("");
  }, [currentPage]);

  // <main> is one scroll area shared by every page, so without this a page
  // opened from the sidebar keeps the previous page's scroll position.
  // Always start a newly opened page at its top.
  const mainRef = useRef(null);

  useEffect(() => {
    mainRef.current?.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [currentPage]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setDebouncedHeaderSearch(headerSearch.trim());
    }, 500);

    return () => window.clearTimeout(timeoutId);
  }, [headerSearch]);

  return (
    <NotificationProvider>
      <div className="flex h-screen overflow-hidden bg-brand-bg">
        <Sidebar
          currentPage={currentPage}
          onLogout={onLogout}
          setCurrentPage={setCurrentPage}
        />

        <main ref={mainRef} className="min-w-0 flex-1 overflow-y-auto pb-12">
        <Header
          onSearchChange={setHeaderSearch}
          searchValue={headerSearch}
          setCurrentPage={setCurrentPage}
          showSearch={currentPage !== "dashboard" && currentPage !== "add-user"}
          showDivider={
            currentPage === "login-history" ||
            currentPage === "login-attempts" ||
            currentPage === "login-session" ||
            currentPage === "profile" ||
            currentPage === "change-password" ||
            currentPage === "email-format" ||
            currentPage === "fraud-alert" ||
            currentPage === "case-management" ||
            currentPage === "audit-trail" ||
            currentPage === "report" ||
            currentPage === "notifications" ||
            currentPage === "notification-record" ||
            TRANSACTION_MONITORING_PAGES.includes(currentPage) ||
            FRAUD_DETAILS_PAGES.includes(currentPage) ||
            USER_MANAGEMENT_PAGES.includes(currentPage)
          }
          title={PAGE_TITLES[currentPage] ?? "Dashboard Overview"}
        />

        {/* Re-keyed on every page switch so the newly opened page fades in
            (see .frms-page-enter in styles/index.css) instead of popping in. */}
        <div key={currentPage} className="frms-page-enter">
        {currentPage === "dashboard" && (
          <div className="flex flex-col gap-3 px-6 pb-10">
           <StatCards setCurrentPage={setCurrentPage} />

            <div className="grid grid-cols-1 gap-3 lg:grid-cols-[1fr_300px]">
              <TransactionMonitoring />
              <FraudDetectType />
            </div>

            <div className="grid grid-cols-1 gap-3 lg:grid-cols-[1fr_300px]">
              <FraudDetectionTrend />
              <AlertFeed />
            </div>

            <RecentTransactions />
          </div>
        )}

        {currentPage !== "dashboard" && (
          <div className="page-density-zoom">
            {currentPage === "login-history" && (
              <LoginHistoryPage searchQuery={debouncedHeaderSearch} />
            )}
            {currentPage === "login-attempts" && (
              <LoginAttemptPage searchQuery={debouncedHeaderSearch} />
            )}
            {currentPage === "login-session" && (
              <LoginSessionPage searchQuery={debouncedHeaderSearch} />
            )}
            {currentPage === "profile" && <ProfilePage />}
            {currentPage === "change-password" && (
              <ChangePasswordPage setCurrentPage={setCurrentPage} />
            )}
            {currentPage === "email-format" && (
              <EmailFormatPage searchQuery={debouncedHeaderSearch} setCurrentPage={setCurrentPage} />
            )}
            {currentPage === "all-employee" && (
              <AllEmployeePage searchQuery={debouncedHeaderSearch} />
            )}
            {currentPage === "all-users" && (
              <AllUsersPage searchQuery={debouncedHeaderSearch} />
            )}
            {currentPage === "add-user" && <AddUserPage />}
            {currentPage === "manage-role" && (
              <ManageRolePage searchQuery={debouncedHeaderSearch} />
            )}
            {currentPage === "user-role" && (
              <UserRolePage searchQuery={debouncedHeaderSearch} />
            )}
            {currentPage === "access-master" && (
              <AccessMasterPage searchQuery={debouncedHeaderSearch} />
            )}
            {currentPage === "role-access" && <RoleAccessPage />}
            {currentPage === "user-blacklist" && (
              <UserBlacklistPage searchQuery={debouncedHeaderSearch} />
            )}
            {currentPage === "all-fraud-rules" && (
              <AllFraudRulesPage searchQuery={debouncedHeaderSearch} />
            )}
            {currentPage === "all-rule-score" && (
              <AllRuleScorePage searchQuery={debouncedHeaderSearch} />
            )}
            {currentPage === "all-category" && (
              <AllCategoryPage searchQuery={debouncedHeaderSearch} />
            )}
            {currentPage === "black-list-entry" && (
              <BlackListEntryPage searchQuery={debouncedHeaderSearch} />
            )}
            {currentPage === "transaction-data" && (
              <TransactionDataPage searchQuery={debouncedHeaderSearch} />
            )}
            {currentPage === "scoring-table" && <ScoringTablePage />}
            {currentPage === "matched-rule" && <MatchedRulePage />}
            {currentPage === "decision-policy" && <DecisionPolicyPage />}
            {currentPage === "decision-table" && <DecisionTablePage />}
            {currentPage === "fraud-alert" && (
              <FraudAlertPage searchQuery={debouncedHeaderSearch} />
            )}
            {currentPage === "case-management" && (
              <CaseManagementPage searchQuery={debouncedHeaderSearch} />
            )}
            {currentPage === "audit-trail" && (
              <AuditTrailPage searchQuery={debouncedHeaderSearch} />
            )}
            {currentPage === "report" && <ReportPage />}
            {currentPage === "notifications" && (
              <NotificationsPage searchQuery={debouncedHeaderSearch} />
            )}
            {currentPage === "notification-record" && (
              <NotificationRecordPage searchQuery={debouncedHeaderSearch} />
            )}
          </div>
        )}
        </div>
      </main>

        <footer className="fixed bottom-0 left-[225px] right-0 z-30 bg-brand-bg/95 py-3 text-center text-[12px] font-medium text-[#8C8C8C] backdrop-blur">
          Copyright@2026 design by secureedge
        </footer>
      </div>
    </NotificationProvider>
  );
}
