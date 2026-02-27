// ================================================================
// Module: EMT & Ambulance Operations
// ================================================================
let emtMap = null;
let ambMarkers = {};
let ambTrails = {}; // Stores Polyline trails for each ambulance

function renderEMT(container) {
  container.innerHTML = `
    <div class="page-header">
      <div class="page-header-left">
        <h1>EMT & Ambulance Operations</h1>
        <p>Live dispatch, fleet tracking, field case management</p>
      </div>
      <div class="page-header-actions">
        <button class="btn btn-danger" onclick="openModal('Emergency Dispatch','<p style=padding:20px>Dispatching nearest ambulance...</p>')">
          <svg viewBox="0 0 24 24"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
          Emergency Dispatch
        </button>
        <button class="btn btn-primary" onclick="openModal('New EMT Case', emtCaseForm())">
          <svg viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          New Case
        </button>
      </div>
    </div>

    <!-- Fleet KPIs -->
    <div class="grid-4 gap-12 mb-20">
      ${[
      { label: 'Available', count: NDATA.ambulances.filter(a => a.status === 'available').length, color: 'green' },
      { label: 'En-Route', count: NDATA.ambulances.filter(a => a.status === 'en-route').length, color: 'amber' },
      { label: 'On Scene', count: NDATA.ambulances.filter(a => a.status === 'on-scene').length, color: 'red' },
      { label: 'Offline', count: NDATA.ambulances.filter(a => a.status === 'offline').length, color: 'text-muted' },
    ].map(s => `
        <div class="card" style="padding:16px;text-align:center;">
          <div style="font-size:36px;font-weight:900;color:var(--${s.color});">${s.count}</div>
          <div style="font-size:12px;color:var(--text-muted);">${s.label}</div>
        </div>`).join('')}
    </div>

    <div style="display:grid;grid-template-columns:1fr 340px;gap:16px;height:calc(100vh - 340px);min-height:400px;">
      <!-- Map -->
      <div class="card" style="padding:0;overflow:hidden;display:flex;flex-direction:column;">
        <div style="padding:12px 16px;border-bottom:1px solid var(--border);display:flex;justify-content:space-between;align-items:center;">
          <span class="section-title" style="margin:0;">Live Ambulance Tracking — Ghana</span>
          <div style="display:flex;gap:8px;font-size:11px;color:var(--text-muted);">
            <span style="display:flex;align-items:center;gap:4px;"><span style="width:8px;height:8px;border-radius:50%;background:var(--green);display:inline-block;"></span>Available</span>
            <span style="display:flex;align-items:center;gap:4px;"><span style="width:8px;height:8px;border-radius:50%;background:var(--amber);display:inline-block;"></span>En-Route</span>
            <span style="display:flex;align-items:center;gap:4px;"><span style="width:8px;height:8px;border-radius:50%;background:var(--red);display:inline-block;"></span>On-Scene</span>
            <span style="display:flex;align-items:center;gap:4px;"><span style="width:8px;height:8px;border-radius:50%;background:var(--text-muted);display:inline-block;"></span>Offline</span>
          </div>
        </div>
        <div id="emt-map" style="flex:1;min-height:350px;"></div>
      </div>

      <!-- Ambulance List -->
      <div style="display:flex;flex-direction:column;gap:10px;overflow-y:auto;max-height:100%;">
        <div class="section-title">Fleet Status</div>
        ${NDATA.ambulances.map(amb => `
          <div class="ambulance-card ${amb.status === 'en-route' ? 'active' : amb.status === 'on-scene' ? 'emergency' : ''}" onclick="focusAmbulance('${amb.id}')">
            <div class="ambulance-header">
              <div style="width:28px;height:28px;border-radius:6px;background:${amb.status === 'available' ? 'var(--green-dim)' :
        amb.status === 'en-route' ? 'var(--amber-dim)' :
          amb.status === 'on-scene' ? 'var(--red-dim)' :
            'rgba(100,100,100,0.1)'};display:flex;align-items:center;justify-content:center;flex-shrink:0;">
                <svg viewBox="0 0 24 24" style="width:14px;height:14px;stroke:${amb.status === 'available' ? 'var(--green)' :
        amb.status === 'en-route' ? 'var(--amber)' :
          amb.status === 'on-scene' ? 'var(--red)' : '#6b7280'};"><rect x="1" y="3" width="15" height="13" rx="2"/><path d="M16 8h4l3 3v5h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>
              </div>
              <div>
                <div class="ambulance-id" style="font-size:12px;">${amb.id}</div>
                <div style="font-size:10px;color:var(--text-muted);">${amb.type} • ${amb.region}</div>
              </div>
              <div class="badge ${amb.status === 'available' ? 'badge-available' : amb.status === 'en-route' ? 'badge-urgent' : amb.status === 'on-scene' ? 'badge-critical' : 'badge-oos'}" style="margin-left:auto;font-size:9px;">
                ${amb.status.toUpperCase()}
              </div>
            </div>
            <div class="ambulance-details">
              <span>👤 ${amb.crew}</span>
              <span>⛽ ${amb.fuel}% fuel</span>
              ${amb.case ? `<span style="color:var(--amber);">📋 Case: ${amb.case}</span>` : ''}
              ${amb.destination ? `<span style="color:var(--blue);">🏥 → ${amb.destination}</span>` : ''}
              ${amb.reason ? `<span style="color:var(--red);">⚠ ${amb.reason}</span>` : ''}
            </div>
            ${amb.eta ? `
            <div class="ambulance-progress">
              <div style="display:flex;justify-content:space-between;font-size:10px;color:var(--text-muted);margin-bottom:4px;">
                <span>ETA: ${amb.eta} min</span>
                <span>${amb.progress}%</span>
              </div>
              <div class="progress-bar" style="height:4px;">
                <div class="progress-fill amber" style="width:${amb.progress}%"></div>
              </div>
            </div>` : ''}
          </div>`).join('')}
        </div>
      </div>

      <!-- Active Cases -->
      <div class="section-title mt-20">Active Field Cases (MCI Supported)</div>
      <div class="grid-2 gap-12 mt-12">
        ${NDATA.emtCases.map(c => `
          <div class="card ${c.patients.some(p => p.vitals && (p.vitals.spo2 < 93 || p.vitals.hr > 120)) ? 'red-card' : ''}">
            <div style="display:flex;justify-content:space-between;align-items:flex-start;">
              <div>
                <div style="font-size:12px;font-weight:700;color:var(--accent);">${c.id} — ${c.ambulance}</div>
                <div style="font-size:12px;color:var(--text-secondary);margin-top:4px;">${c.mechanism}</div>
              </div>
              <span class="badge ${c.type === 'MCI' ? 'badge-critical' : 'badge-urgent'}">${c.type}</span>
            </div>
            
            <!-- Patient List (MCI Support) -->
            <div style="margin-top:12px;display:flex;flex-direction:column;gap:8px;">
              ${c.patients.map((p, i) => `
              <div style="background:var(--bg-surface);border-left:3px solid ${p.triage.includes('Red') ? 'var(--red)' : p.triage.includes('Yellow') ? 'var(--amber)' : p.triage.includes('Green') ? 'var(--green)' : '#555'};padding:10px;border-radius:0 var(--radius-sm) var(--radius-sm) 0;">
                <div style="display:flex;justify-content:space-between;margin-bottom:8px;">
                  <span style="font-size:13px;font-weight:700;">Pt.${i + 1}: ${p.age}y ${p.sex} • ${p.weight || ''}</span>
                  <span style="font-size:11px;font-weight:700;color:${p.triage.includes('Red') ? 'var(--red)' : 'var(--amber)'};">${p.triage.split('—')[0].trim()}</span>
                </div>
                ${p.vitals ? `
                <div style="display:flex;gap:12px;font-size:11px;">
                  <span><b>BP:</b> <span style="color:${p.vitals.bp.startsWith('8') ? 'var(--red)' : ''}">${p.vitals.bp}</span></span>
                  <span><b>HR:</b> <span style="color:${p.vitals.hr > 110 ? 'var(--red)' : ''}">${p.vitals.hr}</span></span>
                  <span><b>SpO₂:</b> <span style="color:${p.vitals.spo2 < 94 ? 'var(--red)' : ''}">${p.vitals.spo2}%</span></span>
                  <span><b>GCS:</b> <span style="color:${p.vitals.gcs < 13 ? 'var(--red)' : ''}">${p.vitals.gcs}</span></span>
                </div>` : '<div style="font-size:11px;color:var(--text-muted);font-style:italic;">No vitals recorded yet.</div>'}
                <div style="font-size:11px;margin-top:6px;color:var(--text-secondary);">
                  ${p.interventions.join(', ')}
                </div>
              </div>
              `).join('')}
            </div>

            <div style="display:flex;align-items:center;justify-content:space-between;margin-top:12px;border-top:1px dashed var(--border);padding-top:12px;">
              <div style="font-size:12px;${c.preAlertSent ? 'color:var(--green)' : 'color:var(--amber)'}">
                ${c.preAlertSent ? '✓ Pre-alert sent to ' + c.destination : '⚡ Pre-alert pending — ' + c.destination}
              </div>
              <div style="display:flex;gap:8px;">
                <button class="btn btn-ghost" style="font-size:11px;padding:4px 10px;" onclick="window.location.hash='telemedicine'">📹 Teleconsult</button>
              </div>
            </div>
          </div>`).join('')}
      </div>
  `;

  // Init map
  setTimeout(() => initEMTMap(), 100);

  // Animate ambulance positions
  setInterval(animateAmbulances, 5000);
}

