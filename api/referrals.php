<?php
// ================================================================
// NECHIS — Referrals API
// ================================================================
require_once __DIR__ . '/config.php';
require_once __DIR__ . '/sms.php';

$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? 'list';

switch ($action) {
    case 'list':    handleList();    break;
    case 'get':     handleGet();     break;
    case 'create':  handleCreate();  break;
    case 'accept':  handleAccept();  break;
    case 'decline': handleDecline(); break;
    case 'escalate':handleEscalate();break;
    default: errorResponse('Unknown action');
}

function handleList(): void {
    $user = requireAuth();
    $db   = getDB();

    $sql    = 'SELECT r.*, f1.name as from_name, f2.name as to_name FROM referrals r
               LEFT JOIN facilities f1 ON r.from_facility = f1.id
               LEFT JOIN facilities f2 ON r.to_facility = f2.id WHERE 1=1';
    $params = [];

    // Scope by role
    if ($user['role'] === 'hecu_commander' || $user['role'] === 'bed_manager' ||
        $user['role'] === 'nurse' || $user['role'] === 'clinician') {
        $sql .= ' AND (r.from_facility = ? OR r.to_facility = ?)';
        $params[] = $user['facility_id'];
        $params[] = $user['facility_id'];
    } elseif ($user['role'] === 'regional_director' || $user['role'] === 'emt_dispatcher') {
        $sql .= ' AND r.region_id = ?';
        $params[] = $user['region_id'];
    }

    if ($status = $_GET['status'] ?? null) {
        $sql    .= ' AND r.status = ?';
        $params[] = $status;
    }

    $sql .= ' ORDER BY r.created_at DESC LIMIT 50';
    $stmt = $db->prepare($sql);
    $stmt->execute($params);
    jsonResponse(['success' => true, 'referrals' => $stmt->fetchAll()]);
}

