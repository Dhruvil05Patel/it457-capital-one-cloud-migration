import React, { useState, useEffect } from 'react';
import { parseInrToPaise, formatInr } from '../lib/money.js';
import { deposit, withdraw, transfer } from '../api/bank.js';
import './TransactionForm.css';

/**
 * Transaction form supporting deposit, withdrawal, and transfer.
 */
export default function TransactionForm({
  accounts = [],
  selectedAccountId,
  onTransactionSuccess,
}) {
  const [activeTab, setActiveTab] = useState('DEPOSIT'); // 'DEPOSIT' | 'WITHDRAWAL' | 'TRANSFER'
  const [targetAccountId, setTargetAccountId] = useState('');
  const [fromAccountId, setFromAccountId] = useState('');
  const [toAccountId, setToAccountId] = useState('');
  const [amountStr, setAmountStr] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // Sync default account selections when accounts or selectedAccountId change
  useEffect(() => {
    if (accounts.length > 0) {
      if (!targetAccountId || !accounts.some((a) => a.id === targetAccountId)) {
        setTargetAccountId(selectedAccountId || accounts[0].id);
      }
      if (!fromAccountId || !accounts.some((a) => a.id === fromAccountId)) {
        setFromAccountId(selectedAccountId || accounts[0].id);
      }
      if (!toAccountId || !accounts.some((a) => a.id === toAccountId)) {
        const secondAccount = accounts.find((a) => a.id !== (selectedAccountId || accounts[0].id));
        setToAccountId(secondAccount ? secondAccount.id : accounts[0].id);
      }
    }
  }, [accounts, selectedAccountId]);

  const handleTabChange = (newTab) => {
    setActiveTab(newTab);
    setFormError(null);
    setSuccessMessage(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);
    setSuccessMessage(null);

    // 1. Validate Amount
    const parsedAmount = parseInrToPaise(amountStr);
    if (!parsedAmount.ok) {
      setFormError(parsedAmount.error);
      return;
    }
    const amountPaise = parsedAmount.paise;

    // 2. Validate Accounts & Balances
    if (activeTab === 'DEPOSIT' || activeTab === 'WITHDRAWAL') {
      if (!targetAccountId) {
        setFormError('Please select an account');
        return;
      }
      if (activeTab === 'WITHDRAWAL') {
        const sourceAcc = accounts.find((a) => a.id === targetAccountId);
        if (sourceAcc && amountPaise > sourceAcc.balancePaise) {
          setFormError(
            `Insufficient funds: current balance is ${formatInr(sourceAcc.balancePaise)}`
          );
          return;
        }
      }
    } else if (activeTab === 'TRANSFER') {
      if (!fromAccountId) {
        setFormError('Please select a source account');
        return;
      }
      if (!toAccountId) {
        setFormError('Please select a destination account');
        return;
      }
      if (fromAccountId === toAccountId) {
        setFormError('Source and destination accounts must be different');
        return;
      }
      const sourceAcc = accounts.find((a) => a.id === fromAccountId);
      if (sourceAcc && amountPaise > sourceAcc.balancePaise) {
        setFormError(
          `Insufficient funds: source account has ${formatInr(sourceAcc.balancePaise)}`
        );
        return;
      }
    }

    // 3. Submit to API with double-submit protection
    setIsSubmitting(true);
    try {
      if (activeTab === 'DEPOSIT') {
        await deposit({ accountId: targetAccountId, amountPaise });
        setSuccessMessage(`Successfully deposited ${formatInr(amountPaise)}`);
      } else if (activeTab === 'WITHDRAWAL') {
        await withdraw({ accountId: targetAccountId, amountPaise });
        setSuccessMessage(`Successfully withdrew ${formatInr(amountPaise)}`);
      } else if (activeTab === 'TRANSFER') {
        await transfer({ fromAccountId, toAccountId, amountPaise });
        setSuccessMessage(`Successfully transferred ${formatInr(amountPaise)}`);
      }

      setAmountStr('');
      if (onTransactionSuccess) {
        await onTransactionSuccess();
      }
    } catch (err) {
      setFormError(err.message || 'Transaction failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isTransfer = activeTab === 'TRANSFER';

  return (
    <section className="form-section" aria-labelledby="form-heading">
      <h2 id="form-heading" className="section-title">New Transaction</h2>

      {/* Tabs */}
      <div className="tab-group" role="tablist" aria-label="Transaction type selection">
        <button
          type="button"
          role="tab"
          id="tab-deposit"
          aria-selected={activeTab === 'DEPOSIT'}
          aria-controls="panel-transaction"
          className={`tab-btn ${activeTab === 'DEPOSIT' ? 'active' : ''}`}
          onClick={() => handleTabChange('DEPOSIT')}
          disabled={isSubmitting}
        >
          Deposit
        </button>
        <button
          type="button"
          role="tab"
          id="tab-withdrawal"
          aria-selected={activeTab === 'WITHDRAWAL'}
          aria-controls="panel-transaction"
          className={`tab-btn ${activeTab === 'WITHDRAWAL' ? 'active' : ''}`}
          onClick={() => handleTabChange('WITHDRAWAL')}
          disabled={isSubmitting}
        >
          Withdrawal
        </button>
        <button
          type="button"
          role="tab"
          id="tab-transfer"
          aria-selected={activeTab === 'TRANSFER'}
          aria-controls="panel-transaction"
          className={`tab-btn ${activeTab === 'TRANSFER' ? 'active' : ''}`}
          onClick={() => handleTabChange('TRANSFER')}
          disabled={isSubmitting}
        >
          Transfer
        </button>
      </div>

      <div
        id="panel-transaction"
        role="tabpanel"
        aria-labelledby={`tab-${activeTab.toLowerCase()}`}
        className="form-card"
      >
        {formError && (
          <div className="form-error-alert" role="alert">
            <span aria-hidden="true">⚠️ </span>
            <span>{formError}</span>
          </div>
        )}

        {successMessage && (
          <div className="form-success-alert" role="status">
            <span aria-hidden="true">✓ </span>
            <span>{successMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          {/* Deposit / Withdrawal single account selector */}
          {!isTransfer && (
            <div className="form-group">
              <label htmlFor="tx-target-account" className="form-label">
                {activeTab === 'DEPOSIT' ? 'Deposit To Account' : 'Withdraw From Account'}
                <span className="required-star">*</span>
              </label>
              <select
                id="tx-target-account"
                value={targetAccountId}
                onChange={(e) => setTargetAccountId(e.target.value)}
                className="form-select"
                disabled={isSubmitting || accounts.length === 0}
                required
              >
                {accounts.map((acc) => (
                  <option key={acc.id} value={acc.id}>
                    {acc.name} — Balance: {formatInr(acc.balancePaise)}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Transfer: Source & Destination Account selectors */}
          {isTransfer && (
            <div className="transfer-grid">
              <div className="form-group">
                <label htmlFor="tx-from-account" className="form-label">
                  From (Source Account)
                  <span className="required-star">*</span>
                </label>
                <select
                  id="tx-from-account"
                  value={fromAccountId}
                  onChange={(e) => setFromAccountId(e.target.value)}
                  className="form-select"
                  disabled={isSubmitting || accounts.length === 0}
                  required
                >
                  {accounts.map((acc) => (
                    <option key={acc.id} value={acc.id}>
                      {acc.name} — Balance: {formatInr(acc.balancePaise)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="tx-to-account" className="form-label">
                  To (Destination Account)
                  <span className="required-star">*</span>
                </label>
                <select
                  id="tx-to-account"
                  value={toAccountId}
                  onChange={(e) => setToAccountId(e.target.value)}
                  className="form-select"
                  disabled={isSubmitting || accounts.length === 0}
                  required
                >
                  {accounts.map((acc) => (
                    <option key={acc.id} value={acc.id}>
                      {acc.name} — Balance: {formatInr(acc.balancePaise)}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Amount input */}
          <div className="form-group">
            <label htmlFor="tx-amount" className="form-label">
              Amount (INR ₹)
              <span className="required-star">*</span>
            </label>
            <div className="input-prefix-wrapper">
              <span className="input-prefix" aria-hidden="true">₹</span>
              <input
                id="tx-amount"
                type="text"
                inputMode="decimal"
                placeholder="e.g. 1,000.00"
                value={amountStr}
                onChange={(e) => setAmountStr(e.target.value)}
                className="form-input with-prefix"
                disabled={isSubmitting}
                autoComplete="off"
                required
              />
            </div>
            <small className="form-help">
              Enter amount in Rupees (e.g. 500, 1000.50). Transactions ₹50,000 and above are flagged for demo review.
            </small>
          </div>

          {/* Submit button */}
          <div className="form-actions">
            <button
              type="submit"
              className="submit-btn"
              disabled={isSubmitting || accounts.length === 0}
            >
              {isSubmitting ? (
                <span className="btn-loading">
                  <span className="btn-spinner" aria-hidden="true"></span>
                  Processing...
                </span>
              ) : (
                `Execute ${activeTab === 'DEPOSIT' ? 'Deposit' : activeTab === 'WITHDRAWAL' ? 'Withdrawal' : 'Transfer'}`
              )}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}

