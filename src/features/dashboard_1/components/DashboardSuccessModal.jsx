export default function DashboardSuccessModal({
  message = "Updated successfully.",
  onClose,
  title = "Success",
}) {
  return (
    <div
      className="fixed inset-0 z-[1200] flex items-center justify-center bg-black/50 px-4"
      onClick={onClose}
    >
      <div
        className="w-[420px] max-w-[92vw] rounded-[14px] bg-white px-8 py-9 text-center shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-[#E7F8EF] text-[28px] font-bold text-[#27AE60]">
          ✓
        </div>

        <h3 className="mb-3 text-[20px] font-bold text-[#202224]">{title}</h3>
        <p className="mx-auto mb-7 max-w-[300px] text-[14px] leading-6 text-[#6B7280]">
          {message}
        </p>

        <button
          className="h-[42px] min-w-[120px] rounded-lg bg-[#4B4B4B] px-6 text-[14px] font-semibold text-white"
          onClick={onClose}
          type="button"
        >
          OK
        </button>
      </div>
    </div>
  );
}
