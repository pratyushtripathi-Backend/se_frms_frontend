import apiClient from "../../../services/apiClient";

function toStatusBoolean(status) {
  return status === true || String(status).trim().toLowerCase() === "true";
}

export function getFraudRules({ page = 0, size = 10, search = "" } = {}) {
  return apiClient.get("/fraud-rule", {
    params: {
      page,
      size,
      ...(search.trim() ? { search: search.trim() } : {}),
    },
    skipAuthRedirect: true,
  });
}

export function createFraudRule(payload) {
  return apiClient.post("/fraud-rule", payload, {
    skipAuthRedirect: true,
  });
}

export function updateFraudRule(id, payload) {
  return apiClient.put(`/fraud-rule/${id}`, payload, {
    skipAuthRedirect: true,
  });
}

export function updateFraudRuleStatus(id, status) {
  return apiClient.patch(
    `/fraud-rule/${id}/status`,
    { status: toStatusBoolean(status) },
    {
      skipAuthRedirect: true,
    },
  );
}

export function deleteFraudRule(id) {
  return apiClient.delete(`/fraud-rule/${id}`, {
    skipAuthRedirect: true,
  });
}

export async function getRuleCategories({ page = 0, size = 10, search = "" } = {}) {
  const params = {
    page,
    size,
    search: search.trim(),
  };

  try {
    return await apiClient.get("/admin/rule-category/list", {
      params,
      skipAuthRedirect: true,
    });
  } catch (error) {
    if (error.response?.status !== 404) {
      throw error;
    }

    return apiClient.get("/rule-category/list", {
      params,
      skipAuthRedirect: true,
    });
  }
}

export async function createRuleCategory(payload) {
  try {
    return await apiClient.post("/admin/rule-category/create", payload, {
      skipAuthRedirect: true,
    });
  } catch (error) {
    if (error.response?.status !== 404) {
      throw error;
    }

    return apiClient.post("/rule-category/create", payload, {
      skipAuthRedirect: true,
    });
  }
}

export function updateRuleCategory(id, payload) {
  return apiClient.put(`/rule-category/update/${id}`, payload, {
    skipAuthRedirect: true,
  });
}

export function updateRuleCategoryStatus(id, status) {
  return apiClient.patch(
    `/rule-category/status/${id}`,
    { status: toStatusBoolean(status) },
    {
      skipAuthRedirect: true,
    },
  );
}

export function getRuleScores({ page = 0, size = 10, search = "" } = {}) {
  return apiClient.get("/rule-score/list", {
    params: {
      page,
      size,
      search: search.trim(),
    },
    skipAuthRedirect: true,
  });
}

export function createRuleScore(payload) {
  return apiClient.post("/rule-score/create", payload, {
    skipAuthRedirect: true,
  });
}

export function updateRuleScore(id, payload) {
  return apiClient.put(`/rule-score/update/${id}`, payload, {
    skipAuthRedirect: true,
  });
}

export function updateRuleScoreStatus(id, status) {
  return apiClient.patch(
    `/rule-score/status/${id}`,
    { status: toStatusBoolean(status) },
    {
      skipAuthRedirect: true,
    },
  );
}

export function deleteRuleScore(id) {
  return apiClient.delete(`/rule-score/delete/${id}`, {
    skipAuthRedirect: true,
  });
}

export function createDecisionPolicy(payload) {
  return apiClient.post("/decision-policy/create", payload, {
    skipAuthRedirect: true,
  });
}

export function getLatestDecisionPolicy() {
  return apiClient.get("/decision-policy/latest", {
    skipAuthRedirect: true,
  });
}

const decisionApiBaseUrl =
  import.meta.env.VITE_DECISION_API_BASE_URL ?? "http://localhost:8085/api/v1";

export function getDecisions({ page = 0, size = 20 } = {}) {
  return apiClient.get(`${decisionApiBaseUrl}/decisions`, {
    params: {
      page,
      size,
    },
    skipAuthRedirect: true,
  });
}

const scoringApiBaseUrl =
  import.meta.env.VITE_SCORING_API_BASE_URL ?? "http://localhost:8085/api/v1";

export function getScoringHistory({ page = 0, size = 20 } = {}) {
  return apiClient.get(`${scoringApiBaseUrl}/scoring/history`, {
    params: {
      page,
      size,
    },
    skipAuthRedirect: true,
  });
}

export function getMatchedRules({ page = 0, size = 20 } = {}) {
  return apiClient.get(`${scoringApiBaseUrl}/scoring/matched-rules`, {
    params: {
      page,
      size,
    },
    skipAuthRedirect: true,
  });
}

export function getCases({ status = "REVIEW", page = 0, size = 10 } = {}) {
  return apiClient.get(`${decisionApiBaseUrl}/decisions/cases`, {
    params: {
      status,
      page,
      size,
    },
    skipAuthRedirect: true,
  });
}

export function updateDecisionReview(decisionId, finalDecision) {
  return apiClient.patch(
    `${decisionApiBaseUrl}/decisions/${decisionId}/review`,
    { finalDecision },
    {
      skipAuthRedirect: true,
    },
  );
}

export function getAuditLogs({ page = 0, size = 10 } = {}) {
  return apiClient.get(`${decisionApiBaseUrl}/audit-logs`, {
    params: {
      page,
      size,
    },
    skipAuthRedirect: true,
  });
}
