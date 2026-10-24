# HomeBound OS 🚑
### Regional Clinical Care & NEMT Dispatch Grid for Metro Detroit

> An open-weight AI healthcare dispatch and non-emergency medical transportation (NEMT) coordination platform engineered for severely homebound, bed-bound patients and their family caregivers.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Model: Gemma 2 9B](https://img.shields.io/badge/Model-Gemma--2--9B--it-4285F4.svg)](https://ai.google.dev/gemma)
[![Stack: React + Vite + Tailwind](https://img.shields.io/badge/Stack-React%20%7C%20Vite%20%7C%20Tailwind-38B2AC.svg)](#)
[![Maps: Leaflet + OpenStreetMap](https://img.shields.io/badge/Maps-Leaflet%20(OpenStreetMap)-77DD77.svg)](#)

---

## 📌 The Problem & Humanity Focus
Severely homebound patients—such as chronic bed-bound seniors with contractures, oxygen dependency, or post-stroke complications—face acute health system abandonment. When a bedside visit or specialized outpatient procedure is required, the barriers are severe:
1. **The Transit Gap:** Standard retail rideshare cannot transport supine, bed-bound individuals. Specialized Non-Emergency Medical Transportation (NEMT) exists under Michigan Medicaid and Medicare Advantage, but scheduling is trapped in manual phone trees and siloed dispatchers.
2. **Clinical Blindspots:** Crucial bedside constraints (e.g., steep porch steps, transfer panic, oxygen regulator settings) are buried in raw intake paragraphs, leading to dangerous transfer accidents or rejected pickups at the curb.
3. **Language Inequity:** Metro Detroit contains vibrant immigrant and ESL communities (notably in Southwest Detroit and Dearborn) who face steep barriers navigating English-only patient portals.

---

## 💡 The Solution
**HomeBound OS** synchronizes bedside patient needs with regional provider dispatching through a unified dual-role interface:

* **Patient & Caregiver Hub:** An accessible, low-cognitive-load bedside interface where patients or proxy caregivers can request in-home clinicians (nurses, mobile dentistry, physical therapists) or covered NEMT stretcher transport at **$0.00 out-of-pocket** via standard billing codes (HCPCS T2003/A0130).
* **Provider CAD Dispatch Console:** A high-density regional dispatch table for traveling clinicians and transit operators, filterable by Detroit ZIP codes (48224 Morningside, 48216 Corktown, 48201 Midtown) and urgency tiers.
* **Ambient Multilingual Support:** Native language switching between English, Spanish, and Arabic powered by open-weight AI.

---

## 🧠 Open-Weight AI Architecture (Google Gemma 2)
HomeBound OS integrates Google’s open-weight **Gemma 2 (`gemma-2-9b-it`)** directly into the care pipeline:

```text
[Raw Caregiver Intake Note] 
            │
            ▼
┌───────────────────────────────────────────────┐
│ Google Gemma 2 9B (Open-Weight Engine)        │
│ Endpoint: v1beta/models/gemma-2-9b-it         │
└───────────────────────────────────────────────┘
            │
            ├─► 1. Precaution Extraction (Mobility Tier, O2 Support, Structural Hazards)
            └─► 2. Ambient Medical Translation (English ⇄ Español ⇄ العربية)
