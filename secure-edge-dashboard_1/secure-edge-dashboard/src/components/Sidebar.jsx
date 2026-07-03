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
  LogOut,
} from "lucide-react";

const NAV_ITEMS = [
  { label: "Dashboard", icon: LayoutGrid, active: true },
  { label: "Fraud Rules", icon: FileEdit },
  { label: "Fraud Alert", icon: AlertTriangle },
  { label: "Transaction Monitoring", icon: Monitor },
  { label: "Risk Analytics", icon: BarChart3 },
  { label: "Case Management", icon: FolderSearch },
  { label: "User Management", icon: User, chevron: true },
  { label: "Report", icon: FileText },
  { label: "Login Details", icon: Lock, chevron: true },
];

export default function Sidebar() {
  return (
    <aside className="relative flex h-screen w-[260px] shrink-0 flex-col overflow-visible border-r border-brand-border bg-brand-panel">
      {/* Logo */}
      <div className="relative z-10 flex items-center px-7 pt-8 pb-5">
        <img
          src="/logo.png"
          alt="Secure Edge"
          className="w-[180px] h-auto object-contain"
        />
      </div>

      {/* Navigation */}
      <nav className="relative z-10 flex flex-1 flex-col">
        {NAV_ITEMS.map(({ label, icon: Icon, active, chevron }) => (
          <a
            key={label}
            href="#"
            className={`relative flex items-center gap-2.5 px-6 py-2 text-[12px] whitespace-nowrap transition-colors ${
              active
  ? "font-bold text-[#111827]"
  : "font-semibold text-[#111827] hover:text-[#111827]"
            }`}
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
              <ChevronRight
                size={14}
                className="ml-auto text-brand-dim/70"
              />
            )}
          </a>
        ))}
      </nav>

      {/* Logout */}
      <div className="relative z-10 px-6 pb-6 pt-3">
        <button className="flex w-full items-center justify-center gap-2 rounded-lg bg-brand-red py-2.5 text-[12px] font-bold text-white shadow-card transition-colors hover:bg-brand-redDark">
          Logout
          <LogOut size={15} strokeWidth={2.2} />
        </button>
      </div>
    </aside>
  );
}