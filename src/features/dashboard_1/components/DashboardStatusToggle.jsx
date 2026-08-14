import { useEffect, useState } from "react";

export default function DashboardStatusToggle({ onToggle, status }) {
  const [isActive, setIsActive] = useState(isActiveStatus(status));
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setIsActive(isActiveStatus(status));
  }, [status]);

  const handleToggle = async () => {
    if (isSaving || !onToggle) return;

    const previousStatus = isActive;
    const nextStatus = !previousStatus;
    setIsActive(nextStatus);
    setIsSaving(true);

    try {
      await onToggle?.(nextStatus);
    } catch {
      setIsActive(previousStatus);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <button
      aria-checked={isActive}
      className={`relative inline-flex h-[26px] w-[86px] items-center rounded-full text-[11px] font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-70 ${
        isActive
          ? "justify-start bg-[#27AE60] pl-3 pr-1 text-white"
          : "justify-end bg-[#D9D9D9] pl-1 pr-3 text-white"
      }`}
      disabled={isSaving || !onToggle}
      onClick={handleToggle}
      role="switch"
      type="button"
    >
      {isActive ? "Active" : "Inactive"}
      <span
        className={`absolute top-1/2 h-5 w-5 -translate-y-1/2 rounded-full bg-white shadow-sm transition-all ${
          isActive ? "right-[3px]" : "left-[3px]"
        }`}
      />
    </button>
  );
}

function isActiveStatus(status) {
  if (typeof status === "boolean") return status;
  if (typeof status === "number") return status === 1;
  if (status === null || status === undefined || status === "") return false;

  return ["active", "success", "true", "enabled", "pending", "1"].includes(
    String(status).trim().toLowerCase(),
  );
}
