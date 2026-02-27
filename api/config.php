<?php
// ================================================================
// NECHIS — Database Configuration
// ================================================================
// Edit these values to match your Laragon MySQL setup
// ================================================================

define('DB_HOST', 'localhost');
define('DB_PORT', 3306);
define('DB_NAME', 'nobed');
define('DB_USER', 'root');
define('DB_PASS', 'root');
define('DB_CHARSET', 'utf8mb4');

// ---- CSMS (Custom SMS System) Configuration ----
// Your own CSMS — set the endpoint and API key in Laragon dashboard
define('SMS_PROVIDER',    'csms');                          // 'csms' or 'hubtel'
define('CSMS_API_URL',    'https://sms.yourdomain.com/api/send'); // YOUR CSMS endpoint
define('CSMS_API_KEY',    'your_csms_api_key');             // YOUR CSMS API key
define('CSMS_SENDER_ID',  'NECHIS');                        // Sender name

// ---- NHIS Integration (National Health Insurance Scheme) ----
define('NHIS_API_URL',    'https://api.nhis.gov.gh/v1');    // NHIS API base URL
define('NHIS_API_KEY',    'your_nhis_api_key');             // NHIS API key
define('NHIS_MOCK_MODE',  true);                            // true = use mock data

// ---- Ghana Card / NIA Integration ----
define('NIA_API_URL',     'https://api.nia.gov.gh/verify'); // NIA verification endpoint
define('NIA_API_KEY',     'your_nia_api_key');              // NIA API key
define('NIA_MOCK_MODE',   true);                            // true = use mock data

// ---- GMIS Integration (GHS Management Information System) ----
define('GMIS_API_URL',    'https://gmis.ghs.gov.gh/api');   // GMIS base URL
define('GMIS_API_KEY',    'your_gmis_api_key');             // GMIS API key
define('GMIS_MOCK_MODE',  true);                            // true = use mock data

// ---- App Configuration ----
define('APP_URL',     'http://localhost/nobed');
define('SESSION_TTL', 15 * 60);   // 15 minutes
define('CORS_ORIGIN', 'http://localhost');

// ================================================================
// Database Connection (PDO)
// ================================================================
function getDB(): PDO {
    static $pdo = null;
    if ($pdo) return $pdo;

    $dsn = sprintf('mysql:host=%s;port=%d;dbname=%s;charset=%s',
        DB_HOST, DB_PORT, DB_NAME, DB_CHARSET);

    $pdo = new PDO($dsn, DB_USER, DB_PASS, [
        PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES   => false,
    ]);
    return $pdo;
}

// ================================================================
// Helpers
// ================================================================
function jsonResponse(array $data, int $status = 200): void {
    http_response_code($status);
    header('Content-Type: application/json');
    header('Access-Control-Allow-Origin: ' . CORS_ORIGIN);
    header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Session-Token');
    header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
    exit;
}

function errorResponse(string $message, int $status = 400): void {
    jsonResponse(['success' => false, 'error' => $message], $status);
}

function getRequestBody(): array {
    $body = file_get_contents('php://input');
    return json_decode($body, true) ?? [];
}

function getAuthUser(): ?array {
    $token = $_SERVER['HTTP_X_SESSION_TOKEN'] ?? $_COOKIE['nechis_token'] ?? null;
    if (!$token) return null;

    $db  = getDB();
    $stmt = $db->prepare('SELECT s.*, u.name, u.role, u.facility_id, u.region_id, u.unit
                          FROM sessions s JOIN users u ON s.user_id = u.id
                          WHERE s.id = ? AND s.expires_at > NOW()');
    $stmt->execute([$token]);
    return $stmt->fetch() ?: null;
}

function requireAuth(): array {
    $user = getAuthUser();
    if (!$user) errorResponse('Unauthorized', 401);
    return $user;
}

function logAudit(int $userId, string $userName, string $role, string $action,
                  string $entityType = '', string $entityId = '', string $details = ''): void {
    try {
        $db = getDB();
        $db->prepare('INSERT INTO audit_log (user_id, user_name, role, action, entity_type, entity_id, details, ip_address)
                      VALUES (?, ?, ?, ?, ?, ?, ?, ?)')
           ->execute([$userId, $userName, $role, $action, $entityType, $entityId, $details,
                      $_SERVER['REMOTE_ADDR'] ?? '']);
    } catch (\Exception $e) { /* silently fail audit logs */ }
}

// ================================================================
// Handle CORS preflight
// ================================================================
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    header('Access-Control-Allow-Origin: ' . CORS_ORIGIN);
    header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Session-Token');
    header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
    http_response_code(204);
    exit;
}
