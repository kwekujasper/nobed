// ================================================================
// Module: Telemedicine
// ================================================================
function renderTelemedicine(container) {
    let activeCall = NDATA.teleConsults.find(t => t.status === 'live');

    container.innerHTML = `
    <div class="page-header">
      <div class="page-header-left">
        <h1>Telemedicine</h1>
        <p>Remote specialist consultations, ED-to-specialist link, EMT field support</p>
      </div>
      <div class="page-header-actions">
        <button class="btn btn-primary" onclick="openModal('Request Consultation', teleRequestForm())">
          <svg viewBox="0 0 24 24"><path d="M15 10l4.553-2.069A1 1 0 0121 8.87V15.13a1 1 0 01-1.447.899L15 14"/><rect x="1" y="6" width="15" height="12" rx="2"/></svg>
          Request Consult
        </button>
      </div>
    </div>

    <div class="grid-3 gap-12 mb-20">
      ${[
            { label: 'Live Sessions', count: NDATA.teleConsults.filter(t => t.status === 'live').length, color: 'red', icon: '🔴' },
            { label: 'Waiting', count: NDATA.teleConsults.filter(t => t.status === 'waiting').length, color: 'amber', icon: '⏳' },
            { label: 'Completed Today', count: NDATA.teleConsults.filter(t => t.status === 'completed').length, color: 'green', icon: '✓' },
        ].map(s => `
        <div class="card">
          <div style="font-size:24px;margin-bottom:8px;">${s.icon}</div>
          <div style="font-size:32px;font-weight:900;color:var(--${s.color});">${s.count}</div>
          <div style="font-size:12px;color:var(--text-muted);">${s.label}</div>
        </div>`).join('')}
    </div>

    ${activeCall ? `
    <!-- LIVE SESSION -->
    <div class="card red-card mb-20" style="border-color:var(--red);">
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:16px;">
        <span class="badge badge-critical">🔴 LIVE</span>
        <span style="font-size:15px;font-weight:700;">${activeCall.id} — ${activeCall.specialist} (${activeCall.specialty})</span>
        <span class="font-mono" style="font-size:12px;color:var(--text-muted);margin-left:auto;">Duration: ${activeCall.duration}</span>
      </div>
      <div class="tele-video-grid">
        <div>
          <div class="tele-main-video">
            <div class="tele-video-placeholder">
              <div style="font-size:48px;margin-bottom:12px;">👨‍⚕️</div>
              <div style="font-size:14px;font-weight:600;color:var(--text-secondary);">${activeCall.specialist}</div>
              <div style="font-size:12px;color:var(--text-muted);">${activeCall.specialty} — KBU</div>
              <div style="margin-top:16px;display:inline-flex;align-items:center;gap:8px;padding:6px 14px;background:var(--red-dim);border-radius:20px;border:1px solid rgba(255,59,59,0.3);">
                <span style="width:8px;height:8px;border-radius:50%;background:var(--red);animation:pulseDot 1s ease infinite;display:inline-block;"></span>
                <span style="font-size:12px;color:var(--red);font-weight:600;">LIVE CONSULTATION</span>
              </div>
            </div>
            <!-- PIP view -->
            <div style="position:absolute;bottom:12px;right:12px;width:120px;height:80px;background:#000;border-radius:8px;border:2px solid var(--accent);display:flex;align-items:center;justify-content:center;font-size:24px;">👤</div>
          </div>
          <!-- Controls -->
          <div class="tele-controls">
            <button class="tele-btn active" title="Mic"><svg viewBox="0 0 24 24"><path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z"/><path d="M19 10v2a7 7 0 01-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg></button>
            <button class="tele-btn active" title="Camera"><svg viewBox="0 0 24 24"><path d="M15 10l4.553-2.069A1 1 0 0121 8.87V15.13a1 1 0 01-1.447.899L15 14"/><rect x="1" y="6" width="15" height="12" rx="2"/></svg></button>
            <button class="tele-btn" title="Share Screen"><svg viewBox="0 0 24 24"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg></button>
            <button class="tele-btn" title="Chat"><svg viewBox="0 0 24 24"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg></button>
            <button class="tele-btn" title="Vitals Share" onclick="showToast('Patient vitals shared with consultant','success')"><svg viewBox="0 0 24 24"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg></button>
            <button class="tele-btn danger" title="End Call" onclick="showToast('Call ended — Summary recorded','info')"><svg viewBox="0 0 24 24"><path d="M10.68 13.31a16 16 0 003.41 2.6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7 2 2 0 012 2v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.42 19.42 0 013.43 9.63a2 2 0 012-2.18h3a2 2 0 012 1.72c.129.96.37 1.903.72 2.81a2 2 0 01-.45 2.11z"/><line x1="23" y1="1" x2="1" y2="23"/></svg></button>
          </div>
        </div>
        <!-- Sidebar: Patient Info & Vitals -->
        <div class="tele-sidebar">
          <div class="card" style="padding:14px;">
            <div class="section-title" style="font-size:12px;margin-bottom:10px;">Patient Context</div>
            <div style="font-size:12px;color:var(--text-secondary);">${activeCall.patient}</div>
            <div style="font-size:11px;color:var(--text-muted);margin-top:4px;">Requested by: ${activeCall.requestedBy} • ${activeCall.requestFacility}</div>
            <hr class="divider"/>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;font-size:12px;">
              ${[
                { l: 'HR', v: '110/min', c: 'red' },
                { l: 'BP', v: '84/52', c: 'red' },
                { l: 'SpO₂', v: '91%', c: 'red' },
                { l: 'GCS', v: '12/15', c: 'amber' },
                { l: 'Temp', v: '38.7°C', c: 'amber' },
                { l: 'RR', v: '24/min', c: 'amber' },
            ].map(x => `<div style="background:var(--bg-surface);border-radius:6px;padding:6px 8px;">
                  <div style="font-size:9px;color:var(--text-muted);">${x.l}</div>
                  <div style="font-weight:700;color:var(--${x.c});">${x.v}</div>
                </div>`).join('')}
            </div>
          </div>
          <div class="card" style="padding:14px;flex:1;">
            <div class="section-title" style="font-size:12px;margin-bottom:10px;">Chat</div>
            <div style="display:flex;flex-direction:column;gap:8px;max-height:200px;overflow-y:auto;" id="tele-chat">
              <div style="font-size:11px;"><span style="color:var(--accent);font-weight:600;">Dr. Tetteh:</span> <span>Please send CT head images — can't advise without imaging</span></div>
              <div style="font-size:11px;"><span style="color:var(--amber);font-weight:600;">Dr. Boateng:</span> <span>CT unavailable here — blood pressure still dropping</span></div>
              <div style="font-size:11px;"><span style="color:var(--accent);font-weight:600;">Dr. Tetteh:</span> <span>Prepare for immediate transfer. Activate neuro team at KBU — I'll be in theatre.</span></div>
            </div>
            <div style="display:flex;gap:8px;margin-top:10px;">
              <input type="text" class="form-input" placeholder="Type message..." style="flex:1;font-size:12px;padding:8px;" id="chat-input"/>
              <button class="btn btn-primary" style="padding:8px 12px;" onclick="sendChatMsg()">→</button>
            </div>
          </div>
        </div>
      </div>
    </div>` : ''}

    <!-- Consult Queue -->
    <div class="section-title">Consultation Queue</div>
    <div style="display:flex;flex-direction:column;gap:10px;margin-top:12px;">
      ${NDATA.teleConsults.map(t => `
        <div class="card ${t.status === 'live' ? 'red-card' : ''}">
          <div style="display:flex;align-items:center;gap:12px;flex-wrap:wrap;">
            <div style="width:40px;height:40px;border-radius:50%;background:${t.status === 'live' ? 'var(--red-dim)' : t.status === 'waiting' ? 'var(--amber-dim)' : 'var(--green-dim)'};display:flex;align-items:center;justify-content:center;font-size:18px;flex-shrink:0;">
              ${t.status === 'live' ? '🔴' : t.status === 'waiting' ? '⏳' : '✅'}
            </div>
            <div style="flex:1;">
              <div style="font-size:13px;font-weight:700;">${t.specialist} — <span style="color:var(--accent);">${t.specialty}</span></div>
              <div style="font-size:12px;color:var(--text-secondary);">Patient: ${t.patient}</div>
              <div style="font-size:11px;color:var(--text-muted);">Requested by: ${t.requestedBy} • ${t.requestFacility}</div>
            </div>
            <div style="text-align:right;flex-shrink:0;">
              <div class="badge ${t.status === 'live' ? 'badge-critical' : t.status === 'waiting' ? 'badge-urgent' : 'badge-available'}">${t.status.toUpperCase()}</div>
              <div style="font-size:11px;color:var(--text-muted);margin-top:4px;" class="font-mono">
                ${t.startTime ? '⏱ ' + t.duration : t.scheduledTime ? 'Sched. ' + t.scheduledTime : '✓ ' + t.duration}
              </div>
            </div>
            <div style="display:flex;gap:8px;">
              ${t.status === 'waiting' ? `<button class="btn btn-primary" style="font-size:12px;" onclick="showToast('Joining consultation...','info')">Join</button>` :
                    t.status === 'live' ? `<button class="btn btn-danger" style="font-size:12px;">Live</button>` :
                        `<button class="btn btn-ghost" style="font-size:12px;">Summary</button>`}
            </div>
          </div>
        </div>`).join('')}
    </div>
  `;
}

