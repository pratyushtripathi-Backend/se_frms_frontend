const rawUsers = [
  {
    userId: "USR001",
    name: "John Smith",
    email: "john.smith@secureedge.com",
    mobile: "+91 9876543210",
    department: "Engineering",
    designation: "Software Engineer",
    permission: "Admin",
  },
  {
    userId: "USR002",
    name: "Emily Johnson",
    email: "emily.johnson@secureedge.com",
    mobile: "+91 9876543211",
    department: "Human Resources",
    designation: "HR Manager",
    permission: "Manager",
  },
  {
    userId: "USR003",
    name: "Michael Brown",
    email: "michael.brown@secureedge.com",
    mobile: "+91 9876543212",
    department: "Finance",
    designation: "Financial Analyst",
    permission: "User",
  },
  {
    userId: "USR004",
    name: "Sophia Davis",
    email: "sophia.davis@secureedge.com",
    mobile: "+91 9876543213",
    department: "IT",
    designation: "System Administrator",
    permission: "Admin",
  },
  {
    userId: "USR005",
    name: "Daniel Wilson",
    email: "daniel.wilson@secureedge.com",
    mobile: "+91 9876543214",
    department: "Marketing",
    designation: "Marketing Executive",
    permission: "User",
  },
  {
    userId: "USR006",
    name: "Olivia Taylor",
    email: "olivia.taylor@secureedge.com",
    mobile: "+91 9876543215",
    department: "Engineering",
    designation: "Frontend Developer",
    permission: "Manager",
  },
  {
    userId: "USR007",
    name: "James Anderson",
    email: "james.anderson@secureedge.com",
    mobile: "+91 9876543216",
    department: "Engineering",
    designation: "Backend Developer",
    permission: "User",
  },
  {
    userId: "USR008",
    name: "Emma Thomas",
    email: "emma.thomas@secureedge.com",
    mobile: "+91 9876543217",
    department: "Operations",
    designation: "Operations Executive",
    permission: "Manager",
  },
  {
    userId: "USR009",
    name: "William Martinez",
    email: "william.martinez@secureedge.com",
    mobile: "+91 9876543218",
    department: "Sales",
    designation: "Sales Manager",
    permission: "Admin",
  },
  {
    userId: "USR010",
    name: "Ava Garcia",
    email: "ava.garcia@secureedge.com",
    mobile: "+91 9876543219",
    department: "Support",
    designation: "Support Engineer",
    permission: "User",
  },
  {
    userId: "USR011",
    name: "Benjamin Moore",
    email: "benjamin.moore@secureedge.com",
    mobile: "+91 9876543220",
    department: "Engineering",
    designation: "Full Stack Developer",
    permission: "Admin",
  },
  {
    userId: "USR012",
    name: "Charlotte White",
    email: "charlotte.white@secureedge.com",
    mobile: "+91 9876543221",
    department: "Legal",
    designation: "Legal Advisor",
    permission: "Manager",
  },
  {
    userId: "USR013",
    name: "Lucas Harris",
    email: "lucas.harris@secureedge.com",
    mobile: "+91 9876543222",
    department: "Security",
    designation: "Security Analyst",
    permission: "Admin",
  },
  {
    userId: "USR014",
    name: "Amelia Clark",
    email: "amelia.clark@secureedge.com",
    mobile: "+91 9876543223",
    department: "Quality Assurance",
    designation: "QA Engineer",
    permission: "User",
  },
  {
    userId: "USR015",
    name: "Henry Lewis",
    email: "henry.lewis@secureedge.com",
    mobile: "+91 9876543224",
    department: "Research",
    designation: "Research Associate",
    permission: "Manager",
  },
  {
    userId: "USR016",
    name: "Mia Walker",
    email: "mia.walker@secureedge.com",
    mobile: "+91 9876543225",
    department: "Engineering",
    designation: "UI/UX Designer",
    permission: "User",
  },
  {
    userId: "USR017",
    name: "Alexander Hall",
    email: "alexander.hall@secureedge.com",
    mobile: "+91 9876543226",
    department: "Cloud",
    designation: "Cloud Engineer",
    permission: "Admin",
  },
  {
    userId: "USR018",
    name: "Harper Allen",
    email: "harper.allen@secureedge.com",
    mobile: "+91 9876543227",
    department: "Business",
    designation: "Business Analyst",
    permission: "Manager",
  },
  {
    userId: "USR019",
    name: "Ethan Young",
    email: "ethan.young@secureedge.com",
    mobile: "+91 9876543228",
    department: "DevOps",
    designation: "DevOps Engineer",
    permission: "Admin",
  },
  {
    userId: "USR020",
    name: "Grace King",
    email: "grace.king@secureedge.com",
    mobile: "+91 9876543229",
    department: "Administration",
    designation: "Office Administrator",
    permission: "User",
  },
];

// Maps the account-level permission to the role label shown in the table,
// mirroring how the design distinguishes "Permission" (Admin/Manager/User)
// from the account's day-to-day job "Role" (Employee).
const roleByPermission = {
  Admin: "Employee",
  Manager: "Employee",
  User: "Employee",
};

// Deterministic date/time generator so created/updated stamps are stable
// across renders (no Math.random / Date.now — keeps SSR & CSR in sync).
const pad2 = (n) => String(n).padStart(2, "0");

const buildStamp = (dayOffset, hour, minute) => {
  const base = new Date(2025, 4, 12); // 12-05-2025 anchor, matches the design
  base.setDate(base.getDate() + dayOffset);
  const date = `${pad2(base.getDate())}-${pad2(base.getMonth() + 1)}-${base.getFullYear()}`;
  const period = hour >= 12 ? "PM" : "AM";
  const hour12 = ((hour + 11) % 12) + 1;
  const time = `${pad2(hour12)}:${pad2(minute)} ${period}`;
  return { date, time };
};

export const allUserData = rawUsers.map((usr, index) => {
  const created = buildStamp(0, 11, 30);
  const updated = buildStamp(index % 5, 11, 30);
  const isActive = index % 3 !== 1; // mix of Active / Inactive, matches design

  return {
    id: index + 1,
    ...usr,
    role: roleByPermission[usr.permission],
    createdDate: created.date,
    createdTime: created.time,
    createdBy: "Admin",
    updatedDate: updated.date,
    updatedTime: updated.time,
    status: isActive,
  };
});