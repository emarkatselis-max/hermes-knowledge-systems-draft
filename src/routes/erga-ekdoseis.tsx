import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader, Section, Note } from "@/components/site/Page";
import { works, worksNote } from "@/data/site";

export const Route = createFileRoute("/erga-ekdoseis")({
  head: () => ({
    meta: [
      { title: "Έργα & εκδόσεις — HERMES KNOWLEDGE SYSTEMS" },
      {
        name: "description",
        content:
          "Οι κατηγορίες υλικού που θα παρουσιαστούν: γεωμυθολογική τεκμηρίωση, χάρτες και ψηφιακοί άτλαντες, βιβλία και εκπαιδευτικές παραγωγές.",
      },
      { property: "og:title", content: "Έργα & εκδόσεις — HERMES KNOWLEDGE SYSTEMS" },
      {
        property: "og:description",
        content: "Η επιλογή έργων και τίτλων για την εταιρική παρουσίαση βρίσκεται υπό επιμέλεια.",
      },
    ],
  }),
  component: ErgaEkdoseis,
});

function ErgaEkdoseis() {
  return (
    <>
      <PageHeader
        eyebrow="ΕΡΓΑ & ΕΚΔΟΣΕΙΣ"
        title="Τι είδους υλικό θα παρουσιαστεί εδώ."
        lead="Η σελίδα περιγράφει τις κατηγορίες του υλικού. Συγκεκριμένοι τίτλοι και παραδοτέα θα προστεθούν μετά την επιμέλεια."
      />

      <Section>
        <Note>{worksNote}</Note>

        <div className="mt-10 grid gap-8 md:grid-cols-3">
          {works.map((w, i) => (
            <article
              key={w.title}
              className="flex flex-col rounded-sm border border-border bg-card p-8"
            >
              <p className="font-serif text-sm tracking-[0.2em] text-accent">
                {String(i + 1).padStart(2, "0")}
              </p>
              <h2 className="mt-4 font-serif text-xl leading-snug text-foreground">{w.title}</h2>
              <p className="mt-4 flex-1 text-sm leading-relaxed text-muted-foreground">{w.text}</p>
              <Link
                to="/epikoinonia"
                className="focus-ring mt-6 text-sm underline underline-offset-4 hover:text-accent"
              >
                Επικοινωνία για το πεδίο αυτό
              </Link>
            </article>
          ))}
        </div>
      </Section>
    </>
  );
}
