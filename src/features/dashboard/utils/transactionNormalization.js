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

  // Location is derived from the transaction's own latitude/longitude
  // (reverse-geocoded into a place name via OpenStreetMap Nominatim, see
  // enrichRowsWithLocationNames below) rather than a separate
  // "location"/"city"/"address" string field, so it always reflects the same
  // coordinates shown in the Latitude/Longitude columns instead of a
  // possibly-stale or inconsistent label from the API. The name itself is
  // resolved asynchronously after the row is created, so it starts out as a
  // placeholder here.
  const latitude = row.latitude ?? row.lat ?? "-";
  const longitude = row.longitude ?? row.lng ?? row.long ?? "-";
  const longitude2 = row.longitude2 ?? row.destinationLongitude ?? row.longitude ?? "-";
  const hasCoordinates = isUsableCoordinate(latitude) && isUsableCoordinate(longitude);
  const location = hasCoordinates ? "Locating..." : "-";

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
    latitude,
    longitude,
    longitude2,
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

function isUsableCoordinate(value) {
  if (value === null || value === undefined || value === "" || value === "-") {
    return false;
  }

  return !Number.isNaN(Number(value));
}

// --- Reverse geocoding (OpenStreetMap Nominatim) ---------------------------
//
// The Location column shows a human-readable place name resolved from a
// transaction's own latitude/longitude, rather than raw coordinates or a
// separate (possibly stale) location field from the API. Name resolution
// requires an HTTP call, so it happens asynchronously via
// `enrichRowsWithLocationNames` after rows are normalized, backed by a
// shared cache and a throttled request queue so repeat coordinates (and
// polling/auto-refresh) don't refetch or exceed Nominatim's usage-policy
// rate limit of ~1 request/second. Attribution: (c) OpenStreetMap
// contributors, https://www.openstreetmap.org/copyright.
const LOCATION_NAME_CACHE = new Map(); // "lat,lon" -> resolved name string
const LOCATION_NAME_PENDING = new Map(); // "lat,lon" -> in-flight Promise<string>
const NOMINATIM_MIN_INTERVAL_MS = 1100;
let lastNominatimRequestAt = 0;
let nominatimQueueTail = Promise.resolve();

function roundCoordinate(value) {
  // ~11m precision at the equator - coarse enough that nearby transactions
  // reuse the same cached lookup instead of re-hitting Nominatim.
  return Math.round(Number(value) * 10000) / 10000;
}

function locationCacheKey(latitude, longitude) {
  return `${roundCoordinate(latitude)},${roundCoordinate(longitude)}`;
}

function pickPrimaryPlaceName(address) {
  return (
    address.city ||
    address.town ||
    address.village ||
    address.suburb ||
    address.county ||
    address.state_district ||
    address.state ||
    null
  );
}

async function fetchNominatimLocationName(latitude, longitude) {
  const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}&zoom=10&addressdetails=1`;
  const response = await fetch(url, {
    headers: { Accept: "application/json" },
  });

  if (!response.ok) {
    throw new Error(`Nominatim request failed with status ${response.status}`);
  }

  const data = await response.json();
  const address = data?.address ?? {};
  const primary = pickPrimaryPlaceName(address);
  const region = address.state || address.state_district || null;
  const country = address.country || null;

  const parts = [primary, primary !== region ? region : null, country].filter(Boolean);

  if (parts.length > 0) {
    return parts.join(", ");
  }

  return data?.display_name ?? null;
}

// Runs Nominatim lookups one at a time, spacing them out to respect the
// ~1 request/second usage-policy limit, and de-dupes concurrent requests
// for the same coordinates.
function queueNominatimLookup(latitude, longitude) {
  const key = locationCacheKey(latitude, longitude);

  if (LOCATION_NAME_CACHE.has(key)) {
    return Promise.resolve(LOCATION_NAME_CACHE.get(key));
  }

  if (LOCATION_NAME_PENDING.has(key)) {
    return LOCATION_NAME_PENDING.get(key);
  }

  const task = nominatimQueueTail.then(async () => {
    const waitMs = Math.max(
      0,
      NOMINATIM_MIN_INTERVAL_MS - (Date.now() - lastNominatimRequestAt),
    );

    if (waitMs > 0) {
      await new Promise((resolve) => window.setTimeout(resolve, waitMs));
    }

    lastNominatimRequestAt = Date.now();

    let resolvedName = "-";

    try {
      resolvedName = (await fetchNominatimLocationName(latitude, longitude)) || "-";
    } catch {
      resolvedName = "-";
    }

    LOCATION_NAME_CACHE.set(key, resolvedName);
    LOCATION_NAME_PENDING.delete(key);
    return resolvedName;
  });

  // Keep the queue moving even if this lookup failed, and never let a
  // rejection here surface as an unhandled promise rejection.
  nominatimQueueTail = task.catch(() => {});
  LOCATION_NAME_PENDING.set(key, task);
  return task;
}

// Resolves a place name for each row's latitude/longitude and reports it
// back via onUpdate(transactionId, locationName) as each lookup settles
// (already-cached coordinates resolve immediately), so callers can patch
// their row state incrementally instead of blocking on every row.
export function enrichRowsWithLocationNames(rows, onUpdate) {
  rows.forEach((row) => {
    if (!isUsableCoordinate(row.latitude) || !isUsableCoordinate(row.longitude)) {
      return;
    }

    const key = locationCacheKey(row.latitude, row.longitude);

    if (LOCATION_NAME_CACHE.has(key)) {
      onUpdate(row.transactionId, LOCATION_NAME_CACHE.get(key));
      return;
    }

    queueNominatimLookup(row.latitude, row.longitude).then((name) => {
      onUpdate(row.transactionId, name);
    });
  });
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
