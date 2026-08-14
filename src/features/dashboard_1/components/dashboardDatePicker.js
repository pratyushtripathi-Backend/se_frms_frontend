export function openDashboardDatePicker(input, anchor) {
  if (!input || !anchor) return;

  const rect = anchor.getBoundingClientRect();

  input.style.display = "block";
  input.style.position = "fixed";
  input.style.left = `${rect.left}px`;
  input.style.top = `${rect.top}px`;
  input.style.width = `${rect.width}px`;
  input.style.height = `${rect.height}px`;
  input.style.opacity = "0";
  input.style.pointerEvents = "none";
  input.style.zIndex = "-1";

  input.getBoundingClientRect();
  input.focus({ preventScroll: true });

  if (input.showPicker) {
    input.showPicker();
  } else {
    input.click();
  }
}
