// ================================================================
// NECHIS — Frontend Notification Polling + In-App Notification Manager
// ================================================================

const NotifManager = (() => {
    const API_BASE = '/nobed/api/notifications.php';
    let _token = null;
    let _pollInterval = null;
    let _lastCheck = null;
    let _unreadCount = 0;

    // ---- Init ----
    function init(sessionToken) {
        _token = sessionToken;
        _lastCheck = new Date().toISOString();
        poll(); // immediate first poll
        _pollInterval = setInterval(poll, 20000); // poll every 20s
    }

    function stop() {
        if (_pollInterval) clearInterval(_pollInterval);
    }

    // ---- Polling loop ----
    async function poll() {
        if (!_token) return;
        try {
            const res = await fetch(`${API_BASE}?action=unread`, {
                headers: { 'X-Session-Token': _token }
            });
            if (!res.ok) return;
            const data = await res.json();
            if (data.success && data.unread !== _unreadCount) {
                _unreadCount = data.unread;
                updateBadge(_unreadCount);
                if (_unreadCount > 0) fetchNew();
            }
        } catch (e) { /* network error — silent */ }
    }

    async function fetchNew() {
        try {
            const res = await fetch(`${API_BASE}?action=list&since=${_lastCheck}&limit=10`, {
                headers: { 'X-Session-Token': _token }
            });
            if (!res.ok) return;
            const data = await res.json();
            _lastCheck = new Date().toISOString();

            if (data.notifications && data.notifications.length) {
                data.notifications.forEach(n => {
                    if (!n.is_read) showToastNotif(n);
                });
                refreshNotifPanel(data.notifications);
            }
        } catch (e) { }
    }

    // ---- Badge ----
    function updateBadge(count) {
        const dot = document.getElementById('notif-dot');
        const badge = document.getElementById('notif-badge-count');
        if (dot) dot.style.display = count > 0 ? '' : 'none';
        if (badge) badge.textContent = count > 0 ? count : '';
    }

    // ---- Toast popup for new notification ----
    function showToastNotif(n) {
        const color = n.severity === 'critical' ? 'var(--red)' :
            n.severity === 'warning' ? 'var(--amber)' : 'var(--accent)';
        const icon = n.type === 'referral' ? '🔄' :
            n.type === 'emt' ? '🚑' :
                n.type === 'surge' ? '⚠️' :
                    n.type === 'equipment' ? '⚙️' : '🔔';

        const toast = document.createElement('div');
        toast.style.cssText = `
            position:fixed; bottom:${24 + document.querySelectorAll('.notif-toast').length * 80}px;
            right:24px; z-index:9998; background:var(--bg-card);
            border:1px solid ${color}; border-left:4px solid ${color};
            border-radius:var(--radius-sm); padding:12px 16px;
            min-width:300px; max-width:380px; display:flex; gap:12px; align-items:flex-start;
            box-shadow:0 8px 32px rgba(0,0,0,0.4); animation: slideIn 0.3s ease;
        `;
        toast.className = 'notif-toast';
        toast.innerHTML = `
            <span style="font-size:20px;flex-shrink:0;">${icon}</span>
            <div style="flex:1;">
                <div style="font-size:13px;font-weight:700;margin-bottom:3px;">${n.title}</div>
                <div style="font-size:11px;color:var(--text-muted);">${n.body || ''}</div>
            </div>
            <button onclick="this.parentElement.remove()" style="background:none;border:none;color:var(--text-muted);cursor:pointer;font-size:14px;">✕</button>
        `;
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 7000);
    }

    // ---- Panel refresh ----
    function refreshNotifPanel(notifications) {
        const list = document.getElementById('notif-list');
        if (!list) return;
        const items = notifications.slice(0, 15).map(n => {
            const color = n.severity === 'critical' ? 'var(--red)' :
                n.severity === 'warning' ? 'var(--amber)' : 'var(--accent)';
            return `<div class="notif-item ${n.is_read ? '' : 'notif-item-unread'}" style="border-left-color:${color}">
                <div class="notif-item-title">${n.title}</div>
                <div class="notif-item-body">${n.body || ''}</div>
                <div class="notif-item-time">${formatRelTime(n.created_at)}</div>
            </div>`;
        }).join('');
        list.innerHTML = items || '<div style="padding:20px;color:var(--text-muted);font-size:13px;">No notifications</div>';
    }

    // ---- Mark all read ----
    async function markAllRead() {
        if (!_token) return;
        await fetch(`${API_BASE}?action=mark_read`, {
            method: 'POST',
            headers: { 'X-Session-Token': _token, 'Content-Type': 'application/json' },
            body: JSON.stringify({ ids: [] }),
        });
        _unreadCount = 0;
        updateBadge(0);
    }

    // ---- Create notification (from frontend actions) ----
    async function create(payload) {
        if (!_token) return;
        return fetch(`${API_BASE}?action=create`, {
            method: 'POST',
            headers: { 'X-Session-Token': _token, 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        }).then(r => r.json());
    }

    function formatRelTime(dt) {
        const diff = Math.floor((Date.now() - new Date(dt)) / 1000);
        if (diff < 60) return `${diff}s ago`;
        if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
        return `${Math.floor(diff / 3600)}h ago`;
    }

    return { init, stop, poll, markAllRead, create, updateBadge };
})();

// ================================================================
// Wire up notification panel button to mark-as-read
// ================================================================
document.addEventListener('DOMContentLoaded', () => {
    const markReadBtn = document.getElementById('notif-mark-read');
    if (markReadBtn) {
        markReadBtn.addEventListener('click', () => NotifManager.markAllRead());
    }
});
