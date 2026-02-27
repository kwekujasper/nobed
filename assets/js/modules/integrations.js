// ================================================================
// Module: Integration Hub — NHIS, Ghana Card, GMIS, CSMS
// ================================================================
function renderIntegrations(container) {
    container.innerHTML = `
    <div class="page-header">
      <div class="page-header-left">
        <h1>Integration Hub</h1>
        <p>NHIS verification, Ghana Card lookup, GMIS sync, CSMS SMS management</p>
      </div>
      <div class="page-header-actions">
        <button class="btn btn-ghost" onclick="checkIntegrationStatus()">↻ Check Status</button>
        <button class="btn btn-primary" onclick="sendTestSms()">
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 8.63 19.79 19.79 0 01.04 4.18 2 2 0 012 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg>
          Test CSMS SMS
        </button>
      </div>
    </div>

    <!-- Integration Status Cards -->
    <div class="grid-4 gap-12 mb-20" id="integ-status-grid">
      ${['CSMS (Custom SMS)', 'NHIS', 'Ghana Card (NIA)', 'GMIS'].map((s, i) => `
      <div class="card" style="padding:16px;" id="integ-card-${i}">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
          <span style="font-size:12px;font-weight:700;color:var(--text-secondary);">${s}</span>
          <span class="badge badge-reserved" id="integ-status-${i}">Checking...</span>
        </div>
        <div style="font-size:11px;color:var(--text-muted);" id="integ-mode-${i}">—</div>
      </div>`).join('')}
    </div>

    <!-- Tab Nav -->
    <div style="display:flex;gap:4px;margin-bottom:16px;border-bottom:1px solid var(--border);padding-bottom:8px;">
      <button onclick="showIntegTab('nhis')" id="itab-nhis" class="notif-tab active">🏥 NHIS Verify</button>
      <button onclick="showIntegTab('ghana')" id="itab-ghana" class="notif-tab">🇬🇭 Ghana Card</button>
      <button onclick="showIntegTab('gmis')" id="itab-gmis" class="notif-tab">📊 GMIS Lookup</button>
      <button onclick="showIntegTab('sms')" id="itab-sms" class="notif-tab">📱 CSMS / SMS</button>
    </div>

    <!-- NHIS Tab -->
    <div id="integ-nhis" class="integ-tab-content">
      <div class="grid-2 gap-16">
        <div class="card">
          <div class="card-header"><span class="card-title">NHIS Member Verification</span><span class="badge badge-available">Live</span></div>
          <div style="padding:16px;">
            <div class="form-group mb-12">
              <label class="form-label">NHIS Membership Number</label>
              <div style="display:flex;gap:8px;">
                <input id="nhis-input" type="text" class="form-input" placeholder="e.g. AA202500031G" style="flex:1;font-family:monospace;letter-spacing:1px;" />
                <button class="btn btn-primary" onclick="verifyNhis()">Verify</button>
              </div>
              <div style="font-size:11px;color:var(--text-muted);margin-top:4px;">Format: 2 letters + 8 digits + optional letter/digit</div>
            </div>
            <div class="form-group mb-0">
              <label class="form-label">Date of Birth (optional cross-check)</label>
              <input id="nhis-dob" type="date" class="form-input" />
            </div>
          </div>
        </div>
        <div class="card" id="nhis-result-card" style="display:none;">
          <div class="card-header"><span class="card-title">Verification Result</span></div>
          <div id="nhis-result" style="padding:16px;"></div>
        </div>
      </div>
      <!-- Coverage breakdown (shown after verify) -->
      <div id="nhis-coverage" style="display:none;margin-top:16px;"></div>
    </div>

    <!-- Ghana Card Tab -->
    <div id="integ-ghana" class="integ-tab-content" style="display:none;">
      <div class="grid-2 gap-16">
        <div class="card">
          <div class="card-header"><span class="card-title">Ghana Card (NIA) Verification</span><span class="badge badge-available">Live</span></div>
          <div style="padding:16px;">
            <div class="form-group mb-12">
              <label class="form-label">Ghana Card Number</label>
              <div style="display:flex;gap:8px;">
                <input id="ghana-input" type="text" class="form-input" placeholder="GHA-123456789-1" style="flex:1;font-family:monospace;letter-spacing:1px;text-transform:uppercase;" />
                <button class="btn btn-primary" onclick="verifyGhanaCard()">Lookup</button>
              </div>
              <div style="font-size:11px;color:var(--text-muted);margin-top:4px;">Format: GHA-XXXXXXXXX-X</div>
            </div>
            <div style="font-size:12px;color:var(--text-muted);background:var(--bg-surface);border-radius:var(--radius-sm);padding:10px;border:1px solid var(--border);">
              <strong>Privacy Notice:</strong> Ghana Card data is retrieved from NIA in real-time. All lookups are audit-logged per GDPR/DPO requirements.
            </div>
          </div>
        </div>
        <div class="card" id="ghana-result-card" style="display:none;">
          <div class="card-header"><span class="card-title">NIA Verification Result</span></div>
          <div id="ghana-result" style="padding:16px;"></div>
        </div>
      </div>
    </div>

    <!-- GMIS Tab -->
    <div id="integ-gmis" class="integ-tab-content" style="display:none;">
      <div class="grid-2 gap-16">
        <div class="card">
          <div class="card-header"><span class="card-title">GMIS Patient Record Lookup</span></div>
          <div style="padding:16px;">
            <div class="form-group mb-12">
              <label class="form-label">Patient ID / GHS Number</label>
              <div style="display:flex;gap:8px;">
                <input id="gmis-input" type="text" class="form-input" placeholder="GHS-XXXXXXXX" style="flex:1;font-family:monospace;" />
                <button class="btn btn-primary" onclick="lookupGmisPatient()">Search</button>
              </div>
            </div>
            <hr style="border:none;border-top:1px solid var(--border);margin:12px 0;" />
            <div style="font-size:12px;font-weight:700;color:var(--text-secondary);margin-bottom:10px;">Data Sync to GMIS</div>
            <div style="font-size:12px;color:var(--text-muted);margin-bottom:10px;">Sync today's facility statistics to GHS Management Information System</div>
            <button class="btn btn-ghost" style="width:100%;" onclick="syncToGmis()">↑ Push Sync to GMIS</button>
          </div>
        </div>
        <div class="card" id="gmis-result-card" style="display:none;">
          <div class="card-header"><span class="card-title">GMIS Patient Record</span></div>
          <div id="gmis-result" style="padding:16px;"></div>
        </div>
      </div>
    </div>

    <!-- CSMS / SMS Tab -->
    <div id="integ-sms" class="integ-tab-content" style="display:none;">
      <div class="grid-2 gap-16">
        <div class="card">
          <div class="card-header"><span class="card-title">CSMS Configuration & Test</span></div>
          <div style="padding:16px;">
            <div style="display:grid;gap:8px;margin-bottom:16px;">
              <div style="display:flex;justify-content:space-between;font-size:13px;padding:8px;background:var(--bg-surface);border-radius:var(--radius-sm);">
                <span style="color:var(--text-muted);">Provider</span><strong>CSMS (Custom)</strong>
              </div>
              <div style="display:flex;justify-content:space-between;font-size:13px;padding:8px;background:var(--bg-surface);border-radius:var(--radius-sm);">
                <span style="color:var(--text-muted);">Endpoint</span><span id="sms-endpoint" style="font-size:11px;font-family:monospace;color:var(--accent);">Loading...</span>
              </div>
              <div style="display:flex;justify-content:space-between;font-size:13px;padding:8px;background:var(--bg-surface);border-radius:var(--radius-sm);">
                <span style="color:var(--text-muted);">Sender ID</span><strong>NECHIS</strong>
              </div>
            </div>
            <div class="form-group mb-12">
              <label class="form-label">Test Phone Number</label>
              <input id="sms-test-phone" type="tel" class="form-input" placeholder="+233244123456" />
            </div>
            <div class="form-group mb-12">
              <label class="form-label">Test Message</label>
              <textarea id="sms-test-msg" class="form-textarea" rows="3">NECHIS test message — system operational. Time: ${new Date().toLocaleTimeString()}</textarea>
            </div>
            <button class="btn btn-primary" style="width:100%;" onclick="sendTestSms()">Send Test SMS</button>
          </div>
        </div>
        <div class="card">
          <div class="card-header"><span class="card-title">SMS Log (Last 20)</span><button class="btn btn-ghost" style="font-size:11px;" onclick="loadSmsLog()">↻ Refresh</button></div>
          <div id="sms-log-list" style="max-height:380px;overflow-y:auto;">
            <div style="padding:32px;text-align:center;color:var(--text-muted);font-size:13px;">Click Refresh to load logs</div>
          </div>
        </div>
      </div>
    </div>
  `;

    checkIntegrationStatus();
}

