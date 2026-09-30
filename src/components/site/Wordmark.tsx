export function Wordmark({ compact = false }: { compact?: boolean }) {
  return (
    <span className="inline-flex flex-col leading-none">
      <span
        className={
          compact
            ? "font-serif text-lg tracking-[0.28em] text-foreground"
            : "font-serif text-2xl tracking-[0.3em] text-foreground"
        }
      >
        HERMES
      </span>
      <span className="mt-1 text-[0.58rem] tracking-[0.34em] text-accent">
        KNOWLEDGE SYSTEMS
      </span>
    </span>
  );
}
