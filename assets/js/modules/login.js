// ================================================================
// NECHIS — Login Screen
// ================================================================
function renderLogin() {
  document.getElementById('app-shell').style.display = 'none';
  let loginEl = document.getElementById('login-screen');
  if (!loginEl) {
    loginEl = document.createElement('div');
    loginEl.id = 'login-screen';
    document.body.appendChild(loginEl);
  }
  loginEl.style.display = 'flex';

  // Group users by role category for display
  const roleGroups = [
    { label: 'National Command', roles: ['national_command', 'analytics_officer'] },
    { label: 'Regional & District', roles: ['regional_director', 'emt_dispatcher'] },
    { label: 'Hospital Access', roles: ['hecu_commander', 'bed_manager', 'nurse', 'clinician', 'equipment_officer'] },
    { label: 'Public', roles: ['public'] },
  ];

  loginEl.innerHTML = `
    <div class="login-bg">
      <div class="login-panel">
        <!-- Logo -->
        <div class="login-logo">
          <div class="login-logo-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="36" height="36">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="16"/>
              <line x1="8" y1="12" x2="16" y2="12"/>
            </svg>
          </div>
          <div>
            <h1 class="login-title">NECHIS</h1>
            <div class="login-subtitle">National Emergency Command &amp; Hospital Integrated System</div>
          </div>
        </div>
        <div style="font-size:11px;color:var(--text-muted);text-align:center;margin-bottom:24px;letter-spacing:0.5px;">GHANA HEALTH SERVICE — SECURE ACCESS PORTAL</div>

        <!-- User Selection -->
        <div id="login-step-select">
          <p style="font-size:13px;color:var(--text-secondary);margin-bottom:12px;font-weight:600;">Select your profile to continue</p>
          <div style="max-height:380px;overflow-y:auto;padding-right:4px;scrollbar-width:thin;">
          ${roleGroups.map(group => {
    const groupUsers = NDATA.users.filter(u => group.roles.includes(u.role) && u.status === 'active');
    if (!groupUsers.length) return '';
    return `
              <div class="login-group-label">${group.label}</div>
              <div class="login-user-grid">
                ${groupUsers.map(u => {
      const rc = NDATA.roleConfig[u.role];
      return `
                    <div class="login-user-card" onclick="selectLoginUser('${u.id}')" data-uid="${u.id}">
                      <div class="login-avatar" style="background:${rc.color}22;border:2px solid ${rc.color}44;color:${rc.color};">${u.initials}</div>
                      <div class="login-user-info">
                        <div class="login-user-name">${u.name}</div>
                        <div class="login-user-role" style="color:${rc.color};">${rc.label}</div>
                        <div class="login-user-facility">${u.unit ? u.unit + ' · ' : ''}${u.facility || (u.region ? u.region + ' Region' : 'National HQ')}</div>
                      </div>
                      <div class="login-user-arrow">›</div>
                    </div>`;
    }).join('')}
              </div>`;
  }).join('')}
          </div>
        </div>

        <!-- PIN Entry -->
        <div id="login-step-pin" style="display:none;">
          <div class="login-pin-header" id="login-pin-header"></div>
          <p style="font-size:13px;color:var(--text-muted);margin-bottom:20px;">Enter your PIN to access the system</p>
          <div class="login-pin-display" id="login-pin-display">
            <span class="pin-dot" id="pin-0"></span>
            <span class="pin-dot" id="pin-1"></span>
            <span class="pin-dot" id="pin-2"></span>
            <span class="pin-dot" id="pin-3"></span>
          </div>
          <div class="login-pin-error" id="login-pin-error"></div>
          <div class="login-pin-pad">
            ${[1, 2, 3, 4, 5, 6, 7, 8, 9, '', 0, '⌫'].map(k => `<button class="pin-key ${k === '' ? 'pin-key-empty' : ''}" onclick="pinPress('${k}')">${k}</button>`).join('')}
          </div>
          <button class="btn btn-ghost" onclick="backToSelect()" style="width:100%;margin-top:12px;font-size:12px;">← Change Profile</button>
        </div>

        <div style="margin-top:24px;text-align:center;font-size:10px;color:var(--text-muted);">
          NECHIS v2.0 · GHS Secure · Feb 2026<br>
          &copy; 2023-2026 by EG Mobile Ghana
        </div>
      </div>
    </div>`;
}

let _loginUserId = null;
let _loginPin = '';

function selectLoginUser(uid) {
  _loginUserId = uid;
  _loginPin = '';
  const user = NDATA.users.find(u => u.id === uid);
  const rc = NDATA.roleConfig[user.role];

  document.getElementById('login-step-select').style.display = 'none';
  document.getElementById('login-step-pin').style.display = 'block';

  document.getElementById('login-pin-header').innerHTML = `
        <div style="display:flex;align-items:center;gap:14px;margin-bottom:16px;">
          <div class="login-avatar" style="width:52px;height:52px;font-size:18px;background:${rc.color}22;border:2px solid ${rc.color};color:${rc.color};">${user.initials}</div>
          <div>
            <div style="font-size:16px;font-weight:700;">${user.name}</div>
            <div style="font-size:12px;color:${rc.color};">${rc.label}</div>
            <div style="font-size:11px;color:var(--text-muted);">${user.facility || (user.region ? user.region + ' Region' : 'National')}</div>
          </div>
        </div>`;
  updatePinDisplay();
}

function pinPress(key) {
  if (key === '⌫') {
    _loginPin = _loginPin.slice(0, -1);
  } else if (key !== '' && _loginPin.length < 4) {
    _loginPin += key;
  }
  updatePinDisplay();
  document.getElementById('login-pin-error').textContent = '';
  if (_loginPin.length === 4) {
    setTimeout(attemptLogin, 200);
  }
}

function updatePinDisplay() {
  for (let i = 0; i < 4; i++) {
    const dot = document.getElementById('pin-' + i);
    if (dot) dot.classList.toggle('filled', i < _loginPin.length);
  }
}

function attemptLogin() {
  const user = NDATA.users.find(u => u.id === _loginUserId);
  if (!user) return;
  if (_loginPin === user.pin) {
    Auth.login(user);
    document.getElementById('login-screen').style.display = 'none';
    document.getElementById('app-shell').style.display = '';
    initApp();
  } else {
    _loginPin = '';
    updatePinDisplay();
    const err = document.getElementById('login-pin-error');
    err.textContent = 'Incorrect PIN. Please try again.';
    err.style.animation = 'none';
    setTimeout(() => err.style.animation = '', 10);
  }
}

function backToSelect() {
  _loginPin = '';
  _loginUserId = null;
  document.getElementById('login-step-pin').style.display = 'none';
  document.getElementById('login-step-select').style.display = 'block';
}