function teleRequestForm() {
    return `
    <div class="form-grid form-grid-2">
      <div class="form-group"><label class="form-label">Specialty Required</label><select class="form-select"><option>Neurosurgery</option><option>Cardiology</option><option>Neonatology</option><option>Pediatrics</option><option>Critical Care</option><option>Obstetrics</option><option>Orthopaedics</option></select></div>
      <div class="form-group"><label class="form-label">Urgency</label><select class="form-select"><option>Immediate</option><option>Urgent (within 1h)</option><option>Routine</option></select></div>
      <div class="form-group"><label class="form-label">Patient (anon)</label><input type="text" class="form-input" placeholder="M/55 — Subdural Hematoma"/></div>
      <div class="form-group"><label class="form-label">Requesting Facility</label><select class="form-select">${NDATA.facilities.map(f => `<option>${f.name}</option>`).join('')}</select></div>
      <div class="form-group" style="grid-column:span 2"><label class="form-label">Clinical Question / Context</label><textarea class="form-textarea" placeholder="Clinical context, key vitals, imaging findings..."></textarea></div>
    </div>
    <div class="form-actions mt-16">
      <button class="btn btn-primary" onclick="showToast('Consultation requested — Matching specialist...','success');closeModal();">Request</button>
      <button class="btn btn-ghost" onclick="closeModal()">Cancel</button>
    </div>`;
}

function sendChatMsg() {
    const input = document.getElementById('chat-input');
    const chat = document.getElementById('tele-chat');
    if (!input || !chat) return;
    const msg = input.value.trim();
    if (!msg) return;
    chat.innerHTML += `<div style="font-size:11px;"><span style="color:var(--amber);font-weight:600;">You:</span> <span>${msg}</span></div>`;
    input.value = '';
    chat.scrollTop = chat.scrollHeight;
}
window.sendChatMsg = sendChatMsg;
