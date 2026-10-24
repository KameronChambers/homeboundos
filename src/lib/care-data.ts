// Shared demo data and pure helpers (browser-safe, no side effects).

export type ServiceType =
  | "Physician (MD/DO)"
  | "Registered Nurse (RN)"
  | "Registered Dietitian Nutritionist (RDN)"
  | "Physical Therapist (PT)"
  | "Occupational Therapist (OT)"
  | "Speech-Language Pathologist (SLP)"
  | "Home Health Aide (HHA)"
  | "Personal Care Aide (PCA)"
  | "Phlebotomist / Lab Technician"
  | "NEMT Transport"
  | "Mobile Dentist (DDS/DMD)";

export const SERVICES: ServiceType[] = [
  "Physician (MD/DO)",
  "Registered Nurse (RN)",
  "Registered Dietitian Nutritionist (RDN)",
  "Physical Therapist (PT)",
  "Occupational Therapist (OT)",
  "Speech-Language Pathologist (SLP)",
  "Home Health Aide (HHA)",
  "Personal Care Aide (PCA)",
  "Phlebotomist / Lab Technician",
  "NEMT Transport",
  "Mobile Dentist (DDS/DMD)",
];

export type Mobility = "Ambulatory" | "Wheelchair" | "Stretcher";

// Real CMS HCPCS Level II codes for non-emergency transport.
export const NEMT_HCPCS: Record<Mobility, { code: string; label: string }> = {
  Ambulatory: { code: "T2003", label: "Non-emergency transportation; encounter/trip" },
  Wheelchair: { code: "A0130", label: "Non-emergency transportation: wheelchair van" },
  Stretcher: { code: "T2005", label: "Non-emergency transportation: stretcher van" },
};

export const ZIPS: Record<string, string> = {
  "48224": "Morningside / East English Village",
  "48216": "Corktown",
  "48201": "Midtown",
  "48202": "New Center / North End",
  "48207": "Lafayette Park / Rivertown",
  "48209": "Southwest Detroit",
  "48235": "Brightmoor / Old Redford",
};

export type Ticket = {
  id: string;
  patient: string;
  age: number;
  zip: string;
  service: ServiceType;
  mode: "Home" | "Office" | "Virtual";
  urgency: "Immediate" | "Scheduled";
  scheduledAt?: string;
  note: string;
  mobility: string;
  createdAt: number;
  status: "queued" | "dispatched";
  unit?: string;
};

export type PassportNote = {
  id: string;
  at: number;
  author: string;
  role: string;
  text: string;
};

export const PATIENT = {
  name: "George Maxwell",
  age: 68,
  sex: "M",
  zip: "48224",
  neighborhood: "Morningside, Detroit",
  proxy: "Sarah Maxwell",
  vitals: { bp: "138/84 mmHg", spo2: "97%", hr: "78 bpm" },
  mobility: "Bed-bound (non-ambulatory) • 2-person assist with mechanical (Hoyer) lift",
  careInstructions: [
    "Reposition every 2 hours to reduce pressure-injury risk (Braden Scale 14 — moderate risk).",
    "Head of bed elevated 30° during and 30 minutes after meals (aspiration precaution).",
    "Transfers require two trained staff and a mechanical patient lift (HCPCS E0630).",
    "Standard hospital bed: 36\" W × 80\" L, semi-electric (HCPCS E0261) with full rails.",
  ],
};

export const HOME = { lat: 42.3921, lng: -82.9437, label: "Home • Morningside (48224)" };
export const HOSPITAL = {
  lat: 42.3677,
  lng: -83.0846,
  label: "Destination: Henry Ford Hospital • 2799 W Grand Blvd, Detroit, MI 48202",
};

export const UNIT = {
  id: "Unit 14",
  name: "Darnell Carter",
  role: "NEMT Driver / Patient Transport Specialist",
  badges: ["AHA BLS (CPR) Certified", "HIPAA Trained", "CTAA PASS Wheelchair Securement"],
  vehicle: "2024 Ford Transit wheelchair/stretcher van",
  plate: "MI • EKZ 4417",
  etaMin: 14,
};

const now0 = () => Date.now();

