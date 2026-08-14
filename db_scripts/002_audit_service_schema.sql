-- Audit Service schema
-- Maintains complete audit trail for transactions, fraud evaluations, rule executions,
-- decisions, and compliance records.

CREATE TABLE IF NOT EXISTS audit_transactions (
    id BIGSERIAL PRIMARY KEY,
    audit_event_id VARCHAR(100) NOT NULL UNIQUE,
    transaction_id VARCHAR(100) NOT NULL,
    user_id BIGINT,
    action VARCHAR(80) NOT NULL,
    transaction_status VARCHAR(50),
    request_payload JSONB,
    response_payload JSONB,
    ip_address VARCHAR(80),
    device_id VARCHAR(160),
    performed_by BIGINT,
    performed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS audit_fraud_evaluations (
    id BIGSERIAL PRIMARY KEY,
    evaluation_id VARCHAR(100) NOT NULL UNIQUE,
    transaction_id VARCHAR(100) NOT NULL,
    user_id BIGINT,
    final_risk_score INTEGER,
    final_risk_level VARCHAR(30),
    evaluation_status VARCHAR(50),
    decision VARCHAR(80),
    evaluated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    evaluation_payload JSONB,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS audit_rule_executions (
    id BIGSERIAL PRIMARY KEY,
    evaluation_id VARCHAR(100) NOT NULL,
    transaction_id VARCHAR(100),
    rule_id BIGINT,
    rule_code VARCHAR(100) NOT NULL,
    rule_name VARCHAR(180),
    category_name VARCHAR(120),
    rule_score INTEGER,
    triggered BOOLEAN NOT NULL DEFAULT FALSE,
    execution_result VARCHAR(80),
    execution_message TEXT,
    executed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    execution_payload JSONB,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS audit_decisions (
    id BIGSERIAL PRIMARY KEY,
    decision_id VARCHAR(100) NOT NULL UNIQUE,
    transaction_id VARCHAR(100),
    evaluation_id VARCHAR(100),
    decision VARCHAR(80) NOT NULL,
    decision_reason TEXT,
    decided_by BIGINT,
    decided_by_name VARCHAR(180),
    decided_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    decision_payload JSONB,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS audit_compliance_records (
    id BIGSERIAL PRIMARY KEY,
    compliance_record_id VARCHAR(100) NOT NULL UNIQUE,
    entity_type VARCHAR(80) NOT NULL,
    entity_id VARCHAR(100) NOT NULL,
    compliance_type VARCHAR(100) NOT NULL,
    compliance_status VARCHAR(60) NOT NULL,
    remarks TEXT,
    retained_until DATE,
    created_by BIGINT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    compliance_payload JSONB
);

CREATE INDEX IF NOT EXISTS idx_audit_transactions_transaction_id
    ON audit_transactions (transaction_id);

CREATE INDEX IF NOT EXISTS idx_audit_transactions_user_id
    ON audit_transactions (user_id);

CREATE INDEX IF NOT EXISTS idx_audit_transactions_performed_at
    ON audit_transactions (performed_at);

CREATE INDEX IF NOT EXISTS idx_audit_fraud_evaluations_transaction_id
    ON audit_fraud_evaluations (transaction_id);

CREATE INDEX IF NOT EXISTS idx_audit_fraud_evaluations_evaluated_at
    ON audit_fraud_evaluations (evaluated_at);

CREATE INDEX IF NOT EXISTS idx_audit_rule_executions_evaluation_id
    ON audit_rule_executions (evaluation_id);

CREATE INDEX IF NOT EXISTS idx_audit_rule_executions_rule_code
    ON audit_rule_executions (rule_code);

CREATE INDEX IF NOT EXISTS idx_audit_decisions_transaction_id
    ON audit_decisions (transaction_id);

CREATE INDEX IF NOT EXISTS idx_audit_compliance_records_entity
    ON audit_compliance_records (entity_type, entity_id);

CREATE OR REPLACE VIEW vw_audit_transaction_timeline AS
SELECT
    transaction_id,
    'TRANSACTION' AS audit_type,
    action AS activity,
    transaction_status AS status,
    performed_by AS actor_id,
    performed_at AS activity_at
FROM audit_transactions
UNION ALL
SELECT
    transaction_id,
    'FRAUD_EVALUATION' AS audit_type,
    decision AS activity,
    evaluation_status AS status,
    NULL AS actor_id,
    evaluated_at AS activity_at
FROM audit_fraud_evaluations
UNION ALL
SELECT
    transaction_id,
    'DECISION' AS audit_type,
    decision AS activity,
    decision_reason AS status,
    decided_by AS actor_id,
    decided_at AS activity_at
FROM audit_decisions;

