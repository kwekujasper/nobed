// ================================================================
// Module: Clinical Governance
// ================================================================
function renderGovernance(container) {
  container.innerHTML = `
    <div class="page-header">
      <div class="page-header-left"><h1>Clinical Governance</h1><p>Trauma, stroke & maternal registries, mortality review, compliance tracking</p></div>
      <div class="page-header-actions">
        <button class="btn btn-ghost" onclick="exportGovernanceCSV()">
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
          Export CSV
        </button>
        <button class="btn btn-ghost" onclick="printGovernance()">
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
          Print Report
        </button>
        <button class="btn btn-primary" onclick="openModal('New Registry Entry', registryForm())">
          <svg viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Add Entry
        </button>
      </div>
    </div>

    <!-- Mortality Dashboard -->
    <div class="grid-4 gap-12 mb-20">
      ${[
      { l: 'Monthly Deaths (ICU)', v: 12, vs: 14, icon: '💀' },
      { l: 'Trauma Mortality', v: '8.2%', vs: '11.4%', icon: '🩸' },
      { l: 'Maternal Mortality', v: 3, vs: 5, icon: '🤱' },
      { l: 'Neonatal Mortality', v: 7, vs: 9, icon: '👶' },
    ].map(m => `
        <div class="card" style="padding:16px;">
          <div style="font-size:22px;margin-bottom:8px;">${m.icon}</div>
          <div style="font-size:26px;font-weight:900;">${m.v}</div>
          <div style="font-size:11px;color:var(--text-muted);">${m.l}</div>
          <div style="font-size:11px;color:var(--green);margin-top:4px;">↓ vs ${m.vs} last month</div>
        </div>`).join('')}
    </div>

    <div class="grid-2 gap-16 mb-16">
      <!-- Trauma Registry -->
      <div class="card">
        <div class="card-header"><span class="card-title">Trauma Registry</span><span class="badge badge-critical">Real-time</span></div>
        <div class="table-wrap">
          <table>
            <thead><tr><th>ID</th><th>Date</th><th>Mechanism</th><th>ISS</th><th>Disposition</th><th>Outcome</th></tr></thead>
            <tbody>
              ${[
      { id: 'TR-0892', date: '25 Feb', mech: 'RTA-Pedestrian', iss: 34, disp: 'ICU', outcome: 'critical' },
      { id: 'TR-0891', date: '25 Feb', mech: 'RTA-Driver', iss: 22, disp: 'Theatre→Ward', outcome: 'stable' },
      { id: 'TR-0890', date: '24 Feb', mech: 'Fall from height', iss: 18, disp: 'Ward', outcome: 'stable' },
      { id: 'TR-0889', date: '24 Feb', mech: 'GSW', iss: 41, disp: 'ICU', outcome: 'critical' },
      { id: 'TR-0888', date: '23 Feb', mech: 'RTA-Motorcyclist', iss: 15, disp: 'ED→Ward', outcome: 'discharged' },
      { id: 'TR-0887', date: '23 Feb', mech: 'Industrial', iss: 29, disp: 'ICU→Theatre', outcome: 'improving' },
    ].map(t => `
                <tr>
                  <td class="font-mono" style="font-size:11px;color:var(--accent);">${t.id}</td>
                  <td style="font-size:12px;">${t.date}</td>
                  <td style="font-size:11px;">${t.mech}</td>
                  <td style="font-weight:700;color:${t.iss >= 25 ? 'var(--red)' : t.iss >= 15 ? 'var(--amber)' : 'var(--green)'};">${t.iss}</td>
                  <td style="font-size:11px;">${t.disp}</td>
                  <td>
                    <span class="badge ${t.outcome === 'critical' ? 'badge-critical' : t.outcome === 'discharged' ? 'badge-available' : 'badge-urgent'}">${t.outcome}</span>
                  </td>
                </tr>`).join('')}
            </tbody>
          </table>
        </div>
      </div>

      <!-- Stroke Registry -->
      <div class="card">
        <div class="card-header"><span class="card-title">Stroke Registry</span><div class="card-icon accent"><svg viewBox="0 0 24 24"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg></div></div>
        <div class="table-wrap">
          <table>
            <thead><tr><th>ID</th><th>Type</th><th>Onset-to-Door</th><th>Onset-to-tPA</th><th>mRS at D/C</th><th>Outcome</th></tr></thead>
            <tbody>
              ${[
      { id: 'STK-211', type: 'Ischaemic', door: 55, tpa: 95, mrs: 2, out: 'improved' },
      { id: 'STK-210', type: 'Haemorrhagic', door: 80, tpa: 'N/A', mrs: 4, out: 'moderate disability' },
      { id: 'STK-209', type: 'Ischaemic', door: 38, tpa: 78, mrs: 1, out: 'near-full recovery' },
      { id: 'STK-208', type: 'Ischaemic', door: 210, tpa: 255, mrs: 3, out: 'moderate disability' },
      { id: 'STK-207', type: 'Haemorrhagic', door: 65, tpa: 'N/A', mrs: 5, out: 'severe disability' },
    ].map(s => `
                <tr>
                  <td class="font-mono" style="font-size:11px;color:var(--accent);">${s.id}</td>
                  <td style="font-size:11px;">${s.type}</td>
                  <td style="font-size:12px;font-weight:700;color:${s.door < 60 ? 'var(--green)' : s.door < 120 ? 'var(--amber)' : 'var(--red)'};">${s.door} min</td>
                  <td style="font-size:12px;">${s.tpa === 'N/A' ? 'N/A' : s.tpa + ' min'}</td>
                  <td style="font-weight:700;color:${s.mrs <= 2 ? 'var(--green)' : s.mrs <= 3 ? 'var(--amber)' : 'var(--red)'};">${s.mrs}</td>
                  <td style="font-size:11px;">${s.out}</td>
                </tr>`).join('')}
            </tbody>
          </table>
        </div>
        <div style="font-size:11px;color:var(--text-muted);margin-top:8px;">mRS: Modified Rankin Scale (0=No symptoms, 6=Death)</div>
      </div>
    </div>

    <!-- Maternal Registry -->
    <div class="card mb-16">
      <div class="card-header">
        <span class="card-title">Maternal Health Registry — February 2026</span>
        <div style="display:flex;gap:12px;font-size:12px;color:var(--text-muted);">
          <span>Deliveries: <strong style="color:var(--text-primary);">412</strong></span>
          <span>C-Section Rate: <strong style="color:var(--amber);">38%</strong></span>
          <span>WHO Target: &lt;15%</span>
        </div>
      </div>
      <div class="grid-3 gap-12">
        ${[
      { condition: 'Eclampsia', count: 7, outcome: 'All managed — 2 ICU admissions, 0 deaths' },
      { condition: 'Postpartum Haemorrhage', count: 14, outcome: '12 transfused — 2 hysterectomies, 0 deaths' },
      { condition: 'Ectopic Pregnancy', count: 5, outcome: 'All surgical — 1 ICU admission' },
      { condition: 'Maternal Deaths', count: 3, outcome: 'Under review — Awaiting M&M' },
      { condition: 'HELLP Syndrome', count: 4, outcome: 'Delivered preterm — Neonatal outcomes below' },
      { condition: 'Uterine Rupture', count: 2, outcome: 'Both emergency repairs — 1 death (pre-hospital)' },
    ].map(m => `
          <div style="background:var(--bg-surface);border-radius:var(--radius-sm);padding:14px;">
            <div style="font-size:12px;font-weight:700;margin-bottom:6px;">${m.condition}</div>
            <div style="font-size:28px;font-weight:900;color:${m.condition.includes('Death') ? 'var(--red)' : 'var(--text-primary)'};margin-bottom:6px;">${m.count}</div>
            <div style="font-size:11px;color:var(--text-muted);">${m.outcome}</div>
          </div>`).join('')}
      </div>
    </div>

    <!-- M&M / Mortality Review -->
    <div class="card">
      <div class="card-header"><span class="card-title">Mortality & Morbidity Review Queue</span></div>
      <div class="table-wrap">
        <table>
          <thead><tr><th>ID</th><th>Date</th><th>Summary</th><th>Review Status</th><th>Responsible</th><th>Root Cause</th><th>Action</th></tr></thead>
          <tbody>
            ${[
      { id: 'MM-0041', date: '24 Feb', sum: '48yr M — Pneumonia/Sepsis — ICU Day 4', status: 'Scheduled', resp: 'Dr. Boateng', cause: 'Delayed escalation recognized', act: 'Protocol update' },
      { id: 'MM-0040', date: '22 Feb', sum: '32yr F — PPH following CS', status: 'In review', resp: 'Dr. Asante', cause: 'Under review', act: 'Pending' },
      { id: 'MM-0039', date: '20 Feb', sum: 'Neonate — respiratory distress — D3', status: 'Completed', resp: 'Dr. Darko', cause: 'Equipment delay (CPAP fault)', act: 'NHIMMS ticket raised' },
      { id: 'MM-0038', date: '18 Feb', sum: '67yr M — Post-CABG complications', status: 'Completed', resp: 'Dr. Mensah', cause: 'System factors — delayed theatry slot', act: 'Theatre scheduling updated' },
    ].map(m => `
              <tr>
                <td class="font-mono" style="font-size:11px;color:var(--accent);">${m.id}</td>
                <td style="font-size:12px;">${m.date}</td>
                <td style="font-size:12px;max-width:200px;">${m.sum}</td>
                <td><span class="badge ${m.status === 'Completed' ? 'badge-available' : m.status === 'In review' ? 'badge-urgent' : 'badge-reserved'}">${m.status}</span></td>
                <td style="font-size:12px;">${m.resp}</td>
                <td style="font-size:11px;color:var(--text-muted);">${m.cause}</td>
                <td><button class="btn btn-ghost" style="font-size:11px;padding:3px 8px;">View</button></td>
              </tr>`).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

function registryForm() {
  return `
    <div class="form-grid form-grid-2">
      <div class="form-group"><label class="form-label">Registry</label><select class="form-select"><option>Trauma</option><option>Stroke</option><option>Maternal</option><option>Neonatal</option></select></div>
      <div class="form-group"><label class="form-label">Entry Date</label><input type="date" class="form-input" value="2026-02-25"/></div>
      <div class="form-group"><label class="form-label">Facility</label><select class="form-select">${NDATA.facilities.map(f => `<option>${f.name}</option>`).join('')}</select></div>
      <div class="form-group"><label class="form-label">Primary Diagnosis</label><input type="text" class="form-input"/></div>
      <div class="form-group" style="grid-column:span 2"><label class="form-label">Clinical Notes</label><textarea class="form-textarea" placeholder="Summary of clinical course, disposition, outcome..."></textarea></div>
    </div>
    <div class="form-actions mt-16">
      <button class="btn btn-primary" onclick="showToast('Registry entry saved','success');closeModal();">Save Entry</button>
      <button class="btn btn-ghost" onclick="closeModal()">Cancel</button>
    </div>`;
}
window.registryForm = registryForm;
