import React, { useEffect, useState } from "react";
import { getRuleCategories } from "../services/fraudDetailsService";

const CreateRulesPage = () => {
  // ---- Category state ----
  const [categories, setCategories] = useState([]);
  const [categoryError, setCategoryError] = useState("");
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);

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

  useEffect(() => {
    let isMounted = true;

    async function loadCategories() {
      setIsLoadingCategories(true);
      setCategoryError("");

      try {
        const response = await getRuleCategories({ page: 0, size: 10 });
        const fetchedCategories = normalizeCategoryOptions(response.data);

        if (isMounted) {
          setCategories(fetchedCategories);
        }
      } catch (error) {
        if (isMounted) {
          setCategoryError(
            getApiErrorMessage(error, "Unable to fetch categories."),
          );
        }
      } finally {
        if (isMounted) {
          setIsLoadingCategories(false);
        }
      }
    }

    loadCategories();

    return () => {
      isMounted = false;
    };
  }, []);

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

  const styles = {
    page: {
      background: "#F4F5F9",
      width: "100%",
      minHeight: "calc(100vh - 92px)",
      padding: "20px 24px 20px 24px",
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

    helperText: {
      fontSize: "12px",
      color: "#DC2626",
      fontWeight: 600,
      marginBottom: "18px",
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
        {categoryError && (
          <div style={styles.helperText}>
            {categoryError}
          </div>
        )}

        {/* ---- Create Fraud Rule ---- */}
        <div style={styles.innerBox}>
          <div style={styles.sectionTitle}>Create Fraud Rule</div>

          <div style={styles.grid2}>
            <div>
              <label style={styles.label}>Choose Category</label>
              <select
                style={styles.fieldBase}
                value={selectedCategory}
                disabled={isLoadingCategories}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="">
                  {isLoadingCategories ? "Loading categories..." : "Select Category"}
                </option>
                {!isLoadingCategories && categories.length === 0 && (
                  <option disabled value="">
                    No categories found
                  </option>
                )}
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
              <label style={styles.label}>Fraud Rule</label>
              <select
                style={styles.fieldBase}
                value={selectedRuleId}
                onChange={(e) => setSelectedRuleId(e.target.value)}
              >
                <option value="">Select Fraud Rule</option>
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
              Please select a Fraud Rule first to enter a score.
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
    </div>
  );
};

function normalizeCategoryOptions(responseData) {
  return findFirstArray(
    responseData?.responseData ??
      responseData?.data?.responseData ??
      responseData?.data ??
      responseData,
  )
    .map((category) => getCategoryName(category))
    .filter(Boolean);
}

function getCategoryName(category) {
  if (typeof category === "string") return category;

  return (
    category?.categoryName ||
    category?.name ||
    category?.ruleCategoryName ||
    category?.category ||
    category?.categoryTitle ||
    category?.ruleCategory ||
    category?.category_name ||
    category?.rule_category_name ||
    ""
  );
}

function findFirstArray(value, visited = new Set()) {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  if (typeof value !== "object" || visited.has(value)) return [];

  visited.add(value);

  for (const key of [
    "content",
    "records",
    "items",
    "rows",
    "list",
    "categories",
    "ruleCategories",
    "categoryList",
    "ruleCategoryList",
    "data",
  ]) {
    const childArray = findFirstArray(value[key], visited);
    if (childArray.length > 0) return childArray;
  }

  for (const childValue of Object.values(value)) {
    const childArray = findFirstArray(childValue, visited);
    if (childArray.length > 0) return childArray;
  }

  return getCategoryName(value) ? [value] : [];
}

function getApiErrorMessage(error, fallbackMessage) {
  return (
    error?.response?.data?.responseMessage ||
    error?.response?.data?.message ||
    error?.message ||
    fallbackMessage
  );
}

export default CreateRulesPage;
