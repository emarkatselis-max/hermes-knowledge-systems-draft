import { createFileRoute, Link } from "@tanstack/react-router";
import { Contours } from "@/components/site/Contours";
import { Section } from "@/components/site/Page";
import { home, services } from "@/data/site";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "HERMES KNOWLEDGE SYSTEMS — Έρευνα, χαρτογράφηση, εκδόσεις" },
      {
        name: "description",
        content:
          "Έρευνα, χαρτογράφηση, ψηφιακές εφαρμογές και εκδόσεις για τη φυσική και πολιτιστική κληρονομιά.",
      },
      { property: "og:title", content: "HERMES KNOWLEDGE SYSTEMS" },
      {
        property: "og:description",
        content: "Συνδέουμε τη Γη, τη μνήμη και τη γνώση.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <>
      <section className="relative overflow-hidden border-b border-border">
        <Contours className="absolute inset-0 h-full w-full text-accent/25" />
        <div className="relative mx-auto max-w-6xl px-5 py-24 md:py-36">
          <p className="text-[0.7rem] tracking-[0.3em] text-accent">{home.eyebrow}</p>
          <h1 className="mt-6 max-w-4xl font-serif text-4xl leading-[1.15] text-foreground md:text-6xl">
            {home.title}
          </h1>
          <p className="mt-7 max-w-2xl text-lg leading-relaxed text-muted-foreground md:text-xl">
            {home.subtitle}
          </p>
          <div className="mt-10 flex flex-wrap gap-4">
            <Link
              to="/ypiresies"
              className="focus-ring inline-flex items-center rounded-sm bg-primary px-6 py-3 text-sm tracking-wide text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Οι υπηρεσίες μας
            </Link>
            <Link
              to="/epikoinonia"
              className="focus-ring inline-flex items-center rounded-sm border border-foreground/25 px-6 py-3 text-sm tracking-wide text-foreground transition-colors hover:bg-secondary"
            >
              Ας συζητήσουμε το έργο σας
            </Link>
          </div>
        </div>
      </section>

      <Section>
        <div className="max-w-3xl border-l-2 border-accent pl-6">
          <p className="text-lg leading-relaxed text-foreground md:text-xl">{home.intro}</p>
        </div>
      </Section>

      <Section title="Πεδία δραστηριότητας" className="border-t border-border">
        <div className="grid gap-px overflow-hidden rounded-sm border border-border bg-border md:grid-cols-2">
          {services.map((s) => (
            <article key={s.num} className="bg-card p-8">
              <p className="font-serif text-sm tracking-[0.2em] text-accent">{s.num}</p>
              <h3 className="mt-4 font-serif text-xl text-foreground">{s.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{s.summary}</p>
            </article>
          ))}
        </div>
        <p className="mt-8">
          <Link
            to="/ypiresies"
            className="focus-ring text-sm underline underline-offset-4 hover:text-accent"
          >
            Αναλυτικά οι υπηρεσίες
          </Link>
        </p>
      </Section>
    </>
  );
}
