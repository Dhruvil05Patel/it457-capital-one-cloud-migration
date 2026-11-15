import express from 'express';
import { query } from '../db/pool.js';

export const accountsRouter = express.Router();

// UUID format validation regex
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/**
 * Format database account record into the API response contract shape.
 * @param {object} row - Database row from accounts table
 */
export function formatAccount(row) {
  return {
    id: row.id,
    name: row.name,
    balancePaise: Number(row.balance_paise),
    createdAt: row.created_at instanceof Date ? row.created_at.toISOString() : row.created_at,
  };
}

/**
 * Format database transaction record into the API response contract shape.
 * @param {object} row - Database row from transactions table
 */
export function formatTransaction(row) {
  return {
    id: row.id,
    type: row.type,
    status: row.status,
    accountId: row.account_id,
    destinationAccountId: row.destination_account_id || null,
    amountPaise: Number(row.amount_paise),
    isSuspicious: Boolean(row.is_suspicious),
    createdAt: row.created_at instanceof Date ? row.created_at.toISOString() : row.created_at,
  };
}

/**
 * GET /api/accounts
 * Fetch all accounts and their current balances.
 */
accountsRouter.get('/', async (req, res, next) => {
  try {
    const result = await query(
      'SELECT id, name, balance_paise, created_at FROM accounts ORDER BY created_at ASC;'
    );
    const accounts = result.rows.map(formatAccount);
    return res.status(200).json({ data: accounts });
  } catch (err) {
    return next(err);
  }
});

/**
 * GET /api/accounts/:id
 * Fetch a single account by UUID.
 */
accountsRouter.get('/:id', async (req, res, next) => {
  const { id } = req.params;

  if (!UUID_REGEX.test(id)) {
    return res.status(400).json({ error: 'Invalid account ID format' });
  }

  try {
    const result = await query(
      'SELECT id, name, balance_paise, created_at FROM accounts WHERE id = $1;',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Account not found' });
    }

    return res.status(200).json({ data: formatAccount(result.rows[0]) });
  } catch (err) {
    return next(err);
  }
});

/**
 * GET /api/accounts/:id/transactions
 * Fetch chronological, newest-first transaction history for a specific account.
 */
accountsRouter.get('/:id/transactions', async (req, res, next) => {
  const { id } = req.params;

  if (!UUID_REGEX.test(id)) {
    return res.status(400).json({ error: 'Invalid account ID format' });
  }

  try {
    // 1. Verify the account exists
    const accountCheck = await query('SELECT id FROM accounts WHERE id = $1;', [id]);
    if (accountCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Account not found' });
    }

    // 2. Query transactions where the account is either the debited or credited party
    const result = await query(
      `SELECT id, type, status, account_id, destination_account_id, amount_paise, is_suspicious, created_at
       FROM transactions
       WHERE account_id = $1 OR destination_account_id = $1
       ORDER BY created_at DESC;`,
      [id]
    );

    const transactions = result.rows.map(formatTransaction);
    return res.status(200).json({ data: transactions });
  } catch (err) {
    return next(err);
  }
});

export default accountsRouter;

