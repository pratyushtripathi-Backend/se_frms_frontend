import { useCallback, useEffect, useRef, useState } from "react";

import { getAuthErrorMessage } from "../../auth/services/authError";
import { getCases, updateDecisionReview } from "../services/fraudDetailsService";

const TABS = [
  { key: "REVIEW", label: "Under Review" },
  { key: "ALLOW", label: "Allowed" },
  { key: "BLOCK", label: "Blocked" },
];

const BASE_COLUMNS = [
  "Sr no",
  "User Name",
  "Transaction ID",
  "Amount",
  "Matched Rule",
  "Total Risk",
  "Mode",
  "Created By",
  "Created date",
  "Updated At",
  "Status",
];

const rowsPerPage = 10;

const statusPillStyles = {
  "Under Review": "bg-[#E7F9F0] text-[#1DBF73] border border-[#1DBF73]/30",
  Allowed: "bg-[#219653] text-white",
  Blocked: "bg-[#FDEDEE] text-[#EB5757] border border-[#EB5757]/30",
};

export default function CaseManagementPage() {
  const [activeTab, setActiveTab] = useState("REVIEW");
  const [currentPage, setCurrentPage] = useState(1);
  const [openMenuSrNo, setOpenMenuSrNo] = useState(null);
  const [caseRows, setCaseRows] = useState([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [pendingSrNo, setPendingSrNo] = useState(null);
  const [actionErrors, setActionErrors] = useState({});
  const menuRef = useRef(null);

  const showActionColumn = activeTab === "REVIEW";
  const tableColumns = showActionColumn ? [...BASE_COLUMNS, "Action"] : BASE_COLUMNS;

  const loadCases = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage("");

    try {
      const response = await getCases({
        status: activeTab,
        page: currentPage - 1,
        size: rowsPerPage,
      });
      const normalizedResponse = normalizeCaseResponse(
        response.data,
        currentPage,
        rowsPerPage,
      );

      setCaseRows(normalizedResponse.rows);
      setTotalRecords(normalizedResponse.totalRecords);
      setTotalPages(normalizedResponse.totalPages);
    } catch (error) {
      setCaseRows([]);
      setTotalRecords(0);
      setTotalPages(1);
      setErrorMessage(
        getAuthErrorMessage(error, "Unable to load case management data. Please try again."),
      );
    } finally {
      setIsLoading(false);
    }
  }, [activeTab, currentPage]);

  useEffect(() => {
    loadCases();
  }, [loadCases]);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpenMenuSrNo(null);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleReviewAction = async (row, reviewStatus) => {
    setOpenMenuSrNo(null);
    setActionErrors((prev) => ({ ...prev, [row.srNo]: "" }));

    if (!row.decisionId) {
      setActionErrors((prev) => ({
        ...prev,
        [row.srNo]: "Missing decision id for this case; cannot update review status.",
      }));
      return;
    }

    setPendingSrNo(row.srNo);

    try {
      await updateDecisionReview(row.decisionId, reviewStatus);
      await loadCases();
    } catch (error) {
      setActionErrors((prev) => ({
        ...prev,
        [row.srNo]: getAuthErrorMessage(error, "Unable to update the decision. Please try again."),
      }));
    } finally {
      setPendingSrNo(null);
    }
  };

  return (
    <div className="flex min-h-full flex-col bg-[#F4F5F9] pl-6 pr-20 pt-6">

      {/* Main Card */}
      <div className="rounded-[20px] bg-white p-6 shadow-sm">

        {/* Top Controls */}
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-[16px] font-semibold text-[#202224]">
            All Case Management Details
          </h2>

          <div className="flex items-center gap-1 rounded-lg bg-[#F4F5F9] p-1">
            {TABS.map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={`rounded-md px-4 py-1.5 text-[12px] font-semibold transition-colors ${
                  activeTab === tab.key
                    ? "bg-[#333333] text-white"
                    : "text-[#6B7280] hover:text-[#202224]"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Table Card */}
        <div className="overflow-hidden rounded-xl border border-[#ECECEC] bg-white">

          <div className="w-full overflow-x-auto">

            <table className={`w-full border-collapse ${showActionColumn ? "min-w-[1450px]" : "min-w-[1350px]"}`}>

              <thead className="bg-[#F8F9FB]">
                <tr>
                  {tableColumns.map((column) => (
                    <th
                      key={column}
                      className="whitespace-nowrap border-b border-[#ECECEC] px-4 py-4 text-left text-[13px] font-semibold text-[#5A5A5A]"
                    >
                      {column}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {isLoading && (
                  <tr>
                    <td
                      colSpan={tableColumns.length}
                      className="px-4 py-6 text-center text-[13px] text-[#7A7A7A]"
                    >
                      Loading case management data...
                    </td>
                  </tr>
                )}

                {!isLoading && errorMessage && (
                  <tr>
                    <td
                      colSpan={tableColumns.length}
                      className="px-4 py-6 text-center text-[13px] text-[#EB5757]"
                    >
                      {errorMessage}
                    </td>
                  </tr>
                )}

                {!isLoading && !errorMessage && caseRows.length === 0 && (
                  <tr>
                    <td
                      colSpan={tableColumns.length}
                      className="px-4 py-6 text-center text-[13px] text-[#7A7A7A]"
                    >
                      No cases found.
                    </td>
                  </tr>
                )}

                {!isLoading && !errorMessage && caseRows.map((row) => {
                  const isMenuOpen = openMenuSrNo === row.srNo;
                  const isRowPending = pendingSrNo === row.srNo;
                  const rowError = actionErrors[row.srNo];

                  return (
                    <tr
                      key={row.srNo}
                      className="border-b border-[#EEF1F5] text-[13px] text-[#4B5563] transition-colors hover:bg-[#FAFBFC]"
                    >
                      <td className="px-4 py-4 font-medium">{row.srNo}</td>

                      <td className="whitespace-nowrap px-4 py-4">
                        {row.userName}
                      </td>

                      <td className="whitespace-nowrap px-4 py-4">
                        {row.transactionId}
                      </td>

                      <td className="whitespace-nowrap px-4 py-4">
                        {row.amount}
                      </td>

                      <td className="whitespace-nowrap px-4 py-4">
                        {row.matchedRule}
                      </td>

                      <td className="whitespace-nowrap px-4 py-4">
                        {row.totalRisk}
                      </td>

                      <td className="whitespace-nowrap px-4 py-4">
                        {row.mode}
                      </td>

                      <td className="whitespace-nowrap px-4 py-4">
                        {row.createdBy}
                      </td>

                      <td className="px-4 py-4">
                        <div className="flex flex-col leading-5">
                          <span className="font-medium text-[#2F80ED]">
                            {row.createdDate}
                          </span>

                          <span className="text-[#27AE60]">
                            {row.createdTime}
                          </span>
                        </div>
                      </td>

                      <td className="px-4 py-4">
                        <div className="flex flex-col leading-5">
                          <span className="font-medium text-[#2F80ED]">
                            {row.updatedDate}
                          </span>

                          <span className="text-[#27AE60]">
                            {row.updatedTime}
                          </span>
                        </div>
                      </td>

                      <td className="px-4 py-4">
                        <span
                          className={`inline-block rounded-full px-3 py-1 text-[11px] font-semibold ${statusPillStyles[row.status] ?? statusPillStyles["Under Review"]}`}
                        >
                          {row.status}
                        </span>
                      </td>

                      {showActionColumn && (
                        <td className="relative px-4 py-4">
                          <div ref={isMenuOpen ? menuRef : null} className="relative">
                            <button
                              type="button"
                              disabled={isRowPending}
                              onClick={() =>
                                setOpenMenuSrNo((current) =>
                                  current === row.srNo ? null : row.srNo,
                                )
                              }
                              className="flex h-8 w-[92px] items-center justify-center gap-1 rounded-md bg-[#333333] text-[13px] font-semibold text-white transition-colors disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              {isRowPending ? "..." : "Select"}
                              {!isRowPending && (
                                <svg
                                  width="10"
                                  height="10"
                                  viewBox="0 0 10 10"
                                  fill="none"
                                  xmlns="http://www.w3.org/2000/svg"
                                >
                                  <path
                                    d="M2 3.5L5 6.5L8 3.5"
                                    stroke="white"
                                    strokeWidth="1.4"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  />
                                </svg>
                              )}
                            </button>

                            {isMenuOpen && (
                              <div className="absolute right-0 z-20 mt-1 w-[110px] overflow-hidden rounded-md border border-[#E5E7EB] bg-white shadow-lg">
                                <button
                                  type="button"
                                  onClick={() => handleReviewAction(row, "ALLOW")}
                                  className="block w-full px-3 py-2 text-left text-[13px] text-[#219653] hover:bg-[#F8F8F8]"
                                >
                                  Allow
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleReviewAction(row, "BLOCK")}
                                  className="block w-full px-3 py-2 text-left text-[13px] text-[#EB5757] hover:bg-[#F8F8F8]"
                                >
                                  Block
                                </button>
                              </div>
                            )}
                          </div>

                          {rowError && (
                            <div className="absolute left-4 top-full z-10 mt-1 w-[220px] text-[11px] text-[#EB5757]">
                              {rowError}
                            </div>
                          )}
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Bottom Bar */}

          <div className="flex items-center justify-between border-t border-[#ECECEC] bg-white px-6 py-4">

            <p className="text-[13px] text-[#7A7A7A]">
              Showing {caseRows.length} of {totalRecords}{" "}
              transactions
            </p>

            <div className="flex items-center gap-2">

              <button
                type="button"
                onClick={() =>
                  currentPage > 1 && setCurrentPage(currentPage - 1)
                }
                disabled={currentPage <= 1 || isLoading}
                className="flex h-8 w-8 items-center justify-center rounded-md border border-[#E5E7EB] text-[#6B7280] hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                &lt;
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  type="button"
                  onClick={() => setCurrentPage(page)}
                  className={`flex h-8 w-8 items-center justify-center rounded-md text-[12px] font-medium transition ${
                    page === currentPage
                      ? "bg-[#F3F4F6] text-[#111827]"
                      : "text-[#6B7280] hover:bg-[#F8F8F8]"
                  }`}
                >
                  {page}
                </button>
              ))}

              <button
                type="button"
                onClick={() =>
                  currentPage < totalPages && setCurrentPage(currentPage + 1)
                }
                disabled={currentPage >= totalPages || isLoading}
                className="flex h-8 w-8 items-center justify-center rounded-md border border-[#E5E7EB] text-[#6B7280] hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                &gt;
              </button>

            </div>

          </div>

        </div>
      </div>

    </div>
  );
}

function normalizeCaseResponse(responseData, currentPage, pageSize) {
  const payload = responseData?.responseData ?? responseData?.data ?? responseData;
  const rows = findFirstArray(payload).map((row, index) =>
    normalizeCaseRow(row, (currentPage - 1) * pageSize + index + 1),
  );
  const totalRecords =
    findFirstNumber(payload, ["totalElements", "totalRecords", "totalItems", "total"]) ??
    rows.length;
  const totalPages =
    findFirstNumber(payload, ["totalPages", "pages"]) ??
    Math.max(Math.ceil(totalRecords / pageSize), 1);

  return {
    rows,
    totalRecords,
    totalPages: Math.max(totalPages, 1),
  };
}

function normalizeCaseRow(row, srNo) {
  const created = splitDateTime(row.createdAt ?? row.createdDate);
  const updated = splitDateTime(row.updatedAt ?? row.updatedDate);

  return {
    srNo,
    decisionId:
      row.decisionId ??
      row.id ??
      row.caseId ??
      findFirstString(row, ["decisionid", "id", "caseid"]) ??
      null,
    userName:
      row.userName ??
      row.customerName ??
      row.customer?.name ??
      row.userId ??
      findFirstString(row, ["username", "customername", "name", "userid", "customerid"]) ??
      "-",
    transactionId:
      row.transactionId ??
      row.externalTransactionId ??
      row.txnId ??
      row.transaction?.id ??
      "-",
    amount: formatCaseAmount(row.amount ?? row.transactionAmount ?? row.txnAmount),
    matchedRule: formatMatchedRules(row),
    totalRisk:
      row.totalRiskScore ??
      row.riskScore ??
      row.score ??
      row.totalScore ??
      "-",
    mode: row.mode ?? row.channel ?? row.paymentChannel ?? row.transactionChannel ?? "-",
    createdBy: row.createdBy ?? "-",
    createdDate: created.date,
    createdTime: created.time,
    updatedDate: updated.date,
    updatedTime: updated.time,
    status: normalizeCaseStatus(
      row.finalDecision ?? row.status ?? row.caseStatus ?? row.reviewStatus,
    ),
  };
}

function formatMatchedRules(row) {
  if (Array.isArray(row.matchedRules) && row.matchedRules.length > 0) {
    const names = row.matchedRules
      .map((rule) => rule.ruleName ?? rule.ruleCode ?? rule.ruleExpression)
      .filter(Boolean);

    if (names.length > 0) return names.join(", ");
  }

  return (
    row.matchedRule ??
    row.ruleName ??
    row.rule?.name ??
    row.ruleExpression ??
    findFirstString(row, ["matchedrule", "rulename", "ruleexpression", "rule"]) ??
    "-"
  );
}

function normalizeCaseStatus(value) {
  if (value === null || value === undefined || value === "") {
    return "Under Review";
  }

  const normalized = String(value).trim().toLowerCase().replace(/[\s_-]+/g, "");

  if (["allow", "allowed", "approved"].includes(normalized)) {
    return "Allowed";
  }

  if (["block", "blocked", "rejected"].includes(normalized)) {
    return "Blocked";
  }

  if (["review", "underreview", "pending", "open"].includes(normalized)) {
    return "Under Review";
  }

  return String(value);
}

function formatCaseAmount(value) {
  if (value === null || value === undefined || value === "") {
    return "-";
  }

  const numericValue = Number(value);

  if (Number.isNaN(numericValue)) {
    return String(value);
  }

  return numericValue.toLocaleString("en-IN");
}

function findFirstString(value, keys, visited = new Set()) {
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

function findFirstArray(value) {
  if (Array.isArray(value)) return value;
  if (!value || typeof value !== "object") return [];

  const directKeys = ["content", "records", "items", "data", "list", "cases"];
  for (const key of directKeys) {
    if (Array.isArray(value[key])) return value[key];
  }

  for (const nestedValue of Object.values(value)) {
    const result = findFirstArray(nestedValue);
    if (result.length > 0) return result;
  }

  return [];
}

function findFirstNumber(value, keys) {
  if (!value || typeof value !== "object") return null;

  for (const key of keys) {
    const numberValue = Number(value[key]);
    if (Number.isFinite(numberValue)) return numberValue;
  }

  return null;
}

function splitDateTime(value) {
  if (!value) return { date: "-", time: "-" };
  const dateValue = new Date(value);

  if (!Number.isNaN(dateValue.getTime())) {
    return {
      date: dateValue.toLocaleDateString("en-GB"),
      time: dateValue.toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
  }

  const [date = "-", time = "-"] = String(value).split(/[T ]/);
  return {
    date,
    time: time ? time.slice(0, 5) : "-",
  };
}
