// Δοκιμές για το workflow CI και το badge κατάστασης του README.
// Εκτέλεση: node tests/workflow-badge.test.mjs
import { accessSync, constants, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const WORKFLOW_PATH = ".github/workflows/hermes_ci_matrix_workflow.yml";
const WORKFLOW_FILE = "hermes_ci_matrix_workflow.yml";

// Επαναχρησιμοποιήσιμες συναρτήσεις ανάγνωσης αρχείων.
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

// Καθαροί εξαγωγείς/ελέγχοι στοιχείων badge — δέχονται το κείμενο ως όρισμα,
// ώστε να επαναχρησιμοποιούνται και σε μεταλλαγμένα (αρνητικά) README.
// Πλήρης δομή badge Markdown: [![alt](URL εικόνας)](URL συνδέσμου).
const BADGE_MARKDOWN_RE =
  /\[!\[[^\]]*\]\((https:\/\/github\.com\/[^\s)]*badge\.svg[^)\s]*)\)\]\((https:\/\/github\.com\/[^)\s]+)\)/;
function parseBadge(text) {
  const m = text.match(BADGE_MARKDOWN_RE);
  return m ? { image: m[1], link: m[2] } : null;
}
// Σε README με πολλά badge, προτιμάται το URL που αναφέρεται σε αυτό το workflow.
function badgeImageUrls(text) {
  return [...text.matchAll(/https:\/\/github\.com\/[^)\s]+\/badge\.svg/g)].map((m) => m[0]);
}
function badgeImageUrl(text) {
  const urls = badgeImageUrls(text);
  return urls.find((u) => u.includes(WORKFLOW_FILE)) ?? urls[0] ?? "";
}
function badgeLinkUrls(text) {
  return [...text.matchAll(/\]\((https:\/\/github\.com\/[^)]+\/actions\/workflows\/[^)]+)\)/g)]
    .map((m) => m[1])
    .filter((u) => !u.includes("badge.svg"));
}
function badgeLinkUrl(text) {
  const urls = badgeLinkUrls(text);
  return urls.find((u) => u.includes(WORKFLOW_FILE)) ?? urls[0] ?? "";
}
function badgeIndex(text) {
  return text.indexOf("badge.svg");
}
function firstHeadingIndex(text) {
  return text.search(/^# /m);
}
function hasWorkflowTrigger(workflow, trigger) {
  return new RegExp(`^ {2}${trigger}:`, "m").test(workflow);
}
function hasPlaceholderIn(text) {
  return /OWNER\/REPO/.test(text);
}
function hasPlaceholderComment(text) {
  return /<!--[^>]*OWNER\/REPO[^>]*-->/.test(text);
}
function mentionsTemporaryPlaceholderNote(text) {
  return hasPlaceholderIn(text) && /προσωριν[οό]/i.test(text);
}
function mentionsReplacementWithRealPath(text) {
  return /αντικαταστ/.test(text) && /(πραγματικ[οό]|μονοπάτι αποθετηρίου)/.test(text);
}

const workflow = readFileOrEmpty(WORKFLOW_PATH);
const readme = readFileOrEmpty("README.md");

// Εκτελεί όλους τους ελέγχους πάνω σε δεδομένο κείμενο README.
// Επιστρέφει λίστα αποτελεσμάτων { label, ok, hint } χωρίς να τυπώνει.
function runChecks(readmeText) {
  const results = [];
  const check = (label, ok, hint) => results.push({ label, ok, hint });

  // 1. Το αρχείο του workflow υπάρχει στο .github/workflows.
  check(
    `το αρχείο ${WORKFLOW_FILE} υπάρχει στο .github/workflows`,
    fileExists(WORKFLOW_PATH),
    `το αρχείο \`.github/workflows/${WORKFLOW_FILE}\` (δεν βρέθηκε ή δεν είναι αναγνώσιμο)`,
  );

  // 2. Το workflow διατηρεί ενεργό το workflow_dispatch (χειροκίνητη εκτέλεση).
  check(
    "workflow_dispatch είναι ενεργό στο workflow",
    hasWorkflowTrigger(workflow, "workflow_dispatch"),
    "η γραμμή `workflow_dispatch:` στο triggers του hermes_ci_matrix_workflow.yml",
  );

  // 3. Το URL εικόνας του badge δείχνει στο σωστό workflow αρχείο.
  check(
    "το URL εικόνας του badge δείχνει στο hermes_ci_matrix_workflow.yml",
    badgeImageUrl(readmeText).endsWith(`/actions/workflows/${WORKFLOW_FILE}/badge.svg`),
    "το URL εικόνας του badge `actions/workflows/hermes_ci_matrix_workflow.yml/badge.svg` στο README",
  );

  // 4. Ο σύνδεσμος του badge οδηγεί στη σελίδα του ίδιου workflow.
  check(
    "ο σύνδεσμος του badge οδηγεί στη σελίδα του workflow",
    badgeLinkUrl(readmeText).endsWith(`/actions/workflows/${WORKFLOW_FILE}`),
    "ο σύνδεσμος `[...](https://github.com/…/actions/workflows/hermes_ci_matrix_workflow.yml)` γύρω από το badge",
  );

  // 5. Το badge αναφέρεται σε αυτό το workflow (το ίδιο αρχείο, όχι άλλο).
  check(
    "το badge του README αναφέρεται στο υπάρχον αρχείο workflow",
    fileExists(WORKFLOW_PATH) &&
      badgeImageUrl(readmeText).includes(WORKFLOW_FILE) &&
      badgeLinkUrl(readmeText).includes(WORKFLOW_FILE),
    `το URL εικόνας και ο σύνδεσμος του badge να αναφέρονται στο ${WORKFLOW_FILE}`,
  );

  // 6. Το badge βρίσκεται στην κορυφή του README (πριν τον πρώτο τίτλο).
  check(
    "το badge είναι πριν από τον πρώτο τίτλο του README",
    badgeIndex(readmeText) > -1 && badgeIndex(readmeText) < firstHeadingIndex(readmeText),
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
    /[Rr]equired status check/.test(readmeText) && /`main`/.test(readmeText),
    "η ενότητα οδηγιών με «Required status check» και το `main` στο README",
  );

  // 9. Οι οδηγίες αναφέρουν το «Cross-Platform Matrix Summary» ως required check.
  check(
    "το README αναφέρει το «Cross-Platform Matrix Summary» ως required check",
    /Cross-Platform Matrix Summary/.test(readmeText),
    "η αναφορά στο «Cross-Platform Matrix Summary» στις οδηγίες του README",
  );

  // 10. Το README επισημαίνει το OWNER/REPO ως προσωρινό placeholder.
  check(
    "το README επισημαίνει το OWNER/REPO ως προσωρινό placeholder",
    mentionsTemporaryPlaceholderNote(readmeText),
    "η σημείωση «Σημείωση: Το `OWNER/REPO` στο badge είναι προσωρινό …» κάτω από το badge",
  );

  // 11. Το README εξηγεί ότι το placeholder πρέπει να αντικατασταθεί με την πραγματική διαδρομή αποθετηρίου.
  check(
    "το README εξηγεί την αντικατάσταση του placeholder με την πραγματική διαδρομή",
    mentionsReplacementWithRealPath(readmeText),
    "η εξήγηση «πρέπει να αντικατασταθεί με το πραγματικό μονοπάτι αποθετηρίου» στη σημείωση",
  );

  // 12. Το ίδιο το badge κρατά το OWNER/REPO ως προσωρινό placeholder (εικόνα + σύνδεσμος).
  check(
    "το badge κρατά το OWNER/REPO ως placeholder στο URL της εικόνας",
    hasPlaceholderIn(badgeImageUrl(readmeText)) &&
      badgeImageUrl(readmeText).includes(`/actions/workflows/${WORKFLOW_FILE}/badge.svg`),
    "το URL εικόνας του badge με `OWNER/REPO` (https://github.com/OWNER/REPO/actions/workflows/…/badge.svg)",
  );
  check(
    "το badge κρατά το OWNER/REPO ως placeholder στον σύνδεσμό του",
    hasPlaceholderIn(badgeLinkUrl(readmeText)) && badgeLinkUrl(readmeText).includes(`/actions/workflows/${WORKFLOW_FILE}`),
    "ο σύνδεσμος του badge με `OWNER/REPO` (https://github.com/OWNER/REPO/actions/workflows/hermes_ci_matrix_workflow.yml)",
  );

  // 13. Υπάρχει σχόλιο-υπόδειξη στο README για την αντικατάσταση του placeholder.
  check(
    "το README έχει σχόλιο-υπόδειξη για αντικατάσταση του OWNER/REPO",
    hasPlaceholderComment(readmeText),
    "το σχόλιο `<!-- Αντικαταστήστε OWNER/REPO με το πραγματικό μονοπάτι αποθετηρίου … -->` πάνω από το badge",
  );

  // 14. Κάθε μήνυμα αποτυχίας κατονομάζει το συγκεκριμένο στοιχείο ή σημείωση που λείπει.
  for (const { label, hint } of [...results]) {
    const hasSpecificHint = typeof hint === "string" && hint.trim().length > 0;
    check(
      `το μήνυμα αποτυχίας της δοκιμής «${label}» κατονομάζει το συγκεκριμένο στοιχείο`,
      hasSpecificHint,
      `μη κενό «Λείπει: …» με το συγκεκριμένο σημείο/σημείωση για τη δοκιμή «${label}»`,
    );
  }

  return results;
}

const IMAGE_CHECK_LABEL = "το URL εικόνας του badge δείχνει στο hermes_ci_matrix_workflow.yml";
const LINK_CHECK_LABEL = "ο σύνδεσμος του badge οδηγεί στη σελίδα του workflow";
function resultByLabel(results, label) {
  return results.find((r) => r.label === label);
}

// Μεταλλαγές README για τα αρνητικά σενάρια.
const BADGE_MARKDOWN_RE =
  /\[!\[[^\]]*\]\((https:\/\/github\.com\/[^\s)]*badge\.svg[^)\s]*)\)\]\((https:\/\/github\.com\/[^)\s]+)\)/;
