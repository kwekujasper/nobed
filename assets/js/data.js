// ================================================================
// NECHIS — Mock Data Store (Ghana-specific realistic data)
// ================================================================

const NECHIS_DATA = {

  regions: [
    { id: 'GAR', name: 'Greater Accra', color: '#ff3b3b' },
    { id: 'ASH', name: 'Ashanti', color: '#f59e0b' },
    { id: 'WES', name: 'Western', color: '#3b82f6' },
    { id: 'CEN', name: 'Central', color: '#8b5cf6' },
    { id: 'EAS', name: 'Eastern', color: '#22c55e' },
    { id: 'NOR', name: 'Northern', color: '#00d4aa' },
    { id: 'VOL', name: 'Volta', color: '#ec4899' },
    { id: 'BAV', name: 'Bono Ahafo', color: '#f97316' },
    { id: 'SV', name: 'Savannah', color: '#a3e635' },
    { id: 'UER', name: 'Upper East', color: '#fb923c' },
  ],

  facilities: [
    { id: 'KBU', name: 'Korle Bu Teaching Hospital', region: 'GAR', level: 'Teaching', lat: 5.535, lng: -0.225, services: ['ICU', 'HDU', 'Trauma', 'Neuro', 'CT', 'MRI', 'Dialysis', 'NICU', 'OR', 'ED'], tel: '+233-302-674360', status: 'high', icuTotal: 28, icuAvail: 4 },
    { id: 'RID', name: 'Ridge Hospital', region: 'GAR', level: 'Regional', lat: 5.571, lng: -0.194, services: ['ICU', 'ED', 'Maternity', 'OR'], tel: '+233-302-777681', status: 'med', icuTotal: 16, icuAvail: 6 },
    { id: 'MIL', name: '37 Military Hospital', region: 'GAR', level: 'Military', lat: 5.606, lng: -0.175, services: ['ICU', 'Trauma', 'CT', 'OR', 'ED'], tel: '+233-302-771311', status: 'low', icuTotal: 12, icuAvail: 5 },
    { id: 'LAA', name: 'La General Hospital', region: 'GAR', level: 'District', lat: 5.578, lng: -0.152, services: ['ED', 'Maternity', 'Pediatric'], tel: '+233-302-711901', status: 'high', icuTotal: 4, icuAvail: 0 },
    { id: 'KAT', name: 'Komfo Anokye Teaching Hospital', region: 'ASH', level: 'Teaching', lat: 6.687, lng: -1.622, services: ['ICU', 'HDU', 'Trauma', 'CT', 'OR', 'Neuro', 'NICU', 'ED', 'Dialysis'], tel: '+233-322-022301', status: 'med', icuTotal: 24, icuAvail: 8 },
    { id: 'CCM', name: 'Cape Coast Teaching Hospital', region: 'CEN', level: 'Teaching', lat: 5.108, lng: -1.248, services: ['ICU', 'OR', 'ED', 'Maternity'], tel: '+233-332-132769', status: 'low', icuTotal: 12, icuAvail: 7 },
    { id: 'TAM', name: 'Tamale Teaching Hospital', region: 'NOR', level: 'Teaching', lat: 9.408, lng: -0.860, services: ['ICU', 'OR', 'ED', 'Maternity', 'CT'], tel: '+233-372-022615', status: 'med', icuTotal: 14, icuAvail: 3 },
    { id: 'HOS', name: 'Ho Teaching Hospital', region: 'VOL', level: 'Teaching', lat: 6.601, lng: 0.472, services: ['ICU', 'OR', 'ED', 'Maternity'], tel: '+233-362-026290', status: 'low', icuTotal: 10, icuAvail: 6 },
    { id: 'WEG', name: 'Western Regional Hospital', region: 'WES', level: 'Regional', lat: 4.911, lng: -1.754, services: ['ICU', 'OR', 'ED'], tel: '+233-312-023500', status: 'med', icuTotal: 8, icuAvail: 2 },
    { id: 'TEM', name: 'Tema General Hospital', region: 'GAR', level: 'Regional', lat: 5.698, lng: -0.013, services: ['ICU', 'ED', 'OR'], tel: '+233-303-206002', status: 'high', icuTotal: 10, icuAvail: 1 },
  ],

  bedUnits: {
    KBU: [
      { unit: 'Emergency Department', beds: 40, avail: 5, occupied: 31, cleaning: 2, reserved: 1, oos: 1, ventBeds: 0 },
      { unit: 'ICU', beds: 28, avail: 4, occupied: 20, cleaning: 2, reserved: 2, oos: 0, ventBeds: 18 },
      { unit: 'HDU', beds: 20, avail: 6, occupied: 12, cleaning: 1, reserved: 1, oos: 0, ventBeds: 6 },
      { unit: 'Surgical Ward', beds: 60, avail: 14, occupied: 42, cleaning: 3, reserved: 1, oos: 0, ventBeds: 0 },
      { unit: 'Medical Ward', beds: 80, avail: 10, occupied: 65, cleaning: 3, reserved: 2, oos: 0, ventBeds: 0 },
      { unit: 'Maternity', beds: 50, avail: 8, occupied: 38, cleaning: 3, reserved: 1, oos: 0, ventBeds: 0 },
      { unit: 'NICU', beds: 16, avail: 2, occupied: 13, cleaning: 1, reserved: 0, oos: 0, ventBeds: 10 },
      { unit: 'Pediatric Ward', beds: 40, avail: 9, occupied: 28, cleaning: 2, reserved: 1, oos: 0, ventBeds: 2 },
      { unit: 'Operating Theatre Recovery', beds: 12, avail: 3, occupied: 8, cleaning: 1, reserved: 0, oos: 0, ventBeds: 4 },
      { unit: 'Dialysis', beds: 8, avail: 1, occupied: 7, cleaning: 0, reserved: 0, oos: 0, ventBeds: 0 },
    ],
    KAT: [
      { unit: 'Emergency Department', beds: 30, avail: 8, occupied: 19, cleaning: 2, reserved: 1, oos: 0, ventBeds: 0 },
      { unit: 'ICU', beds: 24, avail: 8, occupied: 14, cleaning: 1, reserved: 1, oos: 0, ventBeds: 16 },
      { unit: 'HDU', beds: 16, avail: 5, occupied: 9, cleaning: 1, reserved: 1, oos: 0, ventBeds: 5 },
      { unit: 'Surgical Ward', beds: 50, avail: 18, occupied: 28, cleaning: 3, reserved: 1, oos: 0, ventBeds: 0 },
    ],
  },

  referrals: [
    { id: 'REF-2024-001', patient: 'Male, 38yrs', from: 'La General Hospital', to: 'Korle Bu Teaching Hospital', service: 'ICU + Ventilator', condition: 'Traumatic Brain Injury', urgency: 'critical', status: 'pending', slaRemain: 180, reason: 'GCS 7, RTA victim', timestamp: '2026-02-25T22:45:00Z', clinician: 'Dr. Asante', phone: '+233-244-110023' },
    { id: 'REF-2024-002', patient: 'Female, 26yrs', from: 'Tema General', to: 'Korle Bu Teaching Hospital', service: 'NICU', condition: 'Premature Labour 28 weeks', urgency: 'critical', status: 'pending', slaRemain: 95, reason: 'No NICU at origin', timestamp: '2026-02-25T23:01:00Z', clinician: 'Dr. Mensah', phone: '+233-244-220041' },
    { id: 'REF-2024-003', patient: 'Male, 55yrs', from: 'Ridge Hospital', to: 'Korle Bu Teaching Hospital', service: 'Neurosurgery', condition: 'Subdural Hematoma', urgency: 'urgent', status: 'accepted', slaRemain: 0, reason: 'Neurosurgeon not available', timestamp: '2026-02-25T22:10:00Z', clinician: 'Dr. Owusu', phone: '+233-244-301567', acceptedBy: 'Dr. Tetteh, KBU', acceptTime: '22:18' },
    { id: 'REF-2024-004', patient: 'Female, 44yrs', from: 'Accra Clinic', to: '37 Military Hospital', service: 'Cardiac ICU', condition: 'Acute STEMI', urgency: 'critical', status: 'declined', slaRemain: 0, reason: 'No cardiac ICU bed', declineReason: 'ICU at 100% capacity, 0 beds available', timestamp: '2026-02-25T21:55:00Z', clinician: 'Dr. Aboagye', phone: '+233-244-405891', escalated: true },
    { id: 'REF-2024-005', patient: 'Male, 7yrs', from: 'Kintampo Municipal', to: 'Komfo Anokye Teaching', service: 'Pediatric ICU', condition: 'Cerebral Malaria + Respiratory Failure', urgency: 'critical', status: 'en-route', slaRemain: 0, ambulance: 'AMB-GA-012', eta: '14 mins', timestamp: '2026-02-25T22:30:00Z' },
    { id: 'REF-2024-006', patient: 'Female, 31yrs', from: 'Nsawam District', to: 'Ridge Hospital', service: 'Maternity HDU', condition: 'Eclampsia', urgency: 'urgent', status: 'pending', slaRemain: 310, timestamp: '2026-02-25T23:05:00Z', clinician: 'Midwife Ama Boateng' },
    { id: 'REF-2024-007', patient: 'Male, 62yrs', from: 'Achimota Hospital', to: 'Korle Bu Teaching Hospital', service: 'Dialysis', condition: 'AKI on CKD', urgency: 'urgent', status: 'pending', slaRemain: 480, timestamp: '2026-02-25T23:10:00Z', clinician: 'Dr. Quaye' },
  ],

  ambulances: [
    { id: 'AMB-GA-001', region: 'GAR', type: 'ALS', status: 'available', lat: 5.612, lng: -0.201, crew: 'EMT Kofi Agyeman', equipment: ['Defibrillator', 'Ventilator', 'ECG', 'IV'], fuel: 87, lastUpdate: '23:18' },
    { id: 'AMB-GA-002', region: 'GAR', type: 'ALS', status: 'en-route', lat: 5.589, lng: -0.173, crew: 'EMT Abena Sarpong', case: 'REF-2024-002', destination: 'Korle Bu', eta: 8, progress: 65, fuel: 72, lastUpdate: '23:19' },
    { id: 'AMB-GA-003', region: 'GAR', type: 'BLS', status: 'on-scene', lat: 5.565, lng: -0.241, crew: 'EMT Kwame Opoku', case: 'Trauma - RTA N1 Hwy', fuel: 55, lastUpdate: '23:17' },
    { id: 'AMB-GA-004', region: 'GAR', type: 'ALS', status: 'available', lat: 5.632, lng: -0.148, crew: 'EMT Esi Mensah', equipment: ['Defibrillator', 'Ventilator', 'ECG'], fuel: 94, lastUpdate: '23:15' },
    { id: 'AMB-GA-005', region: 'GAR', type: 'ALS', status: 'en-route', lat: 5.544, lng: -0.218, crew: 'EMT James Amoako', case: 'REF-2024-005', destination: 'Komfo Anokye', eta: 14, progress: 40, fuel: 61, lastUpdate: '23:20' },
    { id: 'AMB-GA-006', region: 'GAR', type: 'BLS', status: 'offline', lat: 5.555, lng: -0.190, crew: 'EMT Nana Boadu', reason: 'Maintenance', fuel: 30, lastUpdate: '21:00' },
    { id: 'AMB-GA-007', region: 'GAR', type: 'ALS', status: 'available', lat: 5.598, lng: -0.229, crew: 'EMT Akosua Darko', fuel: 81, lastUpdate: '23:16' },
    { id: 'AMB-ASH-001', region: 'ASH', type: 'ALS', status: 'available', lat: 6.698, lng: -1.610, crew: 'EMT Yaw Boateng', fuel: 76, lastUpdate: '23:14' },
    { id: 'AMB-ASH-002', region: 'ASH', type: 'BLS', status: 'en-route', lat: 6.721, lng: -1.598, crew: 'EMT Adwoa Frimpong', case: 'Obstetric Emergency', eta: 6, progress: 80, fuel: 68, lastUpdate: '23:19' },
    { id: 'AMB-CEN-001', region: 'CEN', type: 'ALS', status: 'available', lat: 5.118, lng: -1.255, crew: 'EMT Kojo Asante', fuel: 90, lastUpdate: '23:10' },
    { id: 'AMB-NOR-001', region: 'NOR', type: 'ALS', status: 'on-scene', lat: 9.421, lng: -0.844, crew: 'EMT Ibrahim Sulemana', case: 'Cardiac Arrest', fuel: 45, lastUpdate: '23:18' },
    { id: 'AMB-NOR-002', region: 'NOR', type: 'BLS', status: 'available', lat: 9.395, lng: -0.872, crew: 'EMT Fatima Al-Hassan', fuel: 83, lastUpdate: '23:12' },
  ],

  emtCases: [
    {
      id: 'CASE-001', ambulance: 'AMB-GA-002', crew: 'EMT Abena Sarpong', type: 'Single',
      mechanism: 'Obstetric Emergency — Premature Labour (28wks)',
      patients: [{
        age: 26, sex: 'F', weight: '62kg', triage: 'Red — Immediate',
        vitals: { bp: '90/60', hr: 118, spo2: 94, rr: 22, temp: 38.2, gcs: 15 },
        interventions: ['O2 15L/min face mask', 'IV access x2', '500ml NS running', 'Foetal monitoring initiated']
      }],
      destination: 'Korle Bu NICU', preAlertSent: true, eta: 8, status: 'en-route'
    },
    {
      id: 'CASE-002', ambulance: 'AMB-GA-003', crew: 'EMT Kwame Opoku', type: 'MCI',
      mechanism: 'Road Traffic Accident — Multiple Vehicle Collision',
      patients: [
        {
          age: 34, sex: 'M', weight: '80kg', triage: 'Red — Immediate',
          vitals: { bp: '84/50', hr: 132, spo2: 88, rr: 28, temp: 36.1, gcs: 8 },
          interventions: ['C-spine immo.', 'BVM 15L/min', 'IV x2 — 1L NS bolus', 'Pelvic binder']
        },
        {
          age: 29, sex: 'F', triage: 'Yellow — Delayed',
          vitals: { bp: '110/70', hr: 98, spo2: 96, rr: 20, temp: 36.8, gcs: 14 },
          interventions: ['Arm splint', 'Analgesia IM', 'IV access']
        },
        {
          age: 45, sex: 'M', triage: 'Green — Minor',
          vitals: { bp: '130/80', hr: 88, spo2: 99, rr: 16, temp: 37.0, gcs: 15 },
          interventions: ['Wound dressing', 'Reassurance']
        }
      ],
      destination: 'Pending — Waiting for Command Coordination', preAlertSent: false, status: 'on-scene'
    },
  ],

  vitalsMonitor: [
    { patientId: 'PT-ICU-001', name: 'Anon M/38', bed: 'ICU-B3', facility: 'KBU', vitals: { ecg: 'SR 88bpm', bp: '118/74', hr: 88, spo2: 98, rr: 14, temp: 37.1, etco2: 36, icp: 12 }, alerts: [], status: 'stable' },
    { patientId: 'PT-ICU-002', name: 'Anon F/52', bed: 'ICU-B7', facility: 'KBU', vitals: { ecg: 'AF 110bpm', bp: '84/52', hr: 110, spo2: 91, rr: 24, temp: 38.7, etco2: 42, icp: null }, alerts: ['Low SpO2', 'Hypotension', 'Tachycardia'], status: 'critical' },
    { patientId: 'PT-ICU-003', name: 'Anon M/19', bed: 'ICU-B12', facility: 'KBU', vitals: { ecg: 'SR 72bpm', bp: '128/82', hr: 72, spo2: 99, rr: 12, temp: 36.9, etco2: 35, icp: 8 }, alerts: [], status: 'stable' },
    { patientId: 'PT-ICU-004', name: 'Anon F/67', bed: 'HDU-A2', facility: 'KBU', vitals: { ecg: 'ST elevation', bp: '162/98', hr: 105, spo2: 95, rr: 20, temp: 37.6, etco2: null, icp: null }, alerts: ['ST Elevation', 'Hypertension'], status: 'warning' },
    { patientId: 'PT-ICU-005', name: 'Anon M/44', bed: 'ICU-B1', facility: 'KAT', vitals: { ecg: 'SR 68bpm', bp: '122/78', hr: 68, spo2: 98, rr: 13, temp: 36.8, etco2: 34, icp: null }, alerts: [], status: 'stable' },
    { patientId: 'PT-ICU-006', name: 'Anon M/7', bed: 'PICU-A1', facility: 'KAT', vitals: { ecg: 'SR 142bpm', bp: '72/44', hr: 142, spo2: 88, rr: 36, temp: 39.8, etco2: null, icp: null }, alerts: ['Hypotension', 'Tachycardia', 'Fever', 'Low SpO2'], status: 'critical' },
  ],

  teleConsults: [
    { id: 'TC-001', specialist: 'Dr. Emmanuel Tetteh', specialty: 'Neurosurgery', facility: 'KBU', requestedBy: 'Dr. Boateng', requestFacility: 'Ridge Hospital', patient: 'M/55 — Subdural Hematoma', status: 'live', startTime: '22:45', duration: '34 min' },
    { id: 'TC-002', specialist: 'Dr. Adwoa Acheampong', specialty: 'Neonatology', facility: 'KBU', requestedBy: 'Midwife Asante', requestFacility: 'Tema General', patient: 'F/26 — Prem Labour 28wks', status: 'waiting', scheduledTime: '23:30' },
    { id: 'TC-003', specialist: 'Dr. Kweku Mensah', specialty: 'Cardiology', facility: 'KAT', requestedBy: 'Dr. Frimpong', requestFacility: 'Techiman Holy Family', patient: 'F/58 — Acute HF', status: 'completed', duration: '18 min' },
    { id: 'TC-004', specialist: 'Dr. Abena Poku', specialty: 'Pediatrics', facility: 'KBU', requestedBy: 'Nurse Adjei', requestFacility: 'Winneba General', patient: 'M/4 — Severe Malaria', status: 'waiting', scheduledTime: '23:45' },
  ],

  equipment: [
    { id: 'EQ-KBU-001', name: 'Siemens SOMATOM CT Scanner', type: 'CT Scanner', facility: 'KBU', dept: 'Radiology', status: 'functional', lastService: '2026-01-15', nextService: '2026-04-15', vendor: 'BioMedica GH Ltd', warranty: '2027-03-01', qr: 'KBUCT001', faults: 0 },
    { id: 'EQ-KBU-002', name: 'Drager Evita Infinity V500 Ventilator', type: 'Ventilator', facility: 'KBU', dept: 'ICU', status: 'faulty', lastService: '2026-01-20', nextService: '2026-04-20', vendor: 'MedEquip Accra', warranty: '2028-06-01', qr: 'KBUV002', faults: 3, faultDesc: 'Flow sensor fault - repair pending 7 days' },
    { id: 'EQ-KBU-003', name: 'Gambro Artis Dialysis Unit', type: 'Dialysis Machine', facility: 'KBU', dept: 'Renal', status: 'functional', lastService: '2026-02-01', nextService: '2026-05-01', vendor: 'Fresenius GH', warranty: '2026-12-15', qr: 'KBUDD003', faults: 0 },
    { id: 'EQ-KBU-004', name: 'Phillips V60 Ventilator (ICU-B4)', type: 'Ventilator', facility: 'KBU', dept: 'ICU', status: 'maintenance', lastService: '2026-02-20', nextService: '2026-05-20', vendor: 'MedEquip Accra', warranty: '2027-09-01', qr: 'KBUV004', faults: 1, faultDesc: 'Annual calibration in progress' },
    { id: 'EQ-KBU-005', name: 'Central Oxygen Plant Unit A', type: 'Oxygen System', facility: 'KBU', dept: 'Infrastructure', status: 'functional', lastService: '2026-02-10', nextService: '2026-03-10', vendor: 'BOC Ghana', warranty: null, qr: 'KBUOX005', pressure: 4.2, faults: 0 },
    { id: 'EQ-KBU-006', name: 'Caterpillar 500kVA Generator', type: 'Generator', facility: 'KBU', dept: 'Engineering', status: 'functional', lastService: '2026-02-01', nextService: '2026-03-01', vendor: 'CAT Ghana', warranty: null, qr: 'KBUGEN006', fuel: 72, faults: 0 },
    { id: 'EQ-KBU-007', name: 'GE Vivid S70 Echo Machine', type: 'Echocardiogram', facility: 'KBU', dept: 'Cardiology', status: 'faulty', lastService: '2025-11-01', nextService: '2026-02-01', vendor: 'GE Healthcare GH', warranty: '2026-06-01', qr: 'KBUECHO007', faults: 2, faultDesc: 'Probe malfunction — awaiting spare part from SA (est. 14 days)' },
    { id: 'EQ-KBU-008', name: 'MRI Siemens Magnetom Aera 1.5T', type: 'MRI', facility: 'KBU', dept: 'Radiology', status: 'functional', lastService: '2025-12-01', nextService: '2026-06-01', vendor: 'Siemens GH', warranty: '2028-01-01', qr: 'KBUMRI008', faults: 0 },
    { id: 'EQ-KAT-001', name: 'Phillips Brilliance iCT Scanner', type: 'CT Scanner', facility: 'KAT', dept: 'Radiology', status: 'functional', lastService: '2026-01-25', nextService: '2026-04-25', vendor: 'Phillips GH', warranty: '2027-05-01', qr: 'KATCT001', faults: 0 },
    { id: 'EQ-KAT-002', name: 'ICU Ventilator (KAT-ICU-V3)', type: 'Ventilator', facility: 'KAT', dept: 'ICU', status: 'functional', lastService: '2026-02-05', nextService: '2026-05-05', vendor: 'BioMedica GH Ltd', warranty: '2027-01-01', qr: 'KATV002', faults: 0 },
    { id: 'EQ-TAM-001', name: 'Varian TrueBeam Radiotherapy (Tamale)', type: 'Radiotherapy', facility: 'TAM', dept: 'Oncology', status: 'oos', lastService: '2024-09-01', nextService: '2025-03-01', vendor: 'Varian Medical (Int)', warranty: '2023-12-01', qr: 'TAMRT001', faults: 5, faultDesc: 'Major overhaul required — Out of service 5 months' },
    { id: 'EQ-RID-001', name: 'Neonatal Incubator #3', type: 'Incubator', facility: 'RID', dept: 'NICU', status: 'faulty', lastService: '2026-01-10', nextService: '2026-04-10', vendor: 'MedEquip Accra', warranty: '2025-06-01', qr: 'RIDNIC001', faults: 1, faultDesc: 'Temperature regulation failure' },
  ],

  faultReports: [
    { id: 'FR-2024-001', equipment: 'EQ-KBU-002', reportedBy: 'Nurse Adjoa Boateng', reportedAt: '2026-02-19T08:30:00Z', description: 'Flow sensor fault — patient lost ventilation briefly, switched to manual', severity: 'critical', status: 'in-progress', engineer: 'Ebenezer Osei-Bonsu', eta: '2026-02-27' },
    { id: 'FR-2024-002', equipment: 'EQ-KBU-007', reportedBy: 'Dr. Samuel Mensah', reportedAt: '2026-02-18T14:00:00Z', description: 'Echo probe not connecting — cannot image patients', severity: 'high', status: 'awaiting-parts', vendor: 'GE Healthcare GH', partETA: '2026-03-10' },
    { id: 'FR-2024-003', equipment: 'EQ-TAM-001', reportedBy: 'Dr. Ama Ofori', reportedAt: '2025-09-15T09:00:00Z', description: 'System failure — all cancer patients in northern region affected', severity: 'critical', status: 'escalated', escalatedTo: 'National Command / MoH' },
    { id: 'FR-2024-004', equipment: 'EQ-RID-001', reportedBy: 'Midwife Efua Asante', reportedAt: '2026-02-24T07:15:00Z', description: 'Incubator temp fluctuating — 2 neonates transferred', severity: 'critical', status: 'in-progress', engineer: 'Kofi Atta' },
  ],

  incidents: [
    { id: 'INC-001', type: 'Mass Casualty', title: 'RTA — Accra-Tema Motorway Pile-up', location: 'Accra-Tema Motorway, KM 12', casualties: 18, critical: 6, region: 'GAR', status: 'active', time: '22:41', ambulances: ['AMB-GA-001', 'AMB-GA-002', 'AMB-GA-004'] },
    { id: 'INC-002', type: 'Obstetric Emergency', title: 'Eclampsia — Nsawam', location: 'Nsawam District Hospital', casualties: 1, critical: 1, region: 'EAS', status: 'in-progress', time: '23:05', ambulances: ['AMB-GA-003'] },
    { id: 'INC-003', type: 'Industrial', title: 'Explosion — Tema Industrial Area', location: 'Community 5 Tema', casualties: 7, critical: 3, region: 'GAR', status: 'contained', time: '21:30', ambulances: ['AMB-GA-005'] },
  ],

  analytics: {
    kpis: {
      avgReferralAcceptMin: 22,
      avgICUWaitHr: 3.4,
      edBoardingPct: 19,
      avgAmbResponseMin: 11,
      refSLAPct: 88,
      icuOccupancyPct: 82,
      declinedRefPct: 8,
      ventutilPct: 74,
    },
    facilityScores: [
      { facility: 'Korle Bu Teaching Hospital', sla: 78, resp: 11, icuOcc: 86, boarding: 22, refRate: 67, declineRate: 12, score: 61 },
      { facility: 'Ridge Hospital', sla: 91, resp: 9, icuOcc: 62, boarding: 14, refRate: 45, declineRate: 3, score: 84 },
      { facility: '37 Military Hospital', sla: 95, resp: 7, icuOcc: 58, boarding: 8, refRate: 32, declineRate: 2, score: 91 },
      { facility: 'Komfo Anokye TH', sla: 85, resp: 13, icuOcc: 71, boarding: 17, refRate: 55, declineRate: 6, score: 74 },
      { facility: 'Cape Coast TH', sla: 93, resp: 8, icuOcc: 42, boarding: 6, refRate: 28, declineRate: 2, score: 93 },
      { facility: 'Tamale TH', sla: 82, resp: 16, icuOcc: 79, boarding: 20, refRate: 61, declineRate: 9, score: 66 },
      { facility: 'Tema General', sla: 74, resp: 12, icuOcc: 90, boarding: 25, refRate: 70, declineRate: 14, score: 54 },
    ],
    acceptanceTimes: {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
      data: [18.2, 16.5, 14.8, 15.3, 13.9, 12.4, 13.1, 14.2, 11.8, 12.6, 10.9, 9.8]
    },
    refusalReasons: {
      labels: ['No ICU Bed', 'No Staff Cover', 'Equipment Down', 'No Oxygen', 'No Specialist', 'Theatre Full', 'Other'],
      data: [34, 22, 18, 10, 8, 5, 3]
    },
    edBoardingByFacility: {
      labels: ['Korle Bu', 'Ridge', '37 Military', 'Tema General', 'La General'],
      avg: [9.2, 5.4, 3.8, 7.6, 4.1],
      over6h: [42, 18, 6, 27, 12]
    },
    icuWait: {
      labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5', 'Week 6', 'Week 7', 'Week 8'],
      kbu: [8.1, 7.4, 9.2, 11.3, 8.7, 10.1, 9.8, 8.4],
      kat: [4.2, 3.8, 4.5, 5.1, 4.0, 3.7, 4.3, 4.8]
    },
    ambulanceResponse: {
      labels: ['Q1 2025', 'Q2 2025', 'Q3 2025', 'Q4 2025', 'Q1 2026'],
      data: [22.4, 19.8, 18.3, 17.1, 15.6]
    },
    regionalICUOccupancy: {
      labels: ['Greater Accra', 'Ashanti', 'Western', 'Central', 'Eastern', 'Northern', 'Volta'],
      data: [88, 65, 72, 42, 58, 68, 38]
    }
  },

  notifications: [
    { type: 'critical', title: 'ICU Capacity Alert', desc: 'Korle Bu ICU at 85% — 4 beds remaining', time: '2 min ago' },
    { type: 'critical', title: 'SLA Breach Imminent', desc: 'REF-2024-002 — NICU referral approaching SLA limit', time: '4 min ago' },
    { type: 'warning', title: 'Equipment Fault', desc: 'KBU Ventilator EQ-KBU-002 still awaiting repair — Day 7', time: '12 min ago' },
    { type: 'info', title: 'Transfer Confirmed', desc: 'REF-2024-003 patient en-route to Korle Bu — ETA 12 mins', time: '18 min ago' },
    { type: 'warning', title: 'Ambulance Offline', desc: 'AMB-GA-006 offline for maintenance — fleet reduced', time: '2h ago' },
    { type: 'critical', title: 'Mass Casualty Alert', desc: 'Accra-Tema Motorway pile-up — 18 casualties reported', time: '39 min ago' },
  ],

  clinicalRegistries: {
    trauma: [
      { id: 'TR-001', patient: 'M/34', date: '25 Feb', mechanism: 'RTA', rts: 5.49, facility: 'KBU', outcome: 'Admitted-ICU', status: 'active' },
      { id: 'TR-002', patient: 'M/22', date: '24 Feb', mechanism: 'Assault', rts: 7.84, facility: 'MIL', outcome: 'Admitted-Ward', status: 'stable' },
      { id: 'TR-003', patient: 'F/45', date: '24 Feb', mechanism: 'Fall from height', rts: 6.12, facility: 'KBU', outcome: 'Theatre', status: 'active' },
    ],
    stroke: [
      { id: 'STR-001', patient: 'M/68', date: '25 Feb', type: 'Ischaemic', nihss: 14, doorToNeedle: 68, facility: 'KBU', outcome: 'Thrombolysis given', status: 'stable' },
      { id: 'STR-002', patient: 'F/59', date: '25 Feb', type: 'Haemorrhagic', nihss: 21, gcs: 9, facility: 'RID', outcome: 'Referred to KBU Neuro', status: 'critical' },
    ],
    maternal: [
      { id: 'MAT-001', patient: 'F/26', date: '25 Feb', condition: 'Eclampsia', ga: '34wks', facility: 'KBU', outcome: 'Admitted-HDU', status: 'stable' },
      { id: 'MAT-002', patient: 'F/19', date: '25 Feb', condition: 'PPH', ga: 'Delivered 38wks', facility: 'RID', outcome: 'Blood tx 4 units, Theatre', status: 'active' },
      { id: 'MAT-003', patient: 'F/31', date: '25 Feb', condition: 'Prem Labour 28wks', ga: '28wks', facility: 'En-route to KBU', outcome: 'NICU activation', status: 'en-route' },
    ],
  },
  users: [
    // National Command
    { id: 'U001', name: 'Dr. Kweku Mensah', initials: 'KM', role: 'national_command', facility: null, facilityId: null, region: null, unit: null, pin: '1234', email: 'k.mensah@nechis.gov.gh', phone: '+233-24-411-0023', status: 'active', lastLogin: '25 Feb 23:15' },
    { id: 'U002', name: 'Samuel Acheampong', initials: 'SA', role: 'analytics_officer', facility: 'GHS Headquarters', facilityId: null, region: null, unit: null, pin: '2345', email: 's.acheampong@ghs.gov.gh', phone: '+233-24-411-0024', status: 'active', lastLogin: '25 Feb 22:00' },

    // Regional Directors
    { id: 'U003', name: 'Dr. Ama Asante', initials: 'AA', role: 'regional_director', facility: 'GAR Health Directorate', facilityId: null, region: 'GAR', unit: null, pin: '3456', email: 'a.asante@ghs.gov.gh', phone: '+233-24-411-0025', status: 'active', lastLogin: '25 Feb 12:05' },
    { id: 'U004', name: 'Dr. Yaw Frimpong', initials: 'YF', role: 'regional_director', facility: 'ASH Health Directorate', facilityId: null, region: 'ASH', unit: null, pin: '4567', email: 'y.frimpong@ghs.gov.gh', phone: '+233-24-411-0026', status: 'active', lastLogin: '24 Feb 18:00' },

    // Hospital Admins / HECU Commanders
    { id: 'U005', name: 'Dr. Kofi Darko', initials: 'KD', role: 'hecu_commander', facility: 'Korle Bu Teaching Hospital', facilityId: 'KBU', region: 'GAR', unit: null, pin: '5678', email: 'k.darko@kbth.gov.gh', phone: '+233-24-411-0027', status: 'active', lastLogin: '25 Feb 20:44' },
    { id: 'U006', name: 'Dr. Adwoa Acheampong', initials: 'AC', role: 'hecu_commander', facility: 'Komfo Anokye Teaching Hospital', facilityId: 'KAT', region: 'ASH', unit: null, pin: '6789', email: 'a.acheampong@kath.gov.gh', phone: '+233-24-411-0028', status: 'active', lastLogin: '25 Feb 19:30' },

    // Nurses & Bed Managers
    { id: 'U007', name: 'Nurse Abena Poku', initials: 'AP', role: 'nurse', facility: 'Korle Bu Teaching Hospital', facilityId: 'KBU', region: 'GAR', unit: 'ICU', pin: '7890', email: 'a.poku@kbth.gov.gh', phone: '+233-24-411-0029', status: 'active', lastLogin: '25 Feb 09:18' },
    { id: 'U008', name: 'Dr. Kwame Tetteh', initials: 'KT', role: 'bed_manager', facility: 'Ridge Hospital', facilityId: 'RID', region: 'GAR', unit: 'ED', pin: '8901', email: 'k.tetteh@ridge.gov.gh', phone: '+233-24-411-0030', status: 'active', lastLogin: '24 Feb 14:20' },

    // EMT Dispatchers
    { id: 'U009', name: 'Patrick Bonsu', initials: 'PB', role: 'emt_dispatcher', facility: 'GNEMS Accra', facilityId: null, region: 'GAR', unit: null, pin: '9012', email: 'p.bonsu@gnems.gov.gh', phone: '+233-24-411-0031', status: 'active', lastLogin: '25 Feb 07:30' },
    { id: 'U010', name: 'Efua Sarfo', initials: 'ES', role: 'emt_dispatcher', facility: 'GNEMS Ashanti', facilityId: null, region: 'ASH', unit: null, pin: '0123', email: 'e.sarfo@gnems.gov.gh', phone: '+233-24-411-0032', status: 'active', lastLogin: '25 Feb 06:00' },

    // Clinicians
    { id: 'U011', name: 'Dr. Yaa Boateng', initials: 'YB', role: 'clinician', facility: 'Ridge Hospital', facilityId: 'RID', region: 'GAR', unit: 'ED', pin: '1357', email: 'y.boateng@ridge.gov.gh', phone: '+233-24-411-0033', status: 'active', lastLogin: '25 Feb 08:55' },
    { id: 'U012', name: 'Dr. Samuel Owusu', initials: 'SO', role: 'clinician', facility: 'Korle Bu Teaching Hospital', facilityId: 'KBU', region: 'GAR', unit: 'ICU', pin: '2468', email: 's.owusu@kbth.gov.gh', phone: '+233-24-411-0034', status: 'active', lastLogin: '25 Feb 21:00' },

    // Equipment Officers
    { id: 'U013', name: 'Ebenezer Osei-Bonsu', initials: 'EO', role: 'equipment_officer', facility: 'Korle Bu Teaching Hospital', facilityId: 'KBU', region: 'GAR', unit: 'Biomedical', pin: '3691', email: 'e.osei@kbth.gov.gh', phone: '+233-24-411-0035', status: 'active', lastLogin: '25 Feb 08:00' },

    // Public
    { id: 'U014', name: 'Public Access', initials: 'PU', role: 'public', facility: null, facilityId: null, region: null, unit: null, pin: '0000', email: null, phone: null, status: 'active', lastLogin: null },
  ],

  roleConfig: {
    national_command: { label: 'National Command', defaultPage: 'dashboard', scope: 'national', color: '#00d4aa' },
    analytics_officer: { label: 'Analytics Officer', defaultPage: 'analytics', scope: 'national', color: '#3b82f6' },
    regional_director: { label: 'Regional Director', defaultPage: 'dashboard', scope: 'regional', color: '#8b5cf6' },
    hecu_commander: { label: 'HECU Commander', defaultPage: 'hecu', scope: 'facility', color: '#f59e0b' },
    bed_manager: { label: 'Bed Manager', defaultPage: 'beds', scope: 'unit', color: '#0ea5e9' },
    nurse: { label: 'Nurse', defaultPage: 'nursing', scope: 'unit', color: '#22c55e' },
    emt_dispatcher: { label: 'EMT Dispatcher', defaultPage: 'emt', scope: 'regional', color: '#ff3b3b' },
    clinician: { label: 'Clinician', defaultPage: 'vitals', scope: 'facility', color: '#ec4899' },
    equipment_officer: { label: 'Equipment Officer', defaultPage: 'equipment', scope: 'facility', color: '#fb923c' },
    public: { label: 'Public', defaultPage: 'public', scope: 'public', color: '#64748b' },
  },

  roleNav: {
    national_command: ['dashboard', 'beds', 'surge', 'referral', 'emt', 'vitals', 'telemedicine', 'hecu', 'equipment', 'analytics', 'governance', 'nursing', 'integrations', 'public', 'settings'],
    analytics_officer: ['analytics', 'governance', 'integrations', 'public'],
    regional_director: ['dashboard', 'beds', 'surge', 'referral', 'emt', 'vitals', 'telemedicine', 'hecu', 'equipment', 'analytics', 'governance', 'public'],
    hecu_commander: ['beds', 'referral', 'vitals', 'telemedicine', 'hecu', 'equipment', 'governance', 'public'],
    bed_manager: ['beds', 'referral', 'hecu', 'public'],
    nurse: ['nursing', 'beds', 'referral', 'public'],
    emt_dispatcher: ['referral', 'emt', 'public'],
    clinician: ['referral', 'nursing', 'vitals', 'telemedicine', 'governance', 'public'],
    equipment_officer: ['equipment', 'public'],
    public: ['public'],
  },
};

// Generate ECG-like waveform data
function generateECGData(points = 150) {
  const data = [];
  for (let i = 0; i < points; i++) {
    const t = (i / points) * 6 * Math.PI;
    const qrs = Math.abs(Math.sin(t * 3)) > 0.98 ? Math.sin(t * 3) * 8 : Math.sin(t * 0.5) * 0.3;
    const noise = (Math.random() - 0.5) * 0.15;
    data.push(qrs + noise);
  }
  return data;
}

window.NDATA = NECHIS_DATA;
window.generateECGData = generateECGData;