export function seedTickets(): Ticket[] {
  const n = now0();
  return [
    {
      id: "T-1042",
      patient: "George Maxwell",
      age: 68,
      zip: "48224",
      service: "NEMT Transport",
      mode: "Office",
      urgency: "Immediate",
      note: "Bed-bound, 260 lb. Needs 2-person transfer with Hoyer lift and stretcher van. Portable oxygen 2 L/min via nasal cannula. 4 front porch steps, no ramp; narrow hallway (~32 in). Cardiology follow-up at Henry Ford Hospital.",
      mobility: "Stretcher",
      createdAt: n - 38 * 60000,
      status: "queued",
    },
    {
      id: "T-1043",
      patient: "Rosa Delgado",
      age: 74,
      zip: "48209",
      service: "Registered Nurse (RN)",
      mode: "Home",
      urgency: "Scheduled",
      scheduledAt: "Today 14:30",
      note: "Post-op wound check, right knee arthroplasty day 9. Uses front-wheeled walker. Spanish-speaking; daughter interprets. Type 2 diabetes, insulin-dependent.",
      mobility: "Ambulatory",
      createdAt: n - 22 * 60000,
      status: "queued",
    },
    {
      id: "T-1044",
      patient: "Hassan Saleh",
      age: 81,
      zip: "48201",
      service: "Physical Therapist (PT)",
      mode: "Home",
      urgency: "Scheduled",
      scheduledAt: "Tomorrow 10:00",
      note: "Fall within last 30 days, Morse Fall Scale 55 (high risk). Wheelchair for distances. Second-floor apartment, elevator out of service. Arabic preferred.",
      mobility: "Wheelchair",
      createdAt: n - 61 * 60000,
      status: "queued",
    },
    {
      id: "T-1045",
      patient: "Linda Brooks",
      age: 59,
      zip: "48216",
      service: "Phlebotomist / Lab Technician",
      mode: "Home",
      urgency: "Immediate",
      note: "INR draw for warfarin monitoring. Difficult venous access noted previously. Small dog in home.",
      mobility: "Ambulatory",
      createdAt: n - 9 * 60000,
      status: "queued",
    },
    {
      id: "T-1046",
      patient: "Marcus Hill",
      age: 47,
      zip: "48235",
      service: "Registered Dietitian Nutritionist (RDN)",
      mode: "Virtual",
      urgency: "Scheduled",
      scheduledAt: "Today 16:00",
      note: "CKD stage 3b, on fluid restriction 1.5 L/day. Telehealth visit; low-bandwidth connection.",
      mobility: "Ambulatory",
      createdAt: n - 15 * 60000,
      status: "queued",
    },
  ];
}

export function seedNotes(): PassportNote[] {
  const n = now0();
  const d = 86400000;
  return [
    {
      id: "n1",
      at: n - 6 * d,
      author: "Dr. A. Patel, MD",
      role: "Cardiology • Henry Ford Hospital",
      text: "Chronic heart failure with reduced ejection fraction (HFrEF), NYHA class III. Continue carvedilol and furosemide. Daily weights; call if gain > 3 lb in 1 day or 5 lb in 1 week.",
    },
    {
      id: "n2",
      at: n - 3 * d,
      author: "K. Johnson, RN",
      role: "Home Health Nursing",
      text: "Sacral skin intact, mild redness (blanchable). Braden Scale 14. Reinforced 2-hour repositioning schedule with caregiver.",
    },
    {
      id: "n3",
      at: n - 1 * d,
      author: "M. Ortiz, PT",
      role: "Physical Therapy",
      text: "Bed-level range-of-motion exercises tolerated well. Not safe for stand-pivot transfer; continue 2-person mechanical lift transfers.",
    },
  ];
}

export type SortKey = "longest" | "shortest" | "recent" | "oldest";

export function sortTickets(list: Ticket[], key: SortKey, now: number): Ticket[] {
  const c = [...list];
  const wait = (t: Ticket) => now - t.createdAt;
  switch (key) {
    case "longest":
    case "oldest":
      return c.sort((a, b) => wait(b) - wait(a));
    case "shortest":
    case "recent":
      return c.sort((a, b) => wait(a) - wait(b));
  }
}

// Demo timeline after dispatch (compressed so the demo moves visibly).
export const STAGES = ["Assigned", "En Route", "Arrived", "Visit In Progress", "Completed"] as const;
export const STAGE_MS = { assigned: 5000, enRoute: 42000, arrived: 10000, visit: 30000 };

export function trackerState(dispatchedAt: number | null, now: number) {
  if (!dispatchedAt) return { stage: -1, progress: 0, etaMin: UNIT.etaMin };
  const t = now - dispatchedAt;
  const a = STAGE_MS.assigned;
  const e = a + STAGE_MS.enRoute;
  const r = e + STAGE_MS.arrived;
  const v = r + STAGE_MS.visit;
  if (t < a) return { stage: 0, progress: 0, etaMin: UNIT.etaMin };
  if (t < e) {
    const p = (t - a) / STAGE_MS.enRoute;
    return { stage: 1, progress: p, etaMin: Math.max(1, Math.ceil(UNIT.etaMin * (1 - p))) };
  }
  if (t < r) return { stage: 2, progress: 1, etaMin: 0 };
  if (t < v) return { stage: 3, progress: 1, etaMin: 0 };
  return { stage: 4, progress: 1, etaMin: 0 };
}

export function waitLabel(ms: number) {
  const m = Math.max(0, Math.floor(ms / 60000));
  return m < 60 ? `${m} min` : `${Math.floor(m / 60)} h ${m % 60} min`;
}
