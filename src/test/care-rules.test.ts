import { describe, expect, it } from "vitest";
import { NEMT_HCPCS, liftCosts, sortTickets, trackerState, type Ticket } from "@/lib/care-data";

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

  it("starts the tracker with a 14 minute ETA after dispatch", () => {
    expect(trackerState(1000, 1000).etaMin).toBe(14);
    expect(trackerState(null, 1000).stage).toBe(-1);
  });
});
