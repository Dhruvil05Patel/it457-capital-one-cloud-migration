import React, { useState } from 'react';
import DemoBanner from './components/DemoBanner.jsx';
import { getHealth } from './api/bank.js';
import { formatInr } from './lib/money.js';
import './App.css';

export default function App() {
  const [apiStatus, setApiStatus] = useState(null);
  const [isChecking, setIsChecking] = useState(false);

  const checkConnection = async () => {
    setIsChecking(true);
    setApiStatus(null);
    try {
      const res = await getHealth();
      setApiStatus({ ok: true, message: `Connected to API: ${JSON.stringify(res)}` });
    } catch (err) {
      setApiStatus({ ok: false, message: `API unreachable: ${err.message}` });
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <div className="app-layout">
      {/* Persistent Demo Notice */}
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
        </header>

        <main id="main-content">
          <section className="scaffold-card" aria-labelledby="scaffold-heading">
            <h2 id="scaffold-heading" className="scaffold-title">Client Dashboard Scaffold</h2>
            <p className="scaffold-desc">
              React/Vite scaffold initialized with strict integer-paise money handling and REST API client module.
            </p>

            <div className="scaffold-details">
              <div className="scaffold-item">
                <span className="scaffold-label">Money Utility Status:</span>
                <span className="scaffold-value">
                  Active ({formatInr(100000)} formatted from 100,000 paise)
                </span>
              </div>
              <div className="scaffold-item">
                <span className="scaffold-label">API Client Base URL:</span>
                <code className="scaffold-code">
                  {import.meta.env.VITE_API_BASE_URL || '/api'}
                </code>
              </div>
            </div>

            <div className="scaffold-actions">
              <button
                type="button"
                className="test-btn"
                onClick={checkConnection}
                disabled={isChecking}
              >
                {isChecking ? 'Checking API...' : 'Test Backend Connection (/api/health)'}
              </button>
            </div>

            {apiStatus && (
              <div
                className={`status-box ${apiStatus.ok ? 'status-ok' : 'status-err'}`}
                role="status"
              >
                {apiStatus.message}
              </div>
            )}
          </section>
        </main>
      </div>
    </div>
  );
}
