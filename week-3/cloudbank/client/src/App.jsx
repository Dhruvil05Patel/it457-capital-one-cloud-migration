import React, { useState, useEffect, useCallback, useRef } from 'react';
import DemoBanner from './components/DemoBanner.jsx';
import AccountsList from './components/AccountsList.jsx';
import TransactionForm from './components/TransactionForm.jsx';
import TransactionHistory from './components/TransactionHistory.jsx';
import LoadingSpinner from './components/LoadingSpinner.jsx';
import ErrorAlert from './components/ErrorAlert.jsx';
import { getAccounts, getAccountTransactions } from './api/bank.js';
import './App.css';

export default function App() {
  const [accounts, setAccounts] = useState([]);
  const [selectedAccountId, setSelectedAccountId] = useState('');
  const [historyFilterId, setHistoryFilterId] = useState('');
  const [transactions, setTransactions] = useState([]);

  const [isLoadingAccounts, setIsLoadingAccounts] = useState(true);
  const [isLoadingTransactions, setIsLoadingTransactions] = useState(false);
  const [accountsError, setAccountsError] = useState(null);
  const [transactionsError, setTransactionsError] = useState(null);

  const isMountedRef = useRef(true);
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  /**
   * Fetch accounts from the backend API.
   */
  const loadAccounts = useCallback(async (signal) => {
    setIsLoadingAccounts(true);
    setAccountsError(null);
    try {
      const data = await getAccounts(signal);
      if (!isMountedRef.current) return;
      setAccounts(data);
      if (data.length > 0 && !selectedAccountId) {
        setSelectedAccountId(data[0].id);
      }
    } catch (err) {
      if (err.name === 'AbortError' || !isMountedRef.current) return;
      setAccountsError(err.message || 'Failed to fetch accounts from server.');
    } finally {
      if (isMountedRef.current) {
        setIsLoadingAccounts(false);
      }
    }
  }, [selectedAccountId]);

  /**
   * Fetch transaction history for selected account or all accounts.
   */
  const loadTransactions = useCallback(
    async (currentAccounts, targetAccountId, signal) => {
      setIsLoadingTransactions(true);
      setTransactionsError(null);
      try {
        if (targetAccountId) {
          const list = await getAccountTransactions(targetAccountId, signal);
          if (!isMountedRef.current) return;
          const sorted = [...list].sort(
            (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
          setTransactions(sorted);
        } else if (currentAccounts.length > 0) {
          const results = await Promise.allSettled(
            currentAccounts.map((acc) => getAccountTransactions(acc.id, signal))
          );
          if (!isMountedRef.current) return;

          const txMap = new Map();
          results.forEach((res) => {
            if (res.status === 'fulfilled' && Array.isArray(res.value)) {
              res.value.forEach((tx) => {
                const key = tx.id || `${tx.accountId}-${tx.createdAt}-${tx.amountPaise}`;
                if (!txMap.has(key)) {
                  txMap.set(key, tx);
                }
              });
            }
          });

          const merged = Array.from(txMap.values()).sort(
            (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
          setTransactions(merged);
        } else {
          setTransactions([]);
        }
      } catch (err) {
        if (err.name === 'AbortError' || !isMountedRef.current) return;
        setTransactionsError(err.message || 'Failed to fetch transaction history.');
      } finally {
        if (isMountedRef.current) {
          setIsLoadingTransactions(false);
        }
      }
    },
    []
  );

  // Initial load
  useEffect(() => {
    const controller = new AbortController();
    loadAccounts(controller.signal);
    return () => controller.abort();
  }, [loadAccounts]);

  // Load transactions when filter or accounts change
  useEffect(() => {
    if (accounts.length === 0) return;
    const controller = new AbortController();
    loadTransactions(accounts, historyFilterId, controller.signal);
    return () => controller.abort();
  }, [accounts, historyFilterId, loadTransactions]);

  /**
   * Triggered after successful deposit, withdrawal, or transfer
   * to automatically sync balances and transaction history.
   */
  const handleTransactionSuccess = useCallback(async () => {
    const controller = new AbortController();
    try {
      const refreshedAccounts = await getAccounts(controller.signal);
      if (!isMountedRef.current) return;
      setAccounts(refreshedAccounts);
      await loadTransactions(refreshedAccounts, historyFilterId, controller.signal);
    } catch {
      // Handled silently or on next user refresh
    }
  }, [historyFilterId, loadTransactions]);

  const handleSelectAccount = (accountId) => {
    setSelectedAccountId(accountId);
    setHistoryFilterId(accountId);
  };

  return (
    <div className="app-layout">
      {/* 1. Mandatory Demo Banner */}
      <DemoBanner />

      <div className="app-container">
        <header className="header">
          <div className="header-brand">
            <div className="logo-badge" aria-hidden="true">🏦</div>
            <div>
              <h1>CloudBank Dashboard</h1>
              <p>Simulated Digital Banking & AWS Cloud Migration Case Study</p>
            </div>
          </div>
          <button
            type="button"
            className="refresh-btn"
            onClick={() => {
              const controller = new AbortController();
              loadAccounts(controller.signal);
            }}
            disabled={isLoadingAccounts || isLoadingTransactions}
            title="Refresh accounts and balances"
          >
            ↻ Refresh
          </button>
        </header>

        <main id="main-content">
          {accountsError && (
            <ErrorAlert
              title="Connection Notice"
              message={accountsError}
              onRetry={() => {
                const controller = new AbortController();
                loadAccounts(controller.signal);
              }}
            />
          )}

          {isLoadingAccounts ? (
            <LoadingSpinner message="Connecting to CloudBank and loading accounts..." />
          ) : (
            <>
              {/* 2. Accounts and Balances */}
              <AccountsList
                accounts={accounts}
                selectedAccountId={selectedAccountId}
                onSelectAccount={handleSelectAccount}
                isLoading={isLoadingAccounts}
              />

              {/* 3. Transaction Form */}
              <TransactionForm
                accounts={accounts}
                selectedAccountId={selectedAccountId}
                onTransactionSuccess={handleTransactionSuccess}
              />

              {/* 4. Transaction History */}
              {transactionsError && (
                <ErrorAlert
                  title="Transaction History Notice"
                  message={transactionsError}
                  onRetry={() => {
                    const controller = new AbortController();
                    loadTransactions(accounts, historyFilterId, controller.signal);
                  }}
                />
              )}
              <TransactionHistory
                transactions={transactions}
                accounts={accounts}
                selectedAccountId={historyFilterId}
                onAccountFilterChange={(id) => setHistoryFilterId(id)}
                isLoading={isLoadingTransactions}
              />
            </>
          )}
        </main>
      </div>
    </div>
  );
}
