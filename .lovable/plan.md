# HomeBound OS — Detroit Regional Care & Mobility Grid

A two-sided demo app: a calm, large-touch **Patient Hub** for caregivers and a dense **Provider Hub** dispatch board, sharing one live state so actions on one side show up instantly on the other.

## Look and feel
- Patient Hub: high legibility, big buttons, soft clinical green header, generous spacing.
- Provider Hub: compact enterprise dispatch (CAD) look, sans-serif card rows with hover highlight, muted `#T-1042` ID badges, colored urgency pills.
- Top nav: "HomeBound OS" with "Detroit Regional Care & Mobility Grid" subtitle and a "● Active • Henry Ford Health FHIR Connected" pill. Tabs: Patient Hub / Provider Hub.

## Patient Hub (`/`)
- **Header**: George Maxwell (68, M, Morningside 48224), "Logged in as: Sarah Maxwell (Daughter & Proxy Caregiver)" pill, vitals (BP 138/84, SpO2 97%), mobility flag (Strict Bed-Bound, 2-Person Hydraulic Lift).
- **Language toggle**: English / Español / العربية (Arabic switches page to right-to-left). Translates passport notes and care instructions with AI.
- **Request Care** (Home / Office / Virtual): service (full provider list: Doctor, Nurse, Nutritionist, PT, OT, Speech, Home Health Aide, PCA, Lab Tech, Transporter, Dentist) → Immediate or Scheduled (date/time) → notes (Home/Virtual) or transport needed + mobility level (Ambulatory / Wheelchair / Stretcher) and Medicaid/Medicare ID (Office). Submit shows "Routing request to Detroit Regional Dispatch Queue…" then a "View in Live Tracker →" button. The new ticket appears in the provider queue.
- **Live Fulfillment Tracker**: progress bar Assigned → En Route (live ETA) → Arrived → Visit In Progress → Completed; verified personnel card (avatar, name, CPR / HIPAA Vetted / NEMT Hydraulic Spec badges, vehicle and plate).
- **Detroit map** (OpenStreetMap, no key): markers for Morningside home and Henry Ford Hospital, dashed route with a moving van icon; destination popup "Destination: Henry Ford Hospital • One Ford Place Triage".
- **Unified Health Passport**: "Unified Longitudinal Chart • SMART-on-FHIR Synced" tag, chronological cross-provider notes, "+ Add Bedside Note" modal.
- **Cost Breakdown**: all $0.00 lines (insurance, covered NEMT with HCPCS code A0130/T2003, Wayne County grant), plus a "Community Voucher / Detroit Block Grant" toggle.

## Provider Hub (`/provider`)
- **Regional queue**: filter by zip (48224 Morningside, 48216 Corktown, 48201 Midtown, more), sort by wait (longest, shortest, most recent, oldest). Badges for urgency, service type and mobility precautions.
- **Claim & Dispatch Unit**: button turns green "✓ Dispatched to Unit 14 (Darnell Carter)", toast "Dispatched to NEMT Unit 14 • ETA 14 mins to Morningside", and the patient tracker starts moving.
- **AI triage**: "Run AI triage" turns the booking note into colored warning chips (red Mobility, yellow Equipment, orange Environmental).
- **Quick-Sync bar**: 2-sentence bedside summary → "Sync to Unified Chart" adds it to the patient's passport right away.

## Technical details
- TanStack routes `/` and `/provider`; shared demo state in a React context saved in localStorage (works across tabs through the storage event). Sample data comes from the brief. No accounts or database for now.
- Leaflet + react-leaflet, loaded only in the browser.
- AI: the brief asks for Gemma using a `VITE_GEMINI_API_KEY` from the browser. A `VITE_` key would be visible to anyone who opens the site. So triage and translation run in server functions through Lovable AI (Gemini Flash), which needs no key, and triage returns structured chips. If you want Gemma with your own key instead, it would be stored as a server secret, never in the browser.
- New design colors and fonts in styles.css; page titles and descriptions for each page.