// ================================================================
// Integration Logic
// ================================================================
function showIntegTab(name) {
    document.querySelectorAll('.integ-tab-content').forEach(t => t.style.display = 'none');
    document.querySelectorAll('[id^="itab-"]').forEach(t => t.classList.remove('active'));
    const el = document.getElementById('integ-' + name);
    if (el) el.style.display = '';
    const tab = document.getElementById('itab-' + name);
    if (tab) tab.classList.add('active');
}

async function checkIntegrationStatus() {
    try {
        const r = await fetch('api/integrations.php?action=integration_status');
        const data = await r.json();
        if (!data.success) return;
        const labels = ['csms', 'nhis', 'nia', 'gmis'];
        Object.entries(data.integrations).forEach(([key, info], idx) => {
            const sb = document.getElementById('integ-status-' + idx);
            const mb = document.getElementById('integ-mode-' + idx);
            if (sb) {
                sb.textContent = info.configured ? '✓ Configured' : '⚠ Needs key';
                sb.className = 'badge ' + (info.configured ? 'badge-available' : 'badge-urgent');
            }
            if (mb) mb.textContent = info.mock ? '🔄 Mock mode (demo data)' : ('🔗 ' + info.endpoint.replace('https://', '').split('/')[0]);
        });
        // Show CSMS endpoint
        const ep = document.getElementById('sms-endpoint');
        if (ep) ep.textContent = data.integrations.csms?.endpoint || 'Not configured';
    } catch (e) { }
}

