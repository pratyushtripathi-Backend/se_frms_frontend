function minutesAgo(minutes) {
  return new Date(Date.now() - minutes * 60 * 1000);
}

export function generateNotifications() {
  const entries = [
    { transactionId: "#21524", riskScore: 45, decision: "Block", minsAgo: 20 },
    { transactionId: "#21519", riskScore: 62, decision: "Block", minsAgo: 95 },
    { transactionId: "#21503", riskScore: 51, decision: "Block", minsAgo: 260 },
    { transactionId: "#21487", riskScore: 48, decision: "Block", minsAgo: 480 },
    { transactionId: "#21460", riskScore: 55, decision: "Block", minsAgo: 900 },
    { transactionId: "#21432", riskScore: 40, decision: "Block", minsAgo: 1600 },
    { transactionId: "#21398", riskScore: 58, decision: "Block", minsAgo: 2200 },
    { transactionId: "#21355", riskScore: 44, decision: "Block", minsAgo: 3800 },
    { transactionId: "#21301", riskScore: 60, decision: "Block", minsAgo: 5200 },
    { transactionId: "#21277", riskScore: 47, decision: "Block", minsAgo: 8400 },
  ];

  return entries.map((entry, index) => ({
    id: `NTF-${entry.transactionId.replace("#", "")}`,
    srNo: index + 1,
    transactionId: entry.transactionId,
    riskScore: entry.riskScore,
    decision: entry.decision,
    occurredAt: minutesAgo(entry.minsAgo),
  }));
}
