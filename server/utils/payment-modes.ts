/**
 * Payment modes - persisted across the entire application
 * These are consistent with the database schema and used throughout the system
 */

export const PAYMENT_MODES = {
  MPESA: 'mpesa',
  CHEQUE: 'cheque',
  BANK_TRANSFER: 'bank_transfer',
  CASH: 'cash',
  CARD: 'card',
  OTHER: 'other',
} as const;

export const PAYMENT_MODE_LABELS = {
  mpesa: 'M-Pesa',
  cheque: 'Cheque',
  bank_transfer: 'Bank Transfer',
  cash: 'Cash',
  card: 'Card',
  other: 'Other',
} as const;

export const PAYMENT_MODE_OPTIONS = [
  { value: PAYMENT_MODES.MPESA, label: PAYMENT_MODE_LABELS.mpesa },
  { value: PAYMENT_MODES.CHEQUE, label: PAYMENT_MODE_LABELS.cheque },
  { value: PAYMENT_MODES.BANK_TRANSFER, label: PAYMENT_MODE_LABELS.bank_transfer },
  { value: PAYMENT_MODES.CASH, label: PAYMENT_MODE_LABELS.cash },
  { value: PAYMENT_MODES.CARD, label: PAYMENT_MODE_LABELS.card },
  { value: PAYMENT_MODES.OTHER, label: PAYMENT_MODE_LABELS.other },
];

export type PaymentMode = typeof PAYMENT_MODES[keyof typeof PAYMENT_MODES];

export function getPaymentModeLabel(mode: string): string {
  return PAYMENT_MODE_LABELS[mode as keyof typeof PAYMENT_MODE_LABELS] || mode;
}

export function isValidPaymentMode(mode: string): mode is PaymentMode {
  return Object.values(PAYMENT_MODES).includes(mode as PaymentMode);
}
