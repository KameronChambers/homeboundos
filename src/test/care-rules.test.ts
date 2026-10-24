import { describe, expect, it } from "vitest";
import { NEMT_HCPCS, liftCosts, sortTickets, tripKind, tripState, HOME, HOSPITAL, type Ticket } from "@/lib/care-data";

const mk = (id: string, createdAt: number) => ({ id, createdAt }) as Ticket;

describe("care rules", () => {
  it("uses the CMS HCPCS codes for each transport level", () => {
    expect(NEMT_HCPCS.Wheelchair.code).toBe("A0130");
    expect(NEMT_HCPCS.Stretcher.code).toBe("T2005");
    expect(NEMT_HCPCS.Ambulatory.code).toBe("T2003");
  });

  it("sorts oldest requests first", () => {
    const out = sortTickets([mk("a", 900), mk("b", 100), mk("c", 500)], "oldest", 1000);
    expect(out.map((t) => t.id)).toEqual(["b", "c", "a"]);
  });

  it("sorts most recent requests first", () => {
    expect(sortTickets([mk("a", 900), mk("b", 100), mk("c", 500)], "recent", 1000).map(t => t.id)).toEqual(["a", "c", "b"]);
  });

  const requests = [{ ...mk("scheduled", 900), urgency: "Scheduled" }, { ...mk("immediate", 100), urgency: "Immediate" }] as Ticket[];
  it("sorts high to low urgency with Immediate first", () => {
    expect(sortTickets(requests, "urgencyHigh", 1000).map(t => t.id)).toEqual(["immediate", "scheduled"]);
  });
  it("sorts low to high urgency with Scheduled first", () => {
    expect(sortTickets(requests, "urgencyLow", 1000).map(t => t.id)).toEqual(["scheduled", "immediate"]);
  });
  it("charges $500 for the demo mechanical lift without a voucher", () => {
    expect(liftCosts(false)).toEqual({ lift: 500, voucher: 0, total: 500 });
  });
  it("deducts $500 with the community voucher leaving $0", () => {
    expect(liftCosts(true)).toEqual({ lift: 500, voucher: 500, total: 0 });
  });

  it("starts the van at the hospital with a 14 minute ETA", () => {
    const s = tripState("home", 1000, 1000);
    expect(s.etaMin).toBe(14);
    expect(s.pos).toEqual({ lat: HOSPITAL.lat, lng: HOSPITAL.lng });
    expect(tripState("home", null, 1000).stage).toBe(-1);
  });
  it("home visit: care at home, completed back at the hospital", () => {
    expect(tripState("home", 0, 26000).stages[2]).toBe("Care In Progress");
    expect(tripState("home", 0, 26000).pos.lat).toBe(HOME.lat);
    const end = tripState("home", 0, 10_000_000);
    expect(end.stages[end.stage]).toBe("Completed");
    expect(end.pos.lat).toBe(HOSPITAL.lat);
  });
  it("office visit with transport: care at hospital, completed at home", () => {
    const care = tripState("office", 0, 46000);
    expect(care.stages[care.stage]).toBe("Care In Progress");
    expect(care.pos.lat).toBe(HOSPITAL.lat);
    const end = tripState("office", 0, 10_000_000);
    expect(end.stages[end.stage]).toBe("Completed");
    expect(end.pos.lat).toBe(HOME.lat);
  });
  it("telehealth and office visits without transport do not start the tracker", () => {
    expect(tripKind({ mode: "Virtual", service: "Physician (MD/DO)" })).toBe("none");
    expect(tripKind({ mode: "Office", service: "Physician (MD/DO)", transport: false })).toBe("none");
    expect(tripState("none", 0, 5000).stage).toBe(-1);
  });
});
