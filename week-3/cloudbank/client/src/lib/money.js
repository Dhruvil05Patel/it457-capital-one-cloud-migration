/**
 * Money utilities for CloudBank.
 * All amounts at the API boundary and in business logic are integer paise (1 INR = 100 paise).
 * No floating-point arithmetic is performed on rupees.
 */

const inrFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/**
 * Format integer paise into Indian Rupee currency format (e.g. 100000 -> "₹1,000.00").
 * @param {number|bigint} paise - Integer amount in paise
 * @returns {string} Formatted INR currency string
 */
export function formatInr(paise) {
  if (typeof paise !== 'number' && typeof paise !== 'bigint') {
    return '₹0.00';
  }
  const numericPaise = Number(paise);
  if (Number.isNaN(numericPaise)) {
    return '₹0.00';
  }

  // Integer paise divided by 100 for display formatting only
  const rupees = numericPaise / 100;
  return inrFormatter.format(rupees);
}

/**
 * Parses user input in rupees to exact integer paise.
 * Avoids floating-point multiplier inaccuracies (e.g., 0.07 * 100 = 7.000000000000001).
 *
 * Rules:
 * - Rejects empty string, whitespace only
 * - Strips commas and currency symbols ('₹', 'INR', 'Rs', 'Rs.')
 * - Rejects negative values, zero, NaN, multiple decimal points
 * - Rejects more than 2 decimal places
 * - Handles leading decimals like ".5" -> 50 paise
 *
 * @param {string|number} input - Rupee amount input from user
 * @returns {{ ok: true, paise: number } | { ok: false, error: string }} Result object
 */
export function parseInrToPaise(input) {
  if (input === null || input === undefined) {
    return { ok: false, error: 'Amount is required' };
  }

  let str = String(input).trim();
  if (str === '') {
    return { ok: false, error: 'Amount is required' };
  }

  // Remove common currency prefixes and thousand separators
  str = str.replace(/^[₹\s]+/, '');
  str = str.replace(/^(INR|Rs\.?)\s*/i, '');
  str = str.replace(/,/g, '').trim();

  if (str === '') {
    return { ok: false, error: 'Amount is required' };
  }

  // Check for negative signs
  if (str.includes('-')) {
    return { ok: false, error: 'Amount must be a positive number' };
  }

  // Reject non-numeric characters (only digits and a single optional decimal point allowed)
  if (!/^(?:\d+|\d*\.\d+)$/.test(str)) {
    return { ok: false, error: 'Please enter a valid numeric amount' };
  }

  const parts = str.split('.');
  const wholePart = parts[0] || '0';
  const decimalPart = parts[1];

  if (decimalPart !== undefined && decimalPart.length > 2) {
    return { ok: false, error: 'Amount cannot have more than 2 decimal places' };
  }

  let normalizedPaiseStr;
  if (decimalPart === undefined) {
    normalizedPaiseStr = '00';
  } else if (decimalPart.length === 1) {
    normalizedPaiseStr = decimalPart + '0';
  } else {
    normalizedPaiseStr = decimalPart;
  }

  // Calculate integer paise without floating point math
  const rupeeInt = BigInt(wholePart);
  const paiseInt = BigInt(normalizedPaiseStr);
  const totalPaise = rupeeInt * 100n + paiseInt;

  if (totalPaise <= 0n) {
    return { ok: false, error: 'Amount must be greater than zero' };
  }

  if (totalPaise > BigInt(Number.MAX_SAFE_INTEGER)) {
    return { ok: false, error: 'Amount exceeds safe transaction limit' };
  }

  return { ok: true, paise: Number(totalPaise) };
}

