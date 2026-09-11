import { useState } from "react";
import { ChevronDown, Download } from "lucide-react";

import FraudAlertData from "./FraudAlertData";

const TABLE_COLUMNS = [
  "Sr no",
  "ID",
  "User Name",
  "Account no",
  "Amount",
  "Mode",
  "Mobile no",
  "Location",
  "Created date",
  "Priority",
];

const rowsPerPage = 10;

const priorityStyles = {
  "Low Risk": "bg-[#E6F9EE] text-[#27AE60]",
  "Medium Risk": "bg-[#FFF3E3] text-[#F2994A]",
  "High Risk": "bg-[#FDECEC] text-[#EB5757]",
};

export default function FraudAlertPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [showExportMenu, setShowExportMenu] = useState(false);

  const totalPages = 5;

  const currentRows = FraudAlertData.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  const exportCSV = () => {
    const headers = [
      "Sr no",
      "ID",
      "User Name",
      "Account no",
      "Amount",
      "Mode",
      "Mobile no",
      "Location",
      "Created Date",
      "Created Time",
      "Priority",
    ];

    const csvRows = FraudAlertData.map((row) => [
      row.srNo,
      row.id,
      row.userName,
      row.accountNo,
      row.amount,
      row.mode,
      row.mobileNo,
      row.location,
      row.createdDate,
      row.createdTime,
      row.priority,
    ]);

    const csv = [headers, ...csvRows]
      .map((cells) => cells.join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "fraud-alert.csv";
    link.click();

    URL.revokeObjectURL(url);
    setShowExportMenu(false);
  };

  return (
    <div className="flex min-h-full flex-col bg-[#F4F5F9] pl-6 pr-20 pt-6">

      {/* Main Card */}
      <div className="rounded-[20px] bg-white p-6 shadow-sm">

        {/* Top Controls */}
        <div className="mb-6 flex items-center justify-between">

          <h2 className="text-[16px] font-semibold text-[#202224]">
            All Fraud Alert Overview
          </h2>

          <div className="relative">
            <button
              type="button"
              onClick={() => setShowExportMenu((open) => !open)}
              className="flex h-10 items-center gap-2 rounded-lg border border-[#FF4D4F] bg-white px-4 text-[13px] font-semibold text-[#FF4D4F]"
            >
              <Download size={14} />
              Export
              <ChevronDown size={13} />
            </button>

            {showExportMenu && (
              <div className="absolute right-0 z-30 mt-1.5 w-[150px] overflow-hidden rounded-lg border border-[#E5E7EB] bg-white shadow-[0_8px_20px_rgba(0,0,0,.08)]">
                <button
                  type="button"
                  onClick={exportCSV}
                  className="w-full px-3.5 py-2.5 text-left text-[13px] text-[#3A3A3A] hover:bg-[#F8F9FB]"
                >
                  Export CSV
                </button>
              </div>
            )}
          </div>

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
                {currentRows.map((row) => (
                  <tr
                    key={row.srNo}
                    className="border-b border-[#EEF1F5] text-[12px] text-[#4B5563] transition-colors hover:bg-[#FAFBFC]"
                  >
                    <td className="px-4 py-4 font-medium">{row.srNo}</td>

                    <td className="whitespace-nowrap px-4 py-4">{row.id}</td>

                    <td className="whitespace-nowrap px-4 py-4">
                      {row.userName}
                    </td>

                    <td className="whitespace-nowrap px-4 py-4">
                      {row.accountNo}
                    </td>

                    <td className="whitespace-nowrap px-4 py-4">
                      {row.amount}
                    </td>

                    <td className="whitespace-nowrap px-4 py-4">{row.mode}</td>

                    <td className="whitespace-nowrap px-4 py-4">
                      {row.mobileNo}
                    </td>

                    <td className="whitespace-nowrap px-4 py-4">
                      {row.location}
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
                      <span
                        className={`inline-block rounded-full px-3 py-1 text-[11px] font-semibold ${
                          priorityStyles[row.priority]
                        }`}
                      >
                        {row.priority}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Bottom Bar */}

          <div className="flex items-center justify-between border-t border-[#ECECEC] bg-white px-6 py-4">

            <p className="text-[12px] text-[#7A7A7A]">
              Showing {currentRows.length} of {FraudAlertData.length}{" "}
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

    </div>
  );
}
