// Δοκιμές για το workflow CI και το badge κατάστασης του README.
// Εκτέλεση: node tests/workflow-badge.test.mjs
import { accessSync, constants, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { maskFencedCodeBlocks, findWorkflowBadges } from "../src/lib/readme-badges.js";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const WORKFLOW_PATH = ".github/workflows/hermes_ci_matrix_workflow.yml";
const WORKFLOW_FILE = "hermes_ci_matrix_workflow.yml";
const REPO = "emarkatselis-max/hermes-knowledge-systems-draft";

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
  const m = maskFencedCodeBlocks(text).match(BADGE_MARKDOWN_RE);
  return m ? { image: m[1], link: m[2] } : null;
}
// Σε README με πολλά badge, προτιμάται το URL που αναφέρεται σε αυτό το workflow.
function badgeImageUrls(text) {
  return [...maskFencedCodeBlocks(text).matchAll(/https:\/\/github\.com\/[^)\s]+\/badge\.svg/g)].map((m) => m[0]);
}
function badgeImageUrl(text) {
  const urls = badgeImageUrls(text);
  return urls.find((u) => u.includes(WORKFLOW_FILE)) ?? urls[0] ?? "";
}
function badgeLinkUrls(text) {
  return [...maskFencedCodeBlocks(text).matchAll(/\]\((https:\/\/github\.com\/[^)]+\/actions\/workflows\/[^)]+)\)/g)]
    .map((m) => m[1])
    .filter((u) => !u.includes("badge.svg"));
}
function badgeLinkUrl(text) {
  const urls = badgeLinkUrls(text);
  return urls.find((u) => u.includes(WORKFLOW_FILE)) ?? urls[0] ?? "";
}
function badgeIndex(text) {
  return maskFencedCodeBlocks(text).indexOf("badge.svg");
}
function firstHeadingIndex(text) {
  return maskFencedCodeBlocks(text).search(/^# /m);
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

  // 2α. Η σύνταξη Markdown του badge είναι αναλύσιμη ([![alt](εικόνα)](σύνδεσμος)).
  check(
    "η σύνταξη Markdown του badge είναι αναλύσιμη",
    parseBadge(readmeText) !== null,
    "η γραμμή του badge σε έγκυρη σύνταξη `[![alt](URL εικόνας badge.svg)](σύνδεσμος workflow)` — το στοιχείο badge δεν μπόρεσε να αναλυθεί",
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

  // 10. Το URL εικόνας του badge δείχνει στο πραγματικό αποθετήριο.
  check(
    `το URL εικόνας του badge δείχνει στο αποθετήριο ${REPO}`,
    badgeImageUrl(readmeText) === `https://github.com/${REPO}/actions/workflows/${WORKFLOW_FILE}/badge.svg`,
    `το URL εικόνας \`https://github.com/${REPO}/actions/workflows/${WORKFLOW_FILE}/badge.svg\``,
  );
  // 11. Ο σύνδεσμος του badge δείχνει στο πραγματικό αποθετήριο.
  check(
    `ο σύνδεσμος του badge δείχνει στο αποθετήριο ${REPO}`,
    badgeLinkUrl(readmeText) === `https://github.com/${REPO}/actions/workflows/${WORKFLOW_FILE}`,
    `ο σύνδεσμος \`https://github.com/${REPO}/actions/workflows/${WORKFLOW_FILE}\``,
  );
  // 12. Δεν έχει απομείνει το προσωρινό OWNER/REPO στο README.
  check(
    "το README δεν περιέχει πλέον το προσωρινό OWNER/REPO",
    !hasPlaceholderIn(maskFencedCodeBlocks(readmeText)),
    "αντικατάσταση κάθε `OWNER/REPO` εκτός code blocks με το πραγματικό αποθετήριο",
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

// Στ. README με περισσότερα από ένα badge: οι έλεγχοι εντοπίζουν το σωστό workflow badge.
const SHIELDS_BADGE =
  "[![License: MIT](https://img.shields.io/badge/license-MIT-green.svg)](https://opensource.org/licenses/MIT)\n";
const OTHER_WORKFLOW_BADGE =
  "[![Other CI](https://github.com/someone/other/actions/workflows/other_workflow.yml/badge.svg)](https://github.com/someone/other/actions/workflows/other_workflow.yml)\n";
function positive(label, mutatedReadme) {
  const results = runChecks(mutatedReadme);
  const failed = results.filter((r) => !r.ok);
  check(
    label,
    failed.length === 0,
    failed.length ? `οι έλεγχοι που απέτυχαν άδικα: ${failed.map((f) => f.label).join(", ")}` : "",
  );
}
positive(
  "πολλαπλά badge: εξωτερικό badge (shields.io) πριν από το workflow badge δεν μπερδεύει τους ελέγχους",
  SHIELDS_BADGE + readme,
);
positive(
  "πολλαπλά badge: badge άλλου workflow πριν από το σωστό δεν μπερδεύει τους ελέγχους",
  OTHER_WORKFLOW_BADGE + readme,
);

// Ζ. Κακοσχηματισμένη σύνταξη Markdown στο badge: αποτυχία στον έλεγχο σύνταξης
// με μήνυμα που κατονομάζει το στοιχείο badge που δεν μπόρεσε να αναλυθεί.
const PARSE_CHECK_LABEL = "η σύνταξη Markdown του badge είναι αναλύσιμη";
function breakImageParens(text) {
  // Λείπει το `)]` που κλείνει την εικόνα: [![alt](img](link)
  return text.replace(BADGE_MARKDOWN_RE, (_, img, link) => `[![HERMES CI Matrix](${img}](${link})`);
}
function breakLinkParens(text) {
  // Λείπει η τελική `)` του συνδέσμου: [![alt](img)](link
  return text.replace(BADGE_MARKDOWN_RE, (_, img, link) => `[![HERMES CI Matrix](${img})](${link}`);
}
function assertParseFailure(results) {
  const parse = resultByLabel(results, PARSE_CHECK_LABEL);
  if (!parse || parse.ok) return "ο έλεγχος σύνταξης δεν απέτυχε παρότι η σύνταξη Markdown του badge είναι κακοσχηματισμένη";
  if (!/badge/.test(parse.hint)) return "το μήνυμα αποτυχίας δεν κατονομάζει το στοιχείο badge που δεν αναλύεται";
  if (!/σύνταξη|αναλυθεί/.test(parse.hint)) return "το μήνυμα αποτυχίας δεν εξηγεί ότι η σύνταξη του badge δεν μπόρεσε να αναλυθεί";
  return true;
}
negative(
  "αρνητικό: κακοσχηματισμένη σύνταξη εικόνας badge (λείπει `)]`) αποτυγχάνει με μήνυμα που κατονομάζει το badge",
  breakImageParens(readme),
  ({ results }) => assertParseFailure(results),
);
negative(
  "αρνητικό: κακοσχηματισμένη σύνταξη συνδέσμου badge (λείπει τελική `)`) αποτυγχάνει με μήνυμα που κατονομάζει το badge",
  breakLinkParens(readme),
  ({ results }) => assertParseFailure(results),
);

// Η. Badge μέσα σε fenced code block δεν εκλαμβάνονται ως πραγματικά badge.
const FENCED_WRONG_BADGE =
  "```markdown\n[![Other CI](https://github.com/OWNER/REPO/actions/workflows/other_workflow.yml/badge.svg)](https://github.com/OWNER/REPO/actions/workflows/other_workflow.yml)\n```\n";
const TILDE_FENCED_BADGE =
  "~~~\n[![Example](https://github.com/OWNER/REPO/actions/workflows/example.yml/badge.svg)](https://github.com/OWNER/REPO/actions/workflows/example.yml)\n~~~\n";
positive("fenced code: badge άλλου workflow μέσα σε ``` πριν από το σωστό αγνοείται", FENCED_WRONG_BADGE + readme);
positive("fenced code: badge μέσα σε ~~~ πριν από το σωστό αγνοείται", TILDE_FENCED_BADGE + readme);
{
  const found = findWorkflowBadges(FENCED_WRONG_BADGE + TILDE_FENCED_BADGE);
  check(
    "fenced code: README με badge μόνο μέσα σε code blocks δεν έχει πραγματικό badge",
    found.length === 0 && badgeImageUrl(FENCED_WRONG_BADGE) === "" && parseBadge(FENCED_WRONG_BADGE) === null,
    `κανένα badge εκτός code blocks — βρέθηκαν ${found.length} (το badge μέσα σε fenced code block εκλήφθηκε ως πραγματικό)`,
  );
  const onlyFenced = "```\n" + readme + "\n```\n";
  const parse = resultByLabel(runChecks(onlyFenced), PARSE_CHECK_LABEL);
  check(
    "fenced code: όταν το μόνο badge είναι μέσα σε code block, ο έλεγχος σύνταξης αποτυγχάνει",
    parse && !parse.ok,
    "αποτυχία του ελέγχου σύνταξης όταν το badge υπάρχει μόνο μέσα σε fenced code block",
  );
  const mixed = findWorkflowBadges(FENCED_WRONG_BADGE + readme);
  const real = mixed.find((b) => b.workflow === WORKFLOW_FILE);
  check(
    "fenced code: εντοπίζεται το σωστό workflow badge στο κανονικό περιεχόμενο",
    mixed.length >= 1 && mixed.every((b) => b.workflow !== "other_workflow.yml") && real?.wellFormed === true &&
      real.line > FENCED_WRONG_BADGE.split("\n").length - 1,
    `το badge του ${WORKFLOW_FILE} στο κανονικό περιεχόμενο (εκτός code block), με αναλύσιμη σύνταξη`,
  );
  const masked = maskFencedCodeBlocks(FENCED_WRONG_BADGE + readme);
  check(
    "fenced code: η απόκρυψη code blocks διατηρεί μήκος και γραμμές",
    masked.length === (FENCED_WRONG_BADGE + readme).length &&
      masked.split("\n").length === (FENCED_WRONG_BADGE + readme).split("\n").length,
    "ίδιο μήκος κειμένου και ίδιος αριθμός γραμμών μετά την απόκρυψη των code blocks",
  );
}

if (failures > 0) {
  console.error(`\n${failures} δοκιμή(ές) απέτυχαν — βλ. «Λείπει:» πάνω από κάθε αποτυχία.`);
  process.exit(1);
}
console.log("\nΌλες οι δοκιμές πέρασαν.");
