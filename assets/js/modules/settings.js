// ================================================================
// Module: Settings & Admin — National Commander Full Dashboard
// ================================================================
function renderSettings(container) {
  const user = Auth.getUser();
  const isNational = user && (user.role === 'national_command' || user.role === 'analytics_officer');
  let tab = 'users';
  container.innerHTML = `
    <div class="page-header">
      <div class="page-header-left"><h1>Settings &amp; Administration</h1>
        <p>User management, roles, facility config, CSMS &amp; all integrations</p></div>
      <div class="page-header-actions">
        <button class="btn btn-primary" onclick="openModal('Create User', createUserForm())">
          <svg viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
          Add User
        </button>
      </div>
    </div>

    <div class="tab-bar">
      <button class="tab-btn active" onclick="switchSettingTab('users')">👤 Users &amp; Roles</button>
      <button class="tab-btn" onclick="switchSettingTab('facilities')">🏥 Facilities</button>
      <button class="tab-btn" onclick="switchSettingTab('system')">⚙️ System</button>
      ${isNational ? `
      <button class="tab-btn" onclick="switchSettingTab('integrations')">🔗 Integrations &amp; CSMS</button>
      <button class="tab-btn" onclick="switchSettingTab('smsbroadcast')">📱 SMS Broadcast</button>` : ''}
      <button class="tab-btn" onclick="switchSettingTab('audit')">📋 Audit Log</button>
    </div>
    <div id="settings-tab-content"></div>
  `;

  function renderTabContent() {
    const c = document.getElementById('settings-tab-content');
    if (!c) return;

    if (tab === 'users') {
      c.innerHTML = `
        <div class="table-wrap mt-16">
          <table>
            <thead><tr><th>User</th><th>Role</th><th>Facility</th><th>Region</th><th>Last Login</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              ${[
          { name: 'Dr. Kweku Mensah', role: 'National Command', facility: 'NECC HQ', region: 'National', login: '27 Feb 01:40', status: 'active' },
          { name: 'Samuel Acheampong', role: 'Analytics Officer', facility: 'GHS Headquarters', region: 'National', login: '27 Feb 01:00', status: 'active' },
          { name: 'Dr. Ama Asante', role: 'Regional Director', facility: 'GAR Health Directorate', region: 'Greater Accra', login: '27 Feb 00:05', status: 'active' },
          { name: 'Dr. Benard Antwi', role: 'HECU Commander', facility: 'Korle Bu Teaching Hospital', region: 'Greater Accra', login: '26 Feb 20:44', status: 'active' },
          { name: 'Dr. Adwoa Acheampong', role: 'HECU Commander', facility: 'Komfo Anokye Teaching Hospital', region: 'Ashanti', login: '25 Feb 19:30', status: 'active' },
          { name: 'Nurse Abena Poku', role: 'Nurse', facility: 'Korle Bu Teaching Hospital', region: 'Greater Accra', login: '27 Feb 00:18', status: 'active' },
          { name: 'Nurse Bismark Nyamasekpor', role: 'Nurse', facility: 'Korle Bu Teaching Hospital', region: 'Greater Accra', login: '26 Feb 08:10', status: 'active' },
          { name: 'Bismark Darko', role: 'Nurse', facility: 'Korle Bu Teaching Hospital', region: 'Greater Accra', login: '26 Feb 09:30', status: 'active' },
          { name: 'Nurse Worlas', role: 'Nurse', facility: 'Korle Bu Teaching Hospital', region: 'Greater Accra', login: '26 Feb 07:45', status: 'active' },
          { name: 'Nurse Osei', role: 'Nurse', facility: 'Korle Bu Teaching Hospital', region: 'Greater Accra', login: '26 Feb 06:50', status: 'active' },
          { name: 'Nurse Felix', role: 'Nurse', facility: 'Komfo Anokye Teaching Hospital', region: 'Ashanti', login: '26 Feb 10:20', status: 'active' },
          { name: 'Dr. Botsyoe', role: 'Clinician', facility: 'Korle Bu Teaching Hospital', region: 'Greater Accra', login: '26 Feb 08:00', status: 'active' },
          { name: 'Dr. Belson', role: 'Clinician', facility: 'Korle Bu Teaching Hospital', region: 'Greater Accra', login: '26 Feb 09:00', status: 'active' },
          { name: 'Dr. Elvis', role: 'Clinician', facility: 'Ridge Hospital', region: 'Greater Accra', login: '26 Feb 07:30', status: 'active' },
          { name: 'Dr. Suzzy', role: 'Clinician', facility: 'Ridge Hospital', region: 'Greater Accra', login: '26 Feb 10:00', status: 'active' },
          { name: 'Dr. Ohene', role: 'Clinician', facility: 'Tema General Hospital', region: 'Greater Accra', login: '26 Feb 09:15', status: 'active' },
          { name: 'Dr. Gifty', role: 'Clinician', facility: 'Komfo Anokye Teaching Hospital', region: 'Ashanti', login: '26 Feb 12:00', status: 'active' },
          { name: 'Dr. Salifu', role: 'Clinician', facility: 'Tamale Teaching Hospital', region: 'Northern', login: '26 Feb 08:45', status: 'active' },
          { name: 'Dr. Yaa Boateng', role: 'Clinician', facility: 'Ridge Hospital', region: 'Greater Accra', login: '26 Feb 08:55', status: 'active' },
          { name: 'Dr. Samuel Owusu', role: 'Clinician', facility: 'Korle Bu Teaching Hospital', region: 'Greater Accra', login: '25 Feb 21:00', status: 'active' },
          { name: 'Patrick Bonsu', role: 'EMT Dispatcher', facility: 'GNEMS Accra', region: 'Greater Accra', login: '27 Feb 00:30', status: 'active' },
          { name: 'Dispatch Bright', role: 'EMT Dispatcher', facility: 'GNEMS Accra', region: 'Greater Accra', login: '26 Feb 11:00', status: 'active' },
          { name: 'Dr. Aboagye', role: 'Clinician', facility: 'Ridge Hospital', region: 'Greater Accra', login: '27 Feb 06:30', status: 'active' },
          { name: 'Dr. Elinam', role: 'Clinician', facility: 'Ho Teaching Hospital', region: 'Volta', login: '27 Feb 07:15', status: 'active' },
          { name: 'Ebenezer Osei-Bonsu', role: 'Equipment Officer', facility: 'Korle Bu Teaching Hospital', region: 'Greater Accra', login: '25 Feb 08:00', status: 'active' },
        ].map(u => `
                <tr>
                  <td style="font-weight:600;">${u.name}</td>
                  <td><span class="badge badge-reserved">${u.role}</span></td>
                  <td style="font-size:12px;">${u.facility}</td>
                  <td style="font-size:12px;">${u.region}</td>
                  <td class="font-mono" style="font-size:11px;">${u.login}</td>
                  <td><span class="badge ${u.status === 'active' ? 'badge-available' : 'badge-faulty'}">${u.status.toUpperCase()}</span></td>
                  <td>
                    <div style="display:flex;gap:4px;">
                      <button class="btn btn-ghost" style="font-size:11px;padding:3px 8px;" onclick="showToast('User edited','info')">Edit</button>
                      <button class="btn btn-ghost" style="font-size:11px;padding:3px 8px;" onclick="showToast('${u.status === 'active' ? 'User suspended' : 'User reactivated'}','warning')">${u.status === 'active' ? 'Suspend' : 'Reactivate'}</button>
                    </div>
                  </td>
                </tr>`).join('')}
            </tbody>
          </table>
        </div>
        <div class="section-title mt-20 mb-12">Role Permissions Matrix</div>
        <div class="table-wrap">
          <table>
            <thead><tr><th>Role</th><th>National View</th><th>Referral</th><th>Beds</th><th>Dispatch</th><th>Equipment</th><th>Analytics</th><th>Nursing</th><th>Integrations</th><th>Admin</th></tr></thead>
            <tbody>
              ${[
          { role: 'National Command', perms: [1, 1, 1, 1, 1, 1, 1, 1, 1] },
          { role: 'Regional Director', perms: [1, 1, 1, 1, 1, 1, 0, 0, 0] },
          { role: 'HECU Commander', perms: [0, 1, 1, 0, 1, 1, 0, 0, 0] },
          { role: 'Nurse / Bed Manager', perms: [0, 0, 1, 0, 0, 0, 1, 1, 0] },
          { role: 'EMT Dispatcher', perms: [0, 1, 0, 1, 0, 0, 0, 0, 0] },
          { role: 'Equipment Officer', perms: [0, 0, 0, 0, 1, 0, 0, 0, 0] },
          { role: 'Clinician', perms: [0, 1, 0, 0, 0, 0, 1, 1, 0] },
          { role: 'Analytics Officer', perms: [1, 0, 0, 0, 0, 1, 1, 0, 0] },
        ].map(r => `
                <tr><td style="font-weight:600;">${r.role}</td>
                  ${r.perms.map(p => `<td style="text-align:center;color:${p ? 'var(--green)' : 'var(--red)'};">${p ? '✓' : '✕'}</td>`).join('')}
                </tr>`).join('')}
            </tbody>
          </table>
        </div>`;

    } else if (tab === 'facilities') {
      c.innerHTML = `
        <div class="table-wrap mt-16">
          <table>
            <thead><tr><th>ID</th><th>Facility</th><th>Level</th><th>Region</th><th>ICU Total</th><th>Services</th><th>DB Status</th></tr></thead>
            <tbody>
              ${NDATA.facilities.map(f => `
                <tr>
                  <td class="font-mono text-accent" style="font-size:11px;">${f.id}</td>
                  <td style="font-weight:600;">${f.name}</td>
                  <td style="font-size:12px;">${f.level}</td>
                  <td style="font-size:12px;">${f.region}</td>
                  <td style="text-align:center;">${f.icuTotal}</td>
                  <td>${f.services.slice(0, 3).map(s => `<span class="equip-tag" style="font-size:10px;">${s}</span>`).join(' ')}${f.services.length > 3 ? `<span style="font-size:10px;color:var(--text-muted);">+${f.services.length - 3}</span>` : ''}</td>
                  <td><span class="badge badge-available">Online</span></td>
                </tr>`).join('')}
            </tbody>
          </table>
        </div>`;

    } else if (tab === 'system') {
      c.innerHTML = `
        <div class="grid-2 gap-16 mt-16">
          <div class="card">
            <div class="section-title mb-14">System Thresholds</div>
            <div style="display:flex;flex-direction:column;gap:14px;">
              ${[
          { label: 'Referral SLA Critical (mins)', val: '30', type: 'number' },
          { label: 'Referral SLA Urgent (mins)', val: '120', type: 'number' },
          { label: 'Auto-escalate after (mins)', val: '10', type: 'number' },
          { label: 'ED Boarding Alert Threshold (hrs)', val: '6', type: 'number' },
          { label: 'ICU High Occupancy Alert (%)', val: '85', type: 'number' },
          { label: 'Session Timeout (minutes)', val: '15', type: 'number' },
        ].map(s => `
                <div class="form-group" style="flex-direction:row;align-items:center;display:flex;justify-content:space-between;gap:16px;margin:0;">
                  <label style="font-size:12px;color:var(--text-secondary);flex:1;">${s.label}</label>
                  <input type="${s.type}" class="form-input" value="${s.val}" style="width:100px;text-align:center;"/>
                </div>`).join('')}
              <button class="btn btn-primary mt-12" onclick="showToast('System preferences saved','success')">Save Preferences</button>
            </div>
          </div>
          <div class="card">
            <div class="section-title mb-14">Live Integration Status</div>
            ${[
          { l: 'SMS (CSMS)', v: 'Active — Custom Gateway', ok: true, icon: '📱' },
          { l: 'NHIS API', v: 'Mock mode (Demo data)', ok: true, icon: '🏥' },
          { l: 'Ghana Card (NIA)', v: 'Mock mode (Demo data)', ok: true, icon: '🇬🇭' },
          { l: 'GMIS', v: 'Mock mode (Demo data)', ok: true, icon: '📊' },
          { l: 'In-App Notifications', v: 'Active — Real-time', ok: true, icon: '🔔' },
          { l: 'DHIMS2 Sync', v: 'Enabled — Every 6h', ok: true, icon: '🔄' },
          { l: 'Private Hospital API', v: 'Partial — 4/7 connected', ok: false, icon: '🔌' },
        ].map(x => `
              <div style="display:flex;justify-content:space-between;align-items:center;padding:10px 0;border-bottom:1px solid var(--border);font-size:12px;">
                <span style="color:var(--text-secondary);">${x.icon} ${x.l}</span>
                <span style="color:${x.ok ? 'var(--green)' : 'var(--amber)'};">● ${x.v}</span>
              </div>`).join('')}
            ${isNational ? `<button class="btn btn-ghost mt-16" style="width:100%;font-size:12px;" onclick="switchSettingTab('integrations')">→ Manage Integrations</button>` : ''}
          </div>
        </div>`;

    } else if (tab === 'integrations') {
      c.innerHTML = `
        <div style="margin-top:16px;display:grid;gap:16px;">
          <!-- CSMS -->
          <div class="card">
            <div class="card-header"><span class="card-title">📱 CSMS — Custom SMS Gateway</span><span class="badge badge-available">Active Provider</span></div>
            <div style="padding:16px;">
              <div class="grid-2 gap-12">
                <div class="form-group"><label class="form-label">CSMS API Endpoint URL</label>
                  <input id="cfg-csms-url" type="url" class="form-input" placeholder="https://sms.yourdomain.com/api/send" /></div>
                <div class="form-group"><label class="form-label">CSMS API Key / Bearer Token</label>
                  <input id="cfg-csms-key" type="password" class="form-input" placeholder="your_csms_api_key" /></div>
                <div class="form-group"><label class="form-label">Sender ID (max 11 chars)</label>
                  <input id="cfg-csms-sender" type="text" class="form-input" value="NECHIS" maxlength="11" /></div>
                <div class="form-group"><label class="form-label">Test Phone Number</label>
                  <input id="cfg-csms-test" type="tel" class="form-input" placeholder="+233244123456" /></div>
              </div>
              <div style="display:flex;gap:8px;margin-top:12px;">
                <button class="btn btn-primary" onclick="saveCsmsConfig()">💾 Save Config</button>
                <button class="btn btn-ghost" onclick="testCsmsFromSettings()">📤 Send Test SMS</button>
              </div>
            </div>
          </div>
          <!-- NHIS -->
          <div class="card">
            <div class="card-header"><span class="card-title">🏥 NHIS Integration</span><span class="badge badge-reserved">Mock Mode</span></div>
            <div style="padding:16px;">
              <div class="grid-2 gap-12">
                <div class="form-group"><label class="form-label">NHIS API Base URL</label>
                  <input type="url" class="form-input" value="https://api.nhis.gov.gh/v1" /></div>
                <div class="form-group"><label class="form-label">NHIS API Key</label>
                  <input type="password" class="form-input" placeholder="your_nhis_api_key" /></div>
                <div class="form-group"><label class="form-label">Mode</label>
                  <select class="form-select"><option selected>Mock (Demo Data)</option><option>Live API</option></select></div>
                <div class="form-group" style="align-self:end;">
                  <button class="btn btn-ghost" style="width:100%;" onclick="showToast('NHIS config saved','success')">Save</button>
                </div>
              </div>
            </div>
          </div>
          <!-- NIA -->
          <div class="card">
            <div class="card-header"><span class="card-title">🇬🇭 Ghana Card (NIA) Integration</span><span class="badge badge-reserved">Mock Mode</span></div>
            <div style="padding:16px;">
              <div class="grid-2 gap-12">
                <div class="form-group"><label class="form-label">NIA Verification URL</label>
                  <input type="url" class="form-input" value="https://api.nia.gov.gh/verify" /></div>
                <div class="form-group"><label class="form-label">NIA API Key</label>
                  <input type="password" class="form-input" placeholder="your_nia_api_key" /></div>
                <div class="form-group"><label class="form-label">Mode</label>
                  <select class="form-select"><option selected>Mock (Demo Data)</option><option>Live API</option></select></div>
                <div class="form-group" style="align-self:end;">
                  <button class="btn btn-ghost" style="width:100%;" onclick="showToast('NIA config saved','success')">Save</button>
                </div>
              </div>
            </div>
          </div>
          <!-- GMIS -->
          <div class="card">
            <div class="card-header"><span class="card-title">📊 GMIS Integration</span><span class="badge badge-reserved">Mock Mode</span></div>
            <div style="padding:16px;">
              <div class="grid-2 gap-12">
                <div class="form-group"><label class="form-label">GMIS API Base URL</label>
                  <input type="url" class="form-input" value="https://gmis.ghs.gov.gh/api" /></div>
                <div class="form-group"><label class="form-label">GMIS API Key</label>
                  <input type="password" class="form-input" placeholder="your_gmis_api_key" /></div>
                <div class="form-group"><label class="form-label">Auto Sync Interval</label>
                  <select class="form-select"><option>Every 6 hours</option><option>Every 12 hours</option><option>Daily</option><option>Manual only</option></select></div>
                <div class="form-group" style="align-self:end;display:flex;gap:6px;">
                  <button class="btn btn-ghost" style="flex:1;" onclick="showToast('GMIS config saved','success')">Save</button>
                  <button class="btn btn-ghost" style="flex:1;" onclick="showToast('GMIS sync started...','info')">↑ Sync Now</button>
                </div>
              </div>
            </div>
          </div>
        </div>`;

    } else if (tab === 'smsbroadcast') {
      c.innerHTML = `
        <div class="grid-2 gap-16 mt-16">
          <div class="card">
            <div class="card-header"><span class="card-title">📱 CSMS SMS Broadcast</span></div>
            <div style="padding:16px;">
              <div class="form-group mb-12">
                <label class="form-label">Message Template</label>
                <select class="form-select" onchange="loadSmsTemplate(this.value)">
                  <option value="">— Custom message —</option>
                  <option value="surge">Surge Activation Alert</option>
                  <option value="referral_escalate">Referral Escalation</option>
                  <option value="equipment_fault">Equipment Fault Alert</option>
                  <option value="ambulance_dispatch">Ambulance Dispatch</option>
                  <option value="medication_due">Medication Due Reminder</option>
                </select>
              </div>
              <div class="form-group mb-12">
                <label class="form-label">Target Audience</label>
                <select class="form-select" id="sms-target" onchange="toggleCustomPhone(this.value)">
                  <option value="all">All Active Users</option>
                  <option value="national_command">National Command only</option>
                  <option value="regional_director">Regional Directors</option>
                  <option value="hecu_commander">HECU Commanders</option>
                  <option value="emt_dispatcher">EMT Dispatchers</option>
                  <option value="bed_manager">Nurses / Bed Managers</option>
                  <option value="custom">Custom phone number</option>
                </select>
              </div>
              <div class="form-group mb-12" id="sms-custom-phone-group" style="display:none;">
                <label class="form-label">Custom Phone Number</label>
                <input id="sms-custom-phone" type="tel" class="form-input" placeholder="+233244123456" />
              </div>
              <div class="form-group mb-16">
                <label class="form-label">Message <span id="sms-char-count" style="color:var(--text-muted);font-size:11px;">0 / 160</span></label>
                <textarea id="sms-broadcast-msg" class="form-textarea" rows="5" maxlength="1600"
                  placeholder="Type your broadcast message..."
                  oninput="document.getElementById('sms-char-count').textContent=this.value.length+' / 160'"></textarea>
              </div>
              <button class="btn btn-danger" style="width:100%;" onclick="sendBroadcastSms()">📤 Send Broadcast SMS via CSMS</button>
            </div>
          </div>
          <div class="card">
            <div class="card-header"><span class="card-title">SMS Delivery Log</span>
              <button class="btn btn-ghost" style="font-size:11px;" onclick="loadSettingsSmsLog()">↻ Refresh</button></div>
            <div id="settings-sms-log" style="max-height:420px;overflow-y:auto;">
              <div style="padding:24px;text-align:center;color:var(--text-muted);font-size:13px;">Click Refresh to load log</div>
            </div>
          </div>
        </div>`;

    } else { // audit
      c.innerHTML = `
        <div class="table-wrap mt-16">
          <table>
            <thead><tr><th>Timestamp</th><th>User</th><th>Action</th><th>Entity</th><th>IP</th></tr></thead>
            <tbody>
              ${[
          { ts: '2026-02-27 01:40', user: 'Dr. Mensah', action: 'NHIS verification', entity: 'AA20250001G', ip: '196.1.48.22' },
          { ts: '2026-02-27 01:30', user: 'Nurse Poku', action: 'MAR entry — Morphine', entity: 'P001 / KBTH-ICU-3', ip: '196.1.48.25' },
          { ts: '2026-02-27 01:20', user: 'Patrick Bonsu', action: 'Dispatched ambulance', entity: 'AMB-GA-12', ip: '41.93.17.6' },
          { ts: '2026-02-27 00:58', user: 'Dr. Boateng', action: 'Equipment fault reported', entity: 'EQ-VENT-KBTH-004', ip: '196.1.48.28' },
          { ts: '2026-02-27 00:48', user: 'Dr. Asante', action: 'Accepted referral', entity: 'REF-2024-002', ip: '41.71.20.5' },
          { ts: '2026-02-27 00:43', user: 'System', action: 'Auto-escalated referral', entity: 'REF-2024-004', ip: 'System' },
          { ts: '2026-02-27 00:30', user: 'Dr. Mensah', action: 'Activated surge mode', entity: 'National — GAR', ip: '196.1.48.22' },
          { ts: '2026-02-27 00:15', user: 'Dr. Mensah', action: 'Login', entity: 'Session', ip: '196.1.48.22' },
        ].map(a => `
                <tr>
                  <td class="font-mono" style="font-size:11px;">${a.ts}</td>
                  <td style="font-size:12px;font-weight:600;">${a.user}</td>
                  <td style="font-size:12px;">${a.action}</td>
                  <td class="font-mono" style="font-size:11px;color:var(--accent);">${a.entity}</td>
                  <td class="font-mono" style="font-size:11px;color:var(--text-muted);">${a.ip}</td>
                </tr>`).join('')}
            </tbody>
          </table>
        </div>`;
    }
  }

  window.switchSettingTab = function (t) {
    tab = t;
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    event?.target?.classList?.add('active');
    renderTabContent();
  };
  renderTabContent();
}

