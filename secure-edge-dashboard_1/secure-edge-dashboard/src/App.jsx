import Sidebar from "./components/Sidebar.jsx";
import Header from "./components/Header.jsx";
import StatCards from "./components/StatCards.jsx";
import TransactionMonitoring from "./components/TransactionMonitoring.jsx";
import FraudDetectType from "./components/FraudDetectType.jsx";
import FraudDetectionTrend from "./components/FraudDetectionTrend.jsx";
import AlertFeed from "./components/AlertFeed.jsx";
import RecentTransactions from "./components/RecentTransactions.jsx";

export default function App() {
  return (
    <div className="flex h-screen overflow-hidden bg-brand-bg">
      <Sidebar />

      <main className="min-w-0 flex-1 overflow-y-auto">
        <Header />

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

          <footer className="pt-2 text-center text-[12px] text-brand-dim">
            Copyright@2026 design by secureedge
          </footer>
        </div>
      </main>
    </div>
  );
}