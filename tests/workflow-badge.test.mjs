// Δοκιμές για το workflow CI και το badge κατάστασης του README.
// Εκτέλεση: node tests/workflow-badge.test.mjs
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const workflow = readFileSync(join(root, ".github/workflows/hermes_ci_matrix_workflow.yml"), "utf8");
const readme = readFileSync(join(root, "README.md"), "utf8");

let failures = 0;
function check(label, ok) {
  console.log(`${ok ? "PASS" : "FAIL"}  ${label}`);
  if (!ok) failures++;
}

// 1. Το workflow διατηρεί ενεργό το workflow_dispatch (χειροκίνητη εκτέλεση).
check(
  "workflow_dispatch είναι ενεργό στο workflow",
  /^ {2}workflow_dispatch:/m.test(workflow),
);

// 2. Το badge δείχνει στο σωστό workflow αρχείο.
check(
  "το badge του README δείχνει στο hermes_ci_matrix_workflow.yml",
  readme.includes("actions/workflows/hermes_ci_matrix_workflow.yml/badge.svg"),
);

// 3. Ο σύνδεσμος του badge οδηγεί στη σελίδα του ίδιου workflow.
check(
  "ο σύνδεσμος του badge οδηγεί στη σελίδα του workflow",
  /\]\(https:\/\/github\.com\/[^)]+\/actions\/workflows\/hermes_ci_matrix_workflow\.yml\)/.test(readme),
);

// 4. Το badge βρίσκεται στην κορυφή του README (πριν τον πρώτο τίτλο).
check(
  "το badge είναι πριν από τον πρώτο τίτλο του README",
  readme.indexOf("badge.svg") > -1 && readme.indexOf("badge.svg") < readme.indexOf("\n# "),
);

// 5. Το summary job υπάρχει και ονομάζεται «Cross-Platform Matrix Summary».
check(
  "το job «Cross-Platform Matrix Summary» υπάρχει στο workflow",
  /name: Cross-Platform Matrix Summary/.test(workflow),
);

// 6. Οι οδηγίες του README αναφέρουν το main και το Cross-Platform Matrix Summary ως required status check.
check(
  "το README αναφέρει required status check για το main",
  /[Rr]equired status check/.test(readme) && /`main`/.test(readme),
);
check(
  "το README αναφέρει το «Cross-Platform Matrix Summary» ως required check",
  /Cross-Platform Matrix Summary/.test(readme),
);

if (failures > 0) {
  console.error(`\n${failures} δοκιμή(ές) απέτυχαν.`);
  process.exit(1);
}
console.log("\nΌλες οι δοκιμές πέρασαν.");
