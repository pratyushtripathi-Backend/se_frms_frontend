/*
 * Shared transaction data normalization helpers.
 *
 * These were originally defined only inside TransactionDataPage.jsx. They are
 * extracted here so that any other view showing transaction data (e.g. the
 * Dashboard Overview "Recent Transactions" widget) can use the *exact same*
 * fetch-normalization logic and never drift out of sync with the main
 * Transaction Data page.
 */

export function parseTransactionDate(value) {
  if (!value) {
    return null;
  }

  const [day, month, year] = String(value).split("-").map(Number);

  if (!day || !month || !year) {
    return null;
  }

  return new Date(year, month - 1, day);
}

export function normalizeTransactionsResponse(responseData, pageSize) {
  const payload =
    responseData?.responseData ??
    responseData?.data?.responseData ??
    responseData?.data ??
    responseData;
  const rawRows = findFirstArray(payload);
  const totalRecords =
    findFirstNumber(payload, [
      "totalElements",
      "totalRecords",
      "totalCount",
      "total",
      "count",
    ]) ?? rawRows.length;
  const totalPages =
    findFirstNumber(payload, ["totalPages", "pages"]) ??
    Math.max(Math.ceil(totalRecords / pageSize), 1);

  return {
    rawRows,
    totalRecords,
    totalPages: Math.max(totalPages, 1),
  };
}

export function normalizeTransactionRow(row, index, pageOffset) {
  const createdAtRaw =
    row.createdAt ?? row.createdDate ?? row.created_at ?? row.transactionDate ?? null;
  const updatedAtRaw = row.updatedAt ?? row.updatedDate ?? row.updated_at ?? null;
  const created = splitTransactionDateTime(createdAtRaw);
  const updated = splitTransactionDateTime(updatedAtRaw);

  const ipAddress =
    row.ipAddress ??
    row.ip_address ??
    row.ip ??
    row.clientIp ??
    findFirstString(row, [
      "ipaddress",
      "ip_address",
      "ip",
      "clientip",
      "client_ip",
      "sourceip",
      "source_ip",
      "userip",
      "remoteaddr",
      "remote_addr",
    ]) ??
    "-";

  const location =
    row.location ??
    row.city ??
    row.address ??
    row.geoLocation ??
    findFirstString(row, [
      "location",
      "city",
      "geolocation",
      "geo_location",
      "place",
      "region",
      "area",
      "locationname",
      "location_name",
      "userlocation",
      "user_location",
      "state",
      "country",
    ]) ??
    "-";

  const deviceId =
    row.deviceId ??
    row.device_id ??
    row.deviceID ??
    row.deviceCode ??
    findFirstString(row, [
      "deviceid",
      "device_id",
      "deviceuuid",
      "device_uuid",
      "devicecode",
      "device_code",
      "deviceidentifier",
      "device_identifier",
      "imei",
      "udid",
    ]) ??
    "-";

  return {
    srNo: pageOffset + index + 1,
    transactionId: row.transactionId ?? row.id ?? "-",
    userId: row.userId ?? row.userID ?? row.user_id ?? row.customerId ?? "-",
    merchantId: row.merchantId ?? row.merchant_id ?? row.merchantCode ?? "-",
    channel: row.channel ?? row.paymentChannel ?? row.mode ?? row.transactionChannel ?? "-",
    amount: formatTransactionAmount(
      row.amount ?? row.transactionAmount ?? row.txnAmount ?? row.amountValue,
    ),
    currency: row.currency ?? row.currencyCode ?? "-",
    latitude: row.latitude ?? row.lat ?? "-",
    longitude: row.longitude ?? row.lng ?? row.long ?? "-",
    longitude2: row.longitude2 ?? row.destinationLongitude ?? row.longitude ?? "-",
    ipAddress,
    location,
    deviceId,
    remark: row.remark ?? row.remarks ?? row.description ?? row.note ?? "-",
    status: normalizeTransactionStatus(row.status ?? row.transactionStatus ?? row.isActive),
    createdBy: row.createdBy ?? "-",
    createdAtRaw,
    createdDate: created.date,
    createdTime: created.time,
    updatedDate: updated.date,
    updatedTime: updated.time,
  };
}

export function formatTransactionAmount(value) {
  if (value === null || value === undefined || value === "") {
    return "-";
  }

  const numericValue = Number(value);

  if (Number.isNaN(numericValue)) {
    return String(value);
  }

  return numericValue.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function normalizeTransactionStatus(value) {
  if (typeof value === "boolean") {
    return value ? "Active" : "Inactive";
  }

  if (value === null || value === undefined || value === "") {
    return "-";
  }

  const normalized = String(value).trim().toLowerCase();

  if (["active", "success", "completed", "approved", "true"].includes(normalized)) {
    return "Active";
  }

  if (["inactive", "failed", "rejected", "false"].includes(normalized)) {
    return "Inactive";
  }

  return String(value);
}

export function splitTransactionDateTime(value) {
  if (!value) {
    return { date: "-", time: "-" };
  }

  const parsed = new Date(value);

  if (!Number.isNaN(parsed.getTime())) {
    return {
      date: parsed.toLocaleDateString("en-GB").replace(/\//g, "-"),
      time: parsed.toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
  }

  const [date, time = "-"] = String(value).replace("T", " ").split(" ");
  return { date: date || "-", time };
}

export function findFirstArray(value, visited = new Set()) {
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
    "transactions",
    "transactionList",
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

  return [];
}

export function findFirstString(value, keys, visited = new Set()) {
  if (!value || typeof value !== "object" || visited.has(value)) return undefined;

  visited.add(value);

  const normalizedKeys = keys.map((key) => key.toLowerCase());

  for (const [objectKey, candidate] of Object.entries(value)) {
    if (!normalizedKeys.includes(objectKey.toLowerCase())) continue;

    if (typeof candidate === "string" && candidate.trim()) return candidate;

    if (typeof candidate === "number") return String(candidate);
  }

  for (const childValue of Object.values(value)) {
    if (childValue && typeof childValue === "object") {
      const found = findFirstString(childValue, keys, visited);

      if (found !== undefined) return found;
    }
  }

  return undefined;
}

export function findFirstNumber(value, keys, visited = new Set()) {
  if (!value || typeof value !== "object" || visited.has(value)) return undefined;

  visited.add(value);

  for (const key of keys) {
    const candidate = value[key];

    if (typeof candidate === "number") return candidate;

    if (
      typeof candidate === "string" &&
      candidate.trim() &&
      !Number.isNaN(Number(candidate))
    ) {
      return Number(candidate);
    }
  }

  for (const childValue of Object.values(value)) {
    const candidate = findFirstNumber(childValue, keys, visited);

    if (candidate !== undefined) return candidate;
  }

  return undefined;
}
