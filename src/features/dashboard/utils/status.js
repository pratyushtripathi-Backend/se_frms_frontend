// Same rule the Active / Inactive toggle uses, shared so exports print the
// status exactly as the table shows it.
export function isActiveStatus(status) {
  if (typeof status === "boolean") return status;
  if (typeof status === "number") return status === 1;
  if (status === null || status === undefined || status === "") return false;

  return ["active", "success", "true", "enabled", "pending", "1"].includes(
    String(status).trim().toLowerCase(),
  );
}
