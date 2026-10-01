// Δοκιμές για το workflow CI και το badge κατάστασης του README.
// Εκτέλεση: node tests/workflow-badge.test.mjs
import { accessSync, constants, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const WORKFLOW_PATH = ".github/workflows/hermes_ci_matrix_workflow.yml";
const WORKFLOW_FILE = "hermes_ci_matrix_workflow.yml";

// Επαναχρησιμοποιήσιμες συναρτήσεις ανάγνωσης/εξαγωγής στοιχείων badge.
function fileExists(relPath) {
  try {
    accessSync(join(root, relPath), constants.R_OK);
    return true;
  } catch {
    return false;
  }
}
function readFileOrEmpty(relPath) {
  try {
    return readFileSync(join(root, relPath), "utf8");
  } catch {
    return "";
  }
}
function badgeImageUrl() {
  return readme.match(/https:\/\/github\.com\/[^)\s]+\/badge\.svg/)?.[0] ?? "";
}
function badgeLinkUrl() {
  return readme.match(/\]\((https:\/\/github\.com\/[^)]+\/actions\/workflows\/[^)]+)\)/)?.[1] ?? "";
}
function badgeIndex() {
  return readme.indexOf("badge.svg");
}
function firstHeadingIndex() {
  return readme.search(/^# /m);
}
function hasWorkflowTrigger(trigger) {
  return new RegExp(`^ {2}${trigger}:`, "m").test(workflow);
}
function hasPlaceholderIn(text) {
  return /OWNER\/REPO/.test(text);
}
function hasPlaceholderComment() {
  return /<!--[^>]*OWNER\/REPO[^>]*-->/.test(readme);
}
function mentionsTemporaryPlaceholderNote() {
  return hasPlaceholderIn(readme) && /προσωριν[οό]/i.test(readme);
}
function mentionsReplacementWithRealPath() {
  return /αντικαταστ/.test(readme) && /(πραγματικ[οό]|μονοπάτι αποθετηρίου)/.test(readme);
}

const workflow = readFileOrEmpty(WORKFLOW_PATH);
const readme = readFileOrEmpty("README.md");

let failures = 0;
const registered = [];
function check(label, ok, hint) {
  registered.push({ label, hint });
  console.log(`${ok ? "PASS" : "FAIL"}  ${label}`);
  if (!ok) {
    failures++;
    if (hint) console.error(`      ↳ Λείπει: ${hint}`);
  }
}

// 1. Το αρχείο του workflow υπάρχει στο .github/workflows.
check(
  `το αρχείο ${WORKFLOW_FILE} υπάρχει στο .github/workflows`,
  fileExists(WORKFLOW_PATH),
  `το αρχείο \`.github/workflows/${WORKFLOW_FILE}\` (δεν βρέθηκε ή δεν είναι αναγνώσιμο)`,
);

// 2. Το workflow διατηρεί ενεργό το workflow_dispatch (χειροκίνητη εκτέλεση).
check(
  "workflow_dispatch είναι ενεργό στο workflow",
  hasWorkflowTrigger("workflow_dispatch"),
  "η γραμμή `workflow_dispatch:` στο triggers του hermes_ci_matrix_workflow.yml",
);

// 3. Το badge δείχνει στο σωστό workflow αρχείο.
check(
  "το badge του README δείχνει στο hermes_ci_matrix_workflow.yml",
  badgeImageUrl().endsWith(`/actions/workflows/${WORKFLOW_FILE}/badge.svg`),
  "το URL του badge `actions/workflows/hermes_ci_matrix_workflow.yml/badge.svg` στο README",
);

// 4. Ο σύνδεσμος του badge οδηγεί στη σελίδα του ίδιου workflow.
check(
  "ο σύνδεσμος του badge οδηγεί στη σελίδα του workflow",
  badgeLinkUrl().endsWith(`/actions/workflows/${WORKFLOW_FILE}`),
  "ο σύνδεσμος `[...](https://github.com/…/actions/workflows/hermes_ci_matrix_workflow.yml)` γύρω από το badge",
);

// 5. Το badge αναφέρεται σε αυτό το workflow (το ίδιο αρχείο, όχι άλλο).
check(
  "το badge του README αναφέρεται στο υπάρχον αρχείο workflow",
  fileExists(WORKFLOW_PATH) && badgeImageUrl().includes(WORKFLOW_FILE) && badgeLinkUrl().includes(WORKFLOW_FILE),
  `το URL εικόνας και ο σύνδεσμος του badge να αναφέρονται στο ${WORKFLOW_FILE}`,
);

// 6. Το badge βρίσκεται στην κορυφή του README (πριν τον πρώτο τίτλο).
check(
  "το badge είναι πριν από τον πρώτο τίτλο του README",
  badgeIndex() > -1 && badgeIndex() < firstHeadingIndex(),
  "η γραμμή του badge πριν από τον πρώτο τίτλο `# …` του README",
);

// 7. Το summary job υπάρχει και ονομάζεται «Cross-Platform Matrix Summary».
check(
  "το job «Cross-Platform Matrix Summary» υπάρχει στο workflow",
  /name: Cross-Platform Matrix Summary/.test(workflow),
  "το job με `name: Cross-Platform Matrix Summary` στο workflow",
);

// 8. Οι οδηγίες του README αναφέρουν το main ως required status check.
check(
  "το README αναφέρει required status check για το main",
  /[Rr]equired status check/.test(readme) && /`main`/.test(readme),
  "η ενότητα οδηγιών με «Required status check» και το `main` στο README",
);

// 9. Οι οδηγίες αναφέρουν το «Cross-Platform Matrix Summary» ως required check.
check(
  "το README αναφέρει το «Cross-Platform Matrix Summary» ως required check",
  /Cross-Platform Matrix Summary/.test(readme),
  "η αναφορά στο «Cross-Platform Matrix Summary» στις οδηγίες του README",
);

// 10. Το README επισημαίνει το OWNER/REPO ως προσωρινό placeholder.
check(
  "το README επισημαίνει το OWNER/REPO ως προσωρινό placeholder",
  mentionsTemporaryPlaceholderNote(),
  "η σημείωση «Σημείωση: Το `OWNER/REPO` στο badge είναι προσωρινό …» κάτω από το badge",
);

// 11. Το README εξηγεί ότι το placeholder πρέπει να αντικατασταθεί με την πραγματική διαδρομή αποθετηρίου.
check(
  "το README εξηγεί την αντικατάσταση του placeholder με την πραγματική διαδρομή",
  mentionsReplacementWithRealPath(),
  "η εξήγηση «πρέπει να αντικατασταθεί με το πραγματικό μονοπάτι αποθετηρίου» στη σημείωση",
);

// 12. Το ίδιο το badge κρατά το OWNER/REPO ως προσωρινό placeholder (εικόνα + σύνδεσμος).
check(
  "το badge κρατά το OWNER/REPO ως placeholder στο URL της εικόνας",
  hasPlaceholderIn(badgeImageUrl()) && badgeImageUrl().includes(`/actions/workflows/${WORKFLOW_FILE}/badge.svg`),
  "το URL εικόνας του badge με `OWNER/REPO` (https://github.com/OWNER/REPO/actions/workflows/…/badge.svg)",
);
check(
  "το badge κρατά το OWNER/REPO ως placeholder στον σύνδεσμό του",
  hasPlaceholderIn(badgeLinkUrl()) && badgeLinkUrl().includes(`/actions/workflows/${WORKFLOW_FILE}`),
  "ο σύνδεσμος του badge με `OWNER/REPO` (https://github.com/OWNER/REPO/actions/workflows/hermes_ci_matrix_workflow.yml)",
);

// 13. Υπάρχει σχόλιο-υπόδειξη στο README για την αντικατάσταση του placeholder.
check(
  "το README έχει σχόλιο-υπόδειξη για αντικατάσταση του OWNER/REPO",
  hasPlaceholderComment(),
  "το σχόλιο `<!-- Αντικαταστήστε OWNER/REPO με το πραγματικό μονοπάτι αποθετηρίου … -->` πάνω από το badge",
);

// 14. Κάθε μήνυμα αποτυχίας κατονομάζει το συγκεκριμένο στοιχείο ή σημείωση που λείπει.
for (const { label, hint } of [...registered]) {
  const hasSpecificHint = typeof hint === "string" && hint.trim().length > 0;
  check(
    `το μήνυμα αποτυχίας της δοκιμής «${label}» κατονομάζει το συγκεκριμένο στοιχείο`,
    hasSpecificHint,
    `μη κενό «Λείπει: …» με το συγκεκριμένο σημείο/σημείωση για τη δοκιμή «${label}»`,
  );
}

if (failures > 0) {
  console.error(`\n${failures} δοκιμή(ές) απέτυχαν — βλ. «Λείπει:» πάνω από κάθε αποτυχία.`);
  process.exit(1);
}
console.log("\nΌλες οι δοκιμές πέρασαν.");
