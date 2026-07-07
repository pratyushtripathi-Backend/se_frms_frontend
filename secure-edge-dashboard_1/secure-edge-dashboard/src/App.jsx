import { useState } from "react";

import Sidebar from "./components/Sidebar";
import Header from "./components/Header";

import StatCards from "./components/StatCards";
import TransactionMonitoring from "./components/TransactionMonitoring";
import FraudDetectType from "./components/FraudDetectType";
import FraudDetectionTrend from "./components/FraudDetectionTrend";
import AlertFeed from "./components/AlertFeed";
import RecentTransactions from "./components/RecentTransactions";

import ProfilePage from "./components/ProfilePage";

import LoginHistoryPage from "./components/LoginHistoryPage";
import LoginAttemptPage from "./components/LoginAttemptPage";
import LoginSessionPage from "./components/LoginSessionPage";

import AllEmployeePage from "./components/AllEmployeePage";
import AddUserPage from "./components/AddUserPage";
import ManageRolePage from "./components/ManageRolePage";
import UserBlacklistPage from "./components/UserBlacklistPage";

export default function App() {
  const [currentPage, setCurrentPage] = useState("dashboard");

  const pageTitle = {
    dashboard: "Dashboard Overview",
    profile: "User Profile & Settings",

    "login-history": "Login History",
    "login-attempt": "Login Attempt",
    "login-session": "Login Session",

    "all-employee": "All Employee",
    "add-user": "Add User",
    "manage-role": "Manage Role",
    "user-blacklist": "User Blacklist",
  };

  return (
    <div className="flex h-screen overflow-hidden bg-brand-bg">
      <Sidebar
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
      />

      <main className="min-w-0 flex-1 overflow-y-auto bg-[#F4F5F9]">
        <Header
          title={pageTitle[currentPage] || "Dashboard Overview"}
          showDivider={currentPage !== "dashboard"}
          setCurrentPage={setCurrentPage}
        />

        {/* Dashboard */}
        {currentPage === "dashboard" && (
          <div className="flex flex-col gap-4 px-6 pt-4 pb-10">
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

            <footer className="pt-2 text-center text-[12px] text-brand-dim">
              Copyright@2026 design by secureedge
            </footer>
          </div>
        )}

        {/* Profile */}
        {currentPage === "profile" && <ProfilePage />}

        {/* Login Pages */}
        {currentPage === "login-history" && <LoginHistoryPage />}

        {currentPage === "login-attempt" && <LoginAttemptPage />}

        {currentPage === "login-session" && <LoginSessionPage />}

        {/* User Management */}
        {currentPage === "all-employee" && <AllEmployeePage />}

        {currentPage === "add-user" && <AddUserPage />}

        {currentPage === "manage-role" && <ManageRolePage />}

        {currentPage === "user-blacklist" && <UserBlacklistPage />}
      </main>
    </div>
  );
}