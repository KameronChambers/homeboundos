import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { seedNotes, seedTickets, type PassportNote, type Ticket } from "./care-data";

type State = {
  tickets: Ticket[];
  notes: PassportNote[];
  activeTicketId: string | null;
  dispatchedAt: number | null;
};

type Ctx = State & {
  ready: boolean;
  addTicket: (t: Omit<Ticket, "id" | "createdAt" | "status">) => string;
  dispatch: (id: string, unit: string) => void;
  addNote: (n: Omit<PassportNote, "id" | "at">) => void;
  reset: () => void;
};

const KEY = "homebound-os-state-v2";
const CareContext = createContext<Ctx | null>(null);

function fresh(): State {
  return { tickets: seedTickets(), notes: seedNotes(), activeTicketId: null, dispatchedAt: null };
}

export function CareProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<State>({ tickets: [], notes: [], activeTicketId: null, dispatchedAt: null });
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let s: State;
    try {
      const raw = localStorage.getItem(KEY);
      s = raw ? (JSON.parse(raw) as State) : fresh();
    } catch {
      s = fresh();
    }
    setState(s);
    setReady(true);
    const onStorage = (e: StorageEvent) => {
      if (e.key === KEY && e.newValue) setState(JSON.parse(e.newValue));
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const update = useCallback((fn: (s: State) => State) => {
    setState((prev) => {
      const next = fn(prev);
      localStorage.setItem(KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const addTicket: Ctx["addTicket"] = (t) => {
    const nums = state.tickets.map((x) => Number(x.id.slice(2))).filter(Boolean);
    const id = `T-${Math.max(1047, ...nums) + 1}`;
    update((s) => ({
      ...s,
      tickets: [{ ...t, id, createdAt: Date.now(), status: "queued" }, ...s.tickets],
      activeTicketId: id,
      dispatchedAt: null,
    }));
    return id;
  };

  const dispatch: Ctx["dispatch"] = (id, unit) =>
    update((s) => {
      const isPatient = s.tickets.find((t) => t.id === id)?.patient === "George Maxwell";
      return {
        ...s,
        tickets: s.tickets.map((t) => (t.id === id ? { ...t, status: "dispatched", unit } : t)),
        ...(isPatient ? { activeTicketId: id, dispatchedAt: Date.now() } : {}),
      };
    });

  const addNote: Ctx["addNote"] = (n) =>
    update((s) => ({ ...s, notes: [...s.notes, { ...n, id: `n${Date.now()}`, at: Date.now() }] }));

  const reset = () => update(() => fresh());

  return (
    <CareContext.Provider value={{ ...state, ready, addTicket, dispatch, addNote, reset }}>
      {children}
    </CareContext.Provider>
  );
}

export function useCare() {
  const c = useContext(CareContext);
  if (!c) throw new Error("useCare must be used inside CareProvider");
  return c;
}

export function useNow(intervalMs = 1000) {
  const [now, setNow] = useState(0);
  useEffect(() => {
    setNow(Date.now());
    const i = setInterval(() => setNow(Date.now()), intervalMs);
    return () => clearInterval(i);
  }, [intervalMs]);
  return now;
}
