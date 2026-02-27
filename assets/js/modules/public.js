// ================================================================
// Module: Public Interface
// ================================================================
function renderPublic(container) {
    container.innerHTML = `
    <div class="page-header">
      <div class="page-header-left">
        <h1>Public Emergency Interface</h1>
        <p>Real-time hospital lookup, nearest ED finder, basic first aid</p>
      </div>
      <div style="padding:6px 14px;background:var(--green-dim);border:1px solid rgba(34,197,94,0.3);border-radius:var(--radius-sm);font-size:12px;color:var(--green);font-weight:600;">
        🌐 Public Facing View
      </div>
    </div>

    <!-- Emergency Number Banner -->
    <div class="card mb-20" style="background:linear-gradient(135deg,var(--red-dim),rgba(0,0,0,0));border-color:rgba(255,59,59,0.3);text-align:center;padding:28px;">
      <div style="font-size:14px;color:var(--text-muted);margin-bottom:6px;">NATIONAL EMERGENCY SERVICES</div>
      <div style="display:flex;justify-content:center;gap:30px;flex-wrap:wrap;">
        ${[
            { label: 'Ambulance / GNEMS', num: '193' },
            { label: 'Police', num: '191' },
            { label: 'Fire Service', num: '192' },
            { label: 'NECHIS Command', num: '0800-NECHIS' },
        ].map(e => `
          <div>
            <div style="font-size:40px;font-weight:900;color:var(--red);font-family:'JetBrains Mono',monospace;letter-spacing:2px;">${e.num}</div>
            <div style="font-size:12px;color:var(--text-muted);">${e.label}</div>
          </div>`).join('')}
      </div>
    </div>

    <!-- Hospital Finder -->
    <div class="section-title mb-12">Find a Hospital — Real-Time Bed Availability</div>
    <div style="display:flex;gap:10px;margin-bottom:16px;flex-wrap:wrap;">
      <input type="text" class="form-input" placeholder="Search by name, region, or service..." style="flex:1;max-width:400px;" id="hosp-search" oninput="filterHospitals(this.value)"/>
      <select class="form-select" style="width:160px;" id="hosp-region" onchange="filterHospitals(document.getElementById('hosp-search').value)">
        <option value="all">All Regions</option>
        ${NDATA.regions.map(r => `<option value="${r.name}">${r.name}</option>`).join('')}
      </select>
      <select class="form-select" style="width:160px;" id="hosp-service">
        <option value="all">All Services</option>
        <option value="ICU">ICU</option>
        <option value="Emergency">Emergency</option>
        <option value="Paediatrics">Paediatrics</option>
        <option value="Maternity">Maternity</option>
      </select>
    </div>
    <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:14px;margin-bottom:24px;" id="hosp-grid">
      ${NDATA.facilities.map(f => hospitalCard(f)).join('')}
    </div>

    <!-- First Aid -->
    <div class="section-title mb-12">Emergency First Aid Guide</div>
    <div class="grid-3 gap-12">
      ${[
            {
                title: 'Cardiac Arrest (CPR)',
                icon: '❤️',
                steps: ['Call 193 immediately', 'Place hands centre of chest', 'Push hard & fast — 100–120/min', 'Give rescue breaths if trained', 'Don\'t stop until help arrives or AED available']
            },
            {
                title: 'Major Bleeding',
                icon: '🩸',
                steps: ['Apply firm, direct pressure', 'Use a clean cloth or dressing', 'Do NOT remove if cloth soaks — add more on top', 'If limb — consider tourniquet if trained', 'Keep patient warm & still']
            },
            {
                title: 'Stroke Signs (FAST)',
                icon: '🧠',
                steps: ['Face: Is one side drooping?', 'Arms: Can they raise both? (one weak?)', 'Speech: Slurred or strange?', 'Time: Call 193 IMMEDIATELY', 'Note time of symptom onset']
            },
            {
                title: 'Road Traffic Accident',
                icon: '🚗',
                steps: ['Safety first — don\'t be next victim', 'Call 193 — give exact location', 'Don\'t move casualties unless in danger', 'Control bleeding, keep warm', 'Stay on line with dispatcher']
            },
            {
                title: 'Choking — Adult',
                icon: '😮',
                steps: ['Encourage coughing if they can', '5 back blows — heel of hand', '5 abdominal thrusts (Heimlich)', 'Alternate back blows & abdominal thrusts', 'If unconscious — CPR']
            },
            {
                title: 'Severe Burns',
                icon: '🔥',
                steps: ['Cool with cool (not cold) water 20 min', 'Remove loose clothing — not stuck', 'Cover loosely — cling film or clean bag', 'Do NOT apply cream/toothpaste', 'All major burns → 193 / ED']
            },
        ].map(fa => `
        <div class="card" style="padding:18px;">
          <div style="font-size:28px;margin-bottom:8px;">${fa.icon}</div>
          <div style="font-size:13px;font-weight:700;margin-bottom:12px;">${fa.title}</div>
          <ol style="padding-left:18px;margin:0;display:flex;flex-direction:column;gap:6px;">
            ${fa.steps.map(s => `<li style="font-size:12px;color:var(--text-secondary);">${s}</li>`).join('')}
          </ol>
        </div>`).join('')}
    </div>

    <!-- COVID/Outbreak -->
    <div class="card mt-20">
      <div class="card-header"><span class="card-title">Current Health Advisories</span><span class="badge badge-available">Updated 25 Feb 2026</span></div>
      <div style="display:flex;flex-direction:column;gap:10px;">
        ${[
            { icon: '💉', title: 'National Vaccination Drive', body: 'Ongoing meningitis vaccination campaign — Greater Accra, Eastern, Central regions. Find your nearest clinic at nhis.gov.gh', level: 'info' },
            { icon: '🦟', title: 'Cholera Preparedness Alert', body: 'Heightened monitoring in coastal communities. Wash hands, drink clean water, report any clustering of diarrhoea cases to GHS.', level: 'warning' },
            { icon: '🏥', title: 'Blood Donation Drive', body: 'All blood groups urgently needed. Donate at any NBTS centre or major teaching hospital. Call 0302-667625.', level: 'info' },
        ].map(a => `
          <div style="display:flex;gap:14px;padding:14px;background:var(--bg-surface);border-radius:var(--radius-sm);border-left:3px solid ${a.level === 'warning' ? 'var(--amber)' : 'var(--accent)'};">
            <span style="font-size:22px;flex-shrink:0;">${a.icon}</span>
            <div>
              <div style="font-size:13px;font-weight:700;margin-bottom:4px;">${a.title}</div>
              <div style="font-size:12px;color:var(--text-secondary);">${a.body}</div>
            </div>
          </div>`).join('')}
      </div>
    </div>
  `;

    window.filterHospitals = function (q) {
        const region = document.getElementById('hosp-region')?.value || 'all';
        const filtered = NDATA.facilities.filter(f =>
            (region === 'all' || f.region === region) &&
            (!q || f.name.toLowerCase().includes(q.toLowerCase()) || f.region.toLowerCase().includes(q.toLowerCase()))
        );
        const grid = document.getElementById('hosp-grid');
        if (grid) grid.innerHTML = filtered.map(f => hospitalCard(f)).join('');
    };
}