function handleGet(): void {
    $user = requireAuth();
    $db   = getDB();
    $id   = $_GET['id'] ?? '';
    if (!$id) errorResponse('id required');

    $stmt = $db->prepare('SELECT r.*, f1.name as from_name, f2.name as to_name
                          FROM referrals r
                          LEFT JOIN facilities f1 ON r.from_facility = f1.id
                          LEFT JOIN facilities f2 ON r.to_facility = f2.id
                          WHERE r.id = ?');
    $stmt->execute([$id]);
    $ref = $stmt->fetch();
    if (!$ref) errorResponse('Not found', 404);
    jsonResponse(['success' => true, 'referral' => $ref]);
}

function handleCreate(): void {
    $user = requireAuth();
    if (!in_array($user['role'], ['national_command','regional_director','hecu_commander',
                                   'emt_dispatcher','clinician']))
        errorResponse('Insufficient permissions', 403);

    $db   = getDB();
    $body = getRequestBody();
    $id   = 'REF-' . date('Y') . '-' . str_pad(rand(1, 9999), 4, '0', STR_PAD_LEFT);

    $db->prepare('INSERT INTO referrals
        (id, patient_age, patient_sex, service, urgency, from_facility, to_facility,
         from_clinician, reason, status, sla_minutes, region_id, created_by)
        VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)')
       ->execute([
           $id, $body['patient_age'] ?? null, $body['patient_sex'] ?? 'Unknown',
           $body['service'] ?? '', $body['urgency'] ?? 'urgent',
           $body['from_facility'] ?? $user['facility_id'],
           $body['to_facility'] ?? null, $body['from_clinician'] ?? $user['name'],
           $body['reason'] ?? '', 'pending',
           $body['sla_minutes'] ?? 30,
           $body['region_id'] ?? $user['region_id'],
           $user['user_id'],
       ]);

    // In-app notification
    $db->prepare('INSERT INTO notifications (type, title, body, severity, target_role, target_region, reference_id)
                  VALUES (?,?,?,?,?,?,?)')
       ->execute(['referral', "New {$body['urgency']} Referral: $id",
                  "Service: {$body['service']} — from {$user['facility_id']}",
                  $body['urgency'] === 'critical' ? 'critical' : 'warning',
                  'hecu_commander', $body['region_id'] ?? $user['region_id'], $id]);

    // SMS if critical
    if (($body['urgency'] ?? '') === 'critical' && ($body['send_sms'] ?? false)) {
        $msg = SmsService::buildMessage('referral_new', [
            'id' => $id, 'urgency' => $body['urgency'],
            'service' => $body['service'],
            'from' => $body['from_facility'] ?? 'Unknown',
            'sla' => $body['sla_minutes'] ?? 30,
        ]);
        SmsService::broadcast($msg, 'hecu_commander', $body['region_id'] ?? $user['region_id']);
    }

    logAudit($user['user_id'], $user['name'], $user['role'], 'Create Referral', 'referral', $id);
    jsonResponse(['success' => true, 'id' => $id]);
}

function handleAccept(): void {
    $user = requireAuth();
    $db   = getDB();
    $body = getRequestBody();
    $id   = $body['id'] ?? '';
    if (!$id) errorResponse('id required');

    $db->prepare("UPDATE referrals SET status='accepted', accepted_at=NOW() WHERE id=?")
       ->execute([$id]);

    // Notification
    $db->prepare('INSERT INTO notifications (type, title, body, severity, reference_id)
                  VALUES (?,?,?,?,?)')
       ->execute(['referral', "Referral $id Accepted",
                  "Accepted by {$user['name']} at " . ($user['facility_id'] ?? 'National'),
                  'info', $id]);

    // SMS to sending clinician
    $ref = $db->prepare('SELECT r.from_clinician, u.phone FROM referrals r
                         LEFT JOIN users u ON u.name = r.from_clinician WHERE r.id = ?');
    $ref->execute([$id]);
    $refData = $ref->fetch();
    if ($refData && $refData['phone']) {
        SmsService::send($refData['phone'],
            SmsService::buildMessage('referral_accepted', [
                'id' => $id, 'facility' => $user['facility_id'] ?? '', 'ambulance' => 'TBD', 'eta' => 'TBD'
            ])
        );
    }

    logAudit($user['user_id'], $user['name'], $user['role'], 'Accept Referral', 'referral', $id);
    jsonResponse(['success' => true]);
}

function handleDecline(): void {
    $user = requireAuth();
    $db   = getDB();
    $body = getRequestBody();
    $id   = $body['id'] ?? '';
    $reason = $body['reason'] ?? 'No bed available';

    $db->prepare("UPDATE referrals SET status='declined', decline_reason=? WHERE id=?")
       ->execute([$reason, $id]);

    $db->prepare('INSERT INTO notifications (type, title, body, severity, reference_id)
                  VALUES (?,?,?,?,?)')
       ->execute(['referral', "Referral $id Declined", "Reason: $reason", 'warning', $id]);

    logAudit($user['user_id'], $user['name'], $user['role'],
             "Decline Referral: $reason", 'referral', $id);
    jsonResponse(['success' => true]);
}

function handleEscalate(): void {
    $user = requireAuth();
    $db   = getDB();
    $body = getRequestBody();
    $id   = $body['id'] ?? '';

    $db->prepare("UPDATE referrals SET status='escalated', escalation_lvl = escalation_lvl + 1 WHERE id=?")
       ->execute([$id]);

    $db->prepare('INSERT INTO notifications (type, title, body, severity, target_role, reference_id)
                  VALUES (?,?,?,?,?,?)')
       ->execute(['referral', "Referral $id ESCALATED",
                  "Escalated by {$user['name']} — requires immediate regional intervention",
                  'critical', 'regional_director', $id]);

    // SMS to regional director
    $msg = SmsService::buildMessage('default', [
        'message' => "Referral $id has been escalated and requires your intervention."
    ]);
    SmsService::broadcast($msg, 'regional_director', $user['region_id']);

    logAudit($user['user_id'], $user['name'], $user['role'], 'Escalate Referral', 'referral', $id);
    jsonResponse(['success' => true]);
}
