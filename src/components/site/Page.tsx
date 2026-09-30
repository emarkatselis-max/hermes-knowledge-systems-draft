import type { ReactNode } from "react";
import { Contours } from "./Contours";

export function PageHeader({
  eyebrow,
  title,
  lead,
}: {
  eyebrow: string;
  title: string;
  lead?: string;
}) {
  return (
    <section className="relative overflow-hidden border-b border-border">
      <Contours className="absolute inset-0 h-full w-full text-accent/25" />
      <div className="relative mx-auto max-w-6xl px-5 py-16 md:py-24">
        <p className="text-[0.7rem] tracking-[0.3em] text-accent">{eyebrow}</p>
        <h1 className="mt-5 max-w-3xl font-serif text-4xl leading-tight text-foreground md:text-5xl">
          {title}
        </h1>
        {lead && (
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground">{lead}</p>
        )}
      </div>
    </section>
  );
}

export function Section({
  title,
  children,
  className = "",
}: {
  title?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`mx-auto max-w-6xl px-5 py-14 md:py-20 ${className}`}>
      {title && (
        <h2 className="mb-8 font-serif text-2xl text-foreground md:text-3xl">{title}</h2>
      )}
      {children}
    </section>
  );
}

export function Note({ children }: { children: ReactNode }) {
  return (
    <p className="rounded-sm border-l-2 border-accent bg-secondary px-5 py-4 text-sm leading-relaxed text-muted-foreground">
      {children}
    </p>
  );
}
