import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader, Section, Note } from "@/components/site/Page";
import { company, principles } from "@/data/site";

export const Route = createFileRoute("/etaireia")({
  head: () => ({
    meta: [
      { title: "Η εταιρεία — HERMES KNOWLEDGE SYSTEMS" },
      {
        name: "description",
        content:
          "Μονοπρόσωπη Ι.Κ.Ε. με έδρα τη Στυλίδα, που συστάθηκε στις 26 Αυγούστου 2026.",
      },
      { property: "og:title", content: "Η εταιρεία — HERMES KNOWLEDGE SYSTEMS" },
      {
        property: "og:description",
        content: "Τεκμηρίωση, διεπιστημονική συνεργασία, σαφής διάκριση δεδομένων και ερμηνειών.",
      },
    ],
  }),
  component: Etaireia,
});

function Etaireia() {
  return (
    <>
      <PageHeader
        eyebrow="Η ΕΤΑΙΡΕΙΑ"
        title="Μια νέα εταιρεία γνώσης με έδρα τη Στυλίδα."
        lead="Η HERMES KNOWLEDGE SYSTEMS ΜΟΝΟΠΡΟΣΩΠΗ Ι.Κ.Ε. συστάθηκε στις 26 Αυγούστου 2026 και αποτελεί αυτοτελή νομική οντότητα."
      />

      <Section>
        <div className="grid gap-12 md:grid-cols-[2fr_1fr]">
          <div className="max-w-2xl space-y-5 text-base leading-relaxed text-muted-foreground">
            <p>
              Η εταιρεία δραστηριοποιείται στην έρευνα, στη χαρτογράφηση, στην ανάπτυξη ψηφιακών
              εφαρμογών και στις εκδόσεις, με αντικείμενο τη φυσική και την πολιτιστική κληρονομιά.
            </p>
            <p>
              Ως νεοσύστατη εταιρική οντότητα, παρουσιάζει εδώ το πλαίσιο και τις αρχές εργασίας
              της. Η επιλογή έργων και τίτλων παρουσιάζεται στη σελίδα «Έργα &amp; εκδόσεις».
            </p>
            <p>
              Μοναδικός εταίρος και διαχειριστής είναι ο Ευάγγελος Μαρκατσέλης, σύμφωνα με το
              καταστατικό σύστασης.
            </p>
          </div>
          <aside className="h-fit rounded-sm border border-border bg-card p-6 text-sm leading-relaxed text-muted-foreground">
            <p className="font-serif text-base text-foreground">Ταυτότητα</p>
            <p className="mt-4">Νομική μορφή: {company.legalForm}</p>
            <p className="mt-2">Ημερομηνία σύστασης: {company.founded}</p>
            <p className="mt-2">Έδρα: {company.seat}</p>
            <p className="mt-4">
              <Link
                to="/etairika-stoixeia"
                className="focus-ring underline underline-offset-4 hover:text-foreground"
              >
                Πλήρη εταιρικά στοιχεία
              </Link>
            </p>
          </aside>
        </div>
      </Section>

      <Section title="Κεντρικές αρχές" className="border-t border-border">
        <div className="grid gap-px overflow-hidden rounded-sm border border-border bg-border md:grid-cols-3">
          {principles.map((p) => (
            <article key={p.title} className="bg-card p-8">
              <h3 className="font-serif text-lg text-foreground">{p.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{p.text}</p>
            </article>
          ))}
        </div>
      </Section>

      <Section className="pt-0">
        <Note>
          Η HERMES KNOWLEDGE SYSTEMS ΜΟΝΟΠΡΟΣΩΠΗ Ι.Κ.Ε. είναι διακριτή νομική οντότητα και δεν
          ταυτίζεται με άλλα σχήματα ή φορείς στους οποίους συμμετέχει ο εταίρος της.
        </Note>
      </Section>
    </>
  );
}
