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
  scheduledAt?: string | undefined;
  note: string;
  mobility: string;
  createdAt: number;
  status: "queued" | "dispatched";
  unit?: string | undefined;
  transport?: boolean | undefined;
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
    {
      id: "T-1047",
      patient: "Evelyn Ward",
      age: 79,
      zip: "48214",
      service: "Mobile Dentist (DDS/DMD)",
      mode: "Home",
      urgency: "Scheduled",
      scheduledAt: "Tomorrow 13:00",
      note: "Homebound; ill-fitting complete upper denture causing sore spots. Moderate dementia (needs caregiver present). Uses wheelchair indoors.",
      mobility: "Wheelchair",
      createdAt: n - 47 * 60000,
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

export type SortKey = "recent" | "oldest" | "urgencyHigh" | "urgencyLow";

export function sortTickets(list: Ticket[], key: SortKey, now: number): Ticket[] {
  const c = [...list];
  const urgency = (t: Ticket) => t.urgency === "Immediate" ? 1 : 0;
  switch (key) {
    case "oldest":
      return c.sort((a, b) => a.createdAt - b.createdAt);
    case "recent":
      return c.sort((a, b) => b.createdAt - a.createdAt);
    case "urgencyHigh":
      return c.sort((a, b) => urgency(b) - urgency(a) || b.createdAt - a.createdAt);
    case "urgencyLow":
      return c.sort((a, b) => urgency(a) - urgency(b) || b.createdAt - a.createdAt);
  }
}

export function liftCosts(voucherApplied: boolean) {
  const lift = 500;
  const voucher = voucherApplied ? 500 : 0;
  return { lift, voucher, total: lift - voucher };
}

// Demo trip plans after dispatch (compressed so the demo moves visibly). The van always starts at the hospital.
export type TripKind = "home" | "office" | "none";
type Place = "hospital" | "home";
type Segment = { stage: string; status: string; from: Place; to: Place; ms: number };

export function tripKind(t?: { mode: Ticket["mode"]; service: string; transport?: boolean | undefined }): TripKind {
  if (!t) return "none";
  if (t.mode === "Home") return "home";
  if (t.mode === "Office" && t.transport !== false && t.service === "NEMT Transport") return "office";
  return "none";
}

const S = { wait: 5000, drive: 20000, care: 20000 };
export const TRIPS: Record<Exclude<TripKind, "none">, Segment[]> = {
  home: [
    { stage: "Assigned", status: "Your provider has been assigned and is leaving the hospital.", from: "hospital", to: "hospital", ms: S.wait },
    { stage: "En Route", status: "Your provider is on the way to your home.", from: "hospital", to: "home", ms: S.drive },
    { stage: "Care In Progress", status: "Your provider has arrived and care is in progress.", from: "home", to: "home", ms: S.care },
    { stage: "Returning", status: "Care finished. The unit is returning to the hospital.", from: "home", to: "hospital", ms: S.drive },
    { stage: "Completed", status: "Your care visit is complete.", from: "hospital", to: "hospital", ms: 0 },
  ],
  office: [
    { stage: "Assigned", status: "Your transport has been assigned and is leaving the hospital.", from: "hospital", to: "hospital", ms: S.wait },
    { stage: "Picking Up", status: "The van is on the way to pick you up.", from: "hospital", to: "home", ms: S.drive },
    { stage: "To Hospital", status: "You are being transported to the hospital.", from: "home", to: "hospital", ms: S.drive },
    { stage: "Care In Progress", status: "You have arrived and care is in progress.", from: "hospital", to: "hospital", ms: S.care },
    { stage: "Returning Home", status: "Care finished. You are being driven home.", from: "hospital", to: "home", ms: S.drive },
    { stage: "Completed", status: "You are home. Your care visit is complete.", from: "home", to: "home", ms: 0 },
  ],
};

export function tripState(kind: TripKind, dispatchedAt: number | null, now: number) {
  const segs = kind === "none" ? [] : TRIPS[kind];
  const stages = segs.map((x) => x.stage);
  const at = (p: Place) => (p === "home" ? HOME : HOSPITAL);
  if (!segs.length || !dispatchedAt) return { stage: -1, stages, status: "", pos: { lat: HOSPITAL.lat, lng: HOSPITAL.lng }, etaMin: UNIT.etaMin };
  let t = now - dispatchedAt;
  for (let i = 0; i < segs.length; i++) {
    const seg = segs[i];
    if (t < seg.ms || i === segs.length - 1) {
      const p = seg.ms ? Math.min(1, Math.max(0, t / seg.ms)) : 1;
      const a = at(seg.from), b = at(seg.to);
      const etaMin = i === 0 ? UNIT.etaMin : i === 1 ? Math.max(1, Math.ceil(UNIT.etaMin * (1 - p))) : 0;
      return { stage: i, stages, status: seg.status, pos: { lat: a.lat + (b.lat - a.lat) * p, lng: a.lng + (b.lng - a.lng) * p }, etaMin };
    }
    t -= seg.ms;
  }
  throw new Error("unreachable");
}

export function waitLabel(ms: number) {
  const m = Math.max(0, Math.floor(ms / 60000));
  return m < 60 ? `${m} min` : `${Math.floor(m / 60)} h ${m % 60} min`;
}
