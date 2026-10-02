import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, Section, Note } from "@/components/site/Page";

export const Route = createFileRoute("/aporrito")({
  head: () => ({
    meta: [
      { title: "Ιδιωτικότητα | HERMES KNOWLEDGE SYSTEMS" },
      {
        name: "description",
        content:
          "Πώς ο ιστότοπος της HERMES KNOWLEDGE SYSTEMS αντιμετωπίζει τα δεδομένα των επισκεπτών.",
      },
      { property: "og:title", content: "Ιδιωτικότητα — HERMES KNOWLEDGE SYSTEMS" },
      {
        property: "og:description",
        content:
          "Καμία φόρμα ή εγγραφή· ανώνυμα στατιστικά επισκεψιμότητας μέσω της πλατφόρμας φιλοξενίας.",
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
        title="Ιδιωτικότητα"
        lead="Η σελίδα περιγράφει μόνο όσα ισχύουν σήμερα στον ιστότοπο ως προς τα δεδομένα των επισκεπτών."
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
              Η πλατφόρμα φιλοξενίας συλλέγει ανώνυμα στατιστικά επισκεψιμότητας, τα οποία είναι
              ενεργοποιημένα στο παρόν προσχέδιο. Δεν χρησιμοποιούνται διαφημιστικά cookies ή
              εξωτερικά scripts παρακολούθησης.
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
