// ================================================================
// Module: Nursing — MAR, Care Plans, SBAR, Fluid Balance, Wound Care
// Roles: bed_manager, clinician, hecu_commander
// ================================================================
const _NursingState = {
  activePatient: null,
  mar: {},       // patient_id -> med admin records
  io: {},        // fluid input/output
  wounds: {},
  tab: 'mar',
};

function renderNursing(container) {
  const user = Auth.getUser();
  const ward = user.unit || 'ICU';

  container.innerHTML = `
    <div class="page-header">
      <div class="page-header-left">
        <h1>Patient Care Workspace</h1>
        <p>Nursing & Clinician documentation — ${ward} Ward</p>
      </div>
      <div class="page-header-actions">
        <button class="btn btn-ghost" onclick="openModal('SBAR Handover Builder', buildSBARModal())">📋 SBAR Handover</button>
        <button class="btn btn-primary" onclick="openModal('Quick Medication Admin', quickMarModal())">
          💊 Quick MAR Entry
        </button>
      </div>
    </div>

    <!-- Patient selector row -->
    <div class="card mb-16" style="padding:14px 16px;">
      <div style="display:flex;align-items:center;gap:16px;flex-wrap:wrap;">
        <div style="font-size:12px;font-weight:700;color:var(--text-muted);">ACTIVE PATIENT</div>
        <div style="display:flex;gap:8px;flex-wrap:wrap;">
          ${[
      { id: 'P001', name: 'Abena Korantema', age: 42, diag: 'Post-op laparotomy', room: 'ICU-3', risk: 'high' },
      { id: 'P002', name: 'Kofi Asomani', age: 68, diag: 'T2DM — hyperglycaemia', room: 'ICU-5', risk: 'medium' },
      { id: 'P003', name: 'Ama Agyapong', age: 29, diag: 'Eclampsia — post-delivery', room: 'HDU-1', risk: 'high' },
      { id: 'P004', name: 'Joseph Mensah', age: 55, diag: 'COPD exacerbation', room: 'Ward-B2', risk: 'low' },
    ].map(p => `
            <button onclick="selectNursePatient('${p.id}','${p.name}','${p.diag}','${p.room}')"
              id="npt-${p.id}" class="btn btn-ghost" style="font-size:11px;padding:6px 12px;border-left:3px solid ${p.risk === 'high' ? 'var(--red)' : p.risk === 'medium' ? 'var(--amber)' : 'var(--green)'};">
              ${p.name}<br><span style="color:var(--text-muted);">${p.room}</span>
            </button>`).join('')}
        </div>
        <div id="np-selected" style="margin-left:auto;font-size:12px;color:var(--text-muted);">← Select a patient</div>
      </div>
    </div>

    <!-- Module Tabs -->
    <div class="hide-scrollbar" style="display:flex;gap:4px;margin-bottom:16px;border-bottom:1px solid var(--border);padding-bottom:8px;overflow-x:auto;white-space:nowrap;">
      <button onclick="showNurseTab('mar')" id="ntab-mar" class="notif-tab active">💊 MAR</button>
      <button onclick="showNurseTab('careplan')" id="ntab-careplan" class="notif-tab">📋 Care Plan</button>
      <button onclick="showNurseTab('fluids')" id="ntab-fluids" class="notif-tab">💧 Fluid Balance</button>
      <button onclick="showNurseTab('wounds')" id="ntab-wounds" class="notif-tab">🩹 Wound Care</button>
      <button onclick="showNurseTab('checklist')" id="ntab-checklist" class="notif-tab">☑ Checklists</button>
      <button onclick="showNurseTab('nhis')" id="ntab-nhis" class="notif-tab">🏥 NHIS Check</button>
      
      <div style="min-width:1px;background:var(--border);margin:0 4px;"></div>
      
      <button onclick="showNurseTab('notes')" id="ntab-notes" class="notif-tab" style="background:var(--accent-dim);color:var(--accent);border-color:rgba(0,212,170,0.3);">📝 SOAP Notes</button>
      <button onclick="showNurseTab('rx')" id="ntab-rx" class="notif-tab" style="background:var(--accent-dim);color:var(--accent);border-color:rgba(0,212,170,0.3);">✍ Prescriptions</button>
      <button onclick="showNurseTab('labs')" id="ntab-labs" class="notif-tab" style="background:var(--accent-dim);color:var(--accent);border-color:rgba(0,212,170,0.3);">🔬 Labs</button>
      <button onclick="showNurseTab('imaging')" id="ntab-imaging" class="notif-tab" style="background:var(--accent-dim);color:var(--accent);border-color:rgba(0,212,170,0.3);">🩻 Imaging</button>
      <button onclick="showNurseTab('discharge')" id="ntab-discharge" class="notif-tab" style="background:var(--accent-dim);color:var(--accent);border-color:rgba(0,212,170,0.3);">📄 Discharge</button>
    </div>

    <!-- MAR Tab -->
    <div id="nurse-mar" class="nurse-tab">
      <div class="card mb-12">
        <div class="card-header">
          <span class="card-title">Medication Administration Record — ${new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })}</span>
          <button class="btn btn-ghost" style="font-size:11px;" onclick="openModal('Add Medication Order', addMedOrderModal())">+ Add Order</button>
        </div>
        <div class="table-wrap">
          <table id="mar-table">
            <thead><tr>
              <th>Medication</th><th>Dose</th><th>Route</th><th>Frequency</th>
              <th>06:00</th><th>10:00</th><th>14:00</th><th>18:00</th><th>22:00</th><th>02:00</th>
              <th>Action</th>
            </tr></thead>
            <tbody id="mar-tbody">
              ${defaultMarRows()}
            </tbody>
          </table>
        </div>
      </div>
      <div class="card">
        <div class="card-header"><span class="card-title">Administration Notes & PRN Log</span></div>
        <div style="padding:14px;">
          <textarea class="form-textarea" rows="3" placeholder="PRN medications given, patient refusals, nurse notes..."></textarea>
          <button class="btn btn-primary" onclick="showToast('MAR notes saved', 'success')" style="margin-top:8px;">Save Notes</button>
        </div>
      </div>
    </div>

    <!-- Care Plan Tab -->
    <div id="nurse-careplan" class="nurse-tab" style="display:none;">
      <div class="grid-2 gap-16">
        <div class="card">
          <div class="card-header"><span class="card-title">Active Nursing Diagnoses</span>
            <button class="btn btn-ghost" style="font-size:11px;" onclick="openModal('Add Nursing Diagnosis', addNDxModal())">+ Add</button>
          </div>
          <div style="padding:12px;display:grid;gap:8px;" id="ndx-list">
            ${[
      { dx: 'Acute Pain', rel: 'r/t surgical incision', goal: 'VAS ≤ 3/10 by 18:00', int: 'Morphine 5mg IV q4h PRN; repositioning q2h; cold compress', status: 'in-progress' },
      { dx: 'Impaired Skin Integrity', rel: 'r/t abdominal incision', goal: 'No signs of infection by 48h', int: 'Daily wound check; sterile dressing change BD; report erythema', status: 'in-progress' },
      { dx: 'Risk for DVT', rel: 'r/t immobility post-op', goal: 'No DVT by discharge', int: 'TED stockings; LMWH as ordered; ambulate day 2', status: 'pending' },
    ].map(n => `
              <div style="padding:12px;background:var(--bg-surface);border-radius:var(--radius-sm);border-left:3px solid ${n.status === 'resolved' ? 'var(--green)' : n.status === 'in-progress' ? 'var(--amber)' : 'var(--border)'};">
                <div style="display:flex;justify-content:space-between;margin-bottom:6px;">
                  <span style="font-size:13px;font-weight:700;">${n.dx}</span>
                  <span class="badge ${n.status === 'in-progress' ? 'badge-urgent' : n.status === 'resolved' ? 'badge-available' : 'badge-reserved'}">${n.status}</span>
                </div>
                <div style="font-size:11px;color:var(--text-muted);">${n.rel}</div>
                <div style="font-size:11px;margin-top:6px;"><strong>Goal:</strong> ${n.goal}</div>
                <div style="font-size:11px;"><strong>Interventions:</strong> ${n.int}</div>
              </div>`).join('')}
          </div>
        </div>
        <div class="card">
          <div class="card-header"><span class="card-title">Clinical Decision Support</span></div>
          <div style="padding:14px;display:grid;gap:10px;">
            <div style="padding:10px;border-radius:var(--radius-sm);background:rgba(245,158,11,0.08);border-left:3px solid var(--amber);">
              <div style="font-size:12px;font-weight:700;color:var(--amber);">⚠ Drug Interaction Alert</div>
              <div style="font-size:11px;margin-top:4px;">Metformin + IV Contrast — withhold Metformin 48h before CT with contrast. Resume only if eGFR stable.</div>
            </div>
            <div style="padding:10px;border-radius:var(--radius-sm);background:rgba(34,197,94,0.07);border-left:3px solid var(--green);">
              <div style="font-size:12px;font-weight:700;color:var(--green);">✓ VTE Prophylaxis</div>
              <div style="font-size:11px;margin-top:4px;">Enoxaparin 40mg SC given at 22:00. Next dose: 22:00 tomorrow.</div>
            </div>
            <div style="padding:10px;border-radius:var(--radius-sm);background:rgba(37,99,235,0.07);border-left:3px solid var(--blue);">
              <div style="font-size:12px;font-weight:700;color:var(--blue);">🔁 Pressure Ulcer Prevention</div>
              <div style="font-size:11px;margin-top:4px;">Braden Score: 14 (mild risk). Reposition every 2h. Moisture barrier cream applied.</div>
            </div>
            <div style="padding:10px;border-radius:var(--radius-sm);background:rgba(220,38,38,0.07);border-left:3px solid var(--red);">
              <div style="font-size:12px;font-weight:700;color:var(--red);">🚨 Fall Risk — HIGH</div>
              <div style="font-size:11px;margin-top:4px;">Morse Score: 55. Bed alarm activated. Non-slip socks applied. Side rails up. Call bell within reach.</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Fluid Balance Tab -->
    <div id="nurse-fluids" class="nurse-tab" style="display:none;">
      <div class="grid-2 gap-16">
        <div class="card">
          <div class="card-header"><span class="card-title">Intake (Input)</span></div>
          <div style="padding:14px;">
            <div class="form-grid form-grid-2 mb-12">
              <div class="form-group"><label class="form-label">Route</label>
                <select class="form-select" id="io-route"><option>IV Fluid</option><option>Oral</option><option>NG Tube</option><option>Blood Product</option></select>
              </div>
              <div class="form-group"><label class="form-label">Volume (ml)</label><input type="number" class="form-input" id="io-vol" placeholder="500" /></div>
              <div class="form-group"><label class="form-label">Fluid Type</label><input type="text" class="form-input" id="io-type" placeholder="0.9% NaCl, D5W..." /></div>
              <div class="form-group"><label class="form-label">Time</label><input type="time" class="form-input" id="io-time" value="${new Date().toTimeString().slice(0, 5)}" /></div>
            </div>
            <button class="btn btn-primary" style="width:100%;" onclick="addFluidEntry('in')">+ Record Intake</button>
          </div>
          <div id="intake-list" style="max-height:220px;overflow-y:auto;border-top:1px solid var(--border);padding:8px 14px;">
            ${renderFluidList('in')}
          </div>
        </div>
        <div class="card">
          <div class="card-header"><span class="card-title">Output</span></div>
          <div style="padding:14px;">
            <div class="form-grid form-grid-2 mb-12">
              <div class="form-group"><label class="form-label">Type</label>
                <select class="form-select" id="oo-type"><option>Urine</option><option>Drain</option><option>Vomit</option><option>Blood Loss</option><option>NGT Aspirate</option></select>
              </div>
              <div class="form-group"><label class="form-label">Volume (ml)</label><input type="number" class="form-input" id="oo-vol" placeholder="200" /></div>
              <div class="form-group"><label class="form-label">Appearance</label><input type="text" class="form-input" id="oo-app" placeholder="Clear, blood-stained..." /></div>
              <div class="form-group"><label class="form-label">Time</label><input type="time" class="form-input" id="oo-time" value="${new Date().toTimeString().slice(0, 5)}" /></div>
            </div>
            <button class="btn btn-primary" style="width:100%;" onclick="addFluidEntry('out')">+ Record Output</button>
          </div>
          <div id="output-list" style="max-height:220px;overflow-y:auto;border-top:1px solid var(--border);padding:8px 14px;">
            ${renderFluidList('out')}
          </div>
        </div>
      </div>
      <!-- Balance summary -->
      <div class="card mt-16">
        <div class="card-header"><span class="card-title">24-Hour Balance Summary</span></div>
        <div style="padding:16px;display:flex;gap:32px;align-items:center;">
          <div style="text-align:center;"><div style="font-size:32px;font-weight:900;color:var(--blue);" id="total-in">1,250 ml</div><div style="font-size:12px;color:var(--text-muted);">Total Intake</div></div>
          <div style="font-size:28px;color:var(--text-muted);">−</div>
          <div style="text-align:center;"><div style="font-size:32px;font-weight:900;color:var(--amber);" id="total-out">840 ml</div><div style="font-size:12px;color:var(--text-muted);">Total Output</div></div>
          <div style="font-size:28px;color:var(--text-muted);">=</div>
          <div style="text-align:center;"><div style="font-size:36px;font-weight:900;color:var(--green);" id="balance">+410 ml</div><div style="font-size:12px;color:var(--text-muted);">Net Balance</div></div>
          <div style="margin-left:auto;font-size:12px;color:var(--text-muted);">Target: 30 ml/kg/day<br>Urine output ≥ 0.5 ml/kg/h</div>
        </div>
      </div>
    </div>

    <!-- Wound Care Tab -->
    <div id="nurse-wounds" class="nurse-tab" style="display:none;">
      <div class="card mb-16">
        <div class="card-header"><span class="card-title">Wound Care Tracker</span>
          <button class="btn btn-ghost" onclick="openModal('New Wound Assessment', woundAssessModal())">+ New Wound</button>
        </div>
        <div style="padding:14px;display:grid;gap:12px;" id="wound-list">
          ${[
      { id: 'W1', site: 'Abdominal — midline incision (12cm)', last: '06:00', dressing: 'Mepore', next: '18:00', status: 'healing', notes: 'No erythema, minimal serous exudate, sutures intact' },
      { id: 'W2', site: 'Right heel — pressure injury Stage II', last: '08:00', dressing: 'Mepilex Border', next: 'PRN', status: 'at-risk', notes: '3cm × 2cm, blister intact, slight warmth surrounding tissue' },
    ].map(w => `
            <div style="padding:14px;background:var(--bg-surface);border-radius:var(--radius-sm);border-left:3px solid ${w.status === 'healing' ? 'var(--green)' : 'var(--amber)'};">
              <div style="display:flex;justify-content:space-between;margin-bottom:8px;">
                <span style="font-weight:700;font-size:13px;">${w.site}</span>
                <span class="badge ${w.status === 'healing' ? 'badge-available' : 'badge-urgent'}">${w.status}</span>
              </div>
              <div class="grid-4 gap-8" style="font-size:11px;margin-bottom:8px;">
                <div><span style="color:var(--text-muted);">Dressing</span><br><strong>${w.dressing}</strong></div>
                <div><span style="color:var(--text-muted);">Last change</span><br><strong>${w.last}</strong></div>
                <div><span style="color:var(--text-muted);">Next due</span><br><strong>${w.next}</strong></div>
              </div>
              <div style="font-size:11px;color:var(--text-muted);">${w.notes}</div>
              <div style="margin-top:8px;display:flex;gap:8px;">
                <button class="btn btn-ghost" style="font-size:11px;" onclick="showToast('Dressing change recorded','success')">✓ Dressing Done</button>
                <button class="btn btn-ghost" style="font-size:11px;" onclick="openModal('Wound Assessment', woundAssessModal('${w.id}'))">Reassess</button>
              </div>
            </div>`).join('')}
        </div>
      </div>
    </div>

    <!-- Checklists Tab -->
    <div id="nurse-checklist" class="nurse-tab" style="display:none;">
      <div class="grid-3 gap-16">
        ${[
      { title: '📥 Admission Checklist', items: ['Patient ID & wristband verified', 'NHIS/Ghana card checked', 'Allergy assessment done', 'Vital signs documented', 'Weight & height recorded', 'Consent forms signed', 'Valuables documented', 'Family contact confirmed', 'Medication reconciliation done', 'Risk assessments: Falls, VTE, Braden complete'] },
      { title: '🔄 Shift Handover Checklist', items: ['SBAR completed for each patient', 'Outstanding tasks communicated', 'Critical labs/results reviewed', 'Pending medications flagged', 'Equipment checks done', 'Call bells within reach', 'Incident forms completed if applicable', 'Controlled drug count verified'] },
      { title: '📤 Discharge Checklist', items: ['D/C summary ready', 'Patient education given', 'Medications explained (TTO)', 'Follow-up appointment booked', 'Community nurse referral if needed', 'NHIS claim submitted', 'D/C vitals recorded', 'Patient transport arranged', 'Bed sanitised and restocked'] },
    ].map(cl => `
          <div class="card">
            <div class="card-header"><span class="card-title">${cl.title}</span></div>
            <div style="padding:12px;display:grid;gap:6px;">
              ${cl.items.map((item, i) => `
                <label style="display:flex;align-items:flex-start;gap:8px;cursor:pointer;font-size:12px;padding:4px;">
                  <input type="checkbox" id="chk-${cl.title.replace(/\W/g, '')}-${i}" style="margin-top:2px;" onchange="this.parentElement.style.opacity=this.checked?'0.5':'1';" />
                  ${item}
                </label>`).join('')}
              <button class="btn btn-ghost" style="width:100%;margin-top:8px;font-size:11px;" onclick="markAllChecklist(this)">✓ Mark All Complete</button>
            </div>
          </div>`).join('')}
      </div>
    </div>

    <!-- NHIS Verify Tab (quick lookup from nursing) -->
    <div id="nurse-nhis" class="nurse-tab" style="display:none;">
      <div class="grid-2 gap-16">
        <div class="card">
          <div class="card-header"><span class="card-title">Quick NHIS/Ghana Card Lookup</span></div>
          <div style="padding:16px;">
            <div class="form-group mb-12">
              <label class="form-label">NHIS ID</label>
              <div style="display:flex;gap:8px;">
                <input id="nurse-nhis-id" type="text" class="form-input" placeholder="AA202500031G" style="font-family:monospace;" />
                <button class="btn btn-primary" onclick="nurseVerifyNhis()">Verify</button>
              </div>
            </div>
            <div class="form-group mb-0">
              <label class="form-label">Ghana Card Number</label>
              <div style="display:flex;gap:8px;">
                <input id="nurse-ghana-id" type="text" class="form-input" placeholder="GHA-123456789-1" style="font-family:monospace;" />
                <button class="btn btn-ghost" onclick="nurseVerifyGhana()">Lookup</button>
              </div>
            </div>
          </div>
        </div>
        <div class="card" id="nurse-integ-result">
          <div class="card-header"><span class="card-title">Lookup Result</span></div>
          <div style="padding:16px;color:var(--text-muted);font-size:13px;">Enter an NHIS ID or Ghana Card number and click Verify/Lookup</div>
        </div>
      </div>
    </div>
    <!-- Clinical Notes (SOAP) Tab -->
    <div id="nurse-notes" class="nurse-tab" style="display:none;">
      <div class="grid-2 gap-16">
        <div class="card">
          <div class="card-header"><span class="card-title">New SOAP Note</span></div>
          <div style="padding:16px;">
            <div class="form-group mb-12"><label class="form-label" style="color:var(--accent);">S — Subjective</label><textarea class="form-textarea" rows="2" placeholder="Patient's complaints, history of present illness..."></textarea></div>
            <div class="form-group mb-12"><label class="form-label" style="color:var(--blue);">O — Objective</label><textarea class="form-textarea" rows="2" placeholder="Vitals, physical exam findings, lab/imaging summaries..."></textarea></div>
            <div class="form-group mb-12"><label class="form-label" style="color:var(--amber);">A — Assessment</label><textarea class="form-textarea" rows="2" placeholder="Diagnosis, differential diagnosis, clinical reasoning..."></textarea></div>
            <div class="form-group mb-16"><label class="form-label" style="color:var(--green);">P — Plan</label><textarea class="form-textarea" rows="3" placeholder="Treatment plan, medications, further investigations, referrals..."></textarea></div>
            <button class="btn btn-primary w-full" onclick="showToast('SOAP Note signed & saved to patient record','success')">Sign & Save Note</button>
          </div>
        </div>
        <div class="card">
          <div class="card-header"><span class="card-title">Previous Notes</span>
             <select class="form-select" style="width: auto; padding: 4px; font-size: 11px;"><option>All Notes</option><option>Doctor Notes</option><option>Nursing Notes</option></select>
          </div>
          <div style="padding:14px;display:grid;gap:12px;max-height:600px;overflow-y:auto;">
            <div style="padding:12px;background:var(--bg-surface);border-radius:var(--radius-sm);border-left:3px solid var(--accent);">
              <div style="display:flex;justify-content:space-between;margin-bottom:8px;font-size:11px;color:var(--text-muted);">
                <span><strong style="color:var(--text-primary);">Dr. Kweku Mensah (Cardiology)</strong></span>
                <span>Yesterday, 14:30</span>
              </div>
              <div style="font-size:12px;margin-bottom:4px;"><strong style="color:var(--text-secondary);">S:</strong> Chest pain resolved. SOB improved.</div>
              <div style="font-size:12px;margin-bottom:4px;"><strong style="color:var(--text-secondary);">O:</strong> BP 120/80. HR 78. Lungs clear to auscultation bilaterally.</div>
              <div style="font-size:12px;margin-bottom:4px;"><strong style="color:var(--text-secondary);">A:</strong> Resolving NSTEMI. Heart failure clinically stable.</div>
              <div style="font-size:12px;"><strong style="color:var(--text-secondary);">P:</strong> Cont. current meds. Step down to general ward tomorrow.</div>
            </div>
            
            <div style="padding:12px;background:var(--bg-surface);border-radius:var(--radius-sm);border-left:3px solid var(--blue);">
              <div style="display:flex;justify-content:space-between;margin-bottom:8px;font-size:11px;color:var(--text-muted);">
                <span><strong style="color:var(--text-primary);">Nurse Abena Poku</strong></span>
                <span>Yesterday, 10:00</span>
              </div>
              <div style="font-size:12px;"><strong style="color:var(--text-secondary);">Note:</strong> Patient washed and dressed. Tolerated breakfast well. Cannula site in left arm red and inflamed, removed and re-sited in right arm. Dr. Mensah informed.</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Prescriptions Tab -->
    <div id="nurse-rx" class="nurse-tab" style="display:none;">
      <div class="card mb-16">
        <div class="card-header"><span class="card-title">New Prescription / Medication Order</span></div>
        <div style="padding:16px;">
          <div class="grid-4 gap-12 mb-12">
            <div class="form-group" style="grid-column:span 2"><label class="form-label">Medication (Search formulary)</label>
              <input type="text" class="form-input" placeholder="e.g. Amoxicillin..." oninput="this.value='Amoxicillin/Clavulanate (Augmentin)'" />
            </div>
            <div class="form-group"><label class="form-label">Dose</label><input type="text" class="form-input" placeholder="e.g. 1g" /></div>
            <div class="form-group"><label class="form-label">Route</label><select class="form-select"><option>Oral (PO)</option><option>IV</option><option>IM</option><option>SC</option><option>Topical</option></select></div>
            <div class="form-group"><label class="form-label">Frequency</label><select class="form-select"><option>BD (Twice daily)</option><option>OD (Once daily)</option><option>TDS (Thrice daily)</option><option>QDS (Four times daily)</option><option>STAT</option><option>PRN</option></select></div>
            <div class="form-group"><label class="form-label">Duration (Days)</label><input type="number" class="form-input" placeholder="5" value="5" /></div>
            <div class="form-group" style="grid-column:span 2"><label class="form-label">Dispensing Instructions / Indications</label><input type="text" class="form-input" placeholder="e.g. Take with meals..." /></div>
          </div>
          <button class="btn btn-primary" onclick="showToast('Prescription signed and sent to Pharmacy. Added to MAR.','success')">Sign Prescription & Send to Pharmacy</button>
        </div>
      </div>
      
      <div class="card">
         <div class="card-header"><span class="card-title">Active Prescriptions / Dispense Status</span></div>
         <div class="table-wrap">
           <table>
             <thead><tr><th>Date Written</th><th>Medication</th><th>Dose/Route/Freq</th><th>Duration</th><th>Prescriber</th><th>Pharmacy Status</th></tr></thead>
             <tbody>
               <tr><td>Today, 09:12</td><td>Amoxicillin/Clavulanate</td><td>1g PO BD</td><td>7 days</td><td>Dr. Asante</td><td><span class="badge badge-urgent">Pending Approval</span></td></tr>
               <tr><td>Yesterday, 11:45</td><td>Lisinopril</td><td>10mg PO OD</td><td>30 days</td><td>Dr. Mensah</td><td><span class="badge badge-available">Dispensed</span></td></tr>
               <tr><td>Yesterday, 11:45</td><td>Paracetamol</td><td>1g PO TDS</td><td>5 days</td><td>Dr. Mensah</td><td><span class="badge badge-available">Dispensed</span></td></tr>
             </tbody>
           </table>
         </div>
      </div>
    </div>

    <!-- Lab Results Tab -->
    <div id="nurse-labs" class="nurse-tab" style="display:none;">
      <div class="grid-3 gap-16">
        <div class="card" style="grid-column:span 1;">
          <div class="card-header"><span class="card-title">Recent Panels</span>
             <button class="btn btn-ghost" style="font-size:11px;" onclick="showToast('Lab request form opened','info')">+ Order Labs</button>
          </div>
          <div style="padding:12px;display:flex;flex-direction:column;gap:8px;">
            <button class="btn btn-ghost" style="text-align:left;padding:10px;background:var(--bg-surface);border-left:3px solid var(--red);">
              <div style="font-size:13px;font-weight:700;">Complete Blood Count (CBC)</div>
              <div style="font-size:11px;color:var(--text-muted);">Today, 08:30 • 🚨 Abnormal</div>
            </button>
            <button class="btn btn-ghost" style="text-align:left;padding:10px;background:var(--bg-surface);border-left:3px solid var(--green);">
              <div style="font-size:13px;font-weight:700;">Renal Function Test (RFT)</div>
              <div style="font-size:11px;color:var(--text-muted);">Yesterday, 14:00 • Normal</div>
            </button>
            <button class="btn btn-ghost" style="text-align:left;padding:10px;background:var(--bg-surface);border-left:3px solid var(--green);">
              <div style="font-size:13px;font-weight:700;">Liver Function Test (LFT)</div>
              <div style="font-size:11px;color:var(--text-muted);">Yesterday, 14:00 • Normal</div>
            </button>
          </div>
        </div>
        <div class="card" style="grid-column:span 2;">
          <div class="card-header"><span class="card-title">CBC Results (Collected: Today, 08:30)</span></div>
          <div class="table-wrap">
            <table>
              <thead>
                <tr><th>Analyte</th><th>Result</th><th>Flag</th><th>Reference Range</th><th>Units</th></tr>
              </thead>
              <tbody>
                <tr><td>White Blood Cells (WBC)</td><td><strong>14.5</strong></td><td><span style="color:var(--red);font-weight:900;">↑ HIGH</span></td><td>4.0 - 11.0</td><td>x10^9/L</td></tr>
                <tr><td>Hemoglobin (Hb)</td><td><strong>9.2</strong></td><td><span style="color:var(--red);font-weight:900;">↓ LOW</span></td><td>13.0 - 17.0</td><td>g/dL</td></tr>
                <tr><td>Hematocrit (Hct)</td><td><strong>30.1</strong></td><td><span style="color:var(--red);font-weight:900;">↓ LOW</span></td><td>38.0 - 50.0</td><td>%</td></tr>
                <tr><td>MCV</td><td><strong>82</strong></td><td><span style="color:var(--green);">Normal</span></td><td>80 - 100</td><td>fL</td></tr>
                <tr><td>Platelets</td><td><strong>210</strong></td><td><span style="color:var(--green);">Normal</span></td><td>150 - 450</td><td>x10^9/L</td></tr>
              </tbody>
            </table>
          </div>
          <div style="padding:14px;background:rgba(220,38,38,0.05);border-top:1px solid var(--border);">
            <div style="font-size:12px;font-weight:700;color:var(--red);margin-bottom:4px;">Pathologist Comment:</div>
            <div style="font-size:12px;">Normocytic, normochromic anemia with moderate leukocytosis. Suggests acute infection/inflammation vs acute blood loss.</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Imaging Tab -->
    <div id="nurse-imaging" class="nurse-tab" style="display:none;">
      <div class="grid-2 gap-16">
        <div class="card">
          <div class="card-header"><span class="card-title">New Imaging Request</span></div>
          <div style="padding:16px;">
            <div class="form-group mb-12"><label class="form-label">Modality</label>
              <select class="form-select"><option>X-Ray</option><option>CT Scan</option><option>MRI</option><option>Ultrasound</option></select>
            </div>
            <div class="form-group mb-12"><label class="form-label">Body Part / Protocol</label>
              <input type="text" class="form-input" placeholder="e.g. Chest PA, CT Head plain..." />
            </div>
            <div class="form-group mb-12"><label class="form-label">Clinical Indication (Why?)</label>
              <textarea class="form-textarea" rows="2" placeholder="e.g. Cough x 2 weeks, suspect consolidation..."></textarea>
            </div>
            <div class="form-grid form-grid-2 mb-16">
              <div class="form-group"><label class="form-label">Urgency</label><select class="form-select"><option>Routine</option><option>STAT (Immediate)</option><option>Urgent (< 2 hours)</option></select></div>
              <div class="form-group"><label class="form-label">Patient Transport</label><select class="form-select"><option>Wheelchair</option><option>Stretcher / Bed</option><option>Ambulant</option></select></div>
            </div>
            <button class="btn btn-primary w-full" onclick="showToast('Imaging request sent to Radiology Queue','success')">Submit Request to Radiology</button>
          </div>
        </div>
        <div class="card">
          <div class="card-header"><span class="card-title">Imaging History & Reports</span></div>
          <div style="padding:14px;display:grid;gap:12px;">
             <!-- Image Item 1 -->
             <div style="padding:12px;background:var(--bg-surface);border-radius:var(--radius-sm);border:1px solid var(--border);">
               <div style="display:flex;justify-content:space-between;margin-bottom:8px;">
                 <span style="font-weight:700;font-size:13px;">CT Head (Plain)</span>
                 <span class="badge badge-available">Reported</span>
               </div>
               <div style="font-size:11px;color:var(--text-muted);margin-bottom:8px;">Requested: Yesterday, 14:00 • Reported: Yesterday, 15:45</div>
               <div style="font-size:12px;background:#0d1117;padding:8px;border-radius:4px;border-left:3px solid var(--blue);font-family:monospace;white-space:pre-wrap;"><strong>FINDINGS:</strong>
No acute intracranial hemorrhage.
No midline shift or mass effect.
Ventricles and sulci are age-appropriate.
<strong>IMPRESSION:</strong>
Normal non-contrast CT study of the brain.</div>
               <div style="margin-top:8px;">
                 <button class="btn btn-ghost" style="font-size:11px;padding:4px 8px;">🖼 View Scans in PACS Viewer</button>
               </div>
             </div>
             <!-- Image Item 2 -->
             <div style="padding:12px;background:var(--bg-surface);border-radius:var(--radius-sm);border:1px solid var(--border);">
               <div style="display:flex;justify-content:space-between;margin-bottom:8px;">
                 <span style="font-weight:700;font-size:13px;">Chest X-Ray (CXR PA)</span>
                 <span class="badge badge-urgent">Scan Uploaded - Awaiting Report</span>
               </div>
               <div style="font-size:11px;color:var(--text-muted);margin-bottom:8px;">Requested: Today, 09:00 (STAT)</div>
               <div>
                 <button class="btn btn-ghost" style="font-size:11px;padding:4px 8px;">🖼 View Scans in PACS Viewer</button>
               </div>
             </div>
          </div>
        </div>
      </div>
      
      <div class="card mt-16">
        <div class="card-header">
          <span class="card-title">✨ AI Medical Image Interpreter</span>
        </div>
        <div style="padding:16px;">
          <p style="font-size:12px;color:var(--text-muted);margin-bottom:12px;">Upload a scan (CT, MRI, X-Ray, or Ultrasound) for instant AI preliminary interpretation and pathology detection.</p>
          <div style="display:flex;gap:12px;align-items:center;">
            <input type="file" class="form-input" style="flex:1;" id="ai-scan-upload" accept="image/*,.dcm" onchange="document.getElementById('ai-analyze-btn').disabled = !this.files.length" />
            <select class="form-select" id="ai-scan-type" style="width:200px;">
                <option value="CXR PA">Chest X-Ray</option>
                <option value="CT Head plain">CT Scan</option>
                <option value="MRI Brain">MRI</option>
                <option value="US Abdomen">Ultrasound</option>
            </select>
            <button id="ai-analyze-btn" class="btn btn-primary" disabled onclick="analyzeMedicalScanAI(this)">Analyze Scan</button>
          </div>
          
          <div id="ai-scan-result" style="display:none;margin-top:16px;padding:16px;background:#0d1117;border-radius:var(--radius-sm);border:1px solid var(--border);">
             <!-- AI Result will be inserted here -->
          </div>
        </div>
      </div>
    </div>

    <!-- Discharge Summary Tab -->
    <div id="nurse-discharge" class="nurse-tab" style="display:none;">
      <div class="card mb-16">
        <div class="card-header"><span class="card-title">Generate Discharge Summary</span></div>
        <div style="padding:16px;">
          <div class="grid-2 gap-16 mb-16">
            <div class="form-group"><label class="form-label">Admission Date</label><input type="date" class="form-input" value="2026-02-21"/></div>
            <div class="form-group"><label class="form-label">Discharge Date</label><input type="date" class="form-input" value="${new Date().toISOString().split('T')[0]}"/></div>
            <div class="form-group" style="grid-column:span 2;"><label class="form-label">Final Discharge Diagnosis</label><input class="form-input" placeholder="e.g. Uncomplicated Malaria, resolved." /></div>
            
            <div class="form-group" style="grid-column:span 2;"><label class="form-label">Brief Clinical Summary (Presentation & Hospital Course)</label><textarea class="form-textarea" rows="3" placeholder="Patient presented with... treated with... responded well..."></textarea></div>
            
            <div class="form-group" style="grid-column:span 2;"><label class="form-label">Discharge Medications (TTO - To Take Out)</label>
              <div style="background:var(--bg-surface);padding:10px;border-radius:var(--radius-sm);font-size:12px;color:var(--text-secondary);border:1px solid var(--border);">
                [Auto-imported from Active Prescriptions]
                <ul style="margin:4px 0 0 16px;">
                  <li>Lisinopril 10mg PO OD x 30 days</li>
                  <li>Paracetamol 1g PO TDS x 5 days</li>
                </ul>
              </div>
            </div>
            
            <div class="form-group" style="grid-column:span 2;"><label class="form-label">Follow-up Plan & Advice</label><textarea class="form-textarea" rows="2" placeholder="Return to OPD in 1 week. Warning signs to return to ED: fever, severe headache..."></textarea></div>
          </div>
          <div style="display:flex;gap:12px;">
            <button class="btn btn-primary" onclick="showToast('Discharge Summary generated and saved to patient record','success')">Generate & Sign Summary</button>
            <button class="btn btn-secondary">⎙ Print Copy</button>
          </div>
        </div>
      </div>
    </div>
    `;
}

