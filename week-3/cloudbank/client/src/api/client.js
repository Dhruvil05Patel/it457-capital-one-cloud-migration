/**
 * API client configuration and fetch wrapper.
 */

export class ApiError extends Error {
  constructor(message, status = 0, details = null) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.details = details;
  }
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

/**
 * Universal request wrapper for CloudBank REST API.
 * @param {string} endpoint - API route (e.g. '/accounts' or '/transactions/deposit')
 * @param {RequestInit} [options={}] - Fetch options
 * @returns {Promise<any>}
 */
export async function apiRequest(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  const defaultHeaders = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  };

  const config = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  };

  let response;
  try {
    response = await fetch(url, config);
  } catch (err) {
    if (err.name === 'AbortError') {
      throw err;
    }
    throw new ApiError(
      'Unable to connect to CloudBank server. Please check your network or server status.',
      0,
      err
    );
  }

  let body = null;
  const contentType = response.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    try {
      body = await response.json();
    } catch {
      body = null;
    }
  } else {
    try {
      const text = await response.text();
      body = text ? { message: text } : null;
    } catch {
      body = null;
    }
  }

  if (!response.ok) {
    const errorMessage =
      body?.error ||
      body?.message ||
      `Request failed with status ${response.status} (${response.statusText || 'Error'})`;

    throw new ApiError(errorMessage, response.status, body);
  }

  // The contract specifies { "data": ... } for success.
  // Return data if present, or the raw body if data key is not wrapped.
  if (body && typeof body === 'object' && 'data' in body) {
    return body.data;
  }

  return body;
}

