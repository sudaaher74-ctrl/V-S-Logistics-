/**
 * Calculates current Indian Financial Year (April 1 - March 31)
 * E.g., Date in August 2026 -> "2026-27"
 * Date in Feb 2027 -> "2026-27"
 */
export function getCurrentFinancialYear(date: Date = new Date()): string {
  const month = date.getMonth(); // 0 = Jan, 3 = Apr
  const year = date.getFullYear();

  if (month >= 3) {
    // April or later
    const nextYearShort = String((year + 1) % 100).padStart(2, '0');
    return `${year}-${nextYearShort}`;
  } else {
    // Jan, Feb, Mar belong to previous FY start
    const currentYearShort = String(year % 100).padStart(2, '0');
    return `${year - 1}-${currentYearShort}`;
  }
}

/**
 * Extracts numeric sequence number from bill string
 * E.g. "064" -> 64
 * "122/ 2026-27" -> 122
 * "VS-045" -> 45
 */
export function extractBillSequenceNumber(billNo: string): number {
  if (!billNo) return 0;
  const match = billNo.match(/(\d+)/);
  return match ? parseInt(match[1], 10) : 0;
}

/**
 * Determines the next bill number based on existing bill numbers
 * Supports keeping 3-digit padding (e.g. 064 -> 065) or appending FY (065/ 2026-27)
 */
export function getNextBillNumber(
  existingBillNumbers: string[],
  includeFinancialYear = false
): string {
  if (!existingBillNumbers || existingBillNumbers.length === 0) {
    const firstSeq = '001';
    return includeFinancialYear ? `${firstSeq}/ ${getCurrentFinancialYear()}` : firstSeq;
  }

  let maxSeq = 0;
  let detectedPadding = 3;

  for (const billNo of existingBillNumbers) {
    const seq = extractBillSequenceNumber(billNo);
    if (seq > maxSeq) {
      maxSeq = seq;
    }
    const match = billNo.match(/^0*(\d+)/);
    if (match && match[0].length > detectedPadding) {
      detectedPadding = match[0].length;
    }
  }

  const nextSeq = maxSeq + 1;
  const paddedSeq = String(nextSeq).padStart(Math.max(3, detectedPadding), '0');

  if (includeFinancialYear) {
    return `${paddedSeq}/ ${getCurrentFinancialYear()}`;
  }
  return paddedSeq;
}

/**
 * Extracts LR / Consignment Note sequence number
 * E.g. "025992" -> 25992
 */
export function getNextLRNumber(existingLRNumbers: string[]): string {
  if (!existingLRNumbers || existingLRNumbers.length === 0) {
    return '025991';
  }

  let maxSeq = 0;
  for (const lr of existingLRNumbers) {
    const seq = extractBillSequenceNumber(lr);
    if (seq > maxSeq) {
      maxSeq = seq;
    }
  }

  const nextSeq = maxSeq + 1;
  return String(nextSeq).padStart(6, '0');
}

/**
 * Extracts Trip Slip sequence number
 * E.g. "TS-001" -> "TS-002"
 */
export function getNextTripSlipNumber(existingSlipNumbers: string[]): string {
  if (!existingSlipNumbers || existingSlipNumbers.length === 0) {
    return 'TS-101';
  }

  let maxSeq = 0;
  for (const slip of existingSlipNumbers) {
    const seq = extractBillSequenceNumber(slip);
    if (seq > maxSeq) {
      maxSeq = seq;
    }
  }

  return `TS-${maxSeq + 1}`;
}
