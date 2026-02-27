// ================================================================
// Module: Vitals Monitor (Live ICU/HDU)
// ================================================================
let vitalsCharts = [];
let vitalsInterval = null;

function renderVitals(container) {
    container.innerHTML = `
    <div class="page-header">
      <div class="page-header-left">
        <h1>Live Vitals Monitor</h1>
        <p>Real-time patient vitals — ICU, HDU & Field Units</p>
      </div>
      <div class="page-header-actions">
        <select class="form-select" id="vitals-facility" style="width:220px;" onchange="filterVitalsFacility(this.value)">
          <option value="all">All Facilities</option>
          ${[...new Set(NDATA.vitalsMonitor.map(v => v.facility))].map(f => `<option value="${f}">${f}</option>`).join('')}
        </select>
        <div class="badge badge-critical" style="font-size:11px;padding:6px 12px;">
          ${NDATA.vitalsMonitor.filter(v => v.status === 'critical').length} CRITICAL
        </div>
      </div>
    </div>

    <!-- Alert Banner -->
    ${NDATA.vitalsMonitor.some(v => v.status === 'critical') ? `
    <div style="background:var(--red-dim);border:1px solid rgba(255,59,59,0.3);border-radius:var(--radius-md);padding:12px 16px;margin-bottom:16px;display:flex;align-items:center;gap:12px;">
      <span style="font-size:20px;">🚨</span>
      <div>
        <div style="font-size:13px;font-weight:700;color:var(--red);">Critical Vitals Alert</div>
        <div style="font-size:12px;color:var(--text-secondary);">
          ${NDATA.vitalsMonitor.filter(v => v.status === 'critical').map(v => `${v.name} [${v.bed}]: ${v.alerts.join(', ')}`).join(' | ')}
        </div>
      </div>
    </div>` : ''}

    <div id="vitals-grid" class="grid-2 gap-16">
      ${NDATA.vitalsMonitor.map((pt, idx) => patientVitalsCard(pt, idx)).join('')}
    </div>
  `;

    // Draw ECG charts
    setTimeout(() => {
        NDATA.vitalsMonitor.forEach((pt, idx) => {
            drawECG(`ecg-${idx}`, pt.status);
        });
        vitalsInterval = setInterval(() => updateVitals(), 3000);
    }, 200);
}

function patientVitalsCard(pt, idx) {
    const borderColor = pt.status === 'critical' ? 'var(--red)' : pt.status === 'warning' ? 'var(--amber)' : 'var(--border)';
    const alerts = pt.alerts.length > 0;
    return `
    <div class="card ${pt.status === 'critical' ? 'red-card' : ''}" style="border-color:${borderColor};">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;flex-wrap:wrap;gap:8px;">
        <div>
          <div style="display:flex;align-items:center;gap:8px;">
            <span style="font-size:15px;font-weight:700;">${pt.name}</span>
            <span class="badge ${pt.status === 'critical' ? 'badge-critical' : pt.status === 'warning' ? 'badge-urgent' : 'badge-available'}">${pt.status.toUpperCase()}</span>
          </div>
          <div style="font-size:11px;color:var(--text-muted);margin-top:3px;">Bed: ${pt.bed} • ${pt.facility}</div>
        </div>
        <div style="display:flex;gap:8px;">
          <button class="btn btn-ghost" style="font-size:11px;padding:5px 10px;" onclick="window.location.hash='telemedicine'">📹 Consult</button>
          <button class="btn btn-ghost" style="font-size:11px;padding:5px 10px;" onclick="showVitalHistory('${pt.patientId}')">📈 History</button>
        </div>
      </div>

      ${alerts ? `<div style="background:var(--red-dim);border:1px solid rgba(255,59,59,0.2);border-radius:var(--radius-sm);padding:8px 12px;margin-bottom:12px;font-size:12px;color:var(--red);font-weight:600;">
        ⚠ ALERT: ${pt.alerts.join(' • ')}
      </div>` : ''}

      <!-- ECG Strip -->
      <div style="background:var(--bg-surface);border-radius:var(--radius-sm);padding:10px;margin-bottom:12px;">
        <div style="font-size:10px;color:var(--text-muted);margin-bottom:4px;">ECG — ${pt.vitals.ecg}</div>
        <canvas id="ecg-${idx}" height="60" style="width:100%;display:block;"></canvas>
      </div>

      <!-- Vitals Grid -->
      <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px;">
        ${[
            { l: 'HR', v: `${pt.vitals.hr}`, u: 'bpm', alert: pt.vitals.hr > 100 || pt.vitals.hr < 50, id: `v-hr-${idx}` },
            { l: 'BP', v: pt.vitals.bp, u: 'mmHg', alert: false, id: `v-bp-${idx}` },
            { l: 'SpO₂', v: `${pt.vitals.spo2}`, u: '%', alert: pt.vitals.spo2 < 94, id: `v-spo2-${idx}` },
            { l: 'RR', v: `${pt.vitals.rr}`, u: '/min', alert: pt.vitals.rr > 20 || pt.vitals.rr < 10, id: `v-rr-${idx}` },
            { l: 'Temp', v: `${pt.vitals.temp}`, u: '°C', alert: pt.vitals.temp > 38.5, id: `v-temp-${idx}` },
            { l: 'EtCO₂', v: pt.vitals.etco2 ? `${pt.vitals.etco2}` : '—', u: 'mmHg', alert: pt.vitals.etco2 && (pt.vitals.etco2 > 50 || pt.vitals.etco2 < 30), id: `v-etco2-${idx}` },
            { l: 'GCS', v: pt.vitals.gcs ? `${pt.vitals.gcs}/15` : '—', u: '', alert: pt.vitals.gcs && pt.vitals.gcs < 9, id: `v-gcs-${idx}` },
            { l: 'ICP', v: pt.vitals.icp !== null ? `${pt.vitals.icp}` : '—', u: 'mmHg', alert: pt.vitals.icp && pt.vitals.icp > 20, id: `v-icp-${idx}` },
        ].map(v => `
          <div class="vital-card ${v.alert ? 'critical' : ''}" style="${v.alert ? 'background:var(--red-dim);border-color:rgba(255,59,59,0.3);' : ''}">
            <div class="vital-label">${v.l}</div>
            <div class="vital-value ${v.alert ? 'text-red' : ''}" id="${v.id}" style="font-size:${v.v.length > 4 ? '18px' : '24px'};">${v.v}</div>
            <div class="vital-unit">${v.u}</div>
          </div>`).join('')}
      </div>
    </div>`;
}