// ================================================================
// Nursing Helpers
// ================================================================
window.analyzeMedicalScanAI = function (btn) {
  const fileInput = document.getElementById('ai-scan-upload');
  const scanType = document.getElementById('ai-scan-type').value;
  const resultDiv = document.getElementById('ai-scan-result');

  if (!fileInput.files.length) return;

  const fileName = fileInput.files[0].name;
  const origText = btn.innerHTML;

  btn.innerHTML = '<span class="spinner" style="width:12px;height:12px;border-width:2px;border-top-color:var(--bg);display:inline-block;vertical-align:middle;margin-right:8px;"></span> Analyzing...';
  btn.disabled = true;
  resultDiv.style.display = 'none';

  setTimeout(() => {
    btn.innerHTML = origText;
    btn.disabled = false;
    resultDiv.style.display = 'block';

    // Generate mock AI findings based on selected type
    let findings, impression, confidence;
    if (scanType.includes('X-Ray')) {
      findings = "Patchy opacities observed in the right lower lobe. Cardiac silhouette is within normal limits. Costophrenic angles are clear.";
      impression = "Possible early stage pneumonia or atelectasis in RLL.";
      confidence = "89%";
    } else if (scanType.includes('CT')) {
      findings = "No acute intracranial hemorrhage. No midline shift or mass effect. Ventricles and sulci are age-appropriate. Small calcification noted in pineal gland.";
      impression = "Normal non-contrast CT study of the brain. No acute pathology.";
      confidence = "96%";
    } else if (scanType.includes('MRI')) {
      findings = "High signal intensity on T2/FLAIR in the periventricular white matter suggestive of chronic small vessel ischemic disease. No acute infarction or restricted diffusion.";
      impression = "Mild chronic microvascular ischemic changes.";
      confidence = "92%";
    } else {
      findings = "Liver parenchyma is homogeneous. Gallbladder contains multiple small echogenic foci with posterior acoustic shadowing. No gallbladder wall thickening or pericholecystic fluid.";
      impression = "Cholelithiasis without signs of acute cholecystitis.";
      confidence = "94%";
    }

    resultDiv.innerHTML = `
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;border-bottom:1px solid #333;padding-bottom:8px;">
                <span style="font-weight:700;color:var(--accent);font-size:14px;">🤖 AI Vision Report: ${fileName}</span>
                <span class="badge badge-urgent">Confidence: ${confidence}</span>
            </div>
            <div style="font-size:13px;margin-bottom:8px;font-family:monospace;white-space:pre-wrap;color:#a3b3cc;"><strong>MODALITY:</strong> ${scanType}
<strong>FINDINGS:</strong>
${findings}

<strong>IMPRESSION:</strong>
<span style="color:var(--amber);">${impression}</span></div>
            <div style="font-size:11px;color:var(--text-muted);margin-top:12px;">* Disclaimer: This is an AI-assisted preliminary finding. A radiologist must verify this report.</div>
        `;
  }, 2000);
};

