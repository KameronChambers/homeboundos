import { createFileRoute, ClientOnly } from "@tanstack/react-router";
import { lazy, Suspense, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { BookOpen, Building2, Check, HeartPulse, Home, Languages, Loader2, Plus, ShieldCheck, Truck, Video, Wind } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetTrigger } from "@/components/ui/sheet";
import { hasTranslation, localize, usePortalLanguage, type Lang } from "@/lib/portal-language";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useCare, useNow } from "@/lib/care-store";
import { NEMT_HCPCS, PATIENT, SERVICES, STAGES, UNIT, trackerState, liftCosts, type Mobility, type ServiceType } from "@/lib/care-data";
import { translateTexts } from "@/lib/ai.functions";

const DetroitMap = lazy(() => import("@/components/DetroitMap"));

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Patient Hub — HomeBound OS Detroit" },
      { name: "description", content: "Request in-home care or medical transport, track your provider live, and keep one shared health record." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:title", content: "Patient Hub — HomeBound OS Detroit" },
      { property: "og:description", content: "Request care, track your provider live, and share one health record across your care team." },
    ],
  }),
  component: PatientHub,
});

function Section({ title, children, aside }: { title: string; children: React.ReactNode; aside?: React.ReactNode }) {
  return (
    <section className="rounded-2xl border bg-card p-5 shadow-soft md:p-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-xl font-bold">{title}</h2>
        {aside}
      </div>
      {children}
    </section>
  );
}

