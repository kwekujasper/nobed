// ================================================================
// Module: HECU — Hospital Emergency Command Unit
// ================================================================
function renderHECU(container) {
    container.innerHTML = `
    <div class="page-header">
      <div class="page-header-left">
        <h1>Hospital Emergency Command Unit</h1>
        <p>ED flow, ICU capacity, specialist registry, internal transfer optimization</p>
      </div>
      <div class="page-header-actions">
        <select class="form-select" style="width:240px;">
          ${NDATA.facilities.filter(f => ['Teaching', 'Regional', 'Military'].includes(f.level)).map(f => `<option>${f.name}</option>`).join('')}
        </select>
        <button class="btn btn-danger" onclick="showToast('⚠ Internal Surge Activated — KBTH','warning')">Activate Internal Surge</button>
      </div>
    </div>

    <!-- Status Strip -->
    <div class="grid-5 gap-12 mb-20">
      ${[
            { l: 'ED Patients', v: 40, cap: 40, color: 'red' },
            { l: 'Admitted >6h', v: 18, cap: 40, color: 'red' },
            { l: 'ICU Available', v: 4, cap: 28, color: 'amber' },
            { l: 'Theatres Ready', v: 2, cap: 4, color: 'amber' },
            { l: 'ICU-Wait List', v: 6, cap: null, color: 'red' },
        ].map(s => `
        <div class="card ${s.color === 'red' ? 'red-card' : 'amber-card'}" style="padding:14px;text-align:center;">
          <div style="font-size:28px;font-weight:900;color:var(--${s.color});">${s.v}</div>
          ${s.cap ? `<div style="font-size:10px;color:var(--text-muted);">of ${s.cap}</div>` : ''}
          <div style="font-size:11px;color:var(--text-muted);margin-top:4px;">${s.l}</div>
        </div>`).join('')}
    </div>

    <div class="grid-2 gap-16 mb-16">
      <!-- ED Flow Board -->
      <div class="card">
        <div class="card-header"><span class="card-title">ED Flow Board — KBTH</span><span class="badge badge-critical">40/40 Patients</span></div>
        <div class="tab-bar" style="margin-bottom:14px;">
          <div class="tab-btn active">All Patients</div>
          <div class="tab-btn">Red (Immediate)</div>
          <div class="tab-btn">Boarding >6h</div>
        </div>
        <div class="table-wrap">
          <table>
            <thead><tr><th>Bay</th><th>Patient</th><th>Triage</th><th>Complaint</th><th>Wait</th><th>Status</th><th>Flag</th></tr></thead>
            <tbody>
              ${[
            { bay: 'BAY-1', pt: 'M/38', triage: 'Red', cc: 'TBI post-RTA', wait: '2h 15m', status: 'ICU-Wait', flag: '🚨 ICU needed' },
            { bay: 'BAY-2', pt: 'F/52', triage: 'Red', cc: 'Septic Shock', wait: '1h 48m', status: 'ICU-Wait', flag: '🚨 ICU needed' },
            { bay: 'BAY-3', pt: 'M/67', triage: 'Yellow', cc: 'Chest Pain/STEMI', wait: '48m', status: 'Theatre Prep', flag: '⚠ Theatre delay' },
            { bay: 'BAY-4', pt: 'F/29', triage: 'Red', cc: 'Eclampsia', wait: '22m', status: 'HDU-Admitted', flag: '✓ Bed found' },
            { bay: 'BAY-5', pt: 'M/7', triage: 'Red', cc: 'Respiratory Failure', wait: '3h 6m', status: 'PICU-Wait', flag: '🚨 PICU needed' },
            { bay: 'BAY-6', pt: 'F/44', triage: 'Yellow', cc: 'Abdo Pain', wait: '4h 20m', status: 'Ward-Wait', flag: '⚠ Long wait' },
            { bay: 'BAY-7', pt: 'M/19', triage: 'Green', cc: 'Minor Laceration', wait: '1h 10m', status: 'Awaiting review', flag: '' },
            { bay: 'BAY-8', pt: 'F/71', triage: 'Yellow', cc: 'CVA/Stroke', wait: '54m', status: 'CT Pending', flag: '⚠ Stroke protocol' },
        ].map(p => `
                <tr style="${p.triage === 'Red' ? 'background:rgba(255,59,59,0.05);' : ''}">
                  <td class="font-mono" style="font-size:11px;">${p.bay}</td>
                  <td style="font-size:12px;">${p.pt}</td>
                  <td>
                    <span class="badge ${p.triage === 'Red' ? 'badge-critical' : p.triage === 'Yellow' ? 'badge-urgent' : 'badge-routine'}">${p.triage}</span>
                  </td>
                  <td style="font-size:12px;">${p.cc}</td>
                  <td class="font-mono" style="font-size:11px;color:${p.wait.includes('3h') || p.wait.includes('4h') ? 'var(--red)' : p.wait.includes('2h') ? 'var(--amber)' : 'var(--text-secondary)'};">${p.wait}</td>
                  <td style="font-size:11px;">${p.status}</td>
                  <td style="font-size:11px;white-space:nowrap;">${p.flag}</td>
                </tr>`).join('')}
            </tbody>
          </table>
        </div>
      </div>

      <!-- Specialist Registry -->
      <div class="card">
        <div class="card-header"><span class="card-title">Specialist On-Call Registry</span></div>
        <div class="table-wrap" style="margin-bottom:14px;">
          <table>
            <thead><tr><th>Specialty</th><th>Dr.</th><th>Status</th><th>Response</th></tr></thead>
            <tbody>
              ${[
            { spec: 'Neurosurgery', dr: 'Dr. E. Tetteh', status: 'available', resp: 'On-site' },
            { spec: 'Cardiology', dr: 'Dr. A. Mensah', status: 'on-call', resp: '15 min ETA' },
            { spec: 'Critical Care', dr: 'Dr. Y. Boateng', status: 'available', resp: 'ICU Floor' },
            { spec: 'Obstetrics', dr: 'Dr. B. Asante', status: 'in-theatre', resp: 'In theatre ~45m' },
            { spec: 'Paediatrics', dr: 'Dr. K. Darko', status: 'available', resp: 'Ward C' },
            { spec: 'Orthopaedics', dr: 'Dr. F. Acheampong', status: 'on-call', resp: '30 min ETA' },
            { spec: 'Urology', dr: 'Dr. S. Ampofo', status: 'unavailable', resp: 'Off duty tonight' },
            { spec: 'Anaesthesia', dr: 'Dr. A. Quaye', status: 'available', resp: 'On-site' },
        ].map(s => `
                <tr>
                  <td style="font-size:12px;font-weight:600;">${s.spec}</td>
                  <td style="font-size:12px;">${s.dr}</td>
                  <td><span class="badge ${s.status === 'available' ? 'badge-available' : s.status === 'in-theatre' ? 'badge-occupied' : s.status === 'on-call' ? 'badge-reserved' : 'badge-oos'}">${s.status}</span></td>
                  <td style="font-size:11px;color:var(--text-muted);">${s.resp}</td>
                </tr>`).join('')}
            </tbody>
          </table>
        </div>

        <!-- Critical Equipment quick view -->
        <div class="section-title">Critical Services Status</div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:10px;">
          ${[
            { l: 'CT Scanner', v: 'Operational', ok: true },
            { l: 'MRI', v: 'Operational', ok: true },
            { l: 'Main Theatre (×4)', v: '2/4 Available', ok: true },
            { l: 'Blood Bank', v: 'A+, O+ Low', ok: false },
            { l: 'Central Oxygen', v: '4.2 bar ✓', ok: true },
            { l: 'Generator', v: '72% fuel ✓', ok: true },
            { l: 'Dialysis (×8)', v: '7/8 Running', ok: true },
            { l: 'Echo Machine', v: 'FAULT', ok: false },
        ].map(x =>
            `<div style="display:flex;justify-content:space-between;padding:7px 10px;background:var(--bg-surface);border-radius:6px;font-size:11px;">
              <span style="color:var(--text-muted);">${x.l}</span>
              <span style="font-weight:600;color:${x.ok ? 'var(--green)' : 'var(--red)'};">${x.v}</span>
            </div>`).join('')}
        </div>
      </div>
    </div>

    <!-- Internal Transfer Optimization -->
    <div class="card">
      <div class="card-header">
        <span class="card-title">Internal Transfer Optimization — Boarding Reduction</span>
        <span style="font-size:12px;color:var(--text-muted);">System-identified candidates for step-down or discharge</span>
      </div>
      <div class="table-wrap">
        <table>
          <thead><tr><th>Patient</th><th>Current Location</th><th>Recommendation</th><th>Reason</th><th>Time in Unit</th><th>Action</th></tr></thead>
          <tbody>
            ${[
            { pt: 'M/55', loc: 'ICU-B6', rec: 'Step-down to HDU', reason: 'Haemodynamically stable, weaning ventilator', time: '72h', btn: 'Initiate Transfer' },
            { pt: 'F/39', loc: 'HDU-A4', rec: 'Transfer to Surgical Ward', reason: 'Post-op day 3 — stable vitals, tolerating diet', time: '36h', btn: 'Initiate Transfer' },
            { pt: 'M/82', loc: 'Medical Ward', rec: 'Discharge — Home', reason: 'Medically fit — family education done, Rx ready', time: '5 days', btn: 'Process Discharge' },
            { pt: 'F/28', loc: 'Maternity Ward', rec: 'Discharge — Home', reason: 'Day 2 post-normal delivery — well, baby feeding', time: '48h', btn: 'Process Discharge' },
        ].map(p => `
              <tr>
                <td>${p.pt}</td>
                <td class="font-mono" style="font-size:11px;">${p.loc}</td>
                <td><span class="badge badge-reserved">${p.rec}</span></td>
                <td style="font-size:12px;color:var(--text-secondary);">${p.reason}</td>
                <td class="font-mono" style="font-size:11px;">${p.time}</td>
                <td><button class="btn btn-ghost" style="font-size:11px;padding:4px 10px;" onclick="showToast('Transfer initiated for ${p.pt}','success')">${p.btn}</button></td>
              </tr>`).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}
