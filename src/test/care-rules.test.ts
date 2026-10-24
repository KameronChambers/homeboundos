import { describe, expect, it } from "vitest";
import { NEMT_HCPCS, sortTickets, trackerState, type Ticket } from "@/lib/care-data";

const mk = (id: string, createdAt: number) => ({ id, createdAt }) as Ticket;

describe("care rules", () => {
  it("uses the CMS HCPCS codes for each transport level", () => {
    expect(NEMT_HCPCS.Wheelchair.code).toBe("A0130");
    expect(NEMT_HCPCS.Stretcher.code).toBe("T2005");
    expect(NEMT_HCPCS.Ambulatory.code).toBe("T2003");
  });

  it("sorts the queue by longest wait first", () => {
    const out = sortTickets([mk("a", 900), mk("b", 100), mk("c", 500)], "longest", 1000);
    expect(out.map((t) => t.id)).toEqual(["b", "c", "a"]);
  });

  it("starts the tracker with a 14 minute ETA after dispatch", () => {
    expect(trackerState(1000, 1000).etaMin).toBe(14);
    expect(trackerState(null, 1000).stage).toBe(-1);
  });
});
