import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useMemo, useState } from "react";
import { PageHeader, Section, Note } from "@/components/site/Page";
import { analyzeReadmeBadges, maintainerLogin, maintainerLogout, maintainerStatus } from "@/lib/badge-ai.functions";
import { findWorkflowBadges } from "@/lib/readme-badges.js";
import { badgeTool } from "@/data/site";

export const Route = createFileRoute("/ergaleia/elegxos-readme")({
  head: () => ({
    meta: [
      { title: `${badgeTool.title} | HERMES KNOWLEDGE SYSTEMS` },
      { name: "description", content: badgeTool.lead },
      { property: "og:title", content: badgeTool.title },
      { property: "og:description", content: badgeTool.lead },
    ],
  }),
  component: Gate,
});

type Result = Awaited<ReturnType<typeof analyzeReadmeBadges>>;

function Gate() {
  const status = useServerFn(maintainerStatus);
  const login = useServerFn(maintainerLogin);
  const logout = useServerFn(maintainerLogout);
  const [state, setState] = useState<{ configured: boolean; signedIn: boolean } | null>(null);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    status().then(setState).catch(() => setState({ configured: false, signedIn: false }));
  }, [status]);

  async function onLogin(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const r = await login({ data: { password } });
      if (r.ok) {
        setPassword("");
        setState({ configured: true, signedIn: true });
      } else setError(r.error);
    } catch {
      setError("Η σύνδεση απέτυχε.");
    } finally {
      setBusy(false);
    }
  }

  if (state?.signedIn) {
    return (
      <BadgeTool
        onLogout={async () => {
          await logout();
          setState({ configured: true, signedIn: false });
        }}
      />
    );
  }

  return (
    <>
      <PageHeader eyebrow={badgeTool.eyebrow} title={badgeTool.title} lead={badgeTool.loginLead} />
      <Section>
        {state === null ? (
          <p className="text-muted-foreground">{badgeTool.checking}</p>
        ) : !state.configured ? (
          <Note>{badgeTool.notConfigured}</Note>
        ) : (
          <form onSubmit={onLogin} className="max-w-sm space-y-4">
            <label htmlFor="pw" className="block font-serif text-lg text-foreground">
              {badgeTool.passwordLabel}
            </label>
            <input
              id="pw"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="focus-ring w-full rounded-md border border-border bg-card p-3 text-foreground"
            />
            {error && (
              <p role="alert" className="text-sm text-destructive">
                {error}
              </p>
            )}
            <button
              type="submit"
              disabled={busy || !password}
              className="focus-ring rounded-md bg-primary px-5 py-2.5 text-sm text-primary-foreground disabled:opacity-50"
            >
              {busy ? badgeTool.signingIn : badgeTool.signIn}
            </button>
          </form>
        )}
      </Section>
    </>
  );
}

function BadgeTool({ onLogout }: { onLogout: () => void }) {
  const analyze = useServerFn(analyzeReadmeBadges);
  const [readme, setReadme] = useState("");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const local = useMemo(() => findWorkflowBadges(readme), [readme]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!readme.trim() || busy) return;
    setBusy(true);
    setResult(null);
    try {
      setResult(await analyze({ data: { readme } }));
    } catch {
      setResult({ ok: false, error: "Η ανάλυση απέτυχε." });
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <PageHeader eyebrow={badgeTool.eyebrow} title={badgeTool.title} lead={badgeTool.lead} />
      <Section>
        <form onSubmit={onSubmit} className="space-y-4">
          <label htmlFor="readme" className="block font-serif text-lg text-foreground">
            {badgeTool.inputLabel}
          </label>
          <textarea
            id="readme"
            value={readme}
            onChange={(e) => setReadme(e.target.value)}
            rows={14}
            spellCheck={false}
            placeholder={badgeTool.placeholder}
            className="focus-ring w-full rounded-md border border-border bg-card p-4 font-mono text-sm text-foreground"
          />
          <div className="flex flex-wrap items-center gap-4">
            <button
              type="submit"
              disabled={busy || !readme.trim()}
              className="focus-ring rounded-md bg-primary px-5 py-2.5 text-sm text-primary-foreground disabled:opacity-50"
            >
              {busy ? badgeTool.busy : badgeTool.submit}
            </button>
            <p className="text-sm text-muted-foreground" aria-live="polite">
              {badgeTool.localCount(local.length)}
            </p>
            <button type="button" onClick={onLogout} className="focus-ring ml-auto text-sm text-accent underline">
              {badgeTool.signOut}
            </button>
          </div>
        </form>

        {local.length > 0 && (
          <div className="mt-10">
            <h2 className="font-serif text-xl text-foreground">{badgeTool.localTitle}</h2>
            <ul className="mt-4 space-y-2 text-sm">
              {local.map((b) => (
                <li key={b.line} className="rounded-md border border-border p-3">
                  <span className="text-accent">Γραμμή {b.line}</span> ·{" "}
                  {b.workflow ?? "άγνωστο workflow"} ·{" "}
                  {b.wellFormed ? "αναλύσιμη σύνταξη" : "μη αναλύσιμη σύνταξη"}
                  <code className="mt-2 block overflow-x-auto text-xs text-muted-foreground">{b.raw}</code>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div aria-live="polite" className="mt-10">
          {result && !result.ok && (
            <p role="alert" className="rounded-md border border-destructive p-4 text-destructive">
              {result.error}
            </p>
          )}
          {result?.ok && (
            <div>
              <h2 className="font-serif text-xl text-foreground">{badgeTool.aiTitle}</h2>
              {result.analysis.summary && (
                <p className="mt-3 leading-relaxed text-muted-foreground">{result.analysis.summary}</p>
              )}
              {result.analysis.issues.length === 0 ? (
                <p className="mt-4 text-foreground">{badgeTool.noIssues}</p>
              ) : (
                <ol className="mt-4 space-y-4">
                  {result.analysis.issues.map((i, n) => (
                    <li key={n} className="rounded-md border border-border p-4">
                      <p className="text-xs tracking-[0.2em] text-accent">
                        {badgeTool.severity[i.severity]}
                        {i.line ? ` · ΓΡΑΜΜΗ ${i.line}` : ""}
                      </p>
                      <h3 className="mt-1 font-serif text-lg text-foreground">{i.title}</h3>
                      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{i.explanation}</p>
                      {i.suggestion && (
                        <code className="mt-3 block overflow-x-auto whitespace-pre-wrap rounded bg-secondary p-2 text-xs text-foreground">
                          {i.suggestion}
                        </code>
                      )}
                    </li>
                  ))}
                </ol>
              )}
            </div>
          )}
        </div>
        <div className="mt-12">
          <Note>{badgeTool.note}</Note>
        </div>
      </Section>
    </>
  );
}