function defaultMarRows() {
  const meds = [
    { drug: 'Morphine Sulphate', dose: '5mg IV', route: 'IV', freq: 'q4h PRN (Pain ≥5)', times: ['✓', '✓', '—', '—', '—', '—'], last: '09:45 — Nurse A. Poku' },
    { drug: 'Metronidazole', dose: '500mg', route: 'IV', freq: 'TDS', times: ['✓', '—', '—', '—', '—', '—'], last: '06:00' },
    { drug: 'Ceftriaxone', dose: '1g', route: 'IV', freq: 'BD', times: ['✓', '—', '—', '—', '—', '—'], last: '06:00' },
    { drug: 'Enoxaparin', dose: '40mg SC', route: 'SC', freq: 'OD (22:00)', times: ['—', '—', '—', '—', '—', '—'], last: 'Due 22:00' },
    { drug: 'Omeprazole', dose: '40mg', route: 'IV', freq: 'BD', times: ['✓', '—', '—', '—', '—', '—'], last: '06:00' },
  ];
  return meds.map(m => `
      <tr>
        <td style="font-weight:600;">${m.drug}</td>
        <td style="font-family:monospace;font-size:12px;">${m.dose}</td>
        <td><span class="badge badge-reserved" style="font-size:10px;">${m.route}</span></td>
        <td style="font-size:11px;color:var(--text-muted);">${m.freq}</td>
        ${m.times.map(t => `<td style="text-align:center;font-size:12px;color:${t === '✓' ? 'var(--green)' : 'var(--text-muted)'};">${t}</td>`).join('')}
        <td><button class="btn btn-ghost" style="font-size:10px;padding:3px 8px;" onclick="marGive(this)">Give</button></td>
      </tr>`).join('');
}

