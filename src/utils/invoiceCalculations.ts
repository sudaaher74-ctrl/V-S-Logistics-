import { LineItem } from '../types/invoice';

/**
 * Formats a number to Indian currency format with 2 decimal places (e.g., 1,25,000.00)
 */
export function formatIndianCurrency(val: number | '' | null | undefined): string {
  if (val === '' || val === null || val === undefined || isNaN(Number(val))) {
    return '0.00';
  }
  return Number(val).toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

/**
 * Formats integer/currency without decimals if .00 (e.g., 34,290)
 */
export function formatCurrencySimple(val: number | '' | null | undefined): string {
  if (val === '' || val === null || val === undefined || isNaN(Number(val))) {
    return '0';
  }
  const num = Number(val);
  if (Number.isInteger(num)) {
    return num.toLocaleString('en-IN');
  }
  return num.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

/**
 * Calculates sum of all line item amounts
 */
export function calculateBillTotal(items: LineItem[]): number {
  if (!items || !Array.isArray(items)) return 0;
  return items.reduce((sum, item) => {
    const amt = typeof item.amount === 'number' ? item.amount : parseFloat(String(item.amount || 0));
    return sum + (isNaN(amt) ? 0 : amt);
  }, 0);
}

/**
 * Calculates total advance from items or overarching advance deduction
 */
export function calculateAdvanceAmount(items: LineItem[], advanceDeduction?: number): number {
  if (advanceDeduction && advanceDeduction > 0) {
    return advanceDeduction;
  }
  if (!items || !Array.isArray(items)) return 0;
  return items.reduce((sum, item) => {
    if (!item.advance || item.advance === '-') return sum;
    const cleanStr = String(item.advance).replace(/[^0-9.]/g, '');
    const amt = parseFloat(cleanStr);
    return sum + (isNaN(amt) ? 0 : amt);
  }, 0);
}

/**
 * Calculates balance remaining
 */
export function calculateBalance(billTotal: number, advance: number): number {
  return Math.max(0, billTotal - advance);
}