function stripBadgeImage(text) {
  return text.replace(BADGE_MARKDOWN_RE, (_, img, link) => `[HERMES CI Matrix](${link})`);
}
function stripBadgeLink(text) {
  return text.replace(BADGE_MARKDOWN_RE, (_, img) => `![HERMES CI Matrix](${img})`);
}
function pointImageToOtherWorkflow(text) {
  return text.replace(`workflows/${WORKFLOW_FILE}/badge.svg`, "workflows/other_workflow.yml/badge.svg");
}
function pointLinkToOtherWorkflow(text) {
  return text.replace(`workflows/${WORKFLOW_FILE})`, "workflows/other_workflow.yml)");
}

let failures = 0;
function check(label, ok, hint) {
  console.log(`${ok ? "PASS" : "FAIL"}  ${label}`);
  if (!ok) {
    failures++;
    if (hint) console.error(`      ↳ Λείπει: ${hint}`);
  }
}

// Πραγματικό README: όλοι οι έλεγχοι πρέπει να περνούν.
for (const { label, ok, hint } of runChecks(readme)) {
  check(label, ok, hint);
}

// Αρνητικά σενάρια: μεταλλαγμένο README πρέπει να αποτυγχάνει στο σωστό έλεγχο
// με μήνυμα που κατονομάζει το συγκεκριμένο στοιχείο που λείπει ή είναι λάθος.
const realResults = runChecks(readme);
const realImageHint = resultByLabel(realResults, IMAGE_CHECK_LABEL)?.hint ?? "";
const realLinkHint = resultByLabel(realResults, LINK_CHECK_LABEL)?.hint ?? "";

