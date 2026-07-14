import React, { useState } from "react";

const AddUserPage = () => {
  const [formData, setFormData] = useState({
    role: "",
    firstName: "",
    lastName: "",
    mobile: "",
    email: "",
  });

  // Success modal state
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(formData);
    setShowSuccessModal(true);
  };

  const handleBackToPage = () => {
    setShowSuccessModal(false);
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
      justifyContent: "flex-start",
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

    // ---------- Success Modal styles (matches ManageRolePage modal exactly) ----------
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
      width: "640px",
      maxWidth: "92vw",
      background: "#FFFFFF",
      borderRadius: "16px",
      padding: "56px 48px",
      boxSizing: "border-box",
      boxShadow: "0 20px 60px rgba(0,0,0,.25)",
      textAlign: "center",
    },

    iconWrapper: {
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      width: "100%",
      marginBottom: "8px",
    },

    modalTitle: {
      fontSize: "20px",
      fontWeight: 700,
      color: "#202224",
      marginTop: "24px",
      marginBottom: "16px",
    },

    modalDescription: {
      fontSize: "14px",
      lineHeight: "22px",
      color: "#7A7A7A",
      maxWidth: "420px",
      margin: "0 auto 32px",
    },

    backToPageButton: {
      height: "46px",
      width: "160px",
      borderRadius: "8px",
      border: "none",
      background: "#4B4B4B",
      color: "#FFFFFF",
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

      {/* User Registered Success Modal */}
      {showSuccessModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalCard}>

            <div style={styles.iconWrapper}>
              <svg
                width="88"
                height="88"
                viewBox="0 0 88 88"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <circle
                  cx="44"
                  cy="44"
                  r="40"
                  stroke="#111111"
                  strokeWidth="3"
                  fill="none"
                  strokeDasharray="252"
                  strokeDashoffset="252"
                  style={{
                    animation: "drawCircleUser 0.6s ease-out forwards",
                  }}
                />
                <path
                  d="M27 45 L39 57 L61 33"
                  stroke="#EB5757"
                  strokeWidth="4"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeDasharray="46"
                  strokeDashoffset="46"
                  style={{
                    animation: "drawVanishCheckUser 2.2s ease-in-out 0.55s infinite",
                  }}
                />
              </svg>
            </div>

            <style>{`
              @keyframes drawCircleUser {
                to { stroke-dashoffset: 0; }
              }
              @keyframes drawVanishCheckUser {
                0%   { stroke-dashoffset: 46; }
                35%  { stroke-dashoffset: 0; }
                65%  { stroke-dashoffset: 0; }
                100% { stroke-dashoffset: -46; }
              }
            `}</style>

            <div style={styles.modalTitle}>User Registered Successfully</div>

            <div style={styles.modalDescription}>
              The user has been successfully registered and activated
            </div>

            <button
              style={styles.backToPageButton}
              onClick={handleBackToPage}
            >
              Back to Page
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