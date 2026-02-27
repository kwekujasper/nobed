# NECHIS Ghana — System Documentation
## National Emergency Command & Hospital Integrated System

**Version 2.0 | Ghana Health Service | February 2026**

---

## Table of Contents

1. [System Overview](#system-overview)
2. [Architecture](#architecture)
3. [Technology Stack](#technology-stack)
4. [File Structure](#file-structure)
5. [Database Schema](#database-schema)
6. [User Roles & Access Control](#user-roles--access-control)
7. [Module Reference](#module-reference)
8. [API Reference](#api-reference)
9. [Notifications & SMS](#notifications--sms)
10. [Setup Guide](#setup-guide)
11. [Glossary](#glossary)

---

## 1. System Overview

NECHIS is Ghana's **National Emergency Command & Hospital Integrated System** — a real-time web-based platform designed to eliminate the "no-bed syndrome" by providing complete visibility across the health referral chain:

| Problem | NECHIS Solution |
|---------|----------------|
| No visible bed availability | Live bed grid across all 10 facilities |
| Referrals made by phone with no tracking | Digital referral engine with SLA timers |
| Ambulance location unknown | Live Leaflet.js map with GPS positions |
| No ICU monitoring across hospitals | Vitals Monitor with ECG waveforms |
| Surge/MCI with no coordination | HECU + Surge dashboard with activation |
| No accountability trail | Full audit log on every user action |
| SMS-only alerts | In-app + SMS notifications through Hubtel |

---

## 2. Architecture

```
Browser (SPA)
  │
  ├── index.html          — App shell (sidebar + topbar + router outlet)
  ├── assets/css/main.css — Design system (CSS variables, components)
  ├── assets/js/
  │   ├── data.js         — Mock data (used offline / development)
  │   ├── auth.js         — Session management, data scoping helpers
  │   ├── app.js          — Router, RBAC nav filter, global search, idle timer
  │   ├── notifications.js— Frontend polling + toast notifications
  │   └── modules/        — One file per module (13 total)
  │
  └── api/                — PHP REST API (Laragon/Apache + MySQL)
      ├── config.php      — DB connection, helpers, CORS
      ├── auth.php        — Login / logout / verify
      ├── notifications.php — Create, list, mark-read, SMS
      ├── referrals.php   — Create, accept, decline, escalate
      └── sms.php         — Hubtel SMS service class
  
  database/nechis.sql     — Full MySQL schema (16 tables)
```

### Request Flow
```
User Action → Module JS → Auth.can() check → API call (PHP) → MySQL
                                                     ↓
                                              Notification created
                                                     ↓
                                              SMS via Hubtel (if critical)
                                                     ↓
                                          Other users' polling catches it
                                                     ↓
                                            Toast popup + badge update
```

---

## 3. Technology Stack

| Layer | Technology | Notes |
|-------|-----------|-------|
| Frontend | Vanilla HTML/CSS/JS | No framework — maximum speed |
| Maps | Leaflet.js 1.9.4 | Ghana tiles, ambulance markers |
| Charts | Chart.js 4.4.0 | Trend, heatmap, ECG canvas |
| Backend | PHP 8.2 | Laragon (Apache + PHP-FPM) |
| Database | MySQL 8.0 | Via Laragon |
| SMS Gateway | Hubtel Ghana | `smsc.hubtel.com` API |
| Auth | 4-digit PIN + session tokens | Stored in localStorage (frontend) |
| Fonts | Inter + JetBrains Mono | Google Fonts CDN |

---

## 4. File Structure

```
c:\laragon\www\nobed\
├── index.html
├── assets/
│   ├── css/
│   │   └── main.css
│   └── js/
│       ├── data.js
│       ├── auth.js
│       ├── app.js
│       ├── notifications.js
│       └── modules/
│           ├── login.js
│           ├── dashboard.js
│           ├── beds.js
│           ├── referral.js
│           ├── emt.js
│           ├── vitals.js
│           ├── telemedicine.js
│           ├── hecu.js
│           ├── equipment.js
│           ├── surge.js
│           ├── analytics.js
│           ├── governance.js
│           ├── public.js
│           └── settings.js
├── api/
│   ├── config.php
│   ├── auth.php
│   ├── notifications.php
│   ├── referrals.php
│   └── sms.php
└── database/
    └── nechis.sql
```

---

## 5. Database Schema

### Core Tables

| Table | Purpose |
|-------|---------|
| `regions` | Ghana's administrative regions (10) |
| `facilities` | Hospitals — ICU/bed counts, GPS, status |
| `bed_units` | Per-unit breakdown (ICU/HDU/ED/Maternity) |
| `users` | System users with role + facility/region/unit scope |
| `sessions` | Active login sessions (token-based) |
| `referrals` | Full referral lifecycle: pending→accepted→en-route→completed |
| `ambulances` | Fleet GPS, status, crew, fuel, current case |
| `emt_cases` | Field case records with vitals JSON |
| `equipment` | National asset registry (NHIMMS-aligned) |
| `fault_reports` | Equipment faults + resolution track |
| `incidents` | Surge/MCI incidents with escalation level |
| `notifications` | In-app alerts (role/region/facility scoped) |
| `sms_log` | All SMS messages with Hubtel message IDs and status |
| `patient_vitals` | Timestamped vital readings per bed |
| `clinical_registry` | Trauma / stroke / maternal case registry |
| `mm_reviews` | Mortality & Morbidity review queue |
| `audit_log` | Every user action timestamped with IP |

---

## 6. User Roles & Access Control

### Role Hierarchy

```
National Command (full access)
  ├── Analytics Officer    (analytics/governance only)
  └── Regional Director (by region)
        ├── HECU Commander (by hospital)
        │     ├── Bed Manager (by unit)
        │     ├── Clinician (by facility)
        │     └── Equipment Officer (by facility)
        └── EMT Dispatcher (by region/district)
Public (public interface only)
```

### Data Scope per Role

| Role | See Facilities | See Referrals | See Ambulances | PIN |
|------|----------------|---------------|----------------|-----|
| National Command | All 10 facilities | All regions | All fleet | 1234 |
| Analytics Officer | All | None | None | 2345 |
| Regional Director (GAR) | GAR facilities only | GAR referrals | GAR fleet | 3456 |
| HECU Commander (KBU) | KBU only | KBU referrals | Region fleet | 5678 |
| Bed Manager (KBU ICU) | KBU ICU unit only | KBU referrals | None | 7890 |
| EMT Dispatcher (GAR) | None | GAR referrals | GAR fleet | 9012 |
| Clinician (RID ED) | RID facility | RID referrals | None | 1357 |
| Equipment Officer (KBU) | KBU equipment | None | None | 3691 |
| Public | All (read-only) | None | None | 0000 |

### Permission Matrix (Action-Level)

| Action | NC | RD | HECU | Beds | EMT | Clinician | Equip | Public |
|--------|----|----|------|------|-----|-----------|-------|--------|
| Create Referral | ✓ | ✓ | ✓ | ✗ | ✓ | ✓ | ✗ | ✗ |
| Accept Referral | ✓ | ✓ | ✓ | ✓ | ✗ | ✗ | ✗ | ✗ |
| Dispatch Ambulance | ✓ | ✓ | ✗ | ✗ | ✓ | ✗ | ✗ | ✗ |
| Manage Beds | ✓ | ✓ | ✓ | ✓ | ✗ | ✗ | ✗ | ✗ |
| Manage Equipment | ✓ | ✓ | ✓ | ✗ | ✗ | ✗ | ✓ | ✗ |
| View Analytics | ✓ | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ |
| Manage Users | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ |
| Activate Surge | ✓ | ✓ | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ |

---

## 7. Module Reference

### 1. National Dashboard (`#dashboard`)
Real-time overview for national/regional command.
- **KPI strip**: Critical referrals, active referrals, ICU beds available, total ICU capacity, ambulances active, en-route count, active incidents, facilities online
- **National ICU Heatmap**: Color-coded cards (green/amber/red) per facility — click to drill down
- **Active Incidents**: Live incident feed with casualty count and units dispatched
- **Live Referral Queue**: Top pending referrals with urgency level
- **Regional ICU Occupancy**: Chart.js bar chart by region
- **Fleet Status**: Ambulance status count ring

### 2. Bed & Capacity (`#beds`)
Live bed management per unit.
- **Unit selector**: ICU / HDU / ED / Maternity / NICU / Paeds / Ward
- **Visual bed grid**: Color-coded cell per bed (green=available, amber=cleaning, red=occupied, blue=reserved)
- **Ventilator tags**: 🫁 icon on vent-equipped beds
- **Facility tabs**: Switch between hospitals (scoped to user's facility/region)

### 3. Referral Engine (`#referral`)
Full referral lifecycle management.
- **Summary cards**: Critical pending / All pending / Accepted+en-route / Declined
- **Tabs**: Inbox (pending) / Active / Declined / Escalation Ladder / All
- **Per-referral actions**: Accept · Decline · Escalate · Details · Dispatch Ambulance
- **SLA timer**: Countdown per referral — turns red under 2 minutes
- **Create Referral modal**: Patient details, service, urgency, destination, SMS option

### 4. EMT & Ambulance (`#emt`)
Live ambulance fleet management.
- **Fleet summary**: Available / En-Route / On-Scene / Offline counts
- **Leaflet live map**: GPS pins per ambulance (green/amber/red/grey)
- **Fleet sidebar**: Per-unit card with crew name, fuel %, current case, ETA
- **Active Field Cases**: Vitals, triage level, interventions, destination
- **Emergency Dispatch modal**: Assign ambulance to incident

### 5. Vitals Monitor (`#vitals`)
ICU/HDU real-time patient vitals.
- **Critical banner**: Lists all patients with critical vitals
- **Patient cards** (2-per-row): ECG canvas waveform, 8 vital tiles (HR/BP/SpO2/RR/Temp/EtCO2/GCS/ICP)
- **Status borders**: Green=stable, Red=critical
- **Alerts**: Individual alert strip with active critical vitals
- **Facility filter**: Scope to specific hospital

### 6. Telemedicine (`#telemedicine`)
Remote specialist consultation interface.
- **Active session panel**: Live video call UI, patient summary, specialist info
- **Chat window**: Real-time text exchange log
- **Patient context**: Diagnosis, vitals, current medications
- **Specialist queue**: Waiting consultations with estimated wait time

### 7. HECU Dashboard (`#hecu`)
Hospital Emergency Command Unit.
- **ED Flow Board**: Patient count vs capacity with color-coded rag status
- **On-Call Registry**: Specialist by department (Surgery/ICU/Neuro/Cardio/Obs)
- **Critical Services**: Ventilators, theatre status, blood bank, CSSD
- **Transfer optimization**: Outbound transfer suggestions to free capacity

### 8. Equipment & NHIMMS (`#equipment`)
National Health Infrastructure & Medical Maintenance System.
- **Summary KPIs**: Functional, Faulty, In Maintenance rates
- **Registry table**: Name, category, facility, status, last/next service, score
- **Fault Reports**: Open fault list with severity and reporter
- **Report Fault modal**: Notes, severity, equipment selector, auto-notification

### 9. Surge & Disaster (`#surge`)
Mass casualty and surge incident management.
- **Active incident board**: Incident cards with type, location, casualties, units
- **Regional capacity**: Green/amber/red readiness per region
- **Surge level meter**: READY / YELLOW / ORANGE / RED
- **Triage distribution**: P1/P2/P3/P4 chart
- **Activate Incident modal**: Surge level, scope, messaging to facilities

### 10. Analytics & QI (`#analytics`)
Performance metrics and quality intelligence.
- **8 KPI cards**: SLA compliance, avg response time, ICU occupancy, referral acceptance rate, ED boarding rate, mortality rate, equipment uptime, telemedicine rate — all with vs-target delta
- **Referral trend chart**: 6-month bar (accepted/declined)
- **ED Boarding chart**: Trend by month
- **AI Congestion Forecast**: 72h predictive line chart with alert annotation
- **Response Time Distribution**: Bar histogram
- **Facility Performance Scorecards**: Ranked table with composite score and mini bar

### 11. Clinical Governance (`#governance`)
Registries, compliance, and audit.
- **Trauma Registry**: RTA, falls, assaults — GCS, mechanism, outcome
- **Stroke Registry**: Type, time-to-CT, thrombolysis rate
- **Maternal Health**: GA, complications, mode of delivery, maternal outcome
- **Mortality Dashboard**: Adjusted mortality rate per facility
- **M&M Review Queue**: Cases scheduled/in-review/completed

### 12. Public Interface (`#public`)
Citizen-facing emergency portal.
- **Emergency numbers**: 999, 193 (GNEMS), 191 (Fire), 192 (Police), Poison Control
- **Hospital availability finder**: Search by region, see ICU/bed available + call/map links
- **First Aid Guide**: Step-by-step guides (CPR, choking, burns, bleeding)
- **Health Alerts**: Active disease outbreak and health advisories

### 13. Settings & Admin (`#settings`)
System configuration (National Command only).
- **User Management**: Full user list with role badges, Edit / Suspend / Reactivate
- **Role Permissions matrix**: 9 roles × 7 permissions with ✓/✗ grid
- **Create User modal**: Name, email, phone, role, facility/unit assignment, PIN
- **Facility Config**: Edit facility ICU/bed totals
- **System Preferences**: Surge thresholds, SLA defaults, SMS on/off toggle
- **Integrations & CSMS**: Centralized configuration for Custom SMS sender IDs and integration API keys.
- **SMS Broadcast**: Send emergency broadcasts via the Custom SMS system.
- **Audit Log**: Date-filtered table of all user actions

### 14. Integration Hub (`#integrations`)
Centralized API management and lookup.
- **Service Cards**: NHIS, Ghana Card, GMIS, CSMS with status indicators (Live/Mock/Needs Key)
- **NHIS Verify**: Member lookup by ID with active status return
- **Ghana Card**: National Identity lookup via NIA API
- **GMIS Lookup**: Ghana Medical Information System sync
- **CSMS SMS Test**: Send test broadcast directly from the dashboard

### 15. Nursing Command Centre (`#nursing`)
Digital nursing workflow.
- **MAR**: Medication Administration Record with scheduled times and 'Give' action
- **Care Plan**: Nursing diagnoses, interventions, and evaluation goals
- **Fluid Balance**: Real-time intake/output calculation with net balance
- **Wound Care**: Assessment parameters (size, exudate, tissue type)
- **Checklists**: Standardized admission, handover, and discharge protocols

---

## 8. API Reference

Base URL: `http://localhost/nobed/api/`

All authenticated endpoints require header: `X-Session-Token: <token>`

### Auth

| Method | Endpoint | Description |
|--------|---------|-------------|
| POST | `auth.php?action=login` | Login with `{uid, pin}` — returns token |
| POST | `auth.php?action=logout` | Invalidate session token |
| GET  | `auth.php?action=verify` | Verify token is still valid |

### Referrals

| Method | Endpoint | Description |
|--------|---------|-------------|
| GET  | `referrals.php?action=list` | Get referrals (role-scoped) |
| GET  | `referrals.php?action=get&id=REF-xxx` | Get single referral |
| POST | `referrals.php?action=create` | Create new referral + notify |
| POST | `referrals.php?action=accept` | Accept referral + SMS to sender |
| POST | `referrals.php?action=decline` | Decline with reason |
| POST | `referrals.php?action=escalate` | Escalate + SMS to regional director |

### Notifications

| Method | Endpoint | Description |
|--------|---------|-------------|
| GET  | `notifications.php?action=list` | Get notifications (scoped) |
| GET  | `notifications.php?action=unread` | Get unread count for badge |
| POST | `notifications.php?action=mark_read` | Mark notification(s) as read |
| POST | `notifications.php?action=create` | Create in-app alert + optional SMS |
| POST | `notifications.php?action=sms_send` | Send SMS to specific number |
| GET  | `notifications.php?action=sms_log` | View SMS send history |

---

## 9. Notifications & SMS

### In-App Notifications
- **Polling**: Frontend polls `GET notifications.php?action=unread` every 20 seconds
- **Toast**: New notifications appear as slide-in toasts (bottom-right), auto-dismiss 7s
- **Scoping**: Notifications are targeted by `target_role`, `target_region`, `target_facility`, or `target_user_id`
- **Mark read**: Bell icon panel shows all, with "Mark all read" clearing the badge

### SMS (Hubtel Ghana)

Configure in `api/config.php`:
```php
define('HUBTEL_CLIENT_ID',     'your_client_id');
define('HUBTEL_CLIENT_SECRET', 'your_client_secret');
define('HUBTEL_FROM',          'NECHIS');
```

**SMS is triggered automatically for:**

| Event | Recipients |
|-------|-----------|
| New Critical Referral | HECU Commanders in target region |
| Referral Accepted | Sending clinician |
| Referral Declined | Sending clinician |
| Referral Escalated | Regional Director |
| Surge Activated | All users in affected region |
| Critical Vitals Alert | Clinicians at facility |
| Equipment Fault | Equipment Officer at facility |

All SMS messages are logged to `sms_log` table with Hubtel message ID, status, and cost.

---

## 10. Setup Guide

### Prerequisites
- Laragon (includes Apache, PHP 8+, MySQL 8)
- Internet connection (for CDN scripts)

### Steps

1. **Clone / copy files** to `c:\laragon\www\nobed\`

2. **Create the database:**
   - Open Laragon → MySQL → HeidiSQL or phpMyAdmin
   - Import `database/nechis.sql`

3. **Configure API:**
   - Edit `api/config.php`
   - Set `DB_PASS` if you changed from Laragon default (empty)
   - Set `HUBTEL_CLIENT_ID` and `HUBTEL_CLIENT_SECRET`

4. **Hash PINs for production** (development uses PIN comparison only):
   ```php
   $hash = password_hash('1234', PASSWORD_BCRYPT);
   // Update users.pin_hash column
   ```

5. **Start Laragon** → click Start All

6. **Open browser:** `http://localhost/nobed`

7. **Hard refresh:** Ctrl+Shift+R after any code changes

---

## 11. Glossary

| Term | Meaning |
|------|---------|
| **KBU** | Korle Bu Teaching Hospital (Greater Accra) |
| **KAT** | Komfo Anokye Teaching Hospital (Ashanti) |
| **GAR** | Greater Accra Region |
| **ASH** | Ashanti Region |
| **GNEMS** | Ghana National Emergency Medical Service |
| **HECU** | Hospital Emergency Command Unit |
| **NHIMMS** | National Health Infrastructure & Medical Maintenance System |
| **MCI** | Mass Casualty Incident |
| **SLA** | Service Level Agreement (referral response time) |
| **SLA timer** | Countdown from referral creation to facility acceptance |
| **Triage P1** | Immediate life threat |
| **Triage P2** | Urgent but stable |
| **Triage P3** | Delayed / walking wounded |
| **Triage P4** | Expectant / deceased |
| **HDU** | High Dependency Unit |
| **ICU** | Intensive Care Unit |
| **NICU** | Neonatal Intensive Care Unit |
| **GCS** | Glasgow Coma Scale (3–15) |
| **SpO2** | Blood oxygen saturation (%) |
| **EtCO2** | End-tidal CO2 (mmHg) |
| **ICP** | Intracranial Pressure (mmHg) |
| **M&M** | Mortality & Morbidity review meeting |
| **DAMA** | Discharged Against Medical Advice |
| **RTA** | Road Traffic Accident |
| **ALS** | Advanced Life Support (ambulance level) |
| **BLS** | Basic Life Support (ambulance level) |