function initEMTMap() {
  const mapEl = document.getElementById('emt-map');
  if (!mapEl || emtMap) {
    if (emtMap) { emtMap.invalidateSize(); return; }
    return;
  }

  emtMap = L.map('emt-map', { zoomControl: true, attributionControl: false }).setView([7.0, -1.5], 7);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 18 }).addTo(emtMap);

  // Style the map dark
  const style = document.createElement('style');
  style.textContent = '#emt-map { filter: brightness(0.6) saturate(1.2) hue-rotate(200deg); }';
  document.head.appendChild(style);

  // Add hospital markers
  NDATA.facilities.forEach(f => {
    const icon = L.divIcon({
      html: `<div style="background:#0d1225;border:2px solid #00d4aa;border-radius:6px;padding:3px 6px;font-size:10px;font-weight:700;color:#00d4aa;white-space:nowrap;">${f.id}</div>`,
      className: '', iconAnchor: [20, 10]
    });
    L.marker([f.lat, f.lng], { icon }).bindPopup(`<b>${f.name}</b><br>ICU: ${f.icuAvail}/${f.icuTotal} available`).addTo(emtMap);
  });

  // Add ambulance markers
  NDATA.ambulances.forEach(amb => addAmbulanceMarker(amb));

  // Add incident markers
  NDATA.incidents.forEach(inc => {
    const icon = L.divIcon({
      html: `<div style="background:#ff3b3b;border-radius:50%;width:16px;height:16px;border:2px solid #fff;animation:pulseDot 1.5s ease infinite;"></div>`,
      className: '', iconAnchor: [8, 8]
    });
  });
}

