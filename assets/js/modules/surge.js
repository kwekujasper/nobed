// ================================================================
// Module: Surge & Disaster Management
// ================================================================
function renderSurge(container) {
  container.innerHTML = `
    <div class="page-header">
      <div class="page-header-left">
        <h1>Emergency Command & Major Incident Control</h1>
        <p>Mass casualty management, surge activation, and inter-agency coordination</p>
      </div>
      <div class="page-header-actions">
         <button class="btn btn-primary" onclick="window.location.hash='emt'">🚑 EMT Dispatch</button>
        <button class="btn btn-danger" id="surge-main-btn" onclick="activateSurgeModule()">
          <svg viewBox="0 0 24 24"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
          Activate Surge Mode
        </button>
      </div>
    </div>
    
    <!-- Module Tabs -->
    <div style="display:flex;gap:4px;margin-bottom:16px;border-bottom:1px solid var(--border);padding-bottom:8px;">
      <button onclick="showSurgeTab('national')" id="stab-national" class="notif-tab active">🌐 National Surge Status</button>
      <button onclick="showSurgeTab('mci')" id="stab-mci" class="notif-tab" style="background:rgba(255,59,59,0.1);color:var(--red);border-color:rgba(255,59,59,0.3);">🚨 ACTIVE: MCI (Motorway Crash) 02:44 UTC</button>
    </div>

    <!-- TAB: National Surge Status -->
    <div id="surge-tab-national" style="display:block;">
        <!-- Surge Status Header -->
        <div class="card mb-20" style="background:linear-gradient(135deg,rgba(0,212,170,0.05),rgba(0,0,0,0));border-color:rgba(0,212,170,0.2);">
          <div style="display:flex;align-items:center;gap:16px;flex-wrap:wrap;">
            <div style="width:60px;height:60px;border-radius:12px;background:var(--bg-surface);border:1px solid var(--green);display:flex;align-items:center;justify-content:center;font-size:28px;flex-shrink:0;">🛡️</div>
            <div style="flex:1;">
              <div style="font-size:18px;font-weight:800;margin-bottom:4px;">National Surge Status: <span class="text-green">STANDBY</span></div>
              <div style="font-size:13px;color:var(--text-muted);">Routine operations. 3 regional incidents being monitored. 1 Active MCI (Motorway).</div>
            </div>
            <div style="display:flex;gap:12px;flex-wrap:wrap;">
              <div style="text-align:center;">
                <div style="font-size:28px;font-weight:800;color:var(--red);">18</div>
                <div style="font-size:11px;color:var(--text-muted);">Active Casualties</div>
              </div>
              <div style="text-align:center;">
                <div style="font-size:28px;font-weight:800;color:var(--amber);">9</div>
                <div style="font-size:11px;color:var(--text-muted);">Critical</div>
              </div>
              <div style="text-align:center;">
                <div style="font-size:28px;font-weight:800;color:var(--accent);">3</div>
                <div style="font-size:11px;color:var(--text-muted);">Active Incidents</div>
              </div>
            </div>
          </div>
        </div>

        <div class="grid-2 gap-16 mb-16">
          <!-- Active Incidents -->
          <div class="card">
            <div class="card-header">
                <span class="card-title">Active Field Incidents</span>
                <button class="btn btn-ghost" style="font-size:11px;" onclick="openModal('Report New Incident', incidentForm())">+ Declare Incident</button>
            </div>
            <div style="display:flex;flex-direction:column;gap:12px;padding:12px;">
              ${NDATA.incidents.map(inc => `
                <div style="background:var(--bg-surface);border-radius:var(--radius-sm);padding:14px;border-left:4px solid ${inc.status === 'active' ? 'var(--red)' : inc.status === 'in-progress' ? 'var(--amber)' : 'var(--border)'};">
                  <div style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:6px;">
                    <div>
                      <div style="font-size:13px;font-weight:700;">${inc.title}</div>
                      <div style="font-size:11px;color:var(--text-muted);">${inc.type} • ${inc.location}</div>
                      <div style="font-size:11px;color:var(--text-muted);margin-top:4px;">
                        Casualties: <span class="text-amber">${inc.casualties} total</span> • <span class="text-red">${inc.critical} critical</span>
                      </div>
                      <div style="font-size:11px;color:var(--text-muted);">AMB Deployed: ${inc.ambulances.join(', ')}</div>
                    </div>
                    <div style="text-align:right;">
                      <span class="badge ${inc.status === 'active' ? 'badge-critical' : inc.status === 'in-progress' ? 'badge-urgent' : 'badge-available'}">${inc.status.toUpperCase()}</span>
                      <div class="font-mono" style="font-size:11px;color:var(--text-muted);margin-top:4px;">${inc.time}</div>
                    </div>
                  </div>
                  <div style="display:flex;gap:8px;margin-top:10px;">
                    <button class="btn btn-ghost" style="font-size:11px;padding:4px 10px;" onclick="showToast('More ambulances dispatched to ${inc.title}','info')">+ Dispatch Units</button>
                    ${inc.status === 'active' ? `<button class="btn btn-primary" style="font-size:11px;padding:4px 10px;" onclick="showSurgeTab('mci')">Enter MCI Dashboard</button>` : `<button class="btn btn-ghost" style="font-size:11px;padding:4px 10px;" onclick="showToast('ICS activated for ${inc.type}','warning')">Activate ICS</button>`}
                  </div>
                </div>`).join('')}
            </div>
          </div>

          <!-- Regional Capacity During Surge -->
          <div class="card">
            <div class="card-header"><span class="card-title">Regional Contingency Load</span></div>
            <div style="display:flex;flex-direction:column;gap:10px;padding:12px;">
              ${[
      { region: 'Greater Accra', icuAvail: 15, surgeBeds: 40, status: 'high-load', note: 'Primary incident region (Level 3 Alert)' },
      { region: 'Ashanti', icuAvail: 28, surgeBeds: 60, status: 'ready', note: 'Ready to absorb inter-regional transfers' },
      { region: 'Western', icuAvail: 9, surgeBeds: 20, status: 'moderate', note: 'Limited ICU overhead' },
      { region: 'Central', icuAvail: 13, surgeBeds: 25, status: 'ready', note: 'Available' },
      { region: 'Eastern', icuAvail: 7, surgeBeds: 18, status: 'moderate', note: 'Limited capacity' },
      { region: 'Northern', icuAvail: 11, surgeBeds: 22, status: 'ready', note: 'Available (Tamale TTH)' },
    ].map(r => `
                <div style="display:flex;align-items:center;gap:10px;padding:10px;background:var(--bg-surface);border-radius:var(--radius-sm);">
                  <div style="width:8px;height:8px;border-radius:50%;flex-shrink:0;background:${r.status === 'high-load' ? 'var(--red)' : r.status === 'moderate' ? 'var(--amber)' : 'var(--green)'};"></div>
                  <div style="flex:1;">
                    <div style="font-size:12px;font-weight:700;">${r.region}</div>
                    <div style="font-size:11px;color:var(--text-muted);">${r.note}</div>
                  </div>
                  <div style="text-align:right;font-size:11px;">
                    <div><span class="text-accent font-mono" style="font-weight:700;">${r.icuAvail}</span> ICU avail</div>
                    <div style="color:var(--text-muted);">${r.surgeBeds} surge beds</div>
                  </div>
                  <button class="btn btn-ghost" style="font-size:10px;padding:3px 8px;" onclick="showToast('Inter-regional transfer network established with ${r.region}','info')">Establish Route</button>
                </div>`).join('')}
            </div>
          </div>
        </div>

        <!-- Mass Casualty Activation Panel -->
        <div class="card mb-16">
          <div class="card-header"><span class="card-title">National Mobilization Protocols</span></div>
          <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px;padding:12px;">
            ${[
      { label: 'Notify All Facilities', icon: '📡', color: 'accent', action: 'All public hospitals notified of standby status' },
      { label: 'Pause Elective Admissions', icon: '⏸', color: 'amber', action: 'Elective procedures paused nationally' },
      { label: 'Activate Private Network', icon: '🤝', color: 'blue', action: 'Private hospitals enrolled in surge network' },
      { label: 'Mobilize Military Hospitals', icon: '⚔️', color: 'accent', action: '37 Military and Afari Military Hospital activated' },
      { label: 'Deploy Field Stations', icon: '⛺', color: 'green', action: 'Field stabilization centers mapping initiated' },
      { label: 'Air Evacuation Request', icon: '🚁', color: 'red', action: 'Air evacuation request sent to Ghana Air Force' },
    ].map(a => `
              <div class="card" style="padding:14px;text-align:center;cursor:pointer;transition:var(--transition);" onclick="showToast('✓ Protocol Initiated: ${a.action}','${a.color === 'red' || a.color === 'amber' ? 'warning' : 'success'}')">
                <div style="font-size:28px;margin-bottom:8px;">${a.icon}</div>
                <div style="font-size:12px;font-weight:700;color:var(--${a.color});">${a.label}</div>
              </div>`).join('')}
          </div>
        </div>
    </div>
    
    <!-- TAB: MCI Dashboard -->
    <div id="surge-tab-mci" style="display:none;">
       <div class="grid-3 gap-16 mb-16">
         <!-- MCI Header & Stats -->
         <div class="card" style="grid-column: span 3; background:linear-gradient(90deg, #1A1A24, #2D1414); border-color:var(--red);">
             <div style="padding:16px; display:flex; justify-content:space-between; align-items:center;">
                 <div>
                    <div style="font-size:11px; color:var(--red); font-weight:800; letter-spacing:1px; margin-bottom:4px;">MAJOR INCIDENT COMMAND DECLARED</div>
                    <div style="font-size:24px; font-weight:700;">Accra-Tema Motorway (Multi-Vehicle Collision)</div>
                    <div style="font-size:12px; color:var(--text-muted); margin-top:4px;">Incident ID: MCI-2026-003 • Commander: EMS-CMDR-1 (Osei-Bonsu) • Commenced: 02:44 UTC</div>
                 </div>
                 <div style="display:flex; gap:16px; text-align:center;">
                    <div style="background:rgba(0,0,0,0.4); padding:8px 16px; border-radius:8px;">
                        <div style="font-size:24px; font-weight:800; color:var(--text-primary);">6</div>
                        <div style="font-size:10px; color:var(--text-muted); text-transform:uppercase;">Units Deployed</div>
                    </div>
                    <div style="background:rgba(0,0,0,0.4); padding:8px 16px; border-radius:8px;">
                        <div style="font-size:24px; font-weight:800; color:var(--amber);">14</div>
                        <div style="font-size:10px; color:var(--text-muted); text-transform:uppercase;">Extricated</div>
                    </div>
                    <div style="background:rgba(255,59,59,0.2); padding:8px 16px; border-radius:8px; border:1px solid rgba(255,59,59,0.4);">
                        <div style="font-size:24px; font-weight:800; color:var(--red);">18</div>
                        <div style="font-size:10px; color:var(--red); text-transform:uppercase;">Known Casualties</div>
                    </div>
                 </div>
             </div>
         </div>
         
         <!-- Triage Totals -->
         <div class="card" style="grid-column:span 1;">
            <div class="card-header"><span class="card-title">Live Triage Analytics (START)</span></div>
            <div style="padding:16px; display:grid; gap:12px;">
                ${[
      { color: 'red', label: 'RED (Immediate)', count: 6, desc: 'Catastrophic bleeding, airway issues' },
      { color: 'amber', label: 'YELLOW (Urgent)', count: 8, desc: 'Stable but serious injury' },
      { color: 'green', label: 'GREEN (Minor)', count: 3, desc: 'Walking wounded, minor injuries' },
      { color: 'text-muted', label: 'BLACK (Expectant/Deceased)', count: 1, desc: 'Non-survivable under surge limits' }
    ].map(t => `
                    <div style="display:flex; align-items:center; gap:12px; padding:10px; background:var(--bg-surface); border-radius:var(--radius-sm); border-left:4px solid var(--${t.color});">
                        <div style="font-size:24px; font-weight:900; color:var(--${t.color}); width:40px; text-align:center;">${t.count}</div>
                        <div>
                            <div style="font-size:12px; font-weight:700;">${t.label}</div>
                            <div style="font-size:11px; color:var(--text-muted);">${t.desc}</div>
                        </div>
                    </div>
                `).join('')}
                <button class="btn btn-primary w-full mt-12" onclick="showToast('Distribution sent to receiving hospitals', 'success')">Transmit Triage Roster to KBU & Ridge</button>
            </div>
         </div>
         
         <!-- Incident Map Placeholder -->
         <div class="card" style="grid-column:span 1;">
             <div class="card-header"><span class="card-title">Incident Zone (Motorway 89km)</span></div>
             <div style="height:350px; background:var(--bg-surface); display:flex; justify-content:center; align-items:center; flex-direction:column; position:relative; overflow:hidden;">
                 <!-- Simulated MAP -->
                 <div style="position:absolute; width:100%; height:100%; opacity:0.1; background-image: radial-gradient(var(--accent) 1px, transparent 1px); background-size: 20px 20px;"></div>
                 <div style="font-size:48px; margin-bottom:12px; z-index:1;">📍</div>
                 <div style="font-size:14px; font-weight:700; color:var(--red); z-index:1; padding:4px 12px; background:rgba(255,59,59,0.2); border:1px solid var(--red); border-radius:12px;">HOT ZONE</div>
                 <div style="position:absolute; bottom:16px; left:16px; z-index:1; display:flex; gap:8px;">
                     <span class="badge badge-urgent">AMB-GA-002 (On Scene)</span>
                     <span class="badge badge-urgent">AMB-GA-014 (On Scene)</span>
                 </div>
                 <div style="position:absolute; bottom:16px; right:16px; z-index:1;">
                    <span class="badge badge-available" style="background:rgba(59,130,246,0.3); color:#3b82f6; border-color:#3b82f6;">Ghana Police: 2 Units</span>
                 </div>
             </div>
         </div>

         <!-- Command Log -->
         <div class="card" style="grid-column:span 1;">
             <div class="card-header"><span class="card-title">Command Action Log (ICS)</span></div>
             <div style="padding:12px; height:350px; overflow-y:auto; display:flex; flex-direction:column; gap:8px; font-family:monospace;">
                 ${[
      { time: '02:44 UTC', text: 'MCI Declared by GNFS (Fire) Unit 4', type: 'critical' },
      { time: '02:46 UTC', text: 'EMS Commander Osei-Bonsu assumed ICS Lead', type: 'info' },
      { time: '02:50 UTC', text: 'First EMS unit (AMB-002) arrived. Triage started.', type: 'info' },
      { time: '02:55 UTC', text: 'Police cordoned eastbound lane.', type: 'info' },
      { time: '03:02 UTC', text: 'Triage update from START app: 4 RED, 5 YELLOW received.', type: 'warning' },
      { time: '03:10 UTC', text: 'Helicopter evacuation requested for 2 RED pediatric patients.', type: 'critical' },
      { time: '03:15 UTC', text: 'AMB-014 departed scene to Korle Bu (1 RED, 1 YELLOW).', type: 'success' },
    ].map(l => `
                     <div style="padding:8px; background:var(--bg-surface); border-left:2px solid ${l.type === 'critical' ? 'var(--red)' : l.type === 'warning' ? 'var(--amber)' : l.type === 'success' ? 'var(--green)' : 'var(--blue)'};">
                         <span style="color:var(--text-muted); font-size:10px; display:block; margin-bottom:2px;">[${l.time}]</span>
                         <span style="font-size:11px; color:#c9d1d9;">${l.text}</span>
                     </div>
                 `).join('')}
                 
                 <div style="margin-top:auto; padding-top:12px;">
                     <input type="text" class="form-input" style="width:100%; font-family:monospace; font-size:11px;" placeholder="Type command log entry and press Enter..." onkeydown="if(event.key==='Enter'){showToast('Log entry saved', 'success'); this.value='';}">
                 </div>
             </div>
         </div>
       </div>
    </div>
  `;
}

