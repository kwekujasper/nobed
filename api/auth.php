<?php
// ================================================================
// NECHIS — Auth API (Login / Logout / Verify)
// ================================================================
require_once __DIR__ . '/config.php';

$action = $_GET['action'] ?? 'login';

switch ($action) {
    case 'login':  handleLogin();  break;
    case 'logout': handleLogout(); break;
    case 'verify': handleVerify(); break;
    default: errorResponse('Unknown action');
}

function handleLogin(): void {
    $body = getRequestBody();
    $uid  = $body['uid'] ?? '';
    $pin  = $body['pin'] ?? '';

    if (!$uid || !$pin) errorResponse('uid and pin required');

    $db   = getDB();
    $stmt = $db->prepare('SELECT * FROM users WHERE uid = ? AND status = "active"');
    $stmt->execute([$uid]);
    $user = $stmt->fetch();

    if (!$user || !password_verify($pin, $user['pin_hash'])) {
        // Log failed attempt
        $db->prepare('INSERT INTO audit_log (user_name, role, action, details, ip_address)
                      VALUES (?,?,?,?,?)')
           ->execute([$uid, 'unknown', 'Failed Login', 'Invalid PIN', $_SERVER['REMOTE_ADDR'] ?? '']);
        errorResponse('Invalid credentials', 401);
    }

    // Create session
    $token     = bin2hex(random_bytes(32));
    $expiresAt = date('Y-m-d H:i:s', time() + SESSION_TTL);
    $db->prepare('INSERT INTO sessions (id, user_id, role, ip_address, user_agent, expires_at)
                  VALUES (?,?,?,?,?,?)')
       ->execute([$token, $user['id'], $user['role'],
                  $_SERVER['REMOTE_ADDR'] ?? '', $_SERVER['HTTP_USER_AGENT'] ?? '', $expiresAt]);

    // Update last_login
    $db->prepare('UPDATE users SET last_login = NOW() WHERE id = ?')->execute([$user['id']]);

    // Audit log
    $db->prepare('INSERT INTO audit_log (user_id, user_name, role, action, ip_address)
                  VALUES (?,?,?,?,?)')
       ->execute([$user['id'], $user['name'], $user['role'], 'Login', $_SERVER['REMOTE_ADDR'] ?? '']);

    jsonResponse([
        'success'   => true,
        'token'     => $token,
        'expiresAt' => $expiresAt,
        'user' => [
            'id'         => $user['uid'],
            'name'       => $user['name'],
            'role'       => $user['role'],
            'initials'   => $user['initials'],
            'facility'   => $user['facility_id'],
            'region'     => $user['region_id'],
            'unit'       => $user['unit'],
            'email'      => $user['email'],
            'phone'      => $user['phone'],
        ],
    ]);
}

function handleLogout(): void {
    $token = $_SERVER['HTTP_X_SESSION_TOKEN'] ?? '';
    if ($token) {
        $db = getDB();
        $db->prepare('DELETE FROM sessions WHERE id = ?')->execute([$token]);
    }
    jsonResponse(['success' => true]);
}

function handleVerify(): void {
    $user = getAuthUser();
    if (!$user) errorResponse('Session expired', 401);
    jsonResponse(['success' => true, 'role' => $user['role']]);
}
