import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

// Streams a Lovable AI Gateway Responses call and returns the final text.
async function streamResponseText(body: Record<string, unknown>): Promise<string> {
  const key = process.env.LOVABLE_API_KEY;
  if (!key) throw new Error("AI is not configured.");
  const res = await fetch("https://ai.gateway.lovable.dev/v1/responses", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Lovable-API-Key": key,
      "X-Lovable-AIG-SDK": "fetch",
    },
    body: JSON.stringify({ model: "openai/gpt-6-astra", stream: true, store: false, reasoning: { effort: "low" }, ...body }),
  });
  if (!res.ok || !res.body) {
    const t = await res.text().catch(() => "");
    console.error("AI gateway error", res.status, t);
    if (res.status === 429) throw new Error("AI is busy right now. Please try again in a moment.");
    if (res.status === 402) throw new Error("AI credits are used up. Add credits in Settings → Plans & credits.");
    throw new Error("AI request failed.");
  }
  const reader = res.body.getReader();
  const dec = new TextDecoder();
  let buf = "";
  let out = "";
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    buf += dec.decode(value, { stream: true });
    const lines = buf.split("\n");
    buf = lines.pop() ?? "";
    for (const line of lines) {
      if (!line.startsWith("data:")) continue;
      const d = line.slice(5).trim();
      if (!d || d === "[DONE]") continue;
      try {
        const ev = JSON.parse(d);
        if (ev.type === "response.output_text.delta") out += ev.delta;
      } catch {
        /* ignore partial */
      }
    }
  }
  return out;
}

const chipSchema = {
  type: "object",
  additionalProperties: false,
  required: ["chips"],
  properties: {
    chips: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["level", "category", "title", "detail"],
        properties: {
          level: { type: "string", enum: ["critical", "caution", "barrier"] },
          category: { type: "string", enum: ["Mobility Warning", "Equipment Alert", "Environmental Barrier", "Clinical Precaution"] },
          title: { type: "string" },
          detail: { type: "string" },
        },
      },
    },
  },
};

export type TriageChip = {
  level: "critical" | "caution" | "barrier";
  category: string;
  title: string;
  detail: string;
};

export const runTriage = createServerFn({ method: "POST" })
  .inputValidator((d) => z.object({ note: z.string().min(1).max(4000), mobility: z.string().max(200) }).parse(d))
  .handler(async ({ data }): Promise<{ chips: TriageChip[]; error?: string }> => {
    try {
      const text = await streamResponseText({
        instructions:
          "You are a clinical dispatch triage assistant for in-home care and NEMT transport in Detroit. Extract operational precautions from the booking note. Use 'critical' for mobility/transfer risks, 'caution' for equipment/oxygen, 'barrier' for home environment obstacles. Titles are short and punchy (e.g. 'Strict Bed-Bound • 2-Person Hydraulic Lift Mandatory'); details are one concise sentence. Return 2-4 chips. Only use facts from the note.",
        input: `Mobility tier: ${data.mobility}\nBooking note: ${data.note}`,
        text: { format: { type: "json_schema", name: "triage", strict: true, schema: chipSchema } },
      });
      return JSON.parse(text);
    } catch (e) {
      return { chips: [], error: e instanceof Error ? e.message : "AI triage failed." };
    }
  });

export const translateTexts = createServerFn({ method: "POST" })
  .inputValidator((d) =>
    z.object({ language: z.enum(["es", "ar"]), texts: z.array(z.string().max(2000)).max(40) }).parse(d),
  )
  .handler(async ({ data }): Promise<{ texts: string[]; error?: string }> => {
    const lang = data.language === "es" ? "Spanish" : "Arabic (Modern Standard)";
    try {
      const text = await streamResponseText({
        instructions: `Translate each string into ${lang} for a patient's family caregiver. Use culturally appropriate, compassionate, plain-language medical terminology. Keep proper names, numbers, units and codes (e.g. HCPCS, BP, SpO2) unchanged. Return the same number of strings in the same order.`,
        input: JSON.stringify(data.texts),
        text: {
          format: {
            type: "json_schema",
            name: "translations",
            strict: true,
            schema: {
              type: "object",
              additionalProperties: false,
              required: ["texts"],
              properties: { texts: { type: "array", items: { type: "string" } } },
            },
          },
        },
      });
      const parsed = JSON.parse(text) as { texts: string[] };
      return { texts: parsed.texts };
    } catch (e) {
      return { texts: [], error: e instanceof Error ? e.message : "Translation failed." };
    }
  });
