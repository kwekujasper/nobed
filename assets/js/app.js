// ================================================================
// NECHIS — App Router & Core Utilities
// ================================================================

const PAGES = {
    dashboard: { title: 'National Dashboard', sub: 'Real-time National Overview', render: (c) => renderDashboard(c) },
    beds: { title: 'Bed & Capacity Command', sub: 'Live Bed Status Across All Facilities', render: (c) => renderBeds(c) },
    referral: { title: 'Referral Coordination', sub: 'Manage & Track All Referrals', render: (c) => renderReferral(c) },
    emt: { title: 'EMT & Ambulance Ops', sub: 'Dispatch, Tracking & Field Cases', render: (c) => renderEMT(c) },
    vitals: { title: 'Vitals Monitor', sub: 'Live Patient Vitals — ICU/HDU', render: (c) => renderVitals(c) },
    telemedicine: { title: 'Telemedicine', sub: 'Remote Consultations & Specialist Link', render: (c) => renderTelemedicine(c) },
    hecu: { title: 'HECU Dashboard', sub: 'Hospital Emergency Command Unit', render: (c) => renderHECU(c) },
    equipment: { title: 'Equipment & NHIMMS', sub: 'Asset Registry, Maintenance & Faults', render: (c) => renderEquipment(c) },
    surge: { title: 'Surge & Disaster', sub: 'Mass Casualty & Surge Command', render: (c) => renderSurge(c) },
    analytics: { title: 'Analytics & Quality', sub: 'Performance Metrics & Intelligence', render: (c) => renderAnalytics(c) },
    governance: { title: 'Clinical Governance', sub: 'Registries, Compliance & Audit', render: (c) => renderGovernance(c) },
    nursing: { title: 'Nursing Command Centre', sub: 'MAR, Care Plans, Handover & Fluid Balance', render: (c) => renderNursing(c) },
    integrations: { title: 'Integration Hub', sub: 'NHIS, Ghana Card, GMIS & CSMS', render: (c) => renderIntegrations(c) },
    public: { title: 'Public Interface', sub: 'Citizen Emergency Access', render: (c) => renderPublic(c) },
    settings: { title: 'Settings & Admin', sub: 'Roles, Users, CSMS & Configuration', render: (c) => renderSettings(c) },
};


let currentPage = null;
let surgeActive = false;
let slaTimers = [];

function initApp() {
    // Auth gate
    if (!Auth.isLoggedIn()) {
        renderLogin();
        return;
    }

    // Init Chart.js defaults
    if (window.Chart) {
        Chart.defaults.color = '#94a3b8';
        Chart.defaults.borderColor = 'rgba(255,255,255,0.06)';
        Chart.defaults.font.family = 'Inter';
        Chart.defaults.plugins.legend.labels.boxWidth = 12;
        Chart.defaults.plugins.legend.labels.padding = 16;
    }

    applyUserContext();
    applyRoleNav();
    setupGlobalSearch();
    startIdleTimer();

    // Setup router
    window.removeEventListener('hashchange', route);
    window.addEventListener('hashchange', route);

    // Nav clicks
    document.querySelectorAll('.nav-item[data-page]').forEach(el => {
        el.addEventListener('click', e => {
            e.preventDefault();
            window.location.hash = el.dataset.page;
        });
    });

    // Navigate to role default page
    const user = Auth.getUser();
    const rc = NDATA.roleConfig[user.role];
    const defaultPage = rc ? rc.defaultPage : 'dashboard';
    const currentHash = window.location.hash.replace('#', '');
    if (!currentHash || !NDATA.roleNav[user.role].includes(currentHash)) {
        window.location.hash = defaultPage;
    } else {
        route();
    }
}

