import { useEffect, useState } from "react";
import Sidebar from "./components/Sidebar.jsx";
import Header from "./components/Header.jsx";
import StatCards from "./components/StatCards.jsx";
import TransactionMonitoring from "./components/TransactionMonitoring.jsx";
import FraudDetectType from "./components/FraudDetectType.jsx";
import FraudDetectionTrend from "./components/FraudDetectionTrend.jsx";
import AlertFeed from "./components/AlertFeed.jsx";
import RecentTransactions from "./components/RecentTransactions.jsx";
import LoginHistoryPage from "./components/LoginHistoryPage.jsx";
import LoginAttemptPage from "./components/LoginAttemptPage.jsx";
import LoginSessionPage from "./components/LoginSessionPage.jsx";
import ProfilePage from "./components/ProfilePage.jsx";
import ChangePasswordPage from "./components/ChangePasswordPage.jsx";
import EmailFormatPage from "./components/EmailFormatPage.jsx";
import AllEmployeePage from "./components/AllEmployeePage.jsx";
import AllUsersPage from "./components/AllUsersPage.jsx";
import AddUserPage from "./components/AddUserPage.jsx";
import ManageRolePage from "./components/ManageRolePage.jsx";
import UserRolePage from "./components/UserRolePage.jsx";
import AccessMasterPage from "./components/AccessMasterPage.jsx";
import RoleAccessPage from "./components/RoleAccessPage.jsx";
import UserBlacklistPage from "./components/UserBlacklistPage.jsx";
import CreateRulesPage from "./components/CreateRulesPage.jsx";
import AllFraudRulesPage from "./components/AllFraudRulesPage.jsx";
import AllRuleScorePage from "./components/AllRuleScorePage.jsx";
import AllCategoryPage from "./components/AllCategoryPage.jsx";

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
  "create-rule",
  "all-fraud-rules",
  "all-rule-score",
  "all-category",
];

const PAGE_TITLES = {
  "login-history": "Login History",
  "login-attempts": "Login Attempts",
  "login-session": "Login Session",
  profile: "Profile",
  "change-password": "Change Password",
  "email-format": "Email Format",
  "all-employee": "All Employee",
  "all-users": "All Users",
  "add-user": "Add User",
  "manage-role": "Manage Role",
  "user-role": "User Role",
  "access-master": "Access Master",
  "role-access": "Role Access",
  "user-blacklist": "User Blacklist",
  "create-rule": "Create Rule",
  "all-fraud-rules": "All Fraud Rules",
  "all-rule-score": "All Rule Score",
  "all-category": "All Category",
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
  "create-rule": "/dashboard/create-rule",
  "all-fraud-rules": "/dashboard/all-fraud-rules",
  "all-rule-score": "/dashboard/all-rule-score",
  "all-category": "/dashboard/all-category",
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

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setDebouncedHeaderSearch(headerSearch.trim());
    }, 500);

    return () => window.clearTimeout(timeoutId);
  }, [headerSearch]);

  return (
    <div className="h-screen overflow-hidden bg-brand-bg">
      <div
        className="dashboard-browser-scale flex overflow-hidden bg-brand-bg"
      >
      <Sidebar
        currentPage={currentPage}
        onLogout={onLogout}
        setCurrentPage={setCurrentPage}
      />

      <main className="min-w-0 flex-1 overflow-y-auto pb-12">
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
            FRAUD_DETAILS_PAGES.includes(currentPage) ||
            USER_MANAGEMENT_PAGES.includes(currentPage)
          }
          title={PAGE_TITLES[currentPage] ?? "Dashboard Overview"}
        />

        {currentPage === "dashboard" && (
          <div className="flex flex-col gap-4 px-6 pb-10">
            <StatCards />

            <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1fr_360px]">
              <TransactionMonitoring />
              <FraudDetectType />
            </div>

            <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1fr_360px]">
              <FraudDetectionTrend />
              <AlertFeed />
            </div>

            <RecentTransactions />
          </div>
        )}

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
        {currentPage === "create-rule" && <CreateRulesPage />}
        {currentPage === "all-fraud-rules" && (
          <AllFraudRulesPage searchQuery={debouncedHeaderSearch} />
        )}
        {currentPage === "all-rule-score" && (
          <AllRuleScorePage searchQuery={debouncedHeaderSearch} />
        )}
        {currentPage === "all-category" && (
          <AllCategoryPage searchQuery={debouncedHeaderSearch} />
        )}
      </main>

      <footer className="fixed bottom-0 left-[260px] right-0 z-30 bg-brand-bg/95 py-3 text-center text-[12px] font-medium text-[#8C8C8C] backdrop-blur">
        Copyright@2026 design by secureedge
      </footer>
      </div>
    </div>
  );
}
