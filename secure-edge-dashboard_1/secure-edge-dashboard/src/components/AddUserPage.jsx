import React, { useState } from "react";
import { FiPlus, FiX } from "react-icons/fi";

const AddUserPage = () => {
  const [formData, setFormData] = useState({
    role: "",
    firstName: "",
    lastName: "",
    mobile: "",
    email: "",
  });

  // Add Role modal state
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [roleFormData, setRoleFormData] = useState({
    roleName: "",
    slug: "",
  });

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleRoleFormChange = (e) => {
    setRoleFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(formData);
  };

  const handleAddRole = () => {
    // TODO: wire up to your API / add-role logic
    console.log("Adding role:", roleFormData);
    setIsRoleModalOpen(false);
    setRoleFormData({ roleName: "", slug: "" });
  };

  const closeRoleModal = () => setIsRoleModalOpen(false);

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

    // ---------- Add Role Modal styles ----------
    modalOverlay: {
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: "rgba(20, 20, 20, 0.55)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 1000,
    },

    modalCard: {
      width: "400px",
      maxWidth: "92vw",
      background: "#FFFFFF",
      borderRadius: "14px",
      padding: "28px 32px 32px",
      boxSizing: "border-box",
      boxShadow: "0 20px 60px rgba(0,0,0,.25)",
      position: "relative",
    },

    modalCloseRow: {
      display: "flex",
      justifyContent: "flex-end",
      marginBottom: "18px",
    },

    closeButton: {
      width: "30px",
      height: "30px",
      borderRadius: "50%",
      background: "transparent",
      color: "#111111",
      border: "none",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      cursor: "pointer",
      flexShrink: 0,
    },

    modalField: {
      display: "flex",
      flexDirection: "column",
      gap: "8px",
      marginBottom: "20px",
    },

    modalFieldLabel: {
      fontSize: "13px",
      fontWeight: 600,
      color: "#333",
    },

    modalInput: {
      height: "46px",
      border: "1px solid #E5E7EB",
      borderRadius: "8px",
      padding: "0 14px",
      fontSize: "13px",
      outline: "none",
      width: "100%",
      boxSizing: "border-box",
      color: "#333",
    },

    addSubmitButton: {
      height: "46px",
      padding: "0 32px",
      borderRadius: "8px",
      border: "none",
      background: "#6B6B6B",
      color: "#FFFFFF",
      fontWeight: 600,
      fontSize: "14px",
      cursor: "pointer",
      marginTop: "6px",
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

          <button
            style={styles.addRoleButton}
            onClick={() => setIsRoleModalOpen(true)}
          >
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

      {/* Add Role Modal */}
      {isRoleModalOpen && (
        <div style={styles.modalOverlay} onClick={closeRoleModal}>
          <div style={styles.modalCard} onClick={(e) => e.stopPropagation()}>

            <div style={styles.modalCloseRow}>
              <button style={styles.closeButton} onClick={closeRoleModal}>
                <FiX size={20} />
              </button>
            </div>

            <div style={styles.modalField}>
              <label style={styles.modalFieldLabel}>Add Role</label>
              <input
                style={styles.modalInput}
                name="roleName"
                placeholder="Add Role"
                value={roleFormData.roleName}
                onChange={handleRoleFormChange}
              />
            </div>

            <div style={styles.modalField}>
              <label style={styles.modalFieldLabel}>Slug</label>
              <input
                style={styles.modalInput}
                name="slug"
                placeholder="Slug"
                value={roleFormData.slug}
                onChange={handleRoleFormChange}
              />
            </div>

            <button style={styles.addSubmitButton} onClick={handleAddRole}>
              Add
            </button>

          </div>
        </div>
      )}

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