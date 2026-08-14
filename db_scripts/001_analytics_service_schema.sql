-- Analytics Service schema
-- Stores fraud-event history, KPI snapshots, user risk profiles, and rule performance data.

CREATE TABLE IF NOT EXISTS analytics_fraud_events (
    id BIGSERIAL PRIMARY KEY,
    event_id VARCHAR(100) NOT NULL UNIQUE,
    transaction_id VARCHAR(100),
    user_id BIGINT,
    event_type VARCHAR(80) NOT NULL,
    channel VARCHAR(60),
    amount NUMERIC(18, 2),
    currency VARCHAR(10) DEFAULT 'INR',
    risk_score INTEGER,
    risk_level VARCHAR(30),
    fraud_status VARCHAR(40),
    rule_code VARCHAR(100),
    rule_name VARCHAR(180),
    category_name VARCHAR(120),
    ip_address VARCHAR(80),
    device_id VARCHAR(160),
    latitude NUMERIC(10, 7),
    longitude NUMERIC(10, 7),
    event_payload JSONB,
    event_time TIMESTAMP NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS analytics_kpi_snapshots (
    id BIGSERIAL PRIMARY KEY,
    snapshot_date DATE NOT NULL,
    total_transactions BIGINT NOT NULL DEFAULT 0,
    total_fraud_alerts BIGINT NOT NULL DEFAULT 0,
    blocked_transactions BIGINT NOT NULL DEFAULT 0,
    blocked_amount NUMERIC(18, 2) NOT NULL DEFAULT 0,
    false_positive_count BIGINT NOT NULL DEFAULT 0,
    high_risk_user_count BIGINT NOT NULL DEFAULT 0,
    average_risk_score NUMERIC(8, 2),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_analytics_kpi_snapshots_date UNIQUE (snapshot_date)
);

CREATE TABLE IF NOT EXISTS analytics_user_risk_profiles (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL UNIQUE,
    user_email VARCHAR(180),
    user_name VARCHAR(180),
    current_risk_score INTEGER NOT NULL DEFAULT 0,
    risk_level VARCHAR(30) NOT NULL DEFAULT 'LOW',
    total_transactions BIGINT NOT NULL DEFAULT 0,
    suspicious_transaction_count BIGINT NOT NULL DEFAULT 0,
    confirmed_fraud_count BIGINT NOT NULL DEFAULT 0,
    last_transaction_at TIMESTAMP,
    last_fraud_event_at TIMESTAMP,
    profile_payload JSONB,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS analytics_rule_performance (
    id BIGSERIAL PRIMARY KEY,
    rule_id BIGINT,
    rule_code VARCHAR(100) NOT NULL,
    rule_name VARCHAR(180),
    category_name VARCHAR(120),
    evaluation_count BIGINT NOT NULL DEFAULT 0,
    triggered_count BIGINT NOT NULL DEFAULT 0,
    confirmed_fraud_count BIGINT NOT NULL DEFAULT 0,
    false_positive_count BIGINT NOT NULL DEFAULT 0,
    precision_rate NUMERIC(8, 4),
    report_date DATE NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_analytics_rule_performance UNIQUE (rule_code, report_date)
);

CREATE INDEX IF NOT EXISTS idx_analytics_fraud_events_user_id
    ON analytics_fraud_events (user_id);

CREATE INDEX IF NOT EXISTS idx_analytics_fraud_events_event_time
    ON analytics_fraud_events (event_time);

CREATE INDEX IF NOT EXISTS idx_analytics_fraud_events_rule_code
    ON analytics_fraud_events (rule_code);

CREATE INDEX IF NOT EXISTS idx_analytics_fraud_events_risk_level
    ON analytics_fraud_events (risk_level);

CREATE INDEX IF NOT EXISTS idx_analytics_kpi_snapshots_date
    ON analytics_kpi_snapshots (snapshot_date);

CREATE INDEX IF NOT EXISTS idx_analytics_rule_performance_report_date
    ON analytics_rule_performance (report_date);

CREATE OR REPLACE VIEW vw_analytics_daily_fraud_trends AS
SELECT
    DATE(event_time) AS trend_date,
    COUNT(*) AS total_events,
    COUNT(*) FILTER (WHERE fraud_status IN ('SUSPECTED', 'CONFIRMED', 'BLOCKED')) AS fraud_events,
    COUNT(*) FILTER (WHERE risk_level = 'HIGH') AS high_risk_events,
    COALESCE(SUM(amount), 0) AS total_amount,
    COALESCE(SUM(amount) FILTER (WHERE fraud_status IN ('CONFIRMED', 'BLOCKED')), 0) AS fraud_amount
FROM analytics_fraud_events
GROUP BY DATE(event_time);

