import { Link, useLocation } from "@tanstack/react-router";
import { Activity } from "lucide-react";
import { usePortalLanguage } from "@/lib/portal-language";
import { Passport } from "@/components/PassportSheet";
import { UNIT } from "@/lib/care-data";

export function TopNav() {
  const { tr } = usePortalLanguage();
  const patientPage = useLocation().pathname === "/";
  const text = (value: string) => patientPage ? tr(value) : value;
  const tab =
    "rounded-lg px-4 py-2 text-sm font-bold transition-colors text-muted-foreground hover:bg-muted hover:text-foreground";
  return (
    <header className="sticky top-0 z-20 border-b bg-card/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-4 px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary text-primary-foreground">
            <Activity className="h-5 w-5" />
          </div>
          <div>
            <div className="text-lg font-bold leading-tight">HomeBound OS</div>
            <div className="text-xs text-muted-foreground">{text("Detroit Regional Care & Mobility Grid")}</div>
          </div>
        </div>
        <span className="inline-flex items-center gap-2 rounded-full bg-success-soft px-3 py-1 text-xs font-bold text-success">
          <span className="h-2 w-2 animate-pulse rounded-full bg-success" />
          {text("Active • HL7 FHIR R4 connection (demo)")}
        </span>
        <nav className="ml-auto flex items-center gap-1">
          {!patientPage && <Passport compact title="Unified Health Passport" addLabel="Add Provider Note" tr={(v) => v} author={{ name: UNIT.name, role: `NEMT ${UNIT.id}` }} />}
          <Link to="/" className={tab} activeOptions={{ exact: true }} activeProps={{ className: "bg-secondary text-secondary-foreground" }}>
            {text("Patient Hub")}
          </Link>
          <Link to="/provider" className={tab} activeProps={{ className: "bg-secondary text-secondary-foreground" }}>
            {text("Provider Hub")}
          </Link>
        </nav>
      </div>
    </header>
  );
}
