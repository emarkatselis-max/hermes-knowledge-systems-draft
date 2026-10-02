import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, Section, Note } from "@/components/site/Page";
import { company, sourceNote, draftChecks } from "@/data/site";

export const Route = createFileRoute("/etairika-stoixeia")({
  head: () => ({
    meta: [
      { title: "Εταιρικά στοιχεία — HERMES KNOWLEDGE SYSTEMS" },
      {
        name: "description",
        content:
          "Επωνυμία, νομική μορφή, Γ.Ε.ΜΗ., ΑΦΜ, έδρα και κεφάλαιο βάσει της βεβαίωσης σύστασης της 26.08.2026.",
      },
      { property: "og:title", content: "Εταιρικά στοιχεία — HERMES KNOWLEDGE SYSTEMS" },
      {
        property: "og:description",
        content: "Στοιχεία βάσει της βεβαίωσης και του καταστατικού σύστασης της 26.08.2026.",
      },
    ],
  }),
  component: EtairikaStoixeia,
});

const rows: Array<[string, string]> = [
  ["Επωνυμία", company.name],
  ["Διακριτικός τίτλος", company.short],
  ["Λατινική επωνυμία", company.latin],
  ["Νομική μορφή", company.legalForm],
  ["Αριθμός Γ.Ε.ΜΗ.", company.gemi],
  ["EUID", company.euid],
  ["ΑΦΜ εταιρείας", company.vat],
  ["Δ.Ο.Υ. στη βεβαίωση σύστασης", company.doy],
  ["Αρμόδια υπηρεσία Γ.Ε.ΜΗ.", company.gemiAuthority],
  ["Ημερομηνία σύστασης", company.founded],
  ["Έδρα", company.seat],
  ["Διεύθυνση εταιρικής έδρας", company.address],
  ["Εταιρικό κεφάλαιο", company.capital],
  ["Μερίδια", company.shares],
  ["Εξωκεφαλαιακές εισφορές", company.extraCapital],
  ["Εγγυητικές εισφορές", company.guarantee],
  ["Μοναδικός εταίρος", company.partner],
  ["Διαχειριστής / εκπρόσωπος", company.manager],
];

function EtairikaStoixeia() {
  return (
    <>
      <PageHeader
        eyebrow="ΕΤΑΙΡΙΚΑ ΣΤΟΙΧΕΙΑ"
        title="Στοιχεία εταιρικής ταυτότητας."
        lead={sourceNote}
      />

      <Section>
        <dl className="divide-y divide-border border-y border-border">
          {rows.map(([k, v]) => (
            <div key={k} className="grid gap-1 py-4 md:grid-cols-[18rem_1fr] md:gap-8">
              <dt className="text-sm tracking-wide text-muted-foreground">{k}</dt>
              <dd className="leading-relaxed text-foreground">{v}</dd>
            </div>
          ))}
        </dl>
      </Section>

      <Section title="Σημειώσεις εταιρικής παρουσίασης" className="border-t border-border">
        <ul className="space-y-3">
          {draftChecks.map((c) => (
            <li
              key={c}
              className="relative rounded-sm border-l-2 border-accent bg-secondary px-5 py-4 text-sm leading-relaxed text-muted-foreground"
            >
              {c}
            </li>
          ))}
        </ul>
        <div className="mt-8 space-y-4">
          <Note>
            Χώρος εταιρικών δημοσιεύσεων: δεν έχουν αναρτηθεί έγγραφα στην παρούσα δοκιμαστική
            έκδοση. Δεν διατίθενται αρχεία προς λήψη.
          </Note>
        </div>
      </Section>
    </>
  );
}
