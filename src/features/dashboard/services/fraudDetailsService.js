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

// The backend only has /api/v1/rule-category/* (no /admin/rule-category/*),
// so these call it directly instead of trying the /admin path first and
// falling back after a 404.
export function getRuleCategories({ page = 0, size = 10, search = "" } = {}) {
  return apiClient.get("/rule-category/list", {
    params: {
      page,
      size,
      search: search.trim(),
    },
    skipAuthRedirect: true,
  });
}

export function createRuleCategory(payload) {
  return apiClient.post("/rule-category/create", payload, {
    skipAuthRedirect: true,
  });
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

// PUT /api/v1/decision-policy/update/{id}
// payload: { description, allowMinScore, allowMaxScore, reviewMinScore,
//            reviewMaxScore, blockMinScore, blockMaxScore, status }
export function updateDecisionPolicy(id, payload) {
  return apiClient.put(`/decision-policy/update/${id}`, payload, {
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

export function getDecisions({ page = 0, size = 20, year, startDate, endDate } = {}) {
  return apiClient.get(`${decisionApiBaseUrl}/decisions`, {
    params: {
      page,
      size,
      ...(year ? { year } : {}),
      ...(startDate ? { startDate } : {}),
      ...(endDate ? { endDate } : {}),
    },
    skipAuthRedirect: true,
  });
}

const scoringApiBaseUrl =
  import.meta.env.VITE_SCORING_API_BASE_URL ?? "http://localhost:8085/api/v1";

export function getScoringHistory({ page = 0, size = 20, year, startDate, endDate } = {}) {
  return apiClient.get(`${scoringApiBaseUrl}/scoring/history`, {
    params: {
      page,
      size,
      ...(year ? { year } : {}),
      ...(startDate ? { startDate } : {}),
      ...(endDate ? { endDate } : {}),
    },
    skipAuthRedirect: true,
  });
}

export function getMatchedRules({ page = 0, size = 20, year, startDate, endDate } = {}) {
  return apiClient.get(`${scoringApiBaseUrl}/scoring/matched-rules`, {
    params: {
      page,
      size,
      ...(year ? { year } : {}),
      ...(startDate ? { startDate } : {}),
      ...(endDate ? { endDate } : {}),
    },
    skipAuthRedirect: true,
  });
}

// Unlike GET /decisions (which defaults to createdAt DESC), the backend's
// GET /decisions/cases has no default sort, so without `sort` pages come back
// oldest-first and page 1 of each tab (Under Review / Allowed / Blocked)
// held the oldest cases. Ask for newest-first explicitly.
export function getCases({ status = "REVIEW", page = 0, size = 10 } = {}) {
  return apiClient.get(`${decisionApiBaseUrl}/decisions/cases`, {
    params: {
      status,
      page,
      size,
      sort: "createdAt,desc",
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
