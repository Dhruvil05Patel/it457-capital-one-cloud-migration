-- ==============================================================================
-- CloudBank — Deterministic Seed Data (PostgreSQL)
-- IT457 Cloud Computing | Week 3 Project | Group 41
-- Author: Kavish Patel (202301074) - Backend & Database
-- ==============================================================================
-- Seeds exactly two clearly fictional demo accounts with integer paise balances:
-- 1. "Demo Checking" - Balance: 1,000,000 paise (₹10,000.00)
-- 2. "Demo Savings"  - Balance:   500,000 paise (₹5,000.00)
-- ==============================================================================

-- Clean existing data
TRUNCATE TABLE transactions, accounts CASCADE;

-- Insert two deterministic mock accounts
INSERT INTO accounts (id, name, balance_paise, created_at)
VALUES 
    (
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 
        'Demo Checking', 
        1000000, 
        NOW() - INTERVAL '1 day'
    ),
    (
        'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 
        'Demo Savings', 
        500000, 
        NOW() - INTERVAL '1 day'
    );

-- Insert initial opening deposit transactions for auditable history
INSERT INTO transactions (id, type, status, account_id, destination_account_id, amount_paise, is_suspicious, created_at)
VALUES 
    (
        'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33',
        'DEPOSIT',
        'COMPLETED',
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
        NULL,
        1000000,
        false,
        NOW() - INTERVAL '1 day'
    ),
    (
        'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380a44',
        'DEPOSIT',
        'COMPLETED',
        'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
        NULL,
        500000,
        false,
        NOW() - INTERVAL '1 day'
    );