function marGive(btn) {
  const row = btn.closest('tr');
  const cells = row.querySelectorAll('td');
  const now = new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
  const user = Auth.getUser();
  showToast('Medication recorded — ' + cells[0].textContent.trim() + ' at ' + now, 'success');
  btn.textContent = '✓ Done';
  btn.style.color = 'var(--green)';
  btn.disabled = true;
}

function renderFluidList(type) {
  const entries = {
    in: [
      { time: '06:00', route: 'IV Fluid', fluid: '0.9% NaCl', vol: 500 },
      { time: '10:00', route: 'Oral', fluid: 'Water', vol: 150 },
      { time: '12:00', route: 'IV Fluid', fluid: 'D5W', vol: 400 },
      { time: '14:00', route: 'Oral', fluid: 'ORS', vol: 200 },
    ],
    out: [
      { time: '06:30', type: 'Urine', app: 'Clear, yellow', vol: 340 },
      { time: '10:30', type: 'Urine', app: 'Clear', vol: 250 },
      { time: '13:00', type: 'Drain', app: 'Serosanguinous', vol: 120 },
      { time: '15:00', type: 'Urine', app: 'Concentrated', vol: 130 },
    ],
  };
  return (entries[type] || []).map(e => `
      <div style="display:flex;justify-content:space-between;font-size:11px;padding:4px 0;border-bottom:1px solid var(--border);">
        <span style="color:var(--text-muted);">${e.time}</span>
        <span>${e.route || e.type} — ${e.fluid || e.app}</span>
        <strong>${e.vol} ml</strong>
      </div>`).join('');
}

