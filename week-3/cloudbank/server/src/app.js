import express from 'express';
import cors from 'cors';
import { checkHealth } from './db/pool.js';
import { accountsRouter } from './routes/accounts.js';
import { transactionsRouter } from './routes/transactions.js';

export const app = express();

// Core Middlewares
app.use(cors());
app.use(express.json());

// API Base Router
const apiRouter = express.Router();

/**
 * Health Check Endpoint
 * GET /api/health
 * Returns 200 { data: { status: "ok" } } on success, or 503 if database check fails.
 */
apiRouter.get('/health', async (req, res) => {
  const dbHealth = await checkHealth();
  if (!dbHealth.ok) {
    return res.status(503).json({
      error: 'Database service is unavailable',
      details: process.env.NODE_ENV === 'development' ? dbHealth.error : undefined,
    });
  }
  return res.status(200).json({
    data: {
      status: 'ok',
    },
  });
});

// Accounts & Account Transactions Routes
apiRouter.use('/accounts', accountsRouter);

// Transaction Operations (Deposit, Withdraw, Transfer)
apiRouter.use('/transactions', transactionsRouter);

// Mount API router under /api
app.use('/api', apiRouter);

// 404 Handler for undefined API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({
    error: `Cannot ${req.method} ${req.originalUrl}`,
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  const status = err.status || 500;
  const message = err.message || 'Internal server error';

  if (process.env.NODE_ENV !== 'test') {
    console.error(`[Server Error] ${req.method} ${req.originalUrl}:`, err);
  }

  res.status(status).json({
    error: message,
  });
});

export default app;