async function verifyNhis() {
    const id = document.getElementById('nhis-input').value.trim();
    const dob = document.getElementById('nhis-dob').value;
    if (!id) { showToast('Enter an NHIS ID', 'error'); return; }

    showToast('Verifying NHIS membership...', 'info');
    const card = document.getElementById('nhis-result-card');
    const res = document.getElementById('nhis-result');
    card.style.display = '';
    res.innerHTML = '<div style="padding:20px;text-align:center;color:var(--text-muted);">🔄 Querying NHIS database...</div>';

    try {
        const r = await fetch('api/integrations.php?action=nhis_verify', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nhis_id: id, dob })
        });
        const data = await r.json();
        if (data.success && data.data.verified) {
            const d = data.data;
            res.innerHTML = `
              <div style="display:flex;align-items:center;gap:12px;margin-bottom:16px;padding:12px;background:rgba(34,197,94,0.08);border-radius:var(--radius-sm);border-left:3px solid var(--green);">
                <span style="font-size:24px;">✅</span>
                <div><div style="font-weight:700;color:var(--green);">Verified Active Member</div><div style="font-size:12px;color:var(--text-muted);">${d.nhis_id}</div></div>
              </div>
              <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;font-size:12px;">
                ${[['Name', d.name], ['DOB', d.dob], ['Gender', d.gender], ['Scheme', d.scheme],
                ['Card Expiry', d.card_expiry], ['Enrolled at', d.enrolled_at],
                ['Ghana Card', d.ghana_card || 'Not linked']
                ].map(([k, v]) => `<div style="background:var(--bg-surface);padding:8px;border-radius:4px;"><span style="color:var(--text-muted)">${k}</span><br><strong>${v}</strong></div>`).join('')}
              </div>`;
            // Coverage
            const cov = d.coverage;
            document.getElementById('nhis-coverage').style.display = '';
            document.getElementById('nhis-coverage').innerHTML = `
              <div class="card">
                <div class="card-header"><span class="card-title">NHIS Coverage & Benefits</span></div>
                <div style="padding:16px;">
                  <div class="grid-4 gap-12 mb-16">
                    ${[['Outpatient', cov.outpatient], ['Inpatient', cov.inpatient], ['Surgery', cov.surgery],
                ['Maternity', cov.maternity], ['Dental', cov.dental], ['Optical', cov.optical]
                ].map(([k, v]) => `<div style="padding:10px;background:var(--bg-surface);border-radius:var(--radius-sm);text-align:center;">
                        <div style="font-size:18px;">${v ? '✅' : '❌'}</div><div style="font-size:11px;font-weight:600;">${k}</div>
                      </div>`).join('')}
                  </div>
                  <div style="display:flex;gap:16px;font-size:13px;">
                    <div>Annual Limit: <strong style="color:var(--green);">${cov.max_annual}</strong></div>
                    <div>YTD Claims: <strong style="color:var(--amber);">${cov.ytd_claims}</strong></div>
                  </div>
                  <div style="margin-top:12px;font-size:12px;font-weight:700;color:var(--text-secondary);">Recent Claims</div>
                  <div style="margin-top:8px;display:grid;gap:4px;">
                    ${(d.recent_claims || []).map(c => `
                      <div style="display:flex;justify-content:space-between;padding:6px 8px;background:var(--bg-surface);border-radius:4px;font-size:11px;">
                        <span style="color:var(--text-muted);">${c.date}</span>
                        <span>${c.facility}</span><span>${c.service}</span>
                        <strong style="color:var(--accent);">${c.amount}</strong>
                      </div>`).join('')}
                  </div>
                </div>
              </div>`;
            showToast('NHIS membership verified ✓', 'success');
        } else {
            res.innerHTML = `<div style="padding:20px;background:rgba(220,38,38,0.06);border-radius:var(--radius-sm);border-left:3px solid var(--red);">
              <div style="font-weight:700;color:var(--red);margin-bottom:8px;">❌ Verification Failed</div>
              <div style="font-size:13px;">Status: <strong>${data.data?.status || 'Not found'}</strong></div>
              <div style="font-size:12px;color:var(--text-muted);margin-top:6px;">${data.data?.message || data.error || 'Please check the NHIS ID and try again.'}</div>
            </div>`;
            showToast('NHIS verification failed', 'error');
        }
    } catch (e) {
        res.innerHTML = '<div style="color:var(--red);padding:16px;">Connection error — ' + e.message + '</div>';
    }
}

