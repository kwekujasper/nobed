<?php
// ================================================================
// NECHIS — SMS Service (CSMS-first, Hubtel fallback)
// ================================================================
require_once __DIR__ . '/config.php';

class SmsService {

    /**
     * Send a single SMS via CSMS (your custom SMS API)
     */
    public static function send(string $to, string $message, int $userId = 0): bool {
        $to = self::normalisePhone($to);
        if (!$to) return false;

        if (SMS_PROVIDER === 'csms') {
            return self::sendViaCsms($to, $message, $userId);
        }
        return self::sendViaHubtel($to, $message, $userId);
    }

    // ------------------------------------------------------------------
    // CSMS — your custom SMS gateway
    // ------------------------------------------------------------------
    private static function sendViaCsms(string $to, string $message, int $userId): bool {
        $payload = json_encode([
            'to'        => $to,
            'message'   => $message,
            'sender_id' => CSMS_SENDER_ID,
            'api_key'   => CSMS_API_KEY,
        ]);

        $ch = curl_init(CSMS_API_URL);
        curl_setopt_array($ch, [
            CURLOPT_POST           => true,
            CURLOPT_POSTFIELDS     => $payload,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_TIMEOUT        => 10,
            CURLOPT_HTTPHEADER     => [
                'Content-Type: application/json',
                'Accept: application/json',
                'Authorization: Bearer ' . CSMS_API_KEY,
            ],
        ]);

        $raw    = curl_exec($ch);
        $status = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $error  = curl_error($ch);
        curl_close($ch);

        $success  = ($status >= 200 && $status < 300);
        $response = json_decode($raw, true);
        $msgId    = $response['message_id'] ?? $response['id'] ?? 'csms-' . time();

        self::logSms($to, $message, $success ? 'sent' : 'failed', $msgId, $error, $userId);
        return $success;
    }

    // ------------------------------------------------------------------
    // Hubtel fallback (kept for reference)
    // ------------------------------------------------------------------
    private static function sendViaHubtel(string $to, string $message, int $userId): bool {
        if (!defined('HUBTEL_CLIENT_ID')) return false;

        $payload = json_encode([
            'From'    => defined('HUBTEL_FROM') ? HUBTEL_FROM : 'NECHIS',
            'To'      => $to,
            'Content' => $message,
        ]);

        $ch = curl_init(defined('HUBTEL_API_URL') ? HUBTEL_API_URL : '');
        curl_setopt_array($ch, [
            CURLOPT_POST           => true,
            CURLOPT_POSTFIELDS     => $payload,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_TIMEOUT        => 10,
            CURLOPT_HTTPHEADER     => ['Content-Type: application/json'],
            CURLOPT_USERPWD        => HUBTEL_CLIENT_ID . ':' . HUBTEL_CLIENT_SECRET,
        ]);

        $raw    = curl_exec($ch);
        $status = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        $success = ($status === 201);
        $resp    = json_decode($raw, true);
        $msgId   = $resp['data']['messageId'] ?? '';
        self::logSms($to, $message, $success ? 'sent' : 'failed', $msgId, '', $userId);
        return $success;
    }

    // ------------------------------------------------------------------
    // Broadcast to a group (by role / region / facility)
    // ------------------------------------------------------------------
    public static function broadcast(array $criteria, string $message): int {
        try {
            $db = getDB();

            $where = ['1=1'];
            $params = [];

            if (!empty($criteria['role'])) {
                $where[]  = 'role = ?';
                $params[] = $criteria['role'];
            }
            if (!empty($criteria['region_id'])) {
                $where[]  = 'region_id = ?';
                $params[] = $criteria['region_id'];
            }
            if (!empty($criteria['facility_id'])) {
                $where[]  = 'facility_id = ?';
                $params[] = $criteria['facility_id'];
            }

            $stmt  = $db->prepare('SELECT id, phone FROM users WHERE ' . implode(' AND ', $where) . ' AND phone IS NOT NULL AND status = "active"');
            $stmt->execute($params);
            $users = $stmt->fetchAll();

            $sent = 0;
            foreach ($users as $u) {
                if (self::send($u['phone'], $message, (int)$u['id'])) $sent++;
            }
            return $sent;
        } catch (\Exception $e) {
            return 0;
        }
    }

    // ------------------------------------------------------------------
    // Pre-built message templates
    // ------------------------------------------------------------------
    public static function buildMessage(string $event, array $data = []): string {
        return match($event) {
            'new_referral'    => "NECHIS ALERT: New " . ($data['urgency'] ?? 'urgent') . " referral #{$data['id']} from {$data['from']} to {$data['to']} — {$data['service']}. Please review immediately.",
            'referral_accept' => "NECHIS: Your referral #{$data['id']} has been ACCEPTED by {$data['facility']}. Patient can proceed.",
            'referral_decline'=> "NECHIS: Referral #{$data['id']} was DECLINED by {$data['facility']}. Reason: {$data['reason']}. Please seek alternative.",
            'referral_escalate'=> "NECHIS ESCALATION: Referral #{$data['id']} escalated to Level {$data['level']}. Immediate attention required — {$data['patient']}.",
            'surge_activate'  => "NECHIS SURGE ALERT: {$data['type']} activated in {$data['region']}. Level: {$data['level']}. All available units report.",
            'critical_vitals' => "NECHIS VITALS: Critical vitals for {$data['patient']} at {$data['facility']} — {$data['reading']}. Immediate clinical review needed.",
            'equipment_fault' => "NECHIS NHIMMS: Equipment fault reported — {$data['equipment']} at {$data['facility']}. Severity: {$data['severity']}.",
            'ambulance_dispatch'=> "NECHIS EMT: Ambulance {$data['unit']} dispatched to {$data['location']}. ETA: {$data['eta']} min. Case: {$data['case']}.",
            'nhis_verify_fail'=> "NECHIS: NHIS verification failed for ID {$data['nhis_id']}. Please check membership status.",
            'medication_due'  => "NECHIS NURSING: Medication due — {$data['drug']} {$data['dose']} for {$data['patient']} at {$data['time']}.",
            default           => "NECHIS: {$event}",
        };
    }

    // ------------------------------------------------------------------
    // Log to sms_log table
    // ------------------------------------------------------------------
    private static function logSms(string $to, string $message, string $status, string $msgId, string $error, int $userId): void {
        try {
            $db = getDB();
            $db->prepare(
                'INSERT INTO sms_log (recipient, message, status, provider_message_id, error_message, sent_by_user_id, provider)
                 VALUES (?, ?, ?, ?, ?, ?, ?)'
            )->execute([$to, $message, $status, $msgId, $error, $userId ?: null, SMS_PROVIDER]);
        } catch (\Exception $e) { /* silent */ }
    }

    // ------------------------------------------------------------------
    // Normalise Ghanaian phone number → +233XXXXXXXXX
    // ------------------------------------------------------------------
    public static function normalisePhone(string $raw): string {
        $n = preg_replace('/\D/', '', $raw);
        if (strlen($n) === 9) return '+233' . $n;
        if (strlen($n) === 10 && $n[0] === '0') return '+233' . substr($n, 1);
        if (strlen($n) === 12 && substr($n, 0, 3) === '233') return '+' . $n;
        if (strlen($n) === 13 && substr($n, 0, 4) === '0233') return '+233' . substr($n, 4);
        return strlen($n) >= 9 ? '+' . $n : '';
    }
}
