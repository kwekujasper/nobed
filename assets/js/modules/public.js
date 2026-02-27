// ================================================================
// Module: Public Emergency Interface — Citizen Portal
// ================================================================
function renderPublic(container) {
  container.innerHTML = `
    <div class="page-header">
      <div class="page-header-left">
        <h1>🇬🇭 NECHIS Citizen Emergency Portal</h1>
        <p>Emergency dispatch, scene reporting, hospital finder & first aid</p>
      </div>
      <div style="display:flex;gap:8px;align-items:center;">
        <span id="pub-gps-badge" style="padding:6px 12px;background:rgba(0,212,170,0.1);border:1px solid rgba(0,212,170,0.3);border-radius:var(--radius-sm);font-size:11px;color:var(--accent);font-weight:600;">📍 GPS: Detecting...</span>
        <span style="padding:6px 14px;background:var(--red-dim);border:1px solid rgba(255,59,59,0.3);border-radius:var(--radius-sm);font-size:11px;color:var(--red);font-weight:600;">🌐 Public Portal</span>
      </div>
    </div>

    <!-- === ALERT SOS BANNER === -->
    <div style="background:linear-gradient(135deg,#1a0a0a,#2d0f0f);border:2px solid var(--red);border-radius:var(--radius);padding:20px 24px;margin-bottom:20px;display:flex;align-items:center;gap:20px;flex-wrap:wrap;">
      <div style="flex:1;min-width:220px;">
        <div style="font-size:11px;color:var(--red);font-weight:800;letter-spacing:1.5px;margin-bottom:4px;">EMERGENCY? DON'T PANIC.</div>
        <div style="font-size:20px;font-weight:700;margin-bottom:4px;">Alert NECHIS — One tap to all emergency services</div>
        <div style="font-size:12px;color:var(--text-muted);">Your GPS location is automatically included. Dispatchers see your photo/video immediately.</div>
      </div>
      <button onclick="openSOSModal()" style="background:var(--red);color:#fff;border:none;border-radius:12px;padding:16px 32px;font-size:18px;font-weight:800;cursor:pointer;letter-spacing:1px;animation:pulse-red 1.5s infinite;min-width:180px;">
        🆘 ALERT NECHIS
      </button>
    </div>

    <!-- === QUICK CALL GRID === -->
    <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:20px;">
      ${[
      { icon: '🚑', label: 'Ambulance / GNEMS', num: '193', color: 'red' },
      { icon: '🚒', label: 'Fire Service', num: '192', color: 'amber' },
      { icon: '👮', label: 'Ghana Police', num: '191', color: 'accent' },
      { icon: '🏥', label: 'NECHIS Hotline', num: '0800-NECHIS', color: 'green' },
    ].map(e => `
        <div onclick="publicCall('${e.num}','${e.label}')" style="background:var(--bg-surface);border:1px solid var(--border);border-top:3px solid var(--${e.color});border-radius:var(--radius);padding:16px;text-align:center;cursor:pointer;transition:var(--transition);" onmouseenter="this.style.background='var(--bg-elevated)'" onmouseleave="this.style.background='var(--bg-surface)'">
          <div style="font-size:28px;margin-bottom:6px;">${e.icon}</div>
          <div style="font-size:22px;font-weight:900;color:var(--${e.color});font-family:monospace;letter-spacing:2px;">${e.num}</div>
          <div style="font-size:11px;color:var(--text-muted);margin-top:4px;">${e.label}</div>
        </div>
      `).join('')}
    </div>

    <!-- === NAVIGATION TABS === -->
    <div style="display:flex;gap:4px;margin-bottom:16px;border-bottom:1px solid var(--border);padding-bottom:0;overflow-x:auto;white-space:nowrap;">
      <button onclick="showPubTab('report')"  id="ptab-report"  class="notif-tab active">📹 Report Emergency</button>
      <button onclick="showPubTab('track')"   id="ptab-track"   class="notif-tab">📡 Live Tracking</button>
      <button onclick="showPubTab('tele')"    id="ptab-tele"    class="notif-tab">🩺 Tele-Triage</button>
      <button onclick="showPubTab('finder')"  id="ptab-finder"  class="notif-tab">🏥 Hospital Finder</button>
      <button onclick="showPubTab('firstaid')" id="ptab-firstaid" class="notif-tab">🩹 First Aid</button>
      <button onclick="showPubTab('advisory')" id="ptab-advisory" class="notif-tab">📋 Health Advisories</button>
    </div>

    <!-- ========================== -->
    <!-- TAB: REPORT EMERGENCY      -->
    <!-- ========================== -->
    <div id="pub-tab-report" style="display:block;">
      <div class="grid-2 gap-16">
        <!-- Scene Media Upload -->
        <div class="card">
          <div class="card-header"><span class="card-title">📸 Upload Scene Photo / Video</span></div>
          <div style="padding:16px;">
            <div style="border:2px dashed var(--border);border-radius:var(--radius-sm);padding:32px;text-align:center;cursor:pointer;transition:var(--transition);" onclick="document.getElementById('scene-media').click()" onmouseenter="this.style.borderColor='var(--accent)'" onmouseleave="this.style.borderColor='var(--border)'">
              <div style="font-size:40px;margin-bottom:8px;">📷</div>
              <div style="font-size:13px;font-weight:700;margin-bottom:4px;">Tap to capture or upload</div>
              <div style="font-size:11px;color:var(--text-muted);">Photos & videos sent directly to the emergency dispatcher</div>
              <input type="file" id="scene-media" accept="image/*,video/*" multiple capture="environment" style="display:none;" onchange="previewSceneMedia(this)">
            </div>
            <div id="scene-preview" style="margin-top:12px;display:flex;gap:8px;flex-wrap:wrap;"></div>
            <div class="form-group mt-12">
              <label class="form-label">Describe what you see</label>
              <textarea class="form-textarea" id="scene-desc" rows="3" placeholder="e.g. 2 vehicles involved, 3 people injured, fire visible..."></textarea>
            </div>
            <div class="form-group mt-8">
              <label class="form-label">Type of Incident</label>
              <select class="form-select" id="incident-type">
                <option>Road Traffic Accident</option>
                <option>Fire / Explosion</option>
                <option>Medical Emergency</option>
                <option>Flood / Drowning</option>
                <option>Assault / Crime</option>
                <option>Industrial Accident</option>
                <option>Other</option>
              </select>
            </div>
            <button onclick="submitSceneReport()" class="btn btn-danger w-full mt-12" style="font-size:14px;padding:12px;">🚨 Send to Emergency Dispatcher</button>
          </div>
        </div>

        <!-- GPS Location Panel -->
        <div class="card">
          <div class="card-header"><span class="card-title">📍 Your Location</span><button class="btn btn-ghost" style="font-size:11px;" onclick="refreshGPS()">🔄 Refresh</button></div>
          <div style="padding:16px;">
            <div style="height:200px;background:var(--bg-surface);border-radius:var(--radius-sm);display:flex;flex-direction:column;justify-content:center;align-items:center;position:relative;overflow:hidden;margin-bottom:12px;">
              <div style="position:absolute;width:100%;height:100%;opacity:0.06;background-image:radial-gradient(var(--accent) 1px,transparent 1px);background-size:20px 20px;"></div>
              <div style="font-size:40px;z-index:1;animation:pulse-red 2s infinite;">📍</div>
              <div id="pub-gps-coords" style="font-size:12px;color:var(--accent);z-index:1;margin-top:8px;font-family:monospace;">Detecting GPS...</div>
              <div id="pub-gps-address" style="font-size:11px;color:var(--text-muted);z-index:1;margin-top:4px;text-align:center;padding:0 12px;"></div>
            </div>
            <div id="pub-gps-status" style="padding:10px;background:rgba(0,212,170,0.08);border-radius:var(--radius-sm);border:1px solid rgba(0,212,170,0.2);font-size:12px;color:var(--accent);margin-bottom:12px;">⏳ Requesting location permission...</div>
            <button onclick="shareLocationNow()" class="btn btn-primary w-full" style="margin-bottom:8px;">📡 Share Live Location with Dispatcher</button>
            <button onclick="openSOSModal()" class="btn btn-danger w-full">🆘 SOS — Send Location + Alert Now</button>
          </div>
        </div>
      </div>
    </div>

    <!-- ========================== -->
    <!-- TAB: LIVE TRACKING         -->
    <!-- ========================== -->
    <div id="pub-tab-track" style="display:none;">
      <div class="grid-2 gap-16">
        <div class="card" style="grid-column:span 2;">
          <div class="card-header">
            <span class="card-title">📡 Live Emergency Unit Tracking</span>
            <span class="badge badge-urgent" style="animation:pulse-red 1.5s infinite;">🔴 LIVE</span>
          </div>
          <div style="height:400px;background:#0b1120;border-radius:var(--radius-sm);display:flex;flex-direction:column;justify-content:center;align-items:center;position:relative;overflow:hidden;">
            <!-- Simulated live map -->
            <div style="position:absolute;width:100%;height:100%;opacity:0.08;background-image:radial-gradient(var(--accent) 1px,transparent 1px);background-size:24px 24px;"></div>
            <!-- Road lines simulation -->
            <div style="position:absolute;top:50%;left:0;width:100%;height:2px;background:rgba(255,255,255,0.05);"></div>
            <div style="position:absolute;top:0;left:50%;width:2px;height:100%;background:rgba(255,255,255,0.05);"></div>
            <!-- Animated units -->
            <div id="live-units-map" style="position:absolute;width:100%;height:100%;">
              ${[
      { id: 'AMB-GA-001', x: 35, y: 40, icon: '🚑', status: 'En Route', dest: 'Korle Bu' },
      { id: 'AMB-GA-002', x: 60, y: 60, icon: '🚑', status: 'On Scene', dest: 'Motorway KM89' },
      { id: 'FIRE-ACC-03', x: 22, y: 65, icon: '🚒', status: 'Responding', dest: 'Tema Industrial' },
      { id: 'POL-ACC-07', x: 75, y: 35, icon: '🚓', status: 'Patrolling', dest: 'Accra Central' },
    ].map(u => `
                <div style="position:absolute;left:${u.x}%;top:${u.y}%;transform:translate(-50%,-50%);text-align:center;cursor:pointer;" onclick="showToast('${u.id} — ${u.status}: ${u.dest}','info')">
                  <div style="font-size:24px;filter:drop-shadow(0 0 6px ${u.status === 'On Scene' ? 'rgba(255,59,59,0.8)' : 'rgba(0,212,170,0.8)'});">${u.icon}</div>
                  <div style="font-size:9px;color:${u.status === 'On Scene' ? 'var(--red)' : 'var(--accent)'};background:rgba(0,0,0,0.7);padding:2px 5px;border-radius:4px;white-space:nowrap;">${u.id}</div>
                </div>
              `).join('')}
              <!-- Incident marker -->
              <div style="position:absolute;left:62%;top:62%;transform:translate(-50%,-50%);text-align:center;">
                <div style="font-size:28px;animation:pulse-red 1s infinite;">⚠️</div>
                <div style="font-size:9px;color:var(--red);background:rgba(0,0,0,0.8);padding:2px 6px;border-radius:4px;">ACTIVE INCIDENT</div>
              </div>
            </div>
            <div style="position:absolute;bottom:12px;left:12px;display:flex;gap:8px;flex-wrap:wrap;">
              <span class="badge badge-available">🚑 AMB</span>
              <span class="badge" style="background:rgba(251,191,36,0.15);color:var(--amber);border-color:var(--amber);">🚒 FIRE</span>
              <span class="badge" style="background:rgba(59,130,246,0.15);color:#3b82f6;border-color:#3b82f6;">🚓 POLICE</span>
              <span class="badge badge-urgent">⚠️ INCIDENT</span>
            </div>
          </div>
        </div>

        <!-- My Alert Status -->
        <div class="card">
          <div class="card-header"><span class="card-title">My Alert Status</span></div>
          <div style="padding:16px;" id="my-alert-status">
            <div style="text-align:center;padding:24px;color:var(--text-muted);">
              <div style="font-size:36px;margin-bottom:8px;">📭</div>
              <div style="font-size:13px;">No active alert submitted.</div>
              <div style="font-size:11px;margin-top:4px;">After you send an SOS, your ticket status appears here.</div>
              <button onclick="openSOSModal()" class="btn btn-danger mt-16" style="width:100%;">🆘 Send SOS Now</button>
            </div>
          </div>
        </div>

        <!-- Nearest Units to Me -->
        <div class="card">
          <div class="card-header"><span class="card-title">Nearest Units to You</span><button class="btn btn-ghost" style="font-size:11px;" onclick="refreshGPS()">📍 Use GPS</button></div>
          <div style="padding:12px;display:flex;flex-direction:column;gap:10px;">
            ${[
      { unit: 'AMB-GA-011', type: 'Ambulance', dist: '1.2 km', eta: '3 min', status: 'Available' },
      { unit: 'FIRE-LAB-02', type: 'Fire Engine', dist: '3.8 km', eta: '8 min', status: 'Available' },
      { unit: 'POL-TEM-04', type: 'Police Unit', dist: '0.9 km', eta: '2 min', status: 'Patrolling' },
    ].map(u => `
              <div style="display:flex;align-items:center;gap:12px;padding:10px;background:var(--bg-surface);border-radius:var(--radius-sm);">
                <div style="font-size:20px;">${u.type === 'Ambulance' ? '🚑' : u.type === 'Fire Engine' ? '🚒' : '🚓'}</div>
                <div style="flex:1;">
                  <div style="font-size:12px;font-weight:700;">${u.unit} <span style="color:var(--text-muted);font-weight:400;font-size:11px;">(${u.type})</span></div>
                  <div style="font-size:11px;color:var(--text-muted);">${u.dist} • ETA: <strong style="color:var(--accent);">${u.eta}</strong></div>
                </div>
                <button onclick="showToast('${u.unit} has been notified of your location','success')" class="btn btn-ghost" style="font-size:10px;padding:4px 8px;">Dispatch</button>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    </div>

    <!-- ========================== -->
    <!-- TAB: TELE-TRIAGE           -->
    <!-- ========================== -->
    <div id="pub-tab-tele" style="display:none;">
      <div class="grid-2 gap-16">
        <div class="card">
          <div class="card-header"><span class="card-title">🩺 Emergency Video Triage Call</span><span class="badge badge-available">Paramedic On Call</span></div>
          <div style="padding:16px;">
            <!-- Simulated Video Window -->
            <div style="background:#000;border-radius:var(--radius-sm);height:260px;display:flex;flex-direction:column;justify-content:center;align-items:center;margin-bottom:16px;position:relative;overflow:hidden;">
              <div style="position:absolute;inset:0;background:linear-gradient(135deg,#0a1628,#0f2040);"></div>
              <div id="tele-ring" style="font-size:48px;z-index:1;animation:pulse-red 2s infinite;">📹</div>
              <div id="tele-status" style="font-size:13px;color:rgba(255,255,255,0.6);z-index:1;margin-top:10px;">Click below to connect to a paramedic</div>
              <!-- Self-preview pip -->
              <div style="position:absolute;bottom:12px;right:12px;width:90px;height:60px;background:#1a1a2e;border:1px solid var(--border);border-radius:4px;display:flex;align-items:center;justify-content:center;font-size:18px;">👤</div>
            </div>
            <div style="display:flex;gap:10px;margin-bottom:12px;">
              <button id="tele-call-btn" onclick="startTeleCall(this)" class="btn btn-primary" style="flex:1;font-size:14px;padding:12px;">📞 Start Video Triage Call</button>
              <button onclick="showToast('Audio-only call connected','info')" class="btn btn-ghost" style="padding:12px 16px;">🔊 Audio Only</button>
            </div>
            <div style="padding:12px;background:rgba(0,212,170,0.06);border-radius:var(--radius-sm);border:1px solid rgba(0,212,170,0.2);">
              <div style="font-size:11px;color:var(--accent);font-weight:700;margin-bottom:4px;">🟢 Paramedic on Duty — Average Wait: 45 seconds</div>
              <div style="font-size:11px;color:var(--text-muted);">Our remote triage paramedics will guide you through immediate life-saving steps while an ambulance is dispatched.</div>
            </div>
          </div>
        </div>

        <div class="card">
          <div class="card-header"><span class="card-title">📋 Pre-Call Symptom Checker</span></div>
          <div style="padding:16px;">
            <div class="form-group mb-10">
              <label class="form-label">Who needs help?</label>
              <select class="form-select"><option>Me</option><option>Another adult</option><option>Child/Infant</option><option>Elderly person</option></select>
            </div>
            <div class="form-group mb-10">
              <label class="form-label">Main symptom / situation</label>
              <select class="form-select" id="tele-symptom" onchange="showTriageAdvice(this.value)">
                <option value="">Select...</option>
                <option value="cpr">Unconscious / Not breathing</option>
                <option value="bleed">Severe bleeding</option>
                <option value="stroke">Possible stroke (facial droop, arm weakness)</option>
                <option value="burn">Burns</option>
                <option value="choke">Choking</option>
                <option value="trauma">Injury from accident</option>
                <option value="pain">Severe chest/abdominal pain</option>
              </select>
            </div>
            <div id="triage-advice-box" style="display:none;padding:12px;background:rgba(255,59,59,0.08);border-left:3px solid var(--red);border-radius:4px;font-size:12px;margin-bottom:12px;"></div>
            <button onclick="showToast('Symptom report sent to dispatcher','success')" class="btn btn-primary w-full">Submit & Notify Dispatcher</button>
          </div>
        </div>
      </div>
    </div>

    <!-- ========================== -->
    <!-- TAB: HOSPITAL FINDER       -->
    <!-- ========================== -->
    <div id="pub-tab-finder" style="display:none;">
      <div style="display:flex;gap:10px;margin-bottom:16px;flex-wrap:wrap;">
        <input type="text" class="form-input" placeholder="Search hospital, region or service..." style="flex:1;max-width:400px;" id="hosp-search" oninput="filterHospitals(this.value)"/>
        <select class="form-select" style="width:160px;" id="hosp-region" onchange="filterHospitals(document.getElementById('hosp-search').value)">
          <option value="all">All Regions</option>
          ${NDATA.regions.map(r => `<option value="${r.name}">${r.name}</option>`).join('')}
        </select>
        <select class="form-select" style="width:160px;" id="hosp-service">
          <option value="all">All Services</option>
          <option>ICU</option><option>Emergency</option>
          <option>Paediatrics</option><option>Maternity</option>
        </select>
      </div>
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:14px;" id="hosp-grid">
        ${NDATA.facilities.map(f => hospitalCard(f)).join('')}
      </div>
    </div>

    <!-- ========================== -->
    <!-- TAB: FIRST AID             -->
    <!-- ========================== -->
    <div id="pub-tab-firstaid" style="display:none;">
      <div class="grid-3 gap-12">
        ${[
      { title: 'Cardiac Arrest (CPR)', icon: '❤️', color: 'red', steps: ['Call 193 immediately', 'Place hands centre of chest', 'Push hard & fast — 100–120/min', 'Give rescue breaths if trained', 'Don\'t stop until help arrives'] },
      { title: 'Major Bleeding', icon: '🩸', color: 'red', steps: ['Apply firm, direct pressure', 'Use a clean cloth or dressing', 'Do NOT remove if soaked — add more', 'Consider tourniquet if trained', 'Keep patient warm & still'] },
      { title: 'Stroke — FAST Test', icon: '🧠', color: 'amber', steps: ['Face: One side drooping?', 'Arms: Can raise both arms?', 'Speech: Slurred or strange?', 'Time: Call 193 IMMEDIATELY', 'Note time of first symptom'] },
      { title: 'Road Traffic Accident', icon: '🚗', color: 'amber', steps: ['Safety first — don\'t be a 2nd victim', 'Call 193 with exact location', 'Don\'t move unless life danger', 'Control bleeding, keep warm', 'Stay on line with dispatcher'] },
      { title: 'Choking — Adult', icon: '😮', color: 'amber', steps: ['Encourage coughing if able', '5 firm back blows (heel of hand)', '5 abdominal thrusts (Heimlich)', 'Alternate until cleared', 'If unconscious — start CPR'] },
      { title: 'Severe Burns', icon: '🔥', color: 'amber', steps: ['Cool with cool water 20 minutes', 'Remove loose clothing only', 'Cover loosely — cling film/clean bag', 'No cream, toothpaste or ice', 'All major burns → call 193'] },
      { title: 'Drowning', icon: '🌊', color: 'accent', steps: ['Call 193 before entering water', 'Only enter if trained rescuer', 'Remove from water safely', 'Start CPR if not breathing', 'Keep warm — prevent shock'] },
      { title: 'Seizure', icon: '⚡', color: 'accent', steps: ['Do not restrain — clear the area', 'Protect head with something soft', 'Time the seizure', 'Do NOT put anything in mouth', 'Recovery position when stops'] },
      { title: 'Snake Bite', icon: '🐍', color: 'green', steps: ['Keep calm & still — slow venom spread', 'Immobilize the bitten limb', 'Note snake description', 'Go to hospital immediately', 'Do NOT cut, suck or tourniquet'] },
    ].map(fa => `
          <div class="card" style="padding:18px;border-top:3px solid var(--${fa.color});">
            <div style="font-size:28px;margin-bottom:8px;">${fa.icon}</div>
            <div style="font-size:13px;font-weight:700;margin-bottom:12px;">${fa.title}</div>
            <ol style="padding-left:18px;margin:0;display:flex;flex-direction:column;gap:6px;">
              ${fa.steps.map(s => `<li style="font-size:12px;color:var(--text-secondary);">${s}</li>`).join('')}
            </ol>
            <button onclick="showToast('Calling 193 for ${fa.title}...','info')" class="btn btn-ghost" style="width:100%;font-size:11px;margin-top:12px;">📞 Call 193 Now</button>
          </div>`).join('')}
      </div>
    </div>

    <!-- ========================== -->
    <!-- TAB: HEALTH ADVISORIES     -->
    <!-- ========================== -->
    <div id="pub-tab-advisory" style="display:none;">
      <div class="card mb-16">
        <div class="card-header"><span class="card-title">📋 Current Health Advisories</span><span class="badge badge-available">Updated Feb 27, 2026</span></div>
        <div style="display:flex;flex-direction:column;gap:10px;padding:12px;">
          ${[
      { icon: '💉', title: 'National Meningitis Vaccination Drive', body: 'Ongoing campaign — Greater Accra, Eastern, Central regions. Nearest clinic at nhis.gov.gh', level: 'info' },
      { icon: '🦟', title: 'Cholera Preparedness Alert', body: 'Heightened monitoring in coastal communities. Wash hands, drink clean water, report clusters of diarrhoea immediately.', level: 'warning' },
      { icon: '🏥', title: 'Blood Donation Drive — All Groups Urgently Needed', body: 'Donate at any NBTS centre or major teaching hospital. Call 0302-667625.', level: 'info' },
      { icon: '☀️', title: 'Harmattan Heat Advisory', body: 'Stay hydrated. Vulnerable groups at risk of heat stroke. Avoid outdoor activity 12–3pm.', level: 'warning' },
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

      <!-- Emergency Contacts Directory -->
      <div class="card">
        <div class="card-header"><span class="card-title">📞 National Emergency Contacts</span></div>
        <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:12px;padding:12px;">
          ${[
      { svc: 'Ghana National Ambulance (GNEMS)', num: '193', icon: '🚑' },
      { svc: 'Ghana Police Service', num: '191', icon: '👮' },
      { svc: 'Ghana National Fire Service', num: '192', icon: '🚒' },
      { svc: 'NECHIS Command Centre', num: '0800-NECHIS', icon: '🏛️' },
      { svc: 'Korle Bu Teaching Hospital', num: '0302-665401', icon: '🏥' },
      { svc: 'Komfo Anokye Teaching Hospital', num: '0322-022301', icon: '🏥' },
      { svc: 'NHIS Authority', num: '0800-100-100', icon: '🪪' },
      { svc: 'National Blood Transfusion (NBTS)', num: '0302-667625', icon: '🩸' },
    ].map(c => `
            <div style="display:flex;align-items:center;gap:12px;padding:12px;background:var(--bg-surface);border-radius:var(--radius-sm);">
              <span style="font-size:20px;">${c.icon}</span>
              <div style="flex:1;">
                <div style="font-size:11px;font-weight:700;">${c.svc}</div>
                <div style="font-size:14px;color:var(--accent);font-family:monospace;font-weight:700;">${c.num}</div>
              </div>
              <a href="tel:${c.num}" class="btn btn-ghost" style="font-size:11px;padding:4px 8px;">Call</a>
            </div>`).join('')}
        </div>
      </div>
    </div>

    <!-- ========================== -->
    <!-- SOS MODAL (hidden)         -->
    <!-- ========================== -->
    <div id="sos-modal" style="display:none;position:fixed;inset:0;z-index:9999;background:rgba(0,0,0,0.85);backdrop-filter:blur(8px);display:none;align-items:center;justify-content:center;">
      <div style="background:var(--bg-elevated);border:2px solid var(--red);border-radius:16px;padding:28px;width:95%;max-width:480px;position:relative;">
        <div style="text-align:center;margin-bottom:20px;">
          <div style="font-size:48px;">🆘</div>
          <div style="font-size:20px;font-weight:800;color:var(--red);margin-top:8px;">ALERT NECHIS</div>
          <div style="font-size:12px;color:var(--text-muted);">Your GPS location will be shared with all emergency services</div>
        </div>
        <div id="sos-gps-info" style="text-align:center;padding:8px;background:rgba(0,212,170,0.08);border-radius:8px;font-size:11px;color:var(--accent);margin-bottom:16px;font-family:monospace;">📍 Fetching your location...</div>
        <div style="font-size:12px;font-weight:700;margin-bottom:10px;">Select emergency type:</div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:16px;">
          ${[
      { icon: '🚑', label: 'Medical Emergency', action: 'Medical emergency reported to GNEMS (193)', color: 'red' },
      { icon: '🚒', label: 'Fire / Explosion', action: 'Fire alert dispatched to GNFS (192)', color: 'amber' },
      { icon: '👮', label: 'Crime / Violence', action: 'Police unit dispatched from GPS-verified location', color: 'accent' },
      { icon: '🌊', label: 'Flood / Disaster', action: 'NADMO regional team alerted for your location', color: 'green' },
    ].map(t => `
            <button onclick="sendSOS('${t.label}','${t.action}')" style="padding:14px;background:var(--bg-surface);border:1px solid var(--border);border-radius:10px;cursor:pointer;transition:var(--transition);display:flex;flex-direction:column;align-items:center;gap:6px;" onmouseenter="this.style.borderColor='var(--${t.color})'" onmouseleave="this.style.borderColor='var(--border)'">
              <span style="font-size:28px;">${t.icon}</span>
              <span style="font-size:12px;font-weight:600;color:var(--${t.color});">${t.label}</span>
            </button>
          `).join('')}
        </div>
        <button onclick="closeSOSModal()" style="width:100%;padding:10px;background:transparent;border:1px solid var(--border);border-radius:8px;color:var(--text-muted);cursor:pointer;font-size:13px;">Cancel — Not an Emergency</button>
      </div>
    </div>
  `;

  // Auto-detect GPS on load
  detectGPS();

  // Init tab switcher
  window.showPubTab = function (tab) {
    document.querySelectorAll('[id^="pub-tab-"]').forEach(t => t.style.display = 'none');
    document.querySelectorAll('[id^="ptab-"]').forEach(b => b.classList.remove('active'));
    document.getElementById(`pub-tab-${tab}`).style.display = 'block';
    document.getElementById(`ptab-${tab}`).classList.add('active');
  };

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

// ===================== GPS =====================
let _pubLat = null, _pubLng = null;
function detectGPS() {
  const badge = document.getElementById('pub-gps-badge');
  const coords = document.getElementById('pub-gps-coords');
  const addr = document.getElementById('pub-gps-address');
  const status = document.getElementById('pub-gps-status');
  const sosInfo = document.getElementById('sos-gps-info');
  if (!navigator.geolocation) {
    if (badge) badge.textContent = '📍 GPS Not Available';
    return;
  }
  navigator.geolocation.getCurrentPosition(pos => {
    _pubLat = pos.coords.latitude.toFixed(5);
    _pubLng = pos.coords.longitude.toFixed(5);
    const txt = `${_pubLat}°N, ${_pubLng}°W`;
    if (badge) badge.textContent = `📍 ${txt}`;
    if (coords) coords.textContent = txt;
    if (addr) addr.textContent = 'Greater Accra Region, Ghana';
    if (status) { status.textContent = `✅ Location acquired: ${txt}`; status.style.color = 'var(--green)'; }
    if (sosInfo) sosInfo.textContent = `📍 GPS Ready: ${txt}`;
  }, () => {
    if (badge) badge.textContent = '📍 GPS Denied';
    if (status) { status.textContent = '⚠️ Location access denied. Enable in browser settings.'; status.style.color = 'var(--amber)'; }
    if (coords) coords.textContent = 'Location unavailable';
  });
}
window.refreshGPS = detectGPS;
window.shareLocationNow = function () {
  if (_pubLat) showToast(`📡 Live location (${_pubLat}, ${_pubLng}) shared with dispatcher!`, 'success');
  else { detectGPS(); showToast('Fetching GPS...', 'info'); }
};

// ===================== SOS MODAL =====================
window.openSOSModal = function () {
  const m = document.getElementById('sos-modal');
  if (m) { m.style.display = 'flex'; detectGPS(); }
};
window.closeSOSModal = function () {
  const m = document.getElementById('sos-modal');
  if (m) m.style.display = 'none';
};
window.sendSOS = function (type, action) {
  closeSOSModal();
  const loc = _pubLat ? ` @ (${_pubLat}, ${_pubLng})` : '';
  showToast(`🆘 SOS SENT: ${type}${loc} — ${action}`, 'critical');
  // Push to shared admin store
  if (window.submitPublicAlert) {
    submitPublicAlert({
      type,
      caller: 'SOS — Citizen (GPS Verified)',
      location: _pubLat ? `GPS: ${_pubLat}°N, ${_pubLng}°W` : 'Location unavailable',
      lat: _pubLat, lng: _pubLng,
      description: action,
      mediaCount: 0,
      priority: 'critical',
    });
  }
  // Update My Alert Status on tracking tab
  const as = document.getElementById('my-alert-status');
  if (as) as.innerHTML = `
        <div style="padding:14px;background:rgba(255,59,59,0.08);border:1px solid rgba(255,59,59,0.3);border-radius:var(--radius-sm);">
          <div style="font-size:11px;color:var(--red);font-weight:800;margin-bottom:4px;">🔴 ACTIVE ALERT — ${new Date().toLocaleTimeString()}</div>
          <div style="font-size:13px;font-weight:700;margin-bottom:4px;">${type}</div>
          <div style="font-size:11px;color:var(--text-muted);margin-bottom:10px;">Location: ${_pubLat ? _pubLat + ', ' + _pubLng : 'Shared'} • Status: Dispatching...</div>
          <div class="badge badge-urgent" style="display:inline-block;">🚑 Unit Dispatched (ETA ~4 min)</div>
        </div>`;
};

// ===================== CALLS =====================
window.publicCall = function (num, label) {
  showToast(`📞 Calling ${label} (${num})...`, 'info');
  window.location.href = `tel:${num}`;
};

// ===================== MEDIA UPLOAD =====================
window.previewSceneMedia = function (input) {
  const preview = document.getElementById('scene-preview');
  if (!preview) return;
  preview.innerHTML = '';
  Array.from(input.files).forEach(f => {
    const url = URL.createObjectURL(f);
    const box = document.createElement('div');
    box.style = 'width:80px;height:60px;border-radius:6px;overflow:hidden;border:1px solid var(--border);';
    if (f.type.startsWith('image')) {
      box.innerHTML = `<img src="${url}" style="width:100%;height:100%;object-fit:cover;">`;
    } else {
      box.innerHTML = `<video src="${url}" style="width:100%;height:100%;object-fit:cover;" muted></video>`;
    }
    preview.appendChild(box);
  });
};
window.submitSceneReport = function () {
  const desc = document.getElementById('scene-desc')?.value;
  const type = document.getElementById('incident-type')?.value || 'Emergency Report';
  const media = document.getElementById('scene-media')?.files?.length || 0;
  if (!desc && !media) { showToast('Describe the scene or attach a photo/video', 'warning'); return; }
  // Push to shared admin store
  if (window.submitPublicAlert) {
    submitPublicAlert({
      type,
      caller: 'Scene Report — Citizen',
      location: _pubLat ? `GPS: ${_pubLat}°N, ${_pubLng}°W` : 'Location unavailable',
      lat: _pubLat, lng: _pubLng,
      description: desc || 'Scene report (no description)',
      mediaCount: media,
      priority: 'urgent',
    });
  }
  showToast(`✅ Report sent to Dispatch: ${type} (${media} media file${media !== 1 ? 's' : ''}). Help is on the way.`, 'success');
};

// ===================== TELE-CALL =====================
window.startTeleCall = function (btn) {
  const status = document.getElementById('tele-status');
  const icon = document.getElementById('tele-ring');
  btn.disabled = true;
  btn.textContent = '⏳ Connecting...';
  setTimeout(() => {
    if (status) status.textContent = 'Connected to Paramedic — Kwame Asante (GNEMS)';
    if (icon) icon.textContent = '🟢';
    btn.textContent = '❌ End Call';
    btn.disabled = false;
    btn.style.background = 'var(--red)';
    btn.onclick = () => { btn.textContent = '📞 Start Video Triage Call'; btn.style.background = ''; btn.onclick = () => startTeleCall(btn); if (status) status.textContent = 'Call ended.'; if (icon) icon.textContent = '📹'; };
    showToast('🩺 Connected to paramedic. Follow their instructions.', 'success');
  }, 2500);
};

// ===================== TRIAGE ADVICE =====================
window.showTriageAdvice = function (symptom) {
  const box = document.getElementById('triage-advice-box');
  const tips = {
    cpr: '🫀 CALL 193 NOW. Start chest compressions immediately. 30 compressions then 2 breaths. Do not stop.',
    bleed: '🩸 Apply FIRM direct pressure. Do not release. If limb — consider tourniquet if trained. Call 193.',
    stroke: '🧠 Time is brain. Note time of symptoms. Call 193 NOW. Do not give food or water.',
    burn: '🔥 Cool water for 20 minutes. Do not apply cream. Cover loosely. Go to ED immediately.',
    choke: '😮 Back blows then Heimlich thrusts. Alternate until cleared. CPR if unconscious.',
    trauma: '🚑 Don\'t move unless in danger. Control bleeding. Keep warm. Call 193.',
    pain: '💔 Sit upright (chest pain) or lie flat (abdominal). Call 193 immediately.',
  };
  if (box && tips[symptom]) {
    box.style.display = 'block';
    box.textContent = tips[symptom];
  } else if (box) {
    box.style.display = 'none';
  }
};

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
      <div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:10px;">
        ${f.services.slice(0, 3).map(s => `<span class="equip-tag" style="font-size:10px;">${s}</span>`).join('')}
        ${f.services.length > 3 ? `<span class="equip-tag" style="font-size:10px;">+${f.services.length - 3} more</span>` : ''}
      </div>
      <div style="display:flex;gap:8px;">
        <a href="tel:${f.tel}" class="btn btn-primary" style="font-size:11px;padding:6px 12px;text-decoration:none;flex:1;text-align:center;">📞 Call</a>
        <a target="_blank" href="https://www.google.com/maps/search/${encodeURIComponent(f.name + ', Ghana')}" class="btn btn-ghost" style="font-size:11px;padding:6px 12px;text-decoration:none;">📍 Map</a>
        <button onclick="showToast('Ambulance dispatched to ${f.name}','success')" class="btn btn-ghost" style="font-size:11px;padding:6px 8px;">🚑</button>
      </div>
    </div>`;
}
