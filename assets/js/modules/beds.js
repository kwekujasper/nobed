// ================================================================
// Module: Bed & Capacity Command
// ================================================================
function renderBeds(container) {
    const facilities = NDATA.facilities;
    let selectedFacility = 'KBTH';

    function render() {
        const fac = facilities.find(f => f.id === selectedFacility);
        const units = NDATA.bedUnits[selectedFacility] || [];
        const totalBeds = units.reduce((s, u) => s + u.beds, 0);
        const totalAvail = units.reduce((s, u) => s + u.avail, 0);
        const totalOcc = units.reduce((s, u) => s + u.occupied, 0);
        const occPctTotal = totalBeds ? Math.round((totalOcc / totalBeds) * 100) : 0;

        container.innerHTML = `
      <div class="page-header">
        <div class="page-header-left">
          <h1>Bed & Capacity Command</h1>
          <p>Real-time bed status, unit occupancy, and staffing-aware capacity</p>
        </div>
        <div class="page-header-actions">
          <select class="form-select" id="facility-select" style="width:280px;">
            ${facilities.map(f => `<option value="${f.id}" ${f.id === selectedFacility ? 'selected' : ''}>${f.name} (${f.level})</option>`).join('')}
          </select>
          <button class="btn btn-primary" onclick="openModal('Update Bed Count', updateBedForm())">
            <svg viewBox="0 0 24 24"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/></svg>
            Update Beds
          </button>
        </div>
      </div>

      <!-- Facility Summary -->
      <div class="card mb-16" style="background:linear-gradient(135deg,rgba(0,212,170,0.08),rgba(0,0,0,0));">
        <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:16px;">
          <div>
            <div style="font-size:18px;font-weight:800;">${fac?.name}</div>
            <div style="font-size:12px;color:var(--text-muted);margin-top:4px;">${fac?.level} Hospital • ${fac?.region} Region • Tel: ${fac?.tel}</div>
            <div style="display:flex;gap:8px;margin-top:8px;flex-wrap:wrap;">
              ${fac?.services.map(s => `<span class="equip-tag">${s}</span>`).join('')}
            </div>
          </div>
          <div style="display:flex;gap:24px;">
            <div style="text-align:center;">
              <div style="font-size:32px;font-weight:900;color:var(--green);">${totalAvail}</div>
              <div style="font-size:11px;color:var(--text-muted);">Available</div>
            </div>
            <div style="text-align:center;">
              <div style="font-size:32px;font-weight:900;color:var(--red);">${totalOcc}</div>
              <div style="font-size:11px;color:var(--text-muted);">Occupied</div>
            </div>
            <div style="text-align:center;">
              <div style="font-size:32px;font-weight:900;color:var(--text-primary);">${totalBeds}</div>
              <div style="font-size:11px;color:var(--text-muted);">Total Beds</div>
            </div>
            <div style="text-align:center;">
              <div style="font-size:32px;font-weight:900;color:${occPctTotal >= 85 ? 'var(--red)' : occPctTotal >= 70 ? 'var(--amber)' : 'var(--accent)'};">${occPctTotal}%</div>
              <div style="font-size:11px;color:var(--text-muted);">Occupancy</div>
            </div>
          </div>
        </div>
      </div>

      <!-- All Facility Comparison -->
      <div class="section-title">All Facilities — ICU Snapshot</div>
      <div style="display:grid;grid-template-columns:repeat(5,1fr);gap:10px;margin-bottom:20px;">
        ${facilities.map(f => {
            const pct = Math.round(((f.icuTotal - f.icuAvail) / f.icuTotal) * 100);
            const c = pct >= 85 ? 'red' : pct >= 70 ? 'amber' : 'green';
            return `
            <div class="card" style="padding:14px;cursor:pointer;${f.id === selectedFacility ? 'border-color:var(--accent);background:var(--accent-dim);' : ''}" onclick="document.getElementById('facility-select').value='${f.id}';triggerSelectChange()">
              <div style="font-size:11px;font-weight:700;color:var(--text-muted);">${f.id}</div>
              <div style="font-size:12px;font-weight:600;margin:4px 0;">${f.name.split(' ').slice(0, 3).join(' ')}</div>
              <div style="font-size:24px;font-weight:900;color:var(--${c});">${f.icuAvail}</div>
              <div style="font-size:10px;color:var(--text-muted);">of ${f.icuTotal} ICU avail</div>
              <div class="progress-bar mt-12" style="height:4px;"><div class="progress-fill ${c}" style="width:${pct}%"></div></div>
            </div>`;
        }).join('')}
      </div>

      <!-- Unit Breakdown -->
      <div class="section-title">Unit Bed Status — ${fac?.name}</div>
      ${units.length === 0 ? `<div class="card" style="text-align:center;padding:40px;color:var(--text-muted);">No detailed data for this facility. Switch to Korle Bu or Komfo Anokye for full breakdown.</div>` :
                `<div style="display:flex;flex-direction:column;gap:12px;">
        ${units.map(unit => {
                    const pct = occPct(unit);
                    const c = occColor(pct);
                    return `
            <div class="card" style="padding:16px;">
              <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:10px;margin-bottom:10px;">
                <div>
                  <div style="font-size:14px;font-weight:700;">${unit.unit}</div>
                  <div style="font-size:11px;color:var(--text-muted);">Total: ${unit.beds} beds${unit.ventBeds ? ` • ${unit.ventBeds} ventilated` : ''}</div>
                </div>
                <div style="display:flex;gap:12px;align-items:center;flex-wrap:wrap;">
                  <span class="badge badge-available">${unit.avail} Available</span>
                  <span class="badge badge-occupied">${unit.occupied} Occupied</span>
                  ${unit.cleaning ? `<span class="badge badge-cleaning">${unit.cleaning} Cleaning</span>` : ''}
                  ${unit.reserved ? `<span class="badge badge-reserved">${unit.reserved} Reserved</span>` : ''}
                  ${unit.oos ? `<span class="badge badge-oos">${unit.oos} OOS</span>` : ''}
                  <span style="font-size:20px;font-weight:800;color:var(--${c});">${pct}%</span>
                </div>
              </div>
              <div class="progress-bar" style="height:6px;">
                <div class="progress-fill ${c}" style="width:${pct}%"></div>
              </div>
              ${unit.ventBeds ? `
              <div style="margin-top:10px;">
                <div style="font-size:11px;color:var(--text-muted);margin-bottom:6px;">Ventilated bed positions</div>
                <div style="display:flex;flex-wrap:wrap;gap:6px;">
                  ${Array.from({ length: unit.beds }, (_, i) => {
                        const isVent = i < unit.ventBeds;
                        const status = i < unit.occupied ? 'occupied' : i < unit.occupied + unit.cleaning ? 'cleaning' : i < unit.occupied + unit.cleaning + unit.reserved ? 'reserved' : 'available';
                        return `<div class="bed-cell ${status}" style="width:50px;height:50px;font-size:9px;">
                      ${isVent ? '<div class="vent-tag" title="Ventilator"></div>' : ''}
                      <div class="bed-id">B${i + 1}</div>
                      <div style="font-size:8px;margin-top:2px;">${isVent ? 'VENT' : ''}</div>
                    </div>`;
                    }).join('')}
                </div>
                <div style="margin-top:8px;display:flex;gap:12px;font-size:10px;color:var(--text-muted);">
                  <span style="display:flex;align-items:center;gap:4px;"><span style="width:8px;height:8px;border-radius:2px;background:var(--red);display:inline-block;"></span>Occupied</span>
                  <span style="display:flex;align-items:center;gap:4px;"><span style="width:8px;height:8px;border-radius:2px;background:var(--green);display:inline-block;"></span>Available</span>
                  <span style="display:flex;align-items:center;gap:4px;"><span style="width:8px;height:8px;border-radius:2px;background:var(--amber);display:inline-block;"></span>Cleaning</span>
                  <span style="display:flex;align-items:center;gap:4px;"><span style="width:8px;height:8px;border-radius:2px;background:var(--blue);display:inline-block;"></span>Reserved</span>
                  <span style="display:flex;align-items:center;gap:4px;"><span style="width:5px;height:5px;border-radius:50%;background:var(--blue);display:inline-block;"></span>Ventilator</span>
                </div>
              </div>` : ''}
            </div>`;
                }).join('')}
      </div>`}
    `;

        // Attach select change
        const sel = document.getElementById('facility-select');
        if (sel) sel.addEventListener('change', e => { selectedFacility = e.target.value; render(); });
    }

    window.triggerSelectChange = function () {
        selectedFacility = document.getElementById('facility-select')?.value || 'KBTH';
        render();
    };

    render();
}