function hospitalCard(f) {
    const pct = Math.round(((f.icuTotal - f.icuAvail) / f.icuTotal) * 100);
    const c = pct >= 85 ? 'red' : pct >= 70 ? 'amber' : 'green';
    return `
    <div class="card" style="padding:16px;">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:8px;">
        <div>
          <div style="font-size:13px;font-weight:700;">${f.name}</div>
          <div style="font-size:11px;color:var(--text-muted);">${f.level} • ${f.region} Region</div>
        </div>
        <span class="badge ${f.icuAvail > 0 ? 'badge-available' : 'badge-critical'}">${f.icuAvail > 0 ? 'BED AVAIL' : 'FULL'}</span>
      </div>
      <div style="display:flex;justify-content:space-between;font-size:12px;margin-bottom:10px;">
        <span>ICU: <strong style="color:var(--${c});">${f.icuAvail}/${f.icuTotal}</strong></span>
        <span>Tel: <strong>${f.tel}</strong></span>
      </div>
      <div class="progress-bar" style="height:4px;margin-bottom:10px;">
        <div class="progress-fill ${c}" style="width:${pct}%"></div>
      </div>
      <div style="display:flex;gap:6px;flex-wrap:wrap;">
        ${f.services.slice(0, 3).map(s => `<span class="equip-tag" style="font-size:10px;">${s}</span>`).join('')}
        ${f.services.length > 3 ? `<span class="equip-tag" style="font-size:10px;">+${f.services.length - 3} more</span>` : ''}
      </div>
      <div style="display:flex;gap:8px;margin-top:10px;">
        <a href="tel:${f.tel}" class="btn btn-primary" style="font-size:11px;padding:6px 12px;text-decoration:none;flex:1;text-align:center;">📞 Call</a>
        <a target="_blank" href="https://www.google.com/maps/search/${encodeURIComponent(f.name + ', Ghana')}" class="btn btn-ghost" style="font-size:11px;padding:6px 12px;text-decoration:none;">📍 Map</a>
      </div>
    </div>`;
}

window.filterHospitals = function () { };
