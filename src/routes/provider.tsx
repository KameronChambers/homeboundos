import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Check, Loader2, RefreshCw, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useCare, useNow } from "@/lib/care-store";
import { UNIT, ZIPS, sortTickets, waitLabel, type SortKey, type Ticket } from "@/lib/care-data";
import { runTriage, type TriageChip } from "@/lib/ai.functions";

export const Route = createFileRoute("/provider")({
  head: () => ({
    meta: [
      { title: "Provider Hub — HomeBound OS Dispatch" },
      { name: "description", content: "Regional dispatch queue for Detroit in-home care and NEMT with AI triage of patient risks and equipment needs." },
      { property: "og:title", content: "Provider Hub — HomeBound OS Dispatch" },
      { property: "og:description", content: "Claim and dispatch Detroit care requests with AI-flagged mobility, equipment and home risks." },
    ],
  }),
  component: ProviderHub,
});

const chipStyle: Record<TriageChip["level"], string> = {
  critical: "bg-critical-soft text-critical border-critical/40",
  caution: "bg-caution-soft text-foreground border-caution/60",
  barrier: "bg-barrier-soft text-barrier border-barrier/40",
  clinical: "bg-info-soft text-info border-info/40",
};

function ProviderHub() {
  const care = useCare();
  const now = useNow(15000);
  const [zip, setZip] = useState("all");
  const [sort, setSort] = useState<SortKey>("longest");

  const list = sortTickets(care.tickets.filter((t) => zip === "all" || t.zip === zip), sort, now || Date.now());
  const field = "rounded-md border bg-background px-2 py-1.5 text-sm";

  return (
    <main className="mx-auto max-w-7xl space-y-4 px-4 py-6 text-sm">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Regional Dispatch Queue</h1>
          <p className="text-muted-foreground">
            {list.filter((t) => t.status === "queued").length} open • {list.filter((t) => t.status === "dispatched").length} dispatched
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <select className={field} value={zip} onChange={(e) => setZip(e.target.value)} aria-label="Filter by ZIP">
            <option value="all">All ZIP codes</option>
            {Object.entries(ZIPS).map(([z, n]) => (
              <option key={z} value={z}>
                {z} {n}
              </option>
            ))}
          </select>
          <select className={field} value={sort} onChange={(e) => setSort(e.target.value as SortKey)} aria-label="Sort">
            <option value="longest">Longest wait</option>
            <option value="shortest">Shortest wait</option>
            <option value="recent">Most recent</option>
            <option value="oldest">Oldest</option>
          </select>
          <Button variant="ghost" size="sm" onClick={care.reset}>
            <RefreshCw className="h-4 w-4" /> Reset demo
          </Button>
        </div>
      </div>
      <div className="space-y-2">
        {list.map((t) => (
          <TicketRow key={t.id} t={t} now={now} />
        ))}
        {care.ready && !list.length && <p className="py-10 text-center text-muted-foreground">No requests for this ZIP code.</p>}
      </div>
      <QuickSync />
    </main>
  );
}

function TicketRow({ t, now }: { t: Ticket; now: number }) {
  const { dispatch } = useCare();
  const [chips, setChips] = useState<TriageChip[] | null>(null);
  const [loading, setLoading] = useState(false);
  const done = t.status === "dispatched";

  const triage = async () => {
    setLoading(true);
    const r = await runTriage({ data: { note: t.note, mobility: t.mobility, service: t.service } });
    setLoading(false);
    if (r.error) {
      toast.error(r.error);
      return;
    }
    setChips(r.chips);
  };

  return (
    <div className="rounded-lg border bg-card p-3 transition-colors hover:bg-muted/60">
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs text-muted-foreground">#{t.id}</span>
        <span className="font-bold">
          {t.patient}, {t.age}
        </span>
        <span className="text-muted-foreground">
          {t.zip} {ZIPS[t.zip]}
        </span>
        <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${t.urgency === "Immediate" ? "bg-critical-soft text-critical" : "bg-info-soft text-info"}`}>
          {t.urgency === "Immediate" ? "Immediate" : `Scheduled • ${t.scheduledAt}`}
        </span>
        <span className="rounded-full bg-secondary px-2 py-0.5 text-xs font-bold text-secondary-foreground">{t.service}</span>
        <span className="rounded-full bg-muted px-2 py-0.5 text-xs">{t.mode}</span>
        {t.mobility !== "Ambulatory" && (
          <span className="rounded-full bg-barrier-soft px-2 py-0.5 text-xs font-bold text-barrier">Mobility: {t.mobility}</span>
        )}
        <span className="ms-auto font-mono text-xs text-muted-foreground">waiting {now ? waitLabel(now - t.createdAt) : "—"}</span>
      </div>
      <p className="mt-2 text-muted-foreground">{t.note}</p>
      {chips && (
        <div className="mt-2 flex flex-wrap gap-2">
          {chips.map((c, i) => (
            <div key={i} className={`max-w-sm rounded-md border px-2 py-1 ${chipStyle[c.level]}`}>
              <div className="text-[11px] font-bold uppercase">{c.category}</div>
              <div className="font-bold">{c.title}</div>
              <div className="text-xs opacity-90">{c.detail}</div>
            </div>
          ))}
          {!chips.length && <span className="text-muted-foreground">No precautions found.</span>}
        </div>
      )}
      <div className="mt-2 flex flex-wrap gap-2">
        <Button size="sm" variant="outline" onClick={triage} disabled={loading}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />} Run AI triage (Gemma)
        </Button>
        <Button
          size="sm"
          disabled={done}
          className={done ? "bg-success text-primary-foreground disabled:opacity-100" : ""}
          onClick={() => {
            dispatch(t.id, UNIT.id);
            toast.success(`Dispatched to NEMT ${UNIT.id} • ETA ${UNIT.etaMin} mins to ${ZIPS[t.zip]?.split(" /")[0] ?? t.zip}`);
          }}
        >
          {done ? (
            <>
              <Check className="h-4 w-4" /> Dispatched to {t.unit} ({UNIT.name})
            </>
          ) : (
            "Claim & Dispatch Unit"
          )}
        </Button>
      </div>
    </div>
  );
}

function QuickSync() {
  const { addNote } = useCare();
  const [text, setText] = useState("");
  return (
    <div className="sticky bottom-0 rounded-lg border bg-card p-3 shadow-soft">
      <div className="mb-2 font-bold">Quick-Sync bedside summary → George Maxwell's chart</div>
      <div className="flex flex-col gap-2 md:flex-row">
        <Textarea
          rows={2}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="e.g. Transferred via mechanical lift with 2 staff, tolerated well. SpO2 96% on 2 L/min nasal cannula during transport."
        />
        <Button
          className="md:self-end"
          onClick={() => {
            if (!text.trim()) return;
            addNote({ author: `${UNIT.name}`, role: `NEMT ${UNIT.id}`, text: text.trim() });
            setText("");
            toast.success("Synced to the Unified Health Passport");
          }}
        >
          Sync to Unified Chart
        </Button>
      </div>
    </div>
  );
}
