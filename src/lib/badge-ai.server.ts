import { createOpenAI } from "@ai-sdk/openai";
import { streamText } from "ai";
import { findWorkflowBadges, type FoundBadge } from "./readme-badges.js";

const GATEWAY = "https://ai.gateway.lovable.dev/v1";
const MODEL = "openai/gpt-6-astra";

export interface BadgeIssue {
  line: number | null;
  severity: "error" | "warning" | "info";
  title: string;
  explanation: string;
  suggestion: string;
}
export interface BadgeAnalysis {
  badges: FoundBadge[];
  summary: string;
  issues: BadgeIssue[];
}

export class GatewayError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

const SYSTEM = `Είσαι ελεγκτής README για συντηρητές έργων GitHub. Εντοπίζεις badge κατάστασης GitHub Actions με αμφίσημη ή κακοσχηματισμένη σύνταξη Markdown (π.χ. ανισόρροπες αγκύλες/παρενθέσεις, εικόνα χωρίς σύνδεσμο, σύνδεσμος σε διαφορετικό workflow από την εικόνα, placeholder OWNER/REPO, λάθος branch, πολλαπλά badge για το ίδιο workflow). Αγνόησε badge μέσα σε fenced code blocks — είναι παραδείγματα, όχι πραγματικά badge. Γράφε στα ελληνικά, σύντομα και συγκεκριμένα. Μην επινοείς προβλήματα.
Απάντησε ΜΟΝΟ με ένα αντικείμενο JSON της μορφής:
{"summary":"μία πρόταση","issues":[{"line":αριθμός ή null,"severity":"error"|"warning"|"info","title":"σύντομος τίτλος","explanation":"τι είναι λάθος ή αμφίσημο","suggestion":"διορθωμένη γραμμή ή οδηγία"}]}
Έως 8 ζητήματα. Αν δεν υπάρχει πρόβλημα, issues = [].`;

function parseJson(text: string): { summary: string; issues: BadgeIssue[] } {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  try {
    const obj = JSON.parse(text.slice(start, end + 1));
    const issues: BadgeIssue[] = Array.isArray(obj.issues)
      ? obj.issues.slice(0, 8).map((i: Record<string, unknown>) => ({
          line: typeof i.line === "number" ? i.line : null,
          severity: i.severity === "error" || i.severity === "info" ? i.severity : "warning",
          title: String(i.title ?? ""),
          explanation: String(i.explanation ?? ""),
          suggestion: String(i.suggestion ?? ""),
        }))
      : [];
    return { summary: String(obj.summary ?? ""), issues };
  } catch {
    return { summary: text.trim().slice(0, 600), issues: [] };
  }
}

export async function analyzeReadme(readme: string, apiKey: string): Promise<BadgeAnalysis> {
  const badges = findWorkflowBadges(readme);
  const numbered = readme
    .split("\n")
    .map((l, i) => `${i + 1}: ${l}`)
    .join("\n");
  const provider = createOpenAI({
    baseURL: GATEWAY,
    apiKey,
    headers: { "Lovable-API-Key": apiKey, "X-Lovable-AIG-SDK": "vercel-ai-sdk" },
  });
  let streamError: unknown = null;
  const result = streamText({
    model: provider.responses(MODEL),
    system: SYSTEM,
    prompt: `Προκαταρκτικός τοπικός εντοπισμός badge (εκτός code blocks):\n${JSON.stringify(badges)}\n\nREADME με αριθμούς γραμμών:\n${numbered}`,
    onError: ({ error }) => {
      streamError = error;
    },
    providerOptions: {
      openai: {
        forceReasoning: true,
        reasoningEffort: "low",
        reasoningSummary: "auto",
        store: false,
        include: ["reasoning.encrypted_content"],
      },
    },
  });
  let text = "";
  try {
    text = await result.text;
  } catch (e) {
    streamError = streamError ?? e;
  }
  if (streamError || !text) {
    const err = streamError as { statusCode?: number; message?: string } | null;
    const status = err?.statusCode ?? 502;
    const msg =
      status === 402
        ? "Δεν επαρκούν οι μονάδες AI του χώρου εργασίας."
        : status === 429
          ? "Πολλές αιτήσεις — δοκιμάστε ξανά σε λίγο."
          : status === 403
            ? "Η πρόσβαση στο μοντέλο δεν επιτρέπεται για αυτόν τον χώρο εργασίας."
            : (err?.message ?? "Το μοντέλο δεν επέστρεψε απάντηση.");
    throw new GatewayError(status, msg);
  }
  return { badges, ...parseJson(text) };
}
