import { apiRequest } from './client.js';

/**
 * Normalizes transaction data across potential camelCase / snake_case differences.
 */
function normalizeTransaction(tx) {
  const amountPaise = Number(tx.amountPaise ?? tx.amount_paise ?? tx.amount ?? 0);
  const isSuspicious = Boolean(
    tx.isSuspicious ?? tx.is_suspicious ?? (amountPaise >= 5000000)
  );

  return {
    id: tx.id,
    type: (tx.type || '').toUpperCase(),
    status: tx.status || 'COMPLETED',
    accountId: tx.accountId ?? tx.account_id ?? tx.fromAccountId ?? tx.from_account_id,
    destinationAccountId:
      tx.destinationAccountId ??
      tx.destination_account_id ??
      tx.toAccountId ??
      tx.to_account_id ??
      null,
    amountPaise,
    isSuspicious,
    createdAt: tx.createdAt ?? tx.created_at ?? new Date().toISOString(),
  };
}

/**
 * Get service health status.
 * @param {AbortSignal} [signal]
 */
export async function getHealth(signal) {
  return apiRequest('/health', { signal });
}

/**
 * Fetch all mock accounts.
 * @param {AbortSignal} [signal]
 * @returns {Promise<Array<{ id: string, name: string, balancePaise: number, createdAt: string|null }>>}
 */
export async function getAccounts(signal) {
  const accounts = await apiRequest('/accounts', { signal });
  if (!Array.isArray(accounts)) {
    return [];
  }
  return accounts.map((acc) => ({
    id: acc.id,
    name: acc.name,
    balancePaise: Number(acc.balancePaise ?? acc.balance_paise ?? 0),
    createdAt: acc.createdAt ?? acc.created_at ?? null,
  }));
}

/**
 * Fetch transaction history for a specific account.
 * @param {string} accountId
 * @param {AbortSignal} [signal]
 */
export async function getAccountTransactions(accountId, signal) {
  const transactions = await apiRequest(`/accounts/${accountId}/transactions`, { signal });
  if (!Array.isArray(transactions)) {
    return [];
  }
  return transactions.map(normalizeTransaction);
}

/**
 * Perform a deposit.
 * @param {{ accountId: string, amountPaise: number }} payload
 */
export async function deposit({ accountId, amountPaise }) {
  return apiRequest('/transactions/deposit', {
    method: 'POST',
    body: JSON.stringify({
      accountId,
      amountPaise,
      amount: amountPaise,
    }),
  });
}

/**
 * Perform a withdrawal.
 * @param {{ accountId: string, amountPaise: number }} payload
 */
export async function withdraw({ accountId, amountPaise }) {
  return apiRequest('/transactions/withdraw', {
    method: 'POST',
    body: JSON.stringify({
      accountId,
      amountPaise,
      amount: amountPaise,
    }),
  });
}

/**
 * Perform a transfer between two accounts.
 * @param {{ fromAccountId: string, toAccountId: string, amountPaise: number }} payload
 */
export async function transfer({ fromAccountId, toAccountId, amountPaise }) {
  return apiRequest('/transactions/transfer', {
    method: 'POST',
    body: JSON.stringify({
      fromAccountId,
      toAccountId,
      amountPaise,
      amount: amountPaise,
    }),
  });
}