function addFluidEntry(dir) {
  const vol = parseInt(dir === 'in' ? document.getElementById('io-vol')?.value : document.getElementById('oo-vol')?.value) || 0;
  if (!vol) { showToast('Enter a volume', 'error'); return; }
  showToast(`${vol}ml ${dir === 'in' ? 'intake' : 'output'} recorded`, 'success');
  // Update totals
  const inEl = document.getElementById('total-in');
  const outEl = document.getElementById('total-out');
  const balEl = document.getElementById('balance');
  if (inEl && outEl && balEl) {
    const inVal = parseInt(inEl.textContent) + (dir === 'in' ? vol : 0);
    const outVal = parseInt(outEl.textContent) + (dir === 'out' ? vol : 0);
    const bal = inVal - outVal;
    inEl.textContent = inVal + ' ml';
    outEl.textContent = outVal + ' ml';
    balEl.textContent = (bal >= 0 ? '+' : '') + bal + ' ml';
    balEl.style.color = bal < -500 ? 'var(--red)' : bal > 1000 ? 'var(--amber)' : 'var(--green)';
  }
}

function showNurseTab(name) {
  document.querySelectorAll('.nurse-tab').forEach(t => t.style.display = 'none');
  document.querySelectorAll('[id^="ntab-"]').forEach(t => t.classList.remove('active'));
  document.getElementById('nurse-' + name).style.display = '';
  document.getElementById('ntab-' + name).classList.add('active');
}

