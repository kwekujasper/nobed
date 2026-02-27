// ================================================================
// Module: Analytics & QI Dashboard
// ================================================================
function renderAnalytics(container) {
  initChart();
  const a = NDATA.analytics;

  container.innerHTML = `
    <div class="page-header">
      <div class="page-header-left">
        <h1>Analytics & Quality Improvement</h1>
        <p>National KPIs, performance scorecards, predictive indicators</p>
      </div>
      <div class="page-header-actions">
        <select class="form-select" style="width:140px;"><option>Feb 2026</option><option>Jan 2026</option><option>Dec 2025</option></select>
        <button class="btn btn-ghost" onclick="exportAnalyticsCSV()">
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
          Export CSV
        </button>
        <button class="btn btn-ghost" onclick="printAnalytics()">
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
          Print Report
        </button>
      </div>
    </div>

    <!-- National KPI Cards -->
    <div class="grid-4 gap-12 mb-20">
      ${[
      { l: 'Avg Referral Accept', v: a.kpis.avgReferralAcceptMin + ' min', target: '< 30 min', ok: a.kpis.avgReferralAcceptMin < 30, icon: '⏱' },
      { l: 'ICU Wait Time', v: a.kpis.avgICUWaitHr + ' hrs', target: '< 4 hrs', ok: a.kpis.avgICUWaitHr < 4, icon: '🏥' },
      { l: 'ED Boarding Rate', v: a.kpis.edBoardingPct + '%', target: '< 10%', ok: a.kpis.edBoardingPct < 10, icon: '⚡' },
      { l: 'Ambulance Response', v: a.kpis.avgAmbResponseMin + ' min', target: '< 15 min', ok: a.kpis.avgAmbResponseMin < 15, icon: '🚑' },
      { l: 'Referral SLA Met', v: a.kpis.refSLAPct + '%', target: '> 90%', ok: a.kpis.refSLAPct >= 90, icon: '✓' },
      { l: 'ICU Occupancy', v: a.kpis.icuOccupancyPct + '%', target: '< 85%', ok: a.kpis.icuOccupancyPct < 85, icon: '📊' },
      { l: 'Declined Referrals', v: a.kpis.declinedRefPct + '%', target: '< 5%', ok: a.kpis.declinedRefPct < 5, icon: '❌' },
      { l: 'Ventilator Util.', v: a.kpis.ventutilPct + '%', target: '< 80%', ok: a.kpis.ventutilPct < 80, icon: '💨' },
    ].map(k => `
        <div class="card" style="padding:16px;">
          <div style="font-size:18px;margin-bottom:6px;">${k.icon}</div>
          <div style="font-size:24px;font-weight:900;color:${k.ok ? 'var(--green)' : 'var(--red)'};">${k.v}</div>
          <div style="font-size:11px;font-weight:600;color:var(--text-secondary);">${k.l}</div>
          <div style="font-size:10px;color:var(--text-muted);margin-top:2px;">Target: ${k.target}</div>
          <div style="font-size:10px;margin-top:4px;color:${k.ok ? 'var(--green)' : 'var(--red)'};">${k.ok ? '✓ On target' : '✗ Below target'}</div>
        </div>`).join('')}
    </div>

    <div class="grid-2 gap-16 mb-16">
      <!-- Trends Chart -->
      <div class="card">
        <div class="card-header"><span class="card-title">Referral Acceptance Trend (6 months)</span></div>
        <div class="chart-container" style="height:220px;"><canvas id="chart-ref-trend"></canvas></div>
      </div>

      <!-- ICU Occupancy Scatter -->
      <div class="card">
        <div class="card-header"><span class="card-title">ED Boarding Trend</span></div>
        <div class="chart-container" style="height:220px;"><canvas id="chart-ed-boarding"></canvas></div>
      </div>
    </div>

    <div class="grid-2 gap-16 mb-16">
      <!-- Predictive Congestion -->
      <div class="card amber-card">
        <div class="card-header"><span class="card-title">Predictive Congestion — Next 72h</span><span class="badge badge-urgent">AI Forecast</span></div>
        <div class="chart-container" style="height:200px;"><canvas id="chart-predict"></canvas></div>
        <div style="font-size:12px;color:var(--amber);margin-top:8px;">⚠ KBU & KAT forecast to hit 95%+ occupancy by Thursday 18:00 — recommend pre-emptive surge measures</div>
      </div>

      <!-- Ambulance Response Distribution -->
      <div class="card">
        <div class="card-header"><span class="card-title">Response Time Distribution</span></div>
        <div class="chart-container" style="height:200px;"><canvas id="chart-response"></canvas></div>
      </div>
    </div>

    <!-- Facility Scorecards -->
    <div class="section-title mb-12">Facility Performance Scorecards</div>
    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Facility</th><th>SLA Compliance</th><th>Avg Response</th><th>ICU Occ.</th><th>ED Boarding</th><th>Referral Rate</th><th>Decline Rate</th><th>Score</th>
          </tr>
        </thead>
        <tbody>
          ${a.facilityScores.map(f => {
      const c = f.score >= 80 ? 'green' : f.score >= 60 ? 'amber' : 'red';
      return `
              <tr>
                <td style="font-weight:600;">${f.facility}</td>
                <td><span class="${f.sla >= 90 ? 'text-green' : f.sla >= 75 ? 'text-amber' : 'text-red'}">${f.sla}%</span></td>
                <td class="font-mono" style="font-size:12px;">${f.resp} min</td>
                <td><span class="${f.icuOcc <= 80 ? 'text-green' : f.icuOcc <= 90 ? 'text-amber' : 'text-red'}">${f.icuOcc}%</span></td>
                <td>${f.boarding}%</td>
                <td>${f.refRate}%</td>
                <td style="color:${f.declineRate > 5 ? 'var(--red)' : 'var(--green)'};">${f.declineRate}%</td>
                <td>
                  <div style="display:flex;align-items:center;gap:8px;">
                    <div class="progress-bar" style="width:80px;height:6px;">
                      <div class="progress-fill ${c}" style="width:${f.score}%"></div>
                    </div>
                    <span style="font-size:13px;font-weight:800;color:var(--${c});">${f.score}</span>
                  </div>
                </td>
              </tr>`;
    }).join('')}
        </tbody>
      </table>
    </div>
  `;

  setTimeout(() => {
    const months = ['Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb'];

    // Referral trend
    const rctx = document.getElementById('chart-ref-trend');
    if (rctx) registerChart(new Chart(rctx, {
      type: 'line',
      data: {
        labels: months, datasets: [
          { label: 'Accept Rate %', data: [72, 78, 75, 81, 85, 88], borderColor: 'var(--accent)', tension: 0.4, fill: true, backgroundColor: 'rgba(0,212,170,0.08)', pointRadius: 4 },
          { label: 'Decline Rate %', data: [18, 14, 16, 11, 9, 8], borderColor: 'var(--red)', tension: 0.4, fill: false, pointRadius: 4 },
        ]
      },
      options: chartOpts()
    }));

    // ED Boarding
    const edctx = document.getElementById('chart-ed-boarding');
    if (edctx) registerChart(new Chart(edctx, {
      type: 'bar',
      data: {
        labels: months, datasets: [
          { label: 'ED Boarding %', data: [14, 16, 12, 18, 22, 19], backgroundColor: 'rgba(245,158,11,0.5)', borderColor: 'var(--amber)', borderWidth: 1, borderRadius: 4 },
        ]
      },
      options: { ...chartOpts(), plugins: { ...chartOpts().plugins, legend: { display: false } } }
    }));

    // Predictive
    const pred = ['08:00', '12:00', '16:00', '20:00', '00:00', '04:00', '08:00', '12:00', '16:00', '20:00', '00:00', '04:00', '08:00', '12:00'];
    const pctx = document.getElementById('chart-predict');
    if (pctx) registerChart(new Chart(pctx, {
      type: 'line',
      data: {
        labels: pred, datasets: [
          { label: 'KBU Forecast', data: [82, 85, 87, 90, 91, 88, 90, 93, 96, 98, 100, 99, 100, 102], borderColor: 'var(--red)', tension: 0.4, fill: true, backgroundColor: 'rgba(255,59,59,0.07)', pointRadius: 3 },
          { label: 'KAT Forecast', data: [72, 74, 76, 80, 78, 75, 78, 82, 88, 92, 95, 98, 99, 100], borderColor: 'var(--amber)', tension: 0.4, fill: false, pointRadius: 3 },
        ]
      },
      options: { ...chartOpts(), scales: { y: { ...chartOpts().scales.y, max: 110, ticks: { ...chartOpts().scales.y.ticks, callback: v => v + '%' } }, x: chartOpts().scales.x } }
    }));

    // Response time
    const rctx2 = document.getElementById('chart-response');
    if (rctx2) registerChart(new Chart(rctx2, {
      type: 'bar',
      data: {
        labels: ['<5m', '5-10m', '10-15m', '15-20m', '20-30m', '>30m'], datasets: [{
          data: [8, 22, 31, 18, 12, 9],
          backgroundColor: 'rgba(0,212,170,0.5)', borderColor: 'var(--accent)', borderWidth: 1, borderRadius: 4
        }]
      },
      options: { ...chartOpts(), plugins: { ...chartOpts().plugins, legend: { display: false } } }
    }));
  }, 100);
}
