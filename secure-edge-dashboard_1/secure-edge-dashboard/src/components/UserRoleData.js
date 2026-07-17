// Base row patterns pulled from the Figma reference (first 10 rows repeat
// on a cycle to fill out the full 135-row mock dataset).
const baseRows = [
  { userName: "Ankit Tripathi", role: "Admin", status: "Success" },
  { userName: "Ankit Tripathi", role: "Admin", status: "Success" },
  { userName: "Ankit Tripathi", role: "Admin", status: "Block" },
  { userName: "Ankit Tripathi", role: "Admin", status: "Success" },
  { userName: "Mohit Verma", role: "Employee", status: "Block" },
  { userName: "Mohit Verma", role: "Employee", status: "Block" },
  { userName: "Mohit Verma", role: "Employee", status: "Success" },
  { userName: "Mohit Verma", role: "Employee", status: "Block" },
  { userName: "Mohit Verma", role: "Employee", status: "Block" },
  { userName: "Mohit Verma", role: "Employee", status: "Block" },
];

export const userRoleData = Array.from({ length: 135 }).map((_, index) => {
  const base = baseRows[index % baseRows.length];

  return {
    id: index + 1,
    userId: "Admin",
    userName: base.userName,
    role: base.role,
    createdBy: "Admin",
    createdDate: "12-05-2025",
    createdTime: "11:30 AM",
    updatedDate: "12-05-2025",
    updatedTime: "11:30 AM",
    status: base.status,
  };
});