function selectNursePatient(id, name, diag, room) {
  _NursingState.activePatient = { id, name, diag, room };
  document.querySelectorAll('[id^="npt-"]').forEach(b => b.style.boxShadow = '');
  document.getElementById('npt-' + id).style.boxShadow = '0 0 0 2px var(--accent)';
  document.getElementById('np-selected').innerHTML = `<strong>${name}</strong> · ${room} · <span style="color:var(--text-muted);">${diag}</span>`;
  showToast('Patient selected: ' + name, 'info');
}

function markAllChecklist(btn) {
  const card = btn.closest('.card');
  card.querySelectorAll('input[type="checkbox"]').forEach(cb => {
    cb.checked = true;
    cb.parentElement.style.opacity = '0.5';
  });
  btn.textContent = '✓ All Complete';
  btn.style.color = 'var(--green)';
  showToast('Checklist completed', 'success');
}

// Modal forms
function quickMarModal() {
  return `<div class="form-grid form-grid-2">
      <div class="form-group"><label class="form-label">Medication</label><input class="form-input" placeholder="Drug name" /></div>
      <div class="form-group"><label class="form-label">Dose</label><input class="form-input" placeholder="e.g. 5mg" /></div>
      <div class="form-group"><label class="form-label">Route</label><select class="form-select"><option>IV</option><option>Oral</option><option>SC</option><option>IM</option><option>Topical</option><option>Inhaled</option></select></div>
      <div class="form-group"><label class="form-label">Time Given</label><input type="time" class="form-input" value="${new Date().toTimeString().slice(0, 5)}" /></div>
      <div class="form-group" style="grid-column:span 2"><label class="form-label">Notes</label><input class="form-input" placeholder="Patient tolerated well, side effects..." /></div>
    </div>
    <div class="form-actions mt-16">
      <button class="btn btn-primary" onclick="showToast('MAR entry saved ✓','success');closeModal();">Save Entry</button>
      <button class="btn btn-ghost" onclick="closeModal()">Cancel</button>
    </div>`;
}

