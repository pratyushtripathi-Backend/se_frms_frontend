#!/usr/bin/env node
/*
 * One-off folder clean-up for se_frms_frontend.
 *
 * What it does (and nothing else):
 *   1. Moves files into a feature-based folder structure with `git mv`
 *      (file history is kept).
 *   2. Rewrites relative import paths so every import still points at the
 *      same file after the move. No other code is touched.
 *   3. Deletes files that nothing in the app imports (old mock data, unused
 *      components, an old copy of the dashboard project, unused images).
 *
 * Usage (from the project root, with a clean git working tree):
 *   node tools/restructure-folders.mjs            # dry run: prints the plan
 *   node tools/restructure-folders.mjs --apply    # does it
 *
 * Afterwards: `npm run build` to confirm, then commit.
 * To undo before committing: `git reset --hard HEAD` (the script refuses to
 * run on a tree with uncommitted changes, so this only undoes the script).
 */

import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const APPLY = process.argv.includes("--apply");
const FORCE = process.argv.includes("--force");
const ROOT = process.cwd();

const OLD = "src/features/dashboard_1";
const NEW = "src/features/dashboard";

// ---------------------------------------------------------------------------
// 1. Moves  (old path -> new path), relative to the project root
// ---------------------------------------------------------------------------
const group = (oldDir, newDir, names) =>
  names.map((name) => [`${oldDir}/${name}`, `${newDir}/${name}`]);

const C = `${OLD}/components`;
const P = `${NEW}/pages`;

const MOVES = [
  [`${OLD}/DashboardPage.jsx`, `${NEW}/DashboardPage.jsx`],

  // Page frame
  ...group(C, `${NEW}/layout`, ["Header.jsx", "Sidebar.jsx"]),

  // Dashboard overview widgets
  ...group(C, `${NEW}/widgets`, [
    "StatCards.jsx",
    "TransactionMonitoring.jsx",
    "FraudDetectType.jsx",
    "FraudDetectionTrend.jsx",
    "AlertFeed.jsx",
    "RecentTransactions.jsx",
  ]),

  // Building blocks shared by several dashboard pages
  ...group(C, `${NEW}/components`, [
    "DashboardEditButton.jsx",
    "DashboardStatusToggle.jsx",
    "DashboardSuccessModal.jsx",
    "ExportFile.jsx",
  ]),

  // Non-UI helpers shared by several dashboard pages
  ...group(C, `${NEW}/utils`, [
    "dashboardDatePicker.js",
    "scrollPageStrip.js",
    "transactionNormalization.js",
  ]),

  // Pages, grouped like the sidebar menu
  ...group(C, `${P}/fraud-details`, [
    "AllCategoryPage.jsx",
    "AllFraudRulesPage.jsx",
    "AllRuleScorePage.jsx",
    "BlackListEntryPage.jsx",
  ]),
  ...group(C, `${P}/fraud-alert`, ["FraudAlertPage.jsx", "FraudAlertData.js"]),
  ...group(C, `${P}/transaction-monitoring`, [
    "TransactionDataPage.jsx",
    "ScoringTablePage.jsx",
    "MatchedRulePage.jsx",
    "DecisionPolicyPage.jsx",
    "DecisionPolicyData.js",
    "DecisionTablePage.jsx",
  ]),
  ...group(C, `${P}/case-management`, ["CaseManagementPage.jsx"]),
  ...group(C, `${P}/user-management`, [
    "AllEmployeePage.jsx",
    "AllUsersPage.jsx",
    "AddUserPage.jsx",
    "ManageRolePage.jsx",
    "UserRolePage.jsx",
    "AccessMasterPage.jsx",
    "RoleAccessPage.jsx",
    "UserBlacklistPage.jsx",
  ]),
  ...group(C, `${P}/report`, ["ReportPage.jsx"]),
  ...group(C, `${P}/login-details`, [
    "LoginHistoryPage.jsx",
    "LoginAttemptPage.jsx",
    "LoginSessionPage.jsx",
  ]),
  ...group(C, `${P}/audit-trail`, ["AuditTrailPage.jsx", "AuditTrailDetailModal.jsx"]),
  ...group(C, `${P}/notifications`, ["NotificationsPage.jsx", "NotificationRecordPage.jsx"]),
  ...group(C, `${P}/account`, [
    "ProfilePage.jsx",
    "ChangePasswordPage.jsx",
    "EmailFormatPage.jsx",
  ]),

  // API service files: same files, new feature folder name
  ...group(`${OLD}/services`, `${NEW}/services`, [
    "adminEmployeeService.js",
    "analyticsService.js",
    "blacklistService.js",
    "fraudDetailsService.js",
    "loginAttemptService.js",
    "loginHistoryService.js",
    "loginSessionService.js",
    "notificationService.js",
    "transactionService.js",
    "userProfileService.js",
  ]),
];

