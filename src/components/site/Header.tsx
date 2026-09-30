import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { nav, draftNotice } from "@/data/site";
import { Wordmark } from "./Wordmark";

export function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur">
      <div className="bg-primary text-primary-foreground">
        <p className="mx-auto max-w-6xl px-5 py-1.5 text-center text-[0.7rem] tracking-[0.18em]">
          {draftNotice}
        </p>
      </div>
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-5 py-4">
        <Link to="/" className="rounded-sm focus-ring" aria-label="HERMES KNOWLEDGE SYSTEMS — Αρχική">
          <Wordmark compact />
        </Link>

        <nav aria-label="Κύρια πλοήγηση" className="hidden lg:block">
          <ul className="flex items-center gap-7">
            {nav.map((item) => (
              <li key={item.to}>
                <Link
                  to={item.to}
                  activeOptions={{ exact: item.to === "/" }}
                  activeProps={{ "data-active": "true" }}
                  className="focus-ring nav-link text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls="mobile-nav"
          className="focus-ring inline-flex items-center gap-2 rounded-sm border border-border px-3 py-2 text-sm lg:hidden"
        >
          {open ? <X className="size-4" aria-hidden="true" /> : <Menu className="size-4" aria-hidden="true" />}
          <span>Μενού</span>
        </button>
      </div>

      {open && (
        <nav id="mobile-nav" aria-label="Πλοήγηση κινητού" className="border-t border-border lg:hidden">
          <ul className="mx-auto max-w-6xl px-5 py-2">
            {nav.map((item) => (
              <li key={item.to} className="border-b border-border/60 last:border-0">
                <Link
                  to={item.to}
                  activeOptions={{ exact: item.to === "/" }}
                  activeProps={{ "data-active": "true" }}
                  onClick={() => setOpen(false)}
                  className="focus-ring nav-link block py-3 text-base text-muted-foreground"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </header>
  );
}
