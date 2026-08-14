import React, { useEffect, useState } from "react";
import { FiChevronDown } from "react-icons/fi";

import { getAuthErrorMessage } from "../../auth/services/authError";
import {
  createAdminEmployee,
  getAdminRoles,
} from "../services/adminEmployeeService";

const INITIAL_FORM_DATA = {
  role: "",
  firstName: "",
  lastName: "",
  mobile: "",
  email: "",
};

const AddUserPage = () => {
  const [formData, setFormData] = useState(INITIAL_FORM_DATA);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [roles, setRoles] = useState([]);
  const [isLoadingRoles, setIsLoadingRoles] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let isActive = true;

    async function loadRoles() {
      setIsLoadingRoles(true);

      try {
        const response = await getAdminRoles({ page: 0, size: 3 });
        const normalizedRoles = normalizeRoleResponse(response.data);

        if (isActive) setRoles(normalizedRoles);
      } catch (error) {
        if (isActive) {
          setRoles([]);
          setErrorMessage(
            getAuthErrorMessage(error, "Unable to load roles. Please try again."),
          );
        }
      } finally {
        if (isActive) setIsLoadingRoles(false);
      }
    }

    loadRoles();

    return () => {
      isActive = false;
    };
  }, []);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMessage("");
    setErrorMessage("");

    const payload = {
      firstName: formData.firstName.trim(),
      lastName: formData.lastName.trim(),
      email: formData.email.trim(),
      phoneNumber: formData.mobile.trim(),
      roleName: formData.role.trim(),
    };

    if (
      !payload.firstName ||
      !payload.lastName ||
      !payload.email ||
      !payload.phoneNumber ||
      !payload.roleName
    ) {
      setErrorMessage("First name, last name, email, mobile, and role are required.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await createAdminEmployee(payload);
      setSuccessMessage(
        response.data?.responseMessage || "User added successfully.",
      );
      setFormData(INITIAL_FORM_DATA);
    } catch (error) {
      setErrorMessage(
        getAuthErrorMessage(error, "Unable to add user. Please try again."),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const styles = {
    page: {
      background: "#F4F5F9",
      width: "100%",
      minHeight: "calc(100vh - 92px)",
      padding: "20px 24px 20px 24px",
      fontFamily: "Inter, sans-serif",
      boxSizing: "border-box",
    },

    card: {
      width: "100%",
      background: "#FFFFFF",
      border: "1px solid #E5E7EB",
      borderRadius: "12px",
      boxShadow: "0 2px 10px rgba(0,0,0,.03)",
      position: "relative",
      paddingBottom: "20px",
    },

    topSection: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      padding: "28px 32px 20px",
    },

    roleWrapper: {
      display: "flex",
      alignItems: "center",
      gap: "20px",
    },

    selectWrapper: {
      position: "relative",
      width: "210px",
      height: "48px",
    },

    label: {
      fontSize: "15px",
      fontWeight: 600,
      color: "#202224",
    },

    select: {
      width: "100%",
      height: "48px",
      border: "1px solid #C9CDD4",
      borderRadius: "8px",
      padding: "0 42px 0 14px",
      fontSize: "14px",
      outline: "none",
      background: "#fff",
      color: "#202224",
      appearance: "none",
      boxSizing: "border-box",
      cursor: "pointer",
    },

    selectChevron: {
      position: "absolute",
      top: "50%",
      right: "14px",
      transform: "translateY(-50%)",
      color: "#4B5563",
      pointerEvents: "none",
    },

    formCard: {
      margin: "0 16px 16px",
      border: "1px solid #ECECEC",
      borderRadius: "10px",
      background: "#fff",
      padding: "24px",
    },

    sectionTitle: {
      fontSize: "15px",
      fontWeight: 700,
      color: "#202224",
      marginBottom: "22px",
    },

    grid: {
      display: "grid",
      gridTemplateColumns: "repeat(2,1fr)",
      columnGap: "36px",
      rowGap: "20px",
      marginBottom: "20px",
    },

    field: {
      display: "flex",
      flexDirection: "column",
      gap: "8px",
    },

    fieldLabel: {
      fontSize: "13px",
      fontWeight: 600,
      color: "#444",
    },

    input: {
      width: "100%",
      height: "68px",
      border: "1px solid #E5E7EB",
      borderRadius: "8px",
      padding: "0 14px",
      fontSize: "14px",
      outline: "none",
      boxSizing: "border-box",
      background: "#FFFFFF",
      color: "#202224",
      WebkitTextFillColor: "#202224",
      colorScheme: "light",
    },

    submitButton: {
      width: "150px",
      height: "52px",
      background: "#555555",
      color: "#FFFFFF",
      border: "none",
      borderRadius: "8px",
      fontSize: "14px",
      fontWeight: 600,
      cursor: "pointer",
    },

    disabledButton: {
      opacity: 0.7,
      cursor: "not-allowed",
    },

    alert: {
      margin: "0 16px 16px",
      borderRadius: "8px",
      padding: "12px 16px",
      fontSize: "13px",
      fontWeight: 600,
    },

    successAlert: {
      background: "#ECFDF3",
      color: "#027A48",
    },

    errorAlert: {
      background: "#FEF3F2",
      color: "#D92D20",
    },
  };

  return (
    <div style={styles.page}>
      <style>
        {`
          .add-user-form-field {
            background-color: #ffffff !important;
            color: #202224 !important;
            -webkit-text-fill-color: #202224 !important;
            color-scheme: light;
          }

          .add-user-form-field::placeholder {
            color: #9CA3AF !important;
            -webkit-text-fill-color: #9CA3AF !important;
          }

          .add-user-form-field:-webkit-autofill,
          .add-user-form-field:-webkit-autofill:hover,
          .add-user-form-field:-webkit-autofill:focus {
            -webkit-box-shadow: 0 0 0 1000px #ffffff inset !important;
            box-shadow: 0 0 0 1000px #ffffff inset !important;
            -webkit-text-fill-color: #202224 !important;
          }
        `}
      </style>
      <div style={styles.card}>
        {/* Top Section */}

        <div style={styles.topSection}>
          <div style={styles.roleWrapper}>
            <label style={styles.label}>Choose Role</label>

            <div style={styles.selectWrapper}>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                style={{
                  ...styles.select,
                  ...(isLoadingRoles ? styles.disabledButton : {}),
                }}
                disabled={isLoadingRoles}
              >
                <option value="">
                  {isLoadingRoles ? "Loading Roles..." : "Select Role"}
                </option>
                {roles.map((role) => (
                  <option key={role.id} value={role.value}>
                    {role.label}
                  </option>
                ))}
              </select>
              <FiChevronDown style={styles.selectChevron} size={18} />
            </div>
          </div>

        </div>

        {successMessage && (
          <div style={{ ...styles.alert, ...styles.successAlert }}>
            {successMessage}
          </div>
        )}

        {errorMessage && (
          <div style={{ ...styles.alert, ...styles.errorAlert }}>
            {errorMessage}
          </div>
        )}

        {/* Personal Information */}

        <form onSubmit={handleSubmit} style={styles.formCard}>
          <div style={styles.sectionTitle}>
            Personal Information
          </div>

          <div style={styles.grid}>

            {/* First Name */}

            <div style={styles.field}>
              <label style={styles.fieldLabel}>First Name</label>

              <input
                className="add-user-form-field"
                type="text"
                name="firstName"
                placeholder="Enter Name"
                value={formData.firstName}
                onChange={handleChange}
                style={styles.input}
              />
            </div>

            {/* Last Name */}

            <div style={styles.field}>
              <label style={styles.fieldLabel}>Last Name</label>

              <input
                className="add-user-form-field"
                type="text"
                name="lastName"
                placeholder="Enter Name"
                value={formData.lastName}
                onChange={handleChange}
                style={styles.input}
              />
            </div>

            {/* Mobile */}

            <div style={styles.field}>
              <label style={styles.fieldLabel}>Mobile</label>

              <input
                className="add-user-form-field"
                type="text"
                name="mobile"
                placeholder="Enter Mobile no"
                value={formData.mobile}
                onChange={handleChange}
                style={styles.input}
              />
            </div>

            {/* Email */}

            <div style={styles.field}>
              <label style={styles.fieldLabel}>Email</label>

              <input
                className="add-user-form-field"
                type="email"
                name="email"
                placeholder="Enter Email"
                value={formData.email}
                onChange={handleChange}
                style={styles.input}
              />
            </div>

          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            style={{
              ...styles.submitButton,
              ...(isSubmitting ? styles.disabledButton : {}),
            }}
          >
            {isSubmitting ? "Submitting..." : "Submit"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddUserPage;

function normalizeRoleResponse(responseData) {
  const payload =
    responseData?.responseData ??
    responseData?.data?.responseData ??
    responseData?.data ??
    responseData;

  return findFirstArray(payload).map(normalizeRole).filter(Boolean);
}

function normalizeRole(role, index) {
  if (typeof role === "string") {
    return {
      id: role,
      label: role,
      value: role,
    };
  }

  if (!role || typeof role !== "object") return null;

  const label =
    role.roleName ??
    role.name ??
    role.role ??
    role.title ??
    role.slug ??
    "";

  if (!label) return null;

  return {
    id: role.id ?? role.roleId ?? role.slug ?? label ?? index,
    label,
    value: role.roleName ?? role.name ?? role.role ?? role.slug ?? label,
  };
}

function findFirstArray(value, visited = new Set()) {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  if (typeof value !== "object" || visited.has(value)) return [];

  visited.add(value);

  const preferredKeys = [
    "content",
    "records",
    "items",
    "rows",
    "list",
    "roles",
    "roleList",
    "data",
  ];

  for (const key of preferredKeys) {
    const childArray = findFirstArray(value[key], visited);

    if (childArray.length > 0) return childArray;
  }

  for (const childValue of Object.values(value)) {
    const childArray = findFirstArray(childValue, visited);

    if (childArray.length > 0) return childArray;
  }

  if (Object.keys(value).length > 0) return [value];

  return [];
}
