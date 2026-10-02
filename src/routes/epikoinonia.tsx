import { createFileRoute } from "@tanstack/react-router";
import { Mail, Phone, MapPin } from "lucide-react";
import { PageHeader, Section, Note } from "@/components/site/Page";
import { company } from "@/data/site";

export const Route = createFileRoute("/epikoinonia")({
  head: () => ({
    meta: [
      { title: "Επικοινωνία — HERMES KNOWLEDGE SYSTEMS" },
      {
        name: "description",
        content: "Επικοινωνία με τον Ευάγγελο Μαρκατσέλη μέσω email ή τηλεφώνου. Έδρα: Στυλίδα.",
      },
      { property: "og:title", content: "Επικοινωνία — HERMES KNOWLEDGE SYSTEMS" },
      { property: "og:description", content: "Email, τηλέφωνο και εταιρική έδρα." },
    ],
  }),
  component: Epikoinonia,
});

const mailto = `mailto:${company.email}?subject=${encodeURIComponent(
  "Επικοινωνία — HERMES KNOWLEDGE SYSTEMS",
)}`;

function Epikoinonia() {
  return (
    <>
      <PageHeader
        eyebrow="ΕΠΙΚΟΙΝΩΝΙΑ"
        title="Ας συζητήσουμε το έργο σας."
        lead="Περιγράψτε σύντομα το αντικείμενο και το χρονοδιάγραμμά σας και θα απαντήσουμε με συγκεκριμένες προτάσεις."
      />

      <Section>
        <div className="grid gap-10 md:grid-cols-2">
          <div className="space-y-6">
            <div className="rounded-sm border border-border bg-card p-6">
              <p className="font-serif text-lg text-foreground">Ευάγγελος Μαρκατσέλης</p>
              <p className="mt-1 text-sm text-muted-foreground">Διαχειριστής</p>

              <ul className="mt-6 space-y-4 text-sm">
                <li className="flex items-start gap-3">
                  <Mail className="mt-0.5 size-4 shrink-0 text-accent" aria-hidden="true" />
                  <a
                    href={mailto}
                    className="focus-ring underline underline-offset-4 hover:text-accent"
                  >
                    {company.email}
                  </a>
                </li>
                <li className="flex items-start gap-3">
                  <Phone className="mt-0.5 size-4 shrink-0 text-accent" aria-hidden="true" />
                  <a
                    href={`tel:${company.phoneHref}`}
                    className="focus-ring underline underline-offset-4 hover:text-accent"
                  >
                    {company.phone}
                  </a>
                </li>
                <li className="flex items-start gap-3">
                  <MapPin className="mt-0.5 size-4 shrink-0 text-accent" aria-hidden="true" />
                  <span className="text-muted-foreground">
                    Εταιρική έδρα: {company.address}
                  </span>
                </li>
              </ul>

              <a
                href={mailto}
                className="focus-ring mt-8 inline-flex items-center rounded-sm bg-primary px-6 py-3 text-sm tracking-wide text-primary-foreground transition-colors hover:bg-primary/90"
              >
                Σύνταξη email
              </a>
              <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
                Ο σύνδεσμος ανοίγει την εφαρμογή ηλεκτρονικού ταχυδρομείου της συσκευής σας. Δεν
                αποστέλλεται μήνυμα από τον ιστότοπο.
              </p>
            </div>
          </div>

          <div className="space-y-6">
            <Note>
              Ο ιστότοπος δεν διαθέτει φόρμα επικοινωνίας, εγγραφές ή συλλογή διευθύνσεων email. Η
              επικοινωνία γίνεται απευθείας μέσω email ή τηλεφώνου.
            </Note>
            <Note>
              Τα στοιχεία επικοινωνίας προέρχονται από τη βεβαίωση σύστασης της εταιρείας και έχουν
              επαληθευτεί.
            </Note>
          </div>
        </div>
      </Section>
    </>
  );
}
