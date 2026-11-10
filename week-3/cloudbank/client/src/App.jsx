import React, { useState, useEffect, useCallback, useRef } from 'react';
import DemoBanner from './components/DemoBanner.jsx';
import AccountsList from './components/AccountsList.jsx';
import TransactionHistory from './components/TransactionHistory.jsx';
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
        setTransactions([]);
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

  const handleSelectAccount = (accountId) => {
    setSelectedAccountId(accountId);
    setHistoryFilterId(accountId);
  };

  return (
    <div className="app-layout">
      {/* 1. Mandatory Demo Notice */}
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
            <div className="error-callout" role="alert">
              <span className="error-icon" aria-hidden="true">⚠️</span>
              <div className="error-body">
                <strong>Backend Connection Notice: </strong>
                <span>{accountsError}</span>
              </div>
              <button
                type="button"
                className="retry-btn"
                onClick={() => {
                  const controller = new AbortController();
                  loadAccounts(controller.signal);
                }}
              >
                Retry
              </button>
            </div>
          )}

          {isLoadingAccounts ? (
            <div className="loading-state">
              <p>Connecting to CloudBank and loading accounts...</p>
            </div>
          ) : (
            <>
              {/* 2. Accounts and Balances */}
              <AccountsList
                accounts={accounts}
                selectedAccountId={selectedAccountId}
                onSelectAccount={handleSelectAccount}
                isLoading={isLoadingAccounts}
              />

              {/* 3. Transaction History */}
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