function negative(label, mutatedReadme, assertions) {
  const results = runChecks(mutatedReadme);
  const image = resultByLabel(results, IMAGE_CHECK_LABEL);
  const link = resultByLabel(results, LINK_CHECK_LABEL);
  const ok = assertions({ results, image, link, imageHint: image?.hint ?? "", linkHint: link?.hint ?? "" });
  check(label, ok === true, typeof ok === "string" ? ok : "η αναμενόμενη συμπεριφορά του ελέγχου στο μεταλλαγμένο README");
}

// Α. Λείπει το URL της εικόνας του badge (μένει μόνο ο σύνδεσμος).
negative(
  "αρνητικό: README χωρίς URL εικόνας badge αποτυγχάνει στον έλεγχο εικόνας, όχι στον έλεγχο συνδέσμου",
  stripBadgeImage(readme),
  ({ image, link, imageHint }) => {
    if (!image || image.ok) return "η δοκιμή εικόνας δεν απέτυχε παρότι λείπει το URL της εικόνας";
    if (!link || !link.ok) return "η δοκιμή συνδέσμου απέτυχε άδικα — ο σύνδεσμος υπάρχει στο README";
    if (!/εικόνας/.test(imageHint)) return "το μήνυμα αποτυχίας δεν κατονομάζει το URL της εικόνας";
    return true;
  },
);

