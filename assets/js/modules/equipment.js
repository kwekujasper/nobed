// ================================================================
// Module: Equipment & NHIMMS
// ================================================================
function renderEquipment(container) {
    let filterStatus = 'all';
    let filterFacility = 'all';

    function render() {
        const filtered = NDATA.equipment.filter(e =>
            (filterStatus === 'all' || e.status === filterStatus) &&
            (filterFacility === 'all' || e.facility === filterFacility)
        );
        const faults = NDATA.equipment.filter(e => e.status === 'faulty').length;
        const maint = NDATA.equipment.filter(e => e.status === 'maintenance').length;
        const oos = NDATA.equipment.filter(e => e.status === 'oos').length;
        const ok = NDATA.equipment.filter(e => e.status === 'functional').length;

        container.innerHTML = `
      <div class="page-header">
        <div class="page-header-left">
          <h1>Equipment & NHIMMS</h1>
          <p>National Hospital Infrastructure & Maintenance Management System</p>
        </div>
        <div class="page-header-actions">
          <button class="btn btn-primary" onclick="openModal('Report Equipment Fault', faultReportForm())">
            <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            Report Fault
          </button>
          <button class="btn btn-ghost" onclick="openModal('Register Equipment', '')">Register Asset</button>
        </div>
      </div>

      <!-- Summary KPIs -->
      <div class="grid-4 gap-12 mb-20">
        <div class="card" style="text-align:center;padding:16px;">
          <div style="font-size:32px;font-weight:900;color:var(--green);">${ok}</div>
          <div style="font-size:12px;color:var(--text-muted);">Functional</div>
        </div>
        <div class="card red-card" style="text-align:center;padding:16px;">
          <div style="font-size:32px;font-weight:900;color:var(--red);">${faults}</div>
          <div style="font-size:12px;color:var(--text-muted);">Faulty — Needs Repair</div>
        </div>
        <div class="card amber-card" style="text-align:center;padding:16px;">
          <div style="font-size:32px;font-weight:900;color:var(--amber);">${maint}</div>
          <div style="font-size:12px;color:var(--text-muted);">Under Maintenance</div>
        </div>
        <div class="card" style="text-align:center;padding:16px;">
          <div style="font-size:32px;font-weight:900;color:var(--text-muted);">${oos}</div>
          <div style="font-size:12px;color:var(--text-muted);">Out of Service</div>
        </div>
      </div>

      <!-- Active Fault Reports -->
      <div class="section-title mb-12">🚨 Active Fault Reports</div>
      <div style="display:flex;flex-direction:column;gap:10px;margin-bottom:20px;">
        ${NDATA.faultReports.map(fr => {
            const eq = NDATA.equipment.find(e => e.id === fr.equipment);
            const sev = { critical: 'badge-critical', high: 'badge-urgent', medium: 'badge-reserved' };
            return `
            <div class="card ${fr.severity === 'critical' ? 'red-card' : 'amber-card'}" style="padding:16px;">
              <div style="display:flex;align-items:flex-start;justify-content:space-between;flex-wrap:wrap;gap:10px;">
                <div>
                  <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px;">
                    <span class="badge ${sev[fr.severity] || 'badge-routine'}">${fr.severity.toUpperCase()}</span>
                    <span class="font-mono text-accent" style="font-size:11px;">${fr.id}</span>
                    <span class="badge ${fr.status === 'in-progress' ? 'badge-reserved' : fr.status === 'awaiting-parts' ? 'badge-maintenance' : fr.status === 'escalated' ? 'badge-critical' : 'badge-oos'}">${fr.status.toUpperCase()}</span>
                  </div>
                  <div style="font-size:14px;font-weight:700;">${eq?.name}</div>
                  <div style="font-size:11px;color:var(--text-muted);margin-top:2px;">${eq?.facility} • ${eq?.dept}</div>
                  <div style="font-size:12px;color:var(--text-secondary);margin-top:6px;">${fr.description}</div>
                  ${fr.engineer ? `<div style="font-size:11px;color:var(--text-muted);margin-top:4px;">Engineer: ${fr.engineer}</div>` : ''}
                  ${fr.partETA ? `<div style="font-size:11px;color:var(--amber);margin-top:4px;">Parts ETA: ${fr.partETA}</div>` : ''}
                  ${fr.escalatedTo ? `<div style="font-size:11px;color:var(--red);margin-top:4px;">Escalated to: ${fr.escalatedTo}</div>` : ''}
                </div>
                <div style="text-align:right;">
                  <div style="font-size:10px;color:var(--text-muted);">Reported</div>
                  <div class="font-mono" style="font-size:11px;">${fmtDate(fr.reportedAt)}</div>
                  <div class="font-mono" style="font-size:11px;">${fmtTime(fr.reportedAt)}</div>
                </div>
              </div>
            </div>`;
        }).join('')}
      </div>

      <!-- Equipment Registry -->
      <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:10px;margin-bottom:12px;">
        <div class="section-title" style="margin:0;">Equipment Registry</div>
        <div style="display:flex;gap:10px;flex-wrap:wrap;">
          <select class="form-select" style="width:160px;" onchange="filterEqStatus(this.value)">
            <option value="all">All Status</option>
            <option value="functional">Functional</option>
            <option value="faulty">Faulty</option>
            <option value="maintenance">Maintenance</option>
            <option value="oos">Out of Service</option>
          </select>
          <select class="form-select" style="width:160px;" onchange="filterEqFacility(this.value)">
            <option value="all">All Facilities</option>
            ${[...new Set(NDATA.equipment.map(e => e.facility))].map(f => `<option value="${f}">${f}</option>`).join('')}
          </select>
        </div>
      </div>
      <div class="table-wrap mb-20">
        <table>
          <thead><tr><th>QR/ID</th><th>Equipment</th><th>Type</th><th>Facility</th><th>Dept</th><th>Status</th><th>Last Service</th><th>Next Service</th><th>Vendor</th><th>Faults</th><th>Actions</th></tr></thead>
          <tbody id="eq-table-body">
            ${filtered.map(eq => equipRow(eq)).join('')}
          </tbody>
        </table>
      </div>

      <!-- Maintenance Calendar Preview -->
      <div class="section-title mb-12">Upcoming Maintenance (Next 30 Days)</div>
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:10px;">
        ${NDATA.equipment.filter(e => e.nextService).slice(0, 6).map(e => {
            const d = new Date(e.nextService);
            const now = new Date('2026-02-25');
            const days = Math.round((d - now) / (1000 * 86400));
            const overdue = days < 0;
            const soon = days >= 0 && days <= 14;
            return `
            <div class="card" style="padding:14px;border-color:${overdue ? 'var(--red)' : soon ? 'var(--amber)' : 'var(--border)'};">
              <div style="font-size:10px;font-weight:700;color:${overdue ? 'var(--red)' : soon ? 'var(--amber)' : 'var(--text-muted)'};margin-bottom:4px;">${overdue ? 'OVERDUE' : soon ? 'DUE SOON' : 'SCHEDULED'}</div>
              <div style="font-size:12px;font-weight:700;">${e.name.substring(0, 30)}...</div>
              <div style="font-size:11px;color:var(--text-muted);">${e.facility} • ${e.dept}</div>
              <div style="font-size:16px;font-weight:800;color:${overdue ? 'var(--red)' : soon ? 'var(--amber)' : 'var(--text-primary)'};margin:8px 0;">${overdue ? `${Math.abs(days)}d overdue` : days === 0 ? 'Today' : days + 'd'}</div>
              <div style="font-size:11px;color:var(--text-muted);">${fmtDate(e.nextService)} • ${e.vendor}</div>
            </div>`;
        }).join('')}
      </div>
    `;

        window.filterEqStatus = v => { filterStatus = v; render(); };
        window.filterEqFacility = v => { filterFacility = v; render(); };
    }

    function equipRow(eq) {
        return `
      <tr>
        <td class="font-mono" style="font-size:10px;color:var(--accent);">${eq.qr}</td>
        <td style="font-size:12px;font-weight:600;max-width:200px;">${eq.name}</td>
        <td style="font-size:11px;">${eq.type}</td>
        <td style="font-size:12px;">${eq.facility}</td>
        <td style="font-size:11px;color:var(--text-muted);">${eq.dept}</td>
        <td>${statusBadge(eq.status)}</td>
        <td class="font-mono" style="font-size:11px;">${fmtDate(eq.lastService)}</td>
        <td class="font-mono" style="font-size:11px;color:${new Date(eq.nextService) < new Date('2026-02-25') ? 'var(--red)' : 'var(--text-secondary)'};">${fmtDate(eq.nextService)}</td>
        <td style="font-size:11px;color:var(--text-muted);">${eq.vendor}</td>
        <td style="text-align:center;font-weight:700;color:${eq.faults > 0 ? 'var(--red)' : 'var(--green)'};">${eq.faults}</td>
        <td>
          <div style="display:flex;gap:4px;">
            ${eq.status !== 'functional' ? `<button class="btn btn-ghost" style="font-size:10px;padding:3px 8px;" onclick="openModal('Fault Detail','<p style=padding:16px>${eq.faultDesc || 'No detail'}</p>')">Detail</button>` : ''}
            <button class="btn btn-ghost" style="font-size:10px;padding:3px 8px;" onclick="showToast('Service scheduled for ${eq.name}','success')">Schedule</button>
          </div>
        </td>
      </tr>`;
    }

    render();
}

