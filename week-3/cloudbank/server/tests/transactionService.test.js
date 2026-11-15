import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  isSuspiciousAmount,
  SUSPICIOUS_THRESHOLD_PAISE,
  ServiceError,
} from '../src/services/transactionService.js';

describe('Transaction Service - Unit & Rule Logic', () => {
  it('correctly defines the suspicious flag threshold at 5,000,000 paise (₹50,000.00)', () => {
    assert.equal(SUSPICIOUS_THRESHOLD_PAISE, 5000000);
  });

  it('marks amounts at or above 5,000,000 paise as suspicious', () => {
    assert.equal(isSuspiciousAmount(5000000), true, 'Exactly ₹50,000 must be flagged');
    assert.equal(isSuspiciousAmount(5000001), true, 'Amounts above ₹50,000 must be flagged');
    assert.equal(isSuspiciousAmount(10000000), true, '₹100,000 must be flagged');
    assert.equal(isSuspiciousAmount(100000000), true, '₹1,000,000 must be flagged');
  });

  it('does NOT mark amounts below 5,000,000 paise as suspicious', () => {
    assert.equal(isSuspiciousAmount(4999999), false, '1 paise below threshold must not be flagged');
    assert.equal(isSuspiciousAmount(1000000), false, '₹10,000 must not be flagged');
    assert.equal(isSuspiciousAmount(50000), false, '₹500 must not be flagged');
    assert.equal(isSuspiciousAmount(100), false, '₹1 must not be flagged');
    assert.equal(isSuspiciousAmount(0), false, 'Zero must not be flagged');
    assert.equal(isSuspiciousAmount(-1000), false, 'Negative numbers must not be flagged');
  });

  it('creates ServiceError with default and explicit HTTP status codes', () => {
    const defaultErr = new ServiceError('Default error');
    assert.equal(defaultErr.status, 400);
    assert.equal(defaultErr.message, 'Default error');

    const notFoundErr = new ServiceError('Missing', 404);
    assert.equal(notFoundErr.status, 404);

    const conflictErr = new ServiceError('Insufficient funds', 409);
    assert.equal(conflictErr.status, 409);
  });
});

