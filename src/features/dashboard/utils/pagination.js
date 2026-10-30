// Shared pagination helpers.

// Page buttons to show: a window of `windowSize` pages kept around the
// current page (1-based), e.g. on page 7 of 12 -> 5 6 7 8 9. Showing only
// pages 1-5 meant page 6 onwards had no button and the current page wasn't
// highlighted once you passed page 5.
export function getVisiblePageNumbers(currentPage, totalPages, windowSize = 5) {
  const pageCount = Math.max(Number(totalPages) || 1, 1);
  const size = Math.min(windowSize, pageCount);
  const startPage = Math.max(
    Math.min(currentPage - Math.floor(size / 2), pageCount - size + 1),
    1,
  );

  return Array.from({ length: size }, (_, index) => startPage + index);
}

// Fetches every page of a paged API and returns all rows, for filters the
// backend can't apply (search text, dates on endpoints without date params):
// the filter then runs over the complete list, so the total, the page count
// and each page's rows are all correct.
//
// fetchPage(page, size) must resolve to { rows, totalPages }.
// Uses big pages (100 rows) so a few requests cover a lot of data, and stops
// at `maxPages` as a safety limit.
export async function fetchAllPages(fetchPage, { pageSize = 100, maxPages = 50 } = {}) {
  const first = await fetchPage(0, pageSize);
  const pageCount = Math.min(Math.max(Number(first.totalPages) || 1, 1), maxPages);

  if (pageCount <= 1) return first.rows;

  const rest = await Promise.all(
    Array.from({ length: pageCount - 1 }, (_, index) => fetchPage(index + 1, pageSize)),
  );

  return rest.reduce((allRows, page) => allRows.concat(page.rows), [...first.rows]);
}

// Combines a Year filter with From/To dates into one inclusive date range
// (YYYY-MM-DD strings, or "" for open-ended). `isEmpty` is true when the
// filters can't match anything (e.g. From after To, or a From/To outside the
// chosen year).
export function resolveDateRange({ year = "", fromDate = "", toDate = "" } = {}) {
  let start = fromDate || "";
  let end = toDate || "";

  if (year) {
    const yearStart = `${year}-01-01`;
    const yearEnd = `${year}-12-31`;
    start = start && start > yearStart ? start : yearStart;
    end = end && end < yearEnd ? end : yearEnd;
  }

  return {
    fromDate: start,
    toDate: end,
    isEmpty: Boolean(start && end && start > end),
  };
}
