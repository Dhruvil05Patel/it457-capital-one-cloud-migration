# CloudBank Client (React + Vite)

A lightweight digital banking dashboard interface for the CloudBank simulated banking application.

## Overview
- **Persistent Demo Banner**: A non-dismissible notification stating **"Demo only — no real money"** fixed at the top across all viewports.
- **Accounts & Balances**: Displays seeded mock accounts with formatted INR currency (`₹`).
- **Transaction Operations**: Deposit, Withdrawal, and Transfer with dynamic input forms and client-side validation.
- **Transaction History**: Displays chronological transactions with account details, timestamps, amounts, and a **"Flagged"** badge for high-value transactions ($\ge$ ₹50,000).
- **Strict Money Boundary**: Integer paise representation for all API communications without floating-point math traps.

## Scripts

From inside the `client/` directory:

```bash
# Install dependencies
npm install

# Run unit tests (money precision & parsing tests)
npm test

# Build for production
npm run build

# Start local development server (port 5173 with API proxy to port 3000)
npm run dev

# Preview production build locally
npm run preview
```

## Environment Configuration

Configuration is managed via `.env` (see `.env.example`):
- `VITE_API_BASE_URL`: Base URL for the Express REST API (defaults to `/api` which is proxied to `http://localhost:3000` during development).