async function verifyGhanaCard() {
    const num = document.getElementById('ghana-input').value.trim().toUpperCase();
    if (!num) { showToast('Enter a Ghana Card number', 'error'); return; }

    showToast('Querying NIA database...', 'info');
    const card = document.getElementById('ghana-result-card');
    const res = document.getElementById('ghana-result');
    card.style.display = '';
    res.innerHTML = '<div style="padding:20px;text-align:center;color:var(--text-muted);">🔄 Querying NIA...</div>';

    try {
        const r = await fetch('api/integrations.php?action=ghana_card', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ card_number: num })
        });
        const data = await r.json();
        if (data.success && data.data.verified) {
            const d = data.data;
            res.innerHTML = `
              <div style="display:flex;align-items:center;gap:12px;margin-bottom:16px;padding:10px;background:rgba(34,197,94,0.08);border-radius:var(--radius-sm);border-left:3px solid var(--green);">
                <div style="width:48px;height:48px;border-radius:50%;background:var(--accent-dim);border:2px solid var(--accent);display:flex;align-items:center;justify-content:center;font-size:20px;font-weight:900;color:var(--accent);">
                  ${d.first_name[0]}${d.surname[0]}
                </div>
                <div><div style="font-weight:700;font-size:15px;">${d.full_name}</div>
                <div style="font-size:11px;color:var(--text-muted);">${d.card_number}</div></div>
              </div>
              <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;font-size:12px;">
                ${[['DOB', d.dob], ['Gender', d.gender], ['Nationality', d.nationality],
                ['Home Region', d.home_region], ['Home District', d.home_district],
                ['Address', d.address], ['Phone', d.phone],
                ['Card Expiry', d.expiry_date], ['NHIS Linked', d.nhis_linked || 'None'],
                ['TIN Linked', d.tin_linked || 'None']
                ].map(([k, v]) => `<div style="background:var(--bg-surface);padding:8px;border-radius:4px;"><span style="color:var(--text-muted)">${k}</span><br><strong style="font-size:11px;">${v || '—'}</strong></div>`).join('')}
              </div>`;
            showToast('Ghana Card verified ✓', 'success');
        } else {
            res.innerHTML = `<div style="padding:16px;background:rgba(220,38,38,0.06);border-radius:var(--radius-sm);border-left:3px solid var(--red);">
              <div style="font-weight:700;color:var(--red);">❌ Not Found</div>
              <div style="font-size:12px;color:var(--text-muted);margin-top:6px;">${data.data?.error || 'Ghana Card not found in NIA database.'}</div>
            </div>`;
            showToast('Ghana Card not found', 'error');
        }
    } catch (e) {
        res.innerHTML = '<div style="color:var(--red);padding:16px;">Connection error</div>';
    }
}