function applyUserContext() {
    const user = Auth.getUser();
    if (!user) return;
    const rc = NDATA.roleConfig[user.role];

    // Update sidebar user card
    const initEl = document.getElementById('user-initials');
    const nameEl = document.getElementById('user-name');
    const roleEl = document.getElementById('user-role');
    if (initEl) { initEl.textContent = user.initials; initEl.style.background = rc.color + '33'; initEl.style.color = rc.color; }
    if (nameEl) nameEl.textContent = user.name;
    if (roleEl) roleEl.textContent = rc.label + ' · ' + Auth.getScopeLabel();

    // Update topbar user badge
    const topUser = document.getElementById('topbar-user');
    if (topUser) {
        topUser.innerHTML = `
            <div style="display:flex;align-items:center;gap:8px;cursor:pointer;" onclick="showUserMenu()">
              <div style="width:30px;height:30px;border-radius:50%;background:${rc.color}22;border:1.5px solid ${rc.color};color:${rc.color};display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;">${user.initials}</div>
              <div style="font-size:12px;">
                <div style="font-weight:600;color:var(--text-primary);">${user.name.split(' ').slice(-1)[0]}</div>
                <div style="font-size:10px;color:${rc.color};">${rc.label}</div>
              </div>
            </div>`;
    }
}

function showUserMenu() {
    const user = Auth.getUser();
    if (!user) return;
    const rc = NDATA.roleConfig[user.role];
    showModal('User Profile', `
        <div style="text-align:center;margin-bottom:20px;">
          <div style="width:64px;height:64px;border-radius:50%;background:${rc.color}22;border:2px solid ${rc.color};color:${rc.color};display:flex;align-items:center;justify-content:center;font-size:22px;font-weight:700;margin:0 auto 12px;">${user.initials}</div>
          <div style="font-size:18px;font-weight:700;">${user.name}</div>
          <div style="color:${rc.color};font-size:13px;margin-top:4px;">${rc.label}</div>
          <div style="color:var(--text-muted);font-size:12px;margin-top:2px;">${Auth.getScopeLabel()}</div>
        </div>
        <div style="background:var(--bg-surface);border-radius:var(--radius-sm);padding:14px;border:1px solid var(--border);margin-bottom:16px;">
          ${user.email ? `<div style="display:flex;justify-content:space-between;padding:6px 0;font-size:12px;"><span style="color:var(--text-muted);">Email</span><span>${user.email}</span></div>` : ''}
          ${user.phone ? `<div style="display:flex;justify-content:space-between;padding:6px 0;font-size:12px;"><span style="color:var(--text-muted);">Phone</span><span>${user.phone}</span></div>` : ''}
          <div style="display:flex;justify-content:space-between;padding:6px 0;font-size:12px;"><span style="color:var(--text-muted);">Data Scope</span><span style="color:var(--accent);">${rc.scope.charAt(0).toUpperCase() + rc.scope.slice(1)}</span></div>
          <div style="display:flex;justify-content:space-between;padding:6px 0;font-size:12px;"><span style="color:var(--text-muted);">Last Login</span><span>${user.lastLogin || 'Now'}</span></div>
        </div>
        <button class="btn btn-ghost" style="width:100%;color:var(--red);border-color:var(--red);" onclick="Auth.logout()">Sign Out</button>
    `);
}

function applyRoleNav() {
    const user = Auth.getUser();
    if (!user) return;
    const allowed = NDATA.roleNav[user.role] || [];
    document.querySelectorAll('.nav-item[data-page]').forEach(el => {
        const page = el.dataset.page;
        el.style.display = allowed.includes(page) ? '' : 'none';
    });
}

function setupGlobalSearch() {
    document.addEventListener('keydown', e => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            showSearchModal();
        }
    });
}

let _idleTimer = null;
function startIdleTimer() {
    const IDLE_MS = 15 * 60 * 1000; // 15 minutes
    const reset = () => {
        clearTimeout(_idleTimer);
        _idleTimer = setTimeout(() => {
            showToast('Session expired due to inactivity. Please log in again.', 'error');
            setTimeout(() => Auth.logout(), 2000);
        }, IDLE_MS);
    };
    ['click', 'mousemove', 'keydown', 'scroll'].forEach(e => document.addEventListener(e, reset, { passive: true }));
    reset();
}

