// Δοκιμές για το workflow CI και το badge κατάστασης του README.
// Εκτέλεση: node tests/workflow-badge.test.mjs
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const workflow = readFileSync(join(root, ".github/workflows/hermes_ci_matrix_workflow.yml"), "utf8");
const readme = readFileSync(join(root, "README.md"), "utf8");

let failures = 0;
function check(label, ok, hint) {
  console.log(`${ok ? "PASS" : "FAIL"}  ${label}`);
  if (!ok) {
    failures++;
    if (hint) console.error(`      ↳ Λείπει: ${hint}`);
  }
}

// 1. Το workflow διατηρεί ενεργό το workflow_dispatch (χειροκίνητη εκτέλεση).
check(
  "workflow_dispatch είναι ενεργό στο workflow",
  /^ {2}workflow_dispatch:/m.test(workflow),
  "η γραμμή `workflow_dispatch:` στο triggers του hermes_ci_matrix_workflow.yml",
);

// 2. Το badge δείχνει στο σωστό workflow αρχείο.
check(
  "το badge του README δείχνει στο hermes_ci_matrix_workflow.yml",
  readme.includes("actions/workflows/hermes_ci_matrix_workflow.yml/badge.svg"),
  "το URL του badge `actions/workflows/hermes_ci_matrix_workflow.yml/badge.svg` στο README",
);

// 3. Ο σύνδεσμος του badge οδηγεί στη σελίδα του ίδιου workflow.
check(
  "ο σύνδεσμος του badge οδηγεί στη σελίδα του workflow",
  /\]\(https:\/\/github\.com\/[^)]+\/actions\/workflows\/hermes_ci_matrix_workflow\.yml\)/.test(readme),
  "ο σύνδεσμος `[...](https://github.com/…/actions/workflows/hermes_ci_matrix_workflow.yml)` γύρω από το badge",
);

// 4. Το badge βρίσκεται στην κορυφή του README (πριν τον πρώτο τίτλο).
check(
  "το badge είναι πριν από τον πρώτο τίτλο του README",
  readme.indexOf("badge.svg") > -1 && readme.indexOf("badge.svg") < readme.indexOf("\n# "),
  "η γραμμή του badge πριν από τον πρώτο τίτλο `# …` του README",
);

// 5. Το summary job υπάρχει και ονομάζεται «Cross-Platform Matrix Summary».
check(
  "το job «Cross-Platform Matrix Summary» υπάρχει στο workflow",
  /name: Cross-Platform Matrix Summary/.test(workflow),
  "το job με `name: Cross-Platform Matrix Summary` στο workflow",
);

// 6. Οι οδηγίες του README αναφέρουν το main ως required status check.
check(
  "το README αναφέρει required status check για το main",
  /[Rr]equired status check/.test(readme) && /`main`/.test(readme),
  "η ενότητα οδηγιών με «Required status check» και το `main` στο README",
);

// 7. Οι οδηγίες αναφέρουν το «Cross-Platform Matrix Summary» ως required check.
check(
  "το README αναφέρει το «Cross-Platform Matrix Summary» ως required check",
  /Cross-Platform Matrix Summary/.test(readme),
  "η αναφορά στο «Cross-Platform Matrix Summary» στις οδηγίες του README",
);

// 8. Το README επισημαίνει το OWNER/REPO ως προσωρινό placeholder.
check(
  "το README επισημαίνει το OWNER/REPO ως προσωρινό placeholder",
  /OWNER\/REPO/.test(readme) && /προσωριν[οό]/i.test(readme),
  "η σημείωση «Σημείωση: Το `OWNER/REPO` στο badge είναι προσωρινό …» κάτω από το badge",
);

// 9. Το README εξηγεί ότι το placeholder πρέπει να αντικατασταθεί με την πραγματική διαδρομή αποθετηρίου.
check(
  "το README εξηγεί την αντικατάσταση του placeholder με την πραγματική διαδρομή",
  /αντικαταστ/.test(readme) && /(πραγματικ[οό]|μονοπάτι αποθετηρίου)/.test(readme),
  "η εξήγηση «πρέπει να αντικατασταθεί με το πραγματικό μονοπάτι αποθετηρίου» στη σημείωση",
);

// 10. Το ίδιο το badge κρατά το OWNER/REPO ως προσωρινό placeholder (εικόνα + σύνδεσμος).
check(
  "το badge κρατά το OWNER/REPO ως placeholder στο URL της εικόνας",
  /https:\/\/github\.com\/OWNER\/REPO\/actions\/workflows\/hermes_ci_matrix_workflow\.yml\/badge\.svg/.test(readme),
  "το URL εικόνας του badge με `OWNER/REPO` (https://github.com/OWNER/REPO/actions/workflows/…/badge.svg)",
);
check(
  "το badge κρατά το OWNER/REPO ως placeholder στον σύνδεσμό του",
  /\]\(https:\/\/github\.com\/OWNER\/REPO\/actions\/workflows\/hermes_ci_matrix_workflow\.yml\)/.test(readme),
  "ο σύνδεσμος του badge με `OWNER/REPO` (https://github.com/OWNER/REPO/actions/workflows/hermes_ci_matrix_workflow.yml)",
);

// 11. Υπάρχει σχόλιο-υπόδειξη στο README για την αντικατάσταση του placeholder.
check(
  "το README έχει σχόλιο-υπόδειξη για αντικατάσταση του OWNER/REPO",
  /<!--[^>]*OWNER\/REPO[^>]*-->/.test(readme),
  "το σχόλιο `<!-- Αντικαταστήστε OWNER/REPO με το πραγματικό μονοπάτι αποθετηρίου … -->` πάνω από το badge",
);

if (failures > 0) {
  console.error(`\n${failures} δοκιμή(ές) απέτυχαν — βλ. «Λείπει:» πάνω από κάθε αποτυχία.`);
  process.exit(1);
}
console.log("\nΌλες οι δοκιμές πέρασαν.");