function drawECG(canvasId, status) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width = canvas.offsetWidth;
    const w = canvas.width, h = 60;
    const data = generateECGData(w);
    const color = status === 'critical' ? '#ff3b3b' : status === 'warning' ? '#f59e0b' : '#00d4aa';

    function drawFrame() {
        if (!document.getElementById(canvasId)) return;
        const newData = generateECGData(w);
        ctx.clearRect(0, 0, w, h);
        ctx.strokeStyle = color;
        ctx.lineWidth = 1.5;
        ctx.shadowBlur = 4;
        ctx.shadowColor = color;
        ctx.beginPath();
        newData.forEach((d, i) => {
            const x = i, y = h / 2 - d * (h / 2.5);
            i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        });
        ctx.stroke();
        ctx.shadowBlur = 0;
        setTimeout(() => drawFrame(), 800);
    }
    drawFrame();
}

function updateVitals() {
    NDATA.vitalsMonitor.forEach((pt, idx) => {
        // Simulate minor vital fluctuations
        if (pt.status !== 'critical') {
            pt.vitals.hr = Math.max(55, Math.min(120, pt.vitals.hr + Math.round((Math.random() - 0.5) * 3)));
            pt.vitals.spo2 = Math.max(88, Math.min(100, pt.vitals.spo2 + (Math.random() > 0.5 ? 0 : -1)));
        } else {
            pt.vitals.hr = Math.max(90, Math.min(145, pt.vitals.hr + Math.round((Math.random() - 0.5) * 6)));
            pt.vitals.spo2 = Math.max(82, Math.min(94, pt.vitals.spo2 + (Math.random() > 0.7 ? 1 : -1)));
        }
        const hrEl = document.getElementById(`v-hr-${idx}`);
        const spo2El = document.getElementById(`v-spo2-${idx}`);
        if (hrEl) hrEl.textContent = pt.vitals.hr;
        if (spo2El) spo2El.textContent = pt.vitals.spo2;
    });
}

function showVitalHistory(id) {
    openModal('Vital Signs History — ' + id, `
    <div style="height:250px;"><canvas id="vh-chart"></canvas></div>
    <div style="font-size:12px;color:var(--text-muted);margin-top:12px;">Last 6 hours trend</div>`);
    setTimeout(() => {
        const ctx = document.getElementById('vh-chart');
        if (!ctx) return;
        const labels = ['18:00', '19:00', '20:00', '21:00', '22:00', '23:00'];
        registerChart(new Chart(ctx, {
            type: 'line',
            data: {
                labels, datasets: [
                    { label: 'HR', data: [82, 85, 88, 95, 105, 108], borderColor: '#ff3b3b', tension: 0.4, pointRadius: 3, fill: false },
                    { label: 'SpO₂', data: [99, 98, 97, 95, 93, 91], borderColor: '#3b82f6', tension: 0.4, pointRadius: 3, fill: false },
                    { label: 'RR', data: [14, 15, 16, 18, 22, 24], borderColor: '#f59e0b', tension: 0.4, pointRadius: 3, fill: false },
                ]
            },
            options: { ...chartOpts(), plugins: { ...chartOpts().plugins, legend: { display: true } } }
        }));
    }, 100);
}

window.showVitalHistory = showVitalHistory;
window.filterVitalsFacility = function (f) { /* filter logic placeholder */ };