function showSearchModal() {
    const user = Auth.getUser();
    if (!user) return;
    showModal('Global Search', `
        <div>
          <input id="gsearch-input" type="text" placeholder="Search facilities, referrals, equipment, ambulances…"
            style="width:100%;background:var(--bg-surface);border:1px solid var(--border);border-radius:var(--radius-sm);padding:10px 14px;color:var(--text-primary);font-size:14px;outline:none;"
            oninput="runGlobalSearch(this.value)" autofocus>
          <div id="gsearch-results" style="margin-top:12px;display:flex;flex-direction:column;gap:6px;max-height:280px;overflow-y:auto;"></div>
        </div>
    `);
    setTimeout(() => document.getElementById('gsearch-input')?.focus(), 100);
}

function runGlobalSearch(q) {
    const el = document.getElementById('gsearch-results');
    if (!el) return;
    if (!q || q.length < 2) { el.innerHTML = '<div style="color:var(--text-muted);font-size:13px;">Type at least 2 characters…</div>'; return; }
    const lq = q.toLowerCase();
    const results = [];

    Auth.getFacilities().filter(f => f.name.toLowerCase().includes(lq) || f.id.toLowerCase().includes(lq))
        .forEach(f => results.push({ icon: '🏥', label: f.name, sub: `${f.region} · ICU ${f.icuAvail}/${f.icuTotal} avail`, page: 'beds' }));

    Auth.getReferrals().filter(r => r.id.toLowerCase().includes(lq) || r.patient.toLowerCase().includes(lq) || r.service.toLowerCase().includes(lq))
        .forEach(r => results.push({ icon: '🔄', label: `${r.id} — ${r.patient}`, sub: `${r.service} · ${r.status}`, page: 'referral' }));

    Auth.getAmbulances().filter(a => a.id.toLowerCase().includes(lq) || a.crew.toLowerCase().includes(lq))
        .forEach(a => results.push({ icon: '🚑', label: a.id, sub: `${a.crew} · ${a.status}`, page: 'emt' }));

    Auth.getEquipment().filter(e => e.name.toLowerCase().includes(lq) || e.status.toLowerCase().includes(lq))
        .forEach(e => results.push({ icon: '⚙️', label: e.name.substring(0, 40), sub: `${e.facility} · ${e.status}`, page: 'equipment' }));

    if (!results.length) { el.innerHTML = '<div style="color:var(--text-muted);font-size:13px;">No results found.</div>'; return; }

    el.innerHTML = results.slice(0, 10).map(r => `
        <div onclick="window.location.hash='${r.page}';closeModal();" style="display:flex;align-items:center;gap:12px;padding:10px 12px;background:var(--bg-surface);border-radius:var(--radius-sm);border:1px solid var(--border);cursor:pointer;transition:border-color 0.2s;" onmouseover="this.style.borderColor='var(--accent)'" onmouseout="this.style.borderColor='var(--border)'">
          <span style="font-size:18px;">${r.icon}</span>
          <div>
            <div style="font-size:13px;font-weight:600;">${r.label}</div>
            <div style="font-size:11px;color:var(--text-muted);">${r.sub}</div>
          </div>
        </div>`).join('');
}

function route() {
    const user = Auth.getUser();
    if (!user) { renderLogin(); return; }

    const hash = window.location.hash.replace('#', '') || NDATA.roleConfig[user.role]?.defaultPage || 'dashboard';
    const allowed = NDATA.roleNav[user.role] || [];

    // If user navigates to a page they don't have access to
    if (!allowed.includes(hash) && PAGES[hash]) {
        const content = document.getElementById('page-content');
        content.innerHTML = `<div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:60vh;gap:16px;">
            <div style="font-size:48px;">🔒</div>
            <h2 style="font-size:20px;">Access Denied</h2>
            <p style="color:var(--text-muted);text-align:center;">Your role (<strong style="color:var(--accent);">${NDATA.roleConfig[user.role]?.label}</strong>) does not have permission to access this module.</p>
            <button class="btn btn-primary" onclick="window.location.hash='${NDATA.roleConfig[user.role]?.defaultPage}'">Go to My Dashboard</button>
        </div>`;
        document.getElementById('page-title').textContent = 'Access Denied';
        document.getElementById('page-sub').textContent = 'Unauthorized module';
        return;
    }

    const page = PAGES[hash] || PAGES[NDATA.roleConfig[user.role]?.defaultPage] || PAGES['dashboard'];
    const pageKey = PAGES[hash] ? hash : (NDATA.roleConfig[user.role]?.defaultPage || 'dashboard');

    document.querySelectorAll('.nav-item[data-page]').forEach(el => {
        el.classList.toggle('active', el.dataset.page === pageKey);
    });

    document.getElementById('page-title').textContent = page.title;
    document.getElementById('page-sub').textContent = page.sub;

    slaTimers.forEach(clearInterval);
    slaTimers = [];

    if (window._ncCharts) {
        window._ncCharts.forEach(c => { try { c.destroy(); } catch (e) { } });
        window._ncCharts = [];
    }

    const content = document.getElementById('page-content');
    content.innerHTML = '';
    content.className = 'page-content fade-in';
    currentPage = pageKey;
    page.render(content);
}

