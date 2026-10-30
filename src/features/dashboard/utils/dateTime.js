// Shared date/time display for tables: "27-10-2026" and "03:07 pm".
// Formatted by hand (not toLocale*) so every browser shows exactly this.

export function formatDisplayDate(date) {
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${day}-${month}-${date.getFullYear()}`;
}

export function formatDisplayTime(date) {
  const hours = date.getHours();
  const hour12 = String(hours % 12 || 12).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${hour12}:${minutes} ${hours < 12 ? "am" : "pm"}`;
}

// Reads the timestamp shapes the backend sends:
// - epoch seconds or milliseconds (number or numeric string)
// - Java LocalDateTime arrays [2026, 10, 27, 15, 7, 30, nanos]
// - ISO strings, including 6 or 9 fractional digits
// - "DD-MM-YYYY HH:mm[:ss]" strings
// Returns a Date, or null when the value can't be read.
export function parseDateTime(value) {
  if (value === null || value === undefined || value === "") return null;

  if (Array.isArray(value)) {
    const [year, month = 1, day = 1, hour = 0, minute = 0, second = 0, nanos = 0] =
      value.map(Number);
    return validDate(new Date(year, month - 1, day, hour, minute, second, Math.floor(nanos / 1e6)));
  }

  const text = String(value).trim();

  if (typeof value === "number" || /^\d+(\.\d+)?$/.test(text)) {
    const numeric = Number(value);
    return validDate(new Date(numeric < 1e12 ? numeric * 1000 : numeric));
  }

  const dayFirst = text.match(/^(\d{2})-(\d{2})-(\d{4})(?:[ T](\d{2}):(\d{2})(?::(\d{2}))?)?/);
  if (dayFirst) {
    const [, day, month, year, hour = 0, minute = 0, second = 0] = dayFirst;
    return validDate(new Date(year, month - 1, day, hour, minute, second));
  }

  // Trim extra fractional digits (micro/nanoseconds) to milliseconds.
  return validDate(new Date(text.replace(" ", "T").replace(/(\.\d{3})\d+/, "$1")));
}

// { date: "27-10-2026", time: "03:07 pm" }, or "-" for both when empty.
export function splitDisplayDateTime(value) {
  if (value === null || value === undefined || value === "") {
    return { date: "-", time: "-" };
  }

  const date = parseDateTime(value);
  if (date) return { date: formatDisplayDate(date), time: formatDisplayTime(date) };

  const [datePart, timePart = "-"] = String(value).replace("T", " ").split(" ");
  return { date: datePart || "-", time: timePart };
}

function validDate(date) {
  return Number.isNaN(date.getTime()) ? null : date;
}
