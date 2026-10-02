import { Link } from "@tanstack/react-router";
import { company, draftNotice } from "@/data/site";
import { Wordmark } from "./Wordmark";

export function Footer() {
  return (
    <footer className="mt-24 border-t border-border bg-secondary">
      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-14 md:grid-cols-3">
        <div>
          <Wordmark />
          <p className="mt-5 max-w-xs text-sm leading-relaxed text-muted-foreground">
            {company.name}
          </p>
        </div>

        <div className="text-sm leading-relaxed text-muted-foreground">
          <p>Αρ. Γ.Ε.ΜΗ.: {company.gemi}</p>
          <p>ΑΦΜ εταιρείας: {company.vat}</p>
          <p>Έδρα: {company.seat}</p>
          <p className="mt-3">
            <Link to="/etairika-stoixeia" className="focus-ring underline underline-offset-4 hover:text-foreground">
              Εταιρικά στοιχεία
            </Link>
          </p>
        </div>

        <div className="text-sm leading-relaxed text-muted-foreground">
          {draftNotice && <p>{draftNotice}</p>}
          <p className="mt-3">© 2026 {company.short}</p>
          <p className="mt-3">
            <Link to="/aporrito" className="focus-ring underline underline-offset-4 hover:text-foreground">
              Ιδιωτικότητα
            </Link>
          </p>
        </div>
      </div>
    </footer>
  );
}
