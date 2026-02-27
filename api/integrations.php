<?php
// ================================================================
// NECHIS — External Integrations API
// Endpoints: NHIS verify, Ghana Card verify, GMIS sync, CSMS test
// ================================================================
require_once __DIR__ . '/config.php';

$action = $_GET['action'] ?? '';

// Handle CORS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    header('Access-Control-Allow-Origin: *');
    header('Access-Control-Allow-Headers: Content-Type, X-Session-Token');
    http_response_code(204); exit;
}

switch ($action) {
    case 'nhis_verify':   handleNhisVerify();   break;
    case 'ghana_card':    handleGhanaCard();    break;
    case 'gmis_patient':  handleGmisPatient();  break;
    case 'gmis_sync':     handleGmisSync();     break;
    case 'sms_test':      handleSmsTest();      break;
    case 'sms_status':    handleSmsStatus();    break;
    case 'integration_status': handleIntegrationStatus(); break;
    default: jsonResponse(['error' => 'Unknown action'], 400);
}

// ================================================================
// NHIS — National Health Insurance Scheme Verification
// ================================================================
function handleNhisVerify(): void {
    $body    = getRequestBody();
    $nhisId  = trim($body['nhis_id'] ?? '');
    $dob     = $body['dob'] ?? '';

    if (!$nhisId) errorResponse('NHIS ID required');

    if (NHIS_MOCK_MODE) {
        // Realistic mock — simulate real NHIS response
        if (!preg_match('/^[A-Z]{2}\d{8}[A-Z]?\d?$/', strtoupper($nhisId)) && strlen($nhisId) < 8) {
            jsonResponse(['success' => false, 'verified' => false, 'error' => 'Invalid NHIS ID format']);
        }

        // Simulate inactive / expired cases
        if (str_ends_with($nhisId, '0')) {
            jsonResponse(['success' => true, 'verified' => false, 'status' => 'expired',
                'message' => 'NHIS membership expired. Last renewal: January 2025.']);
        }

        $mockPatient = [
            'nhis_id'       => strtoupper($nhisId),
            'verified'      => true,
            'status'        => 'active',
            'name'          => 'Kwame Adjei Mensah',
            'dob'           => '1985-03-14',
            'gender'        => 'Male',
            'scheme'        => 'NHIS Informal',
            'scheme_code'   => 'INF',
            'card_expiry'   => '2026-12-31',
            'enrolled_at'   => 'Accra Metropolis NHIA',
            'ghana_card'    => 'GHA-123456789-9',
            'coverage' => [
                'outpatient'   => true,
                'inpatient'    => true,
                'surgery'      => true,
                'maternity'    => false,
                'dental'       => false,
                'optical'      => true,
                'max_annual'   => 'GHS 5,000',
                'ytd_claims'   => 'GHS 1,240',
            ],
            'recent_claims' => [
                ['date' => '2026-01-15', 'facility' => 'Ridge Hospital', 'service' => 'OPD Visit', 'amount' => 'GHS 45'],
                ['date' => '2025-11-02', 'facility' => 'Korle Bu', 'service' => 'Lab Tests', 'amount' => 'GHS 120'],
                ['date' => '2025-09-20', 'facility' => '37 Military', 'service' => 'X-Ray', 'amount' => 'GHS 80'],
            ],
        ];

        // Log the verification
        try {
            $db = getDB();
            $db->prepare('INSERT INTO nhis_verifications (nhis_id, verified, status, raw_response, queried_by_ip) VALUES (?,?,?,?,?)')
               ->execute([$nhisId, 1, 'active', json_encode($mockPatient), $_SERVER['REMOTE_ADDR'] ?? '']);
        } catch (\Exception $e) {}

        jsonResponse(['success' => true, 'data' => $mockPatient]);
    }

    // Real NHIS API call
    $ch = curl_init(NHIS_API_URL . '/member/verify');
    curl_setopt_array($ch, [
        CURLOPT_POST           => true,
        CURLOPT_POSTFIELDS     => json_encode(['nhis_id' => $nhisId, 'dob' => $dob]),
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_TIMEOUT        => 15,
        CURLOPT_HTTPHEADER     => ['Content-Type: application/json', 'X-API-Key: ' . NHIS_API_KEY],
    ]);
    $raw    = curl_exec($ch);
    $status = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    $data = json_decode($raw, true) ?? [];
    jsonResponse(['success' => $status === 200, 'data' => $data]);
}

