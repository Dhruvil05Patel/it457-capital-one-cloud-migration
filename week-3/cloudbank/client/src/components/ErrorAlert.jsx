import React from 'react';
import './ErrorAlert.css';

/**
 * Accessible error notification with role="alert" and optional retry action.
 */
export default function ErrorAlert({ title = 'Error', message, onRetry }) {
  if (!message) return null;

  return (
    <div className="error-alert" role="alert">
      <div className="error-alert-content">
        <span className="error-alert-icon" aria-hidden="true">⚠️</span>
        <div className="error-alert-text">
          <strong className="error-alert-title">{title}: </strong>
          <span>{message}</span>
        </div>
      </div>
      {onRetry && (
        <button type="button" className="error-retry-btn" onClick={onRetry}>
          Try Again
        </button>
      )}
    </div>
  );
}