function updateBedForm() {
    return `
    <div class="form-grid form-grid-2">
      <div class="form-group">
        <label class="form-label">Unit</label>
        <select class="form-select">
          <option>ICU</option><option>HDU</option><option>Emergency Department</option><option>Maternity</option>
        </select>
      </div>
      <div class="form-group">
        <label class="form-label">Shift</label>
        <select class="form-select"><option>Morning (07:00–15:00)</option><option>Afternoon (15:00–23:00)</option><option>Night (23:00–07:00)</option></select>
      </div>
      <div class="form-group">
        <label class="form-label">Available Beds</label>
        <input type="number" class="form-input" value="4" min="0"/>
      </div>
      <div class="form-group">
        <label class="form-label">Nurses on Duty</label>
        <input type="number" class="form-input" value="6" min="0"/>
      </div>
      <div class="form-group">
        <label class="form-label">Ventilators Available</label>
        <input type="number" class="form-input" value="3" min="0"/>
      </div>
      <div class="form-group">
        <label class="form-label">Oxygen Status</label>
        <select class="form-select"><option>Normal (≥3 bar)</option><option>Low (1–3 bar)</option><option>Critical (&lt;1 bar)</option><option>Outage</option></select>
      </div>
      <div class="form-group col-span-2" style="grid-column:span 2">
        <label class="form-label">Notes</label>
        <textarea class="form-textarea" placeholder="e.g. 2 beds reserved for incoming transfer, generator on backup..."></textarea>
      </div>
    </div>
    <div class="form-actions mt-16">
      <button class="btn btn-primary" onclick="showToast('Bed status updated — 23:28 UTC','success');closeModal();">Save Update</button>
      <button class="btn btn-ghost" onclick="closeModal()">Cancel</button>
    </div>`;
}