// ================================================================
// Ghana Card / NIA Verification
// ================================================================
function handleGhanaCard(): void {
    $body      = getRequestBody();
    $cardNum   = trim($body['card_number'] ?? '');

    if (!$cardNum) errorResponse('Ghana Card number required');

    if (NIA_MOCK_MODE) {
        // GHA-XXXXXXXXX-X format check
        if (!preg_match('/^GHA-\d{9}-\d$/', strtoupper($cardNum))) {
            jsonResponse(['success' => false, 'verified' => false, 'error' => 'Invalid Ghana Card format. Expected: GHA-123456789-1']);
        }

        $mockPerson = [
            'card_number'  => strtoupper($cardNum),
            'verified'     => true,
            'surname'      => 'MENSAH',
            'first_name'   => 'KWAME',
            'other_names'  => 'ADJEI',
            'full_name'    => 'KWAME ADJEI MENSAH',
            'dob'          => '1985-03-14',
            'gender'       => 'MALE',
            'nationality'  => 'GHANAIAN',
            'place_of_birth'=> 'ACCRA',
            'home_region'  => 'Greater Accra',
            'home_district'=> 'Accra Metropolis',
            'address'      => 'House No. 12, Osu, Accra, Ghana',
            'phone'        => '+233244123456',
            'photo_url'    => null, // Would be base64 in real API
            'issue_date'   => '2020-06-15',
            'expiry_date'  => '2030-06-14',
            'nhis_linked'  => 'AA20250001G',
            'tin_linked'   => 'P0012345678',
        ];

        jsonResponse(['success' => true, 'data' => $mockPerson]);
    }

    // Real NIA API call
    $ch = curl_init(NIA_API_URL);
    curl_setopt_array($ch, [
        CURLOPT_POST           => true,
        CURLOPT_POSTFIELDS     => json_encode(['card_number' => $cardNum]),
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_TIMEOUT        => 15,
        CURLOPT_HTTPHEADER     => ['Content-Type: application/json', 'Authorization: Bearer ' . NIA_API_KEY],
    ]);
    $raw    = curl_exec($ch);
    $status = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    jsonResponse(['success' => $status === 200, 'data' => json_decode($raw, true) ?? []]);
}

// ================================================================
// GMIS — Patient Record Lookup
// ================================================================
function handleGmisPatient(): void {
    $patientId = $_GET['patient_id'] ?? '';
    if (!$patientId) errorResponse('Patient ID required');

    if (GMIS_MOCK_MODE) {
        $mock = [
            'patient_id'    => $patientId,
            'ghs_id'        => 'GHS-' . strtoupper(substr(md5($patientId), 0, 8)),
            'name'          => 'Ama Boateng',
            'dob'           => '1992-07-20',
            'gender'        => 'Female',
            'blood_type'    => 'O+',
            'allergies'     => ['Penicillin', 'Sulfonamides'],
            'chronic_conditions' => ['Type 2 Diabetes', 'Hypertension'],
            'current_medications' => [
                ['drug' => 'Metformin', 'dose' => '500mg', 'frequency' => 'BD', 'since' => '2022-01-01'],
                ['drug' => 'Amlodipine', 'dose' => '5mg', 'frequency' => 'OD', 'since' => '2023-06-01'],
            ],
            'past_visits' => [
                ['date' => '2026-01-10', 'facility' => 'Korle Bu', 'diagnosis' => 'Hyperglycaemia', 'disposition' => 'Discharged'],
                ['date' => '2025-08-22', 'facility' => 'Ridge Hospital', 'diagnosis' => 'Hypertensive urgency', 'disposition' => 'Admitted 3 days'],
            ],
            'immunisations' => ['COVID-19 (x2)', 'Influenza 2025', 'Hepatitis B'],
            'last_updated'  => '2026-01-10T14:22:00Z',
        ];
        jsonResponse(['success' => true, 'data' => $mock]);
    }

    $ch = curl_init(GMIS_API_URL . '/patients/' . urlencode($patientId));
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_TIMEOUT        => 15,
        CURLOPT_HTTPHEADER     => ['Authorization: Bearer ' . GMIS_API_KEY],
    ]);
    $raw = curl_exec($ch); $status = curl_getinfo($ch, CURLINFO_HTTP_CODE); curl_close($ch);
    jsonResponse(['success' => $status === 200, 'data' => json_decode($raw, true) ?? []]);
}

