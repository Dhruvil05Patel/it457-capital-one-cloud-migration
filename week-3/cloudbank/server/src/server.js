import dotenv from 'dotenv';
import { app } from './app.js';
import { close as closePool } from './db/pool.js';

dotenv.config();

const PORT = Number(process.env.PORT) || 3000;

const server = app.listen(PORT, () => {
  console.log(`=========================================`);
  console.log(`CloudBank API Server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
  console.log(`Environment:  ${process.env.NODE_ENV || 'development'}`);
  console.log(`=========================================`);
});

// Graceful Shutdown handling
function handleShutdown(signal) {
  console.log(`\nReceived ${signal}. Gracefully terminating CloudBank server...`);
  server.close(async () => {
    console.log('HTTP server closed.');
    try {
      await closePool();
      console.log('Database pool connections closed.');
      process.exit(0);
    } catch (err) {
      console.error('Error closing database pool:', err);
      process.exit(1);
    }
  });
}

process.on('SIGTERM', () => handleShutdown('SIGTERM'));
process.on('SIGINT', () => handleShutdown('SIGINT'));

export default server;