// Settings helpers
function toggleCustomPhone(val) {
  const grp = document.getElementById('sms-custom-phone-group');
  if (grp) grp.style.display = val === 'custom' ? '' : 'none';
}

function loadSmsTemplate(key) {
  const templates = {
    surge: 'NECHIS SURGE ALERT: Surge activated in [Region]. Level: [Level]. All available units report immediately. — National Command.',
    referral_escalate: 'NECHIS ESCALATION: Referral [REF-ID] escalated to Level [Level]. Immediate attention required — [Patient details].',
    equipment_fault: 'NECHIS NHIMMS: Equipment fault — [Equipment] at [Facility]. Severity: [Severity]. Maintenance team respond.',
    ambulance_dispatch: 'NECHIS EMT: Ambulance [Unit] dispatched to [Location]. ETA [X] min. Case: [Description].',
    medication_due: 'NECHIS NURSING: Medication due — [Drug] [Dose] for [Patient] at [Time]. Please administer.',
  };
  const ta = document.getElementById('sms-broadcast-msg');
  if (ta && templates[key]) {
    ta.value = templates[key];
    document.getElementById('sms-char-count').textContent = ta.value.length + ' / 160';
  }
}

async function sendBroadcastSms() {
  const msg = document.getElementById('sms-broadcast-msg')?.value?.trim();
  const tgt = document.getElementById('sms-target')?.value;
  const custom = document.getElementById('sms-custom-phone')?.value?.trim();
  if (!msg) { showToast('Enter a message', 'error'); return; }
  if (tgt === 'custom' && !custom) { showToast('Enter a phone number', 'error'); return; }
  showToast('Broadcasting via CSMS... this may take a moment', 'info');
  // Simulate broadcast
  await new Promise(r => setTimeout(r, 1200));
  const fakeCount = tgt === 'custom' ? 1 : tgt === 'all' ? 24 : Math.floor(Math.random() * 8) + 2;
  showToast(`Broadcast sent to ${fakeCount} recipient${fakeCount > 1 ? 's' : ''} via CSMS ✓`, 'success');
}

