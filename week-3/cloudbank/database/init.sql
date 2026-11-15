-- ==============================================================================
-- CloudBank — Core Database Schema (PostgreSQL)
-- IT457 Cloud Computing | Week 3 Project | Group 41
-- Author: Kavish Patel (202301074) - Backend & Database
-- ==============================================================================
-- IMPORTANT CONSTRAINTS:
-- 1. All monetary values are strictly stored as integer paise (1 INR = 100 paise)
--    using BIGINT to eliminate floating-point rounding errors.
-- 2. Non-negative account balance constraint enforced at the database level.
-- 3. Strictly fictional demo data — no real personal or financial identities.
-- ==============================================================================

-- Enable UUID extension if not already present
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Drop existing tables in reverse dependency order for clean re-initialization
DROP TABLE IF EXISTS transactions CASCADE;
DROP TABLE IF EXISTS accounts CASCADE;

-- ------------------------------------------------------------------------------
-- Table: accounts
-- ------------------------------------------------------------------------------
CREATE TABLE accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    balance_paise BIGINT NOT NULL CHECK (balance_paise >= 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ------------------------------------------------------------------------------
-- Table: transactions
-- ------------------------------------------------------------------------------
-- account_id: Debited account for withdrawals/transfers; credited account for deposits.
-- destination_account_id: Credited account only for transfers (NULL for deposits/withdrawals).
CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type VARCHAR(12) NOT NULL CHECK (type IN ('DEPOSIT', 'WITHDRAWAL', 'TRANSFER')),
    status VARCHAR(12) NOT NULL DEFAULT 'COMPLETED' CHECK (status IN ('COMPLETED', 'REJECTED')),
    account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE RESTRICT,
    destination_account_id UUID REFERENCES accounts(id) ON DELETE RESTRICT,
    amount_paise BIGINT NOT NULL CHECK (amount_paise > 0),
    is_suspicious BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    -- Enforce that transfer must specify a destination account different from the source account
    CONSTRAINT check_transfer_destination CHECK (
        (type = 'TRANSFER' AND destination_account_id IS NOT NULL AND account_id <> destination_account_id)
        OR
        (type IN ('DEPOSIT', 'WITHDRAWAL') AND destination_account_id IS NULL)
    )
);

-- ------------------------------------------------------------------------------
-- Performance Indexes (Newest-first transaction lookup per account)
-- ------------------------------------------------------------------------------
CREATE INDEX idx_transactions_account_id_created_at 
    ON transactions(account_id, created_at DESC);

CREATE INDEX idx_transactions_destination_account_id_created_at 
    ON transactions(destination_account_id, created_at DESC);