function buildSBARModal() {
  const pt = _NursingState.activePatient;
  return `<div style="font-size:13px;">
      <div style="margin-bottom:16px;padding:10px;background:var(--accent-dim);border-radius:var(--radius-sm);">
        Patient: <strong>${pt ? pt.name : 'No patient selected'}</strong> · ${pt ? pt.room : ''} · ${pt ? pt.diag : ''}
      </div>
      <div class="form-group mb-10"><label class="form-label" style="color:var(--accent);">S — Situation</label>
        <textarea class="form-textarea" rows="2" placeholder="I am calling about [patient name] in [room]. The problem is...">${pt ? 'Patient ' + pt.name + ' in ' + pt.room + ' — ' : ''}</textarea></div>
      <div class="form-group mb-10"><label class="form-label" style="color:var(--blue);">B — Background</label>
        <textarea class="form-textarea" rows="2" placeholder="Patient was admitted for [diagnosis]. Relevant history: PMHx, allergies, current medications..."></textarea></div>
      <div class="form-group mb-10"><label class="form-label" style="color:var(--amber);">A — Assessment</label>
        <textarea class="form-textarea" rows="2" placeholder="I think the problem is... Vitals: BP, HR, SpO2, Temp. I am not sure what the problem is but I am concerned because..."></textarea></div>
      <div class="form-group mb-16"><label class="form-label" style="color:var(--green);">R — Recommendation</label>
        <textarea class="form-textarea" rows="2" placeholder="I suggest you [come see, order, review]. I need you to [confirm the order, escalate to ICU]..."></textarea></div>
    </div>
    <div class="form-actions">
      <button class="btn btn-primary" onclick="showToast('SBAR saved & sent to doctor','success');closeModal();">Send to Doctor</button>
      <button class="btn btn-ghost" onclick="closeModal()">Close</button>
    </div>`;
}