function faultReportForm() {
    return `
    <div class="form-grid form-grid-2">
      <div class="form-group"><label class="form-label">Facility</label><select class="form-select">${NDATA.facilities.map(f => `<option>${f.name}</option>`).join('')}</select></div>
      <div class="form-group"><label class="form-label">Equipment (QR or Name)</label><select class="form-select">${NDATA.equipment.map(e => `<option value="${e.id}">${e.qr} — ${e.name.substring(0, 30)}</option>`).join('')}</select></div>
      <div class="form-group"><label class="form-label">Severity</label><select class="form-select"><option>critical</option><option>high</option><option>medium</option></select></div>
      <div class="form-group"><label class="form-label">Reported By</label><input type="text" class="form-input" placeholder="Name / Role"/></div>
      <div class="form-group" style="grid-column:span 2"><label class="form-label">Fault Description <span class="required">*</span></label><textarea class="form-textarea" placeholder="Describe the fault, any patient safety impact, and immediate actions taken..."></textarea></div>
    </div>
    <div class="form-actions mt-16">
      <button class="btn btn-danger" onclick="showToast('⚠ Fault reported — Biomedical team alerted','warning');closeModal();">Submit Fault Report</button>
      <button class="btn btn-ghost" onclick="closeModal()">Cancel</button>
    </div>`;
}