async function lookupGmisPatient() {
    const id = document.getElementById('gmis-input').value.trim();
    if (!id) { showToast('Enter a patient ID', 'error'); return; }

    showToast('Querying GMIS...', 'info');
    const card = document.getElementById('gmis-result-card');
    const res = document.getElementById('gmis-result');
    card.style.display = '';
    res.innerHTML = '<div style="padding:20px;text-align:center;color:var(--text-muted);">🔄 Querying GMIS...</div>';

    const r = await fetch(`api/integrations.php?action=gmis_patient&patient_id=${encodeURIComponent(id)}`);
    const data = await r.json();
    if (data.success) {
        const d = data.data;
        res.innerHTML = `
          <div style="margin-bottom:12px;"><div style="font-size:16px;font-weight:900;">${d.name}</div>
          <div style="font-size:12px;color:var(--text-muted);">${d.ghs_id} · DOB: ${d.dob} · ${d.gender} · Blood: <strong style="color:var(--red);">${d.blood_type}</strong></div></div>
          <div style="font-size:12px;font-weight:700;margin-bottom:8px;">⚠ Allergies</div>
          <div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:12px;">
            ${(d.allergies || []).map(a => `<span class="badge badge-critical">${a}</span>`).join('')}
          </div>
          <div style="font-size:12px;font-weight:700;margin-bottom:6px;">🩺 Chronic Conditions</div>
          <div style="font-size:12px;color:var(--text-secondary);margin-bottom:12px;">${(d.chronic_conditions || []).join(', ')}</div>
          <div style="font-size:12px;font-weight:700;margin-bottom:6px;">💊 Current Medications</div>
          ${(d.current_medications || []).map(m => `
            <div style="font-size:11px;padding:6px;background:var(--bg-surface);border-radius:4px;margin-bottom:4px;">
              <strong>${m.drug}</strong> ${m.dose} — ${m.frequency} (since ${m.since})
            </div>`).join('')}`;
        showToast('GMIS record loaded', 'success');
    } else {
        res.innerHTML = '<div style="color:var(--red);padding:16px;">Patient not found in GMIS</div>';
    }
}

async function syncToGmis() {
    showToast('Syncing to GMIS...', 'info');
    const r = await fetch('api/integrations.php?action=gmis_sync', { method: 'POST' });
    const d = await r.json();
    if (d.success) showToast(`GMIS sync complete — ${d.records_synced} records pushed`, 'success');
    else showToast('GMIS sync failed: ' + d.error, 'error');
}

async function sendTestSms() {
    const phone = document.getElementById('sms-test-phone')?.value?.trim() || '';
    const msg = document.getElementById('sms-test-msg')?.value?.trim() || 'NECHIS test message';
    if (!phone) { showToast('Enter a phone number to test', 'error'); return; }
    showToast('Sending test SMS via CSMS...', 'info');
    const r = await fetch('api/integrations.php?action=sms_test', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, message: msg })
    });
    const d = await r.json();
    if (d.success) showToast('SMS sent successfully via ' + d.provider + ' ✓', 'success');
    else showToast('SMS failed — check CSMS config', 'error');
}

async function loadSmsLog() {
    const r = await fetch('api/integrations.php?action=sms_status');
    const d = await r.json();
    const list = document.getElementById('sms-log-list');
    if (!list) return;
    if (!d.logs || !d.logs.length) {
        list.innerHTML = '<div style="padding:20px;text-align:center;color:var(--text-muted);">No SMS logs yet</div>';
        return;
    }
    list.innerHTML = d.logs.slice(0, 20).map(l => `
      <div style="padding:10px 14px;border-bottom:1px solid var(--border);font-size:12px;">
        <div style="display:flex;justify-content:space-between;margin-bottom:4px;">
          <span style="font-family:monospace;font-weight:700;">${l.recipient}</span>
          <span class="badge ${l.status === 'sent' ? 'badge-available' : 'badge-critical'}">${l.status}</span>
        </div>
        <div style="color:var(--text-muted);">${(l.message || '').substring(0, 80)}${l.message?.length > 80 ? '...' : ''}</div>
        <div style="font-size:10px;color:var(--text-muted);margin-top:2px;">${l.created_at || ''} · ${l.provider}</div>
      </div>`).join('');
}

window.renderIntegrations = renderIntegrations;
window.showIntegTab = showIntegTab;
window.verifyNhis = verifyNhis;
window.verifyGhanaCard = verifyGhanaCard;
window.lookupGmisPatient = lookupGmisPatient;
window.syncToGmis = syncToGmis;
window.sendTestSms = sendTestSms;
window.loadSmsLog = loadSmsLog;
window.checkIntegrationStatus = checkIntegrationStatus;