function addAmbulanceMarker(amb) {
  if (!emtMap) return;
  const colors = { available: '#22c55e', 'en-route': '#f59e0b', 'on-scene': '#ff3b3b', offline: '#6b7280' };
  const color = colors[amb.status] || '#6b7280';
  const icon = L.divIcon({
    html: `<div style="background:${color};border-radius:4px;width:14px;height:14px;border:2px solid rgba(255,255,255,0.8);box-shadow:0 0 8px ${color};"></div>`,
    className: '', iconAnchor: [7, 7]
  });
  const marker = L.marker([amb.lat, amb.lng], { icon })
    .bindPopup(`<b>${amb.id}</b><br>Status: ${amb.status}<br>Crew: ${amb.crew}<br>Fuel: ${amb.fuel}%${amb.case ? '<br>Case: ' + amb.case : ''}`)
    .addTo(emtMap);
  ambMarkers[amb.id] = marker;

  // Initialize breadcrumb trail
  ambTrails[amb.id] = L.polyline([[amb.lat, amb.lng]], {
    color: color,
    weight: 2,
    opacity: 0.6,
    dashArray: '5, 5'
  }).addTo(emtMap);
}

function animateAmbulances() {
  if (!emtMap) return;
  NDATA.ambulances.filter(a => a.status === 'en-route').forEach(amb => {
    // Simulate movement toward destination
    amb.lat += (Math.random() - 0.5) * 0.005;
    amb.lng += (Math.random() - 0.5) * 0.005;

    if (ambMarkers[amb.id]) {
      ambMarkers[amb.id].setLatLng([amb.lat, amb.lng]);
    }

    // Add point to trail
    if (ambTrails[amb.id]) {
      ambTrails[amb.id].addLatLng([amb.lat, amb.lng]);
      // Keep trail length under 20 points
      if (ambTrails[amb.id].getLatLngs().length > 20) {
        const latlngs = ambTrails[amb.id].getLatLngs();
        latlngs.shift();
        ambTrails[amb.id].setLatLngs(latlngs);
      }
    }

    if (amb.eta) { amb.eta = Math.max(0, amb.eta - 0.5); amb.progress = Math.min(100, amb.progress + 2); }
  });
}

function focusAmbulance(id) {
  const amb = NDATA.ambulances.find(a => a.id === id);
  if (amb && emtMap) {
    emtMap.setView([amb.lat, amb.lng], 13);
    if (ambMarkers[id]) ambMarkers[id].openPopup();
  }
}