function PatientHub() {
  const care = useCare();
  const now = useNow();
  const { lang, setLang } = usePortalLanguage();
  const [translated, setTranslated] = useState<Record<string, string>>({});
  const [translating, setTranslating] = useState(false);
  const t = { request: localize("Request Care", lang), tracker: localize("Live Fulfillment Tracker", lang), passport: localize("Unified Health Passport", lang), cost: localize("Cost Breakdown", lang), care: localize("Care Instructions", lang), submit: localize("Submit Request", lang), addNote: localize("Add Bedside Note", lang), loggedIn: localize("Logged in as", lang) };

  const sourceTexts = useMemo(() => [...PATIENT.careInstructions, ...care.notes.flatMap((n) => [n.text, n.role])], [care.notes]);

  useEffect(() => {
    if (lang === "en") return;
    const missing = sourceTexts.filter((s) => !hasTranslation(s) && !translated[`${lang}:${s}`]);
    if (!missing.length) return;
    setTranslating(true);
    translateTexts({ data: { language: lang, texts: missing } })
      .then((r) => {
        if (r.error) {
          toast.error(r.error);
          return;
        }
        setTranslated((prev) => {
          const n = { ...prev };
          missing.forEach((s, i) => (n[`${lang}:${s}`] = r.texts[i] ?? s));
          return n;
        });
      })
      .catch(() => toast.error(localize("Translation is temporarily unavailable. Please try again.", lang)))
      .finally(() => setTranslating(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang, sourceTexts]);

  const tr = (s: string) => (lang === "en" ? s : translated[`${lang}:${s}`] ?? localize(s, lang));
  const trackerRef = useRef<HTMLDivElement>(null);
  const active = care.tickets.find((x) => x.id === care.activeTicketId);
  const ts = trackerState(care.dispatchedAt, now);
  const statusText = ["Your provider has been assigned.", "Your provider is on the way.", "Your provider has arrived.", "Your care visit is in progress.", "Your care visit is complete."][ts.stage] ?? "Waiting for a provider to claim your request.";

  return (
    <main dir="ltr" lang={lang} className="mx-auto max-w-7xl space-y-6 px-4 py-6">
      <section className="rounded-2xl bg-header-gradient p-6 text-primary-foreground shadow-soft">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">{PATIENT.name}</h1>
            <p className="mt-1 opacity-90">
              {PATIENT.age} • {tr(PATIENT.sex)} • {tr(PATIENT.neighborhood)} {PATIENT.zip}
            </p>
            <span className="mt-3 inline-block rounded-full bg-primary-foreground/15 px-3 py-1 text-sm">
              {t.loggedIn}: {PATIENT.proxy} ({tr("Daughter & Healthcare Proxy")})
            </span>
          </div>
          <div className="flex items-center gap-2 rounded-xl bg-primary-foreground/15 p-1" role="group" aria-label="Language">
            <Languages className="mx-2 h-5 w-5" />
            {(["en", "es", "ar"] as Lang[]).map((l) => (
              <Button variant="outline"
                key={l}
                onClick={() => setLang(l)}
                className={`rounded-lg px-3 py-2 text-sm font-bold ${lang === l ? "bg-primary-foreground text-primary" : ""}`}
              >
                {l === "en" ? "English" : l === "es" ? "Español" : "العربية"}
              </Button>
            ))}
          </div>
        </div>
        <div className="mt-5 grid gap-3 sm:grid-cols-4">
          <Vital icon={<HeartPulse className="h-5 w-5" />} label={tr("Blood pressure")} value={PATIENT.vitals.bp} />
          <Vital icon={<Wind className="h-5 w-5" />} label={tr("SpO₂ (pulse oximetry)")} value={PATIENT.vitals.spo2} />
          <Vital icon={<HeartPulse className="h-5 w-5" />} label={tr("Heart rate")} value={PATIENT.vitals.hr} />
          <div className="rounded-xl bg-critical px-4 py-3 text-primary-foreground sm:col-span-1">
            <div className="text-xs font-bold uppercase opacity-90">{tr("Mobility precaution")}</div>
            <div className="text-sm font-bold">{tr(PATIENT.mobility)}</div>
          </div>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-5">
        <div className="space-y-6 lg:col-span-3">
          <RequestCare title={t.request} submitLabel={t.submit} onView={() => trackerRef.current?.scrollIntoView({ behavior: "smooth" })} />

          <div ref={trackerRef}>
            <Section title={t.tracker} aside={active && <span className="rounded-md bg-muted px-2 py-1 font-mono text-xs text-muted-foreground">#{active.id}</span>}>
              {ts.stage < 0 ? (
                <p className="text-muted-foreground">
                  {active ? `#${active.id} — ${tr("Waiting for a provider to claim your request.")}` : tr("No active request yet.")}
                </p>
              ) : (
                <div className="space-y-5">
                  <ol className="grid grid-cols-5 gap-2">
                    {STAGES.map((s, i) => (
                      <li key={s} className="space-y-2 text-center">
                        <div className={`h-2 rounded-full ${i <= ts.stage ? "bg-primary" : "bg-muted"}`} />
                        <div className={`text-xs font-bold md:text-sm ${i <= ts.stage ? "text-foreground" : "text-muted-foreground"}`}>
                          {tr(s)}
                          {i === 1 && ts.stage === 1 && <div className="text-primary">{tr("ETA")} {ts.etaMin} {tr("min")}</div>}
                        </div>
                      </li>
                    ))}
                  </ol>
                  <div className="flex flex-wrap items-center gap-4 rounded-xl border bg-muted/50 p-4">
                    <div className="grid h-14 w-14 place-items-center rounded-full bg-primary text-xl font-bold text-primary-foreground">DC</div>
                    <div className="flex-1">
                      <div className="font-bold">
                        {UNIT.name} • {tr(UNIT.id)}
                      </div>
                      <div className="text-sm text-muted-foreground">{tr(UNIT.role)}</div>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {UNIT.badges.map((b) => (
                          <span key={b} className="inline-flex items-center gap-1 rounded-full bg-success-soft px-2 py-1 text-xs font-bold text-success">
                            <ShieldCheck className="h-3 w-3" /> {tr(b)}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      <Truck className="mb-1 h-4 w-4" />
                      {tr(UNIT.vehicle)}
                      <div className="font-mono">{UNIT.plate}</div>
                    </div>
                  </div>
                </div>
              )}
              <div className="mt-5 space-y-3">
                <div className="space-y-2" aria-live="polite">
                  <div className="flex flex-wrap justify-between gap-2 text-sm font-bold">
                    <span>{tr(statusText)}</span>
                    <span className="text-muted-foreground">{tr("Demo progress")}</span>
                  </div>
                  <Progress value={ts.stage < 0 ? 0 : (ts.stage + 1) * 20} aria-label={t.tracker} />
                </div>
                <ClientOnly fallback={<div className="h-72 rounded-xl bg-muted" />}>
                  <Suspense fallback={<div className="h-72 rounded-xl bg-muted" />}>
                    <DetroitMap progress={ts.progress} homeLabel={tr("Home • Morningside (48224)")} destinationLabel={tr("Destination: Henry Ford Hospital • 2799 W Grand Blvd, Detroit, MI 48202")} mapLabel={tr("Map of Detroit transport route")} />
                  </Suspense>
                </ClientOnly>
              </div>
            </Section>
          </div>
        </div>

        <div className="space-y-6 lg:col-span-2">
          <Section title={t.care} aside={translating && <Loader2 className="h-4 w-4 animate-spin" />}>
            <ul className="space-y-2">
              {PATIENT.careInstructions.map((c) => (
                <li key={c} className="flex gap-2 text-base">
                  <Check className="mt-1 h-4 w-4 shrink-0 text-primary" /> {tr(c)}
                </li>
              ))}
            </ul>
          </Section>
          <Passport title={t.passport} addLabel={t.addNote} tr={tr} />
          <Costs title={t.cost} />
        </div>
      </div>
    </main>
  );
}

function Vital({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-xl bg-primary-foreground/15 px-4 py-3">
      <div className="flex items-center gap-2 text-xs font-bold uppercase opacity-90">
        {icon} {label}
      </div>
      <div className="text-2xl font-bold">{value}</div>
    </div>
  );
}

function RequestCare({ title, submitLabel, onView }: { title: string; submitLabel: string; onView: () => void }) {
  const { addTicket } = useCare();
  const { tr } = usePortalLanguage();
  const [mode, setMode] = useState<"Home" | "Office" | "Virtual">("Home");
  const [service, setService] = useState<ServiceType>("Registered Nurse (RN)");
  const [urgency, setUrgency] = useState<"Immediate" | "Scheduled">("Immediate");
  const [when, setWhen] = useState("");
  const [note, setNote] = useState("");
  const [transport, setTransport] = useState(true);
  const [mobility, setMobility] = useState<Mobility>("Stretcher");
  const [insId, setInsId] = useState("");
  const [phase, setPhase] = useState<"idle" | "routing" | "done">("idle");

  const submit = () => {
    if (urgency === "Scheduled" && !when) {
      toast.error(tr("Choose a date and time."));
      return;
    }
    setPhase("routing");
    setTimeout(() => {
      const isOffice = mode === "Office";
      addTicket({
        patient: PATIENT.name,
        age: PATIENT.age,
        zip: PATIENT.zip,
        service: isOffice && transport ? "NEMT Transport" : service,
        mode,
        urgency,
        scheduledAt: when ? new Date(when).toLocaleString() : undefined,
        note:
          (note || `${PATIENT.mobility}.`) +
          (isOffice ? ` Office visit: ${service}. ${transport ? `Transport needed (${mobility}).` : "No transport needed."}${insId ? ` Coverage ID on file.` : ""}` : ""),
        mobility: isOffice ? mobility : "Stretcher",
      });
      setPhase("done");
    }, 1600);
  };

  const modes = [
    { k: "Home" as const, icon: Home, label: "Home visit" },
    { k: "Office" as const, icon: Building2, label: "Office visit" },
    { k: "Virtual" as const, icon: Video, label: "Telehealth" },
  ];
  const field = "w-full rounded-xl border bg-background px-4 py-3 text-base";

  return (
    <Section title={title}>
      <div className="grid grid-cols-3 gap-3">
        {modes.map((m) => (
          <Button variant="outline"
            key={m.k}
            onClick={() => setMode(m.k)}
            className={`h-auto min-h-24 min-w-0 flex-col items-center gap-2 whitespace-normal rounded-xl border-2 px-2 py-4 text-base font-bold transition ${mode === m.k ? "border-primary bg-secondary" : "border-border hover:bg-muted"}`}
          >
            <m.icon className="h-7 w-7" /> {tr(m.label)}
          </Button>
        ))}
      </div>
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <label className="space-y-1">
          <span className="text-sm font-bold">{tr("Service")}</span>
          <select className={field} value={service} onChange={(e) => setService(e.target.value as ServiceType)}>
            {SERVICES.map((s) => (
              <option key={s} value={s}>{tr(s)}</option>
            ))}
          </select>
        </label>
        <div className="space-y-1">
          <span className="text-sm font-bold">{tr("Timing")}</span>
          <div className="grid grid-cols-2 gap-2">
            {(["Immediate", "Scheduled"] as const).map((u) => (
              <Button variant="outline" key={u} onClick={() => setUrgency(u)} className={`h-auto min-h-12 whitespace-normal rounded-xl border-2 px-3 py-3 font-bold ${urgency === u ? "border-primary bg-secondary" : ""}`}>
                {tr(u === "Immediate" ? "As soon as possible" : "Schedule")}
              </Button>
            ))}
          </div>
        </div>
        {urgency === "Scheduled" && (
          <label className="space-y-1 md:col-span-2">
            <span className="text-sm font-bold">{tr("Date & time")}</span>
            <input type="datetime-local" className={field} value={when} onChange={(e) => setWhen(e.target.value)} />
          </label>
        )}
        {mode === "Office" ? (
          <>
            <label className="flex items-center justify-between rounded-xl border px-4 py-3 md:col-span-2">
              <span className="font-bold">{tr("Non-emergency medical transportation (NEMT) needed")}</span>
              <Switch checked={transport} onCheckedChange={setTransport} />
            </label>
            {transport && (
              <div className="space-y-1 md:col-span-2">
                <span className="text-sm font-bold">{tr("Mobility level")}</span>
                <div className="grid grid-cols-3 gap-2">
                  {(["Ambulatory", "Wheelchair", "Stretcher"] as Mobility[]).map((m) => (
                    <Button variant="outline" key={m} onClick={() => setMobility(m)} className={`h-auto min-h-12 min-w-0 whitespace-normal rounded-xl border-2 px-2 py-3 font-bold ${mobility === m ? "border-primary bg-secondary" : ""}`}>
                      {tr(m)}
                    </Button>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">
                  {tr("Billed as HCPCS")} {NEMT_HCPCS[mobility].code} — {tr(NEMT_HCPCS[mobility].label)}
                </p>
              </div>
            )}
            <label className="space-y-1 md:col-span-2">
              <span className="text-sm font-bold">{tr("Medicaid ID or Medicare Beneficiary Identifier (MBI)")}</span>
              <input className={field} placeholder={tr("e.g. 1EG4-TE5-MK73 (sample MBI format)")} value={insId} onChange={(e) => setInsId(e.target.value)} />
            </label>
          </>
        ) : (
          <label className="space-y-1 md:col-span-2">
            <span className="text-sm font-bold">{tr("Notes for the care team")}</span>
            <Textarea rows={3} className="text-base" placeholder={tr("Symptoms, access instructions, equipment in the home…")} value={note} onChange={(e) => setNote(e.target.value)} />
          </label>
        )}
      </div>
      <div className="mt-5 flex flex-wrap items-center gap-3">
        <Button size="lg" className="h-12 px-6 text-base" onClick={submit} disabled={phase === "routing"}>
          {phase === "routing" ? <Loader2 className="h-5 w-5 animate-spin" /> : null}
          {submitLabel}
        </Button>
        {phase === "routing" && <span className="text-muted-foreground">{tr("Routing request to Detroit Regional Dispatch Queue…")}</span>}
        {phase === "done" && (
          <Button variant="outline" size="lg" className="h-12" onClick={onView}>
            {tr("View in Live Tracker →")}
          </Button>
        )}
      </div>
    </Section>
  );
}

function Passport({ title, addLabel, tr }: { title: string; addLabel: string; tr: (s: string) => string }) {
  const { notes, addNote } = useCare();
  const { lang } = usePortalLanguage();
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const sorted = [...notes].sort((a, b) => b.at - a.at);
  return (
    <Sheet>
      <SheetTrigger asChild><Button variant="outline" size="lg" className="h-auto min-h-12 w-full justify-start whitespace-normal text-start"><BookOpen className="h-5 w-5 shrink-0" />{title}</Button></SheetTrigger>
      <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-lg" dir="ltr" lang={lang}>
        <SheetHeader className="mb-5 pr-6"><SheetTitle>{title}</SheetTitle><SheetDescription>{tr("Longitudinal record • SMART on FHIR (demo)")}</SheetDescription></SheetHeader>
      <ol className="space-y-3 border-s-2 ps-4">
        {sorted.map((n) => (
          <li key={n.id}>
            <div className="text-xs text-muted-foreground">
              {new Date(n.at).toLocaleDateString(lang)} • {tr(n.role)}
            </div>
            <div className="font-bold">{n.author}</div>
            <p className="text-base">{tr(n.text)}</p>
          </li>
        ))}
      </ol>
      <Button variant="outline" className="mt-4 h-11 w-full" onClick={() => setOpen(true)}>
        <Plus className="h-4 w-4" /> {addLabel}
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent lang={lang} dir="ltr">
          <DialogHeader>
            <DialogTitle>{tr("Bedside note")}</DialogTitle>
          </DialogHeader>
          <Textarea rows={4} value={text} onChange={(e) => setText(e.target.value)} placeholder={tr("e.g. Ate half of lunch, no cough during meal. Repositioned at 2 PM.")} />
          <DialogFooter>
            <Button
              onClick={() => {
                if (!text.trim()) return;
                addNote({ author: PATIENT.proxy, role: "Family caregiver (proxy)", text: text.trim() });
                setText("");
                setOpen(false);
                toast.success(tr("Note added to the health passport"));
              }}
            >
              {tr("Save note")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      </SheetContent>
    </Sheet>
  );
}

function Costs({ title }: { title: string }) {
  const { tr } = usePortalLanguage();
  const [voucher, setVoucher] = useState(false);
  const costs = liftCosts(voucher);
  const money = (amount: number) => `$${amount.toFixed(2)}`;
  const lines = [
    { label: "Medicare home health services (Part A/B) — $0 copay for eligible homebound patients", amt: "$0.00" },
    { label: "Michigan Medicaid NEMT benefit — HCPCS T2005 (stretcher van)", amt: "$0.00" },
    { label: "Mechanical patient lift — HCPCS E0630 (demo charge)", amt: money(costs.lift) },
  ];
  return (
    <Section title={title}>
      <ul className="divide-y">
        {lines.map((l) => (
          <li key={tr(l.label)} className="flex justify-between gap-4 py-2 text-sm">
            <span>{tr(l.label)}</span>
            <span className="font-mono font-bold">{l.amt}</span>
          </li>
        ))}
        {voucher && (
          <li className="flex justify-between gap-4 py-2 text-sm text-success">
            <span>{tr("Community voucher applied (demo program)")}</span>
            <span className="font-mono font-bold">−{money(costs.voucher)}</span>
          </li>
        )}
      </ul>
      <label className="mt-3 flex items-center justify-between rounded-xl bg-muted px-4 py-3">
        <span className="text-sm font-bold">{tr("Community voucher / local grant (demo)")}</span>
        <Switch checked={voucher} onCheckedChange={setVoucher} />
      </label>
      <div className="mt-3 flex justify-between text-lg font-bold">
        <span>{tr("Your estimated cost")}</span>
        <span className="font-mono">{money(costs.total)}</span>
      </div>
      <p className="mt-2 text-xs text-muted-foreground">{tr("Estimate only. Actual coverage depends on eligibility and prior authorization.")}</p>
    </Section>
  );
}
