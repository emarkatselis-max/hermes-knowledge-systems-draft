import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

export const maintainerStatus = createServerFn({ method: "GET" }).handler(async () => {
  const { isMaintainer, passwordConfigured } = await import("./maintainer-auth.server");
  return { configured: passwordConfigured(), signedIn: isMaintainer() };
});

export const maintainerLogin = createServerFn({ method: "POST" })
  .inputValidator((data) => z.object({ password: z.string().min(1).max(200) }).parse(data))
  .handler(async ({ data }) => {
    const { checkPassword, passwordConfigured, startSession } = await import("./maintainer-auth.server");
    if (!passwordConfigured()) return { ok: false as const, error: "Ο κωδικός συντηρητών δεν έχει οριστεί." };
    if (!checkPassword(data.password)) {
      await new Promise((r) => setTimeout(r, 800));
      return { ok: false as const, error: "Λάθος κωδικός." };
    }
    startSession();
    return { ok: true as const };
  });

export const maintainerLogout = createServerFn({ method: "POST" }).handler(async () => {
  const { endSession } = await import("./maintainer-auth.server");
  endSession();
  return { ok: true as const };
});

export const analyzeReadmeBadges = createServerFn({ method: "POST" })
  .inputValidator((data) => z.object({ readme: z.string().min(1).max(60000) }).parse(data))
  .handler(async ({ data }) => {
    const { isMaintainer } = await import("./maintainer-auth.server");
    if (!isMaintainer()) return { ok: false as const, error: "Απαιτείται σύνδεση συντηρητή." };
    const { analyzeReadme, GatewayError } = await import("./badge-ai.server");
    const apiKey = process.env["LOVABLE_API_KEY"];
    if (!apiKey) return { ok: false as const, error: "Η υπηρεσία AI δεν έχει ρυθμιστεί." };
    try {
      return { ok: true as const, analysis: await analyzeReadme(data.readme, apiKey) };
    } catch (e) {
      const message = e instanceof GatewayError ? e.message : "Απρόσμενο σφάλμα ανάλυσης.";
      return { ok: false as const, error: message };
    }
  });
