// Καθαρές συναρτήσεις ανάλυσης badge σε README (κοινές για εφαρμογή και δοκιμές).

/**
 * Αντικαθιστά το περιεχόμενο των fenced code blocks (``` ή ~~~) με κενά ίδιου μήκους,
 * διατηρώντας τις αλλαγές γραμμής, ώστε οι θέσεις χαρακτήρων να μένουν ίδιες.
 * @param {string} text
 * @returns {string}
 */
export function maskFencedCodeBlocks(text) {
  const lines = text.split("\n");
  let fence = null;
  return lines
    .map((line) => {
      const m = line.match(/^ {0,3}(`{3,}|~{3,})/);
      if (!fence && m) {
        fence = m[1];
        return " ".repeat(line.length);
      }
      if (fence) {
        const close = line.match(/^ {0,3}(`{3,}|~{3,})\s*$/);
        if (close && close[1][0] === fence[0] && close[1].length >= fence.length) fence = null;
        return " ".repeat(line.length);
      }
      return line;
    })
    .join("\n");
}

/**
 * Εντοπίζει υποψήφια workflow badge εκτός code blocks.
 * @param {string} text
 * @returns {{ line: number, raw: string, image: string | null, link: string | null, workflow: string | null, wellFormed: boolean }[]}
 */
export function findWorkflowBadges(text) {
  const visible = maskFencedCodeBlocks(text);
  const out = [];
  visible.split("\n").forEach((line, i) => {
    if (!/badge\.svg/.test(line)) return;
    const full = line.match(/\[!\[[^\]]*\]\(([^)\s]+)\)\]\(([^)\s]+)\)/);
    const img = line.match(/https?:\/\/[^\s)\]]*badge\.svg[^\s)\]]*/);
    const wf = (img?.[0] ?? "").match(/actions\/workflows\/([^/]+)\/badge\.svg/);
    out.push({
      line: i + 1,
      raw: text.split("\n")[i].trim(),
      image: full ? full[1] : img ? img[0] : null,
      link: full ? full[2] : null,
      workflow: wf ? wf[1] : null,
      wellFormed: Boolean(full),
    });
  });
  return out;
}
