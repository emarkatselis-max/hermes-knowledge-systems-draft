import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, Section, Note } from "@/components/site/Page";

export const Route = createFileRoute("/aporrito")({
  head: () => ({
    meta: [
      { title: "Ιδιωτικότητα — προσχέδιο | HERMES KNOWLEDGE SYSTEMS" },
      {
        name: "description",
        content:
          "Περιγραφή των λειτουργιών της παρούσας δοκιμαστικής έκδοσης ως προς τα δεδομένα των επισκεπτών.",
      },
      { property: "og:title", content: "Ιδιωτικότητα — προσχέδιο" },
      {
        property: "og:description",
        content: "Καμία φόρμα, κανένα analytics στην παρούσα δοκιμαστική έκδοση.",
      },
    ],
  }),
  component: Aporrito,
});

function Aporrito() {
  return (
    <>
      <PageHeader
        eyebrow="ΙΔΙΩΤΙΚΟΤΗΤΑ"
        title="Ιδιωτικότητα — προσχέδιο"
        lead="Η σελίδα περιγράφει μόνο όσα ισχύουν στην παρούσα δοκιμαστική έκδοση. Δεν αποτελεί τελικό κείμενο πολιτικής προστασίας δεδομένων."
      />

      <Section>
        <div className="max-w-2xl space-y-8">
          <div>
            <h2 className="font-serif text-xl text-foreground">Φόρμες και εγγραφές</h2>
            <p className="mt-3 leading-relaxed text-muted-foreground">
              Ο ιστότοπος δεν διαθέτει φόρμα επικοινωνίας, εγγραφή χρηστών ή συλλογή διευθύνσεων
              email. Δεν αποθηκεύονται στοιχεία επισκεπτών από την εφαρμογή.
            </p>
          </div>
          <div>
            <h2 className="font-serif text-xl text-foreground">Στατιστικά και ιχνηλάτες</h2>
            <p className="mt-3 leading-relaxed text-muted-foreground">
              Δεν χρησιμοποιούνται εργαλεία στατιστικής ανάλυσης, διαφημιστικά cookies ή εξωτερικά
              scripts παρακολούθησης.
            </p>
          </div>
          <div>
            <h2 className="font-serif text-xl text-foreground">Σύνδεσμοι email και τηλεφώνου</h2>
            <p className="mt-3 leading-relaxed text-muted-foreground">
              Οι σύνδεσμοι επικοινωνίας ανοίγουν την εφαρμογή ηλεκτρονικού ταχυδρομείου ή τηλεφώνου
              της συσκευής σας. Το περιεχόμενο του μηνύματος δεν περνά από τον ιστότοπο.
            </p>
          </div>
          <div>
            <h2 className="font-serif text-xl text-foreground">Τεχνικά δεδομένα φιλοξενίας</h2>
            <p className="mt-3 leading-relaxed text-muted-foreground">
              Η υποδομή φιλοξενίας ενδέχεται να καταγράφει τεχνικά δεδομένα πρόσβασης. Η ακριβής
              αποτύπωσή τους χρειάζεται τελικό έλεγχο πριν από τη δημοσίευση.
            </p>
          </div>
          <Note>
            Προσχέδιο προς έγκριση. Το τελικό κείμενο ενημέρωσης για την προστασία δεδομένων θα
            συνταχθεί πριν από τη δημόσια δημοσίευση του ιστότοπου.
          </Note>
        </div>
      </Section>
    </>
  );
}
