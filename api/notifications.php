<?php
// ================================================================
// NECHIS — Notifications API
// Endpoints: GET /api/notifications.php?action=...
// ================================================================
require_once __DIR__ . '/config.php';
require_once __DIR__ . '/sms.php';

$action = $_GET['action'] ?? 'list';

switch ($action) {
    case 'list':       handleList();    break;
    case 'unread':     handleUnread();  break;
    case 'mark_read':  handleMarkRead();break;
    case 'create':     handleCreate();  break;
    case 'sms_send':   handleSmsSend(); break;
    case 'sms_log':    handleSmsLog();  break;
    default: errorResponse('Unknown action');
}

// ----------------------------------------------------------------
// GET /api/notifications.php?action=list
// Returns all notifications visible to the authenticated user
// ----------------------------------------------------------------
function handleList(): void {
    $user  = requireAuth();
    $db    = getDB();
    $limit = min((int)($_GET['limit'] ?? 30), 100);
    $since = $_GET['since'] ?? null; // ISO datetime — for polling

    $sql    = 'SELECT * FROM notifications WHERE (
                    target_user_id = ? OR
                    target_user_id IS NULL AND (target_role IS NULL OR target_role = ?) AND
                    (target_region IS NULL OR target_region = ?) AND
                    (target_facility IS NULL OR target_facility = ?)
               )';
    $params = [$user['user_id'], $user['role'], $user['region_id'], $user['facility_id']];

    if ($since) {
        $sql    .= ' AND created_at > ?';
        $params[] = $since;
    }

    $sql .= ' ORDER BY created_at DESC LIMIT ' . $limit;

    $stmt = $db->prepare($sql);
    $stmt->execute($params);
    jsonResponse(['success' => true, 'notifications' => $stmt->fetchAll()]);
}

// ----------------------------------------------------------------
// GET /api/notifications.php?action=unread
// Returns count of unread notifications for the badge
// ----------------------------------------------------------------
function handleUnread(): void {
    $user = requireAuth();
    $db   = getDB();

    $stmt = $db->prepare('SELECT COUNT(*) AS cnt FROM notifications WHERE is_read = 0 AND (
        target_user_id = ? OR
        (target_user_id IS NULL AND (target_role IS NULL OR target_role = ?) AND
         (target_region IS NULL OR target_region = ?))
    )');
    $stmt->execute([$user['user_id'], $user['role'], $user['region_id']]);
    jsonResponse(['success' => true, 'unread' => $stmt->fetchColumn()]);
}

// ----------------------------------------------------------------
// POST /api/notifications.php?action=mark_read
// ----------------------------------------------------------------
function handleMarkRead(): void {
    $user = requireAuth();
    $db   = getDB();
    $body = getRequestBody();
    $ids  = $body['ids'] ?? [];          // array of notification IDs to mark read

    if (empty($ids)) {
        // Mark all as read for this user
        $db->prepare('UPDATE notifications SET is_read = 1, read_at = NOW()
                      WHERE (target_user_id = ? OR target_role = ?) AND is_read = 0')
           ->execute([$user['user_id'], $user['role']]);
    } else {
        $placeholders = implode(',', array_fill(0, count($ids), '?'));
        $db->prepare("UPDATE notifications SET is_read = 1, read_at = NOW() WHERE id IN ($placeholders)")
           ->execute($ids);
    }
    jsonResponse(['success' => true]);
}

// ----------------------------------------------------------------
// POST /api/notifications.php?action=create
// Creates an in-app notification and optionally sends SMS
// ----------------------------------------------------------------
function handleCreate(): void {
    $user = requireAuth();
    $db   = getDB();
    $body = getRequestBody();

    // Required fields
    $type        = $body['type']     ?? 'system';
    $title       = $body['title']    ?? '';
    $message     = $body['body']     ?? '';
    $severity    = $body['severity'] ?? 'info';
    $targetRole  = $body['target_role']     ?? null;
    $targetUser  = $body['target_user_id']  ?? null;
    $targetRegion= $body['target_region']   ?? null;
    $targetFac   = $body['target_facility'] ?? null;
    $refId       = $body['reference_id']    ?? null;
    $sendSms     = $body['send_sms']        ?? false;

    if (!$title) errorResponse('title is required');

    $stmt = $db->prepare('INSERT INTO notifications
        (type, title, body, severity, target_role, target_user_id, target_region, target_facility, reference_id)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)');
    $stmt->execute([$type, $title, $message, $severity, $targetRole, $targetUser,
                    $targetRegion, $targetFac, $refId]);
    $notifId = $db->lastInsertId();

    logAudit($user['user_id'], $user['name'], $user['role'],
             "Create Notification: $title", 'notification', $notifId);

    $smsResult = null;
    if ($sendSms && $message) {
        $smsResult = SmsService::broadcast($title . ': ' . $message, $targetRole, $targetRegion, $notifId);
    }

    jsonResponse(['success' => true, 'id' => $notifId, 'sms' => $smsResult]);
}

// ----------------------------------------------------------------
// POST /api/notifications.php?action=sms_send
// Manual SMS send to a specific number
// ----------------------------------------------------------------
function handleSmsSend(): void {
    $user = requireAuth();
    $body = getRequestBody();
    $phone   = $body['phone']   ?? '';
    $message = $body['message'] ?? '';

    if (!$phone || !$message) errorResponse('phone and message required');

    $result = SmsService::send($phone, $message);
    logAudit($user['user_id'], $user['name'], $user['role'],
             "Send SMS to $phone", 'sms', $phone, $message);
    jsonResponse($result);
}

// ----------------------------------------------------------------
// GET /api/notifications.php?action=sms_log
// Returns SMS send history
// ----------------------------------------------------------------
function handleSmsLog(): void {
    requireAuth();
    $db   = getDB();
    $stmt = $db->query('SELECT * FROM sms_log ORDER BY sent_at DESC LIMIT 100');
    jsonResponse(['success' => true, 'log' => $stmt->fetchAll()]);
}