function addMedOrderModal() {
  return `<div class="form-grid form-grid-2">
      <div class="form-group"><label class="form-label">Medication Name</label><input class="form-input" /></div>
      <div class="form-group"><label class="form-label">Dose</label><input class="form-input" /></div>
      <div class="form-group"><label class="form-label">Route</label><select class="form-select"><option>IV</option><option>Oral</option><option>SC</option><option>IM</option><option>Inhaled</option></select></div>
      <div class="form-group"><label class="form-label">Frequency</label><select class="form-select"><option>OD</option><option>BD</option><option>TDS</option><option>QDS</option><option>q4h</option><option>q6h</option><option>q8h</option><option>PRN</option><option>STAT</option></select></div>
      <div class="form-group"><label class="form-label">Start Date/Time</label><input type="datetime-local" class="form-input" /></div>
      <div class="form-group"><label class="form-label">Prescriber</label><input class="form-input" placeholder="Dr. Name" /></div>
      <div class="form-group" style="grid-column:span 2"><label class="form-label">Special Instructions</label><input class="form-input" placeholder="e.g. Give with food, monitor BP, withhold if HR <60" /></div>
    </div>
    <div class="form-actions mt-16">
      <button class="btn btn-primary" onclick="showToast('Medication order added to MAR','success');closeModal();">Add to MAR</button>
      <button class="btn btn-ghost" onclick="closeModal()">Cancel</button>
    </div>`;
}

function addNDxModal() {
  return `<div class="form-grid form-grid-2">
      <div class="form-group"><label class="form-label">Nursing Diagnosis (NANDA)</label><input class="form-input" placeholder="e.g. Acute Pain" /></div>
      <div class="form-group"><label class="form-label">Related To (r/t)</label><input class="form-input" placeholder="e.g. surgical incision" /></div>
      <div class="form-group" style="grid-column:span 2"><label class="form-label">Expected Outcome / Goal (SMART)</label><input class="form-input" /></div>
      <div class="form-group" style="grid-column:span 2"><label class="form-label">Nursing Interventions</label><textarea class="form-textarea" rows="3"></textarea></div>
    </div>
    <div class="form-actions mt-16">
      <button class="btn btn-primary" onclick="showToast('Nursing diagnosis added','success');closeModal();">Add</button>
      <button class="btn btn-ghost" onclick="closeModal()">Cancel</button>
    </div>`;
}

function woundAssessModal(id) {
  return `<div class="form-grid form-grid-2">
      <div class="form-group"><label class="form-label">Wound Site</label><input class="form-input" placeholder="Anatomical location" /></div>
      <div class="form-group"><label class="form-label">Wound Type</label><select class="form-select"><option>Surgical</option><option>Pressure Injury</option><option>Laceration</option><option>Burns</option><option>Diabetic Ulcer</option><option>Other</option></select></div>
      <div class="form-group"><label class="form-label">Size (cm × cm)</label><input class="form-input" placeholder="e.g. 4 × 2" /></div>
      <div class="form-group"><label class="form-label">Depth</label><select class="form-select"><option>Superficial (Stage 1)</option><option>Partial thickness (Stage 2)</option><option>Full thickness (Stage 3)</option><option>Deep (Stage 4)</option></select></div>
      <div class="form-group"><label class="form-label">Exudate</label><select class="form-select"><option>None</option><option>Minimal serous</option><option>Moderate serosanguinous</option><option>Heavy purulent</option></select></div>
      <div class="form-group"><label class="form-label">Dressing Used</label><input class="form-input" placeholder="Mepore, Mepilex..." /></div>
      <div class="form-group"><label class="form-label">Next Dressing Change</label><input type="datetime-local" class="form-input" /></div>
      <div class="form-group"><label class="form-label">Wound Status</label><select class="form-select"><option>Healing</option><option>Stable</option><option>At Risk</option><option>Infected</option><option>Deteriorating</option></select></div>
      <div class="form-group" style="grid-column:span 2"><label class="form-label">Nurse Notes</label><textarea class="form-textarea" rows="2"></textarea></div>
    </div>
    <div class="form-actions mt-16">
      <button class="btn btn-primary" onclick="showToast('Wound assessment saved','success');closeModal();">Save Assessment</button>
      <button class="btn btn-ghost" onclick="closeModal()">Cancel</button>
    </div>`;
}

async function nurseVerifyNhis() {
  const id = document.getElementById('nurse-nhis-id').value.trim();
  if (!id) return;
  const r = await fetch('api/integrations.php?action=nhis_verify', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nhis_id: id })
  });
  const data = await r.json();
  document.getElementById('nurse-integ-result').querySelector('div:last-child').innerHTML = data.success && data.data.verified
    ? `<div style="padding:10px;background:rgba(34,197,94,0.07);border-radius:var(--radius-sm);"><strong style="color:var(--green);">✅ Active Member</strong><div style="font-size:12px;margin-top:6px;">${data.data.name} · DOB: ${data.data.dob} · ${data.data.scheme}</div><div style="font-size:11px;color:var(--text-muted);">Expires: ${data.data.card_expiry}</div></div>`
    : `<div style="color:var(--red);">❌ ${data.data?.status || 'Not found'}</div>`;
}

async function nurseVerifyGhana() {
  const num = document.getElementById('nurse-ghana-id').value.trim();
  if (!num) return;
  const r = await fetch('api/integrations.php?action=ghana_card', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ card_number: num })
  });
  const data = await r.json();
  document.getElementById('nurse-integ-result').querySelector('div:last-child').innerHTML = data.success && data.data.verified
    ? `<div style="padding:10px;background:rgba(34,197,94,0.07);border-radius:var(--radius-sm);"><strong style="color:var(--green);">✅ Verified</strong><div style="font-size:12px;margin-top:6px;">${data.data.full_name} · ${data.data.dob} · ${data.data.gender}</div><div style="font-size:11px;color:var(--text-muted);">NHIS: ${data.data.nhis_linked || 'Not linked'}</div></div>`
    : `<div style="color:var(--red);">❌ Ghana Card not found</div>`;
}

window.renderNursing = renderNursing;
window.showNurseTab = showNurseTab;
window.selectNursePatient = selectNursePatient;
window.marGive = marGive;
window.addFluidEntry = addFluidEntry;
window.markAllChecklist = markAllChecklist;
window.quickMarModal = quickMarModal;
window.buildSBARModal = buildSBARModal;
window.addMedOrderModal = addMedOrderModal;
window.addNDxModal = addNDxModal;
window.woundAssessModal = woundAssessModal;
window.nurseVerifyNhis = nurseVerifyNhis;
window.nurseVerifyGhana = nurseVerifyGhana;