function emtCaseForm() {
  return `
    <div style="display:flex;gap:16px;border-bottom:1px solid var(--border);margin-bottom:16px;">
        <button class="btn btn-ghost active" onclick="switchEMTTab('m-pds')" id="tab-m-pds">📞 MPDS Call</button>
        <button class="btn btn-ghost" onclick="switchEMTTab('m-pcr')" id="tab-m-pcr">📝 Field PCR</button>
        <button class="btn btn-ghost" onclick="switchEMTTab('m-mci')" id="tab-m-mci">🔴 START Triage (MCI)</button>
        <button class="btn btn-ghost" onclick="switchEMTTab('m-comms')" id="tab-m-comms">📻 Radio Log</button>
    </div>

    <!-- MPDS Call Card -->
    <div id="m-pds" class="emt-tab-content">
        <div class="grid-2 gap-12">
            <div class="form-group"><label class="form-label">Chief Complaint (Protocol)</label><select class="form-select"><option>01. Abdominal Pain/Problems</option><option>04. Assault / Sexual Assault</option><option>06. Breathing Problems</option><option>09. Cardiac or Respiratory Arrest</option><option>10. Chest Pain</option><option>24. Pregnancy/Chidbirth</option><option>29. Traffic/Transportation Incidents</option><option>99. Interfacility Transfer</option></select></div>
            <div class="form-group"><label class="form-label">Determinant Code</label><input type="text" class="form-input" placeholder="e.g. 29-D-02"/></div>
            <div class="form-group"><label class="form-label">Caller Location</label><input type="text" class="form-input" placeholder="GPS or Address"/></div>
            <div class="form-group"><label class="form-label">Dispatch Unit</label><select class="form-select">${NDATA.ambulances.filter(a => a.status !== 'offline').map(a => `<option value="${a.id}">${a.id} — ${a.crew}</option>`).join('')}</select></div>
            <div class="form-group" style="grid-column:span 2"><label class="form-label">Pre-Arrival Instructions Given</label><textarea class="form-textarea" placeholder="Bleeding control, CPR instructions..."></textarea></div>
        </div>
    </div>

    <!-- Field PCR (Patient Care Report) -->
    <div id="m-pcr" class="emt-tab-content" style="display:none;">
        <div class="grid-4 gap-12">
            <div class="form-group"><label class="form-label">Age</label><input type="number" class="form-input"/></div>
            <div class="form-group"><label class="form-label">Sex</label><select class="form-select"><option>M</option><option>F</option></select></div>
            <div class="form-group" style="grid-column:span 2"><label class="form-label">Scene Assessment (Hazards/Access)</label><input type="text" class="form-input" placeholder="Safe, extrication req..."/></div>
            
            <div class="form-group"><label class="form-label">BP</label><input type="text" class="form-input" placeholder="120/80"/></div>
            <div class="form-group"><label class="form-label">HR</label><input type="number" class="form-input" placeholder="80"/></div>
            <div class="form-group"><label class="form-label">SpO₂</label><input type="number" class="form-input" placeholder="98"/></div>
            <div class="form-group"><label class="form-label">RR</label><input type="number" class="form-input" placeholder="16"/></div>
            
            <div class="form-group"><label class="form-label">GCS (3-15)</label><input type="number" class="form-input" placeholder="15" id="pcr-gcs" onchange="calcNACA()"/></div>
            <div class="form-group"><label class="form-label">Temp</label><input type="number" class="form-input" placeholder="37.0"/></div>
            <div class="form-group" style="grid-column:span 2"><label class="form-label">Interventions</label><input type="text" class="form-input" id="pcr-int" onchange="calcNACA()" placeholder="IV, O2, CPR..."/></div>
            
            <div class="form-group" style="grid-column:1/-1;">
                <label class="form-label">NACA Score (Calculated Severity)</label>
                <div style="display:flex;align-items:center;gap:12px;">
                    <div id="naca-badge" class="badge" style="font-size:16px;padding:6px 12px;background:var(--bg-elevated);">NACA 0</div>
                    <span style="font-size:12px;color:var(--text-muted);" id="naca-desc">No injury/illness</span>
                </div>
            </div>
        </div>
    </div>

    <!-- START Triage (MCI) -->
    <div id="m-mci" class="emt-tab-content" style="display:none;">
        <div style="background:var(--bg-surface);padding:16px;border-radius:var(--radius-md);margin-bottom:16px;">
            <p style="margin:0 0 12px 0;font-weight:700;">Mass Casualty Tracker (START Protocol)</p>
            <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px;text-align:center;">
                <div style="background:var(--red-dim);color:var(--red);padding:12px;border-radius:4px;border:1px solid var(--red);">
                    <div style="font-size:24px;font-weight:800;">0</div><div>🔴 IMMEDIATE</div>
                </div>
                <div style="background:var(--amber-dim);color:var(--amber);padding:12px;border-radius:4px;border:1px solid var(--amber);">
                    <div style="font-size:24px;font-weight:800;">0</div><div>🟡 DELAYED</div>
                </div>
                <div style="background:var(--green-dim);color:var(--green);padding:12px;border-radius:4px;border:1px solid var(--green);">
                    <div style="font-size:24px;font-weight:800;">0</div><div>🟢 MINOR</div>
                </div>
                <div style="background:#222;color:#999;padding:12px;border-radius:4px;border:1px solid #555;">
                    <div style="font-size:24px;font-weight:800;">0</div><div>⚫ EXPECTANT</div>
                </div>
            </div>
            <button class="btn btn-secondary mt-12 w-full">+ Quick Tag Patient</button>
        </div>
    </div>

    <!-- Radio Comms Log -->
    <div id="m-comms" class="emt-tab-content" style="display:none;">
        <div style="height:200px;overflow-y:auto;background:#0d1117;border:1px solid var(--border);border-radius:4px;padding:12px;font-family:monospace;font-size:12px;color:#a3b3cc;margin-bottom:12px;">
            <div style="margin-bottom:8px;"><span style="color:var(--accent);">[14:22:15] CONTROL:</span> AMB-GA-001, respond standard to RTA on N1 Highway.</div>
            <div style="margin-bottom:8px;"><span style="color:var(--green);">[14:22:30] AMB-GA-001:</span> Copy Control, en route. ETA 8 mikes.</div>
            <div style="margin-bottom:8px;"><span style="color:var(--green);">[14:30:10] AMB-GA-001:</span> On scene. Size up: 2 vehicles, 3 walking wounded, 1 trapped. Request Fire.</div>
            <div style="margin-bottom:8px;"><span style="color:var(--accent);">[14:30:25] CONTROL:</span> Copy AMB-GA-001. Fire dispatched. Updating hospital pre-alert for potential Red.</div>
        </div>
        <div style="display:flex;gap:8px;">
            <input type="text" class="form-input" style="flex:1;" placeholder="Transmit message..."/>
            <button class="btn btn-primary">TX</button>
        </div>
    </div>

    <div class="form-actions mt-16" style="border-top:1px solid var(--border);padding-top:16px;">
        <button class="btn btn-primary" onclick="showToast('✓ Data transmitted to Command','success');closeModal();">Save & Update</button>
        <button class="btn btn-ghost" onclick="closeModal()">Close</button>
    </div>
    `;
}