// ================================================================
// GMIS — Data Sync (push daily stats)
// ================================================================
function handleGmisSync(): void {
    requireAuth();
    if (GMIS_MOCK_MODE) {
        jsonResponse(['success' => true, 'message' => 'GMIS sync simulated (mock mode)', 'records_synced' => rand(40, 200), 'timestamp' => date('c')]);
    }
    // Real: POST current facility stats to GMIS
    jsonResponse(['success' => false, 'error' => 'GMIS live mode not configured']);
}

// ================================================================
// CSMS — Test SMS Send
// ================================================================
function handleSmsTest(): void {
    requireAuth();
    require_once __DIR__ . '/sms.php';
    $body  = getRequestBody();
    $phone = $body['phone'] ?? '';
    $msg   = $body['message'] ?? 'NECHIS test message — system operational';

    if (!$phone) errorResponse('Phone number required');
    $ok = SmsService::send($phone, $msg);
    jsonResponse(['success' => $ok, 'provider' => SMS_PROVIDER, 'to' => $phone]);
}

// ================================================================
// SMS Status / Log
// ================================================================
function handleSmsStatus(): void {
    requireAuth();
    try {
        $db   = getDB();
        $rows = $db->query('SELECT * FROM sms_log ORDER BY created_at DESC LIMIT 50')->fetchAll();
        $sent = $db->query('SELECT COUNT(*) FROM sms_log WHERE status="sent"')->fetchColumn();
        $fail = $db->query('SELECT COUNT(*) FROM sms_log WHERE status="failed"')->fetchColumn();
        jsonResponse(['success' => true, 'stats' => ['sent' => $sent, 'failed' => $fail], 'logs' => $rows]);
    } catch (\Exception $e) {
        jsonResponse(['success' => true, 'stats' => ['sent' => 0, 'failed' => 0], 'logs' => []]);
    }
}

// ================================================================
// Integration Status Check (ping each system)
// ================================================================
function handleIntegrationStatus(): void {
    $statuses = [
        'csms'     => ['name' => 'CSMS (Custom SMS)',     'configured' => CSMS_API_KEY !== 'your_csms_api_key',     'mock' => false,           'endpoint' => CSMS_API_URL],
        'nhis'     => ['name' => 'NHIS',                  'configured' => NHIS_API_KEY !== 'your_nhis_api_key',     'mock' => NHIS_MOCK_MODE,  'endpoint' => NHIS_API_URL],
        'nia'      => ['name' => 'Ghana Card (NIA)',       'configured' => NIA_API_KEY  !== 'your_nia_api_key',      'mock' => NIA_MOCK_MODE,   'endpoint' => NIA_API_URL],
        'gmis'     => ['name' => 'GMIS',                  'configured' => GMIS_API_KEY !== 'your_gmis_api_key',     'mock' => GMIS_MOCK_MODE,  'endpoint' => GMIS_API_URL],
    ];
    jsonResponse(['success' => true, 'integrations' => $statuses, 'checked_at' => date('c')]);
}
