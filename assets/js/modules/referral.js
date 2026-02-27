// ================================================================
// Module: Referral Coordination Engine
// ================================================================
function renderReferral(container) {
    let tab = 'inbox';

    function render() {
        const pending = NDATA.referrals.filter(r => r.status === 'pending');
        const accepted = NDATA.referrals.filter(r => r.status === 'accepted' || r.status === 'en-route');
        const declined = NDATA.referrals.filter(r => r.status === 'declined');

        container.innerHTML = `
      <div class="page-header">
        <div class="page-header-left">
          <h1>Referral Coordination Engine</h1>
          <p>Manage referrals, SLA compliance, accept/decline, and escalation</p>
        </div>
        <div class="page-header-actions">
          <button class="btn btn-primary" onclick="openCreateReferralModal()">
            <svg viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Create Referral
          </button>
        </div>
      </div>

      <!-- Stats -->
      <div class="grid-4 gap-12 mb-20">
        <div class="card red-card">
          <div class="card-header"><span class="card-title">Critical Pending</span><div class="card-icon red"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg></div></div>
          <div class="card-value red">${NDATA.referrals.filter(r => r.status === 'pending' && r.urgency === 'critical').length}</div>
          <div class="card-label">Require immediate action</div>
        </div>
        <div class="card amber-card">
          <div class="card-header"><span class="card-title">All Pending</span></div>
          <div class="card-value amber">${pending.length}</div>
          <div class="card-label">Awaiting acceptance</div>
        </div>
        <div class="card">
          <div class="card-header"><span class="card-title">Accepted / En-Route</span><div class="card-icon green"><svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg></div></div>
          <div class="card-value green">${accepted.length}</div>
          <div class="card-label">In transfer/accepted</div>
        </div>
        <div class="card">
          <div class="card-header"><span class="card-title">Declined</span></div>
          <div class="card-value">${declined.length}</div>
          <div class="card-label">Redirected or escalated</div>
        </div>
      </div>

      <!-- Tabs -->
      <div class="tab-bar">
        <button class="tab-btn ${tab === 'inbox' ? 'active' : ''}" onclick="switchRefTab('inbox')">📥 Inbox (${pending.length})</button>
        <button class="tab-btn ${tab === 'active' ? 'active' : ''}" onclick="switchRefTab('active')">🔄 Active (${accepted.length})</button>
        <button class="tab-btn ${tab === 'declined' ? 'active' : ''}" onclick="switchRefTab('declined')">❌ Declined (${declined.length})</button>
        <button class="tab-btn ${tab === 'escalation' ? 'active' : ''}" onclick="switchRefTab('escalation')">🚨 Escalation Ladder</button>
        <button class="tab-btn ${tab === 'all' ? 'active' : ''}" onclick="switchRefTab('all')">📋 All Referrals</button>
      </div>

      <div id="ref-tab-content"></div>
    `;

        window.switchRefTab = function (t) { tab = t; renderTabContent(); };
        renderTabContent();
    }

    function renderTabContent() {
        const content = document.getElementById('ref-tab-content');
        if (!content) return;

        if (tab === 'inbox') {
            const pending = NDATA.referrals.filter(r => r.status === 'pending');
            content.innerHTML = `<div style="display:flex;flex-direction:column;gap:14px;">
        ${pending.map(r => referralCard(r, true)).join('')}
      </div>`;
            pending.forEach(r => startSLATimer(`ref-sla-${r.id}`, r.slaRemain));

        } else if (tab === 'active') {
            const active = NDATA.referrals.filter(r => r.status === 'accepted' || r.status === 'en-route');
            content.innerHTML = `<div style="display:flex;flex-direction:column;gap:14px;">${active.map(r => referralCard(r, false)).join('')}</div>`;

        } else if (tab === 'declined') {
            const dec = NDATA.referrals.filter(r => r.status === 'declined');
            content.innerHTML = `<div style="display:flex;flex-direction:column;gap:14px;">${dec.map(r => referralCard(r, false)).join('')}</div>`;

        } else if (tab === 'escalation') {
            content.innerHTML = escalationView();

        } else {
            content.innerHTML = `<div class="table-wrap">
        <table>
          <thead><tr><th>ID</th><th>Patient</th><th>From</th><th>To</th><th>Service</th><th>Urgency</th><th>Status</th><th>Time</th><th>Actions</th></tr></thead>
          <tbody>
            ${NDATA.referrals.map(r => `
              <tr>
                <td class="font-mono text-accent" style="font-size:11px;">${r.id}</td>
                <td>${r.patient}</td>
                <td style="font-size:12px;">${r.from}</td>
                <td style="font-size:12px;">${r.to}</td>
                <td style="font-size:11px;">${r.service}</td>
                <td>${urgencyBadge(r.urgency)}</td>
                <td>${renderRefStatus(r.status)}</td>
                <td class="font-mono" style="font-size:11px;">${fmtTime(r.timestamp)}</td>
                <td><button class="btn btn-ghost" style="font-size:11px;padding:4px 10px;" onclick="openReferralDetail('${r.id}')">View</button></td>
              </tr>`).join('')}
          </tbody>
        </table></div>`;
        }
    }

    function referralCard(r, showActions) {
        const isUrgent = r.urgency === 'critical';
        return `
      <div class="card ${isUrgent ? 'red-card' : ''}" style="padding:18px;">
        <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:12px;flex-wrap:wrap;">
          <div>
            <div style="display:flex;align-items:center;gap:10px;margin-bottom:6px;">
              <span class="font-mono text-accent" style="font-size:12px;font-weight:700;">${r.id}</span>
              ${urgencyBadge(r.urgency)}
              ${renderRefStatus(r.status)}
              ${r.escalated ? '<span class="badge badge-urgent">ESCALATED</span>' : ''}
            </div>
            <div style="font-size:15px;font-weight:700;margin-bottom:4px;">${r.service}</div>
            <div style="font-size:13px;color:var(--text-secondary);">Patient: ${r.patient}</div>
            <div style="font-size:12px;color:var(--text-muted);margin-top:4px;">
              <strong>From:</strong> ${r.from} → <strong>To:</strong> ${r.to}
            </div>
            ${r.reason ? `<div style="font-size:12px;color:var(--text-muted);margin-top:2px;"><strong>Reason:</strong> ${r.reason}</div>` : ''}
            ${r.clinician ? `<div style="font-size:11px;color:var(--text-muted);margin-top:2px;">Clinician: ${r.clinician}</div>` : ''}
            ${r.declineReason ? `<div style="font-size:12px;color:var(--red);margin-top:4px;">⛔ Declined: ${r.declineReason}</div>` : ''}
            ${r.acceptedBy ? `<div style="font-size:12px;color:var(--green);margin-top:4px;">✓ Accepted by ${r.acceptedBy} at ${r.acceptTime}</div>` : ''}
            ${r.eta ? `<div style="font-size:12px;color:var(--blue);margin-top:4px;">🚑 En-route — ETA: ${r.eta} | Ambulance: ${r.ambulance}</div>` : ''}
          </div>
          <div style="text-align:right;flex-shrink:0;">
            <div style="font-size:10px;color:var(--text-muted);margin-bottom:4px;">SLA Remaining</div>
            ${r.status === 'pending' ? `<div class="sla-timer" id="ref-sla-${r.id}">--:--</div>` : '<div class="text-muted font-mono" style="font-size:12px;">N/A</div>'}
            <div style="font-size:10px;color:var(--text-muted);margin-top:6px;">${fmtTime(r.timestamp)}</div>
          </div>
        </div>
        ${showActions ? `
        <hr class="divider"/>
        <div style="display:flex;gap:10px;flex-wrap:wrap;">
          <button class="btn btn-primary" style="font-size:12px;" onclick="showToast('✓ Referral ${r.id} Accepted — Bed reserved','success')">✓ Accept</button>
          <button class="btn btn-danger" style="font-size:12px;" onclick="openDeclineModal('${r.id}')">✕ Decline</button>
          <button class="btn btn-amber" style="font-size:12px;" onclick="showToast('⬆ Escalated to Regional Command','warning')">↑ Escalate</button>
          <button class="btn btn-ghost" style="font-size:12px;" onclick="openReferralDetail('${r.id}')">👁 Details</button>
          <button class="btn btn-ghost" style="font-size:12px;" onclick="window.location.hash='emt'">🚑 Dispatch Ambulance</button>
        </div>` : ''}
      </div>`;
    }

    function escalationView() {
        return `<div class="grid-2 gap-16">
      <div class="card">
        <div class="section-title" style="margin-bottom:16px;">Escalation Ladder — REF-2024-004</div>
        <ul class="escalation-ladder">
          <li class="escalation-item">
            <div class="escalation-dot done"></div>
            <div class="escalation-body">
              <div class="escalation-name">Dr. Samuel Adjei — Medical Superintendent</div>
              <div class="escalation-role">Accra Clinic</div>
              <div class="escalation-time">✓ Notified — 21:55</div>
            </div>
          </li>
          <li class="escalation-item">
            <div class="escalation-dot active"></div>
            <div class="escalation-body">
              <div class="escalation-name">Dr. Abena Poku — Regional Medical Director</div>
              <div class="escalation-role">Greater Accra Regional Health Directorate</div>
              <div class="escalation-time" style="color:var(--red);">⚡ ACTIVE — 22:05 — No response in 10 mins</div>
            </div>
          </li>
          <li class="escalation-item">
            <div class="escalation-dot pending"></div>
            <div class="escalation-body">
              <div class="escalation-name">National Command Duty Officer</div>
              <div class="escalation-role">NECC Headquarters — Accra</div>
              <div class="escalation-time">⏳ Pending — Auto-escalates at 22:15</div>
            </div>
          </li>
          <li class="escalation-item">
            <div class="escalation-dot pending"></div>
            <div class="escalation-body">
              <div class="escalation-name">Director-General, Ghana Health Service</div>
              <div class="escalation-role">National Level — Surge Override</div>
              <div class="escalation-time">⏳ Pending</div>
            </div>
          </li>
        </ul>
      </div>
      <div class="card">
        <div class="section-title">Facility Match — REF-2024-004 (Cardiac ICU)</div>
        <div style="display:flex;flex-direction:column;gap:10px;">
          ${[
                { name: 'Korle Bu Teaching Hospital', icuAvail: 4, dist: '2.3 km', match: 91, reason: 'Best match — Cardiologist on call' },
                { name: 'Ridge Hospital', icuAvail: 6, dist: '5.1 km', match: 74, reason: 'ICU available — No cardiologist on call' },
                { name: '37 Military Hospital', icuAvail: 5, dist: '6.8 km', match: 68, reason: 'Military — requires authorization' },
            ].map((f, i) => `
            <div style="background:var(--bg-surface);border-radius:var(--radius-sm);padding:14px;border-left:3px solid ${i === 0 ? 'var(--accent)' : 'var(--border)'};">
              <div style="display:flex;justify-content:space-between;align-items:center;">
                <span style="font-size:13px;font-weight:700;">${f.name}</span>
                <span style="font-size:16px;font-weight:900;color:${f.match > 80 ? 'var(--green)' : 'var(--amber)'};">${f.match}%</span>
              </div>
              <div style="font-size:11px;color:var(--text-muted);margin:4px 0;">${f.dist} away • ${f.icuAvail} ICU beds available</div>
              <div style="font-size:11px;color:var(--text-secondary);">${f.reason}</div>
              <button class="btn btn-ghost" style="font-size:11px;padding:4px 10px;margin-top:8px;" onclick="showToast('Pre-alert sent to ${f.name}','success')">Send Pre-Alert</button>
            </div>`).join('')}
        </div>
      </div>
    </div>`;
    }

    window.openCreateReferralModal = function () {
        openModal('Create New Referral', `
      <div class="form-grid form-grid-2">
        <div class="form-group"><label class="form-label">Patient Age</label><input type="number" class="form-input" placeholder="Age"/></div>
        <div class="form-group"><label class="form-label">Sex</label><select class="form-select"><option>Male</option><option>Female</option></select></div>
        <div class="form-group"><label class="form-label">Sending Facility</label><select class="form-select">${NDATA.facilities.map(f => `<option>${f.name}</option>`).join('')}</select></div>
        <div class="form-group"><label class="form-label">Urgency</label><select class="form-select"><option>critical</option><option>urgent</option><option>routine</option></select></div>
        <div class="form-group col-span-2" style="grid-column:span 2">
          <label class="form-label">Provisional Diagnosis / Chief Complaint</label>
          <input type="text" class="form-input" placeholder="e.g. Traumatic Brain Injury — GCS 7"/>
        </div>
        <div class="form-group"><label class="form-label">Service Required</label><select class="form-select"><option>ICU + Ventilator</option><option>Neurosurgery</option><option>NICU</option><option>CT Scan</option><option>Cardiac ICU</option><option>Dialysis</option><option>Maternity HDU</option><option>Pediatric ICU</option></select></div>
        <div class="form-group"><label class="form-label">GCS Score</label><input type="number" class="form-input" placeholder="3–15" min="3" max="15"/></div>
        <div class="form-group col-span-2" style="grid-column:span 2">
          <label class="form-label">Clinical Notes / Vitals</label>
          <textarea class="form-textarea" placeholder="BP, HR, SpO2, interventions done, mechanism..."></textarea>
        </div>
        <div class="form-group"><label class="form-label">Sending Clinician</label><input type="text" class="form-input" placeholder="Dr. Name"/></div>
        <div class="form-group"><label class="form-label">Contact Number</label><input type="tel" class="form-input" placeholder="+233-..."/></div>
      </div>
      <div class="form-actions mt-16">
        <button class="btn btn-primary" onclick="submitReferral()">Submit Referral</button>
        <button class="btn btn-ghost" onclick="closeModal()">Cancel</button>
      </div>`);
    };

    window.submitReferral = function () {
        showToast('✓ Referral created — Matching facilities...', 'success');
        setTimeout(() => showToast('3 facilities matched — Pre-alerts sent', 'info'), 1500);
        closeModal();
    };

    window.openDeclineModal = function (id) {
        openModal('Decline Referral — ' + id, `
      <div class="form-group mb-16">
        <label class="form-label">Reason for Decline <span class="required">*</span></label>
        <select class="form-select" id="decline-reason">
          <option>No ICU bed available</option>
          <option>No nursing staff coverage</option>
          <option>No specialist on call</option>
          <option>Equipment unavailable (ventilator/CT)</option>
          <option>No oxygen supply</option>
          <option>Theatre / OR not available</option>
          <option>Other (specify below)</option>
        </select>
      </div>
      <div class="form-group mb-16">
        <label class="form-label">Additional Notes</label>
        <textarea class="form-textarea" placeholder="Provide specific detail — this is logged nationally..."></textarea>
      </div>
      <div style="background:var(--amber-dim);border:1px solid rgba(245,158,11,0.3);border-radius:var(--radius-sm);padding:12px;margin-bottom:16px;font-size:12px;color:var(--amber);">
        ⚠ Declining will trigger automatic escalation to the next facility and notify Regional Command.
      </div>
      <div class="form-actions">
        <button class="btn btn-danger" onclick="showToast('Referral declined — Auto-escalating to next facility','warning');closeModal()">Confirm Decline</button>
        <button class="btn btn-ghost" onclick="closeModal()">Cancel</button>
      </div>`);
    };

    window.openReferralDetail = function (id) {
        const r = NDATA.referrals.find(x => x.id === id);
        if (!r) return;
        openModal('Referral Detail — ' + id, `
      <div style="display:flex;flex-direction:column;gap:12px;font-size:13px;">
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">
          <div><span class="text-muted">Patient:</span> <strong>${r.patient}</strong></div>
          <div><span class="text-muted">Urgency:</span> ${urgencyBadge(r.urgency)}</div>
          <div><span class="text-muted">From:</span> ${r.from}</div>
          <div><span class="text-muted">To:</span> ${r.to}</div>
          <div><span class="text-muted">Service:</span> ${r.service}</div>
          <div><span class="text-muted">Status:</span> ${renderRefStatus(r.status)}</div>
          <div><span class="text-muted">Clinician:</span> ${r.clinician || '—'}</div>
          <div><span class="text-muted">Time:</span> ${fmtTime(r.timestamp)}</div>
        </div>
        ${r.reason ? `<div style="padding:10px;background:var(--bg-card);border-radius:var(--radius-sm);"><span class="text-muted">Clinical reason:</span> ${r.reason}</div>` : ''}
        ${r.declineReason ? `<div style="padding:10px;background:var(--red-dim);border-radius:var(--radius-sm);color:var(--red);">${r.declineReason}</div>` : ''}
      </div>`);
    };

    render();
}
