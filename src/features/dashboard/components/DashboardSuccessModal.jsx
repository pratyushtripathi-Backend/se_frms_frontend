import { createPortal } from "react-dom";

export default function DashboardSuccessModal({
  message = "Updated successfully.",
  onClose,
  variant = "success",
}) {
  const displayMessage = String(message || "Updated successfully.").toUpperCase();
  const isError = variant === "error";

  return createPortal(
    <div
      className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/50 px-4"
      onClick={onClose}
    >
      <div
        className="w-[420px] max-w-[92vw] rounded-[14px] bg-white px-8 py-9 text-center shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div
          className={`mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full ${
            isError ? "bg-[#FEECEC] text-[#EB5757]" : "bg-[#E7F8EF] text-[#27AE60]"
          }`}
        >
          <svg
            aria-hidden="true"
            className="h-7 w-7"
            fill="none"
            viewBox="0 0 24 24"
          >
            {isError ? (
              <path
                d="M7 7L17 17M17 7L7 17"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="3"
              />
            ) : (
              <path
                d="M5 12.5L9.5 17L19 7"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="3"
              />
            )}
          </svg>
        </div>

        <h3 className="mx-auto mb-7 max-w-[320px] text-[20px] font-bold uppercase leading-7 text-[#202224]">
          {displayMessage}
        </h3>

        <button
          className="h-[42px] min-w-[120px] rounded-lg bg-[#4B4B4B] px-6 text-[14px] font-semibold text-white"
          onClick={onClose}
          type="button"
        >
          OK
        </button>
      </div>
    </div>,
    document.body,
  );
}
