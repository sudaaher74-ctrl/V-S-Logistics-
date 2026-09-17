const ones = [
  '', 'ONE', 'TWO', 'THREE', 'FOUR', 'FIVE', 'SIX', 'SEVEN', 'EIGHT', 'NINE',
  'TEN', 'ELEVEN', 'TWELVE', 'THIRTEEN', 'FOURTEEN', 'FIFTEEN', 'SIXTEEN',
  'SEVENTEEN', 'EIGHTEEN', 'NINETEEN'
];

const tens = [
  '', '', 'TWENTY', 'THIRTY', 'FORTY', 'FIFTY', 'SIXTY', 'SEVENTY', 'EIGHTY', 'NINETY'
];

function convertBelowThousand(n: number): string {
  if (n === 0) return '';
  let str = '';
  if (n >= 100) {
    str += ones[Math.floor(n / 100)] + ' HUNDRED ';
    n %= 100;
  }
  if (n >= 20) {
    str += tens[Math.floor(n / 10)] + ' ';
    n %= 10;
  }
  if (n > 0) {
    str += ones[n] + ' ';
  }
  return str.trim();
}

/**
 * Converts a numeric amount to Indian Rupee Words format
 * e.g., 34290 -> "THIRTY FOUR THOUSAND TWO HUNDRED NINETY RUPEES ONLY"
 * 10500.50 -> "TEN THOUSAND FIVE HUNDRED RUPEES AND FIFTY PAISE ONLY"
 */
export function numberToIndianWords(amount: number | '' | null | undefined): string {
  if (amount === '' || amount === null || amount === undefined || isNaN(Number(amount))) {
    return 'ZERO RUPEES ONLY';
  }

  const num = Number(amount);
  if (num === 0) return 'ZERO RUPEES ONLY';

  const isNegative = num < 0;
  const absNum = Math.abs(num);

  const rupees = Math.floor(absNum);
  const paise = Math.round((absNum - rupees) * 100);

  let rupeesWords = '';

  if (rupees === 0) {
    rupeesWords = '';
  } else {
    // Break down according to Indian numbering system: Crores, Lakhs, Thousands, Hundreds
    const crore = Math.floor(rupees / 10000000);
    const remainderCrore = rupees % 10000000;

    const lakh = Math.floor(remainderCrore / 100000);
    const remainderLakh = remainderCrore % 100000;

    const thousand = Math.floor(remainderLakh / 1000);
    const remainderThousand = remainderLakh % 1000;

    const parts: string[] = [];

    if (crore > 0) {
      parts.push(convertBelowThousand(crore) + ' CRORE');
    }
    if (lakh > 0) {
      parts.push(convertBelowThousand(lakh) + ' LAKH');
    }
    if (thousand > 0) {
      parts.push(convertBelowThousand(thousand) + ' THOUSAND');
    }
    if (remainderThousand > 0) {
      parts.push(convertBelowThousand(remainderThousand));
    }

    rupeesWords = parts.join(' ').trim();
  }

  let result = '';
  if (rupeesWords) {
    result += rupeesWords + ' RUPEES';
  }

  if (paise > 0) {
    const paiseWords = convertBelowThousand(paise);
    if (result) {
      result += ' AND ' + paiseWords + ' PAISE';
    } else {
      result += paiseWords + ' PAISE';
    }
  }

  result += ' ONLY';
  return (isNegative ? 'MINUS ' : '') + result;
}

/**
 * Capitalizes first letter of each word (Title Case)
 */
export function toTitleCase(str: string): string {
  return str.toLowerCase().replace(/\b(\w)/g, s => s.toUpperCase());
}
