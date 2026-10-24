import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

// Free Gemma model on Google AI Studio (Gemini API).
const GEMMA_MODELS = ["gemma-4-26b-a4b-it", "gemma-4-31b-it"];

async function gemma(prompt: string): Promise<string> {
  let lastErr: unknown;
  // Google's free tier often returns 500/503 under load: try each model twice.
  for (const model of [...GEMMA_MODELS, ...GEMMA_MODELS]) {
    try {
      return await gemmaOnce(model, prompt);
    } catch (e) {
      lastErr = e;
      if (e instanceof Error && /key was rejected/.test(e.message)) break;
    }
  }
  throw lastErr;
}

async function gemmaOnce(model: string, prompt: string): Promise<string> {
  const key = process.env['GEMMA_API_KEY'];
  if (!key) throw new Error("Gemma key is not configured.");
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": key },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: 2048,
          responseMimeType: "application/json",
          thinkingConfig: { thinkingLevel: "minimal" },
        },
      }),
    },
  );
  if (!res.ok) {
    const t = await res.text().catch(() => "");
    console.error("Gemma error", res.status, t);
    if (res.status === 429) throw new Error("Gemma's free limit was reached. Try again in a minute.");
    if (res.status === 400 || res.status === 403) throw new Error("Gemma key was rejected by Google AI Studio.");
    if (res.status >= 500) throw new Error("Gemma is busy on Google's side. Please try again shortly.");
    throw new Error("AI request failed.");
  }
  const json = (await res.json()) as {
    candidates?: { content?: { parts?: { text?: string; thought?: boolean }[] } }[];
  };
  const parts = json.candidates?.[0]?.content?.parts ?? [];
  return parts.filter((p) => !p.thought).map((p) => p.text ?? "").join("");
}

// Gemma has no JSON mode, so pull the first JSON value out of its reply.
function extractJson<T>(text: string, ok: (v: unknown) => boolean): T {
  const cleaned = text.replace(/```(?:json)?/g, "");
  // Gemma may reason before answering; try candidate JSON values from the end.
  for (let i = cleaned.length - 1; i >= 0; i--) {
    const ch = cleaned[i];
    if (ch !== "[" && ch !== "{") continue;
    const end = cleaned.lastIndexOf(ch === "[" ? "]" : "}");
    if (end <= i) continue;
    try {
      const v: unknown = JSON.parse(cleaned.slice(i, end + 1));
      if (ok(v)) return v as T;
    } catch {
      /* keep looking */
    }
  }
  throw new Error("AI returned an unreadable answer.");
}

export type TriageChip = {
  level: "critical" | "caution" | "barrier" | "clinical";
  category: string;
  title: string;
  detail: string;
};

export const runTriage = createServerFn({ method: "POST" })
  .inputValidator((d) =>
    z.object({ note: z.string().min(1).max(4000), mobility: z.string().max(200), service: z.string().max(100) }).parse(d),
  )
  .handler(async ({ data }): Promise<{ chips: TriageChip[]; error?: string }> => {
    const prompt = `You are a clinical dispatch triage assistant for in-home care and non-emergency medical transportation (NEMT) in Detroit, Michigan.
Read the booking note and extract the operational factors a dispatcher must plan for: transfer/mobility risk, required bed or stretcher size, lift or equipment needs (e.g. mechanical patient lift, oxygen), home environment barriers, and clinical precautions.
Rules:
- Use only facts stated in the note. Do not invent diagnoses or numbers.
- Use standard, publicly recognized terminology (e.g. "bariatric", "non-ambulatory", "2-person assist", "mechanical (Hoyer) lift", "fall risk", "aspiration precaution", "supplemental oxygen").
- For bed/stretcher sizing use public reference ranges: standard hospital bed ~36 in wide (about 350–450 lb capacity); bariatric bed 42–54 in wide (600–1000 lb). Only recommend bariatric if weight or size in the note supports it.
- level: "critical" = mobility/transfer risk, "caution" = equipment, "barrier" = home environment, "clinical" = clinical precaution.
- category is one of: "Mobility Warning", "Equipment Alert", "Environmental Barrier", "Clinical Precaution".
- title: short (max 8 words). detail: one concise sentence.
Return 2 to 5 items as ONLY a JSON object: {"chips":[{"level":"...","category":"...","title":"...","detail":"..."}]}

Service: ${data.service}
Mobility tier: ${data.mobility}
Booking note: ${data.note}`;
    try {
      const out = extractJson<{ chips: TriageChip[] } | TriageChip[]>(
        await gemma(prompt),
        (v) => Array.isArray(v) || Array.isArray((v as { chips?: unknown })?.chips),
      );
      const list = Array.isArray(out) ? out : out.chips;
      const cat: Record<TriageChip["level"], string> = {
        critical: "Mobility Warning",
        caution: "Equipment Alert",
        barrier: "Environmental Barrier",
        clinical: "Clinical Precaution",
      };
      return {
        chips: list
          .filter((c) => c && c.level in cat && c.title)
          .map((c) => ({ ...c, category: cat[c.level] }))
          .slice(0, 5),
      };
    } catch (e) {
      return { chips: [], error: e instanceof Error ? e.message : "AI triage failed." };
    }
  });

export const translateTexts = createServerFn({ method: "POST" })
  .inputValidator((d) =>
    z.object({ language: z.enum(["es", "ar"]), texts: z.array(z.string().max(2000)).max(40) }).parse(d),
  )
  .handler(async ({ data }): Promise<{ texts: string[]; error?: string }> => {
    const lang = data.language === "es" ? "Spanish (Latin American)" : "Modern Standard Arabic";
    const prompt = `Translate each string in the JSON array into ${lang} for a patient's family caregiver.
Use compassionate, plain-language wording with correct, commonly used medical terms in ${lang}.
Keep unchanged: people's names, numbers, units (mmHg, lb, in, L/min), dates, and codes or abbreviations (HCPCS, E0630, BP, SpO2, NYHA, RN, PT, MD).
Return ONLY a JSON array of ${data.texts.length} translated strings in the same order.

${JSON.stringify(data.texts)}`;
    try {
      const arr = extractJson<string[]>(
        await gemma(prompt),
        (v) => Array.isArray(v) && v.length === data.texts.length && v[0] !== data.texts[0],
      );
      if (!Array.isArray(arr) || arr.length !== data.texts.length) throw new Error("Translation was incomplete.");
      return { texts: arr.map(String) };
    } catch (e) {
      return { texts: [], error: e instanceof Error ? e.message : "Translation failed." };
    }
  });
