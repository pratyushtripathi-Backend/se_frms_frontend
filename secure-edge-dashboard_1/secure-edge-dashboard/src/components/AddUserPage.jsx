import React, { useState } from "react";
import { FiPlus, FiChevronDown } from "react-icons/fi";

const AddUserPage = () => {
  const [formData, setFormData] = useState({
    role: "",
    firstName: "",
    lastName: "",
    mobile: "",
    email: "",
  });

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(formData);
  };

  const styles = {
    page: {
      background: "#F4F5F9",
      width: "100%",
      minHeight: "calc(100vh - 92px)",
      padding: "20px 48px 20px 24px",
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

    label: {
      fontSize: "15px",
      fontWeight: 600,
      color: "#202224",
    },

    select: {
      width: "170px",
      height: "48px",
      border: "1px solid #E5E7EB",
      borderRadius: "8px",
      padding: "0 14px",
      fontSize: "14px",
      outline: "none",
      background: "#fff",
    },

    addRoleButton: {
      width: "112px",
      height: "48px",
      borderRadius: "8px",
      border: "1px solid #FF4D4F",
      background: "#fff",
      color: "#FF4D4F",
      fontWeight: 600,
      fontSize: "14px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: "6px",
      cursor: "pointer",
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
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        {/* Top Section */}

        <div style={styles.topSection}>
          <div style={styles.roleWrapper}>
            <label style={styles.label}>Choose Role</label>

            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              style={styles.select}
            >
              <option value="">Select Role</option>
              <option>Admin</option>
              <option>Manager</option>
              <option>Employee</option>
            </select>
          </div>

          <button style={styles.addRoleButton}>
            Add Role
            <FiPlus size={18} />
          </button>
        </div>

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
                type="email"
                name="email"
                placeholder="Enter Email ID"
                value={formData.email}
                onChange={handleChange}
                style={styles.input}
              />
            </div>

          </div>

          <button
            type="submit"
            style={styles.submitButton}
          >
            Submit
          </button>
        </form>
      </div>
      {/* Footer */}
      <footer className="mt-6 pb-5 text-center">
        <p className="text-[12px] font-medium text-[#8C8C8C]">
          Copyright@2026 design by secureedge
        </p>
      </footer>
    </div>
  );
};

export default AddUserPage;