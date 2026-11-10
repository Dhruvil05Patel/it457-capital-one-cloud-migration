import React from 'react';
import { formatInr } from '../lib/money.js';
import './AccountsList.css';

/**
 * Displays account cards with seeded names and formatted INR balances.
 */
export default function AccountsList({
  accounts = [],
  selectedAccountId,
  onSelectAccount,
  isLoading = false,
}) {
  if (isLoading && accounts.length === 0) {
    return null;
  }

  if (accounts.length === 0) {
    return (
      <section className="accounts-section" aria-labelledby="accounts-heading">
        <h2 id="accounts-heading" className="section-title">Accounts & Balances</h2>
        <div className="empty-state">
          <p>No accounts available. Please ensure the backend database is seeded.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="accounts-section" aria-labelledby="accounts-heading">
      <div className="accounts-header">
        <h2 id="accounts-heading" className="section-title">Accounts & Balances</h2>
        <span className="accounts-count">{accounts.length} Accounts</span>
      </div>

      <div className="accounts-grid" role="list" aria-label="Bank Accounts">
        {accounts.map((account) => {
          const isSelected = account.id === selectedAccountId;
          return (
            <div
              key={account.id}
              role="listitem"
              className={`account-card ${isSelected ? 'selected' : ''}`}
              onClick={() => onSelectAccount && onSelectAccount(account.id)}
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onSelectAccount && onSelectAccount(account.id);
                }
              }}
              aria-selected={isSelected}
              aria-label={`${account.name}: balance ${formatInr(account.balancePaise)}`}
            >
              <div className="account-card-header">
                <span className="account-type-badge">{account.name}</span>
                {isSelected && <span className="active-badge">Active</span>}
              </div>
              <div className="account-balance">
                <span className="balance-label">Current Balance</span>
                <span className="balance-amount">{formatInr(account.balancePaise)}</span>
              </div>
              <div className="account-footer">
                <span className="account-id-label">Account ID:</span>
                <code className="account-id">{account.id}</code>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

