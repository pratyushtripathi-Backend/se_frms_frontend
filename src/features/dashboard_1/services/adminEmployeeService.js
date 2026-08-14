import apiClient from "../../../services/apiClient";

function toStatusBoolean(status) {
  return status === true || String(status).trim().toLowerCase() === "true";
}

export function getAdminEmployees({ page = 0, size = 10, search = "" } = {}) {
  return apiClient.get("/admin/employees", {
    params: {
      page,
      size,
      ...(search.trim() ? { search: search.trim() } : {}),
    },
    skipAuthRedirect: true,
  });
}

export function createAdminEmployee(payload) {
  return apiClient.post("/admin/employees", payload, {
    skipAuthRedirect: true,
  });
}

export function updateAdminEmployee(employeeId, payload) {
  return apiClient.patch(`/admin/employees/${employeeId}`, payload, {
    skipAuthRedirect: true,
  });
}

export function updateAdminEmployeeStatus(employeeId, isActive) {
  return apiClient.patch(
    `/admin/employees/${employeeId}`,
    { isActive: toStatusBoolean(isActive) },
    {
      skipAuthRedirect: true,
    },
  );
}

export function getAdminRoles({ page = 0, size = 3 } = {}) {
  return apiClient.get("/admin/roles", {
    params: {
      page,
      size,
    },
    skipAuthRedirect: true,
  });
}

export function createAdminRole(payload) {
  return apiClient.post("/admin/roles", payload, {
    skipAuthRedirect: true,
  });
}

export function updateAdminRole(roleId, payload) {
  return apiClient.put(`/admin/roles/${roleId}`, payload, {
    skipAuthRedirect: true,
  });
}

export function updateAdminRoleStatus(roleId, status) {
  return apiClient.patch(
    `/admin/roles/${roleId}/status`,
    { status: toStatusBoolean(status) },
    {
      skipAuthRedirect: true,
    },
  );
}

export function getAdminUserRoles({ page = 0, size = 10 } = {}) {
  return apiClient.get("/admin/user-roles", {
    params: {
      page,
      size,
    },
    skipAuthRedirect: true,
  });
}

export function updateAdminUserRoleStatus(id, payload) {
  return apiClient.patch(`/admin/user-roles/${id}/status`, {
    ...payload,
    status: toStatusBoolean(payload?.status),
  }, {
    skipAuthRedirect: true,
  });
}

export function getAccessList({ page = 0, size = 20, accessName = "" } = {}) {
  return apiClient.get("/access/get-access-list", {
    params: {
      page,
      size,
      ...(accessName.trim() ? { accessName: accessName.trim() } : {}),
    },
    skipAuthRedirect: true,
  });
}

export function createAccessName(payload) {
  return apiClient.post("/access/access-name", payload, {
    skipAuthRedirect: true,
  });
}

export function updateAccessName(accessId, payload) {
  return apiClient.put(`/access/update-access/${accessId}`, payload, {
    skipAuthRedirect: true,
  });
}

export function deleteAccessName(accessId) {
  return apiClient.delete(`/access/delete-acccess/${accessId}`, {
    skipAuthRedirect: true,
  });
}

export function updateAccessStatus(accessId, status) {
  return apiClient.patch(`/access/${accessId}/status`, null, {
    params: {
      status: toStatusBoolean(status),
    },
    skipAuthRedirect: true,
  });
}

export function getRoleAccessList({ page = 0, size = 10, search = "" } = {}) {
  return apiClient.get("/role-access", {
    params: {
      page,
      size,
      ...(search.trim() ? { search: search.trim() } : {}),
    },
    skipAuthRedirect: true,
  });
}

export function getRoleAccessByRole(roleId) {
  return apiClient.get(`/role-access/${roleId}`, {
    skipAuthRedirect: true,
  });
}

export function createRoleAccess(payload) {
  return apiClient.post("/role-access", payload, {
    skipAuthRedirect: true,
  });
}

export function updateRoleAccess(roleId, payload) {
  return apiClient.put(`/role-access/${roleId}`, payload, {
    skipAuthRedirect: true,
  });
}

export function updateRoleAccessStatus(roleAccessId, status) {
  return apiClient.patch(`/role-access/${roleAccessId}`, {
    status: toStatusBoolean(status),
  }, {
    skipAuthRedirect: true,
  });
}

export function getEmailNotificationTemplates() {
  return apiClient.get("/admin/email-notification-templates", {
    skipAuthRedirect: true,
  });
}

export function createEmailNotificationTemplate(payload) {
  return apiClient.post("/admin/email-notification-templates", payload, {
    skipAuthRedirect: true,
  });
}

export function updateEmailNotificationTemplate(templateCode, payload) {
  return apiClient.put(
    `/admin/email-notification-templates/${templateCode}`,
    payload,
    {
      skipAuthRedirect: true,
    },
  );
}

export function updateEmailNotificationTemplateStatus(templateCode, status) {
  return apiClient.patch(
    `/admin/email-notification-templates/${templateCode}/status`,
    { status: toStatusBoolean(status) },
    {
      skipAuthRedirect: true,
    },
  );
}

export function getUsers({ page = 0, size = 10, search = "" } = {}) {
  return apiClient.get("/users", {
    params: {
      page,
      size,
      ...(search.trim() ? { search: search.trim() } : {}),
    },
    skipAuthRedirect: true,
  });
}

export function updateUser(userId, payload) {
  return apiClient.put(`/users/${userId}`, payload, {
    skipAuthRedirect: true,
  });
}

export function updateUserStatus(userId, status) {
  return apiClient.patch(
    `/users/${userId}/status`,
    { status: toStatusBoolean(status) },
    {
      skipAuthRedirect: true,
    },
  );
}

export function getAdminBlacklistUsers({ page = 0, size = 10, search = "" } = {}) {
  return apiClient.get("/admin/blacklist-users", {
    params: {
      page,
      size,
      ...(search.trim() ? { search: search.trim() } : {}),
    },
    skipAuthRedirect: true,
  });
}

export function createAdminBlacklistUser(payload) {
  return apiClient.post("/admin/blacklist-users", payload, {
    skipAuthRedirect: true,
  });
}

export function removeAdminBlacklistUser(payload) {
  return apiClient.patch("/admin/blacklist-users/remove", payload, {
    skipAuthRedirect: true,
  });
}
