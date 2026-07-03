import { Search, Bell, ChevronDown } from "lucide-react";

export default function Header() {
  return (
    <header className="flex items-center justify-between gap-6 px-7 py-5">
      <h1 className="whitespace-nowrap text-[22px] font-bold text-brand-ink">
        Dashboard Overview
      </h1>

      <div className="flex flex-1 justify-center">
        <div className="relative w-full max-w-[520px]">
          <Search
            size={16}
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-brand-dim"
          />

          <input
            type="text"
            placeholder="Search..."
            className="w-full rounded-lg border border-brand-border bg-white py-2.5 pl-10 pr-4 text-[13.5px] text-brand-ink placeholder:text-brand-dim outline-none focus:border-brand-blue"
          />
        </div>
      </div>

      <div className="flex items-center gap-5">
        {/* Notification */}
        <button className="relative grid h-9 w-9 place-items-center rounded-full text-brand-ink">
          <Bell size={20} strokeWidth={1.8} />

          <span className="absolute -top-1 right-0 grid h-[18px] min-w-[18px] place-items-center rounded-full bg-brand-red px-1 text-[10px] font-bold text-white">
            12
          </span>
        </button>

        <div className="h-8 w-px bg-brand-border" />

        {/* Admin Profile */}
        <button className="flex items-center gap-3">
          <img
            src="/admin.png"
            alt="Admin User"
            className="h-12 w-12 rounded-full object-cover border border-brand-border"
          />

          <div className="text-left leading-tight">
            <div className="flex items-center gap-1 text-[13.5px] font-bold text-brand-ink">
              Admin User
              <ChevronDown size={14} className="text-brand-dim" />
            </div>

            <div className="text-[12px] text-brand-dim">
              Ankit Tripathi
            </div>
          </div>
        </button>
      </div>
    </header>
  );
}