import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader, Section, Note } from "@/components/site/Page";
import { services } from "@/data/site";

export const Route = createFileRoute("/ypiresies")({
  head: () => ({
    meta: [
      { title: "Υπηρεσίες — HERMES KNOWLEDGE SYSTEMS" },
      {
        name: "description",
        content:
          "Έρευνα και τεκμηρίωση, χαρτογράφηση και ψηφιακά συστήματα, εκδόσεις, εκπαίδευση και συμβουλευτική.",
      },
      { property: "og:title", content: "Υπηρεσίες — HERMES KNOWLEDGE SYSTEMS" },
      {
        property: "og:description",
        content: "Τέσσερα πεδία εργασίας: έρευνα, χαρτογράφηση, εκδόσεις, εκπαίδευση.",
      },
    ],
  }),
  component: Ypiresies,
});

function Ypiresies() {
  return (
    <>
      <PageHeader
        eyebrow="ΥΠΗΡΕΣΙΕΣ"
        title="Τέσσερα πεδία εργασίας, μία μεθοδολογία."
        lead="Κάθε υπηρεσία στηρίζεται στην ίδια αρχή: σαφής προέλευση της πληροφορίας και διάκριση δεδομένων από ερμηνείες."
      />

      <Section>
        <div className="divide-y divide-border border-y border-border">
          {services.map((s) => (
            <article key={s.num} className="grid gap-6 py-10 md:grid-cols-[6rem_1fr]">
              <p className="font-serif text-2xl text-accent">{s.num}</p>
              <div>
                <h2 className="font-serif text-2xl text-foreground">{s.title}</h2>
                <p className="mt-3 max-w-2xl leading-relaxed text-muted-foreground">{s.summary}</p>
                <ul className="mt-5 max-w-2xl space-y-2">
                  {s.details.map((d) => (
                    <li
                      key={d}
                      className="relative pl-5 text-sm leading-relaxed text-muted-foreground before:absolute before:left-0 before:top-[0.6em] before:h-px before:w-3 before:bg-accent"
                    >
                      {d}
                    </li>
                  ))}
                </ul>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-12 space-y-6">
          <Note>
            Το περιεχόμενο των υπηρεσιών περιγράφει το αντικείμενο εργασίας της εταιρείας. Δεν
            δηλώνονται αδειοδοτήσεις, πιστοποιήσεις ή δικαιώματα υπογραφής.
          </Note>
          <Link
            to="/epikoinonia"
            className="focus-ring inline-flex items-center rounded-sm bg-primary px-6 py-3 text-sm tracking-wide text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Ας συζητήσουμε το έργο σας
          </Link>
        </div>
      </Section>
    </>
  );
}
