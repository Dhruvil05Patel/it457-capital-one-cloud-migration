import React from 'react';
import './LoadingSpinner.css';

/**
 * Accessible loading indicator with screen-reader live announcements.
 */
export default function LoadingSpinner({ message = 'Loading...' }) {
  return (
    <div className="spinner-container" role="status" aria-live="polite">
      <div className="spinner" aria-hidden="true"></div>
      <span className="spinner-text">{message}</span>
    </div>
  );
}

