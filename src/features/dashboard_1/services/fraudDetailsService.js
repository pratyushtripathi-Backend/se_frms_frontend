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