function startClock() {
    function tick() {
        const now = new Date();
        const fmt = d => String(d).padStart(2, '0');
        const t = `${fmt(now.getUTCHours())}:${fmt(now.getUTCMinutes())}:${fmt(now.getUTCSeconds())} UTC`;
        const ts = `${fmt(now.getUTCHours())}:${fmt(now.getUTCMinutes())}`;
        const el = document.getElementById('sys-time');
        const el2 = document.getElementById('top-time');
        if (el) el.textContent = t;
        if (el2) el2.textContent = ts;
    }
    tick();
    setInterval(tick, 1000);
    // Also animate live badges periodically
    setInterval(updateLiveData, 15000);
}

function updateLiveData() {
    // Simulate minor bed count changes
    const el = document.getElementById('badge-beds');
    if (el) {
        const v = parseInt(el.textContent) + (Math.random() > 0.5 ? 1 : -1);
        el.textContent = Math.max(80, Math.min(200, v));
    }
}

// ---- SURGE ----
function toggleSurge() {
    if (surgeActive) deactivateSurge();
    else activateSurge();
}
function activateSurge() {
    surgeActive = true;
    document.getElementById('surge-banner').classList.remove('hidden');
    document.getElementById('surge-toggle-btn').classList.add('active');
    document.getElementById('badge-surge').textContent = 'ACTIVE';
    document.getElementById('badge-surge').classList.add('pulse-red');
    document.body.style.setProperty('--bg-base', '#0f0707');
    showToast('⚠ Surge Mode Activated — All facilities on alert', 'critical');
}
function deactivateSurge() {
    surgeActive = false;
    document.getElementById('surge-banner').classList.add('hidden');
    document.getElementById('surge-toggle-btn').classList.remove('active');
    document.getElementById('badge-surge').textContent = 'READY';
    document.getElementById('badge-surge').classList.remove('pulse-red');
    document.body.style.removeProperty('--bg-base');
    showToast('Surge Mode Deactivated', 'info');
}

// ---- NOTIFICATIONS ----
function populateNotifications() {
    const list = document.getElementById('notif-list');
    NDATA.notifications.forEach(n => {
        const colors = { critical: 'var(--red)', warning: 'var(--amber)', info: 'var(--blue)' };
        list.innerHTML += `
      <div class="notif-item">
        <div class="notif-dot-type" style="background:${colors[n.type] || 'var(--accent)'}"></div>
        <div class="notif-item-body">
          <div class="notif-title">${n.title}</div>
          <div class="notif-desc">${n.desc}</div>
          <div class="notif-time">${n.time}</div>
        </div>
      </div>`;
    });
}
function toggleNotifPanel() {
    document.getElementById('notif-panel').classList.toggle('hidden');
}

// ---- SIDEBAR TOGGLE ----
function toggleSidebar() {
    const s = document.getElementById('sidebar');
    s.style.display = s.style.display === 'none' ? 'flex' : 'none';
}

// ---- MODAL ----
function openModal(title, html) {
    document.getElementById('modal-title').textContent = title;
    document.getElementById('modal-body').innerHTML = html;
    document.getElementById('modal-overlay').classList.remove('hidden');
    document.getElementById('modal-container').classList.remove('hidden');
}
function closeModal() {
    document.getElementById('modal-overlay').classList.add('hidden');
    document.getElementById('modal-container').classList.add('hidden');
}