async function loadSettingsSmsLog() {
  const list = document.getElementById('settings-sms-log');
  if (!list) return;
  try {
    const r = await fetch('api/integrations.php?action=sms_status');
    const d = await r.json();
    if (!d.logs?.length) {
      list.innerHTML = '<div style="padding:20px;text-align:center;color:var(--text-muted);">No SMS logs yet — send a test or broadcast first</div>';
      return;
    }
    list.innerHTML = `
          <div style="padding:10px 14px;border-bottom:1px solid var(--border);display:flex;gap:16px;font-size:11px;color:var(--text-muted);">
            <span>Sent: <strong style="color:var(--green);">${d.stats.sent}</strong></span>
            <span>Failed: <strong style="color:var(--red);">${d.stats.failed}</strong></span>
            <span>Provider: <strong>CSMS</strong></span>
          </div>` +
      d.logs.slice(0, 20).map(l => `
          <div style="padding:10px 14px;border-bottom:1px solid var(--border);font-size:12px;">
            <div style="display:flex;justify-content:space-between;margin-bottom:4px;">
              <span style="font-family:monospace;font-weight:700;">${l.recipient}</span>
              <span class="badge ${l.status === 'sent' ? 'badge-available' : 'badge-critical'}">${l.status}</span>
            </div>
            <div style="color:var(--text-muted);">${(l.message || '').substring(0, 80)}</div>
            <div style="font-size:10px;color:var(--text-muted);margin-top:2px;">${l.created_at || ''}</div>
          </div>`).join('');
  } catch (e) {
    list.innerHTML = '<div style="padding:20px;text-align:center;color:var(--red);">Could not load SMS log</div>';
  }
}

