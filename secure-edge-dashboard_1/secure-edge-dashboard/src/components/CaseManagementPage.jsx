import { useState } from "react";

import CaseManagementData from "./CaseManagementData";

const TABLE_COLUMNS = [
  "Sr no",
  "User Name",
  "Transaction ID",
  "Amount",
  "Mobile no",
  "Mode",
  "Created date",
  "Updated At",
  "Status",
  "Action",
];

const rowsPerPage = 10;

const statusPillStyles = {
  Resolved: "bg-[#E6F9EE] text-[#219653]",
  "Under Review": "bg-[#E8F1FF] text-[#2F80ED]",
};

export default function CaseManagementPage() {
  const [currentPage, setCurrentPage] = useState(1);

  // Track resolve state per row, seeded from the source data's status field
  const [statusMap, setStatusMap] = useState(() =>
    Object.fromEntries(
      CaseManagementData.map((item) => [item.srNo, item.status])
    )
  );

  const toggleResolve = (srNo) => {
    setStatusMap((prev) => ({
      ...prev,
      [srNo]: prev[srNo] === "Resolved" ? "Under Review" : "Resolved",
    }));
  };

  const totalPages = 5;

  const currentRows = CaseManagementData.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  return (
    <div className="flex min-h-full flex-col bg-[#F4F5F9] pl-6 pr-20 pt-6">

      {/* Main Card */}
      <div className="rounded-[20px] bg-white p-6 shadow-sm">

        {/* Top Controls */}
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-[16px] font-semibold text-[#202224]">
            All Case Mangement Details
          </h2>
        </div>

        {/* Table Card */}
        <div className="overflow-hidden rounded-xl border border-[#ECECEC] bg-white">

          <div className="w-full overflow-x-auto">

            <table className="w-full min-w-[1350px] border-collapse">

              <thead className="bg-[#F8F9FB]">
                <tr>
                  {TABLE_COLUMNS.map((column) => (
                    <th
                      key={column}
                      className="whitespace-nowrap border-b border-[#ECECEC] px-4 py-4 text-left text-[12px] font-semibold text-[#5A5A5A]"
                    >
                      {column}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {currentRows.map((row) => {
                  const status = statusMap[row.srNo];
                  const isResolved = status === "Resolved";

                  return (
                    <tr
                      key={row.srNo}
                      className="border-b border-[#EEF1F5] text-[12px] text-[#4B5563] transition-colors hover:bg-[#FAFBFC]"
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
                        {row.mobileNo}
                      </td>

                      <td className="whitespace-nowrap px-4 py-4">
                        {row.mode}
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
                          className={`inline-block rounded-full px-3 py-1 text-[11px] font-semibold ${statusPillStyles[status]}`}
                        >
                          {status}
                        </span>
                      </td>

                      <td className="px-4 py-4">
                        <button
                          type="button"
                          onClick={() => toggleResolve(row.srNo)}
                          className={`h-8 w-[92px] rounded-md text-[12px] font-semibold text-white transition-colors ${
                            isResolved ? "bg-[#219653]" : "bg-[#EB5757]"
                          }`}
                        >
                          {isResolved ? "Resolved" : "Resolve"}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Bottom Bar */}

          <div className="flex items-center justify-between border-t border-[#ECECEC] bg-white px-6 py-4">

            <p className="text-[12px] text-[#7A7A7A]">
              Showing {currentRows.length} of {CaseManagementData.length}{" "}
              transactions
            </p>

            <div className="flex items-center gap-2">

              <button
                type="button"
                onClick={() =>
                  currentPage > 1 && setCurrentPage(currentPage - 1)
                }
                className="flex h-8 w-8 items-center justify-center rounded-md border border-[#E5E7EB] text-[#6B7280] hover:bg-gray-50"
              >
                &lt;
              </button>

              {[1, 2, 3, 4, 5].map((page) => (
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
                className="flex h-8 w-8 items-center justify-center rounded-md border border-[#E5E7EB] text-[#6B7280] hover:bg-gray-50"
              >
                &gt;
              </button>

            </div>

          </div>

        </div>
      </div>

      {/* Footer */}
      <footer className="mt-6 pb-5 text-center">
        <p className="text-[12px] font-medium text-[#8C8C8C]">
          Copyright@2026 design by secureedge
        </p>
      </footer>

    </div>
  );
}