import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

export const analyzeReadmeBadges = createServerFn({ method: "POST" })
  .inputValidator((data) => z.object({ readme: z.string().min(1).max(60000) }).parse(data))
  .handler(async ({ data }) => {
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
