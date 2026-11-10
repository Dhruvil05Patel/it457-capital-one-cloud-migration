import React from 'react';
import './DemoBanner.css';

/**
 * Mandatory, non-dismissible demo warning banner.
 * Must remain visible on all screen sizes at all times.
 */
export default function DemoBanner() {
  return (
    <aside className="demo-banner" aria-label="Demo environment announcement">
      <div className="demo-banner-content">
        <span className="demo-banner-icon" aria-hidden="true">⚠️</span>
        <strong className="demo-banner-text">Demo only — no real money</strong>
        <span className="demo-banner-subtext">All accounts, balances, and transactions are simulated.</span>
      </div>
    </aside>
  );
}

