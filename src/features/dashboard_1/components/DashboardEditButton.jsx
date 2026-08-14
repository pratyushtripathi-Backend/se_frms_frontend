export default function DashboardEditButton({
  children = "Edit",
  className = "",
  disabled = false,
  onClick,
  type = "button",
}) {
  return (
    <button
      className={`inline-flex h-8 min-w-[92px] items-center justify-center rounded-md border border-[#489AE6] bg-[#489AE6] px-4 text-center text-[12px] font-semibold text-white shadow-sm transition-colors hover:border-[#4885E6] hover:bg-[#4885E6] focus:outline-none focus:ring-2 focus:ring-[#9CCAF2] focus:ring-offset-1 disabled:cursor-not-allowed disabled:border-[#9CCAF2] disabled:bg-[#9CCAF2] ${className}`}
      disabled={disabled}
      onClick={onClick}
      type={type}
    >
      {children}
    </button>
  );
}
