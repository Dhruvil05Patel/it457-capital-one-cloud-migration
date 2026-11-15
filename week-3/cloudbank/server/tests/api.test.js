import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import { app } from '../src/app.js';
import { formatAccount, formatTransaction } from '../src/routes/accounts.js';

describe('CloudBank API Endpoints & Request Validation', () => {
  let server;
  let baseUrl;

  before(async () => {
    // Start an ephemeral HTTP server for API contract testing
    server = http.createServer(app);
    await new Promise((resolve) => server.listen(0, resolve));
    const port = server.address().port;
    baseUrl = `http://127.0.0.1:${port}`;
  });

  after(async () => {
    if (server) {
      await new Promise((resolve) => server.close(resolve));
    }
  });

  // --------------------------------------------------------------------------
  // Formatter Unit Tests
  // --------------------------------------------------------------------------
  describe('Response Formatters', () => {
    it('formats database account rows into camelCase balancePaise', () => {
      const mockRow = {
        id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
        name: 'Demo Checking',
        balance_paise: '1000000',
        created_at: new Date('2026-11-10T12:00:00Z'),
      };
      const formatted = formatAccount(mockRow);
      assert.equal(formatted.id, mockRow.id);
      assert.equal(formatted.name, mockRow.name);
      assert.equal(formatted.balancePaise, 1000000);
      assert.equal(typeof formatted.balancePaise, 'number');
      assert.equal(formatted.createdAt, '2026-11-10T12:00:00.000Z');
    });

    it('formats database transaction rows into camelCase fields with isSuspicious boolean', () => {
      const mockTxRow = {
        id: 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33',
        type: 'TRANSFER',
        status: 'COMPLETED',
        account_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
        destination_account_id: 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
        amount_paise: '5000000',
        is_suspicious: true,
        created_at: new Date('2026-11-10T12:30:00Z'),
      };
      const formatted = formatTransaction(mockTxRow);
      assert.equal(formatted.id, mockTxRow.id);
      assert.equal(formatted.type, 'TRANSFER');
      assert.equal(formatted.status, 'COMPLETED');
      assert.equal(formatted.accountId, mockTxRow.account_id);
      assert.equal(formatted.destinationAccountId, mockTxRow.destination_account_id);
      assert.equal(formatted.amountPaise, 5000000);
      assert.equal(typeof formatted.amountPaise, 'number');
      assert.equal(formatted.isSuspicious, true);
    });
  });

  // --------------------------------------------------------------------------
  // Routing & 404 Tests
  // --------------------------------------------------------------------------
  describe('Routing & Error Shapes', () => {
    it('returns structured JSON 404 for nonexistent API routes', async () => {
      const res = await fetch(`${baseUrl}/api/nonexistent-route`);
      assert.equal(res.status, 404);
      const json = await res.json();
      assert.ok(json.error, 'Error message must be present');
      assert.match(json.error, /Cannot GET \/api\/nonexistent-route/);
    });
  });

  // --------------------------------------------------------------------------
  // Account Endpoints Input Validation
  // --------------------------------------------------------------------------
  describe('Account Route Validation', () => {
    it('rejects malformed account IDs with 400 Bad Request on GET /api/accounts/:id', async () => {
      const res = await fetch(`${baseUrl}/api/accounts/invalid-uuid-123`);
      assert.equal(res.status, 400);
      const json = await res.json();
      assert.equal(json.error, 'Invalid account ID format');
    });

    it('rejects malformed account IDs with 400 Bad Request on GET /api/accounts/:id/transactions', async () => {
      const res = await fetch(`${baseUrl}/api/accounts/not-a-valid-uuid/transactions`);
      assert.equal(res.status, 400);
      const json = await res.json();
      assert.equal(json.error, 'Invalid account ID format');
    });
  });

  // --------------------------------------------------------------------------
  // Transaction Endpoints Input Validation
  // --------------------------------------------------------------------------
  describe('Transaction Route Validation', () => {
    it('rejects deposit with invalid accountId format', async () => {
      const res = await fetch(`${baseUrl}/api/transactions/deposit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accountId: 'not-a-uuid', amountPaise: 1000 }),
      });
      assert.equal(res.status, 400);
      const json = await res.json();
      assert.match(json.error, /valid accountId/);
    });

    it('rejects deposit with non-positive amount (0, negative, floating point)', async () => {
      for (const badAmount of [0, -500, 10.5, 'abc', null]) {
        const res = await fetch(`${baseUrl}/api/transactions/deposit`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            accountId: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
            amountPaise: badAmount,
          }),
        });
        assert.equal(res.status, 400, `Amount ${badAmount} should be rejected with 400`);
        const json = await res.json();
        assert.match(json.error, /positive integer in paise/);
      }
    });

    it('rejects withdrawal with non-positive amount', async () => {
      const res = await fetch(`${baseUrl}/api/transactions/withdraw`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accountId: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
          amountPaise: -100,
        }),
      });
      assert.equal(res.status, 400);
      const json = await res.json();
      assert.match(json.error, /positive integer in paise/);
    });

    it('rejects transfer when source and destination accounts are identical', async () => {
      const sameId = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
      const res = await fetch(`${baseUrl}/api/transactions/transfer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fromAccountId: sameId,
          toAccountId: sameId,
          amountPaise: 50000,
        }),
      });
      assert.equal(res.status, 400);
      const json = await res.json();
      assert.equal(json.error, 'Source and destination accounts must be different');
    });

    it('rejects transfer with invalid destination accountId', async () => {
      const res = await fetch(`${baseUrl}/api/transactions/transfer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fromAccountId: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
          toAccountId: 'bad-uuid',
          amountPaise: 50000,
        }),
      });
      assert.equal(res.status, 400);
      const json = await res.json();
      assert.match(json.error, /valid toAccountId/);
    });
  });
});

