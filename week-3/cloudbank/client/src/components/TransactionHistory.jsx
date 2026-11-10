import React from 'react';
import { formatInr } from '../lib/money.js';
import LoadingSpinner from './LoadingSpinner.jsx';
import './TransactionHistory.css';

/**
 * Formats ISO UTC timestamp into a user-friendly local date and time string.
 */
function formatTimestamp(isoString) {
  if (!isoString) return '—';
  try {
    const d = new Date(isoString);
    if (Number.isNaN(d.getTime())) return isoString;
    return new Intl.DateTimeFormat('en-IN', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(d);
  } catch {
    return isoString;
  }
}

export default function TransactionHistory({
  transactions = [],
  accounts = [],
  selectedAccountId,
  onAccountFilterChange,
  isLoading = false,
}) {
  const accountNameMap = React.useMemo(() => {
    const map = new Map();
    accounts.forEach((acc) => map.set(acc.id, acc.name));
    return map;
  }, [accounts]);

  const getAccountLabel = (id) => {
    if (!id) return '—';
    const name = accountNameMap.get(id);
    return name ? `${name} (${id.slice(0, 8)}…)` : `${id.slice(0, 8)}…`;
  };

  return (
    <section className="history-section" aria-labelledby="history-heading">
      <div className="history-header">
        <h2 id="history-heading" className="section-title">Transaction History</h2>
        <div className="history-filter">
          <label htmlFor="history-account-select" className="filter-label">
            Filter by Account:
          </label>
          <select
            id="history-account-select"
            value={selectedAccountId || ''}
            onChange={(e) => onAccountFilterChange && onAccountFilterChange(e.target.value)}
            className="filter-select"
          >
            <option value="">All Accounts</option>
            {accounts.map((acc) => (
              <option key={acc.id} value={acc.id}>
                {acc.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {isLoading ? (
        <LoadingSpinner message="Fetching transaction history..." />
      ) : transactions.length === 0 ? (
        <div className="empty-history">
          <p>No transactions found for the selected view.</p>
          <span className="empty-history-sub">
            Transactions will appear here once deposits, withdrawals, or transfers are performed.
          </span>
        </div>
      ) : (
        <div className="table-responsive">
          <table className="transactions-table" aria-label="Transaction records">
            <thead>
              <tr>
                <th scope="col">Date & Time</th>
                <th scope="col">Type</th>
                <th scope="col">Accounts Involved</th>
                <th scope="col" className="text-right">Amount</th>
                <th scope="col" className="text-center">Flag / Status</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((tx) => {
                const isFlagged = Boolean(tx.isSuspicious || tx.amountPaise >= 5000000);
                const type = (tx.type || '').toUpperCase();

                let accountsDisplay;
                if (type === 'TRANSFER') {
                  accountsDisplay = (
                    <span>
                      {getAccountLabel(tx.accountId)}
                      <span className="transfer-arrow" aria-hidden="true"> → </span>
                      {getAccountLabel(tx.destinationAccountId)}
                    </span>
                  );
                } else if (type === 'DEPOSIT') {
                  accountsDisplay = <span>To: {getAccountLabel(tx.accountId)}</span>;
                } else if (type === 'WITHDRAWAL') {
                  accountsDisplay = <span>From: {getAccountLabel(tx.accountId)}</span>;
                } else {
                  accountsDisplay = <span>{getAccountLabel(tx.accountId)}</span>;
                }

                return (
                  <tr key={tx.id || `${tx.createdAt}-${tx.amountPaise}`} className={isFlagged ? 'flagged-row' : ''}>
                    <td className="timestamp-cell">{formatTimestamp(tx.createdAt)}</td>
                    <td>
                      <span className={`type-badge type-${type.toLowerCase()}`}>
                        {type}
                      </span>
                    </td>
                    <td className="accounts-cell">{accountsDisplay}</td>
                    <td className="text-right amount-cell">
                      <strong>{formatInr(tx.amountPaise)}</strong>
                    </td>
                    <td className="text-center status-cell">
                      {isFlagged ? (
                        <span
                          className="flag-badge"
                          title="High-value simulated transaction (>= ₹50,000)"
                          aria-label="Flagged high-value transaction"
                        >
                          🚩 Flagged
                        </span>
                      ) : (
                        <span className="status-completed">Completed</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
