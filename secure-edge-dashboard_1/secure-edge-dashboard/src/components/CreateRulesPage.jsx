import React, { useMemo, useState } from "react";
import { FiPlus } from "react-icons/fi";

const CreateRulesPage = () => {
  // ---- Category state (still used for the dropdown) ----
  const [categories] = useState([
    "Transaction Fraud",
    "Account Takeover",
    "Identity Fraud",
  ]);

  // ---- Create Fraud Rule state ----
  const [selectedCategory, setSelectedCategory] = useState("");
  const [ruleName, setRuleName] = useState("");
  const [ruleCode, setRuleCode] = useState("");
  const [ruleDescription, setRuleDescription] = useState("");

  // ---- Created Fraud Rules (feeds the Rule Score section) ----
  const [fraudRules, setFraudRules] = useState([]);

  // ---- Create Fraud Rule Score state ----
  const [selectedRuleId, setSelectedRuleId] = useState("");
  const [ruleScore, setRuleScore] = useState("");

  // A category must be picked before the rest of the rule fields unlock
  const isRuleSectionActive = selectedCategory !== "";

  // A fraud rule must be picked before the score field unlocks
  const isScoreSectionActive = selectedRuleId !== "";

  const canSaveRule =
    isRuleSectionActive && ruleName.trim() !== "" && ruleCode.trim() !== "";

  const canSaveScore = isScoreSectionActive && ruleScore.trim() !== "";

  const handleSaveRule = () => {
    if (!canSaveRule) return;

    const newRule = {
      id: `FR${String(fraudRules.length + 1).padStart(3, "0")}`,
      category: selectedCategory,
      name: ruleName.trim(),
      code: ruleCode.trim(),
      description: ruleDescription.trim(),
    };

    setFraudRules((prev) => [...prev, newRule]);

    // reset the rule form, keep category selected
    setRuleName("");
    setRuleCode("");
    setRuleDescription("");
  };

  const handleSaveScore = () => {
    if (!canSaveScore) return;

    console.log("Saved rule score", {
      ruleId: selectedRuleId,
      score: ruleScore.trim(),
    });

    setSelectedRuleId("");
    setRuleScore("");
  };

  const selectedRule = useMemo(
    () => fraudRules.find((r) => r.id === selectedRuleId),
    [fraudRules, selectedRuleId]
  );

  const styles = {
    page: {
      background: "#F4F5F9",
      width: "100%",
      minHeight: "calc(100vh - 92px)",
      padding: "20px 48px 20px 24px",
      fontFamily: "Inter, sans-serif",
      boxSizing: "border-box",
    },

    outerCard: {
      width: "100%",
      background: "#FFFFFF",
      border: "1px solid #E5E7EB",
      borderRadius: "12px",
      boxShadow: "0 2px 10px rgba(0,0,0,.03)",
      padding: "24px",
      boxSizing: "border-box",
    },

    sectionTitle: {
      fontSize: "14px",
      fontWeight: 700,
      color: "#202224",
      marginBottom: "14px",
    },

    label: {
      fontSize: "12px",
      fontWeight: 600,
      color: "#374151",
      marginBottom: "6px",
      display: "block",
    },

    innerBox: {
      border: "1px solid #E5E7EB",
      borderRadius: "10px",
      padding: "20px",
      marginBottom: "20px",
      boxSizing: "border-box",
    },

    grid2: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: "20px",
      marginBottom: "16px",
    },

    fieldBase: {
      width: "80%",
      height: "72px",
      border: "1px solid #E5E7EB",
      borderRadius: "8px",
      padding: "0 14px",
      fontSize: "13px",
      color: "#111827",
      background: "#F3F4F6",
      boxSizing: "border-box",
      outline: "none",
    },

    textareaBase: {
      width: "80%",
      minHeight: "72px",
      border: "1px solid #E5E7EB",
      borderRadius: "8px",
      padding: "10px 14px",
      fontSize: "13px",
      color: "#111827",
      background: "#F3F4F6",
      boxSizing: "border-box",
      outline: "none",
      resize: "vertical",
      fontFamily: "Inter, sans-serif",
    },

    warningText: {
      fontSize: "12px",
      color: "#DC2626",
      fontWeight: 500,
      marginBottom: "16px",
    },

    saveBtn: (enabled) => ({
      height: "42px",
      padding: "0 28px",
      borderRadius: "8px",
      border: "none",
      background: enabled ? "#FF0D0D" : "#B9BCC2",
      color: "#FFFFFF",
      fontSize: "13px",
      fontWeight: 600,
      cursor: enabled ? "pointer" : "not-allowed",
      transition: "background .2s",
    }),
  };

  return (
    <div style={styles.page}>
      <div style={styles.outerCard}>

        {/* ---- Create Fraud Rule ---- */}
        <div style={styles.innerBox}>
          <div style={styles.sectionTitle}>Create Fraud Rule</div>

          <div style={styles.grid2}>
            <div>
              <label style={styles.label}>Choose Category</label>
              <select
                style={styles.fieldBase}
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="">Select Category</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={styles.label}>Rule Name</label>
              <input
                style={{
                  ...styles.fieldBase,
                  opacity: isRuleSectionActive ? 1 : 0.6,
                }}
                placeholder="Rule Name"
                value={ruleName}
                disabled={!isRuleSectionActive}
                onChange={(e) => setRuleName(e.target.value)}
              />
            </div>
          </div>

          <div style={styles.grid2}>
            <div>
              <label style={styles.label}>Rule Code</label>
              <input
                style={{
                  ...styles.fieldBase,
                  opacity: isRuleSectionActive ? 1 : 0.6,
                }}
                placeholder="Rule Code"
                value={ruleCode}
                disabled={!isRuleSectionActive}
                onChange={(e) => setRuleCode(e.target.value)}
              />
            </div>

            <div>
              <label style={styles.label}>Rule Description</label>
              <textarea
                style={{
                  ...styles.textareaBase,
                  opacity: isRuleSectionActive ? 1 : 0.6,
                }}
                placeholder="Write a description"
                value={ruleDescription}
                disabled={!isRuleSectionActive}
                onChange={(e) => setRuleDescription(e.target.value)}
              />
            </div>
          </div>

          {!isRuleSectionActive && (
            <div style={styles.warningText}>
              Please select a category first to fill in the other fields.
            </div>
          )}

          <button
            style={styles.saveBtn(canSaveRule)}
            disabled={!canSaveRule}
            onClick={handleSaveRule}
          >
            Save
          </button>
        </div>

        {/* ---- Create Fraud Rule Score ---- */}
        <div style={{ ...styles.innerBox, marginBottom: 0 }}>
          <div style={styles.sectionTitle}>Create Fraud Rule Score</div>

          <div style={styles.grid2}>
            <div>
              <label style={styles.label}>Fraud Rule ID</label>
              <select
                style={styles.fieldBase}
                value={selectedRuleId}
                onChange={(e) => setSelectedRuleId(e.target.value)}
              >
                <option value="">Select Fraud Rule ID</option>
                {fraudRules.map((rule) => (
                  <option key={rule.id} value={rule.id}>
                    {rule.id} - {rule.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={styles.label}>Fraud Rule Score</label>
              <input
                style={{
                  ...styles.fieldBase,
                  opacity: isScoreSectionActive ? 1 : 0.6,
                }}
                placeholder="Enter Rule Score"
                value={ruleScore}
                disabled={!isScoreSectionActive}
                onChange={(e) => setRuleScore(e.target.value)}
              />
            </div>
          </div>

          {!isScoreSectionActive && (
            <div style={styles.warningText}>
              Please select a Fraud Rule ID first to enter a score.
            </div>
          )}

          <button
            style={styles.saveBtn(canSaveScore)}
            disabled={!canSaveScore}
            onClick={handleSaveScore}
          >
            Save
          </button>
        </div>
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

export default CreateRulesPage;