// ---- TOAST ----
function showToast(msg, type = 'info') {
    const colors = { critical: 'var(--red)', warning: 'var(--amber)', info: 'var(--accent)', success: 'var(--green)' };
    const t = document.createElement('div');
    t.style.cssText = `position:fixed;bottom:24px;right:24px;z-index:9999;background:var(--bg-surface);border:1px solid ${colors[type]};border-radius:10px;padding:12px 18px;font-size:13px;font-weight:600;color:${colors[type]};box-shadow:0 4px 24px rgba(0,0,0,0.5);max-width:380px;animation:fadeIn 0.3s ease;`;
    t.textContent = msg;
    document.body.appendChild(t);
    setTimeout(() => t.remove(), 4000);
}

// ---- SLA TIMER ----
function startSLATimer(elementId, secondsRemain) {
    const el = document.getElementById(elementId);
    if (!el) return;
    let seconds = secondsRemain;
    function update() {
        if (!document.getElementById(elementId)) { clearInterval(id); return; }
        if (seconds <= 0) {
            el.textContent = 'BREACHED';
            el.className = 'sla-timer breach';
            clearInterval(id);
            return;
        }
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        el.textContent = `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
        el.className = `sla-timer ${seconds > 300 ? 'ok' : seconds > 120 ? 'warn' : 'breach'}`;
        seconds--;
    }
    update();
    const id = setInterval(update, 1000);
    slaTimers.push(id);
    return id;
}

// ---- CHART HELPERS ----
function initChart() {
    if (!window._ncCharts) window._ncCharts = [];
}
function registerChart(chart) {
    if (!window._ncCharts) window._ncCharts = [];
    window._ncCharts.push(chart);
    return chart;
}



function chartOpts(extra = {}) {
    return {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false }, tooltip: { backgroundColor: '#111827', borderColor: 'rgba(255,255,255,0.1)', borderWidth: 1, padding: 12, cornerRadius: 8, titleFont: { weight: '600' } } },
        scales: {
            x: { grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { color: '#64748b', font: { size: 11 } } },
            y: { grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { color: '#64748b', font: { size: 11 } } }
        },
        ...extra
    };
}

// ---- UTILITIES ----
function urgencyBadge(u) {
    const map = { critical: 'badge-critical', urgent: 'badge-urgent', routine: 'badge-routine' };
    return `<span class="badge ${map[u] || 'badge-routine'}">${u?.toUpperCase()}</span>`;
}
function statusBadge(s) {
    const map = { available: 'badge-available', occupied: 'badge-occupied', cleaning: 'badge-cleaning', reserved: 'badge-reserved', oos: 'badge-oos', functional: 'badge-functional', faulty: 'badge-faulty', maintenance: 'badge-maintenance' };
    return `<span class="badge ${map[s] || 'badge-available'}">${s}</span>`;
}
function fmtTime(iso) {
    if (!iso) return '—';
    return new Date(iso).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false });
}
function fmtDate(iso) {
    if (!iso) return '—';
    return new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}
function occColor(pct) {
    if (pct >= 90) return 'red';
    if (pct >= 70) return 'amber';
    return 'green';
}
function occPct(unit) {
    return Math.round((unit.occupied / unit.beds) * 100);
}
function el(tag, cls, html = '') {
    const d = document.createElement(tag);
    if (cls) d.className = cls;
    if (html) d.innerHTML = html;
    return d;
}

// Expose globals
window.toggleSurge = toggleSurge;
window.activateSurge = activateSurge;
window.deactivateSurge = deactivateSurge;
window.toggleNotifPanel = toggleNotifPanel;
window.openModal = openModal;
window.closeModal = closeModal;
window.showToast = showToast;
window.startSLATimer = startSLATimer;
window.registerChart = registerChart;
window.chartOpts = chartOpts;
window.urgencyBadge = urgencyBadge;
window.statusBadge = statusBadge;
window.fmtTime = fmtTime;
window.fmtDate = fmtDate;
window.occColor = occColor;
window.occPct = occPct;
window.slaTimers = slaTimers;
window.initChart = initChart;