async function saveCsmsConfig() {
  const url = document.getElementById('cfg-csms-url')?.value?.trim();
  const key = document.getElementById('cfg-csms-key')?.value?.trim();
  const sender = document.getElementById('cfg-csms-sender')?.value?.trim();
  if (!url || !key) { showToast('Enter CSMS URL and API Key', 'error'); return; }
  // In production, this would POST to an admin API endpoint to update config.php
  showToast(`CSMS config saved — Endpoint: ${url.split('/').slice(0, 3).join('/')}`, 'success');
}

async function testCsmsFromSettings() {
  const phone = document.getElementById('cfg-csms-test')?.value?.trim();
  if (!phone) { showToast('Enter a test phone number', 'error'); return; }
  const r = await fetch('api/integrations.php?action=sms_test', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone, message: 'NECHIS CSMS test — ' + new Date().toLocaleTimeString() })
  });
  const d = await r.json();
  if (d.success) showToast('Test SMS sent via ' + d.provider + ' ✓', 'success');
  else showToast('Test SMS failed — check CSMS credentials', 'error');
}

function createUserForm() {
  return `
    <div class="form-grid form-grid-2">
      <div class="form-group"><label class="form-label">Full Name</label><input type="text" class="form-input"/></div>
      <div class="form-group"><label class="form-label">Email</label><input type="email" class="form-input"/></div>
      <div class="form-group"><label class="form-label">Role</label><select class="form-select">
        <option>National Command</option><option>Regional Director</option><option>HECU Commander</option>
        <option>Bed Manager / Nurse</option><option>EMT Dispatcher</option><option>Equipment Officer</option>
        <option>Clinician</option><option>Analytics Officer</option>
      </select></div>
      <div class="form-group"><label class="form-label">Facility</label><select class="form-select">
        ${NDATA.facilities.map(f => `<option>${f.name}</option>`).join('')}
      </select></div>
      <div class="form-group"><label class="form-label">Phone</label><input type="tel" class="form-input" placeholder="+233-..."/></div>
      <div class="form-group"><label class="form-label">Temp. PIN</label><input type="password" class="form-input" value="1234"/></div>
    </div>
    <div class="form-actions mt-16">
      <button class="btn btn-primary" onclick="showToast('User created — Welcome SMS sent via CSMS','success');closeModal();">Create User</button>
      <button class="btn btn-ghost" onclick="closeModal()">Cancel</button>
    </div>`;
}

window.createUserForm = createUserForm;
window.loadSmsTemplate = loadSmsTemplate;
window.sendBroadcastSms = sendBroadcastSms;
window.loadSettingsSmsLog = loadSettingsSmsLog;
window.saveCsmsConfig = saveCsmsConfig;
window.testCsmsFromSettings = testCsmsFromSettings;
window.toggleCustomPhone = toggleCustomPhone;
