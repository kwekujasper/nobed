-- ================================================================
-- NECHIS Ghana — MySQL Database Schema
-- National Emergency Command & Hospital Integrated System
-- ================================================================
-- Run this in phpMyAdmin or: mysql -u root < nechis.sql
-- ================================================================

CREATE DATABASE IF NOT EXISTS nechis CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE nechis;

-- ----------------------------------------------------------------
-- REGIONS & FACILITIES
-- ----------------------------------------------------------------
CREATE TABLE regions (
    id          VARCHAR(5)   PRIMARY KEY,
    name        VARCHAR(100) NOT NULL,
    zone        VARCHAR(50),
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE facilities (
    id              VARCHAR(6)   PRIMARY KEY,
    name            VARCHAR(150) NOT NULL,
    region_id       VARCHAR(5)   REFERENCES regions(id),
    type            ENUM('teaching','regional','district','private','clinic') DEFAULT 'regional',
    lat             DECIMAL(10,7),
    lng             DECIMAL(10,7),
    address         TEXT,
    phone           VARCHAR(20),
    icu_total       INT DEFAULT 0,
    icu_avail       INT DEFAULT 0,
    ed_capacity     INT DEFAULT 0,
    ed_current      INT DEFAULT 0,
    beds_total      INT DEFAULT 0,
    beds_avail      INT DEFAULT 0,
    oxygen_bar      DECIMAL(5,2),
    generator_pct   INT,
    status          ENUM('online','offline','degraded') DEFAULT 'online',
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE bed_units (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    facility_id     VARCHAR(6) REFERENCES facilities(id),
    unit_name       VARCHAR(50) NOT NULL,  -- ICU, HDU, ED, Maternity, NICU, Paeds, Ward A
    total           INT DEFAULT 0,
    available       INT DEFAULT 0,
    occupied        INT DEFAULT 0,
    cleaning        INT DEFAULT 0,
    reserved        INT DEFAULT 0,
    out_of_service  INT DEFAULT 0,
    ventilator_beds INT DEFAULT 0,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ----------------------------------------------------------------
-- USERS & ROLES
-- ----------------------------------------------------------------
CREATE TABLE users (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    uid             VARCHAR(6)   UNIQUE NOT NULL,  -- U001, U002 etc
    name            VARCHAR(100) NOT NULL,
    email           VARCHAR(150) UNIQUE,
    phone           VARCHAR(20),
    initials        VARCHAR(3),
    role            ENUM('national_command','analytics_officer','regional_director','hecu_commander',
                         'bed_manager','nurse','emt_dispatcher','clinician','equipment_officer','public') NOT NULL,
    facility_id     VARCHAR(6)   REFERENCES facilities(id),
    region_id       VARCHAR(5)   REFERENCES regions(id),
    unit            VARCHAR(50),
    pin_hash        VARCHAR(255),                   -- bcrypt hashed PIN
    status          ENUM('active','suspended','inactive') DEFAULT 'active',
    last_login      TIMESTAMP NULL,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE sessions (
    id          VARCHAR(64)  PRIMARY KEY,           -- session token
    user_id     INT          REFERENCES users(id),
    role        VARCHAR(30),
    ip_address  VARCHAR(45),
    user_agent  TEXT,
    expires_at  TIMESTAMP NOT NULL,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ----------------------------------------------------------------
-- REFERRALS
-- ----------------------------------------------------------------
CREATE TABLE referrals (
    id              VARCHAR(20)  PRIMARY KEY,        -- REF-2025-001
    patient_code    VARCHAR(20),                     -- Anonymised
    patient_age     INT,
    patient_sex     ENUM('M','F','Unknown') DEFAULT 'Unknown',
    service         VARCHAR(100) NOT NULL,           -- ICU + Ventilator
    urgency         ENUM('critical','urgent','routine') DEFAULT 'urgent',
    from_facility   VARCHAR(6)   REFERENCES facilities(id),
    to_facility     VARCHAR(6)   REFERENCES facilities(id),
    from_clinician  VARCHAR(100),
    from_phone      VARCHAR(20),
    reason          TEXT,
    status          ENUM('pending','accepted','declined','en-route','completed','escalated') DEFAULT 'pending',
    decline_reason  TEXT,
    escalation_lvl  INT DEFAULT 0,
    sla_minutes     INT DEFAULT 30,
    accepted_at     TIMESTAMP NULL,
    completed_at    TIMESTAMP NULL,
    ambulance_id    VARCHAR(10),
    region_id       VARCHAR(5),
    created_by      INT          REFERENCES users(id),
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ----------------------------------------------------------------
-- AMBULANCES & EMT
-- ----------------------------------------------------------------
CREATE TABLE ambulances (
    id              VARCHAR(12)  PRIMARY KEY,        -- AMB-GA-001
    call_sign       VARCHAR(20),
    type            ENUM('BLS','ALS','MICU','Bike') DEFAULT 'BLS',
    region_id       VARCHAR(5)   REFERENCES regions(id),
    district        VARCHAR(80),
    base_facility   VARCHAR(6)   REFERENCES facilities(id),
    crew_name       VARCHAR(100),
    crew_phone      VARCHAR(20),
    status          ENUM('available','en-route','on-scene','offline') DEFAULT 'available',
    fuel_pct        INT DEFAULT 100,
    lat             DECIMAL(10,7),
    lng             DECIMAL(10,7),
    current_case_id VARCHAR(20),
    destination_fac VARCHAR(6),
    eta_minutes     INT,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE emt_cases (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    case_ref        VARCHAR(20) UNIQUE,
    ambulance_id    VARCHAR(12) REFERENCES ambulances(id),
    referral_id     VARCHAR(20) REFERENCES referrals(id),
    incident_type   VARCHAR(100),
    triage_level    ENUM('P1','P2','P3','P4') DEFAULT 'P2',
    patient_age     INT,
    patient_sex     ENUM('M','F','Unknown') DEFAULT 'Unknown',
    vitals_json     JSON,                             -- {hr, bp, spo2, gcs}
    interventions   TEXT,
    destination_fac VARCHAR(6) REFERENCES facilities(id),
    dispatch_at     TIMESTAMP NULL,
    scene_at        TIMESTAMP NULL,
    depart_at       TIMESTAMP NULL,
    hospital_at     TIMESTAMP NULL,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ----------------------------------------------------------------
-- EQUIPMENT (NHIMMS)
-- ----------------------------------------------------------------
CREATE TABLE equipment (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    asset_tag       VARCHAR(30) UNIQUE NOT NULL,
    name            VARCHAR(150) NOT NULL,
    category        VARCHAR(80),
    facility_id     VARCHAR(6)   REFERENCES facilities(id),
    department      VARCHAR(80),
    status          ENUM('functional','faulty','maintenance','condemned','missing') DEFAULT 'functional',
    make            VARCHAR(80),
    model           VARCHAR(80),
    serial_no       VARCHAR(80),
    purchase_date   DATE,
    last_service    DATE,
    next_service    DATE,
    condition_score INT,                              -- 0-100
    notes           TEXT,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE fault_reports (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    equipment_id    INT          REFERENCES equipment(id),
    reported_by     INT          REFERENCES users(id),
    severity        ENUM('low','medium','high','critical') DEFAULT 'medium',
    description     TEXT,
    status          ENUM('open','in-progress','resolved') DEFAULT 'open',
    resolved_at     TIMESTAMP NULL,
    resolved_by     INT          REFERENCES users(id),
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ----------------------------------------------------------------
-- INCIDENTS & SURGE
-- ----------------------------------------------------------------
CREATE TABLE incidents (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    incident_ref    VARCHAR(20) UNIQUE,
    title           VARCHAR(200) NOT NULL,
    type            ENUM('RTA','MCI','disaster','disease_outbreak','surge','other') DEFAULT 'other',
    location        VARCHAR(200),
    region_id       VARCHAR(5)   REFERENCES regions(id),
    status          ENUM('active','in-progress','contained','closed') DEFAULT 'active',
    total_casualties INT DEFAULT 0,
    critical_count  INT DEFAULT 0,
    ambulances_dispatched JSON,
    surge_level     ENUM('READY','YELLOW','ORANGE','RED') DEFAULT 'READY',
    activated_by    INT          REFERENCES users(id),
    activated_at    TIMESTAMP NULL,
    closed_at       TIMESTAMP NULL,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ----------------------------------------------------------------
-- NOTIFICATIONS (in-app + SMS)
-- ----------------------------------------------------------------
CREATE TABLE notifications (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    type            ENUM('referral','emt','surge','system','equipment','bed','sms_sent') NOT NULL,
    title           VARCHAR(200) NOT NULL,
    body            TEXT,
    severity        ENUM('info','warning','critical') DEFAULT 'info',
    target_role     VARCHAR(30),                     -- null = all
    target_user_id  INT          REFERENCES users(id),  -- null = broadcast
    target_region   VARCHAR(5),
    target_facility VARCHAR(6),
    reference_id    VARCHAR(50),                     -- referral ID, incident ID etc
    is_read         BOOLEAN DEFAULT FALSE,
    read_at         TIMESTAMP NULL,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE sms_log (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    recipient_name  VARCHAR(100),
    phone_number    VARCHAR(20) NOT NULL,
    message         TEXT NOT NULL,
    notification_id INT          REFERENCES notifications(id),
    provider        VARCHAR(30) DEFAULT 'hubtel',
    message_id      VARCHAR(100),                    -- Hubtel message ID
    status          ENUM('sent','delivered','failed','pending') DEFAULT 'pending',
    cost            DECIMAL(10,4),
    response_json   JSON,
    sent_at         TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ----------------------------------------------------------------
-- VITALS & CLINICAL GOVERNANCE
-- ----------------------------------------------------------------
CREATE TABLE patient_vitals (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    patient_code    VARCHAR(20),
    facility_id     VARCHAR(6)   REFERENCES facilities(id),
    unit            VARCHAR(50),
    bed_label       VARCHAR(20),
    hr              INT,
    bp_systolic     INT,
    bp_diastolic    INT,
    spo2            INT,
    rr              INT,
    temp            DECIMAL(4,1),
    etco2           INT,
    gcs             INT,
    icp             INT,
    status          ENUM('stable','warning','critical') DEFAULT 'stable',
    recorded_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE clinical_registry (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    registry_type   ENUM('trauma','stroke','maternal','neonatal','cardiac') NOT NULL,
    patient_code    VARCHAR(20),
    facility_id     VARCHAR(6)   REFERENCES facilities(id),
    age             INT,
    sex             ENUM('M','F','Unknown'),
    admission_date  DATE,
    diagnosis       VARCHAR(200),
    outcome         ENUM('discharged','transferred','deceased','admitted','DAMA'),
    data_json       JSON,                             -- registry-specific fields
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE mm_reviews (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    case_ref        VARCHAR(20),
    facility_id     VARCHAR(6)   REFERENCES facilities(id),
    date_of_death   DATE,
    diagnosis       VARCHAR(200),
    avoidability    ENUM('avoidable','possibly_avoidable','unavoidable','unknown'),
    status          ENUM('scheduled','in-review','completed') DEFAULT 'scheduled',
    scheduled_date  DATE,
    completed_date  DATE,
    notes           TEXT,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ----------------------------------------------------------------
-- AUDIT LOG
-- ----------------------------------------------------------------
CREATE TABLE audit_log (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    user_id         INT          REFERENCES users(id),
    user_name       VARCHAR(100),
    role            VARCHAR(30),
    action          VARCHAR(100) NOT NULL,            -- 'Accept Referral', 'Dispatch Ambulance'
    entity_type     VARCHAR(50),                      -- 'referral', 'equipment'
    entity_id       VARCHAR(50),
    details         TEXT,
    ip_address      VARCHAR(45),
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ----------------------------------------------------------------
-- SEED: Regions
-- ----------------------------------------------------------------
INSERT INTO regions (id, name, zone) VALUES
('GAR', 'Greater Accra', 'Southern'),
('ASH', 'Ashanti', 'Middle'),
('WES', 'Western', 'Southern'),
('CEN', 'Central', 'Southern'),
('EAS', 'Eastern', 'Southern'),
('VOR', 'Volta', 'Southern'),
('NOR', 'Northern', 'Northern'),
('UEA', 'Upper East', 'Northern'),
('UWE', 'Upper West', 'Northern'),
('BAV', 'Bono Ahafo', 'Middle');

-- ----------------------------------------------------------------
-- SEED: Facilities
-- ----------------------------------------------------------------
INSERT INTO facilities (id, name, region_id, type, lat, lng, icu_total, icu_avail, ed_capacity, beds_total) VALUES
('KBTH', 'Korle Bu Teaching Hospital',     'GAR', 'teaching', 5.5351, -0.2278, 32, 4,  40, 1800),
('RID', 'Ridge Hospital',                  'GAR', 'regional', 5.5600, -0.2027, 16, 6,  30, 350),
('MIL', '37 Military Hospital',            'GAR', 'regional', 5.5714, -0.1869, 12, 5,  25, 280),
('LAA', 'La General Hospital',             'GAR', 'district', 5.5802, -0.1443, 4,  0,  12, 120),
('KATH', 'Komfo Anokye Teaching Hospital',  'ASH', 'teaching', 6.6930, -1.6136, 24, 8,  35, 1200),
('CCTH', 'Cape Coast Teaching Hospital',    'CEN', 'teaching', 5.1000, -1.2674, 12, 7,  20, 400),
('TTH', 'Tamale Teaching Hospital',        'NOR', 'teaching', 9.4015, -0.8414, 14, 3,  22, 450),
('HTH', 'Ho Teaching Hospital',            'VOR', 'teaching', 6.6013, 0.4713,  10, 6,  18, 300),
('WEG', 'Western Regional Hospital',       'WES', 'regional', 4.9016, -1.7743, 8,  2,  15, 200),
('TEM', 'Tema General Hospital',           'GAR', 'regional', 5.6698, -0.0166, 10, 1,  30, 320);

-- ----------------------------------------------------------------
-- USEFUL INDEXES
-- ----------------------------------------------------------------
CREATE INDEX idx_referrals_status    ON referrals(status);
CREATE INDEX idx_referrals_region    ON referrals(region_id);
CREATE INDEX idx_notifications_user  ON notifications(target_user_id, is_read);
CREATE INDEX idx_notifications_role  ON notifications(target_role);
CREATE INDEX idx_ambulances_region   ON ambulances(region_id);
CREATE INDEX idx_audit_user          ON audit_log(user_id);
CREATE INDEX idx_sms_status          ON sms_log(status);
