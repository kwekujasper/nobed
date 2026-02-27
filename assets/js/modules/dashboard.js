// ================================================================
// Module: National Dashboard
// ================================================================
function renderDashboard(container) {
  initChart();
  const d = NDATA;

  // Compute national totals
  const totalFacilities = d.facilities.length;
  const totalICU = d.facilities.reduce((s, f) => s + f.icuTotal, 0);
  const availICU = d.facilities.reduce((s, f) => s + f.icuAvail, 0);
  const activeAmb = d.ambulances.filter(a => a.status !== 'offline').length;
  const enRoute = d.ambulances.filter(a => a.status === 'en-route').length;
  const pendingRefs = d.referrals.filter(r => r.status === 'pending').length;
  const critRefs = d.referrals.filter(r => r.status === 'pending' && r.urgency === 'critical').length;

  container.innerHTML = `
    <!-- KPI STRIP -->
    <div class="kpi-strip mb-20">
      <div class="kpi-item">
        <div class="kpi-item-value text-red">${critRefs}</div>
        <div class="kpi-item-label">Critical Referrals Pending</div>
      </div>
      <div class="kpi-item">
        <div class="kpi-item-value text-amber">${pendingRefs}</div>
        <div class="kpi-item-label">Active Referrals</div>
      </div>
      <div class="kpi-item">
        <div class="kpi-item-value text-accent">${availICU}</div>
        <div class="kpi-item-label">ICU Beds Available</div>
      </div>
      <div class="kpi-item">
        <div class="kpi-item-value">${totalICU}</div>
        <div class="kpi-item-label">Total ICU Capacity</div>
      </div>
      <div class="kpi-item">
        <div class="kpi-item-value text-green">${activeAmb}</div>
        <div class="kpi-item-label">Ambulances Active</div>
      </div>
      <div class="kpi-item">
        <div class="kpi-item-value text-amber">${enRoute}</div>
        <div class="kpi-item-label">En-Route Now</div>
      </div>
      <div class="kpi-item">
        <div class="kpi-item-value">${d.incidents.filter(i => i.status === 'active').length}</div>
        <div class="kpi-item-label">Active Incidents</div>
      </div>
      <div class="kpi-item">
        <div class="kpi-item-value">${totalFacilities}</div>
        <div class="kpi-item-label">Facilities Online</div>
      </div>
    </div>

    <div class="grid-3 gap-12 mb-16">
      <!-- Bed Heatmap -->
      <div class="card col-span-2">
        <div class="card-header">
          <span class="card-title">National ICU & Bed Heatmap</span>
          <div style="display:flex;gap:8px;font-size:11px;color:var(--text-muted);align-items:center;">
            <span style="display:flex;align-items:center;gap:4px;"><span style="width:8px;height:8px;border-radius:2px;background:var(--green);display:inline-block;"></span> Low</span>
            <span style="display:flex;align-items:center;gap:4px;"><span style="width:8px;height:8px;border-radius:2px;background:var(--amber);display:inline-block;"></span> Med</span>
            <span style="display:flex;align-items:center;gap:4px;"><span style="width:8px;height:8px;border-radius:2px;background:var(--red);display:inline-block;"></span> High</span>
          </div>
        </div>
        <div style="display:grid;grid-template-columns:repeat(5,1fr);gap:8px;" id="heatmap-grid">
          ${d.facilities.map(f => {
    const pct = Math.round(((f.icuTotal - f.icuAvail) / f.icuTotal) * 100);
    const cls = pct >= 85 ? 'heat-critical' : pct >= 70 ? 'heat-high' : pct >= 50 ? 'heat-med' : 'heat-low';
    return `<div class="heatmap-cell ${cls}" onclick="window.location.hash='beds'" title="${f.name}">
              <div style="font-size:11px;font-weight:700;margin-bottom:4px;">${f.id}</div>
              <div style="font-size:10px;">${f.name.split(' ').slice(0, 2).join(' ')}</div>
              <div style="font-size:16px;font-weight:900;margin:4px 0;">${pct}%</div>
              <div style="font-size:10px;opacity:0.8;">${f.icuAvail}/${f.icuTotal} avail</div>
            </div>`;
  }).join('')}
        </div>
        <div style="margin-top:14px;font-size:12px;color:var(--text-muted);">Click any facility to view detailed bed status</div>
      </div>

      <!-- Active Incidents -->
      <div class="card red-card">
        <div class="card-header">
          <span class="card-title">Active Incidents</span>
          <span class="badge badge-critical">${d.incidents.filter(i => i.status === 'active').length} ACTIVE</span>
        </div>
        <div style="display:flex;flex-direction:column;gap:10px;">
          ${d.incidents.map(inc => `
            <div style="background:var(--bg-surface);border-radius:var(--radius-sm);padding:12px;border-left:3px solid ${inc.status === 'active' ? 'var(--red)' : inc.status === 'in-progress' ? 'var(--amber)' : 'var(--border)'};">
              <div style="font-size:12px;font-weight:700;margin-bottom:4px;">${inc.title}</div>
              <div style="font-size:11px;color:var(--text-muted);">${inc.location}</div>
              <div style="display:flex;justify-content:space-between;margin-top:6px;font-size:11px;">
                <span class="text-red">⚠ ${inc.critical} critical</span>
                <span class="font-mono" style="color:var(--text-muted);">${inc.time}</span>
              </div>
              <div style="font-size:11px;color:var(--text-muted);margin-top:2px;">${inc.ambulances.length} unit(s) dispatched</div>
            </div>
          `).join('')}
        </div>
      </div>
    </div>

    <div class="grid-3 gap-12 mb-16">
      <!-- Regional Status -->
      <div class="card">
        <div class="card-header"><span class="card-title">Regional ICU Occupancy</span></div>
        <div style="height:220px;" class="chart-container"><canvas id="chart-regional"></canvas></div>
      </div>

      <!-- Live Referrals -->
      <div class="card col-span-2">
        <div class="card-header">
          <span class="card-title">Live Referral Queue</span>
          <button class="btn btn-primary" onclick="window.location.hash='referral'" style="font-size:11px;padding:6px 12px;">
            <svg viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            New Referral
          </button>
        </div>
        <div class="table-wrap">
          <table>
            <thead><tr><th>ID</th><th>Patient</th><th>Service Required</th><th>Urgency</th><th>Status</th><th>SLA</th></tr></thead>
            <tbody>
              ${d.referrals.slice(0, 5).map(r => `
                <tr onclick="window.location.hash='referral'" style="cursor:pointer;">
                  <td class="font-mono text-accent" style="font-size:11px;">${r.id}</td>
                  <td>${r.patient}</td>
                  <td style="font-size:12px;">${r.service}</td>
                  <td>${urgencyBadge(r.urgency)}</td>
                  <td>${renderRefStatus(r.status)}</td>
                  <td>${r.status === 'pending' ? `<span class="sla-timer" id="sla-${r.id}">--:--</span>` : '<span class="text-muted font-mono" style="font-size:11px;">N/A</span>'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <div class="grid-4 gap-12">
      <!-- Ambulance Summary -->
      <div class="card">
        <div class="card-header"><span class="card-title">Fleet Status</span></div>
        ${['available', 'en-route', 'on-scene', 'offline'].map(s => {
    const cnt = d.ambulances.filter(a => a.status === s).length;
    const colors = { available: 'var(--green)', 'en-route': 'var(--amber)', 'on-scene': 'var(--red)', offline: 'var(--text-muted)' };
    return `<div style="display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px solid var(--border);">
            <div style="display:flex;align-items:center;gap:8px;">
              <span style="width:8px;height:8px;border-radius:50%;background:${colors[s]};flex-shrink:0;"></span>
              <span style="font-size:12px;text-transform:capitalize;">${s}</span>
            </div>
            <span style="font-size:18px;font-weight:800;color:${colors[s]};">${cnt}</span>
          </div>`;
  }).join('')}
        <button class="btn btn-ghost mt-12" style="width:100%;font-size:12px;" onclick="window.location.hash='emt'">View Full Fleet →</button>
      </div>

      <!-- ED Congestion -->
      <div class="card amber-card">
        <div class="card-header">
          <span class="card-title">ED Congestion</span>
          <div class="card-icon amber"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg></div>
        </div>
        ${[
      { name: 'Korle Bu ED', load: 40, cap: 40, pct: 100 },
      { name: 'Tema General ED', load: 29, cap: 30, pct: 97 },
      { name: 'Ridge Hospital ED', load: 22, cap: 30, pct: 73 },
      { name: '37 Military ED', load: 14, cap: 25, pct: 56 },
    ].map(ed => {
      const c = ed.pct >= 90 ? 'red' : ed.pct >= 70 ? 'amber' : 'green';
      return `<div style="margin-bottom:12px;">
            <div class="progress-label"><span>${ed.name}</span><span class="text-${c}">${ed.pct}%</span></div>
            <div class="progress-bar"><div class="progress-fill ${c}" style="width:${ed.pct}%"></div></div>
            <div style="font-size:10px;color:var(--text-muted);margin-top:2px;">${ed.load}/${ed.cap} patients</div>
          </div>`;
    }).join('')}
      </div>

      <!-- Oxygen & Power -->
      <div class="card">
        <div class="card-header"><span class="card-title">Critical Infrastructure</span></div>
        ${[
      { label: 'KBTH Oxygen', val: 4.2, unit: 'bar', ok: true },
      { label: 'KBTH Generator', val: 72, unit: '% fuel', ok: true },
      { label: 'KATH Oxygen', val: 3.1, unit: 'bar', ok: true },
      { label: 'TTH Oxygen', val: 1.8, unit: 'bar', ok: false },
      { label: 'RID Generator', val: 38, unit: '% fuel', ok: false },
    ].map(item => `
          <div style="display:flex;justify-content:space-between;align-items:center;padding:7px 0;border-bottom:1px solid var(--border);font-size:12px;">
            <span style="color:var(--text-secondary);">${item.label}</span>
            <span style="color:${item.ok ? 'var(--green)' : 'var(--red)'};font-weight:700;font-family:'JetBrains Mono',monospace;">${item.val} ${item.unit}</span>
          </div>`).join('')}
      </div>

      <!-- Equipment Faults -->
      <div class="card red-card">
        <div class="card-header">
          <span class="card-title">Equipment Alerts</span>
          <span class="badge badge-faulty" style="margin-left:auto;">${NDATA.equipment.filter(e => e.status !== 'functional').length} Issues</span>
        </div>
        ${NDATA.equipment.filter(e => e.status !== 'functional').slice(0, 4).map(eq => `
          <div style="padding:8px 0;border-bottom:1px solid var(--border);">
            <div style="display:flex;justify-content:space-between;align-items:flex-start;">
              <span style="font-size:12px;font-weight:600;">${eq.name.substring(0, 28)}…</span>
              ${statusBadge(eq.status)}
            </div>
            <div style="font-size:11px;color:var(--text-muted);margin-top:2px;">${eq.facility} — ${eq.dept}</div>
          </div>`).join('')}
        <button class="btn btn-ghost mt-12" style="width:100%;font-size:12px;" onclick="window.location.hash='equipment'">View Equipment →</button>
      </div>

      <!-- === CITIZEN PUBLIC ALERTS === -->
      <div class="card" style="grid-column:span 2;">
        <div class="card-header">
          <span class="card-title">🆘 Citizen Alerts Inbox</span>
          <span class="badge badge-critical" style="animation:pulse-red 1.5s infinite;">${NDATA.publicAlerts ? NDATA.publicAlerts.filter(a => a.status === 'New' || a.status === 'En Route' || a.status === 'Dispatched').length + ' Active' : '0 Active'}</span>
          <button class="btn btn-ghost" style="font-size:11px;" onclick="window.location.hash='emt'">→ EMT Dispatch</button>
        </div>
        <div id="dash-public-alerts" style="padding:8px 12px;">
          <!-- filled by refreshDashPublicAlerts -->
        </div>
      </div>

    </div>
  `;


  // Start SLA timers
  NDATA.referrals.filter(r => r.status === 'pending').forEach(r => {
    startSLATimer(`sla-${r.id}`, r.slaRemain);
  });

  // Populate citizen alerts inbox
  setTimeout(() => {
    const el = document.getElementById('dash-public-alerts');
    if (el && window.refreshDashPublicAlerts) refreshDashPublicAlerts(el);
  }, 50);

  // Regional chart
  setTimeout(() => {
    const ctx = document.getElementById('chart-regional');
    if (!ctx) return;
    const labels = NDATA.analytics.regionalICUOccupancy.labels;
    const data = NDATA.analytics.regionalICUOccupancy.data;
    registerChart(new Chart(ctx, {
      type: 'bar',
      data: {
        labels,
        datasets: [{
          data,
          backgroundColor: data.map(v => v >= 85 ? 'rgba(255,59,59,0.6)' : v >= 65 ? 'rgba(245,158,11,0.6)' : 'rgba(0,212,170,0.6)'),
          borderColor: data.map(v => v >= 85 ? 'var(--red)' : v >= 65 ? 'var(--amber)' : 'var(--accent)'),
          borderWidth: 1, borderRadius: 6,
        }]
      },
      options: { ...chartOpts(), plugins: { ...chartOpts().plugins, legend: { display: false } }, scales: { y: { ...chartOpts().scales.y, max: 100, ticks: { ...chartOpts().scales.y.ticks, callback: v => v + '%' } }, x: chartOpts().scales.x } }
    }));
  }, 100);
}

function renderRefStatus(s) {
  const map = {
    pending: '<span class="badge badge-critical">PENDING</span>',
    accepted: '<span class="badge badge-available">ACCEPTED</span>',
    declined: '<span class="badge badge-faulty">DECLINED</span>',
    'en-route': '<span class="badge badge-reserved">EN ROUTE</span>',
    escalated: '<span class="badge badge-urgent">ESCALATED</span>',
  };
  return map[s] || s;
}