// Β. Λείπει ο σύνδεσμος του badge (μένει μόνο η εικόνα).
negative(
  "αρνητικό: README χωρίς σύνδεσμο badge αποτυγχάνει στον έλεγχο συνδέσμου, όχι στον έλεγχο εικόνας",
  stripBadgeLink(readme),
  ({ image, link, linkHint }) => {
    if (!link || link.ok) return "η δοκιμή συνδέσμου δεν απέτυχε παρότι λείπει ο σύνδεσμος";
    if (!image || !image.ok) return "η δοκιμή εικόνας απέτυχε άδικα — το URL της εικόνας υπάρχει στο README";
    if (!/σύνδεσμο/.test(linkHint)) return "το μήνυμα αποτυχίας δεν κατονομάζει τον σύνδεσμο του badge";
    return true;
  },
);

// Γ. Η εικόνα του badge δείχνει σε διαφορετικό αρχείο workflow.
negative(
  "αρνητικό: εικόνα badge σε άλλο workflow αποτυγχάνει με μήνυμα που αναφέρεται στο URL εικόνας (badge.svg), όχι στον σύνδεσμο",
  pointImageToOtherWorkflow(readme),
  ({ image, link, imageHint }) => {
    if (!image || image.ok) return "η δοκιμή εικόνας δεν απέτυχε παρότι το URL εικόνας δείχνει σε other_workflow.yml";
    if (!link || !link.ok) return "η δοκιμή συνδέσμου απέτυχε άδικα — ο σύνδεσμος δείχνει στο σωστό workflow";
    if (!/badge\.svg/.test(imageHint)) return "το μήνυμα αποτυχίας της εικόνας δεν διακρίνεται από μήνυμα συνδέσμου (λείπει αναφορά σε badge.svg)";
    return true;
  },
);

// Δ. Ο σύνδεσμος του badge δείχνει σε διαφορετικό αρχείο workflow.
negative(
  "αρνητικό: σύνδεσμος badge σε άλλο workflow αποτυγχάνει με μήνυμα που αναφέρεται στον σύνδεσμο, όχι στο URL εικόνας",
  pointLinkToOtherWorkflow(readme),
  ({ image, link, linkHint }) => {
    if (!link || link.ok) return "η δοκιμή συνδέσμου δεν απέτυχε παρότι ο σύνδεσμος δείχνει σε other_workflow.yml";
    if (!image || !image.ok) return "η δοκιμή εικόνας απέτυχε άδικα — το URL εικόνας δείχνει στο σωστό workflow";
    if (/badge\.svg/.test(linkHint)) return "το μήνυμα αποτυχίας του συνδέσμου μπερδεύεται με μήνυμα εικόνας (αναφέρει badge.svg)";
    if (!/σύνδεσμο/.test(linkHint)) return "το μήνυμα αποτυχίας δεν κατονομάζει τον σύνδεσμο του badge";
    return true;
  },
);

// Ε. Τα δύο μηνύματα (λάθος εικόνα vs λάθος σύνδεσμος) είναι διακριτά μεταξύ τους.
check(
  "αρνητικό: τα μηνύματα αποτυχίας για λάθος URL εικόνας και λάθος σύνδεσμο είναι διακριτά",
  realImageHint !== realLinkHint && !realLinkHint.includes("badge.svg") && realImageHint.includes("badge.svg"),
  "διακριτά μηνύματα: το μήνυμα εικόνας αναφέρει badge.svg, το μήνυμα συνδέσμου όχι",
);

if (failures > 0) {
  console.error(`\n${failures} δοκιμή(ές) απέτυχαν — βλ. «Λείπει:» πάνω από κάθε αποτυχία.`);
  process.exit(1);
}
console.log("\nΌλες οι δοκιμές πέρασαν.");
