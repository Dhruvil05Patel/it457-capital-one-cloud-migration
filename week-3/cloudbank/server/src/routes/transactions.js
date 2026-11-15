import express from 'express';
import {
  processDeposit,
  processWithdrawal,
  processTransfer,
  ServiceError,
} from '../services/transactionService.js';
import { formatAccount, formatTransaction } from './accounts.js';

export const transactionsRouter = express.Router();

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/**
 * Validates and extracts a positive safe integer amount in paise from request body.
 * Accepts either `amountPaise` or `amount` for broad client compatibility.
 * @param {object} body
 * @returns {number|null}
 */
function parseAndValidateAmountPaise(body) {
  const raw = body.amountPaise !== undefined ? body.amountPaise : body.amount;
  if (raw === undefined || raw === null || raw === '') {
    return null;
  }
  const num = Number(raw);
  if (!Number.isInteger(num) || num <= 0 || !Number.isSafeInteger(num)) {
    return null;
  }
  return num;
}

/**
 * POST /api/transactions/deposit
 * Request body: { accountId: string, amountPaise: number }
 */
transactionsRouter.post('/deposit', async (req, res, next) => {
  const { accountId } = req.body || {};

  if (!accountId || typeof accountId !== 'string' || !UUID_REGEX.test(accountId)) {
    return res.status(400).json({ error: 'A valid accountId (UUID) is required' });
  }

  const amountPaise = parseAndValidateAmountPaise(req.body);
  if (amountPaise === null) {
    return res.status(400).json({ error: 'Amount must be a positive integer in paise' });
  }

  try {
    const { transaction, account } = await processDeposit({ accountId, amountPaise });
    return res.status(201).json({
      data: {
        transaction: formatTransaction(transaction),
        account: formatAccount(account),
      },
    });
  } catch (err) {
    if (err instanceof ServiceError || err.status) {
      return res.status(err.status || 400).json({ error: err.message });
    }
    return next(err);
  }
});

/**
 * POST /api/transactions/withdraw
 * Request body: { accountId: string, amountPaise: number }
 */
transactionsRouter.post('/withdraw', async (req, res, next) => {
  const { accountId } = req.body || {};

  if (!accountId || typeof accountId !== 'string' || !UUID_REGEX.test(accountId)) {
    return res.status(400).json({ error: 'A valid accountId (UUID) is required' });
  }

  const amountPaise = parseAndValidateAmountPaise(req.body);
  if (amountPaise === null) {
    return res.status(400).json({ error: 'Amount must be a positive integer in paise' });
  }

  try {
    const { transaction, account } = await processWithdrawal({ accountId, amountPaise });
    return res.status(201).json({
      data: {
        transaction: formatTransaction(transaction),
        account: formatAccount(account),
      },
    });
  } catch (err) {
    if (err instanceof ServiceError || err.status) {
      return res.status(err.status || 400).json({ error: err.message });
    }
    return next(err);
  }
});

/**
 * POST /api/transactions/transfer
 * Request body: { fromAccountId: string, toAccountId: string, amountPaise: number }
 */
transactionsRouter.post('/transfer', async (req, res, next) => {
  const { fromAccountId, toAccountId } = req.body || {};

  if (!fromAccountId || typeof fromAccountId !== 'string' || !UUID_REGEX.test(fromAccountId)) {
    return res.status(400).json({ error: 'A valid fromAccountId (UUID) is required' });
  }

  if (!toAccountId || typeof toAccountId !== 'string' || !UUID_REGEX.test(toAccountId)) {
    return res.status(400).json({ error: 'A valid toAccountId (UUID) is required' });
  }

  if (fromAccountId === toAccountId) {
    return res.status(400).json({ error: 'Source and destination accounts must be different' });
  }

  const amountPaise = parseAndValidateAmountPaise(req.body);
  if (amountPaise === null) {
    return res.status(400).json({ error: 'Amount must be a positive integer in paise' });
  }

  try {
    const { transaction, fromAccount, toAccount } = await processTransfer({
      fromAccountId,
      toAccountId,
      amountPaise,
    });

    return res.status(201).json({
      data: {
        transaction: formatTransaction(transaction),
        fromAccount: formatAccount(fromAccount),
        toAccount: formatAccount(toAccount),
      },
    });
  } catch (err) {
    if (err instanceof ServiceError || err.status) {
      return res.status(err.status || 400).json({ error: err.message });
    }
    return next(err);
  }
});

export default transactionsRouter;