// ---------------------------------------------------------------------------
// 2. Deletions: nothing in the app imports these (checked from src/main.jsx)
// ---------------------------------------------------------------------------
const DELETES = [
  // Old static mock data, replaced by live API calls
  ...[
    "AccessMasterData.js",
    "AlertFeedData.js",
    "AllCategoryData.js",
    "AllEmployeeData.js",
    "AllFraudRulesData.js",
    "AllRuleScoreData.js",
    "BlackListEntryData.js",
    "CaseManagementData.js",
    "DecisionTableData.js",
    "EmailFormatData.js",
    "FraudDetectTypeData.js",
    "FraudDetectionTrendData.js",
    "LoginAttemptData.js",
    "LoginHistoryData.js",
    "LoginSessionData.js",
    "ManageRoleData.js",
    "MatchedRuleData.js",
    "NotificationRecordData.js",
    "NotificationsData.js",
    "RecentTransactionsData.js",
    "RoleAccessData.js",
    "ScoringTableData.js",
    "TransactionData.js",
    "TransactionMonitoringData.js",
    "UserBlacklistData.js",
    "UserRoleData.js",
  ].map((name) => `${C}/${name}`),

  // Components that no page renders
  `${C}/CreateRulesPage.jsx`,
  `${C}/TransactionControl.jsx`,
  "src/features/auth/components/BackToLoginButton.jsx",

  // Unused stylesheet and images
  "src/styles/index-1.css",
  "src/assets/left-shapeold.png",
  "public/report-empty-state.png",

  // Old standalone copy of the dashboard project (own package.json, not used)
  "secure-edge-dashboard_1",

  // Leftover output folder
  "Claude outputs",
];

// ---------------------------------------------------------------------------
// helpers
// ---------------------------------------------------------------------------
const posix = (p) => p.split(path.sep).join("/");
const abs = (p) => path.join(ROOT, p);
const exists = (p) => fs.existsSync(abs(p));

function git(args, options = {}) {
  return execFileSync("git", args, { cwd: ROOT, encoding: "utf8", ...options });
}

function isTracked(p) {
  try {
    git(["ls-files", "--error-unmatch", "--", p], { stdio: "pipe" });
    return true;
  } catch {
    return false;
  }
}

function listSourceFiles(dir) {
  const out = [];
  for (const entry of fs.readdirSync(abs(dir), { withFileTypes: true })) {
    const rel = `${dir}/${entry.name}`;
    if (entry.isDirectory()) out.push(...listSourceFiles(rel));
    else if (/\.(jsx?|mjs)$/.test(entry.name)) out.push(rel);
  }
  return out;
}

