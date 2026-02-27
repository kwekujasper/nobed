// ================================================================
// NECHIS — Extra Features
// 1. Connectivity Indicator
// 2. Notification Filter by Type
// 3. Export (CSV + Print) for Analytics & Governance
// ================================================================

/* ----------------------------------------------------------------
   1. CONNECTIVITY INDICATOR
   ---------------------------------------------------------------- */
(function initConnectivity() {
    function setStatus(online) {
        const ind = document.getElementById('conn-indicator');
        const dot = document.getElementById('conn-dot');
        const lbl = document.getElementById('conn-label');
        if (!ind) return;
        if (online) {
            ind.style.background = 'rgba(34,197,94,0.12)';
            ind.style.color = 'var(--green)';
            ind.style.borderColor = 'rgba(34,197,94,0.25)';
            dot.style.background = 'var(--green)';
            lbl.textContent = 'Online';
        } else {
            ind.style.background = 'rgba(220,38,38,0.12)';
            ind.style.color = 'var(--red)';
            ind.style.borderColor = 'rgba(220,38,38,0.30)';
            dot.style.background = 'var(--red)';
            lbl.textContent = 'Offline';
            showToast('No network connection — some features may be unavailable', 'error');
        }
    }

    // Pulse the dot while online
    function pulseDot() {
        const dot = document.getElementById('conn-dot');
        if (!dot) return;
        dot.style.transform = 'scale(1.4)';
        setTimeout(() => dot.style.transform = 'scale(1)', 400);
    }

    window.addEventListener('online', () => { setStatus(true); pulseDot(); showToast('Connection restored', 'success'); });
    window.addEventListener('offline', () => setStatus(false));

    // Also probe every 30s with a lightweight HEAD request
    setInterval(() => {
        fetch(window.location.href, { method: 'HEAD', cache: 'no-store' })
            .then(() => setStatus(true))
            .catch(() => setStatus(false));
    }, 30000);

    // Init on load
    document.addEventListener('DOMContentLoaded', () => setStatus(navigator.onLine));
})();

/* ----------------------------------------------------------------
   2. NOTIFICATION FILTER BY TYPE
   ---------------------------------------------------------------- */
let _notifActiveFilter = 'all';

function filterNotifs(type) {
    _notifActiveFilter = type;

    // Update tab active states
    document.querySelectorAll('.notif-tab').forEach(t => t.classList.remove('active'));
    const activeTab = document.getElementById('ntab-' + type);
    if (activeTab) activeTab.classList.add('active');

    // Show/hide notification items based on data-type attribute
    const items = document.querySelectorAll('#notif-list .notif-item, #notif-list [data-notif-type]');
    if (type === 'all') {
        items.forEach(el => el.style.display = '');
    } else {
        items.forEach(el => {
            const t = (el.dataset.notifType || '').toLowerCase();
            el.style.display = t === type ? '' : 'none';
        });
    }

    // Show empty state if nothing visible
    const list = document.getElementById('notif-list');
    if (list) {
        const visible = [...list.children].filter(c => c.style.display !== 'none');
        let empty = list.querySelector('.notif-empty-filter');
        if (visible.length === 0) {
            if (!empty) {
                empty = document.createElement('div');
                empty.className = 'notif-empty-filter';
                empty.style.cssText = 'text-align:center;padding:32px 16px;color:var(--text-muted);font-size:13px;';
                empty.textContent = 'No ' + type + ' alerts';
                list.appendChild(empty);
            }
        } else {
            if (empty) empty.remove();
        }
    }
}

// Expose to notifications.js refresh — tag items when they are rendered
function tagNotifItems() {
    const keywords = {
        referral: ['referral', 'ref-', 'transfer'],
        emt: ['ambulance', 'emt', 'dispatch', 'fleet', 'gnems'],
        surge: ['surge', 'mci', 'incident', 'mass casualty'],
        equipment: ['equipment', 'fault', 'nhimms', 'maintenance'],
        system: ['login', 'session', 'system', 'account'],
    };
    document.querySelectorAll('#notif-list .notif-item').forEach(el => {
        if (el.dataset.notifType) return; // already tagged
        const text = el.textContent.toLowerCase();
        let matched = 'system';
        for (const [type, words] of Object.entries(keywords)) {
            if (words.some(w => text.includes(w))) { matched = type; break; }
        }
        el.dataset.notifType = matched;
    });
    // Re-apply active filter after tagging
    filterNotifs(_notifActiveFilter);
}

function markAllNotifsRead() {
    document.querySelectorAll('#notif-list .notif-item').forEach(el => {
        el.style.opacity = '0.55';
        el.style.borderLeftColor = 'transparent';
    });
    const badge = document.getElementById('notif-dot');
    if (badge) badge.style.display = 'none';
    const count = document.getElementById('notif-count');
    if (count) count.textContent = '';
    showToast('All notifications marked as read', 'success');
}

/* ----------------------------------------------------------------
   3a. EXPORT AS CSV
   ---------------------------------------------------------------- */
function exportTableAsCSV(tableSelector, filename) {
    const table = document.querySelector(tableSelector);
    if (!table) { showToast('No data table found to export', 'error'); return; }

    const rows = [...table.querySelectorAll('tr')];
    const csv = rows.map(row =>
        [...row.querySelectorAll('th, td')]
            .map(cell => '"' + cell.textContent.trim().replace(/"/g, '""') + '"')
            .join(',')
    ).join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename || 'nechis_export.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('CSV downloaded: ' + (filename || 'nechis_export.csv'), 'success');
}

/* ----------------------------------------------------------------
   3b. PRINT CURRENT PAGE MODULE
   ---------------------------------------------------------------- */
function printCurrentPage(title) {
    // Set print title in document
    const prev = document.title;
    document.title = 'NECHIS — ' + (title || 'Report') + ' — ' + new Date().toLocaleDateString();
    window.print();
    document.title = prev;
}

/* ----------------------------------------------------------------
   3c. ANALYTICS EXPORT HELPERS
   ---------------------------------------------------------------- */
function exportAnalyticsCSV() {
    exportTableAsCSV('#page-content table', 'nechis_analytics_' + new Date().toISOString().slice(0, 10) + '.csv');
}

function printAnalytics() {
    printCurrentPage('Analytics & QI');
}

function exportGovernanceCSV() {
    // Export trauma registry (first table in governance page)
    exportTableAsCSV('#page-content table', 'nechis_governance_' + new Date().toISOString().slice(0, 10) + '.csv');
}

function printGovernance() {
    printCurrentPage('Clinical Governance');
}

// Expose all globally
window.filterNotifs = filterNotifs;
window.markAllNotifsRead = markAllNotifsRead;
window.tagNotifItems = tagNotifItems;
window.exportAnalyticsCSV = exportAnalyticsCSV;
window.printAnalytics = printAnalytics;
window.exportGovernanceCSV = exportGovernanceCSV;
window.printGovernance = printGovernance;
window.exportTableAsCSV = exportTableAsCSV;
window.printCurrentPage = printCurrentPage;
