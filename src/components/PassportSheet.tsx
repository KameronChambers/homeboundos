import { useState } from "react";
import { toast } from "sonner";
import { BookOpen, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetTrigger } from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useCare } from "@/lib/care-store";
import { usePortalLanguage } from "@/lib/portal-language";
import { PATIENT } from "@/lib/care-data";

export function Passport({ title, addLabel, tr, compact = false, author = { name: PATIENT.proxy, role: "Family caregiver (proxy)" } }: { title: string; addLabel: string; tr: (s: string) => string; compact?: boolean; author?: { name: string; role: string } }) {
  const { notes, addNote } = useCare();
  const { lang } = usePortalLanguage();
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const sorted = [...notes].sort((a, b) => b.at - a.at);
  return (
    <Sheet>
      <SheetTrigger asChild><Button variant="outline" size={compact ? "sm" : "lg"} className={compact ? "" : "h-auto min-h-12 w-full justify-start whitespace-normal text-start"}><BookOpen className="h-5 w-5 shrink-0" />{title}</Button></SheetTrigger>
      <SheetContent side="right" className="w-full overflow-y-auto p-0 sm:max-w-xl [&>button]:text-primary-foreground" dir="ltr" lang={lang} closeLabel={tr("Close")}>
        <SheetHeader className="flex-row items-center gap-4 space-y-0 bg-header-gradient p-6 pr-12 text-start text-primary-foreground">
          <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-primary"><BookOpen className="h-6 w-6" /></div>
          <div>
            <SheetTitle className="text-xl text-primary-foreground">{title}</SheetTitle>
            <SheetDescription className="text-primary-foreground/80">{tr("Integrated cross-discipline record for")} {PATIENT.name} {tr("(demo)")}</SheetDescription>
          </div>
        </SheetHeader>
        <div className="grid grid-cols-3 gap-3 border-b bg-muted/50 p-4">
          {[
            [tr("Fall risk"), tr("High / Bed-bound"), "text-critical"],
            [tr("Transfer"), tr("2-Person Lift"), "text-foreground"],
            [tr("Next follow-up"), tr("Cardiology"), "text-primary"],
          ].map(([l, v, c]) => (
            <div key={l} className="rounded-xl border bg-card p-3 text-center">
              <div className="text-xs font-bold uppercase text-muted-foreground">{l}</div>
              <div className={`mt-1 text-sm font-bold ${c}`}>{v}</div>
            </div>
          ))}
        </div>
        <div className="p-5">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-bold uppercase tracking-wide text-muted-foreground">{tr("Cross-disciplinary timeline")}</h3>
            <Button variant="link" className="h-auto p-0" onClick={() => setOpen(true)}><Plus className="h-4 w-4" /> {addLabel}</Button>
          </div>
          <ol className="relative space-y-4 before:absolute before:bottom-2 before:left-[9px] before:top-2 before:w-0.5 before:bg-border">
            {sorted.map((n) => (
              <li key={n.id} className="relative ps-8">
                <span className="absolute left-0 top-4 h-5 w-5 rounded-full border-2 border-primary bg-card" />
                <div className="rounded-xl border bg-muted/30 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="rounded-md bg-info-soft px-2 py-0.5 text-xs font-bold text-info">{tr(n.role)}</span>
                    <span className="text-xs text-muted-foreground">{new Date(n.at).toLocaleString(lang, { dateStyle: "medium", timeStyle: "short" })}</span>
                  </div>
                  <div className="mt-2 font-bold">{n.author}</div>
                  <p className="text-base text-muted-foreground">{tr(n.text)}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
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
                addNote({ author: author.name, role: author.role, text: text.trim() });
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