const SPECIFIER = /(\bfrom\s*|\bimport\s*\(?\s*)(["'])(\.{1,2}\/[^"']*)\2/g;
const EXTENSIONS = ["", ".jsx", ".js", "/index.jsx", "/index.js"];

// Resolve a relative import (as written in `fromFile`) to a project file.
function resolveImport(fromFile, spec, fileExists) {
  const base = posix(path.normalize(path.join(path.dirname(fromFile), spec)));
  for (const ext of EXTENSIONS) {
    if (fileExists(base + ext)) return { target: base + ext, ext };
  }
  return null;
}

function relativeSpec(fromFile, toFile, droppedExt) {
  let target = toFile;
  if (droppedExt && target.endsWith(droppedExt)) target = target.slice(0, -droppedExt.length);
  let rel = posix(path.relative(path.dirname(fromFile), target));
  if (!rel.startsWith(".")) rel = `./${rel}`;
  return rel;
}

// ---------------------------------------------------------------------------
// checks
// ---------------------------------------------------------------------------
try {
  git(["rev-parse", "--is-inside-work-tree"], { stdio: "pipe" });
} catch {
  console.error("✖ Run this from the project root of a git repository.");
  process.exit(1);
}

if (!exists("package.json") || !exists(OLD)) {
  if (exists(NEW) && !exists(OLD)) {
    console.log("✔ Already restructured (src/features/dashboard exists). Nothing to do.");
    process.exit(0);
  }
  console.error(`✖ Expected to find package.json and ${OLD}/. Run from the project root.`);
  process.exit(1);
}

const dirty = git(["status", "--porcelain"]).trim();
if (APPLY && dirty && !FORCE) {
  console.error(
    "✖ You have uncommitted changes. Commit or stash them first, so this\n" +
      "  restructure can be reviewed and undone on its own.\n" +
      "  (Use --force to run anyway.)",
  );
  process.exit(1);
}

const missingMoves = MOVES.filter(([from]) => !exists(from)).map(([from]) => from);
if (missingMoves.length) {
  console.error("✖ These files were expected but not found (folder already changed?):");
  missingMoves.forEach((p) => console.error("   " + p));
  process.exit(1);
}

// Every file still left in the old folders must be either moved or deleted,
// otherwise its imports would break silently.
const plannedOld = new Set([...MOVES.map(([from]) => from), ...DELETES]);
const leftovers = listSourceFiles(OLD).filter((p) => !plannedOld.has(p));
if (leftovers.length) {
  console.error("✖ Files in the dashboard folder that this script doesn't know about:");
  leftovers.forEach((p) => console.error("   " + p));
  console.error("  (Added after this script was written; add them to MOVES first.)");
  process.exit(1);
}

// ---------------------------------------------------------------------------
// plan import rewrites (computed BEFORE moving, from the current layout)
// ---------------------------------------------------------------------------
const moveMap = new Map(MOVES);
const newPathOf = (p) => moveMap.get(p) ?? p;
const deleted = (p) => DELETES.some((d) => p === d || p.startsWith(d + "/"));

const rewrites = []; // { file (new path), content, changes[] }
const brokenImports = [];

for (const file of listSourceFiles("src")) {
  if (deleted(file)) continue;

  const newFile = newPathOf(file);
  const original = fs.readFileSync(abs(file), "utf8");
  const changes = [];

  const updated = original.replace(SPECIFIER, (match, lead, quote, spec) => {
    const resolved = resolveImport(file, spec, exists);
    if (!resolved) return match; // not a project file (left as written)

    if (deleted(resolved.target)) {
      brokenImports.push(`${file} imports ${spec} (scheduled for deletion)`);
      return match;
    }

    const nextSpec = relativeSpec(newFile, newPathOf(resolved.target), resolved.ext);
    if (nextSpec === spec) return match;
    changes.push(`${spec}  →  ${nextSpec}`);
    return `${lead}${quote}${nextSpec}${quote}`;
  });

  if (changes.length) rewrites.push({ file: newFile, content: updated, changes });
}

if (brokenImports.length) {
  console.error("✖ Refusing: a file scheduled for deletion is still imported:");
  brokenImports.forEach((l) => console.error("   " + l));
  process.exit(1);
}

// ---------------------------------------------------------------------------
// report / apply
// ---------------------------------------------------------------------------
const presentDeletes = DELETES.filter(exists);

console.log(`\n${APPLY ? "Applying" : "Dry run"}: ${MOVES.length} moves, ` +
  `${presentDeletes.length} deletions, ${rewrites.length} files with updated imports\n`);

console.log("Moves:");
MOVES.forEach(([from, to]) => console.log(`  ${from}\n    → ${to}`));

console.log("\nDeletions:");
presentDeletes.forEach((p) => console.log(`  ${p}`));

console.log("\nImport path updates:");
rewrites.forEach(({ file, changes }) => {
  console.log(`  ${file}`);
  changes.forEach((c) => console.log(`      ${c}`));
});

if (!APPLY) {
  console.log("\nNothing was changed. Re-run with --apply to perform these steps.");
  process.exit(0);
}

for (const [from, to] of MOVES) {
  fs.mkdirSync(path.dirname(abs(to)), { recursive: true });
  if (isTracked(from)) git(["mv", "--", from, to]);
  else fs.renameSync(abs(from), abs(to));
}

for (const { file, content } of rewrites) {
  fs.writeFileSync(abs(file), content, "utf8");
}

for (const p of presentDeletes) {
  if (isTracked(p)) git(["rm", "-r", "-q", "--", p]);
  if (exists(p)) fs.rmSync(abs(p), { recursive: true, force: true });
}

// Remove now-empty old folders.
for (const dir of [`${OLD}/components`, `${OLD}/services`, OLD]) {
  if (exists(dir) && fs.readdirSync(abs(dir)).length === 0) fs.rmdirSync(abs(dir));
}

console.log("\n✔ Done. Next: `npm run build` (or `npm run dev`) to confirm, then commit.");
console.log("  To undo before committing: git reset --hard HEAD");