window.showSurgeTab = function (tabId) {
  document.querySelectorAll('.notif-tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('[id^="surge-tab-"]').forEach(c => c.style.display = 'none');
  document.getElementById(`stab-${tabId}`).classList.add('active');
  document.getElementById(`surge-tab-${tabId}`).style.display = 'block';
};

function activateSurgeModule() {
  activateSurge();
  showToast('🚨 SURGE MODE ACTIVATED — All facilities notified', 'critical');
}

function incidentForm() {
  return `
    <div class="form-grid form-grid-2">
      <div class="form-group"><label class="form-label">Incident Type</label><select class="form-select"><option>Mass Casualty/RTA</option><option>Industrial Explosion</option><option>Flood/Disaster</option><option>Outbreak</option><option>Fire & Rescue</option></select></div>
      <div class="form-group"><label class="form-label">Region</label><select class="form-select">${NDATA.regions.map(r => `<option>${r.name}</option>`).join('')}</select></div>
      <div class="form-group" style="grid-column:span 2"><label class="form-label">Location / GPS</label><input type="text" class="form-input" placeholder="Location name or GPS coordinates"/></div>
      <div class="form-group"><label class="form-label">Est. Casualties</label><input type="number" class="form-input"/></div>
      <div class="form-group"><label class="form-label">Critical Cases</label><input type="number" class="form-input"/></div>
      <div class="form-group" style="grid-column:span 2"><label class="form-label">Initial Report</label><textarea class="form-textarea" placeholder="Describe the incident..."></textarea></div>
    </div>
    <div class="form-actions mt-16">
      <button class="btn btn-danger" onclick="showToast('🚨 Incident declared — All units alerted','warning');closeModal();">Declare Incident</button>
      <button class="btn btn-ghost" onclick="closeModal()">Cancel</button>
    </div>`;
}
window.activateSurgeModule = activateSurgeModule;
