import { getClient } from '../db/pool.js';

// Suspicious transaction threshold: 5,000,000 paise = 50,000.00 INR
export const SUSPICIOUS_THRESHOLD_PAISE = 5000000;

/**
 * Custom error class carrying an HTTP status code for route handlers.
 */
export class ServiceError extends Error {
  constructor(message, status = 400) {
    super(message);
    this.name = 'ServiceError';
    this.status = status;
  }
}

/**
 * Determine whether a transaction exceeds the high-value flag threshold.
 * @param {number} amountPaise
 * @returns {boolean}
 */
export function isSuspiciousAmount(amountPaise) {
  return typeof amountPaise === 'number' && amountPaise >= SUSPICIOUS_THRESHOLD_PAISE;
}

/**
 * Process a deposit into an account.
 * Atomically updates the account balance and records a DEPOSIT transaction.
 *
 * @param {{ accountId: string, amountPaise: number }} param0
 * @returns {Promise<{ transaction: object, account: object }>}
 */
export async function processDeposit({ accountId, amountPaise }) {
  const client = await getClient();
  try {
    await client.query('BEGIN');

    // 1. Lock and fetch the target account
    const accRes = await client.query(
      'SELECT id, name, balance_paise, created_at FROM accounts WHERE id = $1 FOR UPDATE;',
      [accountId]
    );

    if (accRes.rows.length === 0) {
      throw new ServiceError('Account not found', 404);
    }

    // 2. Credit the account balance
    const updatedAccRes = await client.query(
      'UPDATE accounts SET balance_paise = balance_paise + $1 WHERE id = $2 RETURNING id, name, balance_paise, created_at;',
      [amountPaise, accountId]
    );

    // 3. Insert transaction record
    const suspicious = isSuspiciousAmount(amountPaise);
    const txRes = await client.query(
      `INSERT INTO transactions (type, status, account_id, destination_account_id, amount_paise, is_suspicious)
       VALUES ('DEPOSIT', 'COMPLETED', $1, NULL, $2, $3)
       RETURNING id, type, status, account_id, destination_account_id, amount_paise, is_suspicious, created_at;`,
      [accountId, amountPaise, suspicious]
    );

    await client.query('COMMIT');

    return {
      transaction: txRes.rows[0],
      account: updatedAccRes.rows[0],
    };
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

/**
 * Process a withdrawal from an account.
 * Atomically checks balance sufficiency, updates balance, and records a WITHDRAWAL transaction.
 *
 * @param {{ accountId: string, amountPaise: number }} param0
 * @returns {Promise<{ transaction: object, account: object }>}
 */
export async function processWithdrawal({ accountId, amountPaise }) {
  const client = await getClient();
  try {
    await client.query('BEGIN');

    // 1. Lock and fetch the target account
    const accRes = await client.query(
      'SELECT id, name, balance_paise, created_at FROM accounts WHERE id = $1 FOR UPDATE;',
      [accountId]
    );

    if (accRes.rows.length === 0) {
      throw new ServiceError('Account not found', 404);
    }

    const currentBalance = Number(accRes.rows[0].balance_paise);
    if (currentBalance < amountPaise) {
      throw new ServiceError('Insufficient funds', 409);
    }

    // 2. Debit the account balance
    const updatedAccRes = await client.query(
      'UPDATE accounts SET balance_paise = balance_paise - $1 WHERE id = $2 RETURNING id, name, balance_paise, created_at;',
      [amountPaise, accountId]
    );

    // 3. Insert transaction record
    const suspicious = isSuspiciousAmount(amountPaise);
    const txRes = await client.query(
      `INSERT INTO transactions (type, status, account_id, destination_account_id, amount_paise, is_suspicious)
       VALUES ('WITHDRAWAL', 'COMPLETED', $1, NULL, $2, $3)
       RETURNING id, type, status, account_id, destination_account_id, amount_paise, is_suspicious, created_at;`,
      [accountId, amountPaise, suspicious]
    );

    await client.query('COMMIT');

    return {
      transaction: txRes.rows[0],
      account: updatedAccRes.rows[0],
    };
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

/**
 * Process an atomic transfer between two distinct accounts.
 * Employs deterministic deadlock-free row locking by ordering account IDs.
 * Debits source, credits destination, and inserts one TRANSFER audit record in one transaction.
 *
 * @param {{ fromAccountId: string, toAccountId: string, amountPaise: number }} param0
 * @returns {Promise<{ transaction: object, fromAccount: object, toAccount: object }>}
 */
export async function processTransfer({ fromAccountId, toAccountId, amountPaise }) {
  if (fromAccountId === toAccountId) {
    throw new ServiceError('Source and destination accounts must be different', 400);
  }

  const client = await getClient();
  try {
    await client.query('BEGIN');

    // Deadlock-free row locking: sort UUIDs lexicographically so all concurrent transactions
    // acquire row locks in the exact same deterministic sequence.
    const lockOrder = [fromAccountId, toAccountId].sort();

    const accountsRes = await client.query(
      `SELECT id, name, balance_paise, created_at
       FROM accounts
       WHERE id IN ($1, $2)
       ORDER BY CASE WHEN id = $3 THEN 1 ELSE 2 END
       FOR UPDATE;`,
      [fromAccountId, toAccountId, lockOrder[0]]
    );

    const fromAccRow = accountsRes.rows.find((r) => r.id === fromAccountId);
    const toAccRow = accountsRes.rows.find((r) => r.id === toAccountId);

    if (!fromAccRow) {
      throw new ServiceError('Source account not found', 404);
    }
    if (!toAccRow) {
      throw new ServiceError('Destination account not found', 404);
    }

    const fromBalance = Number(fromAccRow.balance_paise);
    if (fromBalance < amountPaise) {
      throw new ServiceError('Insufficient funds', 409);
    }

    // 1. Debit the source account
    const debitRes = await client.query(
      'UPDATE accounts SET balance_paise = balance_paise - $1 WHERE id = $2 RETURNING id, name, balance_paise, created_at;',
      [amountPaise, fromAccountId]
    );

    // 2. Credit the destination account
    const creditRes = await client.query(
      'UPDATE accounts SET balance_paise = balance_paise + $1 WHERE id = $2 RETURNING id, name, balance_paise, created_at;',
      [amountPaise, toAccountId]
    );

    // 3. Insert the single atomic TRANSFER transaction record
    const suspicious = isSuspiciousAmount(amountPaise);
    const txRes = await client.query(
      `INSERT INTO transactions (type, status, account_id, destination_account_id, amount_paise, is_suspicious)
       VALUES ('TRANSFER', 'COMPLETED', $1, $2, $3, $4)
       RETURNING id, type, status, account_id, destination_account_id, amount_paise, is_suspicious, created_at;`,
      [fromAccountId, toAccountId, amountPaise, suspicious]
    );

    await client.query('COMMIT');

    return {
      transaction: txRes.rows[0],
      fromAccount: debitRes.rows[0],
      toAccount: creditRes.rows[0],
    };
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

export default {
  SUSPICIOUS_THRESHOLD_PAISE,
  isSuspiciousAmount,
  processDeposit,
  processWithdrawal,
  processTransfer,
};

