# CloudBank Client (React + Vite)

A lightweight, accessible single-page digital banking dashboard built with **React** and **Vite** (pure JavaScript) for the CloudBank simulated banking application.

---

## 🚀 Key Features

1. **Persistent Demo Banner**:
   - A non-dismissible, high-contrast banner fixed at the top reading: **"Demo only — no real money"**.
   - Visible at all times across all device viewports.
2. **Accounts & Balances**:
   - Fetches and displays seeded mock accounts (e.g. "Demo Checking", "Demo Savings").
   - Formats balances in Indian Rupees (`₹`) via a strict integer-paise currency formatter.
   - Interactive account card selection with active status badge.
3. **Dynamic Transaction Form**:
   - **Deposit**: Select target account, enter amount.
   - **Withdrawal**: Select source account, enter amount (validates sufficient balance).
   - **Transfer**: Select distinct source and destination accounts, enter amount (enforces $source \ne destination$).
   - In-flight submit locking: Disables inputs and the submit button to prevent double submissions.
   - Auto-sync: Refreshes account balances and transaction history immediately upon transaction completion.
4. **Transaction History & High-Value Flagging**:
   - Chronological transaction table with date, transaction type, accounts involved, and formatted amount.
   - Filter transactions by a specific account or view all accounts aggregated.
   - Rule-based Suspicious Flag: Any transaction $\ge$ ₹50,000 (5,000,000 paise) displays a prominent **"🚩 Flagged"** badge.
5. **Robust Error & Loading States**:
   - Accessible animated `LoadingSpinner` (`role="status"`, `aria-live="polite"`).
   - High-contrast `ErrorAlert` (`role="alert"`) with error message extraction and a "Try Again" retry action.
   - Empty states for zero accounts or empty transaction histories.
6. **Strict Money Boundary (Zero Float Math)**:
   - All API payloads communicate amounts in **integer paise** (1 INR = 100 paise).
   - Parsing uses string-split math (`BigInt`) to completely avoid classic floating-point traps (e.g. `0.07 * 100 === 7.000000000000001`).

---

## 🛠️ Getting Started

### Prerequisites
- Node.js (v18+ recommended)
- npm (v9+ recommended)

### Installation
From the client directory (`week-3/cloudbank/client/`):

```bash
npm install
```

### Development Server
Starts the local Vite dev server on `http://localhost:5173`:

```bash
npm run dev
```

> **Note on Backend Integration**: During development, requests to `/api/*` are automatically proxied to `http://localhost:3000` via `vite.config.js`. If the Express backend is not running, the dashboard displays a clear connection notice with a "Retry" button.

### Unit Tests
Executes the Vitest unit test suite covering currency formatting, string-to-integer parsing, and edge cases:

```bash
npm test
```

### Production Build & Preview
```bash
# Build optimized production assets into dist/
npm run build

# Preview the production build locally
npm run preview
```

---

## ⚙️ Environment Configuration

Configuration is managed via `.env` (refer to `.env.example`):

| Variable | Default | Description |
|---|---|---|
| `VITE_API_BASE_URL` | `/api` | Base path for Express REST API endpoints |

---

## 🧪 Manual Smoke-Test Checklist

Follow this checklist to verify UI functionality end-to-end:

1. **Demo Banner**:
   - [ ] Verify **"Demo only — no real money"** is pinned to the top of the browser.
   - [ ] Resize browser to mobile width ($< 480$px); confirm banner remains visible and non-dismissible.
2. **Account Balances**:
   - [ ] Confirm two seeded mock accounts ("Demo Checking", "Demo Savings") are rendered with INR balances (e.g., `₹10,000.00`).
   - [ ] Click an account card; verify the "Active" badge reflects selection.
3. **Deposit Flow**:
   - [ ] Select the **Deposit** tab.
   - [ ] Choose "Demo Checking", enter `1000` (or `1,000.00`), click "Execute Deposit".
   - [ ] Confirm balance increases by ₹1,000.00 and a new `DEPOSIT` entry appears in the history table.
4. **Withdrawal Flow**:
   - [ ] Select the **Withdrawal** tab.
   - [ ] Choose an account, enter `200`, click "Execute Withdrawal".
   - [ ] Confirm balance decreases by ₹200.00.
5. **Transfer Flow**:
   - [ ] Select the **Transfer** tab.
   - [ ] Choose "Demo Checking" as source and "Demo Savings" as destination.
   - [ ] Enter `500`, click "Execute Transfer".
   - [ ] Confirm source balance decreases by ₹500.00, destination increases by ₹500.00, and history records the transfer.
6. **Validation & Edge Cases**:
   - [ ] Attempt transfer with same source and destination: Expect `"Source and destination accounts must be different"`.
   - [ ] Enter non-numeric amount (e.g. `abc`) or negative amount (`-50`): Expect validation error.
   - [ ] Enter $>2$ decimal places (`10.999`): Expect `"Amount cannot have more than 2 decimal places"`.
   - [ ] Attempt an over-balance withdrawal: Expect `"Insufficient funds"` error and balances remain unchanged.
7. **High-Value Flag Rule ($\ge$ ₹50,000)**:
   - [ ] Deposit or transfer an amount $\ge$ `50,000` (e.g. `50,000.00`).
   - [ ] Confirm the transaction succeeds and displays a **"🚩 Flagged"** badge in the history table.
8. **Offline / Error Resilience**:
   - [ ] When the backend is stopped, click "Refresh"; confirm the readable `ErrorAlert` appears with a "Retry" button rather than crashing.

---

## 📦 Deployment Hand-Off Specifications (for Aryan)

- **Build Output**: Static assets compiled to `dist/` via `npm run build`.
- **Production Server**: Can be served by Nginx, Caddy, or `serve` on port 80/3000 as configured in `Dockerfile.client`.
- **API Routing**: Reverse-proxy `/api` to Express server container on port 3000.