window.switchEMTTab = function (id) {
  document.querySelectorAll('.emt-tab-content').forEach(el => el.style.display = 'none');
  document.querySelectorAll('#tab-m-pds, #tab-m-pcr, #tab-m-mci, #tab-m-comms').forEach(el => el.classList.remove('active'));
  document.getElementById(id).style.display = 'block';
  document.getElementById('tab-' + id).classList.add('active');
};

window.calcNACA = function () {
  const gcs = parseInt(document.getElementById('pcr-gcs').value) || 15;
  const intv = (document.getElementById('pcr-int').value || '').toLowerCase();
  let score = 1;
  let desc = "Minor / No intervention";
  let color = "var(--green)";

  if (intv.includes('cpr') || intv.includes('defib')) {
    score = 6; desc = "Resuscitation / Arrest"; color = "#000";
  } else if (gcs < 9 || intv.includes('intubat')) {
    score = 5; desc = "Acute life threat"; color = "var(--red)";
  } else if (gcs < 13 || intv.includes('ns') || intv.includes('iv')) {
    score = 4; desc = "Possible life threat"; color = "var(--amber)";
  } else if (intv.includes('splint') || intv.includes('o2')) {
    score = 3; desc = "Hospital admit needed"; color = "var(--blue)";
  } else if (intv.length > 3) {
    score = 2; desc = "Outpatient tx needed"; color = "var(--green)";
  }

  const b = document.getElementById('naca-badge');
  if (b) {
    b.innerText = 'NACA ' + score;
    b.style.background = color;
    b.style.color = score === 6 ? '#fff' : '';
    document.getElementById('naca-desc').innerText = desc;
  }
};

window.focusAmbulance = focusAmbulance;
// Cleanup map on page change
const origRoute = window.route